#!/usr/bin/env python3
"""
RAG retrieval for Novita AI docs.
Given a topic, finds the top-3 most relevant document chunks
using cosine similarity + keyword boost.

Usage: python3 scripts/rag-retrieve.py "Kimi K2.5 VRAM requirements"
Output: Relevant doc content printed to stdout (ready for context injection)
"""

import os
import sys
import json
import math
import re
from pathlib import Path

# --- Config ---
NOVITA_DOCS_DIR = Path(__file__).resolve().parent.parent / "novita-docs"
EMBEDDINGS_FILE = NOVITA_DOCS_DIR / "_embeddings.json"
EMBEDDING_MODEL = "baai/bge-m3"
EMBEDDING_API_URL = "https://api.ppio.com/openai/v1/embeddings"
TOP_K = 3
SIMILARITY_THRESHOLD = 0.40
KEYWORD_BOOST = 0.15  # bonus for keyword match in file path/title

# Keywords that strongly signal doc relevance (topic keyword -> file path patterns)
KEYWORD_PATTERNS = {
    'cursor': ['cursor'],
    'vram': ['gpu', 'instance', 'pricing', 'serverless'],
    'gpu': ['gpu', 'instance', 'pricing', 'serverless'],
    'deploy': ['gpu', 'instance', 'serverless', 'deploy'],
    'serverless': ['serverless'],
    'api': ['llm', 'chat-completion', 'openai', 'authentication', 'skill'],
    'function': ['function-calling', 'tool'],
    'tool': ['function-calling', 'tool'],
    'batch': ['batch', 'skill'],
    'vision': ['vision'],
    'reasoning': ['reasoning'],
    'embedding': ['embedding'],
    'rerank': ['rerank'],
    'tts': ['tts', 'speech', 'audio'],
    'speech': ['tts', 'speech', 'audio'],
    'image': ['image', 'flux', 'img2img', 'txt2img'],
    'video': ['video', 'kling', 'hunyuan'],
    'fine-tune': ['training', 'fine-tune'],
    'finetune': ['training', 'fine-tune'],
    'training': ['training'],
    'opencode': ['opencode'],
    'openclaw': ['openclaw'],
    'trae': ['trae'],
    'claude': ['claude-code'],
    'windsurf': ['windsurf'],
    'pricing': ['pricing', 'gpu', 'billing'],
    'cost': ['pricing', 'gpu', 'billing'],
    'novita': ['skill', 'introduction'],
    'access': ['skill', 'claude-code', 'cursor', 'continue', 'openclaw', 'llm'],
    'setup': ['skill', 'claude-code', 'cursor'],
    'integration': ['skill', 'claude-code', 'cursor', 'continue'],
    'sandbox': ['sandbox', 'skill'],
}


def get_api_key():
    """Get PPIO API key from environment or .env file."""
    key = os.environ.get("PPIO_API_KEY")
    if key:
        return key
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line.startswith("PPIO_API_KEY=") and not line.startswith("#"):
                return line.split("=", 1)[1].strip().strip("'\"")
    return None


def cosine_similarity(a, b):
    """Compute cosine similarity between two vectors."""
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def get_embedding(text, api_key):
    """Get embedding for a single text."""
    import urllib.request

    data = json.dumps({
        "model": EMBEDDING_MODEL,
        "input": [text],
    }).encode("utf-8")

    req = urllib.request.Request(
        EMBEDDING_API_URL,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read())
    return result["data"][0]["embedding"]


def compute_keyword_boost(topic, file_path, title):
    """Compute keyword-based boost score."""
    topic_words = set(re.findall(r'[a-z]+', topic.lower()))
    fp_lower = file_path.lower()
    title_lower = title.lower()

    boost = 0.0
    for tw in topic_words:
        patterns = KEYWORD_PATTERNS.get(tw, [])
        for pat in patterns:
            if pat in fp_lower or pat in title_lower:
                boost = max(boost, KEYWORD_BOOST)
                break
    return boost


def retrieve(topic):
    """Retrieve top-K relevant docs for a topic."""
    api_key = get_api_key()
    if not api_key:
        print("(RAG skip: PPIO_API_KEY not set)", file=sys.stderr)
        return

    if not EMBEDDINGS_FILE.exists():
        print("(RAG skip: _embeddings.json not found)", file=sys.stderr)
        return

    # Load index
    data = json.loads(EMBEDDINGS_FILE.read_text(encoding="utf-8"))
    chunks = data["chunks"]

    # Get topic embedding
    topic_emb = get_embedding(topic, api_key)

    # Score all chunks: embedding similarity + keyword boost
    scored = []
    for chunk in chunks:
        sim = cosine_similarity(topic_emb, chunk["embedding"])
        boost = compute_keyword_boost(topic, chunk["file"], chunk.get("title", ""))
        scored.append((sim + boost, sim, chunk))

    # Sort by boosted score descending
    scored.sort(key=lambda x: -x[0])

    # Take top-K above threshold
    results = []
    for total_score, raw_sim, chunk in scored[:TOP_K]:
        if total_score < SIMILARITY_THRESHOLD:
            break
        results.append((total_score, chunk))

    if not results:
        return

    # Load full text for matched files (embeddings only store truncated text)
    for score, chunk in results:
        file_path = chunk["file"]
        full_text = chunk["text"]

        # Try loading full file content for real docs
        if not file_path.startswith("_virtual/"):
            real_path = NOVITA_DOCS_DIR / file_path
            if real_path.exists():
                content = real_path.read_text(encoding="utf-8")
                # Skip source header
                if "\n====\n" in content:
                    content = content.split("\n====\n", 1)[-1].strip()
                elif "====\n" in content:
                    content = content.split("====\n", 1)[-1].strip()
                # Strip sidebar navigation menu (ends at "On this page" line)
                nav_match = re.search(r'^On this page\b.*$', content, re.MULTILINE)
                if nav_match:
                    content = content[nav_match.start():].strip()
                full_text = content[:2000]  # cap per doc

        print(f"[Source: {file_path} | relevance: {score:.2f}]")
        print(full_text)
        print()


def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <topic>", file=sys.stderr)
        sys.exit(1)

    topic = " ".join(sys.argv[1:])
    retrieve(topic)


if __name__ == "__main__":
    main()
