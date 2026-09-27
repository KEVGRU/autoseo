import type { IntegrationPage } from "../../types";

export default {
  slug: "zapier",
  name: "Zapier / Make",
  nav: "Zapier / Make",
  summary: "Send attribution answers, leads and orders from any app to AutoSEO with Zapier or Make.",
  meta: {
    title: "Zapier & Make Integration for AI Attribution",
    description:
      "Send “How did you hear about us?” answers, leads and orders from any app to AutoSEO with Zapier or Make, and attribute them to AI search with one JSON webhook.",
  },
  hero: {
    subtitle:
      "Use a “Webhooks by Zapier” POST or a Make HTTP request to send answers, leads and orders from forms, CRMs and shops without a native AutoSEO integration — attributed to AI search and your other channels.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with Zapier and Make",
    items: [
      "Zapier: the action “Webhooks by Zapier → POST” with payload type JSON",
      "Make: the module “HTTP → Make a request” with method POST and a JSON body",
      "AutoSEO's schema — an answer needs only channelId",
      "Orders without an answer stored as conversions from transactionId and dealValue",
      "Any other body shape mapped once under Field Mapping",
      "Every run listed under Webhook Logs",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Zapier, Make and AutoSEO",
    items: [
      {
        icon: "plug",
        title: "Connect tools without a native integration",
        body: "Any form, CRM or shop that Zapier or Make can read can send its “How did you hear about us?” answers to AutoSEO.",
      },
      {
        icon: "euro",
        title: "Send orders and deals",
        body: "Pass order ID, value and currency, and AutoSEO matches the order to the buyer's answer by order ID or hashed email.",
      },
      {
        icon: "workflow",
        title: "Clean data before it leaves",
        body: "Filter, format or enrich fields in your Zap or scenario first, so only what you choose reaches AutoSEO.",
      },
      {
        icon: "lock",
        title: "Send a hash instead of an email",
        body: "Pass respondentEmailHash (a SHA-256 hash) instead of the address, and AutoSEO still matches answers and orders.",
      },
      {
        icon: "bell",
        title: "Get new answers back out",
        body: "Subscribe a Zapier or Make webhook to AutoSEO's attribution.response_created event and route new answers to Slack, a sheet or your CRM.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Zapier or Make in four steps,",
    muted: "no custom code.",
    items: [
      {
        title: "Generate your webhook URL",
        body: "In your project, open Attribution → Integrations → Zapier / Make and click Connect. Copy the webhook URL — it's shown only once.",
      },
      {
        title: "Add the webhook step",
        body: "In Zapier, add “Webhooks by Zapier → POST” with payload type JSON. In Make, add “HTTP → Make a request” with method POST and body type JSON. Use your webhook URL.",
      },
      {
        title: "Fill in the schema",
        body: "Send channelId (the answer) plus optional respondentEmail, respondentExternalId, dealValue, dealCurrency, formId and pageUrl.",
      },
      {
        title: "Run a test",
        body: "Test the step — the event shows up under Webhook Logs within seconds.",
      },
    ],
  },
  faq: [
    {
      q: "How do I send data from Zapier to AutoSEO?",
      a: "Add the action “Webhooks by Zapier → POST” to your Zap, paste your AutoSEO webhook URL, choose payload type JSON and send at least channelId, the answer to “How did you hear about us?”. AutoSEO attributes the answer to a channel and, with an email or order ID, links it to revenue.",
    },
    {
      q: "Does it work with Make?",
      a: "Yes. In Make, add the module “HTTP → Make a request” with method POST, body type JSON and your webhook URL. The body uses the same schema as with Zapier.",
    },
    {
      q: "Which fields can I send?",
      a: "channelId (required for answers), channelDetail for the assistant such as chatgpt, freetextResponse, respondentEmail or respondentEmailHash, respondentExternalId, respondentName, dealValue, dealCurrency, transactionId, formId, formName, pageUrl and occurredAt.",
    },
    {
      q: "How do I send an order without an answer?",
      a: "Send transactionId with dealValue and dealCurrency, plus the email if you have it. AutoSEO stores it as a conversion and links it to the buyer's answer by order ID or hashed email, looking back up to 90 days.",
    },
    {
      q: "Are there limits?",
      a: "Each project accepts up to 120 requests per minute and 256 KB per payload. For large backfills, the REST API's bulk endpoint takes up to 1,000 answers per request.",
    },
    {
      q: "Is the Zapier and Make integration included in the price?",
      a: "Yes on the AutoSEO side: attribution and every integration are part of the open-source app, free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month. Zapier and Make bill their own plans.",
    },
  ],
  cta: {
    title: "Attribute every tool in your stack",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
