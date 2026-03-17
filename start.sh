#!/bin/bash
# One command to start everything: worker + server + (optional) tunnel

cd "$(dirname "$0")"

# Clean up old job files from previous runs
rm -f jobs/pending/*.json jobs/pending/*.processing jobs/done/*.json 2>/dev/null

# Build frontend if dist/ is outdated
if [ ! -d dist ] || [ "$(find src index.html -newer dist/index.html 2>/dev/null | head -1)" ]; then
  echo "[start] Building frontend..."
  npm run build
fi

cleanup() {
  echo ""
  echo "Stopping all services..."
  kill $WORKER_PID $SERVER_PID $TUNNEL_PID 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

# Start worker (runs claude -p)
./worker.sh &
WORKER_PID=$!

# Start Express backend (serves frontend + API)
node server.js &
SERVER_PID=$!

# Wait for server to be ready
sleep 2

# Start cloudflared tunnel if --tunnel flag is passed
TUNNEL_PID=""
if [ "$1" = "--tunnel" ] || [ "$1" = "-t" ]; then
  if command -v cloudflared &>/dev/null; then
    cloudflared tunnel --url http://localhost:3001 --protocol http2 &
    TUNNEL_PID=$!
    echo ""
    echo "========================================="
    echo "  All services started (public mode)!"
    echo "  Local:   http://localhost:3001"
    echo "  Tunnel:  (see cloudflared output above)"
    echo "  Worker:  Running (PID $WORKER_PID)"
    echo "========================================="
  else
    echo "[start] cloudflared not installed. Run: brew install cloudflared"
    echo ""
    echo "========================================="
    echo "  Worker + Server started (local only)"
    echo "  Local:  http://localhost:3001"
    echo "========================================="
  fi
else
  echo ""
  echo "========================================="
  echo "  All services started!"
  echo "  Local:  http://localhost:3001"
  echo "  Worker: Running (PID $WORKER_PID)"
  echo "========================================="
  echo "  Add --tunnel to expose publicly"
fi

echo "  Press Ctrl+C to stop all"
echo ""

wait
