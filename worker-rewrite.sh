#!/bin/bash
# Worker Rewrite Agent: humanize AI writing patterns via claude -p + /humanizer skill
# Sourced by worker.sh — do NOT run directly.

# Rewrite article to remove AI writing patterns and make it sound more natural.
# Expects globals: RESULT, REWRITE_RULES, MODEL, JOBS_DIR
# Sets globals: REWRITE_RESULT
run_rewrite() {
  local JOBID="$1" TOPIC="$2"

  echo "[worker] [$JOBID] Running rewrite (humanize AI patterns via /humanizer skill)..."
  echo "$RESULT" > /tmp/blog_data/_rewrite_input.txt

  # Write prompt file
  REWRITE_PROMPT_FILE="$JOBS_DIR/logs/${JOBID}.rewrite_prompt"
  cat > "$REWRITE_PROMPT_FILE" << REWRITE_PROMPT_EOF
/humanizer

=== ARTICLE TO REWRITE ===
$(cat /tmp/blog_data/_rewrite_input.txt | head -c 50000)

Return the complete rewritten HTML article only. No explanations, no preamble.
REWRITE_PROMPT_EOF

  REWRITE_RESULTFILE="$JOBS_DIR/logs/${JOBID}.rewrite_result"
  REWRITE_LOGFILE="$JOBS_DIR/logs/${JOBID}.rewrite_log"

  cat "$REWRITE_PROMPT_FILE" | claude -p \
    --system-prompt "$REWRITE_RULES" \
    --model "$MODEL" \
    --output-format text \
    --permission-mode bypassPermissions \
    >"$REWRITE_RESULTFILE" 2>"$REWRITE_LOGFILE" &
  REWRITE_PID=$!

  # Wait with timeout (5 min for rewrite)
  REWRITE_ELAPSED=0
  REWRITE_TIMEOUT=300
  while kill -0 $REWRITE_PID 2>/dev/null; do
    sleep 3
    REWRITE_ELAPSED=$((REWRITE_ELAPSED + 3))
    if [ $REWRITE_ELAPSED -ge $REWRITE_TIMEOUT ]; then
      echo "[worker] [$JOBID] Rewrite claude -p timed out after ${REWRITE_TIMEOUT}s"
      kill $REWRITE_PID 2>/dev/null; sleep 1; kill -9 $REWRITE_PID 2>/dev/null
      break
    fi
  done
  wait $REWRITE_PID 2>/dev/null
  REWRITE_EXIT=$?

  REWRITTEN=""
  [ -f "$REWRITE_RESULTFILE" ] && REWRITTEN=$(cat "$REWRITE_RESULTFILE")
  rm -f "$REWRITE_PROMPT_FILE" "$REWRITE_RESULTFILE"

  # Post-process: strip <think> tags and markdown fences
  REWRITTEN=$(echo "$REWRITTEN" | python3 << 'POSTPROCESS_EOF'
import sys, re
content = sys.stdin.read()
if '<think>' in content:
    content = re.sub(r'<think>[\s\S]*?</think>', '', content).strip()
content = re.sub(r'^```html\n?', '', content, flags=re.IGNORECASE)
content = re.sub(r'\n?```$', '', content)
print(content, end='')
POSTPROCESS_EOF
)

  if [ -n "$REWRITTEN" ] && [ $(echo "$REWRITTEN" | wc -c | tr -d ' ') -gt 2000 ]; then
    ORIGINAL_LEN=$(echo "$RESULT" | wc -c | tr -d ' ')
    REWRITTEN_LEN=$(echo "$REWRITTEN" | wc -c | tr -d ' ')
    MIN_LEN=$(echo "$RESULT" | python3 -c "import sys; print(int(len(sys.stdin.read()) * 0.7))")
    if [ "$REWRITTEN_LEN" -ge "$MIN_LEN" ]; then
      echo "[worker] [$JOBID] Rewrite done (${ORIGINAL_LEN} → ${REWRITTEN_LEN} chars)"
      RESULT="$REWRITTEN"
    else
      echo "[worker] [$JOBID] Rewrite sanity fail (too short: ${REWRITTEN_LEN} < ${MIN_LEN}), keeping original"
    fi
  else
    echo "[worker] [$JOBID] Rewrite returned empty/short result, keeping original"
  fi

  rm -f /tmp/blog_data/_rewrite_input.txt

  # Export result
  REWRITE_RESULT="$RESULT"
}
