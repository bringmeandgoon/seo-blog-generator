# Code Agent Integration Article Template

**For articles like: "use [Model] in Claude Code", "[Model] in Cursor", "[Model] with OpenCode"**

## Sections (in this order)

1. **Model Introduction** (brief: 2-3 sentences + benchmark table) — What the model is, key strengths for coding
   - 📌 From HF model card `--- Model ---`
   - 📌 Benchmarks from HF README (pick coding-relevant: SWE-bench, LiveCodeBench, Aider)

2. **How Does [Model] Help?** — Practical value for developers/teams
   - What real problems it solves (automate tasks, cut costs, enhance decision-making)
   - Concrete scenarios: code generation, debugging, testing, documentation
   - Why this model specifically (cost, context window, reasoning ability)

3. **How to Unlock [Model]'s Code Ability** — Why a code agent makes the model stronger
   - Raw model vs model inside a code agent (context awareness, file access, execution feedback)
   - The agent loop: Plan → Act → Observe → Revise
   - What the tool provides: project context, write access, real-time diffs, test feedback

4. **Step-by-step Setup Guide** — Complete setup for the ONE tool in the title
   - 📌 MUST come from `--- Novita AI Integration Guide ---`
   - Include exact env vars, config files, verification steps
   - Pricing info embedded here (not a separate section)

5. **Usage & Demos** — Practical usage scenarios with the tool
   - 3-4 real-world scenarios (e.g. code generation, bug fixing, refactoring, testing)
   - Each scenario: brief description + actual prompt/command example
   - Show what the model + tool combination excels at
   - Tips and gotchas from community experience
   - 📌 From web research, community discussions, official docs

6. **Conclusion + FAQ**

**STRICT SECTION RULES — Code Agent Integration articles ONLY contain these sections listed above.**

**DO NOT INCLUDE any of these sections — they belong to other article types:**
- "Which Deployment Method" / deployment comparison
- Provider pricing comparison tables (this is API Provider article territory)
- Local Deployment / GGUF Quantization (this is VRAM article territory)
- Cost Comparison: API vs Self-Hosted (this is VRAM/How to Access territory)
- "How to Access" via web/API/local (this is How to Access article territory)
- Tool Comparison Table (this article focuses on ONE tool only)
- Fabricated tool-calling JSON schemas or API examples not from official docs
- Configuration parameters (temperature, top-p, top-k) that the tool does not support
- `ANTHROPIC_TEMPERATURE`, `ANTHROPIC_TOP_P`, `ANTHROPIC_TOP_K` env vars (these do NOT exist for Claude Code)
- Showing `npm install` as the primary Claude Code install method (use native installer: `curl -fsSL https://claude.ai/install.sh | bash`)

The article focuses on ONE tool (the one in the keyword). Show how to set it up AND how to use it effectively with the model.

## Thesis Template

"[Model] + [Tool] gives developers [specific advantage] — here's how to set it up and start using it"
