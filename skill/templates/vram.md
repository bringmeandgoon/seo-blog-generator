# VRAM / Hardware Requirements Article Template

**For articles like: "[Model] VRAM requirements", "[Model] GPU guide", "[Model] hardware requirements"**

## Sections (in this order)

1. **Model Overview** — Architecture and why VRAM matters for this model
   - Key technical innovations (MoE/MLA/MTP/dense vs sparse, etc.) with brief explanation
   - Parameter count, active params, architecture type
   - Why this model's architecture affects VRAM requirements
   - 📌 From HF model card `--- Model ---`, HF README

2. **VRAM Requirements by Quantization** (table) — The core data section
   - BF16 (full precision), FP8/Q8_0 (8-bit), Q4_K_M, Q2_K with exact VRAM numbers
   - ALWAYS include 8-bit as the most common production precision
   - FP8 / 8-bit VRAM: use the Q8_0 size from the Unsloth GGUF repo (file size ≈ minimum VRAM)
   - 📌 From `--- Unsloth GGUF Quantization Sizes ---`

3. **GPU Recommendations** (decision table) — Scenario → GPU → Quantization → Cost
   - Testing / Production / Budget tiers
   - 📌 GPU pricing from `--- Novita AI GPU Instance Pricing ---`

4. **Running Locally: Challenges** — Practical pain points of local deployment
   - Consumer hardware limitations
   - Setup complexity (dependencies, weight conversion, etc.)
   - Performance bottlenecks on underpowered devices
   - Natural transition to API alternative

5. **API Alternative** — Skip hardware, use API instead
   - Step-by-step API access (login → model library → API key → code example)
   - Pricing info embedded here
   - 📌 From `>>> USE THIS PRICE <<<`

6. **Conclusion + FAQ**

## Constraints

- Use plain language: "you need X GB of VRAM" not "the model requires X GB"
- Always include API as the easiest alternative
- GPU recommendations may include specific instance types and hourly costs
- **NO quantitative cost comparisons** between deployment methods (no "$X/month vs $Y/month", no "N% cheaper"). Use qualitative descriptors only: "CapEx (hardware)", "Pay-per-token", "OpEx (GPU instances)"

## Thesis Template

"To run [Model]: testing needs [GPU], production needs [GPU]. Here's exactly what to pick."
