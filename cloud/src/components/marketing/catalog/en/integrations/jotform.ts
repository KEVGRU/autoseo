import type { IntegrationPage } from "../../types";

export default {
  slug: "jotform",
  name: "Jotform",
  nav: "Jotform",
  summary: "Send Jotform submissions to AutoSEO and attribute inquiries and leads to AI search.",
  meta: {
    title: "Jotform Attribution for AI Search Leads",
    description:
      "Connect Jotform to AutoSEO with a WebHook. Multipart submissions are parsed automatically, and leads that name ChatGPT or Perplexity count as AI search.",
  },
  hero: {
    subtitle:
      "Add AutoSEO's URL under Settings → Integrations → WebHooks. AutoSEO unpacks Jotform's multipart submissions, lets you pick the “How did you hear about us?” field once and attributes every lead to AI search and your other channels.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Jotform integration",
    items: [
      "Works with Jotform's WebHooks integration — no API key needed",
      "Multipart submissions parsed automatically, including the raw request and the readable summary",
      "Pick the “How did you hear about us?” field once under Field Mapping",
      "Submission ID, form ID and form title stored with every answer",
      "Repeated deliveries of the same submission update the existing answer",
      "Emails stored only as a SHA-256 hash with a masked preview",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Jotform and AutoSEO",
    items: [
      {
        icon: "file-text",
        title: "Attribute quote and contact requests",
        body: "See which inquiries come from people who found you through ChatGPT, Perplexity or another assistant.",
      },
      {
        icon: "layers",
        title: "Filter answers by form",
        body: "Answers keep the Jotform form title, so you can filter the attribution overview by form.",
      },
      {
        icon: "euro",
        title: "Connect inquiries with revenue",
        body: "Send won deals from your CRM or payments from Stripe as well — AutoSEO matches them to the Jotform answer by email hash.",
      },
      {
        icon: "chart",
        title: "See AI search next to every channel",
        body: "Answers are sorted into AI search, search, social, ads, referral, content and other — English and German answers alike.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Jotform in four steps,",
    muted: "with a WebHook.",
    items: [
      {
        title: "Generate your webhook URL",
        body: "In your project, open Attribution → Integrations → Jotform and click Connect. Copy the URL — it's shown only once.",
      },
      {
        title: "Add a WebHook in Jotform",
        body: "Open your form → Settings → Integrations → WebHooks and paste the URL.",
      },
      {
        title: "Submit a test entry",
        body: "Fill out the form once. AutoSEO receives the submission and creates a mapping for this form shape.",
      },
      {
        title: "Pick the answer field",
        body: "Under Field Mapping, choose your “How did you hear about us?” field and save. Later submissions are read automatically, and waiting ones are processed too.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track Jotform leads from ChatGPT?",
      a: "Add a “How did you hear about us?” field to your form and send submissions to AutoSEO through Jotform's WebHooks integration. Once the field is mapped, answers that mention ChatGPT or another assistant count as AI search, per assistant.",
    },
    {
      q: "Jotform sends multipart form data — is that a problem?",
      a: "No. AutoSEO accepts multipart and form-encoded requests, parses Jotform's raw request JSON and splits the readable summary into question–answer pairs, so every field shows up in Field Mapping.",
    },
    {
      q: "Why do I pick the answer field myself?",
      a: "Jotform's field keys depend on how you built the form. AutoSEO suggests the field when its label reads like “How did you hear about us?”, and you confirm it once — after that, every submission parses automatically.",
    },
    {
      q: "Does AutoSEO need access to my Jotform account?",
      a: "No. Jotform sends each submission to your project's webhook URL. The URL contains a secret token that AutoSEO stores only as a hash, and you can regenerate it at any time.",
    },
    {
      q: "Is the Jotform integration free?",
      a: "Yes. Attribution and all its integrations are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month. Classifying answers uses built-in rules, not AI credits.",
    },
  ],
  cta: {
    title: "See which inquiries AI search sends you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
