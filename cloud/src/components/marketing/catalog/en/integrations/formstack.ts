import type { IntegrationPage } from "../../types";

export default {
  slug: "formstack",
  name: "Formstack",
  nav: "Formstack",
  summary: "Send Formstack submissions to AutoSEO and attribute leads and registrations to AI search.",
  meta: {
    title: "Formstack Attribution for AI Search",
    description:
      "Connect Formstack to AutoSEO with a JSON webhook, map the “How did you hear about us?” field once and see which submissions come from ChatGPT and AI search.",
  },
  hero: {
    subtitle:
      "Add a webhook under Settings → Emails & Actions, post as JSON with sub-field names and map your “How did you hear about us?” field once. From then on, AutoSEO attributes every Formstack submission to AI search and your other channels.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Formstack integration",
    items: [
      "Uses Formstack's form webhooks — no API token to hand over",
      "JSON posts with sub-field names for clean, readable payloads",
      "Submission ID and form ID recognized automatically",
      "Answer and email fields mapped once under Field Mapping",
      "Repeated deliveries de-duplicated by the submission's unique ID",
      "Webhook Logs show every delivery and its status",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Formstack and AutoSEO",
    items: [
      {
        icon: "file-text",
        title: "Attribute registrations and applications",
        body: "Ask “How did you hear about us?” in your Formstack forms and see how many submissions AI assistants bring in.",
      },
      {
        icon: "sparkles",
        title: "Separate AI search from classic search",
        body: "“ChatGPT” counts as AI search, “Google” as search and “Google Gemini” as AI search again — per assistant.",
      },
      {
        icon: "lock",
        title: "Keep personal data minimal",
        body: "Only the fields you map become part of an answer. Emails are stored as a hash and masked when typed into free text.",
      },
      {
        icon: "chart",
        title: "Report on every channel",
        body: "Formstack answers feed the same attribution overview as your other sources — filter by source or compare channels over any period.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Formstack in four steps,",
    muted: "with a form webhook.",
    items: [
      {
        title: "Generate your webhook URL",
        body: "In your project, open Attribution → Integrations → Formstack and click Connect. Copy the URL — it's shown only once.",
      },
      {
        title: "Add a webhook in Formstack",
        body: "Open your form → Settings → Emails & Actions → Add Webhook and paste the URL.",
      },
      {
        title: "Post as JSON",
        body: "Turn on “Post with sub-field names” and “Post as JSON”, then save the webhook.",
      },
      {
        title: "Submit once and map",
        body: "Submit the form, open Field Mapping, confirm the answer and email fields and save. Later submissions are read automatically.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track Formstack submissions from ChatGPT?",
      a: "Add a “How did you hear about us?” field to your form, send submissions to AutoSEO with a Formstack webhook and map the field once. Answers that mention ChatGPT or another assistant then count as AI search, per assistant.",
    },
    {
      q: "Why enable “Post as JSON” and “Post with sub-field names”?",
      a: "JSON with sub-field names gives every field a readable key, which makes the one-time mapping straightforward. AutoSEO also accepts form-encoded posts, but the setup guide uses JSON.",
    },
    {
      q: "Does AutoSEO detect the question automatically?",
      a: "Partly. AutoSEO recognizes Formstack's submission and form IDs and suggests fields whose names look like “How did you hear about us?” or an email address. You confirm the mapping once, and every later submission parses automatically.",
    },
    {
      q: "What does AutoSEO store from a Formstack submission?",
      a: "The mapped answer, the submission's unique ID, the form ID and — if mapped — the email as a SHA-256 hash with a masked preview. The webhook URL's token is stored only as a hash and can be regenerated at any time.",
    },
    {
      q: "Is the Formstack integration free?",
      a: "Yes. Attribution and all its integrations are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month. Classifying answers uses built-in rules, not AI credits.",
    },
  ],
  cta: {
    title: "See which submissions AI search sends you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
