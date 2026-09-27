import type { IntegrationCategoryPage } from "../../types";

export default {
  slug: "bot-traffic",
  nav: "Bot traffic integrations",
  summary: "See which AI crawlers read your site, from Cloudflare, Akamai or your server logs.",
  meta: {
    title: "AI Crawler Tracking: Cloudflare, Akamai & Logs",
    description:
      "AI crawler tracking from Cloudflare, Akamai or server logs: see which pages GPTBot, ClaudeBot and PerplexityBot fetch, verified against published IP ranges.",
  },
  hero: {
    eyebrow: "Bot traffic integrations",
    title: "Track AI crawlers where they reach your site.",
    muted: "At the CDN or in your logs.",
    subtitle:
      "Connect Cloudflare, Akamai or your server logs and AutoSEO records every visit from GPTBot, ClaudeBot, PerplexityBot, Google-Extended and other AI crawlers — which pages they request, how often and which status codes they get back.",
  },
  benefits: {
    eyebrow: "What you get",
    title: "See what AI engines read",
    muted: "before they answer.",
    items: [
      {
        icon: "bot",
        title: "Every AI crawler, by purpose",
        body: "Visits are grouped by crawler, company and purpose — model training, search indexing or fetches for a user's question — so you can tell GPTBot from ChatGPT-User.",
      },
      {
        icon: "shield-check",
        title: "Spoofed bots flagged",
        body: "Requests are checked against the IP ranges OpenAI, Anthropic, Perplexity, Google, Microsoft and Apple publish. The lists refresh daily.",
      },
      {
        icon: "file-text",
        title: "Pages and errors per crawler",
        body: "See the URLs each crawler requests and the ones that fail with 4xx or 5xx. Repeated failures turn into prioritized tasks.",
      },
      {
        icon: "zap",
        title: "Streamed or uploaded",
        body: "Stream from a Cloudflare Worker, Logpush or Akamai DataStream 2, push NDJSON from any backend, or upload log files up to 1 GB.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track AI crawlers on my website?",
      a: "Connect a log source: a Cloudflare Worker or Logpush, Akamai DataStream 2, or the server-log API for nginx, Apache or any backend. AutoSEO identifies AI crawlers by user agent, verifies them by IP range and stores only crawler requests.",
    },
    {
      q: "Does the Cloudflare integration work on the free plan?",
      a: "Yes. The Cloudflare Worker works on every plan; Logpush requires an Enterprise plan. The Worker passes responses through unchanged and reports bot visits in the background.",
    },
    {
      q: "Can I upload server log files instead?",
      a: "Yes. Upload access logs up to 1 GB, gzip included, in nginx or Apache combined format, W3C/IIS format, Cloudflare or Akamai JSON, or NDJSON. For continuous data, push NDJSON to the ingest API; examples for nginx, Vector and Fluent Bit are in the app.",
    },
    {
      q: "Which AI crawlers does AutoSEO recognize?",
      a: "Among others GPTBot, OAI-SearchBot and ChatGPT-User from OpenAI, ClaudeBot and Claude-User from Anthropic, PerplexityBot, Google-Extended, Applebot-Extended, Meta-ExternalAgent, Bytespider, Amazonbot and CCBot — plus Googlebot, Bingbot and common SEO crawlers.",
    },
    {
      q: "Are Fastly and AWS CloudFront supported?",
      a: "Both connectors are coming soon. Until then, send their logs through the server-log API or upload log files.",
    },
    {
      q: "Does AutoSEO store my human visitors' requests?",
      a: "No. Lines from regular visitors are ignored; only requests from known crawlers are saved, and duplicate lines are skipped.",
    },
    {
      q: "Is AI bot tracking free?",
      a: "Yes. All bot traffic connectors are part of the open-source app and free to self-host. AutoSEO Cloud includes them in a managed workspace for $50 per month, with $10 of AI and data usage included.",
    },
  ],
  cta: {
    title: "Know which AI crawlers read your pages",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationCategoryPage;
