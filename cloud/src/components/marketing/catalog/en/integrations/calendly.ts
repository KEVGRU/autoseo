import type { IntegrationPage } from "../../types";

export default {
  slug: "calendly",
  name: "Calendly",
  nav: "Calendly",
  summary: "Capture “How did you hear about us?” answers from Calendly bookings in AutoSEO.",
  meta: {
    title: "Calendly Attribution for AI Search Bookings",
    description:
      "Attribute Calendly bookings to ChatGPT, Perplexity and other AI search: add a booking question, and AutoSEO reads the answer from each invitee.created webhook.",
  },
  hero: {
    subtitle:
      "Add a “How did you hear about us?” question to your Calendly event type and subscribe AutoSEO to new bookings. The answer is found automatically in each booking and attributed to AI search or your other channels.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Calendly integration",
    items: [
      "A booking question “How did you hear about us?” on your event type",
      "A Calendly webhook subscription for invitee.created",
      "The answer found in questions_and_answers and suggested under Field Mapping",
      "Invitee email, name, booking URI and booking time taken from each event",
      "Bookings linked to later payments or deals by hashed email",
      "Every booking listed under Webhook Logs",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Calendly and AutoSEO",
    items: [
      {
        icon: "calendar",
        title: "Demos booked from AI search",
        body: "See how many sales calls and demos were booked by people who found you through ChatGPT, Perplexity or Claude.",
      },
      {
        icon: "euro",
        title: "Follow bookings to revenue",
        body: "Connect Stripe or your CRM too, and AutoSEO links the payment or deal to the booking answer by email hash.",
      },
      {
        icon: "message-square",
        title: "Free-text answers welcome",
        body: "An answer like “ChatGPT recommended you” is recognized as AI search and credited to the right assistant.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Calendly in four steps,",
    muted: "with a booking question.",
    items: [
      {
        title: "Add the booking question",
        body: "In Calendly, add the question “How did you hear about us?” to your event type — as free text or with options.",
      },
      {
        title: "Generate your webhook URL",
        body: "In your project, open Attribution → Integrations → Calendly and click Connect. Copy the webhook URL — it's shown only once.",
      },
      {
        title: "Create a webhook subscription",
        body: "Calendly creates webhooks through its API: create a subscription for the invitee.created event with your webhook URL.",
      },
      {
        title: "Book a test meeting",
        body: "The booking appears under Webhook Logs, and Field Mapping suggests the answer from questions_and_answers. Confirm it once.",
      },
    ],
  },
  faq: [
    {
      q: "How do I know which Calendly bookings came from ChatGPT?",
      a: "Ask “How did you hear about us?” in your Calendly booking form and send new bookings to AutoSEO with an invitee.created webhook. Answers that mention ChatGPT or another assistant are counted as AI search, per assistant.",
    },
    {
      q: "How do I create the Calendly webhook?",
      a: "Calendly manages webhook subscriptions through its API: send a POST request to /webhook_subscriptions with your AutoSEO webhook URL and the invitee.created event. Webhook subscriptions are an API feature, so check that your Calendly plan includes them.",
    },
    {
      q: "Does the question need a specific wording?",
      a: "No. AutoSEO recognizes common wordings in English and German, such as “How did you hear about us?” or “Wie sind Sie auf uns aufmerksam geworden?”. You can always pick the question manually under Field Mapping.",
    },
    {
      q: "Does Calendly send revenue?",
      a: "No, only the booking and its answers. Revenue comes from Stripe, your shop or your CRM; AutoSEO links those conversions to the booking answer by hashed email.",
    },
    {
      q: "How is the Calendly webhook secured?",
      a: "The webhook URL carries a secret token that AutoSEO stores only as a hash, and invitee emails are stored as a hash with a masked preview. You can regenerate the URL at any time.",
    },
    {
      q: "Is the Calendly integration included in the price?",
      a: "Yes. Attribution and every integration are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month with $10 of AI and data usage.",
    },
  ],
  cta: {
    title: "See which meetings AI search books",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
