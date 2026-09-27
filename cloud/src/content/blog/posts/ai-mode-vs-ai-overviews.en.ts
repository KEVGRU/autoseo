import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "ai-mode-vs-ai-overviews",
  title: "AI Mode vs. AI Overviews: differences and how to measure them",
  description:
    "AI Overviews sit on the results page, AI Mode is a separate conversational search. How they differ, how Search Console counts them and how to measure both.",
  date: "2026-09-26",
  authorSlug: "autoseo-team",
  tags: ["google", "ai-search", "measurement"],
  readingMinutes: 12,
  lead: "AI Overviews are an AI snapshot Google adds to some regular results pages; AI Mode is a separate, conversational search mode where the AI answer is the result and every follow-up counts as a new query. They can run on different Gemini models and cite different links, so measure them as two surfaces. Search Console folds both into the “Web” search type, and its new Generative AI performance report shows impressions without clicks, queries or a split between the features. To see which pages each feature cites, you have to run the prompts yourself.",
  blocks: [
    { type: "h2", text: "What is the difference between AI Overviews and AI Mode?" },
    {
      type: "p",
      text: "Google describes the two by job. AI Overviews “help people get to the gist of a complicated topic or question more quickly” and appear on the normal results page only when Google's systems judge them additive, so they “often don't trigger”. AI Mode is meant for queries “where further exploration, reasoning, or complex comparisons are needed” ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)). You open it on purpose: through the AI Mode tab on google.com, at google.com/ai or in the Google app ([Google Search Help](https://support.google.com/websearch/answer/16011537)).",
    },
    {
      type: "p",
      text: "The boundary is getting thinner. Since January 2026 a follow-up question asked from an AI Overview continues in AI Mode ([Google, 2026](https://blog.google/products-and-platforms/products/search/ai-mode-ai-overviews-updates/)); in May 2026 Google said this handoff is live on desktop and mobile worldwide ([Google, 2026](https://blog.google/products-and-platforms/products/search/search-io-2026/)). For measurement they remain two surfaces with different triggers, models and links.",
    },
    {
      type: "table",
      head: ["Dimension", "AI Overviews", "AI Mode", "Source (year)"],
      rows: [
        [
          "Entry point",
          "Inserted into the regular results page when Google judges it additive; often absent",
          "Separate mode: AI Mode tab, google.com/ai, Google app",
          "[Google Search Central (2025)](https://developers.google.com/search/docs/appearance/ai-features); [Google Search Help (2026)](https://support.google.com/websearch/answer/16011537)",
        ],
        [
          "Interaction",
          "One snapshot; a follow-up question hands over to AI Mode",
          "Conversation with follow-ups; text, voice, images and files as input",
          "[Google (2026)](https://blog.google/products-and-platforms/products/search/ai-mode-ai-overviews-updates/); [Google Search Help (2026)](https://support.google.com/websearch/answer/16011537)",
        ],
        [
          "Query fan-out",
          "“May use” fan-out",
          "Splits the question into subtopics and searches them simultaneously; Deep Search “can issue hundreds of searches”",
          "[Google Search Central (2025)](https://developers.google.com/search/docs/appearance/ai-features); [Google (2025)](https://blog.google/products/search/google-search-ai-mode-update/)",
        ],
        [
          "Default model (latest official statement)",
          "Gemini 3, default globally since January 2026",
          "Gemini 3.5 Flash, default globally since May 2026; Gemini 3 Pro selectable for some users",
          "[Google (2026)](https://blog.google/products-and-platforms/products/search/ai-mode-ai-overviews-updates/); [Google (2026)](https://blog.google/products-and-platforms/products/search/search-io-2026/)",
        ],
        [
          "Availability",
          "“200+ markets”; Germany since March 2025 (German and English)",
          "Over 200 countries and territories since October 2025; Germany listed, German supported",
          "[Google Ads Help (2026)](https://support.google.com/google-ads/answer/16297775); [Google (2025)](https://blog.google/feed/were-bringing-the-helpfulness-of-ai-overviews-to-more-countries-in-europe/); [Google (2025)](https://blog.google/products-and-platforms/products/search/ai-mode-expands-languages-locations/)",
        ],
        [
          "Links in Search Console",
          "The AI Overview occupies one position; all its links get that position",
          "Position follows normal results-page rules; a follow-up is a new query",
          "[Search Console Help (2026)](https://support.google.com/webmasters/answer/7042828)",
        ],
        [
          "Ads",
          "Above or below in all AI Overview markets; inside the AI Overview only in English in 12 countries (not Germany)",
          "Tested in the US",
          "[Google Ads Help (2026)](https://support.google.com/google-ads/answer/16297775); [Google Ads Help (2025)](https://support.google.com/google-ads/answer/16756291)",
        ],
        [
          "Reach (Google's figures)",
          "Over 2.5 billion monthly active users",
          "Over one billion monthly users",
          "[Google (2026)](https://blog.google/products-and-platforms/products/search/new-controls-website-owners/)",
        ],
      ],
      caption: "State as of September 2026. Models, availability and ad formats change often; the linked pages show the current state.",
    },

    { type: "h2", text: "How do AI Overviews and AI Mode build an answer?" },
    {
      type: "p",
      text: "Both draw on the Google Search index. Google's [optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) names two techniques: retrieval-augmented generation (grounding), which uses core Search ranking systems to retrieve pages, and query fan-out, “a set of concurrent, related queries generated by the model”. Its example: “how to fix a lawn that's full of weeds” may fan out to “best herbicides for lawns”, “remove weeds without chemicals” and “how to prevent weeds in lawn”.",
    },
    {
      type: "p",
      text: "So a page can be cited for a sub-query it ranks for, even when it doesn't rank for the question the user typed. AI Mode leans on this by design: at I/O 2025 Google said it issues “a multitude of queries simultaneously” ([Google, 2025](https://blog.google/products/search/google-search-ai-mode-update/)). Google does not publish the fan-out queries of either feature; see [Query fan-out explained](/blog/query-fan-out).",
    },
    {
      type: "p",
      text: "On models, Google is explicit: AI Mode and AI Overviews “may use different models and techniques, so the set of responses and links they show will vary” ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)). A custom Gemini 2.5 came to both in the US in May 2025, Gemini 3 became the AI Overviews default in January 2026, Gemini 3.5 Flash the AI Mode default in May 2026. Any benchmark describes one model generation.",
    },
    {
      type: "p",
      text: "AI Mode can also personalize: Personal Intelligence references previous searches for users 18 or older with history enabled ([Google Search Help](https://support.google.com/websearch/answer/16011537)). A tracking tool sees a non-personalized answer, not what every user sees.",
    },

    { type: "h2", text: "Where are AI Overviews and AI Mode available, including Germany?" },
    {
      type: "p",
      text: "AI Overviews launched at I/O 2024 ([Google, 2025](https://blog.google/products/search/google-search-ai-mode-update/)) and reached Germany, Austria and Switzerland in March 2025, in German and English, initially for signed-in users aged 18 and over ([Google, 2025](https://blog.google/feed/were-bringing-the-helpfulness-of-ai-overviews-to-more-countries-in-europe/)). Google's ads documentation now refers to “all 200+ markets where AI Overviews are available” ([Google Ads Help](https://support.google.com/google-ads/answer/16297775)).",
    },
    {
      type: "p",
      text: "AI Mode rolled out to everyone in the US in May 2025. In October 2025 Google added more than 35 languages and over 40 countries and territories, for a total of over 200, “including many across Europe” ([Google, 2025](https://blog.google/products-and-platforms/products/search/ai-mode-expands-languages-locations/)). As of September 2026 the AI Mode help page lists Germany, Austria and Switzerland, with German among the supported languages.",
    },
    {
      type: "p",
      text: "Some capabilities are narrower: Gemini 3 Pro in AI Mode and interactive visuals are available in English only ([Google Search Help](https://support.google.com/websearch/answer/16011537)). For tracking, market and language are separate variables: an English prompt in Germany is a different test from a German one.",
    },

    { type: "h2", text: "How does Search Console count AI Overview and AI Mode traffic?" },
    {
      type: "p",
      text: "Sites appearing in AI features “are included in the overall search traffic in Search Console”, within the “Web” search type of the Performance report ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)). No filter there isolates AI Overview or AI Mode clicks. The counting rules per feature ([Search Console Help](https://support.google.com/webmasters/answer/7042828)):",
    },
    {
      type: "ul",
      items: [
        "**AI Overviews:** clicking a link to an external page counts as a click; standard impression rules apply; “An AI Overview occupies a single position in search results, and all links in the AI Overview are assigned that same position.”",
        "**AI Mode:** clicks count the same way; position “follows the same methodology as a Google Search results page”. A follow-up question is treated as a new query, and all data in the new response is attributed to that query.",
        "**Both:** Search Console doesn't include data from experiments in Search Labs.",
      ],
    },
    { type: "h3", text: "What does the new Generative AI performance report add?" },
    {
      type: "p",
      text: "On June 3, 2026 Google started testing a dedicated report with a subset of sites in the UK; as of August 31, 2026 it is rolled out to all websites worldwide ([Google, 2026](https://blog.google/products-and-platforms/products/search/new-controls-website-owners/)). The **Generative AI performance report** for Search shows impressions from AI Overviews and AI Mode, with the dimensions Pages, Countries, Dates and Devices, and the search types “Web: text-based” and “Web: multimodal” ([Search Console Help](https://support.google.com/webmasters/answer/16984139)).",
    },
    {
      type: "p",
      text: "Three details matter. The data comes from the Web search type of the regular Performance report, so AI impressions stay in your overall numbers. The chart aggregates by property: two results from the same site in one AI feature count as one impression. And the help page lists both features without documenting a way to separate them.",
    },
    {
      type: "callout",
      tone: "warn",
      title: "What Search Console still can't tell you",
      text: "Which queries triggered the impressions, whether they came from an AI Overview or AI Mode, how many clicks each sent, what the answer said about your brand and which competitors were cited. That needs prompt-level tracking.",
    },

    { type: "h2", text: "Can Google Analytics tell AI Mode visits apart?" },
    {
      type: "p",
      text: "Not with any method Google documents. There is no separate referrer, source or channel for clicks from AI Overviews or AI Mode, so in GA4 these visits sit inside your Google organic traffic. Google recommends Search Console for Search performance and tools such as Google Analytics for conversions and time on site. It also states that clicks from results pages with AI Overviews “are higher quality” ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)), a claim you can't verify from outside.",
    },
    {
      type: "p",
      text: "The workable join is at page level: which pages gain impressions in the Generative AI report, and how organic sessions and conversions on those landing pages move in GA4. That is correlation, not attribution.",
    },

    { type: "h2", text: "How do you opt out, and what does Google-Extended control?" },
    {
      type: "p",
      text: "There are three levers, and they do different things:",
    },
    {
      type: "ul",
      items: [
        "**Preview controls and noindex.** `nosnippet`, `data-nosnippet` and `max-snippet` limit what Google shows from your pages in Search, AI features included; `noindex` removes the page. To be a supporting link at all, a page must be indexed and eligible for a snippet ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)).",
        "**Search generative AI control.** In Search Console under **Settings → Search generative AI** you can exclude your site's links and content from AI Overviews, AI Mode and generative AI features in Discover, including grounding. You then get no traffic or impressions from these features. Google says the control isn't a ranking signal for the rest of Search; exclusion takes 1–2 days, sometimes longer ([Search Console Help](https://support.google.com/webmasters/answer/16908024)).",
        "**Google-Extended.** This robots.txt token governs training of future Gemini models and grounding in Gemini Apps and Vertex AI. It “does not impact a site's inclusion in Google Search” ([Google crawler documentation](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended)), so blocking it doesn't remove you from AI Overviews or AI Mode.",
      ],
    },

    { type: "h2", text: "What does this mean for your measurement setup?" },
    {
      type: "ol",
      items: [
        "**Track the two features separately.** Run the same prompts in both; a combined “Google AI” number hides that models, triggers and links differ.",
        "**Use Search Console for totals, not for feature attribution.** The Performance report includes AI clicks; the Generative AI report shows which pages and countries get AI impressions. Neither splits AI Overviews from AI Mode.",
        "**Build your prompt set from real questions.** Use long, conversational Search Console queries and customer questions: AI Overviews trigger on “no one right answer” queries ([Google Ads Help](https://support.google.com/google-ads/answer/16297775)), AI Mode on complex comparisons.",
        "**Measure per market and language.** Germany in German and Germany in English are two tests.",
        "**Look at trends, not snapshots.** Answers vary between runs and models change several times a year; note model changes next to your charts.",
        "**Improve content, not page counts.** Google recommends non-commodity content and warns that pages for fan-out queries created primarily to manipulate AI responses violate its scaled content abuse policy ([Google Search Central](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)).",
        "**Check the Generative AI report before you exclude anything.** Google points to it for estimating the traffic impact.",
      ],
    },

    { type: "h2", text: "Example: how would you measure one topic in both features?" },
    {
      type: "p",
      text: "Example (hypothetical; all numbers are illustrative, not real data): a German online shop sells espresso machines and wants to know how visible it is for beginner questions.",
    },
    {
      type: "ol",
      items: [
        "The team pulls long, question-like queries from Search Console, such as „welche siebträgermaschine für anfänger“, and turns 20 of them into prompts.",
        "It tracks them weekly in AI Overviews and AI Mode for the market Germany, language German.",
        "After four weeks (illustrative): an AI Overview appeared for 12 of the 20 prompts and cited the shop in 4, a 20% citation rate across all 20. AI Mode answered all 20 and cited the shop in 2 (10%), but named the brand in 6.",
        "The citations show AI Mode preferring a competitor's comparison page and a forum thread; the shop's buying guide appears mainly in AI Overviews.",
        "In Search Console, the Generative AI report shows impressions for the buying guide in Germany while its clicks stay flat. Which feature produced the impressions is not visible.",
        "The team adds first-hand test results and a comparison table to the existing guide instead of publishing 20 near-duplicate pages, then compares the next four weeks with the baseline.",
      ],
    },
    {
      type: "p",
      text: "Prompt tracking tells you which feature cites whom; Search Console tells you whether Google recorded impressions and clicks. You need both.",
    },

    { type: "h2", text: "How do you measure AI Overviews and AI Mode with AutoSEO?" },
    {
      type: "p",
      text: "AutoSEO tracks Google AI Overviews and Google AI Mode as two separate engines ([AI Overviews tracking](/ai-visibility-tracking/google-ai-overviews), [AI Mode tracking](/ai-visibility-tracking/google-ai-mode)). Answers come from DataForSEO, AI Overviews from the Google results page and AI Mode from DataForSEO's AI Mode endpoint, for the market and language you choose. Without DataForSEO, AutoSEO by default falls back to a simulation (a search-grounded model such as Gemini with Google Search imitating the feature), stored and shown as **Simulated**, which an admin can switch off; treat those answers as directional, not as Google's own. AutoSEO stores the answer text, the linked sources as citations, and products or ads inside the answer. When Google shows no AI Overview for a prompt, the empty answer counts as not visible, so AI Overviews visibility also reflects how often an AI Overview appears at all.",
    },
    {
      type: "p",
      text: "From those answers AutoSEO computes visibility, mention rate, citation rate, average position, share of voice and sentiment, per engine and country and against the previous period; tracking runs daily, weekly or monthly. [AI citation tracking](/ai-citation-tracking) shows which of your and your competitors' pages each feature links.",
    },
    {
      type: "p",
      text: "The [Google Search Console integration](/integrations/google-search-console) syncs your Web search data daily and adds an **AI Prompts** view that flags long, conversational queries (a heuristic), a striking-distance list (best page at positions 5–20) and search opportunities that join pages at positions 4–20 with GA4 organic landing-page data. You can add Search Console queries as tracked prompts; the same data is available to AI assistants through the [MCP server](/mcp-server).",
    },
    {
      type: "p",
      text: "Know the limits. AutoSEO collects single-turn, desktop, non-personalized answers and doesn't follow up inside AI Mode. Google doesn't expose the fan-out queries behind either feature, so DataForSEO answers for these two engines carry none (simulated answers store the stand-in model's own searches, not Google's); its [query fan-out analysis](/query-fanout-analysis) is filled by engines whose answers include them. The Generative AI performance report is not part of the Search Console sync.",
    },

    {
      type: "callout",
      tone: "info",
      title: "Method and limitations",
      text: "This post summarizes Google's public documentation and announcements as of September 2026; AutoSEO has no proprietary dataset. Well documented: the Search Console counting rules, the report fields and the opt-out controls. Fast-changing: default models, availability of individual capabilities, ad formats and link designs. Not published by Google: the fan-out queries, how cited links are chosen and a click split by feature. User numbers and the “higher quality clicks” statement are Google's own claims.",
    },
  ],
  faq: [
    {
      q: "Is there a filter for AI Mode in the Search Console Performance report?",
      a: "No. AI Overviews and AI Mode are counted inside the “Web” search type. The Generative AI performance report shows AI impressions by page, country, date and device, but no clicks, no queries and no documented split between the two features.",
    },
    {
      q: "Do I need special markup or an AI text file to appear in AI Overviews or AI Mode?",
      a: "No. Google says there are no additional technical requirements, and you don't need new machine-readable files, AI text files or special schema.org markup. A page must be indexed and eligible to be shown with a snippet.",
    },
    {
      q: "Does blocking Google-Extended remove my site from AI Overviews?",
      a: "No. Google-Extended covers Gemini model training and grounding in Gemini Apps and Vertex AI, and Google states it doesn't affect inclusion in Google Search. To leave AI Overviews and AI Mode, use the Search generative AI control or preview controls such as nosnippet.",
    },
    {
      q: "Will excluding my site from AI features hurt its regular rankings?",
      a: "Google says the Search generative AI control isn't a ranking or inclusion signal for other parts of Search. You do lose all traffic and impressions from the excluded features, so check the Generative AI performance report first.",
    },
    {
      q: "Why does a tracked AI Mode answer differ from what I see in my browser?",
      a: "Answers vary with location, language, device and time, and AI Mode can personalize using your Search history. Tracking collects a neutral, single-turn answer per market, so compare trends over several runs.",
    },
  ],
  sources: [
    { label: "Google Search Central: AI features and your website (2025)", href: "https://developers.google.com/search/docs/appearance/ai-features" },
    {
      label: "Google Search Central: Optimizing your website for generative AI features on Google Search (2026)",
      href: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide",
    },
    { label: "Search Console Help: What are impressions, position, and clicks? (2026)", href: "https://support.google.com/webmasters/answer/7042828" },
    { label: "Search Console Help: Generative AI performance report (Search) (2026)", href: "https://support.google.com/webmasters/answer/16984139" },
    { label: "Search Console Help: Search generative AI control (2026)", href: "https://support.google.com/webmasters/answer/16908024" },
    {
      label: "Google: New opportunities, control and insights for website owners (2026)",
      href: "https://blog.google/products-and-platforms/products/search/new-controls-website-owners/",
    },
    {
      label: "Google Crawling Infrastructure: Google-Extended (2026)",
      href: "https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended",
    },
    { label: "Google Search Help: Get AI-powered responses with AI Mode in Google Search (2026)", href: "https://support.google.com/websearch/answer/16011537" },
    {
      label: "Google: Just ask anything: a seamless new Search experience (2026)",
      href: "https://blog.google/products-and-platforms/products/search/ai-mode-ai-overviews-updates/",
    },
    { label: "Google: A new era for AI Search, I/O 2026 (2026)", href: "https://blog.google/products-and-platforms/products/search/search-io-2026/" },
    { label: "Google: AI Mode in Google Search, updates from I/O 2025 (2025)", href: "https://blog.google/products/search/google-search-ai-mode-update/" },
    {
      label: "Google: AI Mode is now available in more languages and locations (2025)",
      href: "https://blog.google/products-and-platforms/products/search/ai-mode-expands-languages-locations/",
    },
    {
      label: "Google: Bringing AI Overviews to more countries in Europe (2025)",
      href: "https://blog.google/feed/were-bringing-the-helpfulness-of-ai-overviews-to-more-countries-in-europe/",
    },
    { label: "Google Ads Help: About ads and AI Overviews (2026)", href: "https://support.google.com/google-ads/answer/16297775" },
    { label: "Google Ads Help: Google Ads Highlights of 2025 (2025)", href: "https://support.google.com/google-ads/answer/16756291" },
  ],
};
