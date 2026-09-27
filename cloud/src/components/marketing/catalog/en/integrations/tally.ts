import type { IntegrationPage } from "../../types";

export default {
  slug: "tally",
  name: "Tally",
  nav: "Tally",
  summary: "Send Tally submissions to AutoSEO and attribute sign-ups and leads to AI search.",
  meta: {
    title: "Tally Form Attribution for AI Search",
    description:
      "Connect Tally to AutoSEO with a webhook. Choice answers are resolved to their labels, and sign-ups that name ChatGPT or Perplexity count as AI search.",
  },
  hero: {
    subtitle:
      "Paste one webhook URL into your Tally form. AutoSEO turns Tally's option IDs back into the labels people picked, finds the “How did you hear about us?” answer and attributes every sign-up to AI search and your other channels.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Tally integration",
    items: [
      "Connects through Tally's built-in webhooks — no API key needed",
      "Choice and checkbox answers resolved from option IDs to their labels",
      "Email fields detected by type and stored only as a SHA-256 hash",
      "Response ID, form name and submit time mapped automatically",
      "One mapping per form, recognized by its form ID",
      "Webhook Logs show every delivery and why a payload was skipped",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Tally and AutoSEO",
    items: [
      {
        icon: "rocket",
        title: "Attribute product sign-ups",
        body: "Put a “How did you hear about us?” question into your Tally sign-up or waitlist form and see how many new users AI assistants send.",
      },
      {
        icon: "sparkles",
        title: "Break AI search down by assistant",
        body: "Answers naming ChatGPT, Claude, Perplexity, Gemini, Copilot and others are counted per assistant, not lumped together.",
      },
      {
        icon: "euro",
        title: "Add revenue later",
        body: "When a sign-up becomes a paying Stripe customer with the same email, AutoSEO merges the payment into the original answer.",
      },
      {
        icon: "check-circle",
        title: "Never lose early submissions",
        body: "A new form's first submission shows up under Field Mapping. Submissions that arrive before you confirm it are processed afterwards.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Tally in four steps,",
    muted: "with a form webhook.",
    items: [
      {
        title: "Generate your webhook URL",
        body: "In your project, open Attribution → Integrations → Tally and click Connect. Copy the URL — it's shown only once.",
      },
      {
        title: "Connect it in Tally",
        body: "In Tally, open your form → Integrations → Webhooks → Connect and paste the URL.",
      },
      {
        title: "Submit the form once",
        body: "Fill out the form yourself. The submission appears under Webhook Logs within seconds.",
      },
      {
        title: "Confirm the suggested fields",
        body: "Open Field Mapping, check the suggested answer and email fields and save. Future submissions are read automatically.",
      },
    ],
  },
  faq: [
    {
      q: "How do I see which Tally sign-ups come from AI search?",
      a: "Ask “How did you hear about us?” in your Tally form and add AutoSEO's webhook URL under Integrations → Webhooks. AutoSEO reads each submission, classifies the answer and counts AI search per assistant.",
    },
    {
      q: "Tally sends option IDs instead of labels — does that matter?",
      a: "No. For fields with options, Tally's webhook includes the option list, and AutoSEO replaces the selected IDs with their labels before it classifies the answer. Several selected options are kept together, separated by commas.",
    },
    {
      q: "Can I connect several Tally forms?",
      a: "Yes. Use the same webhook URL in every form. AutoSEO recognizes each form by its ID and keeps one mapping per form, so different question layouts don't get mixed up.",
    },
    {
      q: "What happens to submissions that arrive before the mapping is saved?",
      a: "AutoSEO keeps them encrypted and processes them as soon as you confirm the mapping — up to 200 pending submissions, for seven days.",
    },
    {
      q: "Is the Tally integration free?",
      a: "Yes. Attribution and all its integrations are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month. Classifying answers uses built-in rules, not AI credits.",
    },
  ],
  cta: {
    title: "Find out how many sign-ups AI search sends",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
