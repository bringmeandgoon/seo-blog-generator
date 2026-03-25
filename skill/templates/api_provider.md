# API Provider Article Template

**For articles like: "[Model] API providers", "[Model] API pricing comparison"**

## Sections (in this order)

1. **Model Overview** — Introduction + why API access matters
   - Key specs (params, architecture, context window, modalities)
   - Benchmark table (4-6 key benchmarks with 1-2 reference models)
   - Hardware requirements brief — VRAM numbers that explain why most teams need API access
   - 📌 From HF model card `--- Model ---`, HF README `ALL BENCHMARKS`

2. **How to Choose a Provider** — Selection framework before the comparison
   - 5 key metrics: Max Output, Input Cost, Output Cost, Latency, Throughput
   - Brief explanation of each metric and why it matters
   - Helps readers interpret the comparison table that follows

3. **Provider Comparison** (main table) — All providers side by side
   - Columns: Provider, Input Price, Output Price, Max Output, Latency, Throughput, Context Length
   - At least 3 providers
   - 📌 From `>>> USE THIS PRICE <<<` and `--- OpenRouter Provider Data ---`

4. **Novita AI Deep Dive** — The most detailed provider section
   - Step-by-step setup (login → model library → API key → code example)
   - Complete working code example (Python, OpenAI SDK), with streaming
   - Unique features and advantages
   - 📌 From `--- Novita AI Integration Guide ---`

5. **Cost Analysis** — Monthly cost estimates for different usage tiers (table)
   - 2-3 usage tiers (light / moderate / heavy)
   - Per-provider cost at each tier
   - Highlight the best value option per tier

6. **Conclusion + FAQ**

## Constraints

- **Cost comparisons: API pricing and cloud GPU pricing only** — self-hosting/local deployment costs have too many variables (hardware, electricity, cooling); describe qualitatively only, no dollar figures or $/month comparisons
- Pricing MUST come from pre-search data only — never from memory
- Include at least 3 providers in comparison
- Novita AI section should be the most detailed
- Hardware requirements in Model Overview should naturally motivate API access — not a deep dive (that's VRAM article territory)
- Do NOT include a separate "Provider-by-Provider Breakdown" section — integrate provider details into the comparison table and Novita Deep Dive

## Thesis Template

"For [use case], [provider] offers the best [cost/speed/reliability] trade-off at $X/M tokens"
