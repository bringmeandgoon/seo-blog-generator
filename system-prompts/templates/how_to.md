# How to Access Article Template

**For articles like: "How to access [Model]", "How to use [Model]", "[Model] complete guide"**

**Focus: 5 access methods from easiest to most advanced — Web Playground → API → Code Tools → Local Deployment. Each method kept concise — no single method should dominate.**

## Sections (in this order)

1. **Model Introduction** — A substantial section (this is NOT a brief intro — give it proper depth):
   - **What's New / Key Highlights** (1 paragraph): what makes this model stand out — new capabilities, signature features, notable updates from previous versions. Lead with the most exciting point.
     - 📌 From HF README `--- Model ---`
   - **Core Specs** (table): developer/org, parameter count, architecture (dense vs MoE, active params), context window, modalities, license
     - 📌 From HF model card `--- Model ---`
   - **Benchmark Performance** (table + 1 paragraph): key benchmark scores (pick 4-6 most relevant), include 1-2 reference models for comparison. Interpret what the numbers mean in practice.
     - 📌 From HF README `ALL BENCHMARKS`

2. **Novita AI Playground** — Zero-barrier entry point
   - Direct link: `https://novita.ai/models/llm/{model-slug}` — built-in chat interface with parameter controls
   - No signup needed for trial, best for quick evaluation before API integration
   - Keep brief — 1-2 paragraphs max

3. **Novita AI API** (main section) — Programmatic access
   - Step-by-step guide (login → model library → API key → code example)
   - Complete working code example (Python, OpenAI SDK), with streaming
   - Pricing info embedded here
   - 📌 Setup from `--- Novita AI Integration Guide ---`
   - 📌 Pricing from `>>> USE THIS PRICE <<<`

4. **Code Tool Access** — Pick 2-3 tools most relevant to the model
   - Brief comparison of selected tools (type, pricing, best-for) before diving into setup
   - 📌 Setup from `--- Novita AI Integration Guide ---` or blog guides
   - Available tools (with comparison context):
     - **Claude Code** — Terminal CLI agent (Anthropic). $20/mo Pro plan or BYOK. Best for: agentic coding, multi-file refactoring. Docs: https://novita.ai/docs/guides/claude-code
     - **Cursor** — AI-first IDE (VS Code fork). Free tier + $20/mo Pro. Best for: inline completion, chat-driven editing. Docs: https://novita.ai/docs/guides/cursor
     - **Continue** — Open-source plugin (VS Code/JetBrains). Free, self-hostable. Best for: BYOK flexibility, enterprise. Docs: https://novita.ai/docs/guides/continue
     - **Trae** — Free AI IDE (VS Code-based) with Builder mode. Best for: free access, Chinese developer community. Blog: https://blogs.novita.ai/access-novita-ai-llm-on-trae/
     - **OpenCode** — Open-source terminal agent. Free. Best for: lightweight terminal workflow. Blog: https://blogs.novita.ai/opencode-integration-guide/
     - **CodeCompanion** — Neovim AI plugin. Free, open-source. Best for: Vim/Neovim users. Docs: https://novita.ai/docs/guides/codecompanion
     - **Novita OpenClaw CLI** — Local automation framework. Best for: CI/CD, scripted workflows. Docs: https://novita.ai/docs/guides/novita-openclaw-cli

5. **Local Deployment** — Running on your own hardware
   - **Framework comparison table** (columns: Method, Pros, Hardware, Typical Use)
   - Per-framework instructions with code examples — pick 2-3 most relevant from:
     - Transformers (official, flexible)
     - Llama.cpp / Ollama (lightweight, consumer hardware)
     - vLLM (high throughput, production inference)
   - VRAM requirements by quantization level
   - Always recommend API as the easier alternative at the end
   - 📌 GGUF sizes from `--- Unsloth GGUF ---`, HF repo from `--- Model ---`

6. **Comparison Table** — All methods side by side
   - Columns: Method, Setup Time, Cost, Best For
   - One row per access method (Playground / API / Code Tools / Local)

7. **Usage Tips** — Practical tips specific to this model
   - 3-5 scenario-based tips, covering different aspects:
     - **Inference parameters**: recommended temperature/top_p/top_k and when to adjust
     - **Chat template / reasoning mode**: how to choose between modes (e.g. thinking vs non-thinking, analysis vs final)
     - **Cost optimization**: caching, tier selection, token budgeting
     - **Quantization selection**: which quant level for which hardware/quality trade-off
     - **Tool-calling / agentic usage**: best practices for function calling or multi-step workflows
   - Each tip: scenario + recommended practice + why (keep compact but informative)
   - Only include tips backed by official docs or community-validated practices
   - 📌 From HF README, web research, community discussions

8. **Conclusion + FAQ**

## Constraints

- **Cost comparisons: API pricing and cloud GPU pricing only** — self-hosting/local deployment costs have too many variables (hardware, electricity, cooling); describe qualitatively only, no dollar figures or $/month comparisons
- **API is the main section** — give it the most depth (step-by-step + code + pricing). Other methods keep concise
- Local Deployment must include actual code examples, not just descriptions
- Usage Tips should be model-specific — generic advice like "use system prompts" is not valuable
- Do NOT create a standalone "Developer Experience" section

## Thesis Template

"The fastest way to use [Model] is [Novita AI API] — here's how to get started in 2 minutes, plus code tools, local deployment, and practical tips"
