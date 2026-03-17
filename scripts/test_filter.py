#!/usr/bin/env python3
"""Test three context filtering approaches using existing Tavily data in /tmp/blog_data/."""
import json, os, re, subprocess, time

D = "/tmp/blog_data"
CANONICAL = "Qwen3.5"  # from existing test data

# ============================================================
# Load raw data
# ============================================================
def load_raw():
    """Load all Tavily search + extract results, return as structured dict."""
    raw = {"searches": [], "extracts": []}

    for fname, label in [
        ("tavily_review.json", "Topic Search"),
        ("tavily_reddit.json", "Reddit"),
        ("tavily_community.json", "Community"),
    ]:
        path = f"{D}/{fname}"
        if not os.path.exists(path):
            continue
        with open(path) as f:
            data = json.load(f)
        results = data.get("results", [])
        answer = data.get("answer", "")
        raw["searches"].append({
            "label": label,
            "answer": answer,
            "results": [
                {"title": r.get("title",""), "url": r.get("url",""), "content": r.get("content","")}
                for r in results
            ]
        })

    extract_path = f"{D}/tavily_extract.json"
    if os.path.exists(extract_path):
        with open(extract_path) as f:
            data = json.load(f)
        for r in data.get("results", []):
            raw["extracts"].append({
                "url": r.get("url", ""),
                "raw_content": r.get("raw_content", "")
            })

    return raw


def raw_total_chars(raw):
    total = 0
    for s in raw["searches"]:
        total += len(s["answer"])
        for r in s["results"]:
            total += len(r["content"])
    for e in raw["extracts"]:
        total += len(e["raw_content"])
    return total


# ============================================================
# Approach 1: Python rules only
# ============================================================
def filter_python(raw):
    """Rule-based filtering: truncation, dedup, relevance scoring."""
    ctx = []
    seen_urls = set()
    extract_urls = set()

    # Track which URLs have extract data (to skip their search snippets)
    for e in raw["extracts"]:
        if e["raw_content"]:
            extract_urls.add(e["url"])

    # --- Search results: keep answer + deduplicated results, truncate snippets ---
    for s in raw["searches"]:
        ctx.append(f"--- Web Research: {s['label']} ---")
        if s["answer"]:
            ctx.append(s["answer"][:500])
            ctx.append("")

        for r in s["results"]:
            url = r["url"]
            if url in seen_urls:
                continue
            seen_urls.add(url)
            # Skip if we have full extract for this URL
            if url in extract_urls:
                ctx.append(f"  [{r['title']}]({url}) — [full text in Extract section]")
                continue
            # Truncate snippet to 300 chars
            snippet = r["content"][:300].strip()
            if snippet:
                ctx.append(f"  [{r['title']}]({url})")
                ctx.append(f"  {snippet}")
                ctx.append("")

    # --- Extract results: keyword relevance scoring + truncation ---
    canonical_lower = CANONICAL.lower()
    canonical_norm = re.sub(r'[^a-z0-9]', '', canonical_lower)

    extract_items = []
    for e in raw["extracts"]:
        content = e["raw_content"]
        if not content or len(content) < 100:
            continue
        # Score: how many times canonical name appears
        content_lower = content.lower()
        score = content_lower.count(canonical_lower) + content_lower.count(canonical_norm)
        # Penalize if mostly code/tables
        code_ratio = len(re.findall(r'```[\s\S]*?```', content)) / max(len(content), 1)
        if code_ratio > 0.3:
            score = score // 2
        extract_items.append((score, e["url"], content))

    # Sort by relevance, keep top 3, truncate each to 1500 chars
    extract_items.sort(key=lambda x: -x[0])
    if extract_items:
        ctx.append("")
        ctx.append("--- Deep-Read Article Content (from Tavily Extract) ---")
        for score, url, content in extract_items[:3]:
            ctx.append(f"Source: {url} (relevance: {score})")
            ctx.append(content[:1500])
            ctx.append("")

    return "\n".join(ctx)


# ============================================================
# Approach 2: Claude (sonnet) only
# ============================================================
def filter_claude(raw):
    """Use Claude to filter and summarize raw search data."""
    # Prepare raw text for Claude
    raw_text = []
    for s in raw["searches"]:
        raw_text.append(f"=== Search: {s['label']} ===")
        if s["answer"]:
            raw_text.append(f"Answer: {s['answer']}")
        for r in s["results"]:
            raw_text.append(f"[{r['title']}] {r['url']}")
            raw_text.append(r["content"])
        raw_text.append("")

    for e in raw["extracts"]:
        raw_text.append(f"=== Extract: {e['url']} ===")
        # Give Claude first 5000 chars of each extract
        raw_text.append(e["raw_content"][:5000])
        raw_text.append("")

    raw_combined = "\n".join(raw_text)

    prompt = f"""You are a research data filter. Your job is to compress raw web search results into a concise context for an article writer.

CANONICAL MODEL: {CANONICAL}

RAW SEARCH DATA:
{raw_combined}

INSTRUCTIONS:
1. Remove any content NOT about "{CANONICAL}" (wrong model versions, unrelated topics)
2. Remove duplicate information across sources
3. Remove code snippets, setup boilerplate, and raw specs (the article writer gets specs from HuggingFace separately)
4. KEEP: practical insights, real-world experiences, user opinions, performance tips, gotchas, use case recommendations, cost experiences
5. KEEP: source URLs for every kept insight (the article writer needs them for citations)
6. Output a compressed context of NO MORE THAN 5000 characters total
7. Group by theme (performance, cost, practical tips, community opinions), not by source

Output the filtered context directly, no preamble."""

    result = subprocess.run(
        ["claude", "-p", prompt, "--output-format", "text", "--model", "sonnet"],
        capture_output=True, text=True, timeout=120
    )
    return result.stdout.strip() if result.returncode == 0 else f"ERROR: {result.stderr[:500]}"


# ============================================================
# Approach 3: Python pre-filter + Claude summarize
# ============================================================
def filter_python_plus_claude(raw):
    """Python does mechanical filtering first, then Claude summarizes the remainder."""
    # Step 1: Python pre-filter (aggressive)
    pre = []
    seen_urls = set()

    for s in raw["searches"]:
        pre.append(f"=== {s['label']} ===")
        if s["answer"]:
            pre.append(s["answer"][:300])
        for r in s["results"]:
            if r["url"] in seen_urls:
                continue
            seen_urls.add(r["url"])
            pre.append(f"[{r['title']}] {r['url']}")
            pre.append(r["content"][:400])
        pre.append("")

    # Extract: only top 3 by length (assume longer = more useful), truncate to 2000
    extracts_sorted = sorted(raw["extracts"], key=lambda e: -len(e.get("raw_content","")))
    for e in extracts_sorted[:3]:
        content = e["raw_content"]
        if not content or len(content) < 100:
            continue
        pre.append(f"=== Extract: {e['url']} ===")
        pre.append(content[:2000])
        pre.append("")

    pre_text = "\n".join(pre)

    # Step 2: Claude summarizes the pre-filtered data
    prompt = f"""You are a research data filter. Compress the following pre-filtered search data into a concise context.

CANONICAL MODEL: {CANONICAL}

PRE-FILTERED DATA:
{pre_text}

INSTRUCTIONS:
1. Remove anything not about "{CANONICAL}" exactly
2. Merge duplicate info, keep source URLs
3. KEEP practical insights, user opinions, gotchas, performance tips
4. REMOVE specs/benchmarks (handled separately), code snippets, boilerplate
5. Output NO MORE THAN 4000 characters
6. Group by theme with source URLs

Output directly, no preamble."""

    result = subprocess.run(
        ["claude", "-p", prompt, "--output-format", "text", "--model", "sonnet"],
        capture_output=True, text=True, timeout=120
    )
    return result.stdout.strip() if result.returncode == 0 else f"ERROR: {result.stderr[:500]}"


# ============================================================
# Main: run all three and compare
# ============================================================
if __name__ == "__main__":
    raw = load_raw()
    total_raw = raw_total_chars(raw)
    print(f"{'='*60}")
    print(f"RAW DATA: {total_raw:,} chars ({total_raw//4:,} est. tokens)")
    print(f"  Searches: {len(raw['searches'])} queries, {sum(len(r['results']) for r in raw['searches'])} results")
    print(f"  Extracts: {len(raw['extracts'])} pages")
    print(f"{'='*60}\n")

    results = {}

    # --- Approach 1: Python ---
    print("[1/3] Python rules filtering...")
    t0 = time.time()
    py_out = filter_python(raw)
    t1 = time.time()
    results["python"] = {"output": py_out, "time": t1 - t0}
    print(f"  Done: {len(py_out):,} chars in {t1-t0:.1f}s\n")

    # --- Approach 2: Claude ---
    print("[2/3] Claude (sonnet) filtering...")
    t0 = time.time()
    cl_out = filter_claude(raw)
    t1 = time.time()
    results["claude"] = {"output": cl_out, "time": t1 - t0}
    print(f"  Done: {len(cl_out):,} chars in {t1-t0:.1f}s\n")

    # --- Approach 3: Python + Claude ---
    print("[3/3] Python + Claude filtering...")
    t0 = time.time()
    pc_out = filter_python_plus_claude(raw)
    t1 = time.time()
    results["python_claude"] = {"output": pc_out, "time": t1 - t0}
    print(f"  Done: {len(pc_out):,} chars in {t1-t0:.1f}s\n")

    # --- Summary ---
    print(f"{'='*60}")
    print(f"COMPARISON SUMMARY")
    print(f"{'='*60}")
    print(f"{'Method':<20} {'Input':>10} {'Output':>10} {'Ratio':>8} {'Time':>8}")
    print(f"{'-'*20} {'-'*10} {'-'*10} {'-'*8} {'-'*8}")
    for name, r in results.items():
        out_len = len(r["output"])
        ratio = f"{out_len/total_raw*100:.1f}%"
        print(f"{name:<20} {total_raw:>10,} {out_len:>10,} {ratio:>8} {r['time']:>7.1f}s")

    # Save outputs for manual review
    for name, r in results.items():
        outpath = f"/tmp/blog_data/_filter_test_{name}.txt"
        with open(outpath, "w") as f:
            f.write(r["output"])
        print(f"\nSaved: {outpath}")
