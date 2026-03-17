# How to Access Article Template

**Focus: 4 access methods from easiest to most advanced — Web Playground → API → Code Tools → Local Deployment.**

## Sections (in this order)

1. **Quick Answer callout** — "Try it now: Novita AI web playground (zero setup). Build with it: Novita AI API (3 lines of code). Power users: plug into Claude Code or OpenClaw."

2. **Model Introduction** — A substantial section covering four parts (this is NOT a brief intro — give it proper depth):
   - **What's New / Key Highlights** (1 paragraph): what makes this model stand out — new capabilities, signature features, notable updates from previous versions. Lead with the most exciting point.
     - 📌 From HF README `--- Model ---`
   - **Core Specs** (1 paragraph or mini-table): developer/org, parameter count, architecture (dense vs MoE, active params), context window, modalities, quantization support.
     - 📌 From HF model card `--- Model ---`
   - **Benchmark Performance** (table + 1 paragraph): key benchmark scores in a table (e.g., SWE-bench, AIME, GPQA, LiveCodeBench, HLE, BrowseComp — pick the most relevant 4-6). Include 1-2 reference models for comparison. Add a paragraph interpreting what the numbers mean in practice.
     - 📌 From HF README `ALL BENCHMARKS`
   - **Pros and Cons** (2-column table): concrete strengths and weaknesses derived from HF specs and benchmarks above. At least 3 items per side. Must be data-backed with specific numbers, not generic ("74.9% BrowseComp" not just "good at browsing").
     - 📌 Derived from HF data only

3. **Web Playground** — zero-barrier entry point. Direct link (official playground or Novita AI playground), no signup needed, best for quick evaluation.

4. **Novita AI API (main section)** — programmatic access (see Endpoint Rule for correct base_url).
   - 📌 Pricing from `>>> USE THIS PRICE <<<`
   - Complete working code example (Python, OpenAI SDK), streaming example.

5. **Code Tool Access** — Pick 2-3 tools most relevant to the model from Novita's integration guides below.
   - 📌 Setup from `--- Novita AI Integration Guide ---` or blog guides
   - Available tools:
     - **Claude Code** — Anthropic's terminal CLI agent. Docs: https://novita.ai/docs/guides/claude-code
     - **Cursor** — AI-first code editor (VS Code fork). Docs: https://novita.ai/docs/guides/cursor
     - **Continue** — Open-source AI code assistant (VS Code/JetBrains). Docs: https://novita.ai/docs/guides/continue
     - **Trae** — Free AI IDE (VS Code-based) with Builder mode. Blog: https://blogs.novita.ai/access-novita-ai-llm-on-trae/
     - **OpenCode** — Open-source terminal AI agent. Blog: https://blogs.novita.ai/opencode-integration-guide/
     - **CodeCompanion** — Neovim AI plugin. Docs: https://novita.ai/docs/guides/codecompanion
     - **Novita OpenClaw CLI** — Local automation framework. Docs: https://novita.ai/docs/guides/novita-openclaw-cli

6. **Local Deployment** — VRAM requirements and hardware.
   - 📌 GGUF sizes from `--- Unsloth GGUF ---`, HF repo from `--- Model ---`
   - Always recommend API as easier alternative.

7. **Comparison table** — columns: Method, Setup Time, Cost, Best For.

8. **Bottom Line** — "Explore via web playground → build with the API → supercharge your IDE with code tools. Self-host only if [specific condition]."

## Constraints

- Do NOT create a standalone "Developer Experience" section. Integrate developer experience insights into the relevant method sections.

## Thesis Template

"The fastest way to use [model] is [Novita AI API] — here's how to get started in 2 minutes"
