# VS Comparison Article Template

**For articles like: "[Model A] vs [Model B]"**

## Sections (in this order)

1. **Model Overview** — Both models introduced with detailed spec tables
   - Each model gets its own spec table: params, architecture, context window, modalities, language support, training method, license
   - 📌 From HF model cards `--- Model ---`

2. **Benchmark Comparison** (table) — Key benchmarks side by side (pick 6-8 most relevant)
   - Include pricing row in the same table or as a separate compact table
   - 📌 From HF README `ALL BENCHMARKS`
   - 📌 Pricing from `>>> USE THIS PRICE <<<`

3. **Speed & Performance** — Throughput, latency, TTFT comparison
   - Table or playground screenshot comparison
   - 📌 From `--- HuggingFace Inference Providers ---`

4. **Hardware Requirements** — VRAM comparison table
   - By quantization level or context length
   - 📌 From `--- Unsloth GGUF Quantization Sizes ---`

5. **Use Case Recommendations** — When to choose Model A vs Model B
   - Scenario-based: coding, reasoning, multimodal, budget, hardware constraints
   - Each model gets a bullet list of best-fit scenarios

6. **Head-to-Head Tasks** — Same prompt, both models, compare results
   - 2-3 tasks (e.g. logical reasoning, coding, creative writing)
   - Each task: prompt → Model A result → Model B result → review/verdict
   - Show real differences, not just benchmark numbers
   - 📌 From web research, community testing, or direct comparison data

7. **How to Access via API** — Step-by-step Novita AI access
   - Login → model library → API key → code example
   - Pricing embedded here
   - 📌 Setup from `--- Novita AI Integration Guide ---`

8. **Conclusion + FAQ**

## Constraints

- **Cost comparisons: API pricing and cloud GPU pricing only** — self-hosting/local deployment costs have too many variables (hardware, electricity, cooling); describe qualitatively only, no dollar figures or $/month comparisons
- MUST have a clear verdict/thesis — never "both are good, it depends"
- Every comparison claim must cite specific numbers
- Minimum 2 comparison tables
- Head-to-Head Tasks section should demonstrate real practical differences

## Thesis Template

"[Model A] is the better choice for [scenario X] because [data point]; choose [Model B] when [scenario Y]"
