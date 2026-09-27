import type { IntegrationPage } from "../../types";

export default {
  slug: "hubspot",
  name: "HubSpot",
  nav: "HubSpot",
  summary: "Send HubSpot contacts and deals to AutoSEO to attribute pipeline to AI search.",
  meta: {
    title: "HubSpot AI Search Attribution for Deals",
    description:
      "Attribute HubSpot contacts and deals to ChatGPT, Perplexity and other AI search with a workflow webhook — lead source and deal value, mapped in AutoSEO.",
  },
  hero: {
    subtitle:
      "Add a “Send a webhook” action to a HubSpot workflow, and AutoSEO attributes your contacts and deals — with lead source and deal value — to AI search and your other channels.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the HubSpot integration",
    items: [
      "Connects through a HubSpot workflow webhook — no app to install, no account access",
      "Contact- or deal-based workflows, including deal amount and currency",
      "“How did you hear about us?” answers sorted into AI search, search, social, ads, referral and content",
      "Answers like “ChatGPT” or “found you on Perplexity” recognized as AI search, per assistant",
      "Field Mapping for custom properties — map once, and future payloads parse automatically",
      "Webhook Logs to verify every delivery",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with HubSpot and AutoSEO",
    items: [
      {
        icon: "euro",
        title: "Measure pipeline from AI search",
        body: "See the deal value your HubSpot records attribute to AI search, next to every other channel.",
      },
      {
        icon: "sparkles",
        title: "See which assistant sent the lead",
        body: "Leads that name ChatGPT, Perplexity, Claude, Gemini or Copilot are counted per assistant.",
      },
      {
        icon: "users",
        title: "Combine website answers with deals",
        body: "Ask “How did you hear about us?” on your website and send deals without the answer — AutoSEO matches them by email hash.",
      },
      {
        icon: "presentation",
        title: "Back your GEO budget with numbers",
        body: "Show stakeholders how much pipeline buyers attribute to AI search, next to your AI visibility metrics.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect HubSpot in four steps,",
    muted: "with a workflow webhook.",
    items: [
      {
        title: "Generate your webhook URL",
        body: "In your project, open Attribution → Integrations → HubSpot and click Connect. Copy the webhook URL — it's shown only once.",
      },
      {
        title: "Create a HubSpot workflow",
        body: "Create a contact- or deal-based workflow and add the action “Send a webhook” with method POST and your webhook URL.",
      },
      {
        title: "Customize the request body",
        body: "Send your “How did you hear about us?” property as channelId, plus email, record ID, amount and currency.",
      },
      {
        title: "Test the action",
        body: "Click Test action in HubSpot and check the request under Webhook Logs. Without a customized body, map the HubSpot properties once under Field Mapping.",
      },
    ],
  },
  faq: [
    {
      q: "How do I attribute HubSpot deals to ChatGPT?",
      a: "Send your deals from a HubSpot workflow to AutoSEO with a “Send a webhook” action, including the “How did you hear about us?” property and the deal amount. AutoSEO recognizes answers that mention ChatGPT or other assistants as AI search and adds up the deal value per channel.",
    },
    {
      q: "Do I need to install a HubSpot app?",
      a: "No. AutoSEO doesn't need access to your HubSpot account. HubSpot sends the data to your project's webhook URL from a workflow you control, so you decide which properties leave HubSpot.",
    },
    {
      q: "Which HubSpot plan do I need?",
      a: "One whose workflows include the “Send a webhook” action. If yours doesn't, send the same data through Zapier, Make or n8n — AutoSEO accepts those as well.",
    },
    {
      q: "What if our lead source property uses custom values?",
      a: "AutoSEO normalizes answers automatically: values like “ChatGPT”, “AI search” or “Perplexity” count as AI search, “Google” as search and “LinkedIn” as social. For other payload shapes, map the fields once under Field Mapping.",
    },
    {
      q: "How is the HubSpot webhook secured?",
      a: "Each webhook URL carries a secret token that AutoSEO stores only as a hash. You can regenerate the URL at any time, and the old one stops working immediately. Email addresses are stored as a hash with a masked preview.",
    },
  ],
  cta: {
    title: "Tie your pipeline to AI search",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
