import type { Playbook } from "@/components/site/company/types";

/** Reproducible GEO playbooks (/case-studies/[slug]). Methodology only: no customer data, no promised outcomes. */
const playbooks: Playbook[] = [
  {
    slug: "win-comparison-prompts",
    crumb: "Win comparison prompts",
    icon: "swords",
    meta: {
      title: "Playbook: Win AI Comparison Prompts in Your Category",
      description:
        "A GEO playbook: prompt set for “best X” and “A vs. B” questions, baseline in AutoSEO, actions, and how to measure share of voice without fooling yourself.",
    },
    hero: {
      title: "Win comparison prompts in your category",
      subtitle:
        "When buyers ask AI “what's the best … for …?” or “A or B?”, the answer is a shortlist. This playbook measures whether you are on it, finds out why competitors are, and shows what to change.",
    },
    teaser: "Measure how often AI recommends you in “best X for Y” and “A vs. B” answers, close the gaps competitors fill and track share of voice.",
    facts: [
      { label: "Goal", value: "Higher mention rate and share of voice in comparison answers" },
      { label: "For", value: "Brands in competitive categories, SaaS, e-commerce" },
      { label: "Baseline", value: "7 days of daily tracking" },
      { label: "Re-measure", value: "After 6–8 weeks, then monthly" },
    ],
    goal: [
      {
        type: "p",
        text: "Increase how often AI engines name your brand, and how prominently, when people ask for recommendations or comparisons in your category. The primary metrics for a fixed prompt set are **mention rate** (the share of answers that mention you) and **share of voice** (your mentions relative to those of the competitors you track). **Position** and **sentiment** are secondary.",
      },
    ],
    audience: [
      "Brands in categories where buyers compare options before they buy",
      "SaaS and software companies competing on “best tool” lists",
      "E-commerce brands competing for product recommendations",
      "Agencies preparing a competitive GEO analysis for a client",
    ],
    prompts: {
      intro:
        "Twelve templates covering the three shapes comparison questions take: shortlist (“best”), head-to-head (“vs.”) and alternative (“instead of”). The tags let you filter results by shape later.",
      placeholders: [
        "`[category]` — your product category in your buyers' words, e.g. “project management software”",
        "`[audience]` — a buyer segment, e.g. “small agencies”",
        "`[use case]` — a job to be done, e.g. “client reporting”",
        "`[competitor]` — your strongest competitor (duplicate the rows for more)",
        "`[brand]` — your brand name",
        "`[budget]` — a realistic constraint, e.g. “under $50 a month”",
      ],
      rows: [
        { prompt: "What is the best [category] for [audience]?", tags: ["Comparison", "Shortlist"] },
        { prompt: "Which [category] do experts recommend?", tags: ["Comparison", "Shortlist"] },
        { prompt: "Top 5 [category] for [use case]", tags: ["Comparison", "Shortlist"] },
        { prompt: "What is the best [category] [budget]?", tags: ["Comparison", "Shortlist", "Budget"] },
        { prompt: "Which [category] is easiest to set up for [audience]?", tags: ["Comparison", "Shortlist"] },
        { prompt: "[brand] vs. [competitor]: which is better for [use case]?", tags: ["Comparison", "Head-to-head"] },
        { prompt: "[competitor] vs. [brand] for [audience]", tags: ["Comparison", "Head-to-head"] },
        { prompt: "Is [brand] better than [competitor]?", tags: ["Comparison", "Head-to-head"] },
        { prompt: "What are the best alternatives to [competitor]?", tags: ["Comparison", "Alternative"] },
        { prompt: "What should I use instead of [competitor] for [use case]?", tags: ["Comparison", "Alternative"] },
        { prompt: "Cheaper alternative to [competitor] for [audience]", tags: ["Comparison", "Alternative", "Budget"] },
        { prompt: "What are the pros and cons of [brand]?", tags: ["Comparison", "Brand"] },
      ],
    },
    engines: {
      intro: "Comparison answers differ a lot between engines, so track several — and keep the same engines for the whole measurement period.",
      head: ["Engine", "Why it matters for comparison prompts"],
      rows: [
        ["ChatGPT", "The assistant most people use for open questions; with web search, it cites the sources behind its shortlist."],
        ["Perplexity", "Cites sources in every answer, so you see exactly which comparison pages shape the shortlist."],
        ["Google AI Overviews and AI Mode", "Appear above or instead of classic results for “best …” searches."],
        ["Gemini, Claude, Microsoft Copilot", "Add them if your buyers work in Google Workspace, Claude or Microsoft 365."],
      ],
    },
    baseline: [
      {
        title: "Create the project",
        body: "Add your website as a project, set the country and language of your target market and add three to five competitors under AI Visibility → Competitors.",
      },
      {
        title: "Import the prompt set",
        body: "Replace the placeholders, then import the CSV under AI Visibility → Tracker → Import CSV. The tags are imported with the prompts.",
      },
      {
        title: "Choose engines and frequency",
        body: "Under AI Visibility → Model Settings, select the engines from the table above and set tracking to daily for the baseline week.",
      },
      {
        title: "Freeze the baseline",
        body: "After seven daily runs, note mention rate, share of voice, position and sentiment per tag, and save a report from the Baseline Snapshot template.",
      },
    ],
    actions: [
      {
        title: "Read the answers, not just the scores",
        body: "Open the answers that name competitors but not you. Note the reasons AI gives — price, integrations, audience fit. Those reasons are your content brief.",
      },
      {
        title: "Fix the sources behind the shortlist",
        body: "AI Visibility → Sources shows which pages and domains are cited for these prompts. Work on being included where you are missing: comparison articles, review platforms, directories.",
      },
      {
        title: "Publish honest comparison pages",
        body: "Create “[brand] vs. [competitor]” and “alternatives to [competitor]” pages with accurate, dated facts, a clear verdict per use case and a comparison table.",
      },
      {
        title: "Make key facts easy to extract",
        body: "State pricing, target audience, integrations and limits as plain text on crawlable pages, not only in images, PDFs or scripts. Check it with Crawlability.",
      },
      {
        title: "Work through the task list",
        body: "Optimizations → Tasks turns tracker, source and audit evidence into prioritized tasks. Push them to Jira, Linear or Asana so they actually get done.",
      },
      {
        title: "Keep the prompt set frozen",
        body: "Don't edit or remove prompts during a measurement period. Add new prompts under a new tag so the original set stays comparable.",
      },
    ],
    measure: {
      items: [
        "Compare the same prompt set, engines, country and language as in the baseline",
        "Use averages over at least seven runs per period, never single days",
        "Look at mention rate and share of voice per tag (shortlist, head-to-head, alternative) separately",
        "Check whether the sources you worked on now appear under Sources for these prompts",
        "Watch sentiment and the reasons AI gives, not only whether you are mentioned",
        "Present before and after with the Competitor Benchmark or Monthly Report template",
      ],
      aside: [
        { type: "h3", text: "A simple decision rule" },
        {
          type: "p",
          text: "Treat a change as real only if it holds for two consecutive measurement periods and shows up in more than one engine. A one-week spike in a single engine is usually noise.",
        },
      ],
    },
    variance: [
      {
        type: "p",
        text: "AI answers are probabilistic. The same prompt can produce a different shortlist tomorrow, in another country or after a model update. Expect mention rates to move by several percentage points from day to day even when nothing changed on your side — the smaller the prompt set, the larger the swings.",
      },
      { type: "p", text: "Three habits make your numbers more trustworthy:" },
      {
        type: "ul",
        items: [
          "**More prompts:** twelve prompts give a rough signal; 30–50 prompts per topic give a much steadier one.",
          "**More runs:** daily tracking over a week averages out the randomness of single answers.",
          "**A stable setup:** changing engines, providers, country or language breaks comparability. AutoSEO labels simulated engines, so you can keep them apart from native answers.",
        ],
      },
      {
        type: "callout",
        tone: "warn",
        title: "Engines change underneath you",
        text: "Model updates can shift answers for everyone at once. If all tracked brands move in the same direction at the same time, suspect the engine, not your work.",
      },
    ],
    limitations: [
      "Tracking shows what engines answer to your prompts, not how many real people ask them — there is no equivalent of search volume for prompts.",
      "Answers retrieved through APIs or data providers can differ from what a signed-in user sees in a consumer app with personalization and memory.",
      "Changes to your pages only take effect after engines recrawl or retrieve them again; the timing is outside your control.",
      "Share of voice is relative to the competitors you track. Changing the competitor list changes the comparison, so keep it fixed for a before-and-after.",
    ],
    faq: [
      {
        q: "How many prompts do I need?",
        a: "Start with the twelve templates, expanded to your categories and competitors. For decisions, aim for 30 to 50 prompts per topic, because more prompts smooth out the randomness of individual answers. Keep the set fixed during a measurement period.",
      },
      {
        q: "How long until I see a change?",
        a: "There is no reliable timeline. Engines that search the web live, such as ChatGPT with search, Perplexity and Google AI Overviews, can pick up new or updated pages once they are crawled. Knowledge from model training only changes with new model versions. Re-measure after six to eight weeks and then monthly.",
      },
      {
        q: "Should my prompts include my brand name?",
        a: "Use both kinds and tag them separately, because they measure different things. Unbranded prompts such as “best [category]” show whether AI recommends you without being asked about you, which is the main goal here. Branded prompts such as “[brand] vs. [competitor]” show how AI judges you once you are part of the question.",
      },
      {
        q: "Is it fair to publish comparison pages about competitors?",
        a: "Yes, if they are accurate, current and fair. Misleading comparisons damage trust and can breach comparative-advertising rules in many countries. Cite your sources, date your facts and update the pages when products change.",
      },
      {
        q: "Can I run this playbook for a client?",
        a: "Yes. Create a project for the client, import the prompt set and use the Pitch or Competitor Benchmark report templates for the presentation. Give the client read-only access with the Client role.",
      },
    ],
    reading: [
      { label: "What is query fan-out?", href: "/blog/query-fan-out", description: "How AI search splits one prompt into many searches, and what that means for your content." },
      { label: "Which GEO techniques work?", href: "/blog/geo-techniques", description: "What the research shows about raising AI visibility, why studies disagree and how to test a technique yourself." },
    ],
    related: ["get-cited-by-trusted-sources", "agency-pitch-in-14-days"],
  },
  {
    slug: "get-cited-by-trusted-sources",
    crumb: "Get cited by trusted sources",
    icon: "link",
    meta: {
      title: "Playbook: Get Cited by the Sources AI Engines Trust",
      description:
        "A reproducible GEO playbook to find the domains AI engines cite for your topics, close citation gaps with legitimate work and measure citation rate over time.",
    },
    hero: {
      title: "Get cited by the sources AI trusts",
      subtitle:
        "Engines that search the web build their answers from a small set of sources. If those sources don't mention you, the answer won't either. This playbook maps the sources behind your prompts and turns them into a content and outreach plan.",
    },
    teaser: "Find the pages and domains AI engines cite for your topics, see where you are missing and earn legitimate mentions there.",
    facts: [
      { label: "Goal", value: "Higher citation rate and more mentions in cited sources" },
      { label: "For", value: "Content, PR and SEO teams" },
      { label: "Baseline", value: "7–14 days of daily tracking" },
      { label: "Re-measure", value: "Monthly" },
    ],
    goal: [
      {
        type: "p",
        text: "Increase how often AI engines cite **your own pages** (citation rate) and how often the **third-party sources they cite** mention you. The first depends on your content; the second on your presence in publications, reviews, directories and communities.",
      },
    ],
    audience: [
      "Content teams deciding what to publish next",
      "PR teams choosing which publications to pitch",
      "SEO teams used to link building who want to prioritize by AI impact",
      "Brands in categories dominated by review and comparison sites",
    ],
    prompts: {
      intro:
        "Ten informational and commercial templates. Informational prompts reveal which explainers and guides engines rely on; commercial prompts reveal which reviews and lists they rely on.",
      placeholders: [
        "`[topic]` — a subject you want to be known for, e.g. “balcony solar systems”",
        "`[category]` — your product category",
        "`[problem]` — a problem your product solves",
        "`[audience]` — a buyer segment",
      ],
      rows: [
        { prompt: "What is [topic] and how does it work?", tags: ["Sources", "Informational"] },
        { prompt: "How do I choose a [category]?", tags: ["Sources", "Informational", "Buying guide"] },
        { prompt: "What should I look for when buying a [category]?", tags: ["Sources", "Informational", "Buying guide"] },
        { prompt: "How can I solve [problem]?", tags: ["Sources", "Informational"] },
        { prompt: "What are common mistakes with [topic]?", tags: ["Sources", "Informational"] },
        { prompt: "What is the best [category] according to reviews?", tags: ["Sources", "Commercial"] },
        { prompt: "Which [category] is the most reliable?", tags: ["Sources", "Commercial"] },
        { prompt: "Is a [category] worth it for [audience]?", tags: ["Sources", "Commercial"] },
        { prompt: "Which [category] brands are trustworthy?", tags: ["Sources", "Commercial"] },
        { prompt: "Where can I compare [category] options?", tags: ["Sources", "Commercial"] },
      ],
    },
    engines: {
      intro: "Citation analysis needs engines that show their sources.",
      head: ["Engine", "Why it matters for citations"],
      rows: [
        ["Perplexity", "Shows numbered sources for every answer — the clearest view of what gets cited."],
        ["ChatGPT (with web search)", "Cites sources when it searches, and it reaches the largest audience of any assistant."],
        ["Google AI Overviews and AI Mode", "Link to the pages they summarize, often pages that also rank in classic results."],
        ["Gemini and Microsoft Copilot", "Grounded in Google and Bing search respectively — useful to see where the two indexes differ."],
      ],
    },
    baseline: [
      {
        title: "Import and track",
        body: "Import the prompt set, select engines that cite sources and track daily for one to two weeks until the list of sources stabilizes.",
      },
      {
        title: "Map the sources",
        body: "AI Visibility → Sources lists the pages and domains cited for your prompts, grouped by source type. Note the most frequently cited domains.",
      },
      {
        title: "Mark your gaps",
        body: "For each top domain, check whether it mentions you, mentions only competitors or mentions neither. That is your gap list.",
      },
      {
        title: "Freeze the baseline",
        body: "Note your citation rate per engine and tag in the tracker and save a report from the Citation Analysis template.",
      },
    ],
    actions: [
      {
        title: "Prioritize by how often a source is cited",
        body: "Start with the domains cited most often for your prompts. A niche forum that appears in many answers matters more than a famous site that never does.",
      },
      {
        title: "Improve the pages you already own",
        body: "Answer the prompt's question in the first paragraph, add facts with dates and sources, and use clear headings and tables. Pages that engines already cite are your template.",
      },
      {
        title: "Earn mentions in editorial sources",
        body: "Offer data, expert comments or product access to the publications that get cited. Never pay for undisclosed placements — that is a legal and a trust risk.",
      },
      {
        title: "Complete your listings",
        body: "Keep your profiles on the review platforms, marketplaces and directories that appear under Sources complete and up to date.",
      },
      {
        title: "Join communities honestly",
        body: "If forums or Q&A sites are cited, contribute helpful answers under your real name and disclose your affiliation. Astroturfing gets removed and remembered.",
      },
      {
        title: "Check technical access",
        body: "Make sure AI crawlers can fetch your pages and that facts are in the HTML, not only in scripts or images. See the crawler access playbook.",
      },
    ],
    measure: {
      items: [
        "Citation rate of your own domain per engine, for the same prompt set, averaged over at least seven runs",
        "Number of top-cited domains that now mention you, re-checked by hand",
        "Mention rate and position for the prompts tagged Commercial",
        "New pages of yours appearing under Sources",
        "Before and after with the Citation Analysis report template",
      ],
      aside: [
        { type: "h3", text: "Log what you did and when" },
        {
          type: "p",
          text: "Keep a dated log of published pages, pitches and new listings. Without it, you can't connect a later change in citations to a specific action.",
        },
      ],
    },
    variance: [
      {
        type: "p",
        text: "Cited sources change more slowly than the wording of answers, but they do change: engines re-rank retrieved pages for every query, and web results shift. A single answer may cite three sources or fifteen. Judge a domain by how often it is cited across many answers, not by any one answer.",
      },
      {
        type: "callout",
        tone: "info",
        title: "Citations are not clicks",
        text: "Being cited does not guarantee traffic. Measure visits referred by AI platforms separately under Analytics → Human Traffic.",
      },
    ],
    limitations: [
      "You can influence third-party sources, but you can't control them: editors decide what they write.",
      "Engines answering without web search draw on training data and cite nothing; this playbook doesn't change those answers in the short term.",
      "Sources depend on country and language, so work on each market separately.",
      "A higher citation rate does not automatically mean more mentions: engines sometimes cite a page and still name other brands in the answer.",
    ],
    faq: [
      {
        q: "What is the difference between a mention and a citation?",
        a: "A mention is your brand name in the answer text. A citation is a link to a source the engine used. You can be cited without being mentioned, when your page informed an answer that names others, and mentioned without being cited, when the engine knows you from elsewhere. AutoSEO tracks both.",
      },
      {
        q: "Should I pay for placements on sites that get cited?",
        a: "Not for undisclosed ones. In most markets, paid placements must be labeled as advertising, and editors and engines increasingly discount obviously paid content. Earn mentions with useful data, expertise and product access instead.",
      },
      {
        q: "How many sources should I work on at once?",
        a: "Start with the ten domains cited most often for your commercial prompts. That is usually enough work for a quarter, and it focuses effort where engines actually look.",
      },
      {
        q: "Does classic SEO still matter for this?",
        a: "Yes. Engines that search the web often draw on pages that rank well in their search index. Keyword research, rank tracking and site audits in AutoSEO serve the same goal as this playbook.",
      },
      {
        q: "Why does Perplexity cite different sources than ChatGPT?",
        a: "They use different search indexes, retrieval methods and ranking. That is why this playbook tracks several engines and compares sources per engine instead of assuming one list fits all.",
      },
    ],
    reading: [
      { label: "Which GEO techniques work?", href: "/blog/geo-techniques", description: "What the research shows about raising AI visibility, why studies disagree and how to test a technique yourself." },
      { label: "What is query fan-out?", href: "/blog/query-fan-out", description: "How AI search splits one prompt into many searches, and what that means for your content." },
      { label: "AI Mode vs. AI Overviews", href: "/blog/ai-mode-vs-ai-overviews", description: "How Google's two AI answer formats differ and how to measure both." },
    ],
    related: ["win-comparison-prompts", "fix-ai-crawler-access"],
  },
  {
    slug: "fix-ai-crawler-access",
    crumb: "Fix AI crawler access",
    icon: "bot",
    meta: {
      title: "Playbook: Fix AI Crawler Access to Your Website",
      description:
        "A technical GEO playbook: check robots.txt, rendering, meta directives and sitemaps for AI crawlers, fix what blocks them and verify with real bot traffic.",
    },
    hero: {
      title: "Fix AI crawler access",
      subtitle:
        "If AI crawlers can't fetch or read your pages, no content strategy will help. This playbook runs the technical checks first, fixes what blocks AI engines and verifies the result with real crawler visits.",
    },
    teaser: "Check whether GPTBot, ClaudeBot, PerplexityBot and others can actually read your site, fix blocks and verify with bot traffic.",
    facts: [
      { label: "Goal", value: "AI crawlers can fetch and read your key pages" },
      { label: "For", value: "SEO, web and platform teams" },
      { label: "Baseline", value: "One crawlability check plus 7 days of tracking" },
      { label: "Re-measure", value: "After every fix and every release" },
    ],
    goal: [
      {
        type: "p",
        text: "Make sure the crawlers behind AI search and assistants — such as **OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot** and **Googlebot** — are allowed where you want them, receive the same content as browsers and find your important pages. This is the precondition for every other playbook.",
      },
      {
        type: "p",
        text: "Crawlers serve different purposes: **search** crawlers index pages for AI search, **user** agents fetch a page when someone asks about it, and **training** crawlers such as GPTBot and ClaudeBot collect data for future models. You can treat each group differently.",
      },
    ],
    audience: [
      "SEO teams who suspect technical reasons for low AI visibility",
      "Web and platform teams running CDNs, firewalls or bot protection",
      "Sites built as JavaScript single-page apps",
      "Anyone who changed robots.txt or bot settings and wants to verify the effect",
    ],
    prompts: {
      intro:
        "Ten retrieval prompts: factual questions that engines can only answer correctly if they can read your pages. They are the practical test of crawler access.",
      placeholders: [
        "`[brand]` — your brand name",
        "`[product]` — a product or plan",
        "`[feature]` — a feature documented on your site",
        "`[domain]` — your domain, e.g. “example.com”",
      ],
      rows: [
        { prompt: "What does [brand] cost?", tags: ["Retrieval", "Pricing"] },
        { prompt: "Does [brand] offer [feature]?", tags: ["Retrieval", "Product"] },
        { prompt: "What is [product] by [brand]?", tags: ["Retrieval", "Product"] },
        { prompt: "What integrations does [brand] support?", tags: ["Retrieval", "Product"] },
        { prompt: "Who is [brand] for?", tags: ["Retrieval", "Positioning"] },
        { prompt: "What is [brand]'s refund or cancellation policy?", tags: ["Retrieval", "Policy"] },
        { prompt: "How do I contact [brand] support?", tags: ["Retrieval", "Support"] },
        { prompt: "What is on the pricing page of [domain]?", tags: ["Retrieval", "Pricing"] },
        { prompt: "What is new at [brand]?", tags: ["Retrieval", "Freshness"] },
        { prompt: "Where is [brand] based and who runs it?", tags: ["Retrieval", "Company"] },
      ],
    },
    engines: {
      intro: "Track the engines whose crawlers you are fixing, so the effect can show up in answers.",
      head: ["Engine", "Crawlers involved"],
      rows: [
        ["ChatGPT", "OAI-SearchBot indexes for search, ChatGPT-User fetches pages on request, GPTBot collects training data."],
        ["Claude", "Claude-SearchBot, Claude-User and ClaudeBot (training) — each can be allowed or blocked separately."],
        ["Perplexity", "PerplexityBot indexes pages; Perplexity-User fetches them when someone asks."],
        ["Google AI Overviews, AI Mode and Gemini", "Rely on Googlebot's index. Google-Extended is a robots.txt token without its own crawler that governs use for Gemini models; it does not remove you from AI Overviews."],
      ],
    },
    baseline: [
      {
        title: "Run the crawlability check",
        body: "Optimizations → Crawlability checks robots.txt rules per AI crawler, crawl delay, whether crawler user agents get the same pages as browsers, server-side rendering, meta robots and X-Robots-Tag, sitemaps, llms.txt, structured data and canonicals.",
      },
      {
        title: "Decide your crawler policy",
        body: "Decide per purpose — search, user requests, training — which crawlers you allow. Write the decision down before you change anything.",
      },
      {
        title: "Connect bot traffic",
        body: "Under Analytics → Bot Traffic, connect Cloudflare or Akamai, upload server logs or send them via webhook. Visits are checked against the IP ranges crawler operators publish.",
      },
      {
        title: "Track the retrieval prompts",
        body: "Import the prompt set and track it daily for a week. Note which questions each engine answers correctly from your pages.",
      },
    ],
    actions: [
      {
        title: "Unblock the crawlers you want",
        body: "Remove disallow rules for the AI search and user crawlers you decided to allow. Look out for broad rules like `User-agent: *` with `Disallow: /` and for rules left over from staging.",
      },
      {
        title: "Check CDN and firewall rules",
        body: "Bot protection and WAF rules often block AI crawlers before robots.txt even matters. Allow verified crawlers explicitly, then re-run the check.",
      },
      {
        title: "Serve content in the HTML",
        body: "Many crawlers don't execute JavaScript and only see the raw HTML. Render key text, headings and links on the server.",
      },
      {
        title: "Remove accidental noindex and noai",
        body: "Check meta robots and X-Robots-Tag on key pages. noindex, noai or nosnippet can keep content out of answers.",
      },
      {
        title: "Publish sitemaps and an llms.txt",
        body: "A complete XML sitemap helps crawlers discover pages. llms.txt is optional and not used by every engine, but it is cheap to provide.",
      },
      {
        title: "Add structured data and clean canonicals",
        body: "JSON-LD on the homepage and key pages and unambiguous canonical URLs make it clear which page states which fact.",
      },
    ],
    measure: {
      items: [
        "Crawlability findings resolved, re-checked after each fix",
        "Verified visits per AI crawler under Bot Traffic, compared week over week",
        "Share of retrieval prompts answered correctly, per engine",
        "Citations of your own pages in the retrieval prompts' answers",
        "A new check after every release, because deployments often reintroduce blocks",
      ],
      aside: [
        { type: "h3", text: "Expect a delay" },
        {
          type: "p",
          text: "Crawlers revisit on their own schedule. It can take days or weeks until an unblocked page is fetched, and longer until it shows up in answers.",
        },
      ],
    },
    variance: [
      {
        type: "p",
        text: "The technical checks are deterministic: a robots.txt rule either blocks a crawler or it doesn't. The effect on answers is not. Whether an engine fetches your page for a question depends on its retrieval, and training crawlers only influence future model versions.",
      },
      {
        type: "p",
        text: "Crawler visits also fluctuate with crawl budgets and your own publishing activity. Compare weekly totals, not individual days.",
      },
    ],
    limitations: [
      "Allowing crawlers makes you eligible, not visible. Content and authority still decide whether engines use your pages.",
      "robots.txt is a request, not access control. Crawlers that ignore it have to be stopped at the CDN or firewall.",
      "Visits from crawlers whose operators publish no IP ranges can't be verified.",
      "Blocking training crawlers today does not remove your content from models that already exist.",
    ],
    faq: [
      {
        q: "Should I block AI training crawlers?",
        a: "That is a business decision, not a technical one. Blocking training crawlers such as GPTBot or ClaudeBot keeps your content out of future training data but does not affect content already used. Search and user crawlers such as OAI-SearchBot, ChatGPT-User, Claude-SearchBot and PerplexityBot let engines fetch your pages to answer questions — blocking them usually costs visibility.",
      },
      {
        q: "Does llms.txt improve AI visibility?",
        a: "No major engine has confirmed that it uses llms.txt for ranking or citations. The file is cheap to provide and helps some AI agents navigate your site, so AutoSEO checks it — but fix robots.txt, rendering and meta directives first.",
      },
      {
        q: "Why would crawlers get different pages than browsers?",
        a: "Usually because of bot protection: CDNs and firewalls serve challenges, blocks or stripped pages to unknown bots. AutoSEO fetches your pages with real crawler user agents and compares the result with a browser request, so you can see the difference.",
      },
      {
        q: "How do I know a visit really came from OpenAI or Anthropic?",
        a: "User agents can be faked. AutoSEO checks crawler visits against the IP ranges that OpenAI, Anthropic, Perplexity, Google and other operators publish, and separates verified from unverified visits.",
      },
      {
        q: "Do I need a developer for these fixes?",
        a: "For robots.txt and CDN settings, often not. Rendering problems, meta directives and structured data usually need your web team. Turn the findings into tasks and push them to Jira, Linear or your project tool from Optimizations → Tasks.",
      },
    ],
    reading: [
      { label: "Can AI crawlers read your site?", href: "/blog/ai-crawler-readability", description: "Which AI crawlers visit, which obey robots.txt, and how JavaScript, CDN bot settings and llms.txt affect them." },
    ],
    related: ["get-cited-by-trusted-sources", "protect-brand-facts"],
  },
  {
    slug: "protect-brand-facts",
    crumb: "Protect brand facts",
    icon: "shield",
    meta: {
      title: "Playbook: Protect Brand and Product Facts in AI Answers",
      description:
        "A playbook for regulated and detail-heavy brands: check AI claims against approved reference documents with Fact Check, fix the sources of errors, re-measure.",
    },
    hero: {
      title: "Protect brand facts with Fact Check",
      subtitle:
        "AI engines state prices, dosages, specifications and terms with confidence — and sometimes wrongly. This playbook uses Fact Check to compare AI claims with your approved documents and turns contradictions into fixes.",
    },
    teaser: "Check what AI engines say about your products against your approved documents and fix the sources behind wrong claims.",
    facts: [
      { label: "Goal", value: "Fewer contradicted, outdated and unsupported claims" },
      { label: "For", value: "Pharma, finance, health and complex B2B products" },
      { label: "Baseline", value: "7–14 days of daily tracking" },
      { label: "Re-measure", value: "After every run; review monthly" },
    ],
    goal: [
      {
        type: "p",
        text: "Reduce the share of AI statements about your products that **contradict** your approved reference documents, go **beyond** them (off-label), are **not supported** by them or reflect **outdated** facts. Correct statements should be confirmed as matches.",
      },
    ],
    audience: [
      "Pharma and medical device companies with approved labels such as an SmPC",
      "Banks, insurers and fintechs with conditions, fees and terms",
      "Manufacturers with technical specifications",
      "Any brand whose prices, policies or product facts change often",
    ],
    prompts: {
      intro:
        "Twelve templates that make engines state concrete facts. Fact Check examines tracked answers that mention an asset, so these prompts name the product.",
      placeholders: [
        "`[product]` — the product as named in Fact Check (add spelling variants there as aliases)",
        "`[condition]` — an indication, use case or customer situation",
        "`[country]` — a market you check, e.g. “Germany”",
        "`[brand]` — your brand",
      ],
      rows: [
        { prompt: "What is [product] used for?", tags: ["Facts", "Indication"] },
        { prompt: "How do you use [product] correctly?", tags: ["Facts", "Usage"] },
        { prompt: "What are the side effects or risks of [product]?", tags: ["Facts", "Risk"] },
        { prompt: "Who should not use [product]?", tags: ["Facts", "Risk"] },
        { prompt: "How much does [product] cost?", tags: ["Facts", "Price"] },
        { prompt: "What are the terms and conditions of [product]?", tags: ["Facts", "Terms"] },
        { prompt: "Is [product] suitable for [condition]?", tags: ["Facts", "Suitability"] },
        { prompt: "What are the technical specifications of [product]?", tags: ["Facts", "Specs"] },
        { prompt: "How is [product] different from its previous version?", tags: ["Facts", "Versions"] },
        { prompt: "Is [product] approved in [country]?", tags: ["Facts", "Regulatory"] },
        { prompt: "What do experts say about [product]?", tags: ["Facts", "Reputation"] },
        { prompt: "What does [brand] offer for [condition]?", tags: ["Facts", "Portfolio"] },
      ],
    },
    engines: {
      intro: "Check the engines your customers — and in regulated industries, patients and advisors — actually use.",
      head: ["Engine", "Why it matters for fact checking"],
      rows: [
        ["ChatGPT", "The assistant people use most for health, finance and product questions."],
        ["Google AI Overviews and AI Mode", "Answer factual questions directly on the search results page."],
        ["Perplexity", "Its cited sources make it easy to trace a wrong claim back to the page behind it."],
        ["Gemini, Claude, Microsoft Copilot", "Add them for complete coverage: wrong facts often differ from engine to engine."],
      ],
    },
    baseline: [
      {
        title: "Create the assets",
        body: "In Fact Check, create one asset per product with its name, spelling variants and the markets to check, each with its regulator, e.g. DE · EMA or US · FDA.",
      },
      {
        title: "Upload the reference documents",
        body: "Upload the approved label, specification sheet or terms as PDF, pasted text or URL. AutoSEO splits them into sections for the comparison.",
      },
      {
        title: "Import and track the prompts",
        body: "Import the prompt set. After every tracking run, answers that mention an asset are checked against its reference documents.",
      },
      {
        title: "Record the verdicts",
        body: "Note the counts per verdict — matched, needs review, off-label, contradicted, unsupported, outdated — per engine and market on the Accuracy page.",
      },
    ],
    actions: [
      {
        title: "Triage the findings",
        body: "Start with contradicted and off-label findings, then outdated ones. Each finding shows the claim and its verdict.",
      },
      {
        title: "Trace the source of each error",
        body: "Open the answer and its cited sources. Wrong claims usually come from outdated pages of your own, old press releases, third-party databases or forums.",
      },
      {
        title: "Fix your own pages first",
        body: "Update or redirect outdated pages, state current facts as plain, dated text, and take old PDFs that still circulate offline.",
      },
      {
        title: "Ask third parties for corrections",
        body: "Ask cited publishers, directories and databases to correct wrong facts, with a link to the current source document.",
      },
      {
        title: "Route findings through review",
        body: "Give medical, legal or compliance reviewers access to the project with a suitable role. Findings marked “needs review” are for people to decide.",
      },
      {
        title: "Keep reference documents current",
        body: "When a label, price or term changes, upload the new version right away — otherwise correct new answers look like errors.",
      },
    ],
    measure: {
      items: [
        "Verdict counts per engine and market on the Accuracy page, compared with the baseline",
        "Share of contradicted and off-label claims among all checked claims",
        "Findings closed versus new findings per month",
        "Whether the sources you corrected still appear behind wrong claims",
      ],
      aside: [
        { type: "h3", text: "Document for compliance" },
        {
          type: "p",
          text: "Keep records of findings and the actions you took. Fact Check shows what AI said; your records show how you responded.",
        },
      ],
    },
    variance: [
      {
        type: "p",
        text: "Factual errors are sticky and random at the same time. An engine may repeat an outdated price for months because an old page ranks well — and state a different wrong price the next day. Judge progress by the rate of problematic verdicts across many answers, not by single answers.",
      },
      {
        type: "callout",
        tone: "warn",
        title: "Automated checks need human review",
        text: "Fact Check uses AI to compare statements with your documents. It flags claims for review; it does not make legal or medical judgments. Findings marked “needs review” and every critical finding should be checked by a qualified person.",
      },
    ],
    limitations: [
      "Fact Check can only judge claims that your uploaded reference documents cover.",
      "It checks answers to tracked prompts, not every conversation people have with AI.",
      "You can't force an engine to correct a claim; you can only fix and strengthen the sources it relies on.",
      "This is not a pharmacovigilance or regulatory reporting system. If an AI answer could harm people, follow your internal escalation process.",
    ],
    faq: [
      {
        q: "Which documents can I use as a reference?",
        a: "Anything that states the approved facts: a product label or SmPC, a specification sheet, terms and conditions, a price list. Upload them as PDF, as pasted text or by URL.",
      },
      {
        q: "What do the verdicts mean?",
        a: "Matched means the claim agrees with your reference. Contradicted means it states the opposite. Off-label means it goes beyond what the reference covers, for example an unapproved use. Unsupported means the reference does not back it up. Outdated means it reflects facts that are no longer current. Needs review means a person has to decide.",
      },
      {
        q: "Can I check several countries?",
        a: "Yes. Each asset lists the markets it is checked for, with the regulator, for example DE · EMA and US · FDA. Prompts carry a country, so you can track the answers for each market separately.",
      },
      {
        q: "Does this replace our medical or legal review?",
        a: "No. Fact Check helps you find the claims worth reviewing, quickly and consistently. Decisions about what is correct, and what to do about it, stay with qualified people in your organization.",
      },
      {
        q: "Where are our reference documents processed?",
        a: "They are stored in your AutoSEO instance. For the comparison, the relevant text is sent to the AI provider configured on the instance, or processed through your local Claude Code or Codex agent. Self-host AutoSEO if documents may leave your infrastructure only toward an AI provider you choose.",
      },
    ],
    reading: [
      { label: "Can AI crawlers read your site?", href: "/blog/ai-crawler-readability", description: "Which AI crawlers visit, which obey robots.txt, and how JavaScript, CDN bot settings and llms.txt affect them." },
      { label: "AI Mode vs. AI Overviews", href: "/blog/ai-mode-vs-ai-overviews", description: "How Google's two AI answer formats differ and how to measure both." },
    ],
    related: ["fix-ai-crawler-access", "get-cited-by-trusted-sources"],
  },
  {
    slug: "attribute-ai-search-revenue",
    crumb: "Attribute AI search revenue",
    icon: "chart",
    meta: {
      title: "Playbook: Attribute Revenue to AI Search",
      description:
        "Measure AI search revenue: a “How did you hear about us?” survey, conversions from Stripe, Shopify or your CRM, plus AI referral traffic from analytics.",
    },
    hero: {
      title: "Attribute AI search revenue",
      subtitle:
        "Many buyers who find you through AI never click a trackable link: they ask, read and later type your name. This playbook combines self-reported attribution with orders and deals, so you can put a revenue figure next to your AI visibility.",
    },
    teaser: "Combine “How did you hear about us?” answers with orders and deals to see how much revenue AI search actually drives.",
    facts: [
      { label: "Goal", value: "A defensible share of revenue from AI search" },
      { label: "For", value: "E-commerce, SaaS, B2B lead generation" },
      { label: "Baseline", value: "2–4 weeks of survey responses" },
      { label: "Re-measure", value: "Monthly, in rolling 3-month windows" },
    ],
    goal: [
      {
        type: "p",
        text: "Answer one question with data: **how much revenue comes from people who found you through AI answers?** The method pairs a “How did you hear about us?” question with your conversions and adds AI referral traffic from your analytics as a second, click-based signal.",
      },
    ],
    audience: [
      "E-commerce shops on Shopify, WooCommerce or Shopware",
      "SaaS companies billing through Stripe",
      "B2B teams with leads in HubSpot, Salesforce, Pipedrive or another CRM",
      "Marketing leads who need to justify a GEO budget",
    ],
    prompts: {
      intro:
        "Attribution is measured with a survey, not with prompts. Tracking purchase-intent prompts alongside it shows whether visibility and revenue move together. Ten templates.",
      placeholders: [
        "`[category]` — your product category",
        "`[brand]` — your brand name",
        "`[competitor]` — your strongest competitor",
        "`[audience]` and `[use case]` — a buyer segment and a job to be done",
      ],
      rows: [
        { prompt: "Where can I buy a good [category]?", tags: ["Purchase intent"] },
        { prompt: "Which [category] should I buy for [use case]?", tags: ["Purchase intent"] },
        { prompt: "Best [category] for [audience] with good support", tags: ["Purchase intent"] },
        { prompt: "Which [category] offers the best value for money?", tags: ["Purchase intent"] },
        { prompt: "Where do people buy [category] online?", tags: ["Purchase intent", "Retail"] },
        { prompt: "[brand] or [competitor]: which should I buy?", tags: ["Purchase intent", "Head-to-head"] },
        { prompt: "Is [brand] worth the money?", tags: ["Purchase intent", "Brand"] },
        { prompt: "Is [brand] legit?", tags: ["Purchase intent", "Brand"] },
        { prompt: "What do customers say about [brand]?", tags: ["Purchase intent", "Brand"] },
        { prompt: "Does [brand] offer a free trial or returns?", tags: ["Purchase intent", "Brand"] },
      ],
    },
    engines: {
      intro: "Track the engines your survey offers as answers, so you can compare visibility and self-reported revenue per engine.",
      head: ["Engine", "How it fits the survey"],
      rows: [
        ["ChatGPT", "Track it by default and offer “ChatGPT” as its own answer option."],
        ["Perplexity, Gemini, Claude, Microsoft Copilot", "Offer them as separate options, so answers map to tracked engines."],
        ["Google AI Overviews and AI Mode", "Respondents may just answer “Google”. Offer “Google AI answer” as its own option to separate it from classic search."],
      ],
    },
    baseline: [
      {
        title: "Run the seven-step setup",
        body: "Attribution guides you through what to track, your platform, your forms, the survey, installing the snippet, conversions and live verification.",
      },
      {
        title: "Ask the question",
        body: "Ask “How did you hear about us?” at checkout, in your signup form or in your lead forms, with AI assistants as explicit options next to search, social and referral.",
      },
      {
        title: "Connect conversions",
        body: "Send purchases and deals with their value: through the website snippet, Stripe, Shopify, WooCommerce, Shopware or a CRM webhook for HubSpot, Salesforce, Pipedrive and others.",
      },
      {
        title: "Verify, then wait",
        body: "The last setup step confirms the snippet, the first response and the first conversion. Then collect responses for two to four weeks before you read the numbers.",
      },
    ],
    actions: [
      {
        title: "Map answers to channels",
        body: "Map free-text answers to channels, so “chatgpt”, “Chat GPT” and “the AI” all count as AI search.",
      },
      {
        title: "Add AI referral traffic",
        body: "Connect Google Analytics, Matomo or Piwik PRO. Analytics → Human Traffic shows visits referred by AI platforms — the clicks the survey can't see.",
      },
      {
        title: "Compare channels by revenue",
        body: "Put AI search next to organic search, paid, social and referrals by revenue and deal value, not only by number of responses.",
      },
      {
        title: "Relate visibility to revenue",
        body: "Compare revenue from AI search with the mention rate for the purchase-intent prompts over the same months.",
      },
      {
        title: "Report it monthly",
        body: "Build a monthly report with attribution next to visibility and export it as PPTX or PDF for stakeholders.",
      },
      {
        title: "Refine the question between periods",
        body: "If many answers are vague (“internet”, “Google”), refine the options — between measurement periods, never in the middle of one.",
      },
    ],
    measure: {
      items: [
        "Share of responses naming an AI assistant, per month",
        "Revenue and deals attributed to AI search, next to the other channels",
        "Survey response rate — low rates make shares unreliable",
        "Sessions referred by AI platforms in analytics, as a separate signal",
        "Mention rate for the purchase-intent prompts over the same period",
      ],
      aside: [
        { type: "h3", text: "Report a range, not a point" },
        {
          type: "p",
          text: "Self-reported data is honest but imprecise. Report AI search as a range across months and methods — survey and referral traffic — rather than as one exact figure.",
        },
      ],
    },
    variance: [
      {
        type: "p",
        text: "Attribution numbers depend on sample size. With few responses per month, one or two answers can move the AI share noticeably. Wait for a meaningful number of responses before drawing conclusions, and look at rolling three-month windows.",
      },
      {
        type: "p",
        text: "Self-reported answers also depend on memory: people tend to remember the last touchpoint, not always the first. Treat them as one perspective next to click-based analytics.",
      },
    ],
    limitations: [
      "People who don't answer the survey are missing from the data. If AI users answer more or less often than others, the shares are skewed.",
      "Survey answers are self-reported and can't be verified per person.",
      "Referral traffic misses buyers who read an AI answer and visit later directly.",
      "Visibility and revenue moving together is not proof of causation: seasonality and campaigns move both.",
    ],
    faq: [
      {
        q: "Why not just use web analytics?",
        a: "Analytics only sees visits with a referrer. Many people read an AI answer and come back later by typing your name, which analytics records as direct traffic or branded search. The survey closes that gap, and analytics adds the click-based view.",
      },
      {
        q: "Where should I ask the question?",
        a: "Where people convert: at checkout or on the order confirmation page, in the signup form, or in lead and demo forms. AutoSEO works with its own snippet and with form and survey tools such as Typeform, Tally, Jotform, Fairing, KnoCommerce and Zigpoll.",
      },
      {
        q: "Which answer options should I offer?",
        a: "Name the AI assistants individually (ChatGPT, Perplexity, Gemini, Claude, Copilot), add “Google AI answer”, classic search, social media, a recommendation, podcast or press, and a free-text “Other”. Randomize the order if your form tool supports it.",
      },
      {
        q: "How many responses do I need?",
        a: "There is no universal threshold, but shares based on a few dozen answers per month are rough. Use rolling three-month windows until you have enough volume, and always report the number of responses next to the share.",
      },
      {
        q: "Can I import survey answers I collected before?",
        a: "Yes. Attribution accepts CSV imports, so you can bring in answers from before you connected AutoSEO and compare periods.",
      },
    ],
    reading: [
      { label: "How to attribute leads and revenue to AI search", href: "/blog/ai-search-attribution", description: "Referrers, UTMs, GA4's AI Assistant channel and “How did you hear about us?” surveys." },
    ],
    related: ["win-comparison-prompts", "agency-pitch-in-14-days"],
  },
  {
    slug: "agency-pitch-in-14-days",
    crumb: "Agency pitch in 14 days",
    icon: "briefcase",
    meta: {
      title: "Playbook: A Data-Backed Agency GEO Pitch in 14 Days",
      description:
        "An agency playbook: pitch project, prompt set, 14 days of tracking, competitor and source analysis, white-label pitch deck. A method, not a promised result.",
    },
    hero: {
      title: "Agency pitch in 14 days",
      subtitle:
        "Prospects want to see their own data before they sign. This playbook turns a domain into two weeks of real tracking and a white-label pitch deck — in a pitch project that archives itself if you don't win.",
    },
    teaser: "Turn a prospect's domain into a data-backed AI visibility pitch in two weeks, in a pitch project that cleans up after itself.",
    facts: [
      { label: "Goal", value: "A pitch deck built on the prospect's real AI visibility" },
      { label: "For", value: "Agencies and freelancers" },
      { label: "Duration", value: "14 days of daily tracking" },
      { label: "Output", value: "White-label deck (PPTX/PDF) and share link" },
    ],
    goal: [
      {
        type: "p",
        text: "Show a prospect, with their own data, **where they stand in AI answers, who wins instead and what you would do about it** — without weeks of unpaid work. The deliverable is a white-label deck built from 14 days of tracking.",
      },
    ],
    audience: [
      "Agencies adding GEO to SEO, content or PR retainers",
      "Freelancers pitching AI visibility audits",
      "In-house teams pitching a GEO budget internally",
    ],
    prompts: {
      intro:
        "Twelve templates covering the prospect's category, comparisons and brand perception: broad enough to find a story, small enough to track for two weeks at modest cost.",
      placeholders: [
        "`[category]`, `[audience]`, `[use case]` — in the prospect's own words (check their website and ads)",
        "`[prospect]` — the prospect's brand",
        "`[competitor]` — the competitor the prospect worries about most (ask in the first call)",
        "`[country]` — the prospect's main market",
      ],
      rows: [
        { prompt: "What is the best [category] for [audience]?", tags: ["Pitch", "Category"] },
        { prompt: "Which [category] providers are recommended?", tags: ["Pitch", "Category"] },
        { prompt: "Which [category] is best for [use case]?", tags: ["Pitch", "Category"] },
        { prompt: "Which [category] is the most trustworthy?", tags: ["Pitch", "Category"] },
        { prompt: "How much does a [category] cost?", tags: ["Pitch", "Category"] },
        { prompt: "Who are the leading [category] companies in [country]?", tags: ["Pitch", "Category", "Local"] },
        { prompt: "What are the best alternatives to [competitor]?", tags: ["Pitch", "Comparison"] },
        { prompt: "[prospect] vs. [competitor]", tags: ["Pitch", "Comparison"] },
        { prompt: "Is [prospect] a good choice for [use case]?", tags: ["Pitch", "Brand"] },
        { prompt: "What are the pros and cons of [prospect]?", tags: ["Pitch", "Brand"] },
        { prompt: "What do customers say about [prospect]?", tags: ["Pitch", "Brand"] },
        { prompt: "Is [prospect] legit?", tags: ["Pitch", "Brand"] },
      ],
    },
    engines: {
      intro: "Every engine tracked for 14 days costs money. Pick the four or five that matter to the prospect's buyers.",
      head: ["Engine", "Role in the pitch"],
      rows: [
        ["ChatGPT", "The engine every prospect asks about first."],
        ["Google AI Overviews", "Connects the pitch to the Google traffic the prospect already knows."],
        ["Perplexity", "Its sources make the “here's why competitors win” slide concrete."],
        ["Gemini or Microsoft Copilot", "Add one, depending on whether the prospect's buyers work with Google or Microsoft tools."],
      ],
    },
    baseline: [
      {
        title: "Day 1: Create a pitch project",
        body: "Add the prospect's domain as a pitch project with an expiry of 7 to 90 days. If you don't win, it is archived automatically.",
      },
      {
        title: "Day 1: Prompts and competitors",
        body: "Import the prompt set, add the competitors the prospect named plus those AutoSEO suggests, and set daily tracking on four or five engines.",
      },
      {
        title: "Days 2–13: Read the answers",
        body: "Check in every few days. Look for the story: who is recommended instead, which sources are cited, what AI gets wrong about the prospect.",
      },
      {
        title: "Day 14: Build the deck",
        body: "Create a report from the Pitch or Audit Pitch template, apply your brand kit and export PPTX or PDF, or send a password-protected share link.",
      },
    ],
    actions: [
      {
        title: "Lead with one clear finding",
        body: "One sentence the prospect will repeat internally — for example, which competitor AI recommends for their most valuable prompt. From their data, not from a benchmark.",
      },
      {
        title: "Show the why",
        body: "Use Sources and the answers themselves to explain why competitors win: the pages, reviews and lists behind the answers.",
      },
      {
        title: "Add technical quick wins",
        body: "Run a crawlability check on the prospect's site. Blocked AI crawlers or client-side rendering are concrete, fixable findings.",
      },
      {
        title: "Propose a measurable plan",
        body: "Offer a baseline, a fixed prompt set, monthly reporting and the playbooks you will run — not a promised ranking.",
      },
      {
        title: "Be upfront about variance",
        body: "Show that answers fluctuate and that you will report averages over many runs. It builds trust and protects you from being judged on a single screenshot.",
      },
      {
        title: "Convert, or let it expire",
        body: "If you win, convert the pitch project into a regular project and keep the 14 days as the baseline. If you don't, it archives itself.",
      },
    ],
    measure: {
      items: [
        "Your win rate for pitches with data versus without, in your own pipeline",
        "Mention rate and share of voice after 14 days, as the engagement baseline",
        "Tracking cost per pitch under Settings → Usage, to price future pitches",
        "Hours spent per pitch, to decide whether to standardize the prompt set",
      ],
      aside: [
        { type: "h3", text: "Give the client access" },
        {
          type: "p",
          text: "Once the contract is signed, invite the client with the Client role: read-only access to their project and nothing else.",
        },
      ],
    },
    variance: [
      {
        type: "p",
        text: "Fourteen days give a directional picture, not precise numbers. A small prompt set on a few engines shows visible day-to-day swings. Present results as ranges and trends, and say so on the slide.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "Use the variance as a selling point",
        text: "Explaining why single screenshots mislead — and how you will measure properly — sets you apart from pitches built on one ChatGPT answer.",
      },
    ],
    limitations: [
      "Tracking costs apply for 14 days per engine; set a budget per pitch.",
      "Two weeks show where the prospect stands today, not what you will achieve for them.",
      "Competitor lists from a first call are incomplete; the answers themselves often reveal competitors nobody mentioned.",
      "On AutoSEO Cloud, an active pitch project counts toward the project limit of your workspace until it expires and is archived.",
    ],
    faq: [
      {
        q: "How much does tracking a 14-day pitch cost?",
        a: "It depends on the number of prompts and engines and on the providers configured. Check Settings → Usage after the first few days and extrapolate. On a self-hosted instance, AI work can run through Claude Code or Codex subscriptions you already have via the local agent, while engines tracked through DataForSEO are billed per request by DataForSEO.",
      },
      {
        q: "Can the prospect see the project during the pitch?",
        a: "Only if you invite them. You can also share the finished deck through a password-protected link without giving the prospect an account.",
      },
      {
        q: "What happens when the pitch period ends?",
        a: "The pitch project is archived automatically. While it runs, you can convert it into a regular project at any time; all tracked data stays and becomes the baseline of the engagement.",
      },
      {
        q: "Can I white-label the deck?",
        a: "Yes. Brand kits apply your logo and colors to reports, and you export them as PPTX or PDF or share them through a password-protected link.",
      },
      {
        q: "Should I promise results in the pitch?",
        a: "No. AI answers are probabilistic and engines change without notice. Promise a method — baseline, fixed prompt set, monthly measurement, specific actions — and report honestly against it.",
      },
    ],
    reading: [
      { label: "Which GEO techniques work?", href: "/blog/geo-techniques", description: "What the research shows about raising AI visibility, why studies disagree and how to test a technique yourself." },
      { label: "AI Mode vs. AI Overviews", href: "/blog/ai-mode-vs-ai-overviews", description: "How Google's two AI answer formats differ and how to measure both." },
    ],
    related: ["win-comparison-prompts", "attribute-ai-search-revenue"],
  },
];

export default playbooks;
