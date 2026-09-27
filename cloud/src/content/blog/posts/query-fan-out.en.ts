import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "query-fan-out",
  title: "What is query fan-out, and why does it matter for AI search?",
  description:
    "Query fan-out explained: how Google AI Mode, ChatGPT, Claude and Perplexity split one prompt into many searches, and what that means for your content.",
  date: "2026-09-26",
  authorSlug: "autoseo-team",
  tags: ["query-fan-out", "google", "geo"],
  readingMinutes: 12,
  lead:
    "Query fan-out is the technique AI search engines use to split one prompt into several sub-queries, run those searches, and build a single answer from the combined results. Google names it explicitly for AI Mode and says AI Overviews may use it too, and OpenAI, Anthropic, Google's Gemini API and Perplexity document the same pattern of multiple searches per request. It matters because pages are retrieved for the sub-queries, not only for the prompt a user typed, so covering the subtopics an engine searches for is part of being citable.",
  blocks: [
    { type: "h2", text: "What is query fan-out?" },
    {
      type: "p",
      text: "Query fan-out is a retrieval pattern. Instead of sending a user's prompt to a search index as it is, the engine uses a language model to derive several narrower searches, runs them, and then writes one answer from what came back. Google used the term publicly in March 2025 when it launched AI Mode, describing related searches issued concurrently across subtopics and multiple data sources ([Google, 2025](https://blog.google/products-and-platforms/products/search/ai-mode-search/)).",
    },
    {
      type: "quote",
      text: "breaking down your question into subtopics and issuing a multitude of queries simultaneously",
      cite: "Google, on AI Mode at I/O 2025",
    },
    {
      type: "p",
      text: "A prompt like “Is a heat pump worth it for a 1970s house?” hides several information needs: installation cost, insulation requirements, running costs compared with gas, subsidies, noise. A fan-out system turns those needs into separate searches, and each search can return different pages. The final answer cites whichever sources covered each part best.",
    },
    {
      type: "p",
      text: "The idea is older than AI Mode. The self-ask method by Press et al. showed that a model asking itself follow-up questions, answered with a search engine, is more accurate on multi-step questions ([Findings of EMNLP 2023](https://arxiv.org/abs/2210.03350)). Microsoft described a related approach for Bing's deep search in 2023: the query is rewritten on the user's behalf and the variations are searched as well ([Bing, 2023](https://blogs.bing.com/search-quality-insights/december-2023/Introducing-Deep-Search)).",
    },

    { type: "h2", text: "Which AI search engines use query fan-out?" },
    {
      type: "p",
      text: "Every major engine that documents its search behavior describes some form of multiple, model-generated searches per request. The details differ, and so does how much of it you can see. For how Google's two AI surfaces differ in general, see [AI Mode vs. AI Overviews](/blog/ai-mode-vs-ai-overviews).",
    },
    {
      type: "table",
      head: ["Claim", "What the source says", "Source (year)"],
      rows: [
        [
          "Google AI Mode uses fan-out",
          "AI Mode issues multiple related searches at the same time across subtopics and several data sources, then brings the results together.",
          "[Google: Expanding AI Overviews and introducing AI Mode](https://blog.google/products-and-platforms/products/search/ai-mode-search/) (2025)",
        ],
        [
          "Deep Search scales it up",
          "Deep Search uses the same technique taken further and can issue hundreds of searches for one fully cited report.",
          "[Google: AI in Search, I/O 2025](https://blog.google/products-and-platforms/products/search/google-search-ai-mode-update/) (2025)",
        ],
        [
          "AI Overviews may use it too",
          "Google's documentation for site owners says both AI Overviews and AI Mode may use query fan-out to develop a response.",
          "[Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) (2025)",
        ],
        [
          "Visual searches fan out as well",
          "A Google Search engineering director, explaining visual search in AI Mode, says it does about a dozen searches in the time one search takes.",
          "[Google: Ask a Techspert](https://blog.google/company-news/inside-google/googlers/how-google-ai-visual-search-works/) (2026)",
        ],
        [
          "ChatGPT rewrites prompts into queries",
          "ChatGPT search typically rewrites a prompt into one or more targeted queries and may send more specific queries after reviewing the first results.",
          "[OpenAI Help Center: Searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) (2026)",
        ],
        [
          "Claude searches repeatedly",
          "Claude decides when to search, and the search step can repeat within one request: typically 1–3 searches for simple facts, 10 or more for comparative research.",
          "[Anthropic: Web search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool) (2026)",
        ],
        [
          "Gemini generates its own queries",
          "With Grounding with Google Search, the model generates one or multiple search queries, and the response contains the queries it executed.",
          "[Google AI for Developers: Grounding with Google Search](https://ai.google.dev/gemini-api/docs/google-search) (2026)",
        ],
        [
          "Perplexity runs follow-up searches",
          "Pro Search plans multi-step research and can start follow-up searches that build on earlier results.",
          "[Perplexity: Pro Search upgraded](https://www.perplexity.ai/hub/blog/pro-search-upgraded-for-more-advanced-problem-solving) (2024)",
        ],
      ],
      caption: "Public statements about multiple searches per prompt, checked in September 2026.",
    },
    {
      type: "p",
      text: "Two nuances matter. Google's wording is “may use”, so not every AI Overview necessarily involves a fan-out. And the developer APIs describe how a model searches when you call it; the consumer apps can behave differently. OpenAI's help center, for example, says ChatGPT may use saved memories when it rewrites a search query.",
    },

    { type: "h2", text: "What do Google's patents say about fan-out, and what don't they prove?" },
    {
      type: "p",
      text: "Patents are often quoted as evidence of how AI Mode works. They show what Google has filed, not what runs in production. Three are cited frequently:",
    },
    {
      type: "ul",
      items: [
        "**US11769017B1, “Generative summaries for search results”** (granted 2023): describes an LLM summary built not only from documents responsive to the query, but also from documents responsive to related queries, recent queries and implied queries ([Google Patents](https://patents.google.com/patent/US11769017B1/en)).",
        "**US20240289407A1, “Search with stateful chat”** (application published 2024): claim 1 covers generating synthetic queries from model output and selecting search result documents that respond to the original query and to those synthetic queries ([Google Patents](https://patents.google.com/patent/US20240289407A1/en)).",
        "**WO2024064249A1, “Systems and methods for prompt-based query generation for diverse retrieval”** (published 2024): despite the title, this one uses an LLM to generate synthetic query-document pairs for training a retrieval model. It does not describe fan-out at answer time ([Google Patents](https://patents.google.com/patent/WO2024064249A1/en)).",
      ],
    },
    {
      type: "p",
      text: "The first two describe the same shape as Google's blog posts: derive additional queries, retrieve for all of them, summarize. None of them tells you how many sub-queries AI Mode runs, how results are weighted, or which parts are live.",
    },

    { type: "h2", text: "Why does query fan-out matter for your content?" },
    {
      type: "p",
      text: "**Retrieval happens per sub-query.** If an engine searches “heat pump running costs vs gas boiler” as one of its fan-outs, the pages that rank for that sub-query become candidates for the answer, even if they never ranked for the prompt the user typed. Google says its models identify more supporting pages while a response is generated, which lets it show a wider and more diverse set of links than a classic web search ([Search Central](https://developers.google.com/search/docs/appearance/ai-features)).",
    },
    {
      type: "p",
      text: "**Subtopic coverage becomes visible.** A fan-out list is the engine telling you which facts it needed. If the sub-queries keep asking about pricing, compatibility and alternatives, a page that only answers the head question leaves those parts for other sources to fill.",
    },
    {
      type: "p",
      text: "**Planning shifts from single keywords to question sets.** Keyword research tells you what people type. Fan-outs show what an engine searches on their behalf, and those searches are often longer and more specific. Google notes that people in its AI experiences ask longer, more specific questions and follow-up questions ([Search Central Blog, 2025](https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search)).",
    },
    {
      type: "callout",
      tone: "tip",
      title: "A working model",
      text: "The prompt sets the topic; the fan-outs decide which pages get read. This is an inference from the documentation above, not a rule any provider publishes, but it explains why pages that answer specific sub-questions cleanly get cited for broad prompts.",
    },

    { type: "h2", text: "What are the limits of fan-out data?" },
    {
      type: "ul",
      items: [
        "**Fan-outs vary from run to run.** In every documented system the model decides whether and what to search, and ChatGPT may send further queries depending on what the first results contain. The same prompt can produce different sub-queries on different days, so treat one observation as an anecdote and look for sub-queries that recur.",
        "**Not all fan-outs are visible.** Google does not publish the sub-queries behind AI Mode or AI Overviews, and Search Console includes AI feature traffic in the overall “Web” search type rather than per sub-query. OpenAI's [API documentation](https://developers.openai.com/api/docs/guides/tools-web-search) says a search action usually, but not always, includes the queries that were searched.",
        "**Engines differ.** ChatGPT can send rewritten queries to search partners, Gemini grounds on Google Search, Claude uses Anthropic's web search tool. Each has its own index and ranking, so a sub-query that surfaces your page in one engine may not in another.",
        "**API answers are a proxy.** Fan-outs collected through developer APIs show how a model searches under API conditions. The consumer app can differ through memory, location or model choice.",
        "**Gemini is not AI Mode.** The queries the Gemini API reports for grounded answers are Gemini's own, not a view into AI Mode's fan-out, even though both use Google Search.",
      ],
    },

    { type: "h2", text: "What this means for you: how should you plan content around fan-outs?" },
    {
      type: "ol",
      items: [
        "**Collect fan-outs repeatedly** from engines that expose them, across several runs and engines, for the prompts that matter commercially.",
        "**Normalize and count.** Group near-identical sub-queries and rank them by how often they recur across runs, engines and prompts. Recurrence tells you more than any single list.",
        "**Cluster into subtopics** such as pricing, comparisons, compatibility, how-to and freshness. Each cluster is a candidate section, FAQ entry or standalone page.",
        "**Map clusters to existing URLs.** Decide which page should answer each cluster, and create a new page only when no existing page can carry the subtopic without losing focus.",
        "**Write passages that answer the sub-query directly.** Put the fact, number or recommendation in the first sentence of the section, with a date and a source where it matters. Google says AI features have no special requirements beyond being indexed and eligible for a snippet, so this is ordinary good content, organized by the questions engines ask. More techniques are in [GEO techniques](/blog/geo-techniques).",
        "**Check the basics:** crawlable, indexed, important content in text form (see [AI crawler readability](/blog/ai-crawler-readability)).",
        "**Re-measure citations** for the prompt after the change, per engine, not only rankings for the head term.",
      ],
    },

    { type: "h2", text: "What does a fan-out analysis look like in practice?" },
    {
      type: "p",
      text: "**Example:** ExampleTrack is a hypothetical company that sells time-tracking software to small agencies. All numbers below are illustrative, not measured data.",
    },
    {
      type: "ol",
      items: [
        "The team tracks the prompt “What's the best time tracking tool for a 10-person design agency?” on ChatGPT, Claude, Gemini and Perplexity every day for four weeks.",
        "Over that period the engines run about 40 distinct sub-queries (illustrative). After grouping near-duplicates, five recur often (table below).",
        "The team clusters them: pricing, project-management integrations, invoicing, freshness and one direct comparison.",
        "They map the clusters to their site: prices appear only inside an image, integrations and invoicing have no page, the best-of article is from 2023, and the comparison exists only as a sales deck.",
        "They put per-seat prices in plain text with a “last updated” date, add an integrations and invoicing section with a short FAQ, refresh the best-of article and publish an honest comparison page.",
        "After another four weeks they compare, per engine, how often their pages are cited for the prompt against the first period.",
      ],
    },
    {
      type: "table",
      head: ["Sub-query (illustrative)", "Seen in runs", "Engines", "Own page that answers it"],
      rows: [
        ["time tracking software for agencies pricing per user", "18", "ChatGPT, Perplexity", "Pricing page, prices only in an image"],
        ["time tracking tool with project management integration", "11", "Claude, Gemini", "None"],
        ["time tracking with invoicing for small teams", "9", "ChatGPT, Gemini", "None"],
        ["best time tracking app for designers 2026", "7", "Perplexity", "Best-of article from 2023"],
        ["ExampleTrack vs competitor for agencies", "5", "ChatGPT", "None"],
      ],
      caption: "Illustrative numbers for a hypothetical company, not measured data.",
    },
    {
      type: "p",
      text: "The example shows the order of work: observe repeatedly, count, cluster, map to pages, fix the passages, measure citations again. None of this guarantees a citation; it removes the obvious reasons for not getting one.",
    },

    { type: "h2", text: "How can you capture fan-out queries with AutoSEO?" },
    {
      type: "p",
      text: "AutoSEO records fan-outs as part of [AI visibility tracking](/ai-visibility-tracking), but only where the provider returns them. As of September 2026 the code captures sub-queries for ChatGPT, Claude, Gemini and Perplexity when answers come through DataForSEO (including its ChatGPT app scraper), and through the direct APIs of OpenAI, Anthropic, Gemini, Perplexity's Agent API, xAI (Grok), Mistral, Meta AI and Kimi when their responses include search queries. Collection through DataForSEO returns no fan-outs for Google AI Overviews, Google AI Mode and Microsoft Copilot. If these engines run on AutoSEO's simulated fallback instead (a search-grounded model imitating the engine, labelled **Simulated**), the stored queries are that model's own searches, not Google's or Microsoft's. DeepSeek's API has no web search, and answers from the local agent carry no fan-outs either.",
    },
    {
      type: "ul",
      items: [
        "**Query Fanouts page:** each answer's sub-queries are stored with prompt, engine and date. The page groups them across answers and shows frequency, engines, originating prompts and first and last seen dates, with search, a period filter and CSV download ([query fan-out analysis](/query-fanout-analysis)).",
        "**Per answer:** the answer view lists the **Fan-out queries** next to the answer text and its citations.",
        "**Ad-hoc prompts:** Prompt Explorer runs a prompt live on ChatGPT, Claude, Gemini or Perplexity via DataForSEO and shows the sub-queries under **Related queries the model considered** ([prompt research](/prompt-research)).",
        "**Content plans:** for tracked prompts with at least two answers, where engines cite at least two other pages and none of yours, AutoSEO creates a content-gap task whose suggested outline uses that prompt's most frequent fan-outs as headings. You can draft the page with the [content tools](/ai-content-optimization).",
        "**Agents, API and reports:** the MCP tool `get_query_fanouts` and the REST endpoint `GET /api/v1/projects/{projectId}/fanouts` return the same grouped data (default period: 90 days) for your own agents and scripts ([MCP server](/mcp-server)), and reports can include a **Query fan-outs** block.",
      ],
    },
    {
      type: "p",
      text: "To try this on your own prompts, you can [self-host AutoSEO](/self-hosting) for free or use AutoSEO Cloud for [$50 per month](/pricing).",
    },
    {
      type: "callout",
      tone: "info",
      title: "Method and limitations",
      text: "This post summarizes public documentation, patents and research as of September 26, 2026. AutoSEO has no proprietary dataset, and the example above is hypothetical. Google describes fan-out for AI Mode and AI Overviews but does not publish the sub-queries or how many run per answer. Patents show filed ideas, not production systems. Search tools change quickly: Anthropic released two new web search tool versions in 2026, and OpenAI shut down its preview search models in July 2026. Check the linked sources for the current state.",
    },
  ],
  faq: [
    {
      q: "Is query fan-out the same as query expansion?",
      a: "They are related but not identical. Classic query expansion adds synonyms or related terms to one query. Fan-out, as Google describes it, issues several separate searches for different subtopics and merges the results into one answer. Bing's 2023 deep search sat in between: it rewrote the query and searched the variations too.",
    },
    {
      q: "Can I see the fan-out queries Google AI Mode runs?",
      a: "Not directly. Google documents that AI Mode and AI Overviews may use fan-out but does not publish the sub-queries, and Search Console reports AI feature traffic inside the overall Web search type. You can observe sub-queries from engines whose APIs return them, such as ChatGPT, Claude, Gemini and Perplexity, and use them as a proxy with that caveat.",
    },
    {
      q: "Do I need a separate page for every fan-out query?",
      a: "No. Many sub-queries are variants of the same need and belong in one section or FAQ of an existing page. A new page makes sense when a cluster of sub-queries recurs, is commercially relevant, and no existing URL can answer it without becoming unfocused.",
    },
    {
      q: "How many searches does an AI engine run per prompt?",
      a: "It depends on the engine, the mode and the prompt. Anthropic says simple factual queries typically use one to three searches and comparative research ten or more, and Google says Deep Search can issue hundreds. No provider promises a fixed number, which is why recurrence across runs is a better signal than any single list.",
    },
    {
      q: "How often should I check fan-outs again?",
      a: "Often enough to see which sub-queries recur. Fan-outs change with the model, the search results and the date, so daily or weekly tracking over several weeks gives a more reliable picture than a one-off check. Look again after major model or search tool updates.",
    },
  ],
  sources: [
    { label: "Google: Expanding AI Overviews and introducing AI Mode (2025)", href: "https://blog.google/products-and-platforms/products/search/ai-mode-search/" },
    { label: "Google: AI in Search: Going beyond information to intelligence (I/O 2025)", href: "https://blog.google/products-and-platforms/products/search/google-search-ai-mode-update/" },
    { label: "Google: Ask a Techspert: How does AI understand my visual searches? (2026)", href: "https://blog.google/company-news/inside-google/googlers/how-google-ai-visual-search-works/" },
    { label: "Google Search Central: AI features and your website (2025)", href: "https://developers.google.com/search/docs/appearance/ai-features" },
    { label: "Google Search Central Blog: Top ways to ensure your content performs well in Google's AI experiences on Search (2025)", href: "https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search" },
    { label: "Google Patents: US11769017B1, Generative summaries for search results (2023)", href: "https://patents.google.com/patent/US11769017B1/en" },
    { label: "Google Patents: US20240289407A1, Search with stateful chat (2024)", href: "https://patents.google.com/patent/US20240289407A1/en" },
    { label: "Google Patents: WO2024064249A1, Prompt-based query generation for diverse retrieval (2024)", href: "https://patents.google.com/patent/WO2024064249A1/en" },
    { label: "OpenAI Help Center: Searching the web with ChatGPT (2026)", href: "https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt" },
    { label: "OpenAI API docs: Web search (2026)", href: "https://developers.openai.com/api/docs/guides/tools-web-search" },
    { label: "Anthropic: Web search tool, Claude API docs (2026)", href: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool" },
    { label: "Google AI for Developers: Grounding with Google Search (2026)", href: "https://ai.google.dev/gemini-api/docs/google-search" },
    { label: "Perplexity: Pro Search: Upgraded for more advanced problem-solving (2024)", href: "https://www.perplexity.ai/hub/blog/pro-search-upgraded-for-more-advanced-problem-solving" },
    { label: "Microsoft Bing Blogs: Introducing deep search (2023)", href: "https://blogs.bing.com/search-quality-insights/december-2023/Introducing-Deep-Search" },
    { label: "Press et al.: Measuring and Narrowing the Compositionality Gap in Language Models (Findings of EMNLP 2023)", href: "https://arxiv.org/abs/2210.03350" },
  ],
};
