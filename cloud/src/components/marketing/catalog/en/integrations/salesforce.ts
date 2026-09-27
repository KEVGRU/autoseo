import type { IntegrationPage } from "../../types";

export default {
  slug: "salesforce",
  name: "Salesforce",
  nav: "Salesforce",
  summary: "Send Salesforce leads and opportunities to AutoSEO to attribute them to AI search.",
  meta: {
    title: "Salesforce AI Search Attribution for Leads",
    description:
      "Attribute Salesforce leads and opportunities to ChatGPT, Perplexity and other AI search with a record-triggered Flow that sends lead source and amount.",
  },
  hero: {
    subtitle:
      "Call AutoSEO from a record-triggered Salesforce Flow and see which leads and closed-won opportunities came from AI search — with lead source, amount and currency.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Salesforce integration",
    items: [
      "Connects through a Flow HTTP callout — no managed package, no account access",
      "Leads, or opportunities when they reach Closed Won",
      "Id, Email, LeadSource, Amount and CurrencyIsoCode mapped out of the box",
      "Custom “How did you hear about us?” fields supported through Field Mapping",
      "Values like “ChatGPT” or “AI search” recognized as AI search, per assistant",
      "Webhook Logs to verify every callout",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Salesforce and AutoSEO",
    items: [
      {
        icon: "euro",
        title: "Measure revenue from AI search",
        body: "Closed-won opportunities carry their amount, so you see the revenue buyers attribute to AI search.",
      },
      {
        icon: "target",
        title: "Qualify AI-sourced leads",
        body: "See how many leads name AI search as their source — and which assistant: ChatGPT, Perplexity, Claude, Gemini or Copilot.",
      },
      {
        icon: "users",
        title: "Combine website answers with opportunities",
        body: "Ask “How did you hear about us?” on your website and send opportunities without the answer — AutoSEO matches them by email hash.",
      },
      {
        icon: "lock",
        title: "Keep control of your Salesforce data",
        body: "AutoSEO never logs into Salesforce. Your Flow decides which fields are sent and when.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Salesforce in four steps,",
    muted: "with a Flow HTTP callout.",
    items: [
      {
        title: "Generate your webhook URL",
        body: "In your project, open Attribution → Integrations → Salesforce and click Connect. Copy the webhook URL — it's shown only once.",
      },
      {
        title: "Create a Named Credential",
        body: "In Salesforce Setup → Named Credentials, create an External Credential and a Named Credential that point to your AutoSEO host.",
      },
      {
        title: "Build a record-triggered Flow",
        body: "Trigger it on Lead, or on Opportunity when it's Closed Won, and add a “Create HTTP Callout” action that POSTs the record as JSON to the webhook path with its token.",
      },
      {
        title: "Map and verify",
        body: "Send Id, Email, LeadSource or your custom field, Amount and CurrencyIsoCode. Check the first callout under Webhook Logs and confirm the fields under Field Mapping.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track leads from ChatGPT in Salesforce?",
      a: "Capture how leads found you in Lead Source or a custom “How did you hear about us?” field, then send new leads to AutoSEO from a record-triggered Flow. AutoSEO recognizes answers that mention ChatGPT or other assistants as AI search and reports them per assistant.",
    },
    {
      q: "Do I need to install a Salesforce app or managed package?",
      a: "No. The integration uses standard Salesforce Flow with an HTTP callout. AutoSEO never gets access to your org — it only receives the fields your Flow sends.",
    },
    {
      q: "Which Salesforce fields does AutoSEO use?",
      a: "By default Id, Email, LeadSource, Amount and CurrencyIsoCode. If you store the answer in a custom field, send it too and map it once under Field Mapping.",
    },
    {
      q: "Can I send opportunities instead of leads?",
      a: "Yes. Trigger the Flow on Opportunity when the stage changes to Closed Won and include Amount and CurrencyIsoCode, so the revenue is attributed to the answer's channel.",
    },
    {
      q: "Our Lead Source picklist has no AI option. What should we do?",
      a: "Add a value such as “AI search (ChatGPT, Perplexity …)” or use a free-text field. AutoSEO recognizes assistant names in free text, so answers like “asked ChatGPT” count as AI search.",
    },
    {
      q: "How is the Salesforce webhook secured?",
      a: "Each webhook URL carries a secret token that AutoSEO stores only as a hash. You can regenerate the URL at any time, and the old one stops working immediately. Email addresses are stored as a hash with a masked preview.",
    },
  ],
  cta: {
    title: "Tie your pipeline to AI search",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
