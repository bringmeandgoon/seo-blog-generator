# Platform Article Template

**For articles like: "[Model] on Novita AI", "deploy [Model] on [Platform]", standalone model name**

## Sections (in this order)

1. **Model Introduction** (substantial — this is the main educational section)
   - **What's New / Why It Matters** (1 paragraph): what makes this model stand out, key highlights, why developers should care. Lead with the most exciting point.
     - 📌 From HF README `--- Model ---`
   - **Core Specs** (table): developer/org, parameter count, architecture (dense vs MoE, active params), context window, modalities, license
     - 📌 From HF model card `--- Model ---`
   - **Benchmark Performance** (table + 1 paragraph): key benchmark scores (pick 4-6 most relevant), include 1-2 reference models for comparison. Interpret what the numbers mean in practice.
     - 📌 From HF README `ALL BENCHMARKS`

2. **Key Features / Technical Deep Dive** — 2-3 technical highlights expanded with data
   - Each highlight should be backed by specific numbers or benchmarks, not just described generically
   - Examples: hybrid thinking modes, MoE architecture efficiency, multilingual coverage, tool-calling capability
   - 📌 From HF README, community discussions, web research

3. **How to Access via API** — the practical core section
   - Step-by-step guide (login → model library → API key → code example)
   - Complete working code example (Python, OpenAI SDK), with streaming
   - Pricing info embedded here (not a separate section)
   - 📌 Setup from `--- Novita AI Integration Guide ---`
   - 📌 Pricing from `>>> USE THIS PRICE <<<`

4. **Performance** (compact — 1 paragraph + 1 table)
   - Throughput, latency, TTFT in a single table
   - Brief interpretation, not a deep dive
   - 📌 From `--- HuggingFace Inference Providers ---`

5. **Conclusion + FAQ**

## Constraints

- **Cost comparisons: API pricing and cloud GPU pricing only** — self-hosting/local deployment costs have too many variables (hardware, electricity, cooling); describe qualitatively only, no dollar figures or $/month comparisons
- Education first: explain the model's technical significance before showing how to use it
- Every technical claim backed by data (benchmark scores, param counts, specific numbers)
- Pricing integrated into the API access section, not isolated
- NO separate Limitations or Alternatives sections

## Thesis Template

"[Model] brings [specific capability] to developers — here's what it does and how to start using it on [Platform]"
