import type { FeaturePage } from "../../types";

export default {
  slug: "ai-crawlability",
  nav: "AI crawlability check",
  summary: "Check whether AI crawlers can reach and read your site, with fixes you can paste in.",
  meta: {
    title: "AI Crawlability Check: robots.txt & llms.txt",
    description:
      "AI crawlability check for GPTBot, ClaudeBot, PerplexityBot and 24 more bots: robots.txt, bot access, rendering and llms.txt, scored 0–100 with fixes.",
  },
  hero: {
    eyebrow: "AI crawlability",
    title: "Test your site's AI crawlability.",
    muted: "Then fix what blocks the bots.",
    subtitle:
      "AutoSEO checks your robots.txt against 27 AI and search crawlers, requests your pages with their real user agents, inspects the raw HTML they receive and validates your llms.txt. You get a score from 0 to 100, findings ranked by severity and fixes you can paste straight into your site.",
  },
  visual: "audit",
  stats: [
    { value: 27, label: "Crawlers tested", note: "Against your robots.txt" },
    { value: 9, label: "Check categories", note: "robots.txt to response time" },
    { value: 100, label: "Point score", note: "Weighted by crawler purpose" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "MIT licensed, every feature" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "Blocked pages can't be cited.",
    muted: "Most blocks are accidental.",
    body: "A broad Disallow rule, a firewall that challenges unknown bots or a page that only renders with JavaScript can keep AI crawlers out without anyone noticing. It looks like weak AI visibility, but the cause is technical.",
    points: [
      {
        title: "Most AI crawlers don't run JavaScript",
        body: "They read the raw HTML. If your content only appears after client-side rendering, they see an empty app shell.",
      },
      {
        title: "robots.txt rules interact",
        body: "Wildcard groups, per-bot groups and crawl delays combine in ways that are hard to read by hand — especially across 27 user agents.",
      },
      {
        title: "CDNs treat bots differently",
        body: "Bot protection can return a challenge to GPTBot while browsers get a normal page. Only a request with the crawler's user agent reveals it.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What the check covers",
    title: "Nine categories, one score,",
    muted: "fixes included.",
    items: [
      {
        icon: "bot",
        title: "robots.txt per AI crawler",
        body: "Allowed, partly blocked or blocked for every AI search, assistant, training and SEO crawler — with the exact rule and line that decides it.",
      },
      {
        icon: "shield-check",
        title: "Bot access vs. browser",
        body: "Your pages requested with each crawler's real user agent and compared with a browser request, to catch firewall blocks, challenges and errors.",
      },
      {
        icon: "code",
        title: "Raw-HTML rendering",
        body: "Whether the HTML crawlers receive contains your content or just an app shell, with the frameworks detected.",
      },
      {
        icon: "book",
        title: "llms.txt validation and generator",
        body: "Checks /llms.txt and /llms-full.txt against the llmstxt.org format and drafts a file from your site structure — from a template or written by AI.",
      },
      {
        icon: "list-checks",
        title: "Meta robots, sitemaps, schema",
        body: "Meta robots and X-Robots-Tag directives, sitemap discovery, structured data, canonicals, time to first byte and HTML weight.",
      },
      {
        icon: "bell",
        title: "Schedules and alerts",
        body: "Run the check weekly or monthly and get an in-app and email alert when the score drops.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From domain to fix list",
    muted: "in about a minute.",
    items: [
      {
        title: "Start a check",
        body: "Your homepage is always checked. Add key pages like pricing, product or docs, or let AutoSEO sample pages from your sitemap.",
      },
      {
        title: "Read the score and findings",
        body: "The score weighs AI search and user-triggered crawlers three times as much as training crawlers. Findings run from critical to passed.",
      },
      {
        title: "Paste the fix and re-check",
        body: "Findings come with ready-made snippets, such as a robots.txt group that re-allows blocked crawlers and keeps your existing exclusions.",
      },
    ],
  },
  faq: [
    {
      q: "What is AI crawlability?",
      a: "AI crawlability describes whether the crawlers behind ChatGPT, Claude, Perplexity, Gemini and other AI engines can access and read your pages. It depends on robots.txt rules, how your server and CDN respond to bot user agents, and whether your content is in the HTML without JavaScript.",
    },
    {
      q: "How do I check if GPTBot can crawl my site?",
      a: "Run a crawlability check in AutoSEO. It reads your robots.txt for GPTBot, OAI-SearchBot, ChatGPT-User and 24 other crawlers, then requests your pages with their real user agents. You see per bot whether access is allowed, partly blocked or blocked, and why.",
    },
    {
      q: "Should I block AI training crawlers?",
      a: "That's a business decision, and AutoSEO treats it as one. Training crawlers such as GPTBot, ClaudeBot and Google-Extended are reported separately from search and user-triggered crawlers: blocking training bots is a warning, blocking AI search bots is critical, because it keeps you out of live answers.",
    },
    {
      q: "What is llms.txt and do I need one?",
      a: "llms.txt is a proposed Markdown file at your domain root that gives language models a short summary of your site and links to its key pages, following the llmstxt.org format. It's optional and counts for 10 of the 100 points. AutoSEO validates an existing file or drafts one for you to review and publish.",
    },
    {
      q: "How is the crawlability score calculated?",
      a: "The score adds up nine weighted categories: robots.txt access 30, bot HTTP access 20, server-side rendering 15, llms.txt 10, meta robots 10, sitemap 5, structured data 5, canonical 3, and response time and page weight 2. SEO tool crawlers are shown but not scored.",
    },
    {
      q: "How is this different from a site audit?",
      a: "The site audit crawls your whole site with 29 technical SEO checks and Lighthouse. The crawlability check focuses on AI crawlers: per-bot robots.txt rules, responses to bot user agents, raw-HTML rendering and llms.txt. Use both.",
    },
    {
      q: "Is the AI crawlability check free?",
      a: "The crawlability check is part of the open-source AutoSEO app and free to self-host with every feature. AutoSEO Cloud gives you a managed workspace for $50 per month with $10 of AI and data usage included. AI-written llms.txt drafts can also run on your own Claude Code or Codex through a local agent.",
    },
  ],
  related: ["ai-bot-traffic", "site-audit", "ai-seo-tasks", "ai-citation-tracking"],
  cta: {
    title: "Find out what AI crawlers see on your site",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
