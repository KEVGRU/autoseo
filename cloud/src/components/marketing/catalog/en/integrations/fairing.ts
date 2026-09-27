import type { IntegrationPage } from "../../types";

export default {
  slug: "fairing",
  name: "Fairing",
  nav: "Fairing",
  summary: "Import Fairing post-purchase answers with order totals and see what AI search earns you.",
  meta: {
    title: "Fairing Survey Attribution for AI Search",
    description:
      "Import Fairing post-purchase survey answers with order number and total every hour, and see how much revenue buyers attribute to ChatGPT and other AI search.",
  },
  hero: {
    subtitle:
      "Connect Fairing with an API key. AutoSEO imports every “How did you hear about us?” answer from your post-purchase survey — with order number, total and currency — and adds up the revenue buyers attribute to AI search.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Fairing integration",
    items: [
      "Hourly import through the Fairing API with your API key, plus Sync now",
      "Order number, order total and currency on every answer",
      "Only “How did you hear about us?” questions imported — or the question ID you choose",
      "Clarification follow-ups skipped, “Other” answers kept as free text",
      "UTM source, UTM medium, referring site and landing page stored as context",
      "CSV upload for older exports",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Fairing and AutoSEO",
    items: [
      {
        icon: "euro",
        title: "Revenue from AI search, order by order",
        body: "Every answer arrives with its order total, so AI-search revenue adds up without a second order source.",
      },
      {
        icon: "sparkles",
        title: "See which assistant sent the buyer",
        body: "Answers like “ChatGPT” or “saw it on Perplexity” are counted per assistant, next to search, social and ads.",
      },
      {
        icon: "eye",
        title: "Read each answer in context",
        body: "Open any answer to see the order, the landing page and the UTM tags that came with it.",
      },
      {
        icon: "trending-up",
        title: "Relate revenue to AI visibility",
        body: "AutoSEO correlates your daily AI visibility from the tracker with the AI-search answers and revenue your survey collects.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Fairing in three steps,",
    muted: "with an API key.",
    items: [
      {
        title: "Copy your Fairing API key",
        body: "In Fairing, open Settings → Integrations → API and copy the API key.",
      },
      {
        title: "Connect in AutoSEO",
        body: "Open Attribution → Integrations → Fairing, paste the key, optionally set a question ID and click Connect. The first import covers the last 90 days.",
      },
      {
        title: "Stay in sync",
        body: "New answers arrive every hour. Click Sync now for an immediate update, or use Import CSV for older exports.",
      },
    ],
  },
  faq: [
    {
      q: "How do I measure AI search revenue with Fairing?",
      a: "Connect Fairing to AutoSEO with your API key. AutoSEO imports your “How did you hear about us?” answers with their order totals, counts answers that mention ChatGPT or another assistant as AI search and sums the revenue per channel and assistant.",
    },
    {
      q: "Which Fairing questions are imported?",
      a: "By default, every question that reads like “How did you hear about us?” in English or German. Set a question ID when you connect to import only that question. Clarification follow-up questions are skipped.",
    },
    {
      q: "Will revenue be counted twice if my Shopify orders are connected too?",
      a: "No. An order is matched to one answer only — by order ID or email hash — and the order value only fills in when the answer has none.",
    },
    {
      q: "How far back does the Fairing import go?",
      a: "The first sync pulls answers from the last 90 days. After that, only new answers are fetched every hour. For older data, export responses in Fairing and upload the CSV.",
    },
    {
      q: "What does AutoSEO store from Fairing?",
      a: "The answer and any “Other” text, order number, total and currency, UTM source and medium, referring site and landing page — and the buyer's email as a SHA-256 hash with a masked preview. Your API key is stored encrypted.",
    },
    {
      q: "Is the Fairing integration free?",
      a: "Yes. Attribution and all its integrations are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month. Classifying answers uses built-in rules, not AI credits.",
    },
  ],
  cta: {
    title: "Put a revenue number on AI search",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
