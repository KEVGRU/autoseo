import type { IntegrationPage } from "../../types";

export default {
  slug: "cloudflare",
  name: "Cloudflare",
  nav: "Cloudflare",
  summary: "Log AI crawler visits in real time with a Cloudflare Worker or Logpush.",
  meta: {
    title: "Cloudflare AI Crawler Tracking with a Worker",
    description:
      "Track GPTBot, ClaudeBot, PerplexityBot and other AI crawlers on your Cloudflare zone in real time — with a Worker on any plan or Logpush on Enterprise.",
  },
  hero: {
    subtitle:
      "Deploy a small Cloudflare Worker — or point Logpush at AutoSEO on Enterprise — and see which AI crawlers visit your pages, how often and which status codes they get.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Cloudflare integration",
    items: [
      "A Worker for every Cloudflare plan, Logpush for Enterprise zones",
      "Real-time visits from 27 known AI, search and SEO crawlers, including GPTBot, ClaudeBot and PerplexityBot",
      "IP verification against the ranges crawler operators publish, with spoofed requests flagged",
      "Crawled pages, visits per day and response status for every bot",
      "Responses pass through unchanged — reporting runs in the background",
      "An ingest token that is stored only as a hash and can be rotated anytime",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Cloudflare and AutoSEO",
    items: [
      {
        icon: "bot",
        title: "See which AI crawlers read your site",
        body: "Find out whether GPTBot, ClaudeBot, PerplexityBot and Google-Extended actually fetch your pages — and how often.",
      },
      {
        icon: "shield-check",
        title: "Separate real bots from fakes",
        body: "Each request is checked against the operator's published IP ranges, so spoofed user agents don't inflate your numbers.",
      },
      {
        icon: "gauge",
        title: "Catch crawl errors early",
        body: "Status codes per request show when AI crawlers hit redirects or errors instead of your content.",
      },
      {
        icon: "file-text",
        title: "Confirm new pages get crawled",
        body: "After you publish or update content, check that AI crawlers pick it up in the crawled pages list.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Cloudflare in four steps,",
    muted: "on any plan.",
    items: [
      {
        title: "Generate an ingest token",
        body: "In your project, open Analytics → Bot Traffic → Sync → Cloudflare and generate a token. It's shown only once.",
      },
      {
        title: "Deploy the Worker",
        body: "Download the Worker script — it contains no secrets — and deploy it with Wrangler or the Cloudflare dashboard. Store the token as the secret AUTOSEO_TOKEN.",
      },
      {
        title: "Add a route",
        body: "Route your site through the Worker with a Workers Route such as example.com/*. Responses are passed through unchanged.",
      },
      {
        title: "Watch bot visits arrive",
        body: "Crawler requests are reported as they happen. On Enterprise, a Logpush job to AutoSEO can replace the Worker.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track AI crawlers on Cloudflare?",
      a: "Generate an ingest token in AutoSEO, deploy the AutoSEO Worker with that token as a secret and add a route for your site. Every request from a known AI or search crawler is then reported to AutoSEO in real time.",
    },
    {
      q: "Does the Worker change my responses?",
      a: "No. It forwards each request to your origin and returns the response unchanged. Only requests from known crawler user agents trigger a background report, and a failed report never breaks the page.",
    },
    {
      q: "Do I need a Cloudflare Enterprise plan?",
      a: "No. The Worker runs on every Cloudflare plan; its requests count toward your normal Workers usage. Logpush is an alternative for Enterprise zones that sends HTTP request logs as compressed NDJSON, and only crawler requests are stored.",
    },
    {
      q: "Which crawlers does AutoSEO recognize?",
      a: "27 AI, search and SEO crawlers, including GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Googlebot, Bingbot, Applebot-Extended, Meta-ExternalAgent, Bytespider and CCBot. All other traffic is ignored.",
    },
    {
      q: "What data does the Worker send to AutoSEO?",
      a: "One line per crawler request: timestamp, IP address, method, host, path, status code, user agent and response size. Requests from human visitors aren't reported.",
    },
    {
      q: "What if my site isn't on Cloudflare?",
      a: "AutoSEO also accepts Akamai DataStream 2, an NDJSON ingest API for nginx, Apache or any backend, and manual log file uploads of up to 1 GB.",
    },
  ],
  cta: {
    title: "See which AI crawlers read your site",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
