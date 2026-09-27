import type { IntegrationPage } from "../../types";

export default {
  slug: "n8n",
  name: "n8n",
  nav: "n8n",
  summary: "Send attribution answers and orders from any n8n workflow to AutoSEO.",
  meta: {
    title: "n8n Integration for AI Search Attribution",
    description:
      "Send “How did you hear about us?” answers and orders from any n8n workflow to AutoSEO with an HTTP Request node, and attribute leads and revenue to AI search.",
  },
  hero: {
    subtitle:
      "Add an HTTP Request node to an n8n workflow and post answers, leads and orders to AutoSEO — from any trigger n8n supports, whether n8n runs in the cloud or on your own server.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the n8n integration",
    items: [
      "An n8n HTTP Request node: method POST, body sent as JSON",
      "Works from n8n Cloud and self-hosted n8n — n8n calls AutoSEO, not the other way around",
      "AutoSEO's schema: channelId for answers, transactionId and dealValue for orders",
      "The token in the URL, or in an X-Attribution-Token or Authorization: Bearer header",
      "Any other body shape mapped once under Field Mapping",
      "Every execution listed under Webhook Logs",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with n8n and AutoSEO",
    items: [
      {
        icon: "workflow",
        title: "Any trigger, one destination",
        body: "Forms, CRMs, databases or spreadsheets that n8n can read become attribution sources for AutoSEO.",
      },
      {
        icon: "server",
        title: "Keep the data flow on your servers",
        body: "Run n8n yourself and decide in the workflow which fields are sent to AutoSEO.",
      },
      {
        icon: "euro",
        title: "Orders from any shop system",
        body: "Send order ID, value and currency from any system, and AutoSEO links the order to the buyer's answer.",
      },
      {
        icon: "bell",
        title: "React to new answers",
        body: "Point AutoSEO's attribution.response_created event at an n8n Webhook node and route new answers wherever you need them.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect n8n in four steps,",
    muted: "with one HTTP Request node.",
    items: [
      {
        title: "Generate your webhook URL",
        body: "In your project, open Attribution → Integrations → n8n and click Connect. Copy the webhook URL — it's shown only once.",
      },
      {
        title: "Add an HTTP Request node",
        body: "Method POST, your webhook URL, Send Body switched on and body content type JSON.",
      },
      {
        title: "Build the body",
        body: "Send channelId (the answer) plus optional respondentEmail, respondentExternalId, dealValue, dealCurrency, formId and pageUrl.",
      },
      {
        title: "Execute the workflow",
        body: "Run it once and check the delivery under Webhook Logs.",
      },
    ],
  },
  faq: [
    {
      q: "How do I connect n8n to AutoSEO?",
      a: "Add an HTTP Request node to your workflow, set the method to POST and the URL to your AutoSEO webhook URL, and send a JSON body with at least channelId. AutoSEO attributes each answer to a channel and links orders by order ID or hashed email.",
    },
    {
      q: "Does it work with self-hosted n8n?",
      a: "Yes. n8n only needs to reach your AutoSEO webhook URL over HTTPS; AutoSEO never has to call your n8n server to receive attribution data.",
    },
    {
      q: "Can I keep the token out of the URL?",
      a: "Yes. Send it as an X-Attribution-Token header or as Authorization: Bearer — for example from an n8n header credential — and leave the token parameter off the URL.",
    },
    {
      q: "Can AutoSEO send new answers to n8n?",
      a: "Yes. Under Integrations → Webhooks, add your n8n Webhook node's URL and subscribe to attribution.response_created. Deliveries are signed and retried; an n8n host on a private network must be allowed by an admin of your self-hosted AutoSEO.",
    },
    {
      q: "Are there limits?",
      a: "Each project accepts up to 120 requests per minute and 256 KB per payload. For large backfills, the REST API's bulk endpoint takes up to 1,000 answers per request.",
    },
    {
      q: "Is the n8n integration included in the price?",
      a: "Yes. Attribution and every integration are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month with $10 of AI and data usage.",
    },
  ],
  cta: {
    title: "Automate your attribution data",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
