import type { IntegrationPage } from "../../types";

export default {
  slug: "intercom",
  name: "Intercom",
  nav: "Intercom",
  summary: "Send the “How did you hear about us?” answers of your Intercom contacts to AutoSEO.",
  meta: {
    title: "Intercom Attribution for AI Search Leads",
    description:
      "Attribute Intercom leads and users to ChatGPT, Perplexity and other AI search: contact webhooks send your “How did you hear about us?” attribute to AutoSEO.",
  },
  hero: {
    subtitle:
      "Store the answer to “How did you hear about us?” in an Intercom contact attribute — asked by a Series or a bot — and AutoSEO receives it with every new lead and updated user and attributes it to AI search.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Intercom integration",
    items: [
      "Intercom webhooks for contact.lead.created and contact.user.updated",
      "A custom contact attribute holds the answer — filled by a Series, a bot or your team",
      "Email, name and contact ID pre-filled; you pick the attribute once under Field Mapping",
      "One record per contact: a changed answer replaces the old one",
      "Contacts linked to orders and deals from your other sources by hashed email",
      "Every notification listed under Webhook Logs",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Intercom and AutoSEO",
    items: [
      {
        icon: "headset",
        title: "Ask in the conversation",
        body: "Let a bot or Series ask new leads how they found you and store the answer on the contact.",
      },
      {
        icon: "users",
        title: "Count leads from AI search",
        body: "See how many Intercom leads came from ChatGPT, Perplexity or another assistant, next to your other channels.",
      },
      {
        icon: "euro",
        title: "Connect answers to revenue",
        body: "Send payments from Stripe or deals from your CRM too, and AutoSEO links them to the Intercom answer by email hash.",
      },
      {
        icon: "lock",
        title: "No clear-text emails stored",
        body: "Contact emails are hashed on arrival and shown in AutoSEO only as a masked preview.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Intercom in four steps,",
    muted: "with contact webhooks.",
    items: [
      {
        title: "Create the attribute",
        body: "In Intercom, create a custom contact attribute such as “How did you hear about us?” and fill it from a Series, a bot or by hand.",
      },
      {
        title: "Generate your webhook URL",
        body: "In your project, open Attribution → Integrations → Intercom and click Connect. Copy the webhook URL — it's shown only once.",
      },
      {
        title: "Subscribe to contact events",
        body: "In the Intercom Developer Hub, open your app → Webhooks and subscribe to contact.lead.created and contact.user.updated with your URL.",
      },
      {
        title: "Send a test and map the attribute",
        body: "Send a test notification, then pick your attribute from data.item.custom_attributes under Field Mapping and save.",
      },
    ],
  },
  faq: [
    {
      q: "How do I see which Intercom leads came from AI search?",
      a: "Store the answer to “How did you hear about us?” in a custom contact attribute and subscribe AutoSEO to Intercom's contact webhooks. AutoSEO counts answers that mention ChatGPT, Perplexity or other assistants as AI search.",
    },
    {
      q: "Does Intercom send deal values to AutoSEO?",
      a: "No. The Intercom integration captures answers, not revenue. Connect Stripe, your shop or your CRM as well, and AutoSEO links their orders and deals to the Intercom answer by hashed email.",
    },
    {
      q: "Do I need an Intercom app?",
      a: "Yes, a developer app in the Intercom Developer Hub, because Intercom configures webhooks per app. AutoSEO itself gets no API access to your Intercom workspace.",
    },
    {
      q: "What happens when a contact's answer changes?",
      a: "Each contact is stored once, keyed on its Intercom ID. A later contact.user.updated event replaces the answer, so the contact isn't counted twice.",
    },
    {
      q: "How is the Intercom webhook secured?",
      a: "The webhook URL carries a secret token that AutoSEO stores only as a hash. You can regenerate the URL at any time, and the old one stops working immediately.",
    },
    {
      q: "Is the Intercom integration included in the price?",
      a: "Yes. Attribution and every integration are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month with $10 of AI and data usage.",
    },
  ],
  cta: {
    title: "Learn where your conversations start",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
