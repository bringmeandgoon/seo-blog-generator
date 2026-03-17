#!/usr/bin/env python3
"""Test Qwen3.5-27B as the filtering model via PPIO API."""
import json, os, re, time, subprocess

D = "/tmp/blog_data"
CANONICAL = "Qwen3.5"

def load_raw():
    raw = {"searches": [], "extracts": []}
    for fname, label in [
        ("tavily_review.json", "Topic Search"),
        ("tavily_reddit.json", "Reddit"),
        ("tavily_community.json", "Community"),
    ]:
        path = f"{D}/{fname}"
        if not os.path.exists(path): continue
        with open(path) as f:
            data = json.load(f)
        raw["searches"].append({
            "label": label,
            "answer": data.get("answer", ""),
            "results": [
                {"title": r.get("title",""), "url": r.get("url",""), "content": r.get("content","")}
                for r in data.get("results", [])
            ]
        })
    extract_path = f"{D}/tavily_extract.json"
    if os.path.exists(extract_path):
        with open(extract_path) as f:
            data = json.load(f)
        for r in data.get("results", []):
            raw["extracts"].append({"url": r.get("url",""), "raw_content": r.get("raw_content","")})
    return raw


def python_prefilter(raw):
    """Python mechanical compression: dedup, truncate, basic relevance."""
    pre = []
    seen_urls = set()
    for s in raw["searches"]:
        pre.append(f"=== {s['label']} ===")
        if s["answer"]:
            pre.append(s["answer"][:300])
        for r in s["results"]:
            if r["url"] in seen_urls: continue
            seen_urls.add(r["url"])
            pre.append(f"[{r['title']}] {r['url']}")
            pre.append(r["content"][:400])
        pre.append("")
    extracts_sorted = sorted(raw["extracts"], key=lambda e: -len(e.get("raw_content","")))
    for e in extracts_sorted[:3]:
        content = e["raw_content"]
        if not content or len(content) < 100: continue
        pre.append(f"=== Extract: {e['url']} ===")
        pre.append(content[:2000])
        pre.append("")
    return "\n".join(pre)


def call_qwen_filter(pre_text):
    """Call Qwen3.5-27B via PPIO OpenAI-compatible API."""
    import urllib.request

    api_key = os.environ.get("PPIO_API_KEY", "")
    prompt = f"""You are a research data filter. Compress the following pre-filtered search data into a concise context for an article writer.

CANONICAL MODEL: {CANONICAL}

PRE-FILTERED DATA:
{pre_text}

INSTRUCTIONS:
1. Remove anything not about "{CANONICAL}" exactly (wrong model versions, unrelated topics)
2. Merge duplicate info, keep source URLs
3. KEEP practical insights, user opinions, gotchas, performance tips, deployment experiences
4. REMOVE specs/benchmarks (handled separately), code snippets, boilerplate, navigation text
5. Output NO MORE THAN 4000 characters
6. Group by theme (Performance, Deployment, Community, Cost) with source URLs
7. Write in English

Output the filtered context directly, no preamble."""

    payload = json.dumps({
        "model": "qwen/qwen3.5-27b",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 2000,
        "temperature": 0.3,
    }).encode()

    req = urllib.request.Request(
        "https://api.ppinfra.com/v3/openai/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )
    # Bypass proxy env vars (TUN mode handles routing)
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    with opener.open(req, timeout=60) as resp:
        data = json.loads(resp.read().decode())

    content = data["choices"][0]["message"]["content"]
    # Strip thinking/reasoning if present
    if "<think>" in content:
        content = re.sub(r'<think>[\s\S]*?</think>', '', content).strip()
    return content


if __name__ == "__main__":
    raw = load_raw()
    raw_total = sum(len(s["answer"]) + sum(len(r["content"]) for r in s["results"]) for s in raw["searches"])
    raw_total += sum(len(e["raw_content"]) for e in raw["extracts"])
    print(f"Raw data: {raw_total:,} chars")

    # Step 1: Python pre-filter
    t0 = time.time()
    pre = python_prefilter(raw)
    t1 = time.time()
    print(f"Python pre-filter: {raw_total:,} → {len(pre):,} chars ({t1-t0:.1f}s)")

    # Step 2: Qwen filter
    t0 = time.time()
    qwen_out = call_qwen_filter(pre)
    t1 = time.time()
    print(f"Qwen3.5-27B filter: {len(pre):,} → {len(qwen_out):,} chars ({t1-t0:.1f}s)")
    print(f"Total compression: {raw_total:,} → {len(qwen_out):,} ({len(qwen_out)/raw_total*100:.1f}%)")

    # Save
    out_path = f"{D}/_filter_test_python_qwen.txt"
    with open(out_path, "w") as f:
        f.write(qwen_out)
    print(f"\nSaved: {out_path}")
    print(f"\n{'='*60}")
    print("OUTPUT:")
    print(f"{'='*60}")
    print(qwen_out)
