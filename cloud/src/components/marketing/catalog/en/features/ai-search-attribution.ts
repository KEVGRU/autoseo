import type { FeaturePage } from "../../types";

export default {
  slug: "ai-search-attribution",
  nav: "AI search attribution",
  summary: "Tie leads, orders and revenue to AI search with a “How did you hear about us?” survey.",
  meta: {
    title: "AI Search Attribution: Revenue from ChatGPT & Co.",
    description:
      "AI search attribution that asks “How did you hear about us?”, merges the answers with orders and deals, and shows how much revenue ChatGPT & co. really drive.",
  },
  hero: {
    eyebrow: "AI search attribution",
    title: "Prove the revenue AI search brings in.",
    muted: "Answer by answer, deal by deal.",
    subtitle:
      "Most AI influence never shows up as a click. AutoSEO asks buyers “How did you hear about us?” when they sign up or buy, merges each answer with the order or deal behind it, and reports AI search next to every other channel — in revenue.",
  },
  visual: "traffic",
  screenshot: {
    src: "/screenshots/attribution.png",
    alt: "AutoSEO attribution overview comparing AI search with other channels, with deal value, AI traffic revenue and AI search leads by engine",
    url: "attribution",
  },
  stats: [
    { value: 7, label: "Setup steps", note: "Guided, with live verification" },
    { value: 23, label: "Integrations", note: "Shops, forms, CRMs, surveys" },
    { value: 90, suffix: " days", label: "Match window", note: "Between answer and conversion" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "MIT licensed, every feature" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "AI search shapes buying decisions",
    muted: "long before analytics notices.",
    body: "Someone asks ChatGPT for a recommendation, remembers your name and comes back days later through Google or by typing your URL. Click-based analytics credits search or direct. The buyer knows the real answer, so AutoSEO asks them.",
    points: [
      {
        title: "Clicks miss most of the influence",
        body: "Answers often name a brand without a link, or the visit happens later on another device. Self-reported attribution captures what analytics can't.",
      },
      {
        title: "Budgets follow revenue",
        body: "A revenue figure per channel is easier to defend in a budget meeting than a visibility score. Attribution connects the two.",
      },
      {
        title: "Know which assistant matters",
        body: "A follow-up question asks which AI tool people used, so you see whether ChatGPT, Perplexity, Claude or Gemini is behind your deals.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What you get",
    title: "From survey answer to attributed revenue,",
    muted: "without a data team.",
    items: [
      {
        icon: "message-square",
        title: "A survey that fits your site",
        body: "A short popup after form submits or purchases, in English or German and in your colors. If your forms already ask the question, the answer is captured without a popup.",
      },
      {
        icon: "sparkles",
        title: "AI search as its own channel",
        body: "Answers are grouped into AI search, Google/Bing, social, ads, referral, content and other — with a follow-up for ChatGPT, Perplexity, Claude, Gemini, Copilot and more.",
      },
      {
        icon: "euro",
        title: "Orders and deals merged in",
        body: "Conversions from the snippet, Stripe, Shopify, WooCommerce, Shopware or your CRM are matched to answers by order ID, email hash or browser.",
      },
      {
        icon: "plug",
        title: "23 integrations",
        body: "Typeform, Tally, Jotform, HubSpot, Salesforce, Pipedrive, Calendly, Fairing, SurveyMonkey, Zapier, n8n and a custom webhook with field mapping.",
      },
      {
        icon: "chart",
        title: "Revenue by channel",
        body: "Responses per day, deal value attributed to AI search, AI search leads by engine and — with GA4 connected — revenue from AI-referred sessions.",
      },
      {
        icon: "lock",
        title: "Privacy built in",
        body: "Email addresses are stored only as a hash and a masked preview, the survey asks each visitor once without cookies, and you can restrict it to your own domains.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "Attribution in seven guided steps,",
    muted: "verified live.",
    items: [
      {
        title: "Tell the wizard what you track",
        body: "Choose leads, purchases or both, your platform — Shopify, WooCommerce, WordPress, Webflow, Framer, Wix and more — and whether your forms already ask.",
      },
      {
        title: "Install the snippet or connect a tool",
        body: "Paste one script tag with instructions for your platform, or send answers from your form, survey or CRM tool by webhook, API import or CSV.",
      },
      {
        title: "Add your conversion source",
        body: "Stripe, Shopify, WooCommerce, Shopware, a CRM webhook, or the snippet itself, which picks up Google Analytics, Google Ads and Meta Pixel purchase and lead events.",
      },
      {
        title: "Verify and read the results",
        body: "The last step confirms the snippet, the first answer and the first conversion live. From then on, AI search appears as a revenue line next to every other channel.",
      },
    ],
  },
  faq: [
    {
      q: "What is AI search attribution?",
      a: "AI search attribution measures how many leads, orders and how much revenue come from people who discovered you through AI assistants such as ChatGPT or Perplexity. Because much of that influence never produces a trackable click, AutoSEO combines a self-reported “How did you hear about us?” answer with the conversion it belongs to.",
    },
    {
      q: "How do I track leads from ChatGPT?",
      a: "Ask new leads how they heard about you and offer AI search as an answer, with a follow-up for the tool they used. AutoSEO's snippet does this after a form submit or reads the answer from an existing form field, then links it to the lead or deal in your CRM.",
    },
    {
      q: "Why not just use Google Analytics?",
      a: "Analytics only sees visits that come from a click on an AI answer. Buyers who read a recommendation and later search your brand name or type your URL show up as search or direct. Use both: AI traffic analytics for the clicks, attribution for the rest.",
    },
    {
      q: "How are survey answers matched with orders?",
      a: "AutoSEO matches by order or transaction ID first, then by a hash of the email address, then by the same browser. A new conversion looks back 90 days for an unmatched answer and accepts post-purchase answers given up to 48 hours later. Renewals are never merged, so deals aren't counted twice.",
    },
    {
      q: "Which tools can I connect?",
      a: "Shops and payments: Shopify, WooCommerce, Shopware, Stripe. Forms: Typeform, Tally, Jotform, Gravity Forms, Formstack. CRMs and more: HubSpot, Salesforce, Pipedrive, Attio, Close, Calendly, Intercom. Survey tools such as Fairing, KnoCommerce, Zigpoll and SurveyMonkey are imported by API, and Zapier, Make, n8n or a custom webhook cover everything else.",
    },
    {
      q: "Does the attribution snippet use cookies?",
      a: "No. The snippet remembers in the browser's local storage that a visitor has already answered, and email addresses are hashed with SHA-256 — in the browser where possible — before they reach AutoSEO. Only the hash and a masked preview are stored.",
    },
    {
      q: "Is AI search attribution free?",
      a: "Attribution is part of the open-source AutoSEO app and free to self-host with every feature. AutoSEO Cloud gives you a managed workspace, hosted in Germany, for $50 per month with $10 of AI and data usage included. There are no per-response or per-integration fees.",
    },
  ],
  related: ["ai-traffic-analytics", "ai-visibility-tracking", "report-builder", "ai-bot-traffic"],
  cta: {
    title: "Find out how much revenue AI search really drives",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
