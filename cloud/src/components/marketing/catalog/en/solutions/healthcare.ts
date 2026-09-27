import type { SolutionPage } from "../../types";

export default {
  slug: "healthcare",
  nav: "For healthcare",
  summary: "See which providers AI recommends to patients, and which sources it trusts.",
  meta: {
    title: "AI Visibility for Healthcare Providers",
    description:
      "See whether ChatGPT, Gemini and AI Overviews recommend your clinic, which health sources they cite and where they get your services wrong. Self-host free.",
  },
  hero: {
    eyebrow: "AutoSEO for healthcare",
    title: "AI visibility for healthcare providers.",
    muted: "Know what patients are told.",
    subtitle:
      "Patients ask AI assistants which clinic, practice or service to choose. AutoSEO tracks those answers across 16 AI engines, shows the sources behind them and checks what they say about your services against your own information.",
  },
  visual: "sources",
  challenges: {
    eyebrow: "The challenge",
    title: "Patients ask AI first.",
    muted: "You don't see the answer.",
    items: [
      {
        title: "The choice starts in the answer",
        body: "People ask which hospital, practice or telehealth service to use. The assistant names a few providers and cites a handful of pages. If yours aren't among them, you aren't considered.",
      },
      {
        title: "Outdated details reach patients",
        body: "Services you no longer offer, old opening hours or wrong details about a department arrive as confident answers — and you don't hear about it.",
      },
      {
        title: "You can't see which sources count",
        body: "AI engines lean on the sources they trust. Without data, you can't tell whether that's your own site, reference sites, reviews, news or forums.",
      },
    ],
  },
  workflow: {
    eyebrow: "How healthcare teams use AutoSEO",
    title: "Understand the answer,",
    muted: "then improve the sources.",
    items: [
      {
        icon: "radar",
        title: "Track the questions patients ask",
        body: "Monitor prompts about specialties, locations and services across 16 engines and every market you serve.",
        feature: "ai-visibility-tracking",
      },
      {
        icon: "lightbulb",
        title: "Find the prompts worth tracking",
        body: "Research questions by topic, funnel stage and persona, so tracking reflects how patients actually ask.",
        feature: "prompt-research",
      },
      {
        icon: "link",
        title: "See which health sources AI trusts",
        body: "Every cited URL, grouped by source type — reference sites, reviews, news, forums — with gaps where others are cited and you aren't.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "shield-check",
        title: "Check claims about your services",
        body: "Add service descriptions or patient information as reference documents and see where AI statements contradict them or aren't supported by them.",
        feature: "ai-fact-check",
      },
      {
        icon: "file-text",
        title: "Create content for patient questions",
        body: "Briefs and drafts in the voice of an author persona with role, expertise and credentials. Nothing is published until your team decides to.",
        feature: "ai-content-optimization",
      },
      {
        icon: "heart",
        title: "Understand how AI describes you",
        body: "Praise and criticism themes for you and comparable providers, so you know what to address first.",
        feature: "ai-brand-sentiment",
      },
    ],
  },
  prompts: {
    eyebrow: "Example prompts",
    title: "Prompts healthcare providers track",
    items: [
      "Which hospitals in Munich are best for hip replacement surgery?",
      "Best telehealth service for dermatology appointments",
      "Is Acme Clinic a good choice for sports injuries?",
      "How do I find a pediatrician accepting new patients near me?",
      "What do patients say about Acme Health's online booking?",
      "Which health apps are trustworthy for tracking sleep?",
      "Private eye clinics for laser vision correction — how do they compare?",
    ],
  },
  outcomes: {
    eyebrow: "Why healthcare teams choose AutoSEO",
    title: "See the answer patients see,",
    muted: "and act on it.",
    items: [
      {
        title: "Evidence, not assumptions",
        body: "Every answer is stored with its sources, so you can show exactly what an engine said, when and in which market.",
      },
      {
        title: "Inaccuracies spotted early",
        body: "Fact checks run daily, flag new deviations and reopen resolved ones when AI engines repeat them.",
      },
      {
        title: "Hosting on your terms",
        body: "Self-host AutoSEO on your own servers for full control over your data, or use an AutoSEO Cloud workspace hosted in Germany.",
      },
    ],
  },
  faq: [
    {
      q: "How do I find out what ChatGPT says about my clinic?",
      a: "Add the prompts patients ask — about specialties, locations and services — and AutoSEO runs them on ChatGPT, Perplexity, Gemini, Google AI Overviews and more on a schedule. You see whether your clinic is mentioned or cited, which providers appear next to you and which pages the answers rely on.",
    },
    {
      q: "Can AutoSEO spot incorrect information about our services?",
      a: "It flags AI statements about your services that differ from your own reference documents, such as service descriptions or patient information. Each finding shows the AI quote, the relevant passage and a severity, so your team can review it. AutoSEO doesn't judge medical correctness beyond the documents you provide.",
    },
    {
      q: "Is AutoSEO a medical or compliance tool?",
      a: "No. AutoSEO is an AI visibility and SEO platform. It shows what AI engines say and where that differs from your own material; medical and regulatory review of any content stays with your team.",
    },
    {
      q: "Does AutoSEO need access to patient data?",
      a: "No. AutoSEO works with the prompts you track, AI answers, your website and the reference documents you upload. It isn't built to store patient records, and it doesn't need them.",
    },
    {
      q: "Can we host AutoSEO ourselves?",
      a: "Yes. AutoSEO is open source under the MIT license and runs on your own servers with the one-line installer, Docker Compose or Coolify. Your data stays on your infrastructure, apart from requests to the AI and data providers you configure.",
    },
    {
      q: "Does AutoSEO help with local search for clinics?",
      a: "Yes. Next to AI visibility, AutoSEO includes local SEO for Google Business Profile and Maps: find listings, check local rankings on a rank grid and audit reviews, Q&A and posts.",
    },
    {
      q: "How much does AutoSEO cost?",
      a: "Self-hosting is free with every feature and no limits. AutoSEO Cloud costs $50 per workspace per month plus VAT, for business customers, with unlimited users, up to 10 projects and $10 of AI and data usage included each month. When you self-host, third-party usage such as DataForSEO or AI API keys is billed by those providers.",
    },
  ],
  related: ["pharma", "content-teams", "customer-experience"],
  cta: {
    title: "See what AI tells patients about you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition on your own infrastructure for free.",
  },
} satisfies SolutionPage;
