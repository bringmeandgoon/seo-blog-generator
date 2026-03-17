#!/bin/bash
# One-click update: crawl novita docs + fetch skill.md + rebuild embeddings
# Run monthly: ./scripts/update-novita-docs.sh [--force]

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "=== Step 1/2: Crawl Novita docs + skill.md ==="
python3 scripts/crawl-novita-docs.py "$@"

echo ""
echo "=== Step 2/2: Rebuild embeddings ==="
python3 scripts/build-embeddings.py

echo ""
echo "=== All done! RAG index updated. ==="
echo "Files:"
echo "  novita-docs/guides/*.txt  — doc pages"
echo "  novita-docs/guides/skill.md — Novita skill reference"
echo "  novita-docs/_embeddings.json — vector index"
