import type { IntegrationPage } from "../../types";

export default {
  slug: "knocommerce",
  name: "KnoCommerce",
  nav: "KnoCommerce",
  summary: "Import KnoCommerce survey answers with order details and attribute revenue to AI search.",
  meta: {
    title: "KnoCommerce Attribution for AI Search",
    description:
      "Import completed KnoCommerce post-purchase surveys with order name, total and currency every hour and see the revenue buyers attribute to ChatGPT and AI search.",
  },
  hero: {
    subtitle:
      "Create API credentials in KnoCommerce and connect them to AutoSEO. Completed survey responses arrive every hour with their order details, and answers that name ChatGPT, Perplexity or another assistant count as AI search.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the KnoCommerce integration",
    items: [
      "Connects with a KnoCommerce client ID and secret (RESPONSES scope)",
      "Completed responses imported every hour, plus Sync now",
      "Order name or number, total and currency attached to each answer",
      "The question labelled “How did you hear about us?” found automatically — or set the question ID",
      "“Other” answers kept as free text and classified too",
      "CSV upload when your Kno plan has no API access",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with KnoCommerce and AutoSEO",
    items: [
      {
        icon: "euro",
        title: "Attribute revenue from the survey alone",
        body: "Each response carries its order total, so AutoSEO adds up AI-search revenue even before you connect an order source.",
      },
      {
        icon: "sparkles",
        title: "Count buyers per assistant",
        body: "ChatGPT, Perplexity, Claude, Gemini, Copilot and more each get their own count inside AI search.",
      },
      {
        icon: "chart",
        title: "Compare with GA4 AI traffic",
        body: "Connect Google Analytics too, and survey-based AI revenue appears next to revenue from AI-referred sessions.",
      },
      {
        icon: "shopping-bag",
        title: "Merge with your order data",
        body: "Orders from Shopify, WooCommerce, Shopware or Stripe are matched to answers by order ID or email hash — each value counted once.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect KnoCommerce in three steps,",
    muted: "with API credentials.",
    items: [
      {
        title: "Create API credentials",
        body: "In KnoCommerce, open Settings → API and create a client ID and secret with the RESPONSES scope. API access depends on your Kno plan.",
      },
      {
        title: "Connect in AutoSEO",
        body: "Open Attribution → Integrations → KnoCommerce, paste the client ID and secret and click Connect. AutoSEO requests an access token and starts the first import.",
      },
      {
        title: "Let it sync",
        body: "Completed responses arrive every hour. Without API access, export responses as CSV and upload them with Import CSV instead.",
      },
    ],
  },
  faq: [
    {
      q: "How do I connect KnoCommerce to AutoSEO?",
      a: "Create API credentials with the RESPONSES scope in KnoCommerce under Settings → API, then paste the client ID and secret under Attribution → Integrations → KnoCommerce. AutoSEO imports completed responses every hour and attributes their order value to the channel each buyer named.",
    },
    {
      q: "Which KnoCommerce plan do I need?",
      a: "One that includes API access, because AutoSEO reads responses through the KnoCommerce API. If your plan doesn't include it, export responses as CSV and use Import CSV in AutoSEO.",
    },
    {
      q: "Which KnoCommerce responses are imported?",
      a: "Completed responses from the last 90 days on the first sync, then new ones every hour. AutoSEO takes the answer to the question labelled “How did you hear about us?” — or to the question ID you set.",
    },
    {
      q: "How are KnoCommerce answers matched to orders?",
      a: "Each response already carries its order name or number and total, so revenue is attributed directly. If orders also arrive from Shopify, WooCommerce, Shopware or Stripe, AutoSEO merges them by order ID or email hash and counts each value once.",
    },
    {
      q: "Where are my KnoCommerce credentials stored?",
      a: "Encrypted with AES-256-GCM in AutoSEO's database. They are used only to request an access token and read your survey responses.",
    },
    {
      q: "Is the KnoCommerce integration free?",
      a: "Yes. Attribution and all its integrations are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month. Classifying answers uses built-in rules, not AI credits.",
    },
  ],
  cta: {
    title: "See the revenue buyers credit to AI search",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
