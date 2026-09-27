import type { BlogPost } from "../types";

const OPENAI = "https://developers.openai.com/api/docs/bots";
const ANTHROPIC = "https://support.claude.com/en/articles/8896518";
const PERPLEXITY = "https://docs.perplexity.ai/guides/bots";
const GOOGLE_CRAWLERS = "https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers";
const GOOGLE_AI = "https://developers.google.com/search/docs/appearance/ai-features";
const GOOGLE_META = "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag";
const GOOGLE_JS = "https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics";
const APPLE = "https://support.apple.com/en-us/119829";
const BING = "https://blogs.bing.com/webmaster/October-2025/Bing-Introduces-Support-for-the-data-nosnippet-HTML-Attribute";
const META = "https://developers.facebook.com/docs/sharing/webmasters/web-crawlers";
const CCBOT = "https://commoncrawl.org/ccbot";
const VERCEL = "https://vercel.com/blog/the-rise-of-the-ai-crawler";
const LLMSTXT = "https://llmstxt.org/";
const CLOUDFLARE = "https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/";
const RFC9309 = "https://www.rfc-editor.org/rfc/rfc9309.html";

export const post: BlogPost = {
  slug: "ai-crawler-readability",
  title: "Can AI crawlers read your site? A crawler-by-crawler guide",
  description:
    "Which AI crawlers visit your site, which obey robots.txt, and how JavaScript, snippet rules, CDN bot settings and llms.txt affect what they can read.",
  date: "2026-09-26",
  authorSlug: "autoseo-team",
  tags: ["ai-crawlers", "technical"],
  readingMinutes: 11,
  lead:
    "Most AI crawlers read your site like a basic HTTP client: they check robots.txt for their own token, request the HTML and, according to third-party analysis, mostly do not run JavaScript. Whether they get your content depends on four layers you control: per-crawler robots.txt rules, your CDN or firewall, page directives such as `noindex` and `nosnippet`, and whether the text is in the server-rendered HTML. Search indexers and user-triggered fetchers decide whether you can be cited; training crawlers such as GPTBot and ClaudeBot can be opted out separately.",
  blocks: [
    { type: "h2", text: "Which AI crawlers visit your site, and what does each one do?" },
    {
      type: "p",
      text: "Vendors now split their bots by job: **training crawlers** collect content for models, **search indexers** build the index an assistant searches, and **user-triggered fetchers** load a page because a user asked about it. Google-Extended and Applebot-Extended are only robots.txt control tokens and never fetch pages.",
    },
    {
      type: "table",
      head: ["Crawler", "Operator", "Purpose (vendor wording, condensed)", "robots.txt token", "Source"],
      rows: [
        ["GPTBot", "OpenAI", "Content that may be used to train OpenAI's foundation models", "`GPTBot`", `[OpenAI (2026)](${OPENAI})`],
        ["OAI-SearchBot", "OpenAI", "Surfaces websites in ChatGPT search", "`OAI-SearchBot`", `[OpenAI (2026)](${OPENAI})`],
        ["ChatGPT-User", "OpenAI", "User actions in ChatGPT and Custom GPTs", "None; rules “may not apply”", `[OpenAI (2026)](${OPENAI})`],
        ["ClaudeBot", "Anthropic", "Web content for model training", "`ClaudeBot`", `[Anthropic (2026)](${ANTHROPIC})`],
        ["Claude-SearchBot", "Anthropic", "Indexing to improve Claude's search results", "`Claude-SearchBot`", `[Anthropic (2026)](${ANTHROPIC})`],
        ["Claude-User", "Anthropic", "Fetches pages when a user asks Claude", "`Claude-User`", `[Anthropic (2026)](${ANTHROPIC})`],
        ["PerplexityBot", "Perplexity", "Perplexity search results; not used for training", "`PerplexityBot`", `[Perplexity (2026)](${PERPLEXITY})`],
        ["Perplexity-User", "Perplexity", "Visits pages to answer a user's question", "`Perplexity-User` (“generally ignores” robots.txt)", `[Perplexity (2026)](${PERPLEXITY})`],
        ["Googlebot", "Google", "Google Search, including AI Overviews and AI Mode", "`Googlebot`", `[Google (2025)](${GOOGLE_AI})`],
        ["Google-Extended", "Google", "Control token: Gemini training and grounding in Gemini Apps and Vertex AI", "`Google-Extended`", `[Google (2026)](${GOOGLE_CRAWLERS})`],
        ["Bingbot", "Microsoft", "Bing index, which also powers Copilot", "`bingbot`", `[Bing (2025)](${BING})`],
        ["Applebot", "Apple", "Spotlight, Siri and Safari search; may also train Apple models", "`Applebot`", `[Apple (2026)](${APPLE})`],
        ["Applebot-Extended", "Apple", "Control token: opt out of Apple model training", "`Applebot-Extended`", `[Apple (2026)](${APPLE})`],
        ["Meta-WebIndexer", "Meta", "Meta AI search results", "`meta-webindexer`", `[Meta (2026)](${META})`],
        ["Meta-ExternalAgent", "Meta", "Training foundation models or improving products", "`meta-externalagent`", `[Meta (2026)](${META})`],
        ["Meta-ExternalFetcher", "Meta", "Links fetched at a user's request; “may bypass robots.txt rules”", "`meta-externalfetcher`", `[Meta (2026)](${META})`],
        ["CCBot", "Common Crawl", "Common Crawl's open web archive", "`CCBot`", `[Common Crawl (2026)](${CCBOT})`],
      ],
      caption: "Vendor documentation as retrieved in September 2026. AI Overviews and AI Mode use Google's regular search index, and Microsoft describes Copilot experiences as powered by Bing.",
    },

    { type: "h2", text: "Do AI crawlers obey robots.txt?" },
    {
      type: "p",
      text: "The automated crawlers do, by their vendors' own statements. For user-triggered fetchers the wording differs:",
    },
    {
      type: "ul",
      items: [
        "**OpenAI:** GPTBot and OAI-SearchBot settings are “independent of the others”. For ChatGPT-User, “robots.txt rules may not apply” because a user initiated the action.",
        "**Anthropic:** its bots “respect ‘do not crawl’ signals by honoring industry standard directives in robots.txt”, Claude-User included. It also supports the non-standard `Crawl-delay`.",
        "**Perplexity:** PerplexityBot follows robots.txt; Perplexity-User “generally ignores robots.txt rules” since a user requested the fetch.",
        "**Google:** common crawlers “always obey robots.txt rules when crawling automatically”.",
        "**Meta:** Meta-ExternalFetcher “may bypass robots.txt rules”.",
        "**Apple:** Applebot respects robots.txt directives aimed at it in general search crawls.",
      ],
    },
    {
      type: "p",
      text: "Changes take time: OpenAI cites about 24 hours, Perplexity up to 24 hours. And robots.txt is a request, not a lock; [RFC 9309](" +
        RFC9309 +
        ") says its rules “are not a form of access authorization”. OpenAI, Anthropic, Perplexity, Apple and Common Crawl publish IP ranges for verification, and Google documents reverse-DNS patterns. Anthropic warns that blocking its IPs can stop it from reading your robots.txt, so robots.txt remains its documented opt-out.",
    },

    { type: "h2", text: "How do you allow AI search but opt out of training?" },
    {
      type: "p",
      text: "Put search indexers and training crawlers in separate groups. This starting point keeps a site citable in AI answers while opting out of model training; replace the example paths with your own.",
    },
    {
      type: "code",
      lang: "text",
      title: "robots.txt",
      code: `# AI search indexers and user-triggered fetchers: allowed
User-agent: OAI-SearchBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: meta-webindexer
Disallow: /cart/
Disallow: /account/

# Model training (crawlers and control tokens): opted out
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: meta-externalagent
User-agent: CCBot
Disallow: /

# Everyone else, including Googlebot, Bingbot and Applebot
User-agent: *
Disallow: /cart/
Disallow: /account/

Sitemap: https://www.example.com/sitemap.xml`,
    },
    { type: "h3", text: "What are the caveats?" },
    {
      type: "ol",
      items: [
        "**Groups don't inherit.** Under RFC 9309 a crawler follows the group naming it and uses the wildcard group only if none does, so repeat your exclusions in each group.",
        "**Google-Extended is broader than training.** It also covers grounding in Gemini Apps and on Vertex AI, but it does not affect Google Search, so it won't remove you from AI Overviews or AI Mode.",
        "**Some crawlers are mixed-purpose.** Applebot data may also train Apple's models (Applebot-Extended opts out), and Meta-ExternalAgent serves training or product improvement.",
        "**Blocking Googlebot or Bingbot is not a training opt-out.** It removes you from Google Search, including its AI features, or from the Bing index behind Copilot.",
        "**User-triggered fetchers** such as ChatGPT-User, Perplexity-User and Meta-ExternalFetcher may ignore these rules, so the file omits them.",
        "**Keep the file reachable.** RFC 9309 tells crawlers to assume complete disallow when robots.txt returns a server error (5xx).",
        "**CCBot is a judgment call:** it feeds a public archive whose reuse you don't control.",
      ],
    },

    { type: "h2", text: "Can AI crawlers read JavaScript-rendered content?" },
    {
      type: "p",
      text: "Some can, and most vendors don't say. [Google documents](" +
        GOOGLE_JS +
        ") a crawl, render and index pipeline in which Googlebot runs JavaScript in “an evergreen version of Chromium”, yet still calls server-side or pre-rendering “a great idea” because “not all bots can run JavaScript”. Apple says Applebot “may render the content of your website within a browser”. The OpenAI, Anthropic and Perplexity crawler pages don't address rendering.",
    },
    {
      type: "p",
      text: "The best public evidence is third-party. In [The rise of the AI crawler](" +
        VERCEL +
        ") (December 2024), Vercel and MERJ analyzed traffic on Vercel's network and found that “none of the major AI crawlers currently render JavaScript”. GPTBot and Claude downloaded JavaScript files (11.50% and 23.84% of their requests) without executing them; Google's Gemini and AppleBot rendered pages.",
    },
    {
      type: "p",
      text: "That is one platform's snapshot from almost two years ago. The conclusion holds either way: put what you want quoted (product facts, prices, specs, answers, internal links) into the initial HTML via server-side rendering or static generation.",
    },

    { type: "h2", text: "Which page-level directives keep content out of AI answers?" },
    {
      type: "p",
      text: "For Google, AI features inherit Search rules. A supporting link in AI Overviews or AI Mode “must be indexed and eligible to be shown in Google Search with a snippet”, with no additional requirements. The controls are `noindex`, `nosnippet`, `max-snippet` and `data-nosnippet`, set as a meta robots tag or an `X-Robots-Tag` header, which can target one crawler (`X-Robots-Tag: googlebot: nofollow`).",
    },
    {
      type: "table",
      head: ["Claim", "What the source says", "Source (year)"],
      rows: [
        ["`nosnippet` affects Google's AI features", "It “will also prevent the content from being used as a direct input for AI Overviews and AI Mode”", `[Google Search Central (2026)](${GOOGLE_META})`],
        ["`max-snippet` caps AI input", "It “will also limit how much of the content may be used as a direct input” for both", `[Google Search Central (2026)](${GOOGLE_META})`],
        ["Bing applies `data-nosnippet` to AI answers", "Marked content is “excluded from snippets and AI summaries”", `[Bing Webmaster Blog (2025)](${BING})`],
        ["Google needs no special AI files", "“You don't need to create new machine readable files, AI text files, or markup to appear in these features.”", `[Google Search Central (2025)](${GOOGLE_AI})`],
      ],
      caption: "Direct statements from primary documentation, retrieved September 2026.",
    },
    {
      type: "p",
      text: "The trade-off: these directives also cut your regular snippets, and Google documents no switch for its AI features alone. Check templates for leftovers such as a staging `max-snippet:0`. For how the two Google surfaces differ, see [AI Mode vs AI Overviews](/blog/ai-mode-vs-ai-overviews).",
    },

    { type: "h2", text: "Can a CDN or firewall block AI crawlers without you noticing?" },
    {
      type: "p",
      text: "Yes. robots.txt can allow a crawler that your edge then blocks or challenges. Cloudflare is the clearest case because its defaults just changed. As of September 2026, [its documentation](" +
        CLOUDFLARE +
        ") sorts AI bots by behavior: **Search** (indexing to answer questions later), **Agent** (real-time activity on a person's behalf, “such as chat fetch bots and browser-use agents”) and **Training**. Each can be blocked on all pages, blocked on pages with ads, or allowed.",
    },
    {
      type: "p",
      text: "Since September 15, 2026, new domains get Training and Agent blocked on pages that display ads, with Search allowed. Mixed-purpose crawlers that combine Search and Training are blocked by every configuration that blocks training, including the legacy **Block AI bots** setting. So on a new domain, a user-triggered fetch of an ad-supported page can fail by default. Review **Security Settings → Configure AI bot policies** (labels as of September 2026) and any custom firewall rules on whichever CDN you use, then test with real requests.",
    },

    { type: "h2", text: "Does llms.txt help AI crawlers read your site?" },
    {
      type: "p",
      text: "There's no official evidence that it does, and it controls nothing. [llms.txt](" +
        LLMSTXT +
        ") is a proposal by Jeremy Howard, first published on September 3, 2024 and revised as v2 on August 10, 2026: a Markdown file at `/llms.txt` with the site name as H1, a short summary, and H2 sections listing key links. It is not a formal standard and neither grants nor denies access.",
    },
    {
      type: "p",
      text: "The proposal notes that OpenAI, Anthropic and Google's Gemini team publish llms.txt files for their developer docs, but publishing is not consuming. Google says no AI text files are needed for AI Overviews or AI Mode. None of the crawler documentation cited here mentions reading llms.txt, and as of September 2026 we found no official statement from OpenAI, Anthropic, Perplexity, Microsoft or Google committing to use it.",
    },
    {
      type: "p",
      text: "If you publish one anyway, keep it accurate and in sync with your sitemap, and never make it the only place important content lives.",
    },

    { type: "h2", text: "What does this mean for you?" },
    {
      type: "p",
      text: "Access is the precondition for citations, not a guarantee (for what earns them, see [which GEO techniques work](/blog/geo-techniques)). For access itself:",
    },
    {
      type: "ol",
      items: [
        "**Decide per purpose, not per vendor.** Allow search indexers and user-triggered fetchers; decide on training crawlers separately.",
        "**Test the path, not just the file.** Request key pages with each crawler's user agent and re-check CDN bot settings after every security change.",
        "**Server-render what should be quoted:** pricing, product facts, docs and FAQs.",
        "**Audit templates** for `noindex`, `nosnippet` and `max-snippet:0` on pages you want cited.",
        "**Keep robots.txt fast and returning 200**, list your sitemap, and allow a day for changes.",
        "**Verify in logs by IP, not user agent.** Anyone can send a GPTBot user-agent string.",
        "**Treat llms.txt as optional housekeeping.**",
      ],
    },
    { type: "h3", text: "Example: fixing crawler access for a pricing page" },
    {
      type: "p",
      text: "Example (hypothetical; all numbers are illustrative): a B2B software company wants to be cited by ChatGPT, Claude and Perplexity but opt out of model training.",
    },
    {
      type: "ol",
      items: [
        "Its robots.txt blocks GPTBot and ClaudeBot on purpose, and a crawlability check confirms OAI-SearchBot, Claude-SearchBot and PerplexityBot are allowed.",
        "The live fetch disagrees: with those three user agents, `/pricing` returns HTTP 403 while a browser gets 200. A firewall rule from a past scraping incident blocks most non-browser user agents.",
        "The raw HTML of `/pricing` has 30 words and an empty `#root` container, so crawlers that skip JavaScript see no prices.",
        "The docs template sets `max-snippet:0` site-wide, left over from staging.",
        "The team exempts the search crawlers' published IP ranges from the firewall rule, pre-renders `/pricing`, removes `max-snippet:0` and re-runs the check.",
        "Two weeks of logs show OAI-SearchBot and PerplexityBot fetching `/pricing` with status 200 from IPs inside the vendors' ranges: the fix reached the real crawlers, not just a test.",
      ],
    },

    { type: "h2", text: "How can you check crawler access with AutoSEO?" },
    {
      type: "p",
      text: "The [AI crawlability check](/ai-crawlability) evaluates robots.txt for 25 AI and search crawler tokens (plus two SEO tool crawlers, shown but not scored), including the share of up to 300 sitemap URLs each may not fetch, and treats a 5xx robots.txt as a full block. It requests up to three key pages with each crawler's user agent and compares status, redirects and word count with a browser, which exposes firewall challenges. It also reads meta robots and `X-Robots-Tag` (including bot-specific tags such as `gptbot`), judges from the raw HTML whether pages depend on JavaScript, validates llms.txt, and checks sitemaps, canonicals and JSON-LD.",
    },
    {
      type: "p",
      text: "Findings include fixes, such as a robots.txt snippet that re-allows blocked search crawlers while keeping your exclusions, or an llms.txt draft built from your latest [site audit](/site-audit). Checks can run weekly or monthly with score-drop alerts, or via `run_crawlability_check` on the [MCP server](/mcp-server). The score weighs search and user-triggered crawlers three times as much as training crawlers; llms.txt carries 10 of 100 points, so given the evidence above, weigh a missing file below a blocked search crawler.",
    },
    {
      type: "p",
      text: "The user-agent test runs from AutoSEO's servers, so a firewall that admits only verified crawler IPs may block the test but not the real crawler. Logs settle it: [AI bot traffic](/ai-bot-traffic) imports access logs (nginx, Apache, Cloudflare Logpush, Akamai DataStream 2, NDJSON; up to 1 GB) or streams them via a Cloudflare Worker ([bot traffic integrations](/integrations/bot-traffic), [Cloudflare](/integrations/cloudflare)). Each hit is matched to a crawler and checked against the published IP ranges of OpenAI, Anthropic, Perplexity, Google, Microsoft and Apple, separating verified visits from likely spoofed ones, with status codes per path.",
    },
    {
      type: "callout",
      tone: "info",
      title: "Method and limitations",
      text: "This post summarizes vendor documentation retrieved in September 2026, RFC 9309 and one third-party analysis (Vercel and MERJ, 2024); AutoSEO has no proprietary crawler dataset. Crawler lists and CDN defaults change often, and the JavaScript finding may be outdated. Statements about user-triggered fetchers use the vendors' own hedged wording, not guarantees. Re-check the linked pages before making blocking decisions.",
    },
  ],
  faq: [
    {
      q: "Does blocking GPTBot remove my site from ChatGPT search?",
      a: "No. OpenAI says GPTBot (training) and OAI-SearchBot (ChatGPT search) are controlled independently. Sites opted out of OAI-SearchBot “will not be shown in ChatGPT search answers, though can still appear as navigational links”.",
    },
    {
      q: "Will blocking Google-Extended keep my content out of AI Overviews?",
      a: "No. Google says Google-Extended does not affect inclusion in Google Search, and AI Overviews and AI Mode link to indexed, snippet-eligible pages. To limit what appears there, use `nosnippet`, `data-nosnippet`, `max-snippet` or `noindex`, which also affect regular snippets.",
    },
    {
      q: "How can I tell whether a request claiming to be GPTBot or ClaudeBot is real?",
      a: "Check the source IP against the vendor's published list, such as `openai.com/gptbot.json` or `claude.com/crawling/bots.json`; Google and Apple also document reverse-DNS checks. A matching user-agent string alone proves nothing.",
    },
    {
      q: "How long do robots.txt changes take to reach AI crawlers?",
      a: "OpenAI cites about 24 hours for its search systems, Perplexity up to 24 hours. RFC 9309 says crawlers should not use a cached robots.txt for more than 24 hours unless the file is unreachable. Plan for a day or more and confirm the change in your logs.",
    },
    {
      q: "Should I still publish an llms.txt file?",
      a: "It is optional. No major AI vendor has officially said its crawlers use it, and Google says no AI text files are needed for AI Overviews or AI Mode. If you publish one, keep it accurate and treat it as a convenience for agents, not as access control.",
    },
  ],
  sources: [
    { label: "OpenAI: Overview of OpenAI Crawlers (2026)", href: OPENAI },
    { label: "Anthropic: Does Anthropic crawl data from the web, and how can site owners block the crawler? (2026)", href: ANTHROPIC },
    { label: "Perplexity: Perplexity Crawlers (2026)", href: PERPLEXITY },
    { label: "Google Search Central: Google's common crawlers (2026)", href: GOOGLE_CRAWLERS },
    { label: "Google Search Central: AI features and your website (2025)", href: GOOGLE_AI },
    { label: "Google Search Central: Robots meta tag, data-nosnippet, and X-Robots-Tag specifications (2026)", href: GOOGLE_META },
    { label: "Google Search Central: Understand JavaScript SEO basics (2026)", href: GOOGLE_JS },
    { label: "Apple: About Applebot (2026)", href: APPLE },
    { label: "Bing Webmaster Blog: Bing Introduces Support for the data-nosnippet HTML Attribute (2025)", href: BING },
    { label: "Meta for Developers: Meta Web Crawlers (2026)", href: META },
    { label: "Common Crawl: CCBot (2026)", href: CCBOT },
    { label: "Vercel and MERJ: The rise of the AI crawler (2024)", href: VERCEL },
    { label: "Jeremy Howard: The /llms.txt file, llmstxt.org (2024, v2 2026)", href: LLMSTXT },
    { label: "Cloudflare Docs: Block AI Bots and AI bot policies (2026)", href: CLOUDFLARE },
    { label: "IETF: RFC 9309, Robots Exclusion Protocol (2022)", href: RFC9309 },
  ],
};
