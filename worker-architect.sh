#!/bin/bash
# Worker Architect Agent: generates article outline using claude -p
# Sourced by worker.sh — do NOT run directly.

# Run architect phase: detect article type, load template, run claude -p for outline
# Expects globals: JOBS_DIR, ARCHITECT_RULES, MODEL, load_template()
# Returns: writes outline_review or error to done/${JOBID}.json
run_architect() {
  local JOBID="$1" TOPIC="$2" REMOVED_URLS="$3"

  echo "[worker] [$JOBID] Phase: architect (generating outline via claude -p)"

  # Load saved context (user already reviewed sources)
  local PRE_CONTEXT
  PRE_CONTEXT=$(cat "$JOBS_DIR/logs/${JOBID}.context" 2>/dev/null)

      PRE_CONTEXT=$(echo "$PRE_CONTEXT" | strip_removed_urls "$REMOVED_URLS")

      # Detect article type
      # Detect article type (last match wins, highest priority at bottom)
      ARTICLE_TYPE="platform"  # default fallback: standalone model name → platform
      echo "$TOPIC" | grep -qiE 'vram|\bmemory\b' && ARTICLE_TYPE="vram"
      echo "$TOPIC" | grep -qiE ' vs ' && ARTICLE_TYPE="vs"
      echo "$TOPIC" | grep -qiE 'api.*(provider|pricing|cost|comparison)' && ARTICLE_TYPE="api_provider"
      echo "$TOPIC" | grep -qiE 'how.*(access|use)' && ARTICLE_TYPE="how_to"
      echo "$TOPIC" | grep -qiE '\b(in|with)\s+(opencode|open.code|openclaw|open.claw|claude.code|trae|cursor|continue|codecompanion)\b' && ARTICLE_TYPE="tool_integration"
      echo "$TOPIC" | grep -qiE '\bon\s+(novita|together|replicate|hugging.?face|fireworks|groq|deepinfra)\b|^deploy\b' && ARTICLE_TYPE="platform"

      # Load article type template
      ARTICLE_TEMPLATE=$(load_template "$ARTICLE_TYPE")
      echo "[worker] [$JOBID] Architect: type=$ARTICLE_TYPE, template=$(echo "$ARTICLE_TEMPLATE" | wc -c | tr -d ' ') bytes"

      # Build architect system prompt: ARCHITECT_RULES enforces JSON schema; /dev-blog-architect skill in user prompt as reinforcement
      ARCHITECT_SYSTEM="${ARCHITECT_RULES}"

      # Generate data map of raw files available
      DATA_MAP=$(python3 << 'DATA_MAP_EOF'
import os, json

D = '/tmp/blog_data'
R = '/tmp/blog_references'
lines = []
lines.append("--- RAW DATA FILES ---")
lines.append(f"Directory: {D}/")

desc = {
    '_context.txt': 'Compressed overview (included above)',
    'hf_detail_a.json': 'HuggingFace model card JSON — architecture, params, license',
    'hf_detail_b.json': 'HuggingFace model card JSON (model B)',
    'config_a.json': 'config.json — exact architecture parameters',
    'config_b.json': 'config.json (model B)',
    'readme_a.md': 'Full HuggingFace README — benchmarks, usage examples',
    'readme_b.md': 'Full HuggingFace README (model B)',
    'novita.json': 'Novita AI API data — pricing, available models',
    '_fanout_queries.json': 'Search queries used (for reference)',
}

if not os.path.isdir(D):
    print("(no data directory)")
    exit()

for f in sorted(os.listdir(D)):
    path = os.path.join(D, f)
    if not os.path.isfile(path) or f.startswith('.'):
        continue
    kb = os.path.getsize(path) // 1024
    if f in desc:
        lines.append(f"  {f} ({kb}KB) — {desc[f]}")
    elif f.startswith('tavily_fanout_'):
        label = f.replace('.json','').replace('tavily_fanout_','#')
        lines.append(f"  {f} ({kb}KB) — fan-out search results {label}")
    elif f.startswith('hf_gguf_'):
        quant = f.replace('hf_gguf_','').replace('.json','')
        lines.append(f"  {f} ({kb}KB) — GGUF {quant} quantization sizes")
    elif f.startswith('hf_'):
        lines.append(f"  {f} ({kb}KB) — HuggingFace data")
print('\n'.join(lines))
DATA_MAP_EOF
)

      # Write architect user prompt to file
      ARCHITECT_PROMPT_FILE="$JOBS_DIR/logs/${JOBID}.architect_prompt"
      cat > "$ARCHITECT_PROMPT_FILE" <<ARCHITECT_PROMPT_EOF
/dev-blog-architect

Topic: ${TOPIC}
Article Type: ${ARTICLE_TYPE}

ARTICLE TYPE TEMPLATE (reference — adapt based on data availability):
${ARTICLE_TEMPLATE}

PRE-FETCHED DATA:
${PRE_CONTEXT}

${DATA_MAP}

OUTPUT: Valid JSON only — no markdown fences, no explanation.
ARCHITECT_PROMPT_EOF

      # Run claude -p for architect
      ARCHITECT_RESULTFILE="$JOBS_DIR/logs/${JOBID}.architect_result"
      ARCHITECT_LOGFILE="$JOBS_DIR/logs/${JOBID}.architect_log"

      cat "$ARCHITECT_PROMPT_FILE" | claude -p \
        --system-prompt "$ARCHITECT_SYSTEM" \
        --model "$MODEL" \
        --output-format text \
        --permission-mode bypassPermissions \
        >"$ARCHITECT_RESULTFILE" 2>"$ARCHITECT_LOGFILE" &
      ARCH_PID=$!

      # Wait with timeout (3 min for outline)
      ARCH_ELAPSED=0
      ARCH_TIMEOUT=180
      while kill -0 $ARCH_PID 2>/dev/null; do
        sleep 3
        ARCH_ELAPSED=$((ARCH_ELAPSED + 3))
        if [ $ARCH_ELAPSED -ge $ARCH_TIMEOUT ]; then
          echo "[worker] [$JOBID] Architect claude -p timed out after ${ARCH_TIMEOUT}s"
          kill $ARCH_PID 2>/dev/null; sleep 1; kill -9 $ARCH_PID 2>/dev/null
          break
        fi
      done
      wait $ARCH_PID 2>/dev/null
      ARCH_EXIT=$?

      ARCH_RAW=""
      [ -f "$ARCHITECT_RESULTFILE" ] && ARCH_RAW=$(cat "$ARCHITECT_RESULTFILE")
      rm -f "$ARCHITECT_PROMPT_FILE" "$ARCHITECT_RESULTFILE"

      # Parse JSON from claude output
      ARCHITECT_RESULT=$(REMOVED_URLS_JSON="$REMOVED_URLS" python3 -c "
import json, re, sys, os

raw = sys.stdin.read().strip()
removed = json.loads(os.environ.get('REMOVED_URLS_JSON', '[]'))
removed_set = set(removed)

# Strip markdown fences
raw = re.sub(r'^\s*\`\`\`(?:json)?\s*', '', raw)
raw = re.sub(r'\s*\`\`\`\s*$', '', raw)

# Find JSON object
m = re.search(r'\{[\s\S]*\}', raw)
if not m:
    print(json.dumps({'error': 'No JSON found', 'raw': raw[:500]}))
    exit()

try:
    outline = json.loads(m.group())
except Exception as e:
    print(json.dumps({'error': f'JSON parse: {e}', 'raw': raw[:500]}))
    exit()

if 'sections' not in outline or not isinstance(outline['sections'], list):
    print(json.dumps({'error': 'Invalid structure', 'raw': raw[:300]}))
    exit()

# Post-process: add ids, filter removed URLs from dataSources
for i, sec in enumerate(outline['sections']):
    if 'id' not in sec:
        sec['id'] = f's{i+1}'
    if 'dataSources' in sec:
        sec['dataSources'] = [ds for ds in sec['dataSources'] if ds.get('url','') not in removed_set]

print(json.dumps(outline, ensure_ascii=False))
" <<< "$ARCH_RAW")

      # Check if architect succeeded
      ARCHITECT_ERROR=$(echo "$ARCHITECT_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error',''))" 2>/dev/null)

      if [ $ARCH_EXIT -ne 0 ] || [ -z "$ARCH_RAW" ] || [ -n "$ARCHITECT_ERROR" ]; then
        echo "[worker] [$JOBID] Architect failed: exit=$ARCH_EXIT error=$ARCHITECT_ERROR"
        python3 -c "
import json
json.dump({'status': 'error', 'error': 'Architect phase failed: ${ARCHITECT_ERROR:-claude exited $ARCH_EXIT}'}, open('$JOBS_DIR/done/${JOBID}.json', 'w'))
"
      else
        echo "[worker] [$JOBID] Architect outline generated ($(echo "$ARCHITECT_RESULT" | wc -c | tr -d ' ') bytes)"
        # Save architect output
        echo "$ARCHITECT_RESULT" > "$JOBS_DIR/logs/${JOBID}.architect.json"

        # Collect all available source URLs for the frontend source pool (excluding removed)
        ALL_SOURCES=$(REMOVED_URLS_JSON="$REMOVED_URLS" python3 -c "
import json, os, glob

D = '/tmp/blog_data'
removed = set(json.loads(os.environ.get('REMOVED_URLS_JSON', '[]')))
# Restore data if needed
log_data = '$JOBS_DIR/logs/${JOBID}_data'
if os.path.isdir(log_data) and not os.path.exists(f'{D}/_context.txt'):
    import shutil
    os.makedirs(D, exist_ok=True)
    for f in os.listdir(log_data):
        shutil.copy2(os.path.join(log_data, f), os.path.join(D, f))
sources = []
seen = set()
seen_domains = {}
LANG_PATHS = ['/nl/', '/it/', '/de/', '/fr/', '/es/', '/pt/', '/ja/', '/ko/', '/zh/', '/ru/']

# From HF (first, so they appear at top)
for name in ['hf_detail_a.json', 'hf_detail_b.json']:
    path = f'{D}/{name}'
    try:
        with open(path) as f:
            data = json.load(f)
        if isinstance(data, dict) and 'id' in data:
            url = f\"https://huggingface.co/{data['id']}\"
            if url not in seen and url not in removed:
                seen.add(url)
                sources.append({'url': url, 'label': f\"HF: {data['id']}\", 'type': 'huggingface'})
            cfg_url = f\"https://huggingface.co/{data['id']}/blob/main/config.json\"
            if cfg_url not in seen and cfg_url not in removed:
                seen.add(cfg_url)
                sources.append({'url': cfg_url, 'label': f\"config.json ({data['id']})\", 'type': 'huggingface'})
    except: pass
# From tavily results (with domain dedup and language filter)
for fname in sorted(glob.glob(f'{D}/tavily_*.json')):
    if '_extract' in fname: continue
    try:
        with open(fname) as f:
            data = json.load(f)
        cat = os.path.basename(fname).replace('.json','').replace('tavily_','')
        for r in data.get('results', []):
            url = r.get('url', '')
            if not url or url in seen or url in removed: continue
            from urllib.parse import urlparse as _up
            domain = _up(url).netloc.replace('www.', '')
            seen_domains[domain] = seen_domains.get(domain, 0) + 1
            if seen_domains[domain] > 2: continue
            if any(p in url.lower() for p in LANG_PATHS): continue
            seen.add(url)
            sources.append({'url': url, 'label': r.get('title', url), 'type': cat})
    except: pass
print(json.dumps(sources, ensure_ascii=False))
" 2>/dev/null)

        # Write outline_review to done file
        python3 -c "
import json, sys
outline = json.loads(sys.argv[1])
all_sources = json.loads(sys.argv[2]) if sys.argv[2] else []
json.dump({
    'status': 'outline_review',
    'outline': outline,
    'allSources': all_sources,
}, open('$JOBS_DIR/done/${JOBID}.json', 'w'), ensure_ascii=False)
" "$ARCHITECT_RESULT" "$ALL_SOURCES"
        echo "[worker] [$JOBID] Outline review written to done/${JOBID}.json"
      fi

      rm -f "$JOBS_DIR/pending/${JOBID}.processing"
}
