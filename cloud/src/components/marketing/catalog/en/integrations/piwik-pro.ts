import type { IntegrationPage } from "../../types";

export default {
  slug: "piwik-pro",
  name: "Piwik PRO",
  nav: "Piwik PRO",
  summary: "Import sessions, conversions and revenue from AI platforms out of Piwik PRO.",
  meta: {
    title: "Piwik PRO Integration for AI Traffic Analytics",
    description:
      "Connect Piwik PRO to AutoSEO with API client credentials and see sessions, goal conversions and revenue from ChatGPT, Perplexity and other AI platforms.",
  },
  hero: {
    subtitle:
      "Connect Piwik PRO with API client credentials and see how many sessions ChatGPT, Perplexity, Gemini and other AI assistants bring to your site — with landing pages, conversions and an organic search benchmark.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Piwik PRO integration",
    items: [
      "Connects with a Piwik PRO API client (client ID and secret) — no user password",
      "Sessions from 19 AI platforms, filtered by source in the Piwik PRO Analytics API",
      "Entry pages, countries, bounces, time on site, goal and e-commerce conversions",
      "Revenue and page views when your Piwik PRO account provides them",
      "An AI vs. organic search benchmark from the same site",
      "Up to 16 months of history on the first sync, then daily updates",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Piwik PRO and AutoSEO",
    items: [
      {
        icon: "shield-check",
        title: "Keep a privacy-first stack",
        body: "Measure AI traffic in the analytics platform your compliance team already approved, instead of adding another tracker.",
      },
      {
        icon: "trending-up",
        title: "Compare AI with organic search",
        body: "See AI-referred sessions next to organic search sessions from the same site and the same period.",
      },
      {
        icon: "target",
        title: "Tie AI traffic to conversions",
        body: "Goal and e-commerce conversions per AI platform show which assistants send visitors who act.",
      },
      {
        icon: "file-text",
        title: "Find the pages AI links to",
        body: "Entry pages of AI-referred sessions show which content assistants cite and send people to.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Piwik PRO in four steps,",
    muted: "with API client credentials.",
    items: [
      {
        title: "Create API credentials",
        body: "In Piwik PRO, open Menu → Profile → API credentials and create a client. Copy the client ID and client secret.",
      },
      {
        title: "Find your site ID",
        body: "Open Administration → Sites & apps and copy the ID of the site or app you want to analyze.",
      },
      {
        title: "Connect from AutoSEO",
        body: "In your project, open Analytics → Human Traffic → Settings or Integrations → Piwik PRO, enter your account URL, site ID, client ID and secret, and test the connection.",
      },
      {
        title: "Let the first sync run",
        body: "AutoSEO imports up to 16 months of AI-referred sessions in the background and syncs daily after that.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track AI traffic in Piwik PRO?",
      a: "Connect Piwik PRO to AutoSEO with an API client and your site ID. AutoSEO queries sessions whose source is ChatGPT, Perplexity or another AI platform and reports them with entry pages, conversions and revenue.",
    },
    {
      q: "Which Piwik PRO credentials does AutoSEO need?",
      a: "Your account URL (for example https://yourcompany.piwik.pro), the site or app ID, and the client ID and secret of an API client with access to that site. AutoSEO exchanges them for short-lived access tokens.",
    },
    {
      q: "Why is revenue missing for my Piwik PRO site?",
      a: "Some Piwik PRO accounts reject revenue or page view metrics in session-level queries. AutoSEO then imports the other metrics and leaves those columns out instead of failing the sync.",
    },
    {
      q: "How often is Piwik PRO data synced?",
      a: "Daily. The first sync imports up to 16 months of history, and you can start a sync manually from the settings at any time.",
    },
    {
      q: "Where are my Piwik PRO credentials stored?",
      a: "The client secret is stored encrypted with AES-256-GCM in AutoSEO's database and never sent back to the browser. Changing the account URL discards the stored secret, so it's never sent to another host.",
    },
  ],
  cta: {
    title: "See what AI traffic is worth",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
