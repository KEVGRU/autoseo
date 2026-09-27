import type { IntegrationPage } from "../../types";

export default {
  slug: "gravity-forms",
  name: "Gravity Forms",
  nav: "Gravity Forms",
  summary: "Send Gravity Forms entries from WordPress to AutoSEO and attribute leads to AI search.",
  meta: {
    title: "Gravity Forms AI Search Attribution",
    description:
      "Connect Gravity Forms to AutoSEO with the Webhooks Add-On, send your “How did you hear about us?” field as channelId and see which leads come from AI search.",
  },
  hero: {
    subtitle:
      "Use the Gravity Forms Webhooks Add-On to send entries from your WordPress site to AutoSEO. Name three fields in the request body, and every entry arrives in AutoSEO's own format — no mapping step needed.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Gravity Forms integration",
    items: [
      "Uses the Gravity Forms Webhooks Add-On — no AutoSEO plugin for WordPress",
      "Send channelId, respondentEmail and pageUrl, and entries parse without a mapping step",
      "Prefer sending all fields? AutoSEO recognizes Gravity Forms entries and lets you map them once",
      "The form's embed URL stored with every answer",
      "Works next to WooCommerce order webhooks from the same WordPress site",
      "Emails stored only as a SHA-256 hash with a masked preview",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Gravity Forms and AutoSEO",
    items: [
      {
        icon: "building",
        title: "Attribute B2B leads from WordPress",
        body: "Contact, quote and demo forms built with Gravity Forms report how each lead heard about you.",
      },
      {
        icon: "shopping-bag",
        title: "Combine with WooCommerce orders",
        body: "Connect WooCommerce too, and AutoSEO merges form answers with paid orders by email hash — including the order value.",
      },
      {
        icon: "map-pin",
        title: "Know which page the form was on",
        body: "The embed URL shows whether AI-search leads come in through a pricing page, a landing page or the contact page.",
      },
      {
        icon: "sparkles",
        title: "See which assistant sent the lead",
        body: "Answers that name ChatGPT, Perplexity, Claude, Gemini or Copilot are counted per assistant.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Gravity Forms in four steps,",
    muted: "with the Webhooks Add-On.",
    items: [
      {
        title: "Generate your webhook URL",
        body: "In your project, open Attribution → Integrations → Gravity Forms and click Connect. Copy the URL — it's shown only once.",
      },
      {
        title: "Add a webhook feed",
        body: "In WordPress, install the Gravity Forms Webhooks Add-On and open your form → Settings → Webhooks → Add New.",
      },
      {
        title: "Set URL, method and fields",
        body: "Request URL: your webhook URL, Method: POST, Format: JSON. Under Request Body, choose Select Fields and add channelId (your question), respondentEmail (the email field) and pageUrl (the embed URL).",
      },
      {
        title: "Submit a test entry",
        body: "Fill out the form once and check the entry under Webhook Logs. Only if you send all fields instead do you confirm a mapping under Field Mapping.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track which Gravity Forms leads come from AI search?",
      a: "Add a “How did you hear about us?” field to your form and send entries to AutoSEO with a webhook feed from the Gravity Forms Webhooks Add-On. Answers that mention ChatGPT, Perplexity or another assistant count as AI search, per assistant.",
    },
    {
      q: "Do I need the Gravity Forms Webhooks Add-On?",
      a: "Yes. AutoSEO receives entries through the add-on's webhook feed. There's no separate AutoSEO plugin to install in WordPress.",
    },
    {
      q: "Why name the fields channelId, respondentEmail and pageUrl?",
      a: "Those are the field names of AutoSEO's documented webhook schema. Entries that use them are parsed right away, so you skip the mapping step entirely.",
    },
    {
      q: "Can I combine Gravity Forms with WooCommerce?",
      a: "Yes. Connect WooCommerce's order webhook as well. AutoSEO merges a form answer and a paid order that share the same email address and uses the order value — without counting it twice.",
    },
    {
      q: "Is the Gravity Forms integration free?",
      a: "Yes. Attribution and all its integrations are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month. Classifying answers uses built-in rules, not AI credits.",
    },
  ],
  cta: {
    title: "See which WordPress leads AI search sends",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
