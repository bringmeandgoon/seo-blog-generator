#!/usr/bin/env python3
"""
Crawl Novita AI developer docs using curl (no browser/Playwright needed).
Saves plain text + builds keyword index for blog article context injection.

Usage: python3 scripts/crawl-novita-docs.py [--force]
  --force: re-crawl even if cached files exist
"""

import re
import os
import sys
import json
import time
import html as html_lib
import subprocess
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent
DOCS_DIR = PROJECT_DIR / "novita-docs"
SITEMAP_URL = "https://novita.ai/docs/sitemap.xml"
CACHE_DAYS = 7
CURL = "/opt/homebrew/opt/curl/bin/curl"
MAX_WORKERS = 8  # parallel curl fetches


def get_proxy():
    try:
        out = subprocess.check_output(["scutil", "--proxy"], text=True)
        for line in out.splitlines():
            if "HTTPPort" in line:
                port = line.split()[-1]
                if port and port != "0":
                    return f"http://127.0.0.1:{port}"
    except:
        pass
    return None

PROXY = get_proxy()


def curl_fetch(url, timeout=20):
    """Fetch URL content using curl."""
    cmd = [CURL, "-sL", "--max-time", str(timeout)]
    if PROXY:
        cmd += ["-x", PROXY]
    cmd.append(url)
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout + 5)
    return result.stdout


def fetch_sitemap():
    return curl_fetch(SITEMAP_URL)


def get_doc_urls():
    sitemap = fetch_sitemap()
    urls = re.findall(r'<loc>(https://novita\.ai/docs/[^<]+)</loc>', sitemap)
    return [u for u in urls if '/guides/' in u or '/api-reference/' in u]


def extract_text_from_html(raw_html):
    """Extract clean text from HTML without any browser rendering."""
    text = raw_html
    # Remove script/style/nav/header/footer
    text = re.sub(r'<(script|style|nav|header|footer|noscript)[^>]*>.*?</\1>', '', text, flags=re.DOTALL | re.IGNORECASE)

    # Try to find main content area (article > main > body)
    for pattern in [r'<article[^>]*>(.*?)</article>', r'<main[^>]*>(.*?)</main>']:
        m = re.search(pattern, text, re.DOTALL)
        if m and len(m.group(1)) > 200:
            text = m.group(1)
            break

    # Preserve code blocks
    text = re.sub(
        r'<pre[^>]*><code[^>]*>(.*?)</code></pre>',
        lambda m: '\n```\n' + html_lib.unescape(re.sub(r'<[^>]+>', '', m.group(1))) + '\n```\n',
        text, flags=re.DOTALL
    )
    # Also handle <pre> without <code>
    text = re.sub(
        r'<pre[^>]*>(.*?)</pre>',
        lambda m: '\n```\n' + html_lib.unescape(re.sub(r'<[^>]+>', '', m.group(1))) + '\n```\n',
        text, flags=re.DOTALL
    )

    # Convert headers
    for i in range(1, 5):
        text = re.sub(
            f'<h{i}[^>]*>(.*?)</h{i}>',
            lambda m, lvl=i: '\n' + '#' * lvl + ' ' + re.sub(r'<[^>]+>', '', m.group(1)).strip() + '\n',
            text, flags=re.DOTALL
        )

    # Convert <li> to bullet points
    text = re.sub(r'<li[^>]*>(.*?)</li>', lambda m: '- ' + re.sub(r'<[^>]+>', '', m.group(1)).strip() + '\n', text, flags=re.DOTALL)

    # Convert <tr>/<td> to table-ish format
    text = re.sub(r'<tr[^>]*>(.*?)</tr>', lambda m: re.sub(r'<[^>]+>', '', m.group(1)).strip().replace('\n', ' | ') + '\n', text, flags=re.DOTALL)

    # Strip remaining HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    text = html_lib.unescape(text)

    # Clean whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Remove lines that are just nav/sidebar noise (very short repeated items)
    lines = [l.strip() for l in text.split('\n')]
    lines = [l for l in lines if l]
    text = '\n'.join(lines).strip()

    return text


def crawl_one(url):
    """Crawl a single URL, return (url, text) or (url, None) on failure."""
    try:
        raw = curl_fetch(url, timeout=15)
        if not raw or len(raw) < 200:
            return url, None
        text = extract_text_from_html(raw)
        if len(text) < 100:
            return url, None
        return url, text
    except Exception as e:
        return url, None


def build_index(docs_dir):
    """Build keyword index: maps keywords to relevant doc files."""
    index = {}
    for txt_file in docs_dir.rglob("*.txt"):
        if txt_file.name.startswith("_"):
            continue
        rel_path = str(txt_file.relative_to(docs_dir))
        content = txt_file.read_text(encoding='utf-8')[:3000].lower()
        name_words = set(re.findall(r'[a-z]{3,}', rel_path.lower()))
        content_words = set(re.findall(r'\b[a-z]{4,}\b', content))
        for kw in name_words | content_words:
            if kw not in index:
                index[kw] = []
            index[kw].append(rel_path)

    for k in index:
        index[k] = sorted(set(index[k]))
    index_path = docs_dir / "_index.json"
    index_path.write_text(json.dumps(index, indent=1, ensure_ascii=False), encoding='utf-8')

    summary = {}
    for txt_file in docs_dir.rglob("*.txt"):
        if txt_file.name.startswith("_"):
            continue
        rel = str(txt_file.relative_to(docs_dir))
        first_line = ""
        try:
            file_lines = txt_file.read_text(encoding='utf-8').splitlines()
            for line in file_lines[3:]:
                line = line.strip()
                if len(line) > 20:
                    first_line = line[:120]
                    break
        except:
            pass
        category = rel.split("/")[0]
        if category not in summary:
            summary[category] = []
        summary[category].append({"file": rel, "title": first_line})
    summary_path = docs_dir / "_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding='utf-8')

    return len(index)


def main():
    force = "--force" in sys.argv
    print("=== Novita AI Docs Crawler (curl, no browser) ===")
    print(f"Output: {DOCS_DIR}")
    print(f"Proxy: {PROXY or 'none'}")
    print(f"Force recrawl: {force}")

    urls = get_doc_urls()
    print(f"Found {len(urls)} doc pages")

    to_crawl = []
    cached = 0
    for url in urls:
        path_part = url.replace("https://novita.ai/docs/", "")
        out_path = DOCS_DIR / f"{path_part}.txt"
        if not force and out_path.exists():
            size = out_path.stat().st_size
            age_days = (time.time() - out_path.stat().st_mtime) / 86400
            if size > 200 and age_days < CACHE_DAYS:
                cached += 1
                continue
        to_crawl.append(url)

    print(f"Cached: {cached}, To crawl: {len(to_crawl)}")

    if not to_crawl:
        print("All pages cached. Use --force to recrawl.")
        print("Rebuilding index...")
        nk = build_index(DOCS_DIR)
        print(f"Index: {nk} keywords")
        return

    stats = {"ok": 0, "fail": 0, "total_chars": 0}

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {pool.submit(crawl_one, url): url for url in to_crawl}
        for i, future in enumerate(as_completed(futures), 1):
            url, text = future.result()
            path_part = url.replace("https://novita.ai/docs/", "")
            out_path = DOCS_DIR / f"{path_part}.txt"
            out_path.parent.mkdir(parents=True, exist_ok=True)

            if text is None:
                stats["fail"] += 1
                if i % 20 == 0 or len(to_crawl) <= 20:
                    print(f"  [{i}/{len(to_crawl)}] FAIL: {path_part}")
                continue

            header = f"Source: {url}\n{'=' * 60}\n\n"
            out_path.write_text(header + text, encoding='utf-8')
            stats["ok"] += 1
            stats["total_chars"] += len(text)

            if i % 50 == 0:
                print(f"  [{i}/{len(to_crawl)}] OK so far: {stats['ok']}")

    print(f"\n=== Crawl Done ===")
    print(f"  OK: {stats['ok']}, Failed: {stats['fail']}")
    print(f"  Text: {stats['total_chars'] / 1024:.0f} KB")

    print("Building index...")
    nk = build_index(DOCS_DIR)
    print(f"  Index: {nk} keywords")
    print("Done!")


if __name__ == "__main__":
    main()
