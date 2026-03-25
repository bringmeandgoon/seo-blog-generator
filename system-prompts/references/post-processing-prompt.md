# Post-Processing Prompt Template

After generating the main article body, use this prompt to generate Introduction, Conclusion, FAQ, and SEO titles.

---

## The Prompt

```
Please generate three core modules in English based on the provided article content: Introduction, Conclusion, and FAQ. Requirements:

1. **Introduction**
   - Highlight pain points: Precisely extract the core challenges/confusion users face in the article's topic scenario
   - Clearly state from which dimensions and through what methods this article will help users solve these problems
   - Set the stage for the full content
   - Length: 2-3 paragraphs maximum

2. **Conclusion**
   - Concise and condensed
   - Highly summarize the article's core viewpoints and value
   - Avoid redundant information
   - Length: 2-3 paragraphs maximum

3. **FAQ**
   - Design practical questions and answers around the article's key information
   - Each question OR answer MUST fully mention the model name with **EXACT version number** (e.g., "MiniMax M2.1" NOT "MiniMax M2", "DeepSeek V3.2" NOT "DeepSeek V3")
   - Ensure information precisely matches the original text
   - **MUST BE EXTREMELY BRIEF — 1-2 sentences per answer MAXIMUM. No padding, no filler.**
   - 5 questions total

---

Please also generate 10 English SEO titles that strictly follow these specifications:

- **Keyword-first**: Begin with the target keyword (MUST include specific model version/numbers, e.g., "Llama 3.3 70B", "DeepSeek V3 0324", "Gemma 3 27B")
- **Problem-driven**: Use question format when appropriate ("Why...", "What...", "How Many...", "How Much..."), or highlight a specific challenge/pain point
- **Concrete value**: Include specific numbers, comparisons, or outcomes (e.g., "35GB vs 148GB", "3 Ways", "Top 5")
- **Real constraints**: Add practical context ("Home Servers", "RTX 4090", "Production", "Developers")
- **Format constraint**: Each title strictly limited to 10 words maximum
- **Proven high-engagement patterns** (use these templates):

  **For VRAM/Hardware articles (HIGHEST PRIORITY):**
  - "Why [Model Version] VRAM Requirements Are a Challenge for [Context]"
  - "What Are the VRAM Requirements for [Model Version]?"
  - "How Many [GPU Type] GPUs Are Needed to [Task] [Model]?"
  - "[Model] on [GPU]: [Metric] Analysis"
  - "How Much VRAM Does [Model Version] Actually Need?"

  **For How to Access articles:**
  - "How to Access [Model]: [Adjective] Guide to [Unique Angle]"
  - "[Number] Ways to Access [Model]: [Method 1], [Method 2], [Method 3]"
  - "How to Access [Model] Locally or via API: Complete Guide"

  **For VS Comparison articles:**
  - "[Model A Version] vs [Model B Version]: [Angle A] vs [Angle B]"
  - "[Model A] vs [Model B]: Comparing [Dimension 1] and [Dimension 2]"
  - "[Model A] vs [Model B]: [Use Case Difference]"

  **For Function Calling articles:**
  - "[Model] + Function Calling: [Impact/Application Area]"
  - "[Model] Function Calling: From [Start] to [End]"
  - "Your Handbook for [Model] Function Calling: [Coverage]"

  **For Tool Integration articles (Claude Code / Trae):**
  - "[Model]: How to Use It with Claude Code and Trae"
  - "How to Use [Model] in Claude Code: Complete Setup Guide"
  - "[Model] in Trae: [Capability] for Developers"
  - "[Model] + Claude Code: [Number] Coding Tasks Benchmarked"
  - "Claude Code or Trae? Best Way to Run [Model]"
  - "[Model] as Code Agent: Claude Code and Trae Guide"

  **For API Provider articles:**
  - "[Model] API Providers: Top [Number] Choices for Developers"
  - "Best [Number] [Model] API Providers: [Criterion 1], [Criterion 2]"

---

Article content:

[INSERT FULL ARTICLE HERE]
```

---

## Usage Instructions

1. **After generating an article**, copy the full article content
2. **Use the prompt above**, replacing `[INSERT FULL ARTICLE HERE]` with the actual article
3. **Submit to the model** to generate the post-processed elements
4. **Insert the generated content** into the appropriate positions in the article

---

## Output Format Expected

The prompt will generate output in this structure:

### Introduction

[2-3 paragraphs with pain points and article preview]

### Conclusion

[2-3 paragraphs summarizing key points and recommendations]

### FAQ

**Q1: [Question mentioning model name with EXACT version]**
A: [1-2 sentences MAX. No filler.]

**Q2: [Question]**
A: [1-2 sentences mentioning model name with EXACT version. No filler.]

**Q3: [Question mentioning model name with EXACT version]**
A: [1-2 sentences MAX. No filler.]

**Q4: [Question]**
A: [1-2 sentences mentioning model name with EXACT version. No filler.]

**Q5: [Question mentioning model name with EXACT version]**
A: [1-2 sentences MAX. No filler.]

### SEO Titles

1. [Keyword-first title, ≤10 words]
2. [Keyword-first title, ≤10 words]
3. [Keyword-first title, ≤10 words]
4. [Keyword-first title, ≤10 words]
5. [Keyword-first title, ≤10 words]
6. [Keyword-first title, ≤10 words]
7. [Keyword-first title, ≤10 words]
8. [Keyword-first title, ≤10 words]
9. [Keyword-first title, ≤10 words]
10. [Keyword-first title, ≤10 words]

---

## Example: MiniMax M2.1 VRAM Article

**Input:** [Full article about MiniMax M2.1 VRAM requirements]

**Expected Output:**

### Introduction

Deploying large language models locally presents a critical challenge: determining the exact hardware requirements. Many developers waste resources by over-provisioning GPUs or encounter runtime failures from insufficient VRAM. This article provides a comprehensive analysis of MiniMax M2.1's memory requirements across different quantization levels, helping you select the optimal GPU configuration for your deployment scenario. We cover full-precision, 8-bit, and 4-bit configurations, along with practical recommendations for consumer and enterprise hardware.

### Conclusion

MiniMax M2.1's flexible memory requirements make it accessible across a wide range of hardware configurations. With 4-bit quantization, the model runs on consumer GPUs like the RTX 4090, while full precision requires enterprise-grade solutions like the A100. For most production use cases, 8-bit quantization provides the optimal balance of quality and accessibility, requiring 35GB VRAM with minimal performance degradation. Choose your configuration based on your quality requirements, budget constraints, and deployment scale.

### FAQ

**Q1: What is the minimum VRAM required to run MiniMax M2.1?**
A: MiniMax M2.1 requires a minimum of 16GB VRAM with 4-bit quantization; 35GB (INT8) is recommended for production.

**Q2: Can MiniMax M2.1 run on a single RTX 4090?**
A: Yes, RTX 4090 (24GB) runs MiniMax M2.1 with 4-bit quantization at ~2-3% quality loss.

**Q3: How does MiniMax M2.1's VRAM compare to similar models?**
A: MiniMax M2.1 requires ~70GB at full precision, comparable to other 70B models like Llama 2 70B.

**Q4: What GPU is best for MiniMax M2.1 in production?**
A: NVIDIA A100 80GB or H100 80GB with INT8 quantization delivers optimal production performance for MiniMax M2.1.

**Q5: Does MiniMax M2.1 support CPU inference?**
A: Yes, but at only 1-3 tokens/s—suitable only for non-interactive, single-user MiniMax M2.1 deployments.

### SEO Titles

1. Why MiniMax M2.1 70B VRAM Requirements Challenge Home Servers
2. What Are the VRAM Requirements for MiniMax M2.1?
3. How Many H100 GPUs Needed to Run MiniMax M2.1?
4. MiniMax M2.1 70B on RTX 4090: GPU Memory Analysis
5. How Much VRAM Does MiniMax M2.1 70B Need?
6. MiniMax M2.1 Hardware Requirements: 35GB vs 70GB Options
7. Fine-Tuning MiniMax M2.1 on RTX 4090: VRAM Guide
8. MiniMax M2.1 70B GPU Requirements for Production Deployment
9. What GPU for MiniMax M2.1: Complete Hardware Guide
10. MiniMax M2.1 Quantization: INT8 vs INT4 VRAM Comparison

---

## Quality Checklist

Before accepting generated output, verify:

### Introduction
- [ ] Clearly identifies user pain points
- [ ] Explains how the article addresses these pain points
- [ ] Sets appropriate expectations for article content
- [ ] 2-3 paragraphs maximum
- [ ] No redundancy with article body

### Conclusion
- [ ] Summarizes core insights concisely
- [ ] Provides clear, actionable recommendations
- [ ] Avoids introducing new information
- [ ] 2-3 paragraphs maximum
- [ ] Reinforces article value proposition

### FAQ
- [ ] All 5 questions are practical and relevant
- [ ] Each question OR answer mentions the model name with **EXACT version number**
- [ ] **Answers are 1-2 sentences MAXIMUM — no padding, no filler**
- [ ] Questions address common user concerns
- [ ] Answers provide specific, actionable information

### SEO Titles
- [ ] All 10 titles are unique and diverse
- [ ] Each title ≤10 words
- [ ] Keyword appears at the beginning
- [ ] Clear value proposition or pain point
- [ ] Natural, professional English phrasing

---

## Integration with Main Workflow

This post-processing step occurs AFTER the main article body is generated:

1. Generate content modules (Steps 1-3 of main workflow)
2. Expand keywords and generate articles (Step 4 of main workflow)
3. **Apply post-processing prompt** (this step)
4. Insert generated Introduction, Conclusion, FAQ, and select best title
5. Final article is complete and ready for publication

---

## Customization Notes

The prompt template can be customized for specific requirements:

- **Adjust FAQ count**: Change from 5 to 3-7 questions based on article length
- **Modify title count**: Generate 5, 10, or 20 titles depending on A/B testing needs
- **Add meta description**: Include request for 150-160 character meta description
- **Add internal linking**: Request suggestions for related articles to link to

Simply modify the prompt template above before using it.
