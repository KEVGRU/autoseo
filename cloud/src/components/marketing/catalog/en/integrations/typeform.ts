import type { IntegrationPage } from "../../types";

export default {
  slug: "typeform",
  name: "Typeform",
  nav: "Typeform",
  summary: "Send Typeform submissions to AutoSEO and see which leads found you through AI search.",
  meta: {
    title: "Typeform Attribution for AI Search Leads",
    description:
      "Connect Typeform to AutoSEO with a webhook: the “How did you hear about us?” answer is detected by its title, and leads from ChatGPT & Co. count per assistant.",
  },
  hero: {
    subtitle:
      "Add one webhook to your Typeform. AutoSEO finds the “How did you hear about us?” question by its title, reads the choice or text answer and counts leads from ChatGPT, Perplexity and other assistants — form by form.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Typeform integration",
    items: [
      "A Typeform webhook on your form — no app to install, no account access",
      "The “How did you hear about us?” question found by its title, in English or German",
      "Single choice, multi-select and text answers read as they are",
      "Email question, response token, form title and submit time mapped automatically",
      "Hidden fields page_url and deal_value for extra context",
      "Repeated deliveries of the same response update it instead of creating a duplicate",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Typeform and AutoSEO",
    items: [
      {
        icon: "sparkles",
        title: "Count demo requests from AI search",
        body: "See how many Typeform leads name ChatGPT, Perplexity, Claude or another assistant, next to search, social and referrals.",
      },
      {
        icon: "users",
        title: "Tie form leads to later purchases",
        body: "When the same email later arrives as a Stripe, Shopify or WooCommerce conversion, AutoSEO merges both, so the lead carries its revenue.",
      },
      {
        icon: "layers",
        title: "Compare your forms",
        body: "Every answer keeps its Typeform form title, so you can filter the attribution overview by form — newsletter, demo or quote.",
      },
      {
        icon: "trending-up",
        title: "Relate leads to AI visibility",
        body: "AutoSEO correlates your daily AI visibility from the tracker with the AI-search answers your forms receive.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Typeform in four steps,",
    muted: "with a form webhook.",
    items: [
      {
        title: "Generate your webhook URL",
        body: "In your project, open Attribution → Integrations → Typeform and click Connect. Copy the URL — it's shown only once.",
      },
      {
        title: "Add it to your form",
        body: "In Typeform, open the form → Connect → Webhooks → Add a webhook, paste the URL and turn the webhook on.",
      },
      {
        title: "Send a test",
        body: "Click View deliveries → Send test request, or submit the form once yourself.",
      },
      {
        title: "Confirm the mapping",
        body: "Under Field Mapping, AutoSEO suggests the answer, email and form fields. Confirm and save — future submissions are parsed automatically.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track which Typeform leads come from ChatGPT?",
      a: "Add a “How did you hear about us?” question to your form and connect the form to AutoSEO with a Typeform webhook. AutoSEO finds the question by its title, and answers such as “ChatGPT” or “found you via Perplexity” count as AI search, per assistant.",
    },
    {
      q: "Does it work with multiple-choice and open-text questions?",
      a: "Yes. AutoSEO reads single choice, multi-select and text answers. Free-text answers are classified with built-in rules — “Google Ads” counts as ads, “a friend told me” as referral and “asked ChatGPT” as AI search.",
    },
    {
      q: "What if my question uses different wording?",
      a: "AutoSEO recognizes common English and German phrasings such as “How did you find us?”, “Where did you hear about us?” or “Wie sind Sie auf uns aufmerksam geworden?”. For any other wording, pick the field once under Field Mapping.",
    },
    {
      q: "Can I pass the page URL or a deal value?",
      a: "Yes. Add hidden fields named page_url and deal_value to your Typeform. AutoSEO stores the page URL without its query string and uses the value as the lead's deal value.",
    },
    {
      q: "Which data does AutoSEO keep from a Typeform response?",
      a: "The answer, the response token, form title and submit time — and, if your form asks for it, the email as a SHA-256 hash with a masked preview. Email addresses typed into free-text answers are masked as well.",
    },
    {
      q: "Is the Typeform integration free?",
      a: "Yes. Attribution and all its integrations are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month. Answers are classified with built-in rules, not with AI credits.",
    },
  ],
  cta: {
    title: "See which leads AI search sends you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
