import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "geo-techniques",
  title: "Which GEO techniques work? What the research actually shows",
  description:
    "What GEO research shows: which rewrites raised AI visibility in the KDD 2024 GEO paper, why later benchmarks disagree, and how to test a technique yourself.",
  date: "2026-09-26",
  authorSlug: "autoseo-team",
  tags: ["geo", "research"],
  readingMinutes: 12,
  lead:
    "Published research supports a narrow version of GEO. In the original GEO paper (Aggarwal et al., KDD 2024), rewriting a source to add quotations, statistics or citations raised its share of an LLM-generated answer by 30–40% on the main metric, while keyword stuffing did not help. Later benchmarks are more sceptical: C-SEO Bench (2025) found most such rewrites ineffective or even harmful for citation rank, and a document's position in the retrieved context mattered far more. This post summarizes the papers (AutoSEO ran no tests of its own) and shows how to test a technique on your own prompts.",
  blocks: [
    { type: "h2", text: "What did the original GEO paper actually test?" },
    {
      type: "p",
      text: "[GEO: Generative Engine Optimization](https://arxiv.org/abs/2311.09735) by Aggarwal et al. was first posted in November 2023 and published at KDD 2024. It introduced **GEO-bench**: 10,000 queries from nine sources such as MS MARCO, ELI5 and Perplexity.ai Discover, tagged into 25 domains, about 80% of them informational.",
    },
    {
      type: "p",
      text: "The generative engine was the authors' own pipeline: for each query, the top 5 Google results went to `gpt-3.5-turbo`, which wrote a cited answer (five samples at temperature 0.7). An LLM then rewrote one of the five sources with one of nine methods, and the authors measured how much of the new answer that source earned.",
    },
    {
      type: "ul",
      items: [
        "**Content additions:** Cite Sources, Quotation Addition, Statistics Addition.",
        "**Style changes:** Fluency Optimization, Easy-to-Understand, Authoritative (a more persuasive tone).",
        "**Vocabulary changes:** Keyword Stuffing (more query keywords, as in classic SEO), Unique Words, Technical Terms.",
      ],
    },
    {
      type: "p",
      text: "Visibility had two metrics. **Position-Adjusted Word Count** is the share of answer words in sentences that cite the source, weighted so that earlier sentences count more. **Subjective Impression** is a GPT-3.5 rating across seven criteria such as relevance, influence and click likelihood.",
    },

    { type: "h2", text: "Which techniques raised visibility, and which did not?" },
    {
      type: "p",
      text: "On GEO-bench the unoptimized baseline scored 19.3 on both metrics. After the rewrite, **Quotation Addition** reached 27.2 on Position-Adjusted Word Count, **Statistics Addition** 25.2, **Fluency Optimization** 24.7 and **Cite Sources** 24.6. The authors summarize Cite Sources, Quotation Addition and Statistics Addition as a relative improvement of 30–40% on Position-Adjusted Word Count and 15–30% on Subjective Impression; the best methods improved on the baseline by 41% and 28%.",
    },
    {
      type: "p",
      text: "Style changes alone also helped: Fluency Optimization and Easy-to-Understand gave “a significant visibility boost of 15-30%”. **Keyword Stuffing** scored 17.7, below the baseline, which the paper describes as “little to no improvement”. Unique Words (20.5) barely moved.",
    },
    {
      type: "p",
      text: "Two findings are quoted often. First, lower-ranked sources gained most: Cite Sources raised the visibility of the source ranked fifth in Google by 115.1%, while the top-ranked source lost 30.3% on average. Second, combining Fluency Optimization with Statistics Addition beat any single method by more than 5.5%, measured on a 200-query subset.",
    },
    {
      type: "p",
      text: "Effects varied by domain: Authoritative worked best for debate and history, Quotation Addition for people & society, Statistics Addition for law & government.",
    },
    { type: "h3", text: "What happened on Perplexity.ai?" },
    {
      type: "p",
      text: "The paper also tested Perplexity.ai, but not through live web search. Perplexity did not accept source URLs, so the authors uploaded the source texts as files and ran 200 test queries. Quotation Addition improved Position-Adjusted Word Count by 22%, Cite Sources and Statistics Addition showed “improvements of up to 9% and 37% on the two metrics”, and Keyword Stuffing performed 10% worse than the baseline.",
    },
    {
      type: "callout",
      tone: "warn",
      title: "The caveat that matters most",
      text: "In every GEO-bench experiment the page was already one of five sources in the context, and the rewrite was produced by an LLM. The paper measures how much of an answer a retrieved source earns. It does not test whether a rewrite gets a page retrieved, cited by a production engine or clicked.",
    },

    { type: "h2", text: "What did later studies find?" },
    { type: "h3", text: "C-SEO Bench (2025): most rewrites did not improve citation rank" },
    {
      type: "p",
      text: "[C-SEO Bench](https://arxiv.org/abs/2506.11097) by Puerto et al. (NeurIPS 2025, Datasets and Benchmarks track) tested eight GEO methods plus two newer ones on more than 1.9k queries and 16k documents, covering question answering and product recommendation. The engines were `gpt-4o-mini`, `claude-3-5-haiku`, `o3` and `o4-mini`, and the outcome was **citation rank**, not word share.",
    },
    {
      type: "p",
      text: "Most methods had near-zero average gains, and many were significantly negative: Statistics decreased rankings in 19 of 24 evaluated settings, and in product recommendation on Haiku 3.5, 26 of 30 cases were significantly negative. Placing the document first in the LLM's context produced far larger gains, for example 2.77 ± 2.31 rank positions for retail on gpt-4o-mini. As more competitors adopted the same method, gains shrank toward zero.",
    },
    {
      type: "p",
      text: "The authors attribute the gap to the metric: a higher word count does not mean the LLM prefers a source. They argue that both papers' results on LLM preferences are consistent.",
    },
    { type: "h3", text: "Ranking manipulation works in the lab, and it is manipulation" },
    {
      type: "p",
      text: "[Pfrommer et al.](https://arxiv.org/abs/2406.03589) (EMNLP 2024) built RAGDOLL, 1,147 product webpages from five product groups, and found that LLMs “vary significantly in prioritizing product name, document content, and context position”. Adversarial text from a tree-of-attacks jailbreak promoted low-ranked products and transferred to Perplexity. [Kumar and Lakkaraju](https://arxiv.org/abs/2404.07981) (2024) lifted fictitious coffee machines in Llama-2 recommendations with a “strategic text sequence”. [Nestaas et al.](https://arxiv.org/abs/2406.18382) (2024) ran such attacks on Bing and Perplexity and describe a prisoner's dilemma: everyone attacks, and answers degrade for all.",
    },
    { type: "h3", text: "Chen et al. (2025): AI search leans on earned media" },
    {
      type: "p",
      text: "[Chen, Wang, Chen and Koudas](https://arxiv.org/abs/2509.08919) (University of Toronto) compared Google with the API versions of GPT-4o search, Claude, Gemini and Perplexity, using data collected in August 2025. They report “a systematic and overwhelming bias towards Earned media” (third-party sources) over brand-owned and social content: for US consumer electronics queries, 92.1% of AI search sources were earned media. The study is observational, and the authors call their source classification partly subjective.",
    },
    { type: "h3", text: "AutoGEO (2025): learned, engine-specific rules" },
    {
      type: "p",
      text: "[AutoGEO](https://arxiv.org/abs/2510.11438) (Wu et al., 2025) had LLMs explain why one document earned more visibility than another and turned the explanations into rewriting rules. On simulated engines built on `gemini-2.5-flash-lite`, `gpt-4o-mini` and `claude-3-haiku`, it improved GEO metrics by an average of 35.99% while keeping answer quality stable. Rule sets overlapped 78.95–84.21% across the three models, with comprehensive topic coverage as a shared rule, but e-commerce rules favored actionable guidance over in-depth explanation.",
    },
    { type: "h3", text: "2026: measurement noise and a sober survey" },
    {
      type: "p",
      text: "[Sielinski](https://arxiv.org/abs/2603.08924) (2026 preprint) sampled Perplexity, OpenAI SearchGPT and Gemini daily over nine days and at ten-minute intervals. Repeated runs of the same query cited different domains: median domain-level Jaccard overlap (1.0 = identical) was 0.29–0.31 for Gemini, 0.33–0.40 for SearchGPT and 0.50 for Perplexity. Differences in citation share below 5–7 percentage points usually fell within the noise.",
    },
    {
      type: "p",
      text: "A [July 2026 survey of 45 studies](https://arxiv.org/abs/2607.14035) by Martinez concludes that already-retrieved content can causally change its citation, but “no reviewed technique shows a stable, longitudinal, cross-platform causal effect on organic discoverability or downstream behavior.” A [2026 analysis of 602 prompts](https://arxiv.org/abs/2604.25707) found that pages with more influence on answers tend to be longer, more structured and richer in definitions, numbers and steps, a correlation rather than a tested intervention.",
    },

    { type: "h2", text: "How does the evidence compare, technique by technique?" },
    {
      type: "table",
      head: ["Technique", "Evidence", "Source (year)"],
      rows: [
        [
          "Add quotations",
          "GEO-bench: 19.3 → 27.2 (Position-Adjusted Word Count); +22% on Perplexity (uploaded files). C-SEO Bench: near zero.",
          "Aggarwal et al. (2024); Puerto et al. (2025)",
        ],
        [
          "Add statistics",
          "GEO-bench: 19.3 → 25.2; +37% Subjective Impression on Perplexity. C-SEO Bench: lower rank in 19 of 24 settings.",
          "Aggarwal et al. (2024); Puerto et al. (2025)",
        ],
        [
          "Cite sources",
          "GEO-bench: 19.3 → 24.6; +115.1% for the fifth-ranked source, −30.3% for the first. C-SEO Bench: near zero.",
          "Aggarwal et al. (2024); Puerto et al. (2025)",
        ],
        [
          "Fluency, simpler language",
          "GEO-bench: 15–30% visibility boost. C-SEO Bench: near zero in most settings.",
          "Aggarwal et al. (2024); Puerto et al. (2025)",
        ],
        ["Keyword stuffing", "GEO-bench: 17.7 vs. 19.3 baseline; 10% worse than baseline on Perplexity.", "Aggarwal et al. (2024)"],
        [
          "Rank higher in retrieval (classic SEO)",
          "First position in the context: 2.77 ± 2.31 rank gain (retail, gpt-4o-mini), far above any rewrite.",
          "Puerto et al. (2025); Pfrommer et al. (2024)",
        ],
        ["Engine-specific learned rewrites", "Average +35.99% on GEO metrics with stable answer quality, on simulated engines.", "Wu et al. (2025)"],
        ["Earned third-party coverage", "92.1% earned-media sources in AI search for US consumer electronics (observational, August 2025).", "Chen et al. (2025)"],
        [
          "Hidden instructions, prompt injection",
          "Promotes products in the lab and on Perplexity and Bing; manipulative.",
          "Pfrommer et al. (2024); Nestaas et al. (2024)",
        ],
      ],
      caption: "Effect sizes as each paper states them; benchmarks, models and metrics differ across rows.",
    },

    { type: "h2", text: "Why do the studies disagree?" },
    {
      type: "ul",
      items: [
        "**Different outcomes.** GEO measures the share of answer words, C-SEO Bench citation rank, Chen et al. the source mix. None measures traffic or revenue.",
        "**Fixed context.** Lab studies hand the model a few documents. Production engines first decide whether to search and what to retrieve (see [query fan-out](/blog/query-fan-out)).",
        "**Models and dates.** GEO used `gpt-3.5-turbo` in 2023; C-SEO Bench used 2024–2025 models. Production engines change without notice.",
        "**One actor versus many.** Gains shrink when competitors optimize too, and few experiments touched a live product.",
      ],
    },
    {
      type: "p",
      text: "Google's guidance points the same way as C-SEO Bench: “There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary,” and SEO best practices “remain relevant” ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features), last updated December 2025).",
    },

    { type: "h2", text: "What does this mean for your content?" },
    {
      type: "ul",
      items: [
        "**Get retrieved first.** Retrieval position was the strongest lever in C-SEO Bench. Crawlability, indexing and classic rankings come before rewrites; see [how AI crawlers read your pages](/blog/ai-crawler-readability).",
        "**Add evidence that is true.** Statistics, quotations and citations helped in the GEO paper, but its additions were generated by an LLM. Use numbers and quotes you can source, and link the source.",
        "**Cover the sub-questions.** Comprehensive coverage was a shared AutoGEO rule; for shopping queries, actionable guidance mattered more than explanation.",
        "**Earn third-party coverage.** If AI search leans on earned media, independent reviews may matter as much as your own page.",
        "**Skip keyword stuffing and hidden instructions.** The first did not help; the second is manipulation.",
        "**Treat each technique as a hypothesis.** Test it on your own prompts before rolling it out site-wide.",
      ],
    },

    { type: "h2", text: "How can you test a GEO technique yourself?" },
    { type: "p", text: "A lab effect tells you what to try, not what will happen on your pages. A simple controlled test:" },
    {
      type: "ol",
      items: [
        "**Pick test prompts.** Choose tracked prompts where the page you will change is a plausible answer, and tag them as the test group.",
        "**Pick a control group.** Tag comparable prompts whose pages you will not touch; they absorb engine updates and seasonality.",
        "**Record a baseline.** Track both groups daily across the engines you care about for at least two to four weeks before changing anything.",
        "**Change one page, one technique.** For example, add sourced statistics. Note the publish date and change nothing else on that page.",
        "**Keep tracking.** Keep engines, markets and prompt wording identical for several weeks after the change.",
        "**Compare differences.** Compare mention rate and citation rate for test versus control, before versus after. A gain in both groups is probably not your change.",
        "**Respect the noise.** Answers vary from run to run. More prompts and more days narrow the uncertainty; gaps of a few points are often noise.",
      ],
    },
    { type: "p", text: "**Example:** a hypothetical B2B invoicing tool tests Statistics Addition on its pricing guide. All numbers below are illustrative." },
    {
      type: "ol",
      items: [
        "The team tags 30 prompts about invoicing costs as `test-stats` and 30 prompts about other features as `control`.",
        "Over a four-week baseline across ChatGPT, Perplexity and Google AI Overviews, the test group shows an illustrative citation rate of 12%, the control group 10%.",
        "They add five statistics to the pricing guide, each linked to the original survey, and change nothing else.",
        "Four weeks later the test group is at an illustrative 17%, the control at 11%. The difference-in-differences is 4 points (5 minus 1).",
        "Given the run-to-run variation reported in the research, 4 points on 30 prompts is not conclusive, so they extend the test and add prompts before deciding.",
      ],
    },

    { type: "h2", text: "How do you measure this with AutoSEO?" },
    { type: "p", text: "AutoSEO measures prompts; it does not tell you which technique works. Per the open-source code, it gives you:" },
    {
      type: "ul",
      items: [
        "**Prompt tracking across engines.** Prompts run on the engines you enable, such as ChatGPT, Perplexity, Google AI Overviews, Google AI Mode, Gemini, Claude and Microsoft Copilot, on a daily, weekly or monthly schedule ([AI visibility tracking](/ai-visibility-tracking)). One answer per prompt, engine and day is stored, so repeat samples accumulate across days.",
        "**Defined metrics.** Visibility (answers that name or cite you), mention rate, citation rate (answers citing one of your pages), average position and share of voice, each compared with the previous period of equal length.",
        "**Tags for test and control groups.** Prompts can carry tags, and the tracker, trends and the [MCP server](/mcp-server) tools filter metrics by tag and engine.",
        "**Sources.** The most cited URLs and domains, split into own, competitor and third-party, plus a competitor gap analysis ([AI citation tracking](/ai-citation-tracking)).",
        "**Content scoring.** An AEO score from six weighted pillars (extractability, fact density, structure, schema markup, depth, metadata), also for an existing URL before a rewrite ([AI content optimization](/ai-content-optimization)). It is a heuristic checklist, not a validated predictor of citations.",
        "**[Prompt research](/prompt-research)** to build the prompt set by topic, persona and funnel stage.",
      ],
    },
    {
      type: "p",
      text: "Each stored answer records the backend that produced it; where no direct source is configured, a model with web search can imitate an engine, labelled as simulated. Keep the backend constant during a test.",
    },
    {
      type: "callout",
      tone: "info",
      title: "Method and limitations",
      text: "This post summarizes published papers and official documentation as of September 2026. AutoSEO has no proprietary dataset and ran no experiments for it. Most studies used benchmarks, fixed contexts or simulated engines with models that production products have since replaced, and several 2026 sources are preprints without peer review. Effect sizes are quoted as the papers state them and are not comparable across studies.",
    },
  ],
  faq: [
    {
      q: "Is GEO different from SEO?",
      a: "Partly. The GEO paper optimizes how much of an AI answer a page earns once retrieved. C-SEO Bench and Google's guidance both suggest that getting retrieved, which is classic SEO, remains the larger lever.",
    },
    {
      q: "Does adding statistics to a page get it cited more?",
      a: "In the GEO paper, Statistics Addition raised Position-Adjusted Word Count from 19.3 to 25.2 on GEO-bench. C-SEO Bench found the same method lowered citation rank in 19 of 24 settings. Add statistics because they help readers and are sourced, then measure the effect on your own prompts.",
    },
    {
      q: "How long should a GEO test run?",
      a: "Long enough to separate your change from answer variability: a few weeks of daily baseline and a few weeks after the change, with a control group of prompts.",
    },
    {
      q: "Should I let a tool rewrite my pages automatically for GEO?",
      a: "AutoGEO improved GEO metrics on simulated engines, and C-SEO Bench found that early-adopter gains shrink as competitors copy the method. Check every automated rewrite for accuracy, especially added numbers and quotes, and test it first.",
    },
    {
      q: "Why do different AI engines cite different sources?",
      a: "They retrieve differently, use different models and change over time. Chen et al. report differences in domain diversity, freshness and sensitivity to phrasing, and Sielinski measured limited overlap even between repeated runs of the same engine. Track each engine separately.",
    },
  ],
  sources: [
    { label: "arXiv / KDD 2024: Aggarwal et al., GEO: Generative Engine Optimization (2024)", href: "https://arxiv.org/abs/2311.09735" },
    { label: "arXiv / NeurIPS 2025: Puerto et al., C-SEO Bench: Does Conversational SEO Work? (2025)", href: "https://arxiv.org/abs/2506.11097" },
    { label: "arXiv / EMNLP 2024: Pfrommer et al., Ranking Manipulation for Conversational Search Engines (2024)", href: "https://arxiv.org/abs/2406.03589" },
    { label: "arXiv: Kumar and Lakkaraju, Manipulating Large Language Models to Increase Product Visibility (2024)", href: "https://arxiv.org/abs/2404.07981" },
    { label: "arXiv: Nestaas et al., Adversarial Search Engine Optimization for Large Language Models (2024)", href: "https://arxiv.org/abs/2406.18382" },
    { label: "arXiv: Chen et al., Generative Engine Optimization: How to Dominate AI Search (2025)", href: "https://arxiv.org/abs/2509.08919" },
    { label: "arXiv: Wu et al., What Generative Search Engines Like and How to Optimize Web Content Cooperatively (2025)", href: "https://arxiv.org/abs/2510.11438" },
    { label: "arXiv: Sielinski, Quantifying Uncertainty in AI Visibility (2026)", href: "https://arxiv.org/abs/2603.08924" },
    { label: "arXiv: Martinez, A Critical Survey of Generative Engine Optimization 2023–2026 (2026)", href: "https://arxiv.org/abs/2607.14035" },
    { label: "arXiv: From Citation Selection to Citation Absorption (2026)", href: "https://arxiv.org/abs/2604.25707" },
    { label: "Google Search Central: AI features and your website (2025)", href: "https://developers.google.com/search/docs/appearance/ai-features" },
  ],
};
