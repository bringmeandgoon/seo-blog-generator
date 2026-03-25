# Style Examples and Formatting Guidelines

This file demonstrates the writing style, formatting conventions, and quality standards for developer-focused technical content.

## Core Style Principles

### 0. Find the Story, Not the Spec Sheet

**The #1 Problem**: Writing articles that just list features and benchmarks without identifying what makes this model uniquely interesting or valuable.

**Good (Has a clear angle):**
> Qwen 3 30B A3B delivers 10× faster inference than QWQ 32B while using identical VRAM. This speed advantage comes from A3B's distilled architecture, which eliminates QWQ's token-heavy chain-of-thought reasoning while preserving 95% of accuracy on coding tasks.

**Bad (Just stacking facts):**
> Qwen 3 30B A3B is a new model from Alibaba. It has 30 billion parameters. It's fast and efficient. It performs well on benchmarks. It uses the A3B architecture.

**How to Find the Angle:**
1. **Read Reddit threads** - What are developers debating? What surprised them?
2. **Look for contradictions** - Does it break conventional wisdom? (e.g., "smaller but faster")
3. **Identify specific pain points it solves** - Not generic use cases
4. **Find the trade-off** - What does it sacrifice to gain its advantage?
5. **Look for unexpected comparisons** - Developer communities naturally compare models; follow their lead

**High-engagement angles from real articles:**
- Hardware limitations ("Why X VRAM Requirements Are a Challenge")
- Unexpected performance ("30B Crushes 32B at Same Memory")
- Decision guidance ("Which X Model Is Right for You")
- Practical constraints ("Speed or Accuracy: Choose Your Trade-off")

### 1. Concise and Data-Driven

**Good:**
> Llama 3.1 405B achieves 89.0% on HumanEval, outperforming GPT-4 (86.6%) on code generation benchmarks.

**Bad:**
> Llama 3.1 405B is incredibly powerful and performs really well on coding tasks, showing amazing results that developers will love.

### 2. Clear Explanations of New Concepts

**Good:**
> Mixture-of-experts (MoE) architecture activates only a subset of model parameters for each input, reducing computational cost while maintaining large total capacity. In Mixtral 8x7B, each token routes through 2 of 8 expert networks.

**Bad:**
> Mixtral uses MoE architecture which is better for performance.

### 3. Scannable Structure

**Good:**
```markdown
## Hardware Requirements

Llama 2 70B requires high-end GPUs for local deployment.

### VRAM Requirements

| Configuration | VRAM | Quality |
|---------------|------|---------|
| FP16          | 140 GB | Full precision |
| 8-bit         | 70 GB  | Minimal loss |
| 4-bit         | 35 GB  | Slight loss |
```

**Bad:**
```markdown
## Hardware

If you want to run Llama 2 70B you'll need a lot of VRAM. The exact amount depends on the quantization method you use. With FP16 you need 140 GB, with 8-bit quantization you need around 70 GB, and with 4-bit quantization it's about 35 GB.
```

## Formatting Standards

### Quotable Summaries

Every H2 or H3 heading should be followed immediately by a 1-2 sentence summary that can stand alone.

**Example:**
```markdown
## API Providers

Claude is available through Anthropic's API, AWS Bedrock, and Google Cloud Vertex AI with varying pricing and feature sets.

[Rest of section content...]
```

### Lists Over Paragraphs

Use bullet points or tables for structured information.

**Good:**
```markdown
**Key Strengths:**
- Extended 200K context window with strong recall
- Superior performance on coding and technical analysis
- Built-in support for tool use and function calling
```

**Bad:**
```markdown
The model has several key strengths including an extended 200K context window with strong recall across long documents. It also offers superior performance on coding and technical analysis tasks. Additionally, it has built-in support for tool use and function calling.
```

### Tables for Comparisons

Use markdown tables for side-by-side comparisons.

**Example:**
```markdown
| Feature | GPT-4 | Claude Opus | Gemini Ultra |
|---------|-------|-------------|--------------|
| Context | 128K  | 200K        | 1M           |
| Vision  | Yes   | Yes         | Yes          |
| Price/1M| $30   | $15         | $7.50        |
```

### No Decorative Elements

**Avoid:**
- Arrows (→, ⇒)
- Stars (★, ✨)
- Checkmarks (✓, ✔)
- Other decorative symbols

**Exception:** Unicode symbols in code blocks or when describing UI elements are acceptable.

## Section Quality Examples

### Model Overview - Good Example

```markdown
## Model Overview

Mistral 7B is an open-weight language model delivering GPT-3.5-level performance at 7 billion parameters.

- **Developer:** Mistral AI
- **Release Date:** September 2023
- **Primary Use Cases:** Code generation, text completion, chatbots, RAG applications, instruction following
- **Key Differentiator:** Sliding window attention mechanism enabling efficient 32K context handling at 7B scale
```

### Benchmarks - Good Example

```markdown
## Benchmarks

Claude Opus 3 delivers frontier-level performance across reasoning, coding, and multilingual tasks.

| Benchmark | Claude Opus 3 | GPT-4 | Gemini Ultra |
|-----------|---------------|-------|--------------|
| MMLU      | 86.8%         | 86.4% | 90.0%        |
| HumanEval | 84.9%         | 67.0% | 74.9%        |
| GSM8K     | 95.0%         | 92.0% | 94.4%        |
| MATH      | 60.1%         | 52.9% | 53.2%        |

**Key Strengths:** Graduate-level reasoning, complex code generation, multilingual understanding
**Considerations:** Higher cost compared to Sonnet and Haiku tiers; longer latency for complex reasoning chains
```

### Hardware Requirements - Good Example

```markdown
## Hardware Requirements

Llama 3.1 8B runs efficiently on consumer GPUs and high-end laptops.

### VRAM Requirements

| Configuration | Precision | VRAM Required | Performance Level |
|---------------|-----------|---------------|-------------------|
| 8B            | FP16      | 16 GB         | Full precision    |
| 8B            | 8-bit     | 8 GB          | <1% quality loss  |
| 8B            | 4-bit     | 4 GB          | ~2% quality loss  |

### GPU Recommendations

- **Minimum:** RTX 3060 (12 GB) with 8-bit quantization
- **Recommended:** RTX 4070 or A4000 for production workloads
- **Optimal:** RTX 4090 or A5000 for multi-user serving

**CPU Inference:** Viable on modern CPUs (5-15 tokens/s on M2 Pro/M3 chips). Suitable for low-latency, single-user applications.
```

## Tone and Voice

### Technical but Accessible

**Good:**
> The model employs rotary position embeddings (RoPE) which encode positional information through rotation matrices rather than additive position vectors. This enables better extrapolation to longer sequence lengths than the model encountered during training.

**Too Jargon-Heavy:**
> The model leverages RoPE via SO(d) rotation matrices in the complex plane for position-aware self-attention.

**Too Casual:**
> The model uses a cool trick called RoPE that helps it handle longer text than it was trained on.

### Opinionated but Fair

**Good:**
> Mistral 7B offers the best performance-to-resource ratio for developers who need local deployment. However, teams requiring enterprise support and uptime SLAs should consider managed API alternatives.

**Too Neutral:**
> Mistral 7B can be deployed locally or accessed via APIs. Different teams have different needs.

**Too Biased:**
> Mistral 7B is clearly the best choice for all developers. There's no reason to consider anything else.

## Common Pitfalls to Avoid

### ❌ Information Dumping Without Insight

**Bad (Just stacking specs):**
> MiniMax M2.1 has 70 billion parameters. It supports multiple languages. The context window is 128K tokens. It's available via API. It performs well on benchmarks.

**Good (Has insight and angle):**
> MiniMax M2.1's 128K context window costs 40% less per token than GPT-4 Turbo, making it viable for document processing pipelines that previously required expensive embedding strategies. This pricing advantage comes at the cost of slightly lower accuracy on complex reasoning tasks (82% vs 86% on MMLU).

### ❌ Generic Praise

**Bad:** "This amazing model delivers incredible performance that will revolutionize your workflow."

**Good:** "This model achieves 89% on HumanEval, a 12-point improvement over the previous version."

### ❌ Missing Context

**Bad:** "The model supports function calling."

**Good:** "The model supports OpenAI-compatible function calling, enabling structured output for API integration, database queries, and tool use."

### ❌ Vague Comparisons

**Bad:** "Faster than competitors."

**Good:** "Achieves 150 tokens/s on A100, compared to 100 tokens/s for Llama 2 70B at equivalent quality."

### ❌ Missing the "Why It Matters"

**Bad:** "The model uses mixture-of-experts architecture with 8 experts."

**Good:** "The model uses mixture-of-experts architecture with 8 experts, activating only 2 per token. This reduces inference cost to match a 12B dense model while maintaining 47B-class performance on coding tasks."

### ❌ Ignoring Real Developer Concerns

**Bad:** "This model is great for production use cases."

**Good:** "Reddit users report this model handles API rate limiting poorly compared to alternatives, requiring custom retry logic. However, its 50ms lower latency makes it ideal for customer-facing chatbots where response time matters more than error handling elegance."

### ❌ Outdated Assumptions

**Bad:** "Most developers use OpenAI's API."

**Good:** "As of January 2025, developers commonly evaluate multiple providers including OpenAI, Anthropic, Groq, and Together AI based on latency and cost requirements."

## Code Example Standards

### Include Realistic, Working Code

**Good:**
```python
import anthropic

client = anthropic.Anthropic(api_key="your-api-key")

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Explain async/await in Python"}
    ]
)

print(message.content[0].text)
```

**Bad:**
```python
# Initialize the API
model = Claude()
response = model.generate("Your prompt here")
print(response)
```

### Show Common Integration Patterns

Include examples for:
- Basic API usage
- Streaming responses
- Error handling
- Rate limiting strategies
- Production deployment patterns

## Fact-Checking Requirements

Every factual claim must be either:
1. Sourced from official documentation
2. Derived from public benchmarks
3. Tested and verified firsthand
4. Attributed to credible third-party analysis

**Never:**
- Guess at specifications
- Extrapolate benchmarks without evidence
- State opinions as facts
- Use outdated information without noting the date
