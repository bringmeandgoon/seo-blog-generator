import json, os, sys, urllib.request as ur

D = '/tmp/blog_data'
queries = json.loads(os.environ.get('PPLX_QUERIES', '[]'))
pplx_key = os.environ.get('PPLX_KEY', '')

if not queries or not pplx_key:
    print("[pplx] No queries or API key", flush=True)
    sys.exit(0)

# Build request body
body = json.dumps({
    'query': queries,
    'max_results': 20,
    'max_tokens': 50000,
    'max_tokens_per_page': 4096,
    'search_recency_filter': 'month',
    'return_language': 'en',
    'search_domain_filter': ['-huggingface.co', '-novita.ai', '-apidog.com'],
}).encode()

# Call Perplexity Search API via urllib (respects proxy env vars, no double-proxy issue)
req = ur.Request(
    'https://api.perplexity.ai/search',
    data=body,
    headers={'Authorization': f'Bearer {pplx_key}', 'Content-Type': 'application/json'},
)
try:
    with ur.urlopen(req, timeout=45) as resp:
        raw = resp.read().decode()
    data = json.loads(raw)
    results = data.get('results', [])
    print(f"[pplx] {len(results)} results returned", flush=True)

    # Save as unified format compatible with downstream code
    # Map Perplexity format to Tavily-like format for backward compat
    converted = {
        'results': [
            {
                'title': r.get('title', ''),
                'url': r.get('url', ''),
                'content': r.get('snippet', ''),
                'date': r.get('date', ''),
            }
            for r in results
        ]
    }
    json.dump(converted, open(f"{D}/tavily_fanout_0.json", 'w'), ensure_ascii=False)

    # Log each result
    for i, r in enumerate(results):
        print(f"  [{i}] {r.get('title','')[:60]} | {r.get('url','')}", flush=True)
except Exception as e:
    print(f"[pplx] failed: {e}", flush=True)
