import type { IntegrationPage } from "../../types";

export default {
  slug: "shopify",
  name: "Shopify",
  nav: "Shopify",
  summary: "Attribute Shopify orders and revenue to AI search with a custom pixel.",
  meta: {
    title: "Shopify AI Search Attribution for Orders",
    description:
      "Attribute Shopify orders and revenue to ChatGPT, Perplexity and other AI search with a custom pixel and an on-site survey — no Shopify app to install.",
  },
  hero: {
    subtitle:
      "Add a Shopify custom pixel and the AutoSEO survey snippet to see which orders came from ChatGPT, Perplexity and other AI assistants — with order value and currency, and no app to install.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Shopify integration",
    items: [
      "A custom pixel that reports every completed checkout: order ID, value, currency and line items",
      "Buyer emails hashed with SHA-256 in the browser — the clear address is never sent",
      "A “How did you hear about us?” survey on your storefront with ChatGPT, Perplexity, Claude, Gemini and Copilot as answers",
      "Orders matched to survey answers by order ID, email hash or browser",
      "Revenue from AI search next to search, social, ads, referral and content",
      "Publishing blog articles to Shopify is coming soon",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Shopify and AutoSEO",
    items: [
      {
        icon: "euro",
        title: "Prove revenue from AI search",
        body: "See the order value buyers attribute to AI search in any period and compare it with every other channel.",
      },
      {
        icon: "sparkles",
        title: "Know which assistant sent the buyer",
        body: "Buyers who answer “AI search” can name ChatGPT, Perplexity, Claude, Gemini or Copilot, so you see which assistants lead to orders.",
      },
      {
        icon: "target",
        title: "Back your GEO work with orders",
        body: "Show stakeholders the revenue attributed to AI search next to your AI visibility metrics in the same project.",
      },
      {
        icon: "chart",
        title: "Compare with GA4 AI traffic",
        body: "Connect Google Analytics too, and revenue from AI-referred sessions appears next to the survey-based numbers.",
      },
      {
        icon: "lock",
        title: "Keep customer data minimal",
        body: "The pixel sends no clear-text email, and the survey remembers who already answered in local storage instead of cookies.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Shopify in four steps,",
    muted: "no app install required.",
    items: [
      {
        title: "Open the Shopify setup in AutoSEO",
        body: "In your project, open Attribution → Integrations → Shopify. AutoSEO shows the custom pixel code and the storefront snippet for your project.",
      },
      {
        title: "Add the custom pixel",
        body: "In Shopify admin, open Settings → Customer events → Add custom pixel, paste the code, choose the permission settings from the setup guide and save.",
      },
      {
        title: "Add the survey snippet to your theme",
        body: "Paste the snippet into theme.liquid before </head> (Online Store → Themes → Edit code) so visitors can answer “How did you hear about us?”.",
      },
      {
        title: "Place a test order",
        body: "The checkout shows up under Webhook Logs within seconds. From then on, orders and survey answers are merged automatically.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track Shopify sales from ChatGPT?",
      a: "Install the AutoSEO custom pixel under Settings → Customer events and add the survey snippet to your theme. The pixel reports each completed checkout, the survey asks buyers how they found you, and AutoSEO merges both, so orders from ChatGPT and other AI assistants show up with their revenue.",
    },
    {
      q: "Do I need to install a Shopify app?",
      a: "No. The integration uses Shopify's built-in custom pixels and a snippet in your theme. There is no app to install and no Shopify API access to grant.",
    },
    {
      q: "What data does the Shopify pixel send?",
      a: "Order ID, order value, currency, line items (name, quantity, price, SKU) and a SHA-256 hash of the buyer's email with a masked preview. The clear email address never leaves the browser.",
    },
    {
      q: "How does AutoSEO know an order came from AI search?",
      a: "From the buyer's answer to “How did you hear about us?”. AutoSEO matches the answer to the order by order ID, email hash or the same browser, looking back up to 90 days. Free-text answers such as “ChatGPT” count as AI search.",
    },
    {
      q: "Can AutoSEO publish blog posts to Shopify?",
      a: "Not yet — publishing optimized articles to a Shopify blog is coming soon. Today you can publish content drafts to WordPress or Webflow, or export them as HTML or Markdown.",
    },
    {
      q: "Is the Shopify integration included in the price?",
      a: "Yes. Attribution and all integrations are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month, which also covers $10 of AI and data usage.",
    },
  ],
  cta: {
    title: "See which orders AI search brings in",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
