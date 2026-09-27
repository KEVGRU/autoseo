import type { IntegrationPage } from "../../types";

export default {
  slug: "server-logs",
  name: "Server logs",
  nav: "Server logs / API",
  summary: "Analyze AI crawler visits from nginx, Apache or any backend — pushed live or uploaded.",
  meta: {
    title: "Server Log Analysis for AI Crawlers",
    description:
      "Find GPTBot, ClaudeBot, PerplexityBot and other AI crawlers in your server logs — push NDJSON from nginx, Apache or any backend, or upload log files up to 1 GB.",
  },
  hero: {
    subtitle:
      "Push access logs from nginx, Apache or any backend to the AutoSEO ingest API — or upload a log file — and see which AI crawlers read your pages, how often and with which status codes.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with server log ingestion",
    items: [
      "An NDJSON ingest API with a bearer token, gzip bodies detected automatically",
      "Log file uploads up to 1 GB: nginx, Apache, Cloudflare, Akamai, NDJSON or IIS, plain or .gz",
      "Ready-made configs for nginx, Vector and Fluent Bit",
      "Visits from 27 known AI, search and SEO crawlers; other lines are ignored",
      "IP verification against published crawler ranges, with spoofed requests flagged",
      "Duplicate requests skipped, so re-sending a log does no harm",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with your server logs and AutoSEO",
    items: [
      {
        icon: "server",
        title: "Track AI crawlers without a CDN",
        body: "Hosting on your own servers or a platform without log streaming? Your access logs are enough.",
      },
      {
        icon: "download",
        title: "Analyze history in one upload",
        body: "Upload last month's access log to see which AI crawlers visited before you set up live ingestion.",
      },
      {
        icon: "bot",
        title: "Tell AI crawler types apart",
        body: "See training crawlers like GPTBot, search crawlers like OAI-SearchBot and user-triggered fetchers like ChatGPT-User separately.",
      },
      {
        icon: "gauge",
        title: "Find errors served to bots",
        body: "Status codes per request show which pages AI crawlers can't fetch, so you can fix them before they drop out of answers.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Start in four steps,",
    muted: "live or with a file.",
    items: [
      {
        title: "Generate an ingest token",
        body: "In your project, open Analytics → Bot Traffic → Sync → Server Logs / API and generate a token. It's shown only once.",
      },
      {
        title: "Write JSON access logs",
        body: "Use the nginx log format from the Sync tab, or send your own NDJSON with timestamp, user_agent and path — plus ip and status for verification and error tracking.",
      },
      {
        title: "Ship them to AutoSEO",
        body: "POST the lines with Authorization: Bearer and your token, or use the Vector and Fluent Bit configs that forward only crawler requests.",
      },
      {
        title: "Or upload a log file",
        body: "Click Upload Logs in Bot Traffic, pick the format or let AutoSEO detect it, and upload a file of up to 1 GB.",
      },
    ],
  },
  faq: [
    {
      q: "How do I find AI crawlers in my server logs?",
      a: "Upload an access log to AutoSEO or push your log lines to its ingest API. AutoSEO recognizes 27 AI, search and SEO crawlers by user agent, verifies them against their published IP ranges and shows visits per bot, page and status code.",
    },
    {
      q: "Which log formats does AutoSEO support?",
      a: "nginx and Apache combined, common and vhost_combined, Cloudflare Logpush JSON, Akamai DataStream 2 JSON, NDJSON and W3C extended logs from IIS, with a heuristic fallback for custom formats. Uploads can be plain or gzip-compressed.",
    },
    {
      q: "What are the limits of the ingest API?",
      a: "Up to 16 MB and 20,000 lines per request and 1,200 requests per minute per token. Larger log files can be uploaded in the app, up to 1 GB each.",
    },
    {
      q: "Does AutoSEO store my full access logs?",
      a: "No. Only requests from known crawlers are kept; lines from human visitors are ignored. Duplicates with the same bot, timestamp, IP and path are skipped.",
    },
    {
      q: "How is the ingest API secured?",
      a: "Every request needs your project's ingest token, sent as a bearer token. AutoSEO stores only a hash of it, and you can rotate or revoke it at any time.",
    },
  ],
  cta: {
    title: "See which AI crawlers read your site",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
