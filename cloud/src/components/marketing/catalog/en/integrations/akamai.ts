import type { IntegrationPage } from "../../types";

export default {
  slug: "akamai",
  name: "Akamai",
  nav: "Akamai",
  summary: "Stream AI crawler visits from Akamai DataStream 2 to AutoSEO in near real time.",
  meta: {
    title: "Akamai AI Crawler Tracking with DataStream 2",
    description:
      "Send Akamai DataStream 2 logs to AutoSEO and see which AI crawlers — GPTBot, ClaudeBot, PerplexityBot and more — request your pages and what they get back.",
  },
  hero: {
    subtitle:
      "Point an Akamai DataStream 2 stream at your AutoSEO endpoint and see which AI crawlers request your pages, which status codes they get and whether they're genuine.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Akamai integration",
    items: [
      "DataStream 2 delivery to a custom HTTPS endpoint in JSON, gzip allowed",
      "Authentication with a bearer token in a custom header — stored only as a hash",
      "Visits from 27 known AI, search and SEO crawlers; all other lines are ignored",
      "IP verification against the ranges crawler operators publish, with spoofed requests flagged",
      "Crawled pages, visits per day and response status for every bot",
      "Data appears within minutes of activating the stream",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Akamai and AutoSEO",
    items: [
      {
        icon: "bot",
        title: "See AI crawlers at the edge",
        body: "Your CDN sees every request, including the ones cached at the edge that never reach your origin logs.",
      },
      {
        icon: "shield-check",
        title: "Spot fake crawlers",
        body: "Requests whose user agent claims to be GPTBot or ClaudeBot but come from outside the published IP ranges are flagged as spoofed.",
      },
      {
        icon: "gauge",
        title: "Catch errors served to bots",
        body: "Status codes per request show when AI crawlers get redirects, 4xx or 5xx responses instead of your content.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Akamai in four steps,",
    muted: "with DataStream 2.",
    items: [
      {
        title: "Generate an ingest token",
        body: "In your project, open Analytics → Bot Traffic → Sync → Akamai and generate a token. It's shown only once.",
      },
      {
        title: "Create a DataStream 2 stream",
        body: "In Akamai Control Center, create a stream for your property with the JSON log format and the fields reqTimeSec, cliIP, reqHost, reqMethod, reqPath, queryStr, statusCode, UA and totalBytes.",
      },
      {
        title: "Set the Custom HTTPS destination",
        body: "Use the endpoint URL from AutoSEO, no authentication, and a custom header Authorization: Bearer with your token. Gzip compression is allowed.",
      },
      {
        title: "Activate the stream",
        body: "Crawler visits appear in Bot Traffic within a few minutes.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track AI crawlers on Akamai?",
      a: "Create a DataStream 2 stream with a Custom HTTPS destination that points to your AutoSEO ingest endpoint and carries your ingest token in the Authorization header. AutoSEO keeps only requests from known crawlers and shows them under Bot Traffic.",
    },
    {
      q: "Which DataStream 2 fields does AutoSEO need?",
      a: "reqTimeSec, cliIP, reqHost, reqMethod, reqPath, queryStr, statusCode, UA and totalBytes, in the JSON log format. The client IP is needed to verify crawlers against their published IP ranges.",
    },
    {
      q: "Does AutoSEO store all of my Akamai logs?",
      a: "No. Lines from human visitors and unknown bots are ignored, and duplicate crawler requests are skipped. Only visits from the 27 known AI, search and SEO crawlers are stored.",
    },
    {
      q: "How is the Akamai ingest endpoint secured?",
      a: "Every request needs your project's ingest token, which AutoSEO stores only as a hash. You can rotate or revoke the token at any time; the old one stops working immediately.",
    },
  ],
  cta: {
    title: "See which AI crawlers reach your edge",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
