#!/bin/bash
# Worker: watches jobs/pending/ for new tasks, dispatches to 4 agent modules
# Architecture: search → architect → write → check
#
# Agent modules (sourced below):
#   worker-search.sh    — pre-search data collection, context assembly, review extraction
#   worker-architect.sh — article outline generation via claude -p
#   worker-write.sh     — article/compare generation via claude -p
#   worker-check.sh     — quality check + data cross-validation
#
# NOTE: Don't run an interactive claude session at the same time — API concurrency conflict.
# Run this in a regular terminal: ./worker.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
JOBS_DIR="$SCRIPT_DIR/jobs"
SKILL_DIR=~/.claude/skills/dev-blog-writer

# Load split prompt files
DATA_SOURCE_RULES=$(cat "$SKILL_DIR/shared/data-source-rules.md")
ARCHITECT_RULES=$(python3 -c "
import re, sys
content = open('$SCRIPT_DIR/system-prompts/ARCHITECT.md').read()
sys.stdout.write(re.sub(r'^---[\s\S]*?---\n', '', content, count=1))
")
WRITE_RULES=$(cat "$SKILL_DIR/write-rules.md")
CHECK_RULES=$(cat "$SKILL_DIR/check-rules.md")
REWRITE_RULES=$(cat "$SKILL_DIR/rewrite-rules.md")
# Copy reference files to /tmp so claude -p can read them on demand
mkdir -p /tmp/blog_references
cp "$SKILL_DIR"/references/*.md /tmp/blog_references/ 2>/dev/null

# Load article type template by name. Returns content or empty string.
load_template() {
  local type="$1"
  local tmpl_file="$SKILL_DIR/templates/${type}.md"
  if [ -f "$tmpl_file" ]; then
    cat "$tmpl_file"
  else
    echo "[worker] WARNING: no template for type '$type'" >&2
    echo ""
  fi
}
MODEL="${CLAUDE_MODEL:-sonnet}"
CHECK_MODEL="${CHECK_MODEL:-minimax/minimax-m2.5}"

# Load .env
if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a
  source "$SCRIPT_DIR/.env"
  set +a
fi

# Detect ClashX Pro proxy and export for curl inside claude -p
PROXY_PORT=$(scutil --proxy 2>/dev/null | awk '/HTTPPort/{print $3}')
if [ -n "$PROXY_PORT" ] && [ "$PROXY_PORT" != "0" ]; then
  export http_proxy="http://127.0.0.1:$PROXY_PORT"
  export https_proxy="http://127.0.0.1:$PROXY_PORT"
  export all_proxy="http://127.0.0.1:$PROXY_PORT"
  echo "[worker] Proxy detected: 127.0.0.1:$PROXY_PORT"
else
  unset http_proxy https_proxy all_proxy ALL_PROXY HTTP_PROXY HTTPS_PROXY
  echo "[worker] No proxy detected, using direct connection"
fi

CLAUDE_TIMEOUT=${CLAUDE_TIMEOUT:-480}  # 8 min per job, configurable

# Cleanup: kill stale claude -p processes and recover .processing files
cleanup_stale() {
  local stale_pids
  stale_pids=$(ps -eo pid,command | grep 'claude -p' | grep -v grep | awk '{print $1}')
  if [ -n "$stale_pids" ]; then
    echo "[worker] Cleaning up stale claude -p processes: $stale_pids"
    echo "$stale_pids" | xargs kill 2>/dev/null
    sleep 1
    echo "$stale_pids" | xargs kill -9 2>/dev/null
  fi
  for f in "$JOBS_DIR/pending"/*.processing; do
    [ -f "$f" ] || continue
    local jid=$(basename "$f" .processing)
    echo "[worker] Recovering stale job: $jid"
    mv "$f" "$JOBS_DIR/pending/${jid}.json" 2>/dev/null
  done
}

# Shared utility: strip removed URLs from context text (stdin → stdout)
# Usage: PRE_CONTEXT=$(echo "$PRE_CONTEXT" | strip_removed_urls "$REMOVED_URLS")
strip_removed_urls() {
  local removed_urls="$1"
  if [ -z "$removed_urls" ] || [ "$removed_urls" = "[]" ]; then
    cat  # passthrough
    return
  fi
  REMOVED_URLS_JSON="$removed_urls" python3 -c "
import os, json, re
ctx = open('/dev/stdin').read()
urls = json.loads(os.environ.get('REMOVED_URLS_JSON', '[]'))
if urls:
    for url in urls:
        escaped = re.escape(url)
        ctx = re.sub(r'\[.*?\]\s*' + escaped + r'.*?(?=\n\[|\n===|\n---|\n\n|$)', '', ctx, flags=re.DOTALL)
        ctx = re.sub(r'.*' + escaped + r'.*\n?', '', ctx)
    ctx = re.sub(r'\n{3,}', '\n\n', ctx)
print(ctx, end='')
"
}

# ====== Source agent modules ======
source "$SCRIPT_DIR/worker-search.sh"
source "$SCRIPT_DIR/worker-architect.sh"
source "$SCRIPT_DIR/worker-write.sh"
source "$SCRIPT_DIR/worker-rewrite.sh"
source "$SCRIPT_DIR/worker-check.sh"

# ====== Main loop ======
trap 'echo "[worker] Shutting down..."; kill 0 2>/dev/null; exit 0' INT TERM

cleanup_stale

echo "=== Dev Blog Worker Started ==="
echo "Model: $MODEL"
echo "Timeout: ${CLAUDE_TIMEOUT}s per job"
echo "Mode: Claude does its own research (Bash curl, TUN mode)"
echo "Watching: $JOBS_DIR/pending/"
echo "Press Ctrl+C to stop"
echo ""

while true; do
  for jobfile in "$JOBS_DIR/pending"/*.json; do
    [ -f "$jobfile" ] || continue

    JOBID=$(basename "$jobfile" .json)
    TOPIC=$(cat "$jobfile" | python3 -c "import sys,json; print(json.load(sys.stdin)['topic'])" 2>/dev/null)
    OUTPUT_MODE=$(cat "$jobfile" | python3 -c "import sys,json; print(json.load(sys.stdin).get('outputMode','article'))" 2>/dev/null)
    ANSWER=$(cat "$jobfile" | python3 -c "import sys,json; print(json.load(sys.stdin).get('answer',''))" 2>/dev/null)
    PHASE=$(cat "$jobfile" | python3 -c "import sys,json; print(json.load(sys.stdin).get('phase',''))" 2>/dev/null)
    FEEDBACK=$(cat "$jobfile" | python3 -c "import sys,json; print(json.load(sys.stdin).get('feedback',''))" 2>/dev/null)
    REMOVED_URLS=$(cat "$jobfile" | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin).get('removedUrls',[])))" 2>/dev/null)

    if [ -z "$TOPIC" ]; then
      echo "[worker] Invalid job file: $jobfile"
      rm -f "$jobfile"
      continue
    fi

    echo "[worker] [$JOBID] Generating: \"$TOPIC\" (mode: $OUTPUT_MODE)"
    echo "[worker] [$JOBID] Started at $(date)"

    mv "$jobfile" "$JOBS_DIR/pending/${JOBID}.processing" 2>/dev/null || continue

    # Detect "vs" comparison topic
    IS_VS=$(echo "$TOPIC" | grep -ci ' vs ')

    # Pre-create search helper
    cat > /tmp/blog_search_env.sh << 'HELPER_EOF'
#!/bin/bash
CURL="/opt/homebrew/opt/curl/bin/curl"
UA="User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
PROXY_PORT=$(scutil --proxy | awk '/HTTPPort/{print $3}')
if [ -n "$PROXY_PORT" ] && [ "$PROXY_PORT" != "0" ]; then
  PROXY="http://127.0.0.1:$PROXY_PORT"
else
  PROXY=""
fi
fetch() {
  local url="$1" attempt=0 max_retries=2 result=""
  while [ $attempt -le $max_retries ]; do
    if [ -n "$PROXY" ]; then
      result=$($CURL -sL --max-time 15 -x "$PROXY" -H "$UA" "$url" 2>/dev/null)
    else
      result=$($CURL -sL --max-time 15 -H "$UA" "$url" 2>/dev/null)
    fi
    if [ -n "$result" ]; then
      echo "$result"
      return 0
    fi
    attempt=$((attempt + 1))
    [ $attempt -le $max_retries ] && sleep 1
  done
}
mkdir -p /tmp/blog_data
HELPER_EOF
    chmod +x /tmp/blog_search_env.sh

    mkdir -p "$JOBS_DIR/logs"

    # ====== Phase routing ======
    if [ "$PHASE" = "generate" ]; then
      # --- Write Agent ---
      prepare_write_context "$JOBID" "$REMOVED_URLS"
      echo "[worker] [$JOBID] Phase: generate (context: $(echo "$PRE_CONTEXT" | wc -c | tr -d ' ') bytes, outline: $(echo "$ARCHITECT_JSON" | wc -c | tr -d ' ') bytes)"
      run_write "$JOBID" "$TOPIC" "$IS_VS" "$OUTPUT_MODE" "$ANSWER"

      RESULT="$WRITE_RESULT"
      EXITCODE="$WRITE_EXITCODE"

      # --- Strip preamble text before first <h2>/<h3> tag (Claude sometimes adds reasoning text) ---
      RESULT=$(python3 -c "
import sys, re
content = sys.stdin.read()
m = re.search(r'<h[2-4][\s>]', content)
if m and m.start() > 0:
    import sys as _sys
    print(f'[preamble stripped: {m.start()} chars]', file=_sys.stderr)
    content = content[m.start():]
sys.stdout.write(content)
" <<< "$RESULT")

      # --- Save write result for rewrite phase ---
      echo "$RESULT" > "$JOBS_DIR/logs/${JOBID}.write.txt"

      # --- Write write_review status so frontend can preview ---
      python3 -c "
import json, sys
content = sys.stdin.read()
json.dump({'status': 'write_review', 'content': content, 'outputMode': '${OUTPUT_MODE}'}, open('${JOBS_DIR}/done/${JOBID}.json', 'w'))
" <<< "$RESULT"
      echo "[worker] [$JOBID] Write done, waiting for write_review confirmation"

    elif [ "$PHASE" = "rewrite" ]; then
      # --- Rewrite + Check Agent ---
      RESULT=$(cat "$JOBS_DIR/logs/${JOBID}.write.txt" 2>/dev/null)
      PRE_CONTEXT=$(cat "$JOBS_DIR/logs/${JOBID}.context" 2>/dev/null)
      IS_VS=$(echo "$TOPIC" | grep -ci ' vs ')
      WARNINGS=""

      if [ -n "$RESULT" ] && [ $(echo "$RESULT" | wc -c | tr -d ' ') -gt 3000 ]; then
        run_rewrite "$JOBID" "$TOPIC"
        RESULT="$REWRITE_RESULT"
        run_check "$JOBID" "$TOPIC"
        RESULT="$CHECK_RESULT"
        WARNINGS="$CHECK_WARNINGS"
      fi

      save_result "$JOBID" "$RESULT" "0" "$WARNINGS" "$IS_VS" "$OUTPUT_MODE"

    elif [ "$PHASE" = "architect" ]; then
      # --- Architect Agent ---
      run_architect "$JOBID" "$TOPIC" "$REMOVED_URLS"

    elif [ "$PHASE" = "search_more" ]; then
      # --- Search Agent (additional search) ---
      run_search_more "$JOBID" "$TOPIC" "$FEEDBACK" "$REMOVED_URLS"

    else
      # --- Search Agent (initial search for new jobs) ---
      run_initial_search "$JOBID" "$TOPIC" "$IS_VS"
    fi

    rm -f "$JOBS_DIR/pending/${JOBID}.processing"
  done

  sleep 2
done
