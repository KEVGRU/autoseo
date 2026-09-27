import type { SolutionPage } from "../../types";

export default {
  slug: "pharma",
  nav: "For pharma",
  summary: "Check what AI engines say about your medicines against your own label, per market.",
  meta: {
    title: "AI Visibility & Fact Checking for Pharma",
    description:
      "Track what ChatGPT, Gemini and Perplexity say about your medicines and check every claim against your SmPC or label, per market. Open source, self-host free.",
  },
  hero: {
    eyebrow: "AutoSEO for pharma",
    title: "AI visibility and fact checking for pharma.",
    muted: "Measured against your own label.",
    subtitle:
      "AI assistants answer questions about medicines every day. AutoSEO tracks those answers across 16 AI engines and your markets, and compares every statement about your products with your reference documents, such as the SmPC or patient leaflet.",
  },
  visual: "factcheck",
  challenges: {
    eyebrow: "The challenge",
    title: "AI talks about your products.",
    muted: "Your label isn't always the source.",
    items: [
      {
        title: "Claims drift from the label",
        body: "Assistants summarize from many sources. Statements about indication, population or use can differ from what your label actually says.",
      },
      {
        title: "Every market has its own label",
        body: "Approved information differs by country and version. An answer that fits one market can be wrong in another, or quote a superseded version.",
      },
      {
        title: "Manual checks don't scale",
        body: "Reading answers from 16 engines in several markets and languages by hand, every week, isn't realistic for a medical or brand team.",
      },
    ],
  },
  workflow: {
    eyebrow: "How pharma teams use AutoSEO",
    title: "From AI answer to reviewed finding,",
    muted: "one workflow.",
    items: [
      {
        icon: "radar",
        title: "Track prompts in every market",
        body: "Run the questions people ask about your products and therapy areas across 16 engines, in each country and language you cover.",
        feature: "ai-visibility-tracking",
      },
      {
        icon: "shield-check",
        title: "Compare claims with your label",
        body: "Upload the SmPC, leaflet or another reference per market and version. Every AI statement is judged as matched, contradicted, unsupported, outdated or off-label.",
        feature: "ai-fact-check",
      },
      {
        icon: "link",
        title: "Find the sources behind a claim",
        body: "See which pages engines cite for each prompt — health portals, news, forums or your own site — and where accurate information is missing.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "git-fork",
        title: "See the searches behind answers",
        body: "Query fan-outs show which web searches engines run before answering, so you know which content needs to be findable.",
        feature: "query-fanout-analysis",
      },
      {
        icon: "list-checks",
        title: "Turn deviations into tasks",
        body: "Open critical and major findings become prioritized tasks with the claims, engines and next steps, ready for Jira, Linear or your own tracker.",
        feature: "ai-seo-tasks",
      },
    ],
  },
  prompts: {
    eyebrow: "Example prompts",
    title: "Prompts pharma teams track",
    items: [
      "What is Acme approved for?",
      "What are the most common side effects of Acme?",
      "Acme vs. other migraine treatments — how do they compare?",
      "Is Acme available without a prescription?",
      "Is there a generic version of Acme?",
      "Where can I find the patient leaflet for Acme?",
      "Which companies make biosimilars for rheumatoid arthritis?",
    ],
  },
  outcomes: {
    eyebrow: "Why pharma teams choose AutoSEO",
    title: "From scattered answers",
    muted: "to a reviewable list.",
    items: [
      {
        title: "Findings your team can review",
        body: "Each finding carries the AI quote, the label passage and section, a severity and how often it was seen — exportable as CSV.",
      },
      {
        title: "Label updates handled",
        body: "Upload a new version under the same title and the old one is marked as superseded. Claims that only match the old text are flagged as outdated.",
      },
      {
        title: "Hosting on your terms",
        body: "Self-host on your own servers to keep reference documents and findings on your infrastructure, or use an AutoSEO Cloud workspace hosted in Germany.",
      },
    ],
  },
  faq: [
    {
      q: "How can pharma companies monitor what AI says about their medicines?",
      a: "Track the questions people ask about your products in AutoSEO, across 16 AI engines and the markets you serve. The fact check then compares every statement about a product with your reference documents, such as the SmPC, and lists deviations with a severity.",
    },
    {
      q: "What does the AutoSEO fact check flag?",
      a: "Statements that contradict your reference text, aren't supported by it, only match a superseded version, or describe a use the label doesn't cover. Ambiguous cases are marked for human review. Deviations are rated critical, major or minor, and critical covers safety, dosing and contraindication topics.",
    },
    {
      q: "Does AutoSEO ensure regulatory compliance?",
      a: "No. AutoSEO shows where AI answers differ from your own reference documents so your team can review them. It doesn't give medical advice, replace a medical or regulatory review, or make any statement about compliance.",
    },
    {
      q: "Can we use a different label for each country?",
      a: "Yes. Each product can cover several markets, and each reference document can apply to one market or to all of them. AI statements are compared with the documents for the market in which they were seen.",
    },
    {
      q: "Does the fact check need an AI provider?",
      a: "It works best with one. On AutoSEO Cloud, AI features run through the providers the Codext team has connected, with usage counting toward the $10 included each month, and you can also connect your own Claude Code or Codex agent; when you self-host, you connect your own Claude Code or Codex CLI through a local agent or add an API key. Without any AI provider, AutoSEO falls back to word-for-word matching between the answers and your documents.",
    },
    {
      q: "Where are our reference documents stored?",
      a: "When you self-host, uploaded PDFs and their extracted text are stored on your own server. In AutoSEO Cloud, they are stored in your workspace on servers in Germany, logically separated from other workspaces. When AI judging is on, the relevant excerpts are sent to the AI provider that runs the check.",
    },
    {
      q: "How much does AutoSEO cost?",
      a: "Self-hosting is free with every feature and no limits. AutoSEO Cloud costs $50 per workspace per month plus VAT, for business customers, with unlimited users, up to 10 projects and $10 of AI and data usage included each month. When you self-host, third-party usage such as DataForSEO or AI API keys is billed by those providers.",
    },
  ],
  related: ["healthcare", "finance", "pr-brand-teams"],
  cta: {
    title: "Check what AI says about your products",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition on your own infrastructure for free.",
  },
} satisfies SolutionPage;
