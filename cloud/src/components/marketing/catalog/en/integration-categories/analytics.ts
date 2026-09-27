import type { IntegrationCategoryPage } from "../../types";

export default {
  slug: "analytics",
  nav: "Analytics integrations",
  summary: "Measure visits, conversions and revenue from AI platforms in GA4, Matomo or Piwik PRO.",
  meta: {
    title: "Track AI Traffic in GA4, Matomo & Piwik PRO",
    description:
      "Track AI traffic in GA4, Matomo or Piwik PRO: AutoSEO shows the sessions, conversions and revenue that ChatGPT, Perplexity, Gemini and other assistants send.",
  },
  hero: {
    eyebrow: "Analytics integrations",
    title: "Track AI traffic in GA4, Matomo and Piwik PRO.",
    muted: "Visits, conversions, revenue.",
    subtitle:
      "Connect your analytics and AutoSEO imports the visits AI assistants send you — from ChatGPT, Perplexity, Gemini, Claude, Copilot and four more — together with the pages people land on and what they do there.",
  },
  benefits: {
    eyebrow: "What you get",
    title: "From AI answer to revenue,",
    muted: "in one view.",
    items: [
      {
        icon: "chart",
        title: "AI referrals, separated",
        body: "Visits from nine AI platforms are recognized by referrer and utm_source and reported apart from the rest of your traffic, per platform and landing page.",
      },
      {
        icon: "git-fork",
        title: "AI model → page → outcome",
        body: "A flow view shows which assistant sent visitors to which kind of page — product, pricing, blog, comparison or support — and whether they converted.",
      },
      {
        icon: "euro",
        title: "Conversions and revenue",
        body: "Key events, goal conversions, transactions and revenue per AI platform, compared with the previous period — from whichever tool you connect.",
      },
      {
        icon: "target",
        title: "Search opportunities",
        body: "With Search Console connected too, pages ranking at positions 4–20 are scored by demand, GA4 business value and distance to the top.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track ChatGPT traffic in Google Analytics 4?",
      a: "Connect Google Analytics in AutoSEO with your Google account and pick the GA4 property. AutoSEO reads sessions, key events and revenue through the GA4 Data API and separates visits from ChatGPT, Perplexity, Gemini and other assistants. Your GA4 setup stays as it is.",
    },
    {
      q: "Which AI platforms does AutoSEO detect in analytics data?",
      a: "ChatGPT, Perplexity, Google Gemini, Claude, Microsoft Copilot, Meta AI, DeepSeek, Grok, Mistral Le Chat and eleven more — 20 platforms in total. Visits are matched by referrer domain and by source values such as utm_source=chatgpt.",
    },
    {
      q: "Does AutoSEO work with Matomo and Piwik PRO?",
      a: "Yes. Matomo, cloud or self-hosted, connects with its URL, site ID and an auth token with read access. Piwik PRO connects with API client credentials. Both import AI-referred visits, conversions and revenue just like GA4.",
    },
    {
      q: "How often is analytics data updated?",
      a: "Connected analytics tools sync once a day, and you can start a sync manually at any time. AutoSEO keeps up to 16 months of imported traffic data.",
    },
    {
      q: "How do I know my GA4 setup measures AI conversions correctly?",
      a: "AutoSEO checks the connected GA4 property for a web data stream, enhanced measurement and configured key events, and warns when missing key events would hide conversions from AI traffic. Traffic reports also flag issues such as a high share of sessions with a “(not set)” source.",
    },
    {
      q: "Is the analytics integration free?",
      a: "Yes. All analytics integrations are part of the open-source app and free to self-host. AutoSEO Cloud includes them in a managed workspace for $50 per month, with $10 of AI and data usage included.",
    },
  ],
  cta: {
    title: "See what AI traffic is worth to you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationCategoryPage;
