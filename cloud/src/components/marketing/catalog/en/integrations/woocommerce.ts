import type { IntegrationPage } from "../../types";

export default {
  slug: "woocommerce",
  name: "WooCommerce",
  nav: "WooCommerce",
  summary: "Attribute paid WooCommerce orders and checkout answers to AI search with signed webhooks.",
  meta: {
    title: "WooCommerce Attribution for AI Search Orders",
    description:
      "Attribute WooCommerce orders to ChatGPT, Perplexity and other AI search: native signed webhooks send paid orders, and your checkout question is read as well.",
  },
  hero: {
    subtitle:
      "Add a native WooCommerce webhook and AutoSEO stores every paid order with value, currency and line items — and picks up the answer to “How did you hear about us?” if your checkout asks it.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the WooCommerce integration",
    items: [
      "WooCommerce's built-in webhooks — no AutoSEO plugin to install",
      "Every delivery verified with a shared secret (HMAC signature)",
      "Paid orders only: processing, completed and on-hold",
      "Order number, total, currency, billing email and up to 50 line items",
      "A “How did you hear about us?” checkout field in the order meta stored as an answer",
      "Orders matched to website answers by order number or hashed email, up to 90 days back",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with WooCommerce and AutoSEO",
    items: [
      {
        icon: "store",
        title: "Revenue per channel for your shop",
        body: "See the order value customers attribute to AI search, next to search, social, ads, referrals and content.",
      },
      {
        icon: "message-square",
        title: "Reuse your checkout question",
        body: "If your checkout already asks how customers found you, the answer arrives with the order — no popup needed.",
      },
      {
        icon: "sparkles",
        title: "Split revenue per assistant",
        body: "Buyers who answer “AI search” can name ChatGPT, Perplexity, Claude, Gemini or Copilot, so you see which assistant sold.",
      },
      {
        icon: "list-checks",
        title: "See what was bought",
        body: "Line items are stored with each order, so every attributed answer shows the products behind the revenue.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect WooCommerce in four steps,",
    muted: "with a native webhook.",
    items: [
      {
        title: "Generate URL and secret",
        body: "In your project, open Attribution → Integrations → WooCommerce and click Connect. Copy the webhook URL and the secret — both are shown only once.",
      },
      {
        title: "Add a webhook in WooCommerce",
        body: "In WordPress, open WooCommerce → Settings → Advanced → Webhooks → Add webhook. Set the status to Active and the topic to “Order updated”; add a second one for “Order created” if you like.",
      },
      {
        title: "Paste URL and secret",
        body: "Use the AutoSEO URL as delivery URL, paste the secret, keep the API version WP REST API Integration v3 and save.",
      },
      {
        title: "Place a test order",
        body: "Once the order is paid, it appears under Webhook Logs and merges with the buyer's survey answer.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track WooCommerce sales from ChatGPT?",
      a: "Connect WooCommerce with a native order webhook and add the AutoSEO snippet to your store so buyers can answer “How did you hear about us?”. AutoSEO matches each paid order to the answer and reports revenue from ChatGPT and other assistants as AI search.",
    },
    {
      q: "Do I need a WordPress plugin?",
      a: "Not for the orders: WooCommerce's built-in webhooks send them. For the survey, add the AutoSEO snippet to your site's head — for example with a header plugin such as WPCode or in your child theme's header.php.",
    },
    {
      q: "Which WooCommerce orders are counted?",
      a: "Orders with the status processing, completed or on-hold. Pending, failed or cancelled orders are skipped until they're paid, and an order that's updated several times is stored once, keyed on its order number.",
    },
    {
      q: "Can AutoSEO read our own checkout field?",
      a: "Yes. If the order meta contains a field whose key looks like “How did you hear about us?” — for example hdyhau or hear_about — its value is stored as an answer with the order. If the buyer already answered the website survey, the order is linked to that answer instead.",
    },
    {
      q: "What if the website snippet reports the same purchase?",
      a: "The order is stored once. Conversions are deduplicated by order number, and the values from the signed webhook take precedence over purchase events reported by the browser.",
    },
    {
      q: "How is the WooCommerce webhook secured?",
      a: "WooCommerce signs each delivery with your secret, and AutoSEO rejects anything with a missing or wrong signature. The URL's token is stored only as a hash, and billing emails are kept as a hash with a masked preview.",
    },
    {
      q: "Is the WooCommerce integration included in the price?",
      a: "Yes. Attribution and every integration are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month with $10 of AI and data usage.",
    },
  ],
  cta: {
    title: "Put a revenue number on AI search",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
