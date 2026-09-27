import type { IntegrationPage } from "../../types";

export default {
  slug: "close",
  name: "Close",
  nav: "Close",
  summary: "Attribute Close leads and opportunities to AI search with a webhook subscription.",
  meta: {
    title: "Close CRM Attribution for AI Search Leads",
    description:
      "Attribute Close CRM leads and opportunities to ChatGPT, Perplexity and other AI search: a webhook subscription sends lead and opportunity events to AutoSEO.",
  },
  hero: {
    subtitle:
      "Subscribe AutoSEO to lead.created and opportunity.updated events in Close, map your lead source custom field once, and see how many leads and how much opportunity value AI search brings in.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Close integration",
    items: [
      "A Close webhook subscription for lead.created and opportunity.updated",
      "Record ID, opportunity value and currency pre-filled in Field Mapping",
      "Your “How did you hear about us?” custom field mapped once under Field Mapping",
      "Repeated events for the same lead or opportunity update one record",
      "Lead sources like “ChatGPT” or “AI search” counted as AI search, per assistant",
      "Every event listed under Webhook Logs",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Close and AutoSEO",
    items: [
      {
        icon: "users",
        title: "Count leads from AI search",
        body: "New leads arrive as they're created in Close, sorted into AI search, search, social, ads, referral and content.",
      },
      {
        icon: "euro",
        title: "Opportunity value by channel",
        body: "Opportunity updates carry value and currency, so you see pipeline per channel as deals progress.",
      },
      {
        icon: "sparkles",
        title: "See which assistant sent the lead",
        body: "Lead sources that name ChatGPT, Perplexity, Claude, Gemini or Copilot are counted per assistant.",
      },
      {
        icon: "refresh",
        title: "Nothing lost while you set up",
        body: "Events that arrive before the mapping is done are kept encrypted for seven days and processed as soon as you save it.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Close in four steps,",
    muted: "with a webhook subscription.",
    items: [
      {
        title: "Generate your webhook URL",
        body: "In your project, open Attribution → Integrations → Close and click Connect. Copy the webhook URL — it's shown only once.",
      },
      {
        title: "Create a webhook subscription",
        body: "In Close, open Settings → Developer → Webhooks and subscribe to lead.created and opportunity.updated with your webhook URL.",
      },
      {
        title: "Trigger a test event",
        body: "Create a lead or update an opportunity; the event appears under Webhook Logs.",
      },
      {
        title: "Map your custom fields",
        body: "Open Field Mapping, pick your lead source custom field from event.data as the answer and save.",
      },
    ],
  },
  faq: [
    {
      q: "How do I attribute Close leads to ChatGPT?",
      a: "Subscribe your AutoSEO webhook URL to lead and opportunity events in Close and map your lead source custom field once. Leads whose source says ChatGPT, Perplexity or “AI search” are then counted as AI search, per assistant.",
    },
    {
      q: "Which Close events does AutoSEO use?",
      a: "lead.created for new leads and opportunity.updated for opportunities. The record ID, opportunity value and value currency are pre-filled in Field Mapping; you add the lead source custom field once.",
    },
    {
      q: "Do I need to give AutoSEO a Close API key?",
      a: "No. Close sends events to your webhook URL, and AutoSEO never calls the Close API or reads your account.",
    },
    {
      q: "What if events arrive before the mapping is done?",
      a: "They're stored encrypted for up to seven days and processed as soon as you save the mapping. After that, every event of the same shape is parsed automatically.",
    },
    {
      q: "How is the Close webhook secured?",
      a: "The webhook URL carries a secret token that AutoSEO stores only as a hash. You can regenerate the URL at any time, and the old one stops working immediately.",
    },
    {
      q: "Is the Close integration included in the price?",
      a: "Yes. Attribution and every integration are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month with $10 of AI and data usage.",
    },
  ],
  cta: {
    title: "Know which Close leads AI search sends",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
