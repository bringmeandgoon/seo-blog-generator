#!/bin/bash
# Dev Blog Platform — One-click Setup
# Run: bash setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_LINK="$HOME/.claude/skills/dev-blog-writer"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}!${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; }

echo ""
echo "========================================="
echo "  Dev Blog Platform Setup"
echo "========================================="
echo ""

# ====== 1. Check system dependencies ======
echo "[1/6] Checking dependencies..."

MISSING=0

if command -v node &>/dev/null; then
  ok "Node.js $(node -v)"
else
  fail "Node.js not found — install from https://nodejs.org"
  MISSING=1
fi

if command -v python3 &>/dev/null; then
  ok "Python3 $(python3 --version 2>&1 | awk '{print $2}')"
else
  fail "python3 not found"
  MISSING=1
fi

if command -v claude &>/dev/null; then
  ok "Claude Code CLI found"
else
  fail "Claude Code CLI not found — install: npm install -g @anthropic-ai/claude-code"
  MISSING=1
fi

# curl: prefer homebrew curl (HTTP/3 + better TLS), fallback to system curl
CURL_BIN=""
if [ -x "/opt/homebrew/opt/curl/bin/curl" ]; then
  CURL_BIN="/opt/homebrew/opt/curl/bin/curl"
  ok "curl (Homebrew): $CURL_BIN"
elif [ -x "/usr/local/opt/curl/bin/curl" ]; then
  CURL_BIN="/usr/local/opt/curl/bin/curl"
  ok "curl (Homebrew Intel): $CURL_BIN"
elif command -v curl &>/dev/null; then
  CURL_BIN="$(command -v curl)"
  warn "curl (system): $CURL_BIN — Homebrew curl recommended for better TLS: brew install curl"
else
  fail "curl not found"
  MISSING=1
fi

if [ $MISSING -eq 1 ]; then
  echo ""
  fail "Missing dependencies above. Please install them first."
  exit 1
fi

# ====== 2. Write detected curl path into helper config ======
echo ""
echo "[2/6] Configuring curl path..."

# Patch worker.sh and worker-write.sh to use detected curl
CURL_ESCAPED=$(echo "$CURL_BIN" | sed 's/[\/&]/\\&/g')
for f in worker.sh worker-write.sh; do
  if [ -f "$SCRIPT_DIR/$f" ]; then
    if grep -q '/opt/homebrew/opt/curl/bin/curl' "$SCRIPT_DIR/$f"; then
      sed -i.bak "s|/opt/homebrew/opt/curl/bin/curl|$CURL_BIN|g" "$SCRIPT_DIR/$f"
      rm -f "$SCRIPT_DIR/$f.bak"
      ok "Patched $f → $CURL_BIN"
    else
      ok "$f already configured"
    fi
  fi
done

# ====== 3. Create skill symlink ======
echo ""
echo "[3/6] Setting up Claude Code skill..."

mkdir -p "$HOME/.claude/skills"

if [ -L "$SKILL_LINK" ]; then
  EXISTING_TARGET=$(readlink "$SKILL_LINK")
  if [ "$EXISTING_TARGET" = "$SCRIPT_DIR/skill" ]; then
    ok "Symlink already correct: $SKILL_LINK → $SCRIPT_DIR/skill"
  else
    warn "Symlink exists but points to: $EXISTING_TARGET"
    warn "Updating to: $SCRIPT_DIR/skill"
    rm "$SKILL_LINK"
    ln -s "$SCRIPT_DIR/skill" "$SKILL_LINK"
    ok "Symlink updated"
  fi
elif [ -e "$SKILL_LINK" ]; then
  warn "$SKILL_LINK exists but is not a symlink — skipping (remove it manually if needed)"
else
  ln -s "$SCRIPT_DIR/skill" "$SKILL_LINK"
  ok "Created symlink: $SKILL_LINK → $SCRIPT_DIR/skill"
fi

# ====== 4. Setup .env ======
echo ""
echo "[4/6] Setting up environment..."

if [ -f "$SCRIPT_DIR/.env" ]; then
  ok ".env already exists"
else
  cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
  warn ".env created from .env.example — please edit it with your API keys:"
  echo ""
  echo "       Required:"
  echo "         PPIO_API_KEY=       (for QC cross-validation, get from ppio.ai)"
  echo "         PERPLEXITY_API_KEY= (for web search, get from perplexity.ai)"
  echo ""
  echo "       Optional:"
  echo "         CLAUDE_MODEL=sonnet (default: sonnet)"
  echo "         ACCESS_PASSWORD=    (protect web UI)"
  echo ""
fi

# ====== 5. Install dependencies ======
echo ""
echo "[5/6] Installing Node.js dependencies..."

if [ -d "$SCRIPT_DIR/node_modules" ]; then
  ok "node_modules exists — skipping (run 'npm install' manually to update)"
else
  (cd "$SCRIPT_DIR" && npm install)
  ok "npm install done"
fi

# ====== 6. Create directories ======
echo ""
echo "[6/6] Creating working directories..."

mkdir -p "$SCRIPT_DIR/jobs/pending" "$SCRIPT_DIR/jobs/done" "$SCRIPT_DIR/jobs/logs"
ok "jobs/pending, jobs/done, jobs/logs"

mkdir -p /tmp/blog_references /tmp/blog_data
cp "$SCRIPT_DIR/skill/references"/*.md /tmp/blog_references/ 2>/dev/null
ok "/tmp/blog_references (skill reference files copied)"

# ====== Done ======
echo ""
echo "========================================="
echo -e "  ${GREEN}Setup complete!${NC}"
echo "========================================="
echo ""
echo "  Next steps:"
echo "    1. Edit .env with your API keys"
echo "    2. Run:  ./start.sh"
echo "    3. Open: http://localhost:3001"
echo ""
echo "  Optional:"
echo "    ./start.sh --tunnel    # expose via cloudflare tunnel"
echo ""
