import type { IntegrationPage } from "../../types";

export default {
  slug: "zigpoll",
  name: "Zigpoll",
  nav: "Zigpoll",
  summary: "Import Zigpoll answers with order value and page context, and attribute them to AI search.",
  meta: {
    title: "Zigpoll Attribution for AI Search",
    description:
      "Import Zigpoll on-site and post-purchase poll answers every hour — with order value, page URL and referrer — and see which buyers found you through AI search.",
  },
  hero: {
    subtitle:
      "Connect Zigpoll with an API key and the ID of your “How did you hear about us?” question. AutoSEO imports answers every hour with order value, page URL, UTM tags and the original referrer, and attributes them to AI search and your other channels.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Zigpoll integration",
    items: [
      "Hourly import through the Zigpoll API, plus Sync now",
      "Scope the import to one question (slide), a whole poll or your account",
      "Order value and order number or Shopify order ID from the response metadata",
      "Page URL, UTM source and medium and the original referrer kept as context",
      "Open-ended answers classified from their free text",
      "CSV upload for exported responses",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Zigpoll and AutoSEO",
    items: [
      {
        icon: "store",
        title: "Attribute on-site and thank-you-page polls",
        body: "Wherever your poll runs, answers that come with order data carry their value into AutoSEO.",
      },
      {
        icon: "sparkles",
        title: "Count buyers per assistant",
        body: "Answers naming ChatGPT, Perplexity, Claude, Gemini or Copilot are counted per assistant inside AI search.",
      },
      {
        icon: "search",
        title: "Compare answers with referrers",
        body: "The original referrer and UTM tags sit next to each answer, so you see what buyers say next to where analytics thinks they came from.",
      },
      {
        icon: "euro",
        title: "Merge with your orders",
        body: "Orders from Shopify, WooCommerce, Shopware or Stripe are matched to poll answers by order ID or email hash — each value counted once.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Zigpoll in three steps,",
    muted: "with an API key.",
    items: [
      {
        title: "Copy your API key",
        body: "In Zigpoll, open Settings → API key and copy it. API access requires Zigpoll's Premium plan.",
      },
      {
        title: "Find the question ID",
        body: "Copy the ID of your “How did you hear about us?” question (slide). A poll ID or account ID works too, but imports every question in it.",
      },
      {
        title: "Connect in AutoSEO",
        body: "Open Attribution → Integrations → Zigpoll, paste the key and ID and click Connect. The first import covers the last 90 days, then new answers arrive every hour.",
      },
    ],
  },
  faq: [
    {
      q: "How do I connect Zigpoll to AutoSEO?",
      a: "Copy your API key from Zigpoll's settings and the ID of your “How did you hear about us?” question, then connect both under Attribution → Integrations → Zigpoll. AutoSEO imports answers every hour and attributes them to AI search and your other channels.",
    },
    {
      q: "Why should I set the question (slide) ID?",
      a: "With a slide ID, AutoSEO imports only that question's answers. With a poll or account ID, it imports every answer in scope, so answers to other questions would end up in your attribution data.",
    },
    {
      q: "Which Zigpoll plan do I need?",
      a: "API access requires Zigpoll's Premium plan. Without it, export your responses as CSV and upload them with Import CSV in AutoSEO.",
    },
    {
      q: "How are Zigpoll answers matched to orders?",
      a: "If the response metadata contains an order number or Shopify order ID, AutoSEO uses it as the order key, together with the order value. Orders from your other sources are merged by order ID or email hash, and each value is counted once.",
    },
    {
      q: "Is the Zigpoll integration free?",
      a: "Yes. Attribution and all its integrations are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month. Classifying answers uses built-in rules, not AI credits.",
    },
  ],
  cta: {
    title: "See which buyers AI search sends you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
