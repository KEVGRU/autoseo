import type { IntegrationPage } from "../../types";

export default {
  slug: "pipedrive",
  name: "Pipedrive",
  nav: "Pipedrive",
  summary: "Attribute Pipedrive deals and their value to AI search with a deal webhook.",
  meta: {
    title: "Pipedrive AI Search Attribution for Deals",
    description:
      "Attribute Pipedrive deals to ChatGPT, Perplexity and other AI search: a deal webhook sends value, currency and your lead source field to AutoSEO.",
  },
  hero: {
    subtitle:
      "Create a Pipedrive webhook for deals and AutoSEO records each deal's value and currency together with the answer from your “How did you hear about us?” field — so you see how much pipeline AI search brings in.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Pipedrive integration",
    items: [
      "A Pipedrive webhook for deal events — added, updated, or both",
      "Deal value and currency suggested in Field Mapping",
      "Your custom lead source field mapped once under Field Mapping",
      "One record per deal: updates replace the value instead of adding to it",
      "Answers like “ChatGPT” or “found you on Perplexity” counted as AI search, per assistant",
      "Every delivery listed under Webhook Logs",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Pipedrive and AutoSEO",
    items: [
      {
        icon: "euro",
        title: "Measure pipeline from AI search",
        body: "See the deal value AI search brings in, next to search, social, ads, referrals and content.",
      },
      {
        icon: "refresh",
        title: "Keep deal values current",
        body: "Subscribe to updated deals too, and a changed deal value replaces the old one instead of adding up.",
      },
      {
        icon: "sparkles",
        title: "See which assistant sent the lead",
        body: "When your lead source names ChatGPT, Perplexity, Claude, Gemini or Copilot, deals are counted per assistant.",
      },
      {
        icon: "presentation",
        title: "Report pipeline next to visibility",
        body: "Put attributed deal value beside your AI visibility metrics when you report to sales and leadership.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Pipedrive in four steps,",
    muted: "with a deal webhook.",
    items: [
      {
        title: "Generate your webhook URL",
        body: "In your project, open Attribution → Integrations → Pipedrive and click Connect. Copy the webhook URL — it's shown only once.",
      },
      {
        title: "Create the webhook in Pipedrive",
        body: "Open Tools & apps → Webhooks → Create new webhook, choose the event object “deal” and the action “added” (or “updated”), and paste the URL as endpoint.",
      },
      {
        title: "Create a test deal",
        body: "Add a deal with your lead source field filled in. The delivery shows up under Webhook Logs.",
      },
      {
        title: "Map your lead source field",
        body: "Open Field Mapping and pick your custom lead source field as the answer. Deliveries that arrived before are processed as soon as you save.",
      },
    ],
  },
  faq: [
    {
      q: "How do I attribute Pipedrive deals to AI search?",
      a: "Send deal events from Pipedrive to your AutoSEO webhook URL and map your lead source field once. AutoSEO counts answers such as “ChatGPT” or “AI search” as AI search and adds up the deal value per channel.",
    },
    {
      q: "Where does the “How did you hear about us?” answer come from?",
      a: "From a custom field on the deal, such as a lead source dropdown. Pipedrive sends custom fields under their field keys, so you pick yours once under Field Mapping; every later deal of the same shape is parsed automatically.",
    },
    {
      q: "Should I send added or updated deals?",
      a: "Added deals capture new pipeline; updated deals keep values current when a deal changes. Each deal is stored once, keyed on its deal ID, so subscribing to both doesn't double count.",
    },
    {
      q: "Can I use Pipedrive Automations instead?",
      a: "Yes. An Automations webhook works as well, and because you define its body, you can include the person's email and lead source and map them once under Field Mapping. With an email, AutoSEO can also link answers from your website survey by hash.",
    },
    {
      q: "Does AutoSEO need access to my Pipedrive account?",
      a: "No. Pipedrive sends events to your webhook URL, and AutoSEO never calls the Pipedrive API. The URL carries a secret token that AutoSEO stores only as a hash; regenerate it anytime and the old one stops working.",
    },
    {
      q: "Is the Pipedrive integration included in the price?",
      a: "Yes. Attribution and every integration are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month with $10 of AI and data usage.",
    },
  ],
  cta: {
    title: "See how much pipeline AI search creates",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
