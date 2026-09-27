import type { IntegrationPage } from "../../types";

export default {
  slug: "matomo",
  name: "Matomo",
  nav: "Matomo",
  summary: "Import visits from ChatGPT, Perplexity and other AI platforms from your Matomo.",
  meta: {
    title: "Matomo Integration for AI Traffic Analytics",
    description:
      "Connect Matomo to AutoSEO and see visits, goal conversions and revenue from ChatGPT, Perplexity, Gemini and other AI platforms — self-hosted or Matomo Cloud.",
  },
  hero: {
    subtitle:
      "Connect your self-hosted or cloud Matomo with a read-only auth token and see which AI assistants send visitors, where they land and whether they convert — next to your organic search traffic.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Matomo integration",
    items: [
      "Works with self-hosted Matomo and Matomo Cloud",
      "Visits referred by 19 AI platforms, detected from the referrer URL",
      "Landing page, country, engagement, goal conversions and e-commerce revenue per AI visit",
      "An AI vs. organic search benchmark from the same Matomo site",
      "Up to 16 months of history on the first sync, then daily updates",
      "Read access is enough — the token is sent in the request body, never in the URL",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Matomo and AutoSEO",
    items: [
      {
        icon: "chart",
        title: "Measure AI traffic without Google Analytics",
        body: "Keep your privacy-first analytics setup and still see how many visitors ChatGPT, Perplexity, Claude, Gemini and Copilot send.",
      },
      {
        icon: "trending-up",
        title: "Compare AI visitors with organic search",
        body: "See AI-referred visits next to search-engine visits from the same site, measured with the same engagement definition.",
      },
      {
        icon: "euro",
        title: "See what AI visits are worth",
        body: "Goal conversions and e-commerce orders from AI-referred visits show whether that traffic turns into results.",
      },
      {
        icon: "file-text",
        title: "Find the pages AI recommends",
        body: "Landing pages of AI visitors tell you which content assistants link to — and where to invest next.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Matomo in four steps,",
    muted: "with a read-only token.",
    items: [
      {
        title: "Create an auth token",
        body: "In Matomo, open Administration → Personal → Security → Auth tokens and create a token for a user with view access to the site.",
      },
      {
        title: "Open the analytics settings",
        body: "In your AutoSEO project, open Analytics → Human Traffic → Settings, or Integrations → Matomo.",
      },
      {
        title: "Enter URL, site ID and token",
        body: "Enter the base URL of your Matomo (without index.php), the numeric site ID and the token, then test the connection.",
      },
      {
        title: "Let the first sync run",
        body: "AutoSEO imports up to 16 months of AI-referred visits in the background and syncs daily after that.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track ChatGPT traffic in Matomo?",
      a: "Connect Matomo to AutoSEO with your Matomo URL, site ID and an auth token. AutoSEO pulls visits whose referrer is ChatGPT or another AI platform and shows them with landing pages, conversions and revenue — no Matomo segments or plugins needed.",
    },
    {
      q: "Does it work with self-hosted Matomo?",
      a: "Yes, as long as your AutoSEO server can reach the Matomo URL. On a self-hosted AutoSEO instance, an admin can allow Matomo hosts on a private network under Admin → Authentication; AutoSEO Cloud only connects to public addresses.",
    },
    {
      q: "Which Matomo permissions does AutoSEO need?",
      a: "View access to the site is enough. AutoSEO only calls Matomo's Reporting API, and the token is stored encrypted with AES-256-GCM in AutoSEO's database.",
    },
    {
      q: "Which AI platforms does AutoSEO detect in Matomo?",
      a: "19 platforms, including ChatGPT, Perplexity, Google Gemini, Claude, Copilot, Meta AI, DeepSeek, Grok and Mistral Le Chat. Visits are matched by the referrer URL.",
    },
    {
      q: "How often is Matomo data synced?",
      a: "Daily. The first sync imports up to 16 months of history, and you can start a sync manually from the settings at any time.",
    },
  ],
  cta: {
    title: "See what AI traffic is worth",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
