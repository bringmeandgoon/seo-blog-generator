# Dev Blog Platform

AI-powered technical blog generation platform. Input a model name + keywords, get complete WordPress-ready articles with SEO optimization.

## Architecture

```
React Frontend (Vite:5173)
  → Express API (server.js:3001)
    → Job Queue (jobs/pending/)
      → worker.sh → claude -p (Claude Code CLI)
```

- **Frontend**: React + Tailwind CSS — keyword input, article list, viewer, SEO stats dashboard
- **Backend**: Express — job management, article CRUD, Feishu Bitable integration (optional)
- **Worker**: Bash script — watches job queue, runs `claude -p` with SKILL.md prompt to generate articles
- **SKILL**: Modular writing skill with search workflow, style guidelines, and article templates

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — add your PERPLEXITY_API_KEY at minimum

# 3. Start all services (worker + server + frontend)
./start.sh
```

Open http://localhost:5173

## How It Works

1. Enter keywords in the UI: `Model Name; keyword1; keyword2; keyword3`
2. Frontend sends job to Express backend
3. Backend writes job JSON to `jobs/pending/`
4. Worker picks up the job, runs pre-search (HuggingFace, Bing, Reddit, etc.)
5. Worker injects research data + SKILL.md prompt into `claude -p`
6. Claude Code CLI generates a complete article with HTML formatting
7. Result is saved to `jobs/done/`, frontend polls and displays it

## Project Structure

```
├── server.js          # Express API (jobs + optional Feishu SEO stats)
├── worker.sh          # Job processor: pre-search + claude -p
├── start.sh           # Starts worker + server + vite
├── skill/             # Blog writing skill (prompt + references)
│   ├── SKILL.md       # Main skill prompt
│   ├── USAGE.md       # Usage guide
│   └── references/    # Style guides, templates, keyword strategies
├── src/
│   ├── components/
│   │   ├── KeywordInput.jsx    # Keyword input + job submission
│   │   ├── ArticleList.jsx     # Article list sidebar
│   │   ├── ArticleViewer.jsx   # Article display + quality checks
│   │   └── SeoStats.jsx        # SEO tracking dashboard (Feishu)
│   └── App.jsx
├── jobs/
│   ├── pending/       # Queued jobs (JSON)
│   └── done/          # Completed articles (JSON)
├── .env.example       # Environment template
└── CLAUDE.md          # Claude Code project rules
```

## Configuration

See `.env.example` for all options:

- `CLAUDE_MODEL` — Model for article generation (default: `sonnet`)
- `PERPLEXITY_API_KEY` — Required for worker's real-time search
- `FEISHU_*` — Optional, for SEO stats tracking via Feishu Bitable

## Commands

| Command | Description |
|---------|-------------|
| `./start.sh` | Start all services |
| `npm run dev` | Vite dev server only |
| `npm run build` | Build frontend |
| `node server.js` | Express backend only |
| `./worker.sh` | Worker only |

## Requirements

- Node.js 18+
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated
- macOS recommended (worker uses Homebrew curl for proxy compatibility)

## License

MIT
