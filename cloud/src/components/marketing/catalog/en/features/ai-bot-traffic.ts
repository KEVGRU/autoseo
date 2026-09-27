import type { FeaturePage } from "../../types";

export default {
  slug: "ai-bot-traffic",
  nav: "AI bot traffic",
  summary: "See which AI crawlers read your site, which pages they fetch and how your server responds.",
  meta: {
    title: "AI Bot Traffic: Track GPTBot, ClaudeBot & Co.",
    description:
      "Track AI bot traffic from GPTBot, ClaudeBot, PerplexityBot and 24 more crawlers via log uploads, Cloudflare or Akamai — verified against published IP ranges.",
  },
  hero: {
    eyebrow: "AI bot traffic analytics",
    title: "Know which AI bots read your site.",
    muted: "Page by page, day by day.",
    subtitle:
      "AI engines can only cite what their crawlers have fetched. AutoSEO reads your server logs, CDN or log files, recognizes 27 AI and search crawlers — from GPTBot and ClaudeBot to PerplexityBot and OAI-SearchBot — verifies them against published IP ranges, and shows which pages they visit and how your site responds.",
  },
  visual: "bots",
  screenshot: {
    src: "/screenshots/bot-traffic.png",
    alt: "AutoSEO bot traffic analytics with crawler visits per day for Googlebot, GPTBot, ChatGPT-User and ClaudeBot and the share of verified requests",
    url: "analytics/bots",
  },
  stats: [
    { value: 27, label: "Crawlers recognized", note: "AI, search and SEO bots" },
    { value: 6, label: "Operators verified", note: "Against published IP ranges" },
    { value: 3, label: "Live connectors", note: "Cloudflare, Akamai, server logs" },
    { value: 1, suffix: " GB", label: "Log file uploads", note: "Plain or gzip, per file" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "No crawl, no citation.",
    muted: "Every AI answer starts with a fetch.",
    body: "Before an AI engine can quote your pricing page, its crawler has to fetch it — for training, for a search index or live when a user asks. Server logs are the only place that shows whether that happened, and most analytics tools filter bots out entirely.",
    points: [
      {
        title: "Training, search and user fetches differ",
        body: "GPTBot collects training data, OAI-SearchBot builds a search index and ChatGPT-User fetches pages live for a user. Each tells you something different.",
      },
      {
        title: "Spoofed bots distort the picture",
        body: "Anyone can send a GPTBot user agent. Checking the IP address against the operator's published ranges separates real crawlers from scrapers.",
      },
      {
        title: "Errors cost citations",
        body: "A crawler that hits 404s, redirect chains or server errors on key pages leaves with nothing to cite. Status codes per bot show where to fix.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What you get",
    title: "Every AI crawler visit,",
    muted: "verified and broken down.",
    items: [
      {
        icon: "bot",
        title: "27 crawlers, grouped by purpose",
        body: "Bots from OpenAI, Anthropic, Perplexity, Google, Microsoft, Apple, Meta, Amazon and more, labeled as training, search index, user-triggered or SEO tool.",
      },
      {
        icon: "shield-check",
        title: "IP verification",
        body: "Requests from OpenAI, Anthropic, Perplexity, Google, Microsoft and Apple crawlers are checked against their published IP ranges, and spoofed visits are counted separately.",
      },
      {
        icon: "chart",
        title: "Visits per day and per bot",
        body: "Daily crawler visits, unique URLs and trends against the previous period, plus when each bot was last seen.",
      },
      {
        icon: "file-text",
        title: "Crawled pages",
        body: "Which URLs each crawler fetched and how often, so you can see whether your pricing, product and docs pages get read.",
      },
      {
        icon: "gauge",
        title: "Response performance",
        body: "Status codes per crawler — success, redirects, client and server errors — to catch pages that fail only for bots.",
      },
      {
        icon: "server",
        title: "Logs, CDN or API",
        body: "Upload nginx, Apache, Cloudflare, Akamai or NDJSON logs, stream from a Cloudflare Worker, Logpush or Akamai DataStream 2, or push NDJSON from any backend.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From raw logs to a crawler report",
    muted: "in three steps.",
    items: [
      {
        title: "Choose how data arrives",
        body: "Upload a log file, deploy the Cloudflare Worker on any plan, use Logpush or Akamai DataStream 2, or ship logs with nginx, Vector or Fluent Bit.",
      },
      {
        title: "AutoSEO filters and verifies",
        body: "Only crawler requests are kept. Each is matched to a bot, checked against published IP ranges where available and deduplicated.",
      },
      {
        title: "Spot gaps and fix them",
        body: "See which bots skip important pages or run into errors, then run a crawlability check to find out why.",
      },
    ],
  },
  faq: [
    {
      q: "What is AI bot traffic?",
      a: "AI bot traffic is the requests AI crawlers make to your website: training crawlers like GPTBot and ClaudeBot, search crawlers like OAI-SearchBot and PerplexityBot, and user-triggered fetchers like ChatGPT-User that load a page while answering a question. It shows up in server logs, not in normal web analytics.",
    },
    {
      q: "How do I see if ChatGPT crawls my website?",
      a: "Look for GPTBot, OAI-SearchBot and ChatGPT-User in your server or CDN logs. AutoSEO does this for you: upload a log file or connect Cloudflare, Akamai or a log shipper, and it lists every visit by these crawlers with the pages they fetched and the status codes they got.",
    },
    {
      q: "Which AI crawlers does AutoSEO recognize?",
      a: "27 user agents, including GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Googlebot, GoogleOther, Bingbot, Applebot, Meta-ExternalAgent, Bytespider, Amazonbot, DuckAssistBot, MistralAI-User and CCBot. SEO crawlers such as AhrefsBot and SemrushBot are shown for comparison.",
    },
    {
      q: "How does bot verification work?",
      a: "OpenAI, Anthropic, Perplexity, Google, Microsoft and Apple publish the IP ranges their crawlers use. AutoSEO loads these lists and checks the IP address of each request, so a visit that claims to be GPTBot from an unknown address is marked as unverified.",
    },
    {
      q: "Does the Cloudflare Worker slow down my site?",
      a: "The Worker passes every response through unchanged and reports bot visits in the background. On Cloudflare Enterprise you can use Logpush instead, which sends logs without touching requests at all.",
    },
    {
      q: "Can I use AutoSEO without CDN access?",
      a: "Yes. Upload access logs from nginx, Apache or other servers as plain or gzip files of up to 1 GB, or push NDJSON to the ingest API with a project token. Fastly and AWS CloudFront connectors are listed as coming soon.",
    },
    {
      q: "Is AI bot traffic analytics free?",
      a: "Bot traffic analytics is part of the open-source AutoSEO app and free to self-host with every feature. AutoSEO Cloud gives you a managed workspace for $50 per month with $10 of AI and data usage included. Log uploads and the Cloudflare and Akamai connectors cost nothing extra.",
    },
  ],
  related: ["ai-crawlability", "ai-traffic-analytics", "site-audit", "ai-citation-tracking"],
  cta: {
    title: "See which AI crawlers read your site",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
