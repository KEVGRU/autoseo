import type { IntegrationPage } from "../../types";

export default {
  slug: "attio",
  name: "Attio",
  nav: "Attio",
  summary: "Send Attio records and deals with their lead source to AutoSEO from a workflow.",
  meta: {
    title: "Attio AI Search Attribution for Deals",
    description:
      "Attribute Attio records and deals to ChatGPT, Perplexity and other AI search: a workflow “Send HTTP request” block posts lead source and deal value to AutoSEO.",
  },
  hero: {
    subtitle:
      "Add a “Send HTTP request” block to an Attio workflow and post the lead source, email and deal value of each new or updated record to AutoSEO — attributed to AI search and your other channels.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Attio integration",
    items: [
      "An Attio workflow triggered when a record is created or updated",
      "A “Send HTTP request” block that posts JSON to your project's webhook URL",
      "AutoSEO's schema: only channelId is required; email, record ID, value and currency are optional",
      "The record ID as key, so updates change one record instead of adding a new one",
      "Records linked to website survey answers by hashed email",
      "Every delivery listed under Webhook Logs",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Attio and AutoSEO",
    items: [
      {
        icon: "euro",
        title: "Pipeline by channel",
        body: "Send deal values with the lead source and see how much pipeline AI search brings in compared with every other channel.",
      },
      {
        icon: "workflow",
        title: "Send exactly what you choose",
        body: "You pick the trigger and the attributes in the workflow, so only the data you select leaves Attio.",
      },
      {
        icon: "users",
        title: "Connect website answers to CRM records",
        body: "Ask “How did you hear about us?” on your website and send records from Attio with the email — AutoSEO links them by hash.",
      },
      {
        icon: "sparkles",
        title: "Count leads per assistant",
        body: "A lead source like “ChatGPT” or “Perplexity” is recognized as AI search and counted per assistant.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Attio in four steps,",
    muted: "with a workflow block.",
    items: [
      {
        title: "Generate your webhook URL",
        body: "In your project, open Attribution → Integrations → Attio and click Connect. Copy the webhook URL — it's shown only once.",
      },
      {
        title: "Create an Attio workflow",
        body: "Trigger it when a record is created or updated, for example on your deals or people.",
      },
      {
        title: "Add “Send HTTP request”",
        body: "Method POST, your webhook URL and a JSON body with channelId (your lead source), respondentEmail, respondentExternalId, dealValue and dealCurrency.",
      },
      {
        title: "Run it once",
        body: "Run the workflow and check the delivery under Webhook Logs. A body in a different shape can be mapped once under Field Mapping.",
      },
    ],
  },
  faq: [
    {
      q: "How do I send Attio data to AutoSEO?",
      a: "Create an Attio workflow that runs when a record is created or updated and add a “Send HTTP request” block that posts JSON to your AutoSEO webhook URL. AutoSEO reads the lead source, email and deal value and attributes the record to a channel.",
    },
    {
      q: "Which fields do I need to send?",
      a: "Only channelId, the answer to “How did you hear about us?”. Add respondentEmail to link website answers, respondentExternalId (the record ID) so updates don't create duplicates, and dealValue with a three-letter dealCurrency for revenue.",
    },
    {
      q: "What values does channelId accept?",
      a: "ai_search, search, social, ads, referral, content or other — or free text. AutoSEO normalizes answers like “ChatGPT”, “found you on Perplexity” or “LinkedIn” to the right channel and recognizes the assistant.",
    },
    {
      q: "What happens when a record changes again?",
      a: "With respondentExternalId set, AutoSEO updates the existing record instead of creating a new one, and a new deal value replaces the old one.",
    },
    {
      q: "Does AutoSEO need access to my Attio workspace?",
      a: "No. Attio sends the data from a workflow you control, and AutoSEO never calls the Attio API. The webhook URL carries a secret token that AutoSEO stores only as a hash.",
    },
    {
      q: "Is the Attio integration included in the price?",
      a: "Yes. Attribution and every integration are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month with $10 of AI and data usage.",
    },
  ],
  cta: {
    title: "Tie your Attio pipeline to AI search",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
