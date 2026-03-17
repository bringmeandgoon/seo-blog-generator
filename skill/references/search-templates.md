# Search Templates

Batch search bash scripts for different article types. Worker pre-search handles most data fetching automatically — these templates are for Claude's additional searches when pre-fetched data is insufficient.

## Single-Model Article (VRAM / API Provider / How to Access)

```bash
source /tmp/blog_search_env.sh

MODEL="MiniMax+M2.1"  # URL-encoded model name from user input

# 1. HuggingFace: discover repo, fetch config + README
fetch "https://huggingface.co/api/models?search=${MODEL}&sort=downloads&direction=-1&limit=15" > /tmp/blog_data/01_hf_search.json

# Parse to find official repo (skip forks)
REPO=$(python3 -c "
import sys,json
SKIP={'unsloth','lmstudio-community','mlx-community','QuantTrio','RedHatAI','hugging-quants'}
for m in json.loads(sys.stdin.read()):
  org=m['id'].split('/')[0]
  if org in SKIP: continue
  if any(x in m['id'] for x in ['-GGUF','-AWQ','-FP8','-quantized','-MLX']): continue
  print(m['id']); break
" < /tmp/blog_data/01_hf_search.json)
echo "Found repo: $REPO"

if [ -n "$REPO" ]; then
  fetch "https://huggingface.co/$REPO/raw/main/config.json" > /tmp/blog_data/02_config.json
  fetch "https://huggingface.co/$REPO/raw/main/README.md" > /tmp/blog_data/03_readme.md
fi

# 2. Bing search (via proxy for international results)
fetch "https://www.bing.com/search?q=${MODEL}+VRAM&mkt=en-US" > /tmp/blog_data/04_bing.html

# 2b. DuckDuckGo HTML (reviews, blogs, tutorials — broader web content)
fetch "https://html.duckduckgo.com/html/?q=${MODEL}+review+benchmark+blog" > /tmp/blog_data/04b_ddg.html

# 3. Novita AI pricing (public JSON API, no auth)
fetch "https://api.novita.ai/v3/openai/models" > /tmp/blog_data/05_pricing.json

# 4. Reddit (use www, not old; needs short User-Agent)
curl -sL -H "User-Agent: dev-blog-platform/1.0" "https://www.reddit.com/search.json?q=${MODEL}&sort=relevance&t=year&limit=10" > /tmp/blog_data/06_reddit.json

# 5. Artificial Analysis (speed/latency)
fetch "https://artificialanalysis.ai/leaderboards/models" | sed 's/<[^>]*>/ /g' | tr -s ' \n' '\n' | grep -i "minimax\|M2\.1\|latency\|throughput" > /tmp/blog_data/07_speed.txt

echo "=== Batch search complete ==="
ls -la /tmp/blog_data/
```

## VS Comparison Article ([Model A] vs [Model B])

```bash
source /tmp/blog_search_env.sh

MODEL_A="Model+A+Name"
MODEL_B="Model+B+Name"

# 1. HuggingFace: discover repos for BOTH models
fetch "https://huggingface.co/api/models?search=${MODEL_A}&sort=downloads&direction=-1&limit=15" > /tmp/blog_data/01_hf_a.json
fetch "https://huggingface.co/api/models?search=${MODEL_B}&sort=downloads&direction=-1&limit=15" > /tmp/blog_data/02_hf_b.json

# Parse official repos (skip forks)
parse_repo() {
  python3 -c "
import sys,json
SKIP={'unsloth','lmstudio-community','mlx-community','QuantTrio','RedHatAI','hugging-quants'}
for m in json.loads(sys.stdin.read()):
  org=m['id'].split('/')[0]
  if org in SKIP: continue
  if any(x in m['id'] for x in ['-GGUF','-AWQ','-FP8','-quantized','-MLX']): continue
  print(m['id']); break
" < "$1"
}
REPO_A=$(parse_repo /tmp/blog_data/01_hf_a.json)
REPO_B=$(parse_repo /tmp/blog_data/02_hf_b.json)

# 2. Fetch config.json + README.md for BOTH models
[ -n "$REPO_A" ] && fetch "https://huggingface.co/$REPO_A/raw/main/config.json" > /tmp/blog_data/03_config_a.json
[ -n "$REPO_A" ] && fetch "https://huggingface.co/$REPO_A/raw/main/README.md" | head -c 12000 > /tmp/blog_data/04_readme_a.md
[ -n "$REPO_B" ] && fetch "https://huggingface.co/$REPO_B/raw/main/config.json" > /tmp/blog_data/05_config_b.json
[ -n "$REPO_B" ] && fetch "https://huggingface.co/$REPO_B/raw/main/README.md" | head -c 12000 > /tmp/blog_data/06_readme_b.md

# 3. Bing: VS comparison + each model individually
fetch "https://www.bing.com/search?q=${MODEL_A}+vs+${MODEL_B}&mkt=en-US" > /tmp/blog_data/07_bing_vs.html
fetch "https://www.bing.com/search?q=${MODEL_A}+benchmark+review&mkt=en-US" > /tmp/blog_data/08_bing_a.html
fetch "https://www.bing.com/search?q=${MODEL_B}+benchmark+review&mkt=en-US" > /tmp/blog_data/09_bing_b.html

# 4. Novita AI pricing
fetch "https://api.novita.ai/v3/openai/models" > /tmp/blog_data/10_pricing.json

# 5. Reddit
curl -sL -H "User-Agent: dev-blog-platform/1.0" "https://www.reddit.com/search.json?q=${MODEL_A}+${MODEL_B}&sort=relevance&t=year&limit=10" > /tmp/blog_data/11_reddit.json

echo "=== VS batch search complete ==="
ls -la /tmp/blog_data/
```

## Tool Integration Article (use [Model] in Claude Code / Trae / OpenCode)

```bash
source /tmp/blog_search_env.sh

MODEL="Your-Model-Name"
TOOL="Claude+Code"

# 1. Model info: HuggingFace + Bing
fetch "https://huggingface.co/api/models?search=${MODEL}&sort=downloads&direction=-1&limit=15" > /tmp/blog_data/01_hf.json
fetch "https://www.bing.com/search?q=${MODEL}+coding+benchmark&mkt=en-US" > /tmp/blog_data/02_bing_model.html

# 2. Tool setup info
fetch "https://www.bing.com/search?q=${TOOL}+custom+model+setup&mkt=en-US" > /tmp/blog_data/03_bing_tool.html

# 3. Combined search
fetch "https://www.bing.com/search?q=${MODEL}+${TOOL}&mkt=en-US" > /tmp/blog_data/04_bing_combo.html

# 4. Known sources
curl -sL -H "User-Agent: dev-blog-platform/1.0" "https://www.reddit.com/r/ClaudeAI/search.json?q=${MODEL}&restrict_sr=on&t=year&limit=10" > /tmp/blog_data/05_reddit.json
fetch "https://api.novita.ai/v3/openai/models" > /tmp/blog_data/06_pricing.json

echo "=== Tool Integration batch search complete ==="
ls -la /tmp/blog_data/
```

## Site Notes

- **Bing**: primary search engine (`www.bing.com/search?q=...&mkt=en-US`). Must go through proxy. **NEVER use Google** (blocked in China)
- **DuckDuckGo HTML**: `https://html.duckduckgo.com/html/?q=...`. Results have `class="result__a"` for title+URL and `class="result__snippet"` for snippets
- **HuggingFace**: Use Search API first (`/api/models?search=`), then `config.json` + `README.md`. **NEVER guess org/repo names**. Skip forks (unsloth, lmstudio-community, GGUF, AWQ, etc.)
- **Novita AI**: pricing via `api.novita.ai/v3/openai/models` (public JSON). Raw values are $0.0001 units — worker pre-search already converts to USD
- **Artificial Analysis**: speed/latency only (~5MB HTML, strip tags + grep). NOT for benchmarks
- **Reddit**: `www.reddit.com/search.json` with `-H "User-Agent: dev-blog-platform/1.0"`. Do NOT use `old.reddit.com`
- **Bing result parsing**: results in `class="b_algo"` blocks. Title in `<h2><a>`, snippet in `<p>`, URL in `<cite>`
- **Banned sources for specs/benchmarks**: llm-stats.com, aicybr.com, wavespeed.ai/blog
