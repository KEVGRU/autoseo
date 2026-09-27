import type { IntegrationPage } from "../../types";

export default {
  slug: "custom-webhook",
  name: "Custom webhook",
  nav: "Custom webhook",
  summary: "Send answers, leads and orders from any system to AutoSEO as JSON.",
  meta: {
    title: "Custom Attribution Webhook for AI Search",
    description:
      "Send “How did you hear about us?” answers, leads and orders from any system to AutoSEO with a JSON webhook — mapped once, attributed to AI search automatically.",
  },
  hero: {
    subtitle:
      "Post JSON from your own backend, checkout or form handler to your project's webhook URL. Use AutoSEO's schema directly, or send any shape and map it once — later payloads are parsed automatically.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the custom webhook",
    items: [
      "One HTTPS endpoint per project, with the token in the URL or a header",
      "JSON, form-encoded and multipart bodies up to 256 KB",
      "AutoSEO's schema for answers (channelId) and orders (transactionId and dealValue)",
      "Unknown shapes create a Field Mapping workflow on the first delivery",
      "Payloads waiting for a mapping kept encrypted for seven days and processed once mapped",
      "Up to 120 requests per minute per project, each listed under Webhook Logs",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with the custom webhook",
    items: [
      {
        icon: "code",
        title: "Report from your own backend",
        body: "Send the answer from your signup or checkout handler together with the order ID and value.",
      },
      {
        icon: "layers",
        title: "Accept any payload shape",
        body: "Point an existing webhook from another tool at AutoSEO and map its fields once under Field Mapping.",
      },
      {
        icon: "lock",
        title: "Match without sharing emails",
        body: "Hash emails yourself and send respondentEmailHash; AutoSEO matches on the hash and never sees the address.",
      },
      {
        icon: "sparkles",
        title: "Name the assistant",
        body: "Send channelDetail such as chatgpt or perplexity, or free text — AutoSEO normalizes both to the right assistant.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Set up the webhook in four steps,",
    muted: "in any language or tool.",
    items: [
      {
        title: "Generate your webhook URL",
        body: "In your project, open Attribution → Integrations → Custom Webhook and click Connect. Copy the URL — it's shown only once.",
      },
      {
        title: "Choose how to send the token",
        body: "Keep it in the URL, or send it as an X-Attribution-Token header or as Authorization: Bearer.",
      },
      {
        title: "POST your data",
        body: "Send channelId for an answer, or transactionId with dealValue and dealCurrency for an order. Add respondentEmail or respondentEmailHash to link both.",
      },
      {
        title: "Map other shapes once",
        body: "If your payload uses another structure, open the new workflow under Field Mapping, pick the answer, email, value and order fields and save. Waiting payloads are processed right away.",
      },
    ],
  },
  faq: [
    {
      q: "How do I send attribution data to AutoSEO from my own system?",
      a: "POST JSON to your project's webhook URL with at least channelId, the answer to “How did you hear about us?”. AutoSEO normalizes the answer to a channel — AI search, search, social, ads, referral, content or other — and links it to orders by order ID or hashed email.",
    },
    {
      q: "What does the JSON schema look like?",
      a: "An answer needs channelId, for example ai_search or free text like “ChatGPT”. Optional fields are channelDetail, freetextResponse, respondentEmail or respondentEmailHash, respondentExternalId, respondentName, dealValue, dealCurrency, transactionId, formId, formName, pageUrl, occurredAt and up to 8 KB of metadata.",
    },
    {
      q: "Can I send orders without an answer?",
      a: "Yes. A payload with transactionId, or with dealValue and an email, is stored as a conversion. AutoSEO links it to the customer's answer by order ID or hashed email, looking back up to 90 days.",
    },
    {
      q: "What if my payload has a different structure?",
      a: "The first delivery creates a workflow under Field Mapping with suggested fields. Paths can reach into nested objects and arrays, for example answers[field.ref=hdyhau].choice.label, and once you save, future payloads of that shape are parsed automatically.",
    },
    {
      q: "Should I use the webhook or the REST API?",
      a: "Use the webhook for events from other systems; it only needs the URL token. The REST API needs an API key with the write scope and adds a bulk endpoint that records up to 1,000 answers per request.",
    },
    {
      q: "How is the custom webhook secured?",
      a: "The token is stored only as a hash and can be regenerated at any time. Requests without a valid token are rejected and rate-limited per IP, and emails are hashed on arrival.",
    },
    {
      q: "Is the custom webhook included in the price?",
      a: "Yes. Attribution and every integration are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month with $10 of AI and data usage.",
    },
  ],
  cta: {
    title: "Attribute any system to AI search",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
