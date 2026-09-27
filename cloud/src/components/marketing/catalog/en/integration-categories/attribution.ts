import type { IntegrationCategoryPage } from "../../types";

export default {
  slug: "attribution",
  nav: "Attribution integrations",
  summary: "Tie orders, leads and deals to AI search — from your shop, CRM, forms and surveys.",
  meta: {
    title: "AI Search Attribution: Shopify, Stripe & CRM",
    description:
      "AI search attribution for your shop, CRM and forms: connect Shopify, Stripe, HubSpot, Salesforce, Typeform and more to see the revenue AI assistants bring in.",
  },
  hero: {
    eyebrow: "Attribution integrations",
    title: "AI search attribution for orders, leads and deals.",
    muted: "Connected to your stack.",
    subtitle:
      "Ask “How did you hear about us?” where customers already answer — in checkout, forms, surveys or your CRM — and AutoSEO matches every answer to the order or deal behind it. You see the share of customers and revenue that came from ChatGPT, Perplexity and other AI assistants.",
  },
  benefits: {
    eyebrow: "Why connect",
    title: "Answers meet revenue,",
    muted: "automatically.",
    items: [
      {
        icon: "message-square",
        title: "Ask where customers already answer",
        body: "The snippet reuses an existing “How did you hear about us?” field in your forms or shows a small survey, with an optional follow-up: which AI assistant?",
      },
      {
        icon: "euro",
        title: "Orders and deals matched",
        body: "Answers are merged with conversions by order ID, hashed email or the same browser, looking back up to 90 days. Each deal value counts once.",
      },
      {
        icon: "plug",
        title: "Pixel, webhook or API import",
        body: "Shopify uses a custom pixel, Stripe and WooCommerce signed webhooks, post-purchase surveys an hourly API import. Anything else posts JSON you map once.",
      },
      {
        icon: "lock",
        title: "No clear-text emails",
        body: "Email addresses are hashed with SHA-256, in the browser whenever possible, and only a masked preview is shown. The snippet sets no cookies.",
      },
    ],
  },
  faq: [
    {
      q: "What is AI search attribution?",
      a: "AI search attribution measures how many customers found you through AI assistants like ChatGPT or Perplexity and how much revenue they brought. AutoSEO combines answers to “How did you hear about us?” with the orders and deals behind them. Self-reported answers also capture recommendations that click-based analytics can miss, for example when someone asks ChatGPT and later types in your URL.",
    },
    {
      q: "Which tools can I connect for attribution?",
      a: "Shops and payments: Shopify, WooCommerce, Shopware and Stripe. Forms and surveys: Typeform, Tally, Jotform, Gravity Forms, Formstack, SurveyMonkey, Fairing, KnoCommerce and Zigpoll. CRM and sales: HubSpot, Salesforce, Pipedrive, Attio, Close, Intercom and Calendly. Everything else connects through Zapier, Make, n8n or a custom webhook.",
    },
    {
      q: "How does Shopify attribution work?",
      a: "You add a Shopify custom pixel that sends each checkout's order ID, value, currency and a hashed email to AutoSEO — no app install required. The website snippet asks visitors where they heard about you, and AutoSEO matches the answer to the order.",
    },
    {
      q: "Do I have to change my forms?",
      a: "No. If a form already asks “How did you hear about us?” in English or German, the snippet captures the answer on submit. Otherwise it can show a small survey after a form submit, after a purchase or on page load.",
    },
    {
      q: "How do HubSpot and Salesforce send data to AutoSEO?",
      a: "Through their own automation: a HubSpot workflow with a “Send a webhook” action for contacts or deals, and a Salesforce Flow HTTP callout on lead or opportunity changes. AutoSEO shows the setup steps and a preset field mapping you can adjust.",
    },
    {
      q: "Can I import survey answers I already have?",
      a: "Yes. Fairing, KnoCommerce, Zigpoll and SurveyMonkey responses are imported through their APIs every hour, and you can upload their CSV exports — columns are detected automatically.",
    },
    {
      q: "Can I compare self-reported data with Google Analytics?",
      a: "Yes. With GA4 connected, the attribution overview also shows the revenue of sessions referred by ChatGPT, Perplexity, Claude and other assistants, next to the revenue customers attribute to AI search themselves.",
    },
    {
      q: "Is AI search attribution included in AutoSEO?",
      a: "Yes. The snippet, every connector and the attribution reports are part of the open-source app and free to self-host. AutoSEO Cloud includes them in a managed workspace for $50 per month, with $10 of AI and data usage included.",
    },
  ],
  cta: {
    title: "Find out what AI search is worth to you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationCategoryPage;
