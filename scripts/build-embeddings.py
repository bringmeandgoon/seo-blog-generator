#!/usr/bin/env python3
"""
Build embedding index for Novita AI docs.
Reads all .txt files from novita-docs/ + virtual docs (selling points, GPU pricing),
calls ppio embedding API to generate vectors, saves to novita-docs/_embeddings.json.

Usage: python3 scripts/build-embeddings.py
"""

import os
import sys
import json
import time
from pathlib import Path

# --- Config ---
NOVITA_DOCS_DIR = Path(__file__).resolve().parent.parent / "novita-docs"
OUTPUT_FILE = NOVITA_DOCS_DIR / "_embeddings.json"
EMBEDDING_MODEL = "baai/bge-m3"
EMBEDDING_API_URL = "https://api.ppio.com/openai/v1/embeddings"
BATCH_SIZE = 20  # max docs per API call

# Virtual documents (content previously hardcoded in worker.sh)
VIRTUAL_DOCS = [
    {
        "file": "_virtual/gpu-pricing.txt",
        "title": "Novita AI GPU Instance Pricing",
        "text": """Novita AI GPU Instance Pricing (https://novita.ai/gpu-instance)
Source: novita.ai/gpu-instance — REAL prices, do NOT make up GPU costs

RTX 5090 32GB VRAM: On-Demand $0.63/hr (1x), $5.04/hr (8x) | Spot $0.32/hr (1x), $2.56/hr (8x)
RTX 4090 24GB VRAM: On-Demand $0.67/hr (1x), $5.36/hr (8x)
H100 SXM 80GB VRAM: On-Demand $1.45/hr (1x), $11.60/hr (8x) | Spot $0.73/hr (1x), $5.84/hr (8x)
Storage: Container Disk 60GB free then $0.005/GB/day | Volume Disk $0.005/GB/day | Network Volume $0.002/GB/day

For multi-GPU setups, calculate from single-GPU price × count (e.g., 4×H100 = $5.80/hr on-demand).""",
    },
]


def get_api_key():
    """Get PPIO API key from environment or .env file."""
    key = os.environ.get("PPIO_API_KEY")
    if key:
        return key
    # Try loading from .env
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line.startswith("PPIO_API_KEY=") and not line.startswith("#"):
                return line.split("=", 1)[1].strip().strip("'\"")
    print("ERROR: PPIO_API_KEY not found in environment or .env", file=sys.stderr)
    sys.exit(1)


def load_docs():
    """Load all .txt files from novita-docs/ + virtual docs."""
    chunks = []

    # Real docs
    for txt_file in sorted(NOVITA_DOCS_DIR.rglob("*.txt")):
        rel = txt_file.relative_to(NOVITA_DOCS_DIR)
        text = txt_file.read_text(encoding="utf-8")

        # Extract title from first content line (after source header)
        lines = text.strip().split("\n")
        title = str(rel)
        content = text
        if len(lines) >= 3 and "====" in lines[1]:
            title = lines[2].strip() if lines[2].strip() else str(rel)
            content = "\n".join(lines[2:]).strip()
        elif len(lines) >= 2 and lines[0].startswith("Source:"):
            title = lines[1].strip() if len(lines) > 1 else str(rel)

        chunks.append({
            "file": str(rel),
            "title": title[:200],
            "text": content[:3000],  # truncate for embedding (bge-m3 handles ~8K tokens but we keep it reasonable)
        })

    # Virtual docs
    for vd in VIRTUAL_DOCS:
        chunks.append({
            "file": vd["file"],
            "title": vd["title"],
            "text": vd["text"],
        })

    return chunks


def get_embeddings(texts, api_key):
    """Call ppio embedding API for a batch of texts."""
    import urllib.request

    data = json.dumps({
        "model": EMBEDDING_MODEL,
        "input": texts,
    }).encode("utf-8")

    req = urllib.request.Request(
        EMBEDDING_API_URL,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        result = json.loads(resp.read())

    # Sort by index to maintain order
    embeddings = sorted(result["data"], key=lambda x: x["index"])
    return [e["embedding"] for e in embeddings]


def main():
    api_key = get_api_key()
    print(f"Loading docs from {NOVITA_DOCS_DIR}...")
    chunks = load_docs()
    print(f"Loaded {len(chunks)} chunks ({len(chunks) - len(VIRTUAL_DOCS)} files + {len(VIRTUAL_DOCS)} virtual docs)")

    # Batch embed
    all_embeddings = []
    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i:i + BATCH_SIZE]
        texts = [c["text"] for c in batch]
        print(f"  Embedding batch {i // BATCH_SIZE + 1}/{(len(chunks) + BATCH_SIZE - 1) // BATCH_SIZE} ({len(batch)} docs)...")
        embs = get_embeddings(texts, api_key)
        all_embeddings.extend(embs)
        if i + BATCH_SIZE < len(chunks):
            time.sleep(0.5)  # rate limit courtesy

    # Attach embeddings to chunks
    for chunk, emb in zip(chunks, all_embeddings):
        chunk["embedding"] = emb

    # Save
    OUTPUT_FILE.write_text(json.dumps({"chunks": chunks}, ensure_ascii=False), encoding="utf-8")
    size_mb = OUTPUT_FILE.stat().st_size / 1024 / 1024
    print(f"Saved {len(chunks)} chunks to {OUTPUT_FILE} ({size_mb:.1f} MB)")
    print("Done!")


if __name__ == "__main__":
    main()
