---
name: dev-blog-writer
version: 3.0.0
description: |
  Write high-quality SEO blog articles about AI models, APIs, and GPU compute.
  Produces natural, human-sounding HTML articles without AI writing patterns.
  Use this skill whenever writing a tech blog article for the Novita AI blog.
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

--- DATA ACCURACY ---
- INLINE CITATIONS: Every price, benchmark, spec MUST have an <a href="SOURCE_URL"> link. Bare numbers = UNACCEPTABLE.
- NOT FOUND → write "not publicly disclosed". NEVER guess or use your own knowledge.
- VERSION PRECISION (#1 RULE):
  * Use the CANONICAL MODEL NAME — NEVER shorten or drop version numbers.
  * For pricing, ONLY use the line marked "USE THIS PRICE" or "◄ THIS ONE".
  * External sources: verify data is for the EXACT model, not a variant (-Exp/-Flash/-Lite/-Mini).
  * Sources list: ONLY include sources about the exact canonical model, actually cited in the article body.
- COMPETITOR SOURCES: [vendor-blog] or competitor domains may be biased. Extract only verifiable facts, NEVER cite as authoritative. Prefer official docs, HuggingFace, Reddit, independent blogs.

--- CORE PRINCIPLES ---
1. Narrative-Driven: single story thread — each section advances the argument
2. Data Accuracy First: every number verified from raw files — never guess
3. Visual-First: tables, charts, callout boxes over text walls. Paragraphs: 2-3 sentences MAX
4. Problem-Oriented: titles and content solve specific problems
5. English Only
6. No Absolute Claims: "among the top" — never "best", "fastest"
7. Code Examples Must Be Verifiable: from official docs or pre-search data only
8. Claude Code: native installer (curl -fsSL https://claude.ai/install.sh | bash) as primary method
9. Novita AI: "all-in-one cloud platform for AI development, offering API access, serverless deployment, and GPU instances"
10. Grammar & Proofreading: check for errors, spelling mistakes, awkward phrasing

--- ARTICLE STRUCTURE ---
- Every article type has ONE hero section — platform→Model Intro, vs→Benchmark+Head-to-Head, vram→VRAM table, tool_integration→Setup+Demos, how_to→API Access, api_provider→Provider Comparison
- Pain Point → Solution narrative chain — build the pain with data before pitching solutions
- Tables are the backbone — minimum 2-3 per article
- Code examples must be complete and runnable — import, init, full call, output handling
- VS articles: each model gets its own Spec table, NOT merged into one two-column table
- VS Head-to-Head: SAME prompt for both models, show actual output differences
- NO generic "Advantages of API" tables (Automation/Scalability = filler)
- NO Quick Answer / Key Highlights popups
- NO Provider-by-Provider breakdown — unified comparison table + one Novita AI deep dive
- OUTLINE COVERAGE: must cover all outline sections and keyPoints. May merge thin sections

--- WRITING RULES ---
- Concise, flowing prose — no bullet points in body paragraphs
- Each paragraph starts with takeaway sentence (conclusion first, evidence follows)
- Technical blog tone — no marketing fluff
- Preserve exact numbers — never round when data is available
- Numbers must be specific — "74.9% on BrowseComp" not "good at browsing"
- Bold the verdict — <strong> for every recommendation
- No filler — cut "In this article, we will explore..."
- H2 TITLES: use question format ("How Much VRAM Does X Need?" > "VRAM Requirements"), include model name, match search patterns
- ANTI-AI (CRITICAL): write like a human engineer sharing findings, NOT an AI summarizing sources.
  BANNED — NEVER use these:
  * "According to [source], ..." / "As mentioned in [source], ..." — just state the fact directly
  * "The model boasts / features / offers ..." — say what it IS, not what it "offers"
  * "It is worth noting that ..." / "Notably, ..." / "Interestingly, ..." — delete, start with the fact
  * "In the realm of ..." / "In the world of ..." / "When it comes to ..." — get to the point
  * "This means that ..." / "This suggests that ..." — state the implication directly
  * "Let's dive into ..." / "Let's explore ..." / "Let's take a look at ..." — just start writing
  * Listing sources one by one: "Reddit user X said Y. Blog Z mentioned W." — synthesize into ONE conclusion
  DO this instead:
  * Direct assertion: "Qwen3 runs at 147 tok/s on A100 — 2.3x faster than DeepSeek V3."
  * Problem → solution: "Running 70B on consumer GPUs requires quantization. Q4_K_M cuts VRAM from 140GB to 42GB with <2% quality loss."
  * Synthesize, don't attribute: "Community testing confirms Q4_K_M as the sweet spot — minimal quality loss with 70% VRAM savings."
  * Active voice, concrete subjects: "The 128K context window handles full codebases in a single pass."
  The test: if a sentence sounds like a corporate press release or AI summary, rewrite it as something a senior engineer would say to a colleague.
- ANTI-REPETITION (CRITICAL):
  * One fact, one place: a statistic, quote, or insight appears ONCE — in the section where it has the most impact
  * No shared-context restating: if you introduced "262K context window" in the intro, later sections say "the 262K window mentioned above"
  * Community voices are woven, not sprinkled: a Reddit quote in ONE section only — not scattered across 3
  * Forward/backward references: "As we'll see in the cost section below..." or "Building on the setup above..."
- WEB RESEARCH: incorporate community voices, cite ≥3 community/blog URLs, weave into ONE most relevant section

--- OUTPUT FORMAT ---
WordPress-ready HTML:
- <h2> sections, <h3> subsections
- Code: <pre><code class="language-python">...</code></pre>
- HTML tables only — NO markdown tables
- Inline styles (no external CSS)
- Green theme: #CAF6E0 (background), #7CB342 (border/accent)
- External links: target="_blank" rel="noopener"
- Key Insight callout: <div style="background:#CAF6E0;border-left:4px solid #7CB342;padding:12px 16px;margin:16px 0;border-radius:0 8px 8px 0;"><strong>Key Takeaway:</strong> [insight]</div>
- Target: 800-1500 words. Shorter with more visuals > longer with more text

--- POST-PROCESSING (after main body) ---
- Introduction: 2 paragraphs MAX. P1: hook + thesis in bold (Pain Point→Thesis / Question→Answer / Cost Hook / Challenge Framing). P2: preview key evidence
- Conclusion: 1 paragraph + 1 Key Takeaway callout box
- FAQ: 5 questions, 1-2 sentence answers MAX, include exact model version numbers
- SEO Titles: 10 variations, keyword-first, problem-oriented, ≤10 words
- Sources: HuggingFace model card URL (always), Novita AI URL when cited, ≥2 community/blog URLs

--- REFERENCES ---
Read from /tmp/blog_references/:
- style-analysis.md — Title formulas, engagement patterns
- module-templates.md — HTML templates per section type
- style-examples.md — Formatting rules
- post-processing-prompt.md — Intro, Conclusion, FAQ, SEO prompts

OUTPUT: Print to stdout. Start with <h2>. No markdown, no code fences, no markdown tables, no planning text. Do NOT write to files.
