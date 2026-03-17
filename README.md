# AI Blog Generator

AI-powered technical blog generation platform. Input a model name + keywords, get complete WordPress-ready articles with inline citations, benchmark tables, and SEO optimization.

## How It Works

```
You type: "GLM-5; GLM-5 VRAM; GLM-5 vs Kimi K2.5; GLM-5 API providers"
                              ↓
              4-Agent Pipeline (fully automated)
                              ↓
        3-4 complete HTML articles with source citations
```

**Pipeline: Search → Architect → Write → Check**

| Agent | Tool | What it does |
|-------|------|-------------|
| **Search** | HuggingFace API, Tavily, Novita API | Collects model specs, benchmarks, pricing, community discussions |
| **Architect** | Claude Code CLI | Detects article type, generates structured outline with data source assignments |
| **Write** | Claude Code CLI | Writes full HTML article following the outline, with inline `<a href>` citations |
| **Check** | MiniMax M2.5 API | Quality review (factual accuracy, tone, SEO) + data cross-validation |

## Quick Start

```bash
# 1. One-click setup (checks deps, creates symlink, installs packages)
bash setup.sh

# 2. Edit .env with your API keys
#    - PPIO_API_KEY    (required, for QC check agent)
#    - TAVILY_API_KEY  (required, for web search)

# 3. Start all services
./start.sh
```

Open **http://localhost:3001**

## Requirements

- **Node.js** 18+
- **Python** 3.9+
- **Claude Code CLI** — `npm install -g @anthropic-ai/claude-code` and authenticate
- **macOS** recommended (worker uses `scutil` for proxy detection; Linux works with minor tweaks)

## Project Structure

```
├── setup.sh               # One-click setup script
├── start.sh               # Start all services (worker + server)
├── server.js              # Express API — job queue, article CRUD
├── worker.sh              # Main dispatcher — routes jobs to 4 agents
├── worker-search.sh       # Search Agent — data collection (1800 lines)
├── worker-architect.sh    # Architect Agent — outline generation
├── worker-write.sh        # Write Agent — article generation
├── worker-check.sh        # Check Agent — QC + cross-validation
│
├── skill/                 # Prompt rules & templates (symlinked to ~/.claude/skills/)
│   ├── write-rules.md     # Write Agent system prompt
│   ├── check-rules.md     # Check Agent rules (10 categories)
│   ├── shared/
│   │   └── data-source-rules.md   # Data source mapping (HARD CONSTRAINTS)
│   ├── templates/         # Article type templates (6 types)
│   │   ├── vram.md        #   VRAM / hardware requirements
│   │   ├── vs.md          #   Model A vs Model B
│   │   ├── api_provider.md#   API provider comparison
│   │   ├── how_to.md      #   How to access / use
│   │   ├── tool_integration.md  # Use [Model] in [Tool]
│   │   └── platform.md    #   Platform-specific guide
│   └── references/        # Style guides, examples, search templates
│
├── novita-docs/           # RAG knowledge base (Novita AI docs, ~200 files)
├── scripts/               # Doc crawling, embedding, RAG retrieval
├── seo-monitor/           # SEO tracking (GSC + Feishu reports)
│
├── src/                   # React frontend
│   ├── App.jsx
│   └── components/
│       ├── KeywordInput.jsx     # Input: model name + keywords
│       ├── ArticleList.jsx      # Sidebar: article list
│       ├── ArticleViewer.jsx    # Viewer: HTML + QC markers
│       ├── OutlineEditor.jsx    # Outline: drag-to-reorder sections
│       ├── SourceReview.jsx     # Sources: review/remove before writing
│       ├── SeoStats.jsx         # SEO dashboard (optional)
│       └── compare/
│           └── CompareView.jsx  # VS comparison cards
│
├── jobs/
│   ├── pending/           # Queued jobs (JSON)
│   ├── done/              # Completed articles (JSON)
│   └── logs/              # Agent logs, QC reports
│
├── .env.example           # Environment template
└── CLAUDE.md              # Claude Code project rules
```

## Article Types

The system auto-detects article type from keywords:

| Keyword pattern | Article type | Example |
|----------------|-------------|---------|
| `[Model] VRAM` | Hardware requirements | "GLM-5 VRAM Requirements Guide" |
| `[Model] vs [Model]` | Comparison | "GLM-5 vs Kimi K2.5: Which is Better?" |
| `[Model] API providers` | Provider comparison | "Top GLM-5 API Providers" |
| `[Model] in Claude Code` | Tool integration | "Use GLM-5 in Claude Code" |
| `how to access [Model]` | Access guide | "How to Access GLM-5" |
| `[Model] on [Platform]` | Platform guide | "GLM-5 on Novita AI" |

## Workflow

1. Enter keywords in the UI: `Model Name; keyword1; keyword2; keyword3`
2. **Search Agent** collects data from HuggingFace, Tavily, Novita API, OpenRouter
3. **You review sources** — remove irrelevant ones, add feedback, request more searches
4. **Architect Agent** generates an outline — you can drag-to-reorder sections
5. **Write Agent** generates the full HTML article following the outline
6. **Check Agent** reviews quality and cross-validates all numbers against source data
7. Export as HTML (for WordPress) or Markdown

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `PPIO_API_KEY` | Yes | QC cross-validation via MiniMax M2.5 |
| `TAVILY_API_KEY` | Yes | Web search in pre-search phase |
| `CLAUDE_MODEL` | No | Model for article generation (default: `sonnet`) |
| `CLAUDE_TIMEOUT` | No | Timeout per job in seconds (default: `480`) |
| `ACCESS_PASSWORD` | No | Password-protect the web UI |

## Commands

| Command | Description |
|---------|-------------|
| `bash setup.sh` | One-click setup |
| `./start.sh` | Start all services (worker + server) |
| `./start.sh --tunnel` | Start + expose via Cloudflare Tunnel |
| `npm run dev` | Vite dev server only (hot reload) |
| `npm run build` | Build frontend for production |
| `./worker.sh` | Worker only (for debugging) |

## Data Source Rules

The system enforces strict data source constraints to prevent hallucination:

| Data | Source | Never from |
|------|--------|-----------|
| Architecture, params, benchmarks | HuggingFace model card | LLM memory |
| API token pricing | Novita AI API (live) | Blog articles |
| GPU instance pricing | Novita GPU pricing page | Estimated/guessed |
| Community opinions | Tavily web search | Fabricated quotes |
| Tool setup steps | Novita RAG docs | LLM memory |

## License

MIT
