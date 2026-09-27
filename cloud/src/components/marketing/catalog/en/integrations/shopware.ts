import type { IntegrationPage } from "../../types";

export default {
  slug: "shopware",
  name: "Shopware",
  nav: "Shopware",
  summary: "Send placed Shopware 6 orders to AutoSEO and attribute them to AI search.",
  meta: {
    title: "Shopware Attribution for AI Search Orders",
    description:
      "Attribute Shopware 6 orders to ChatGPT, Perplexity and other AI search: a Flow Builder webhook sends each placed order, matched to the buyer's survey answer.",
  },
  hero: {
    subtitle:
      "Add a “Call webhook” action to a Shopware Flow Builder flow and every placed order reaches AutoSEO with order number, total, currency and customer email — merged with the answer the buyer gave on your storefront.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Shopware integration",
    items: [
      "A Flow Builder flow on “Checkout / Order / Placed” — no Shopware plugin from AutoSEO",
      "Order number, total amount, currency and customer email in a short JSON body",
      "The body follows AutoSEO's schema, so orders are parsed without any field mapping",
      "The AutoSEO survey on your storefront asks “How did you hear about us?”",
      "Orders matched to answers by order number or hashed email, up to 90 days back",
      "Customer emails hashed on arrival and shown only as a masked preview",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Shopware and AutoSEO",
    items: [
      {
        icon: "store",
        title: "Revenue from AI search for your shop",
        body: "See the order value buyers attribute to AI search, next to search, social, ads, referrals and content.",
      },
      {
        icon: "message-square",
        title: "Ask right after checkout",
        body: "If your storefront fires a GA4, Google Ads or Meta Pixel purchase event, the survey can open right after checkout and send that purchase's transaction ID with the answer.",
      },
      {
        icon: "sparkles",
        title: "Know which assistant sold",
        body: "Buyers who pick AI search can name ChatGPT, Perplexity, Claude, Gemini or Copilot, so revenue splits per assistant.",
      },
      {
        icon: "target",
        title: "Back your GEO work with orders",
        body: "Show attributed revenue next to your AI visibility metrics in the same AutoSEO project.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Shopware in five steps,",
    muted: "with a Flow Builder webhook.",
    items: [
      {
        title: "Generate your webhook URL",
        body: "In your project, open Attribution → Integrations → Shopware and click Connect. Copy the webhook URL — it's shown only once.",
      },
      {
        title: "Create a flow",
        body: "In Shopware admin, open Settings → Flow Builder → Add flow and choose the trigger “Checkout / Order / Placed”.",
      },
      {
        title: "Add the “Call webhook” action",
        body: "Method POST, your webhook URL, content type JSON, and the body from the setup guide with order number, total, currency ISO code and customer email.",
      },
      {
        title: "Add the survey snippet",
        body: "Place the AutoSEO snippet in your theme's base.html.twig (block layout_head_javascript_tracking) or load it with a tag manager.",
      },
      {
        title: "Place a test order",
        body: "Save the flow, place an order and check it under Webhook Logs. From then on, orders and answers merge automatically.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track Shopware orders from ChatGPT?",
      a: "Send placed orders to AutoSEO with a Flow Builder “Call webhook” action and add the AutoSEO survey snippet to your storefront. AutoSEO matches each order to the buyer's answer and reports revenue from ChatGPT and other assistants as AI search.",
    },
    {
      q: "Which Shopware versions are supported?",
      a: "The setup is built for Shopware 6 and its Flow Builder. If your edition doesn't offer the “Call webhook” action, send the same JSON to the same URL through Zapier, Make, n8n or your own integration.",
    },
    {
      q: "What data does the Shopware webhook send?",
      a: "Only what you put into the body. The setup guide uses order number, total amount, currency ISO code and customer email; the email is hashed on arrival and shown only as a masked preview.",
    },
    {
      q: "How are Shopware orders matched to survey answers?",
      a: "By order number when the answer carries the same transaction ID, otherwise by the hashed email the buyer entered in a form on your site. AutoSEO looks back up to 90 days for an unmatched answer and links each order to one answer at most.",
    },
    {
      q: "Are cancellations or refunds synced?",
      a: "No. The flow reports each order when it's placed, and later status changes aren't sent to AutoSEO, so attributed revenue reflects placed orders.",
    },
    {
      q: "Is the Shopware integration included in the price?",
      a: "Yes. Attribution and every integration are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month with $10 of AI and data usage.",
    },
  ],
  cta: {
    title: "Find out which orders AI search brings in",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
