#!/bin/bash
# Worker Check Agent: post-generation quality check + data cross-validation (MiniMax M2.5)
# Sourced by worker.sh — do NOT run directly.

# Run quality check and data cross-validation on generated article
# Expects globals: RESULT, PRE_CONTEXT, CHECK_RULES, PPIO_API_KEY, JOBS_DIR
# Sets globals: CHECK_RESULT, CHECK_WARNINGS
run_check() {
  local JOBID="$1" TOPIC="$2"
  local WARNINGS="${WRITE_WARNINGS:-}"

      echo "[worker] [$JOBID] Running quality check (Check Agent Step 1)..."
      echo "$RESULT" > /tmp/blog_data/_qc_input.txt
      # Detect canonical model name from topic
      BLOG_MODEL_NAME=$(echo "$TOPIC" | python3 -c "
import re, sys
t = sys.stdin.read().strip()
t = re.sub(r'\b(vram|gpu|api|provider|pricing|how|to|access|use|in|with|on)\b', '', t, flags=re.IGNORECASE)
print(re.sub(r'\s+', ' ', t).strip())
" 2>/dev/null)
      CHECKED_RESULT=$(CHECK_RULES="$CHECK_RULES" BLOG_MODEL_NAME="$BLOG_MODEL_NAME" python3 << 'QUALITY_CHECK_EOF'
import json, os, re, urllib.request as _ur

api_key = os.environ.get('PPIO_API_KEY', '')
check_rules = os.environ.get('CHECK_RULES', '')
with open('/tmp/blog_data/_qc_input.txt', 'r') as f:
    article = f.read()
canonical = os.environ.get('BLOG_MODEL_NAME', '')

if not article or not api_key or len(article) < 3000:
    print(article)
    exit(0)

prompt = f"""CANONICAL MODEL NAME: {canonical}

{check_rules}

=== ARTICLE TO REVIEW ===
{article[:50000]}

Perform Check 1 (Quality Review & Correction) on the article above. Output the corrected article ONLY."""

payload = json.dumps({
    'model': 'minimax/minimax-m2.5',
    'messages': [{'role': 'user', 'content': prompt}],
    'max_tokens': 16000,
    'temperature': 0.2,
}).encode()

req = _ur.Request(
    'https://api.ppinfra.com/v3/openai/chat/completions',
    data=payload,
    headers={
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    },
)

try:
    opener = _ur.build_opener(_ur.ProxyHandler({}))
    with opener.open(req, timeout=180) as resp:
        data = json.loads(resp.read().decode())
    content = data['choices'][0]['message']['content']
    if '<think>' in content:
        content = re.sub(r'<think>[\s\S]*?</think>', '', content).strip()
    # Sanity: corrected article should be at least 60% of original length
    if len(content) > len(article) * 0.6:
        print(content)
    else:
        print(article)
except Exception as e:
    import sys
    print(f"[QC error: {e}]", file=sys.stderr)
    print(article)
QUALITY_CHECK_EOF
)
      if [ -n "$CHECKED_RESULT" ] && [ $(echo "$CHECKED_RESULT" | wc -c | tr -d ' ') -gt 2000 ]; then
        ORIGINAL_LEN=$(echo "$RESULT" | wc -c | tr -d ' ')
        CHECKED_LEN=$(echo "$CHECKED_RESULT" | wc -c | tr -d ' ')
        echo "[worker] [$JOBID] Quality check done (${ORIGINAL_LEN} → ${CHECKED_LEN} chars)"
        RESULT="$CHECKED_RESULT"
      else
        echo "[worker] [$JOBID] Quality check returned empty/short result, keeping original"
      fi
      rm -f /tmp/blog_data/_qc_input.txt

      # --- QC Step 2: Data cross-validation (MiniMax M2.5) ---
      if [ -n "$PRE_CONTEXT" ] && [ -n "$RESULT" ] && [ $(echo "$RESULT" | wc -c | tr -d ' ') -gt 3000 ]; then
        echo "[worker] [$JOBID] Running data cross-validation..."
        echo "$RESULT" > /tmp/blog_data/_qc_xval_input.txt
        QC_XVAL_REPORT=$(PRE_CONTEXT_TRUNCATED="$(echo "$PRE_CONTEXT" | head -c 20000)" PPIO_API_KEY="$PPIO_API_KEY" python3 << 'QC_XVAL_EOF'
import json, os, re, urllib.request as ur

api_key = os.environ.get('PPIO_API_KEY', '')
context = os.environ.get('PRE_CONTEXT_TRUNCATED', '')
with open('/tmp/blog_data/_qc_xval_input.txt') as f:
    article = f.read()

if not api_key or not context or len(article) < 3000:
    print(json.dumps({"skipped": True}))
    exit(0)

prompt = f"""Compare the article against the research data. For each number, benchmark score, or price mentioned in the article, verify it exists in the research data.

Article (first 15000 chars):
{article[:15000]}

Research Data (first 15000 chars):
{context[:15000]}

Output JSON only:
{{
  "verified": [{{"claim": "example", "source": "where found", "status": "match"}}],
  "unverified": [{{"claim": "example", "status": "no_source_found"}}],
  "summary": "X verified, Y unverified"
}}"""

payload = json.dumps({
    'model': 'minimax/minimax-m2.5',
    'messages': [{'role': 'user', 'content': prompt}],
    'max_tokens': 3000,
    'temperature': 0.1,
}).encode()

req = ur.Request(
    'https://api.ppinfra.com/v3/openai/chat/completions',
    data=payload,
    headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
)

try:
    opener = ur.build_opener(ur.ProxyHandler({}))
    with opener.open(req, timeout=90) as resp:
        data = json.loads(resp.read().decode())
    content = data['choices'][0]['message']['content']
    if '<think>' in content:
        content = re.sub(r'<think>[\s\S]*?</think>', '', content).strip()
    m = re.search(r'\{[\s\S]*\}', content)
    if m:
        report = json.loads(m.group())
        print(json.dumps(report, ensure_ascii=False))
    else:
        print(json.dumps({"error": "no JSON in response"}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
QC_XVAL_EOF
)
        # Log cross-validation results
        UNVERIFIED_COUNT=$(echo "$QC_XVAL_REPORT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('unverified',[])))" 2>/dev/null || echo "0")
        if [ "$UNVERIFIED_COUNT" -gt 0 ]; then
          echo -e "[worker] [$JOBID] \033[33mCross-validation: $UNVERIFIED_COUNT unverified claims\033[0m"
          WARNINGS="${WARNINGS:+${WARNINGS},}UNVERIFIED_CLAIMS(${UNVERIFIED_COUNT})"
        else
          echo "[worker] [$JOBID] Cross-validation: all claims verified"
        fi
        # Inject unverified claims into article HTML as hidden comment
        if [ "$UNVERIFIED_COUNT" -gt 0 ] && [ -n "$RESULT" ]; then
          CLAIMS_JSON=$(echo "$QC_XVAL_REPORT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
claims = [c.get('claim','') if isinstance(c, dict) else str(c) for c in d.get('unverified', [])]
print(json.dumps(claims, ensure_ascii=False))
" 2>/dev/null || echo "[]")
          if [ "$CLAIMS_JSON" != "[]" ]; then
            RESULT="${RESULT}
<!-- QC_UNVERIFIED: ${CLAIMS_JSON} -->"
            echo "[worker] [$JOBID] Injected $UNVERIFIED_COUNT unverified claims into article HTML"
          fi
        fi
        # Save QC report
        echo "$QC_XVAL_REPORT" > "$JOBS_DIR/logs/${JOBID}.qc_xval.json"
        rm -f /tmp/blog_data/_qc_xval_input.txt
      fi
  # Export results
  CHECK_RESULT="$RESULT"
  CHECK_WARNINGS="$WARNINGS"
}
