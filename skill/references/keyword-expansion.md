# Article Keyword Types and Structures

This file serves as a reference guide for different types of article keywords and their corresponding structures.

**Usage:** The user will provide a model name and a list of specific article keywords. Use this reference to understand what structure and focus each keyword type requires.

**Examples of article keywords user might provide:**
- "MiniMax M2.1 on [Platform]"
- "use MiniMax M2.1 in Cursor"
- "MiniMax M2.1 VRAM"
- "MiniMax M2.1 vs DeepSeek V3"

## Keyword Expansion Strategy

For any given model (e.g., "MiniMax M2.1"), generate article topics covering these categories:

### 1. Platform-Specific Access
Pattern: `[model] on [platform]`

Examples:
- MiniMax M2.1 on Together AI
- MiniMax M2.1 on Replicate
- MiniMax M2.1 on Hugging Face

**Focus:** How to access and use the model on a specific API platform

---

### 2. Tool Integration (Claude Code / Trae / Cursor / etc.)
Pattern: `use [model] in [tool]` or `use [model] in Claude Code and Trae`

Examples:
- use MiniMax M2.1 in Claude Code
- use MiniMax M2.1 in Cursor
- use MiniMax M2.1 in Trae
- use GLM 4.5 with Claude Code and Trae

**Focus:** Prove the model's coding capabilities first, then provide comprehensive tool integration guides

**IMPORTANT:** This is NOT a simple setup tutorial. It follows a proven high-engagement pattern:
1. Validate the model as a capable code agent (benchmarks, tool-call success rate)
2. Explain WHY these tools are the right environment
3. Compare tools (Claude Code vs Trae) with use-case recommendations
4. Provide step-by-step setup for each tool via API provider

---

### 3. Technical Specifications
Pattern: `[model] [specification]`

Examples:
- MiniMax M2.1 VRAM
- MiniMax M2.1 context window
- MiniMax M2.1 speed
- MiniMax M2.1 benchmarks

**Focus:** Deep dive into a specific technical aspect

---

### 4. Access Methods
Pattern: `how to access [model]` or `how to use [model]`

Examples:
- how to access MiniMax M2.1
- how to use MiniMax M2.1
- how to run MiniMax M2.1 locally
- MiniMax M2.1 API

**Focus:** Comprehensive guide to all access methods

---

### 5. API Providers
Pattern: `[model] API provider` or `[model] API`

Examples:
- MiniMax M2.1 API provider
- MiniMax M2.1 API pricing
- best API for MiniMax M2.1
- MiniMax M2.1 API comparison

**Focus:** Compare different API providers offering the model

---

### 6. Model Comparisons
Pattern: `[model A] vs [model B]`

Examples:
- MiniMax M2.1 vs DeepSeek V3
- MiniMax M2.1 vs GLM 4
- MiniMax M2.1 vs Claude Sonnet
- MiniMax M2.1 vs GPT-4

**Focus:** Head-to-head comparison of two specific models

---

### 7. Use Case Specific
Pattern: `[model] for [use case]`

Examples:
- MiniMax M2.1 for coding
- MiniMax M2.1 for translation
- MiniMax M2.1 for RAG
- MiniMax M2.1 for chatbots

**Focus:** How the model performs for a specific application

---

### 8. Deployment Topics
Pattern: `[model] [deployment aspect]`

Examples:
- MiniMax M2.1 local deployment
- MiniMax M2.1 docker
- MiniMax M2.1 quantization
- MiniMax M2.1 optimization

**Focus:** Specific deployment or optimization techniques

---

## Common Keyword Patterns

User may provide keywords following these common patterns:

1. **[Model] on [Platform]** - Platform-specific access guide
2. **use [Model] in [Tool]** - Tool integration guide
3. **[Model] [Specification]** - Technical specification deep dive (e.g., VRAM, context window, speed)
4. **how to access [Model]** - Comprehensive access guide
5. **[Model] API provider** - API provider comparison
6. **[Model] vs [Competitor with exact version]** - Model comparison

**Important for comparisons:**
- User must provide the exact competitor model version (e.g., "DeepSeek V3", not "DeepSeek")
- If competitor version is unclear, ask user to clarify

---

## Article Structure for Each Keyword

Each keyword type has a customized structure:

### Platform-Specific Access Articles

**Title:** `[Model] on [Platform]: Complete Guide`

**Introduction:**
- What the platform offers for this model
- Why developers choose this platform
- What you'll learn in this guide

**Sections:**
1. Platform Overview (brief)
2. Getting Started (account setup)
3. API Usage (code examples)
4. Pricing (specific to platform)
5. Performance Characteristics (on this platform)
6. Limitations and Considerations
7. Alternatives

**Conclusion:** When to use this platform vs alternatives

---

### Tool Integration Articles (use [Model] in Claude Code / Trae / Cursor)

**Title:** `[Model] is [positioning statement]. How to Use It with Claude Code and Trae`

**IMPORTANT: This is NOT a simple setup tutorial. Follow this proven high-engagement structure:**

**Introduction:**
- Model's positioning as a code AI agent (1 sentence)
- Key benchmark results proving coding capability (specific numbers)
- Preview: this guide walks through how to test and run [Model] in [Tool]

**Section 1: Does [Model] Really [Capability Claim]?** (Model Validation)
- Evaluation methodology (which tools were used, how many tasks, what categories)
- Head-to-head performance results vs competitors (win rates with percentages)
- Tool use efficiency metrics (tool calling success rate)
- Token usage / cost efficiency data
- Use specific subsections: "Strong Head-to-Head Performance", "Best Tool Use Efficiency", "Balanced Token Usage"

**Section 2: Why [Model] Works Best with Claude Code or Trae?** (Value Proposition)
- 4-6 numbered reasons with explanations:
  1. Optimized for Agentic Interactions
  2. Rich Toolchains and API Support
  3. High-Fidelity Coding Interfaces
  4. Real-Time Feedback Loops
  5. Scalable Collaboration
  6. Purpose-Built Performance Optimization

**Section 3: Which One Should You Choose: Claude Code or Trae?** (Tool Comparison)
- Brief "What is Claude Code?" description (CLI agentic interface, Anthropic-compatible framework)
- Brief "What is Trae?" description (IDE with GLM/model integration, low-cost, high-performance)
- 4-6 use-case-based comparison scenarios, each with:
  - Scenario title (e.g., "Terminal-Driven Automation & Whole-Repo Workflows")
  - "Preferred: [Tool]" label
  - Why this tool excels for this scenario
  - "Ideal tasks:" list
- Clear summary: "Prefer Claude Code if..." vs "Choose Trae if..."

**Section 4: How to Use [Model] with Claude Code and Trae?** (Setup Guides)
- **Prerequisites**: Get API key from your API provider
  - Step-by-step with numbered steps and screenshot placeholders
  - Include: Log in → Model Library → Choose Model → Start Free Trial → Get API Key → Install API
  - Python code example for API verification
- **Claude Code Guide:**
  - Step 1: Installing Claude Code (npm install command for Windows/Mac/Linux)
  - Step 2: Setting Environment Variables (ANTHROPIC_BASE_URL, ANTHROPIC_AUTH_TOKEN, ANTHROPIC_MODEL, ANTHROPIC_SMALL_FAST_MODEL)
  - Step 3: Starting Claude Code (`cd <project-dir> && claude .`)
  - Step 4: Using in VSCode or Cursor (terminal integration + plugins)
- **Trae Guide:**
  - Step 1: Open Trae and Access Models (Toggle AI Side Bar → AI Management → Models)
  - Step 2: Add Custom Model, Choose Provider, Select Model
  - Step 3: Enter API Key
  - Step 4: Save Configuration

**Conclusion:**
- Model's standout capabilities summary (tool-using intelligence, accuracy, resource balance)
- Tool's key advantages (live editing, multi-model support, zero lock-in)
- Forward-looking statement about flexibility and performance

**FAQ:** (5 questions focused on the model+tool integration)
- What makes [Model] special for coding?
- Why use Trae instead of Claude Code?
- Is [Model] fast and affordable?
- Can I use [Model] with other IDEs?
- What API provider offers the best pricing?

---

### Technical Specification / VRAM Articles

**Title:** `[Model] VRAM Requirements: Complete Guide` or `[Model] [Specification]: Complete Guide`

**Writing style: plain language, like explaining to a colleague. No jargon without explanation. Short sentences. Tables over paragraphs.**

**Introduction:**
- One sentence: what this model is and parameter count
- Quick answer: "Testing: [quant] on [GPU]. Production: [quant] on [GPU]."

**Sections:**
1. Quick Answer callout (one sentence per scenario)
2. Model Introduction (2-3 sentences only)
3. Scenario Decision Table (THE core — Testing / Dev / Production → Quantization → GPU → Cost → Quality Trade-off)
4. Why These Configs (one short paragraph per scenario)
5. API Alternative (for readers who don't want GPUs)
6. Cost Comparison: Self-host vs Cloud GPU vs API (high-level monthly cost table, no electricity/cooling details)
7. Bottom Line callout (one sentence per reader type)

**Conclusion:** One sentence per reader type: hobbyist → API, startup → cloud, enterprise → self-host

---

### Access Methods Articles

**Title:** `How to Access [Model]: Complete Guide`

**Focus: Novita AI API is the recommended path. Others briefly mentioned for context.**

**Introduction:**
- Quick answer: "Novita AI API, OpenAI-compatible, 2 minutes to start"
- Brief model overview (2-3 sentences)

**Sections:**
1. Quick Answer callout (Novita API is the fastest path)
2. Model Introduction (2-3 sentences)
3. Official API (brief mention, 1-2 sentences)
4. Other Third-Party APIs (brief list: name + pricing + one-line differentiator)
5. **Novita AI API (main section)** — pricing, code example, step-by-step setup, streaming
6. Local Deployment (brief: for large models 700B+, state "not practical, use API instead")
7. Comparison table (Method / Setup Time / Cost / Best For)
8. Bottom Line ("For most developers, Novita AI API is the simplest path")

**Conclusion:** Novita API for most, self-host only if [specific condition]

---

### API Provider Comparison Articles

**Title:** `[Model] API Providers: Complete Comparison`

**Introduction:**
- Available API providers overview
- Key selection criteria
- Quick recommendation table

**Sections:**
1. Provider Overview (all providers)
2. Pricing Comparison (table)
3. Feature Comparison (table)
4. Performance Comparison
5. Provider-Specific Details (subsections for each)
6. Decision Framework

**Conclusion:** Which provider for which use case

---

### Model Comparison (VS) Articles

**PREREQUISITE**: Only generate this article type if you discovered specific competitor models with exact version numbers during research.

**Title:** `[Model A Version] vs [Model B Version]: [Strength A] vs [Strength B]`

Examples:
- "MiniMax M2.1 vs DeepSeek V3.2: Agentic Versatility vs Reasoning Power"
- "Qwen 3 30B vs Llama 3.3 70B: Efficiency vs Scale"

**NEVER use generic names:**
- ❌ "MiniMax M2.1 vs DeepSeek"
- ❌ "MiniMax M2.1 vs GLM 4"
- ✅ "MiniMax M2.1 vs DeepSeek V3.2"
- ✅ "MiniMax M2.1 vs GLM-4-Plus"

**IMPORTANT: Follow this proven high-engagement structure (based on reference articles):**

**Introduction (2-3 paragraphs):**
- Opening hook framing the core trade-off: "choosing between [A] and [B] often comes down to: [X] versus [Y]"
- Briefly list what the comparison covers (architecture, benchmarks, hardware, pricing, deployment)
- State who this comparison helps (e.g., "whether you're building autonomous coding agents or scientific reasoning systems")

**Section 1: Quick Answer — Which Model Should You Choose?**
- Two separate recommendation boxes:
  - "Choose [Model A] if you need:" with 4-6 bullet points (specific use cases)
  - "Choose [Model B] if you need:" with 4-6 bullet points (specific use cases)
- This goes BEFORE any deep analysis — readers get the answer immediately

**Section 2: Architecture Comparison**
- Side-by-side specs table: Total Parameters, Active Parameters (per token), Context Length, Precision, Multimodal Support, Release Date
- **Data source: HuggingFace model card (MANDATORY)** — every spec must link to `huggingface.co/ORG/MODEL`
- If a model has variants (e.g., DeepSeek V3.2 Standard / Speciale / Thinking / Exp), add a separate "Variant Breakdown" subsection explaining each one
- **🚫 NEVER use llm-stats.com, aicybr.com, or similar aggregators as source for architecture specs**

**Section 3: Benchmark Comparison**
- Group benchmarks into multiple focused tables (don't dump everything into one):
  - Table 1: Coding agent benchmarks (SWE-bench Verified, Multi-SWE-bench, SWE-bench Multilingual, Terminal-bench)
  - Table 2: Framework-specific (Droid, mini-swe-agent, SWT-bench, OctoCodingbench)
  - Table 3: Reasoning benchmarks (AIME 2025, GPQA, LiveCodeBench, MMLU Pro, HLE)
- **Data source: HuggingFace model card or official benchmark leaderboard (MANDATORY)** — every score must link to HF or swe-bench.com/lmarena.ai/etc.
- Include a third "reference" column (e.g., Claude Opus 4.5) for context
- Add brief analysis paragraphs between tables explaining what the numbers mean
- **Every cell must contain a specific number or "Not disclosed"** — NO vague descriptions like "Strong performance noted" or "Available on llm-stats"
- **🚫 NEVER use third-party blog posts (aicybr.com, wavespeed.ai, etc.) as source for benchmark numbers**

**Section 4: VRAM & GPU Requirements**
- **Separate subsections per model** — "Recommended GPU for [Model A]" and "Recommended GPU for [Model B]"
- For each model: Best practical choice → Cost-efficient alternative → Not recommended option
- Specific GPU configurations (e.g., "4× H100 80GB", "4× L40S 48GB INT4/INT8")
- Clear winner statement: "[Model A] is the clear winner if you want a realistic 'personal production agent' model"
- GPU pricing reference (on-demand vs spot instances)

**Section 5: Cost Analysis**
- Per-token pricing comparison (input/output costs per 1M tokens)
- Provider comparison: which providers offer each model and at what price
- Clear recommendation: "Choose [A] for output-heavy workloads, [B] for input-heavy workloads"

**Section 6: How to Access**
- API setup via your API provider with Python code example
- OpenAI Agents SDK integration option
- Third-party platform connections (Hugging Face, LangChain, Claude Code, Cursor, Trae)

**Conclusion (2-3 paragraphs):**
- Summarize: "For [use case], choose [Model]. For [other use case], choose [other Model]."
- Mention variant selection if applicable (e.g., "Standard for daily use, Speciale for maximum reasoning")

**FAQ:** (5 questions)
- Which is better for coding agents?
- Which is stronger for math/reasoning?
- Which is easier to deploy?
- Which is cheaper?
- Can I run [Model] on [specific GPU]?

---

## Multi-Article Generation Workflow

### Step 1: Research Core Model
Conduct comprehensive research on the core model to gather all module content.

### Step 2: Generate Content Modules
Create all relevant content modules for the core model (as per main workflow).

### Step 3: Receive User's Article List
User provides the specific article keywords they want generated.

### Step 4: Generate Articles
For each keyword provided by user:
1. Determine which content modules are relevant
2. Conduct keyword-specific research if needed
3. Select appropriate article structure from templates above (based on keyword type)
4. Write introduction tailored to the keyword
5. Assemble relevant content modules
6. Add keyword-specific sections if needed
7. Write conclusion with keyword-specific recommendations
8. Generate FAQ (5 questions specific to this keyword)
9. Generate 10 SEO titles

### Step 5: Output All Articles
Present all articles clearly labeled with their target keywords.

---

## Example Output Structure

**User Input:**
```
Model: MiniMax M2.1

Articles:
1. MiniMax M2.1 on Together AI
2. use MiniMax M2.1 in Claude Code
3. MiniMax M2.1 VRAM
4. how to access MiniMax M2.1
5. MiniMax M2.1 API provider
6. use MiniMax M2.1 in Cursor
7. MiniMax M2.1 vs DeepSeek V3
8. MiniMax M2.1 vs GLM-4-Plus
```

**Output:** 8 complete articles

```
# Article 1: MiniMax M2.1 on Together AI

## Introduction
[2-3 paragraphs highlighting pain points and article value]

## [Article Body Sections]
[1000-2000 words using relevant content modules]

## Conclusion
[2-3 paragraphs with recommendations]

## FAQ
[5 questions with brief answers]

## SEO Titles
[10 title variations, ≤10 words each]

---

# Article 2: Use MiniMax M2.1 in Claude Code

[Same structure]

---

[... continues for all 8 articles ...]
```

Each article is:
- Complete and self-contained
- 1000-2000 words
- Includes Introduction, Conclusion, FAQ (5 questions), and SEO titles (10 variations)
- Optimized for the specific keyword provided by user
- Uses relevant content modules from the master set

---

## Research Considerations

### Platform Availability
Not all platforms support all models. When user requests "[Model] on [Platform]" article:
- Verify the platform actually supports this model
- If not available, inform the user and suggest alternatives

### Tool Integration
When user requests "use [Model] in [Tool]" article:
- **Use split-search strategy** — don't rely on one combined search:
  1. Search the model name alone first (specs, coding capabilities, benchmarks)
  2. Search the tool alone (Claude Code setup, Trae custom model guide)
  3. Search the combination (may have sparse results, that's OK)
  4. Check known sources: unsloth.ai/docs/models/, official tool docs, Reddit
- Check if official integration exists
- If not, provide API-based workarounds (via third-party API providers)
- Include setup complexity and limitations

### Competitor Comparisons
When user requests "[Model A] vs [Model B]" article:
- Ensure you have exact version numbers for both models
- If competitor version is unclear (e.g., "GPT-4" without specific version), ask user to clarify
- Research both models thoroughly before writing comparison
- Verify benchmark data is available for both

### Specification / VRAM Articles
When user requests "[Model] VRAM" or "[Model] [Specification]" article:
- Quick Answer first: one sentence per scenario (testing/production)
- Model intro: 2-3 sentences max (what it is, param count, why run locally)
- **Scenario Decision Table is the core** — map use cases to quantization + GPU + cost + quality trade-off
- Use actual quant options from research data (HF + Unsloth docs)
- GPU configs with Novita cloud pricing (RTX 5090 $0.63/hr, RTX 4090 $0.67/hr, H100 $1.45/hr)
- One paragraph per scenario explaining why that config
- API alternative for readers who don't want GPUs
- High-level cost comparison table (Self-host vs Cloud vs API monthly cost), no electricity/cooling/noise details
- **Write in plain language** — like explaining to a colleague, not writing a research paper
- Verify VRAM data from HuggingFace + Unsloth docs
