import type { IntegrationPage } from "../../types";

export default {
  slug: "google-analytics",
  name: "Google Analytics",
  nav: "Google Analytics",
  summary: "See sessions, conversions and revenue from AI platforms in your GA4 data.",
  meta: {
    title: "Google Analytics Integration for AI Traffic",
    description:
      "Connect Google Analytics 4 to AutoSEO and see sessions, conversions and revenue from ChatGPT, Perplexity, Gemini and other AI platforms — synced daily.",
  },
  hero: {
    subtitle:
      "Connect GA4 with your Google account and see how many visitors ChatGPT, Perplexity, Gemini, Claude and Copilot send you, where they land and what they convert into — synced daily.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Google Analytics integration",
    items: [
      "Sign in with Google (OAuth) and read-only access to Analytics",
      "Sessions, engaged sessions, key events and revenue from 19 AI platforms",
      "An AI model → page → outcome flow for every assistant",
      "Landing pages and countries of AI-referred visitors",
      "Up to 16 months of history on the first sync, then daily updates",
      "Search opportunities that join Search Console rankings with GA4 conversions",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Google Analytics and AutoSEO",
    items: [
      {
        icon: "chart",
        title: "Measure human traffic from AI",
        body: "See which AI assistants send visitors and how that traffic develops day by day or month by month.",
      },
      {
        icon: "file-text",
        title: "Find the pages AI sends people to",
        body: "Compare landing pages by AI-referred sessions, conversions and revenue to see which content turns AI visits into results.",
      },
      {
        icon: "euro",
        title: "Put revenue next to attribution",
        body: "GA4 revenue from AI-referred sessions appears in Attribution next to the deal values buyers attribute to AI search.",
      },
      {
        icon: "gauge",
        title: "Check your measurement",
        body: "The GA4 measurement health check shows whether conversions from AI-referred sessions can be measured correctly.",
      },
      {
        icon: "trending-up",
        title: "Prioritize pages close to the top",
        body: "With Search Console connected, pages in positions 4–20 are scored by demand, business value from GA4 and distance to the top.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Google Analytics in four steps,",
    muted: "read-only via OAuth.",
    items: [
      {
        title: "Open the Human Traffic settings",
        body: "In your project, open Analytics → Human Traffic → Settings, or Integrations → Google Analytics.",
      },
      {
        title: "Sign in with Google",
        body: "Grant read-only access to Google Analytics. Search Console read access is requested in the same step, so both can use one Google account.",
      },
      {
        title: "Choose the GA4 property",
        body: "Pick the Google account and the GA4 property that tracks this project's website. AutoSEO reads its time zone and currency.",
      },
      {
        title: "Let the first sync run",
        body: "AutoSEO imports up to 16 months of AI-referred traffic in the background and syncs daily after that.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track ChatGPT traffic in Google Analytics?",
      a: "Connect GA4 to AutoSEO. It reads sessions by source through the GA4 Data API and recognizes visits from chatgpt.com and other AI platforms, including utm_source values like chatgpt, so you don't have to build custom channel groups.",
    },
    {
      q: "Which AI platforms does AutoSEO detect in GA4?",
      a: "19 platforms, including ChatGPT, Perplexity, Google Gemini, Claude, Copilot, Meta AI, DeepSeek, Grok, Mistral Le Chat, You.com and Kagi Assistant. Each one is reported separately, next to its landing pages and conversions.",
    },
    {
      q: "What access does AutoSEO need to Google Analytics?",
      a: "Read-only access through Google's analytics.readonly scope, so AutoSEO can't change your GA4 setup. Tokens are stored encrypted in AutoSEO's database, and disconnecting removes the connection and all imported data for the project.",
    },
    {
      q: "How often is Google Analytics data synced?",
      a: "Daily. The first sync imports up to 16 months of history, and you can start a sync manually from the settings at any time.",
    },
    {
      q: "Does AutoSEO work with Universal Analytics?",
      a: "No. AutoSEO uses the GA4 Data API, so it works with Google Analytics 4 properties only.",
    },
    {
      q: "Do I need a Google OAuth client to self-host?",
      a: "Yes. On a self-hosted instance, an admin registers a Google OAuth client once under Admin → Data Providers, and then every user can connect their Google account. On AutoSEO Cloud, the Codext team manages the OAuth client for the shared app, so workspace owners don't register their own.",
    },
  ],
  cta: {
    title: "See what AI traffic is worth",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
