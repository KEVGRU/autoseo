import type { SolutionPage } from "../../types";

export default {
  slug: "customer-experience",
  nav: "For CX teams",
  summary: "See how AI describes your support, reviews and policies, and correct what's wrong.",
  meta: {
    title: "AI Reputation Monitoring for CX Teams",
    description:
      "See how ChatGPT, Gemini and Perplexity describe your support, reviews and policies, and catch wrong answers with fact checks. AI reputation monitoring for CX.",
  },
  hero: {
    eyebrow: "AutoSEO for customer experience teams",
    title: "Know what AI tells your customers.",
    muted: "AI reputation monitoring for CX teams.",
    subtitle:
      "Customers ask AI about your support, return policy and reliability before they contact you. AutoSEO tracks those answers across 16 engines, extracts praise and criticism, and checks claims against your own documentation.",
  },
  visual: "factcheck",
  challenges: {
    eyebrow: "The challenge",
    title: "Customers ask AI before they ask you.",
    muted: "The answer sets expectations.",
    items: [
      {
        title: "Wrong answers create tickets",
        body: "When an assistant gets a policy, price or feature wrong, customers arrive with the wrong expectation — and your team has to correct it.",
      },
      {
        title: "Old complaints resurface",
        body: "AI engines summarize reviews and forum threads. A problem you fixed last year can still be how they describe you today.",
      },
      {
        title: "Nobody owns the AI answer",
        body: "Support tracks tickets, marketing tracks rankings. What AI says about your service quality falls between the teams.",
      },
    ],
  },
  workflow: {
    eyebrow: "How CX teams use AutoSEO",
    title: "From customer question",
    muted: "to corrected answer.",
    items: [
      {
        icon: "heart",
        title: "See what AI praises and criticizes",
        body: "Statements about your support, pricing and reliability, grouped by theme and compared with your competitors.",
        feature: "ai-brand-sentiment",
      },
      {
        icon: "shield-check",
        title: "Check answers against your docs",
        body: "Add reference documents as PDF, text or URL, and Fact Check flags contradicted, unsupported or outdated claims per engine.",
        feature: "ai-fact-check",
      },
      {
        icon: "message-square",
        title: "Find the threads behind the answers",
        body: "The forums, review sites and community posts engines cite when they describe your service.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "radar",
        title: "Track support questions on every engine",
        body: "Monitor how 16 AI engines answer the questions customers ask before they contact you, in every market you serve.",
        feature: "ai-visibility-tracking",
      },
      {
        icon: "file-text",
        title: "Publish clear answers",
        body: "Turn recurring questions into FAQ and how-to pages scored for AI answers, pushed to WordPress or Webflow.",
        feature: "ai-content-optimization",
      },
      {
        icon: "list-checks",
        title: "Hand fixes to the right team",
        body: "Recurring criticism and inaccurate claims become tasks with evidence, synced with Jira, Linear, Asana or ClickUp.",
        feature: "ai-seo-tasks",
      },
    ],
  },
  prompts: {
    eyebrow: "Example prompts",
    title: "Questions customers ask AI about you",
    items: [
      "Does Acme have good customer service?",
      "How do I cancel my Acme subscription?",
      "What is Acme's return policy?",
      "Is Acme reliable, or are there common problems?",
      "How do I contact Acme support?",
      "What do customers complain about most with Acme?",
      "Which provider has the best customer support for small businesses?",
    ],
  },
  outcomes: {
    eyebrow: "Why CX teams choose AutoSEO",
    title: "Fewer surprises,",
    muted: "better first impressions.",
    items: [
      {
        title: "Accurate answers about your policies",
        body: "Fact checks show where engines misstate your terms, so you can fix the pages they rely on.",
      },
      {
        title: "A new source of customer feedback",
        body: "Recurring criticism in AI answers shows which service topics shape your reputation right now.",
      },
      {
        title: "One view for every team",
        body: "Support, marketing and product read the same answers, with roles and per-project access for each team.",
      },
    ],
  },
  faq: [
    {
      q: "Why should customer experience teams care about AI search?",
      a: "Customers ask AI assistants about support quality, policies and common problems before they contact a company. The answers set expectations. If they're outdated or wrong, your team deals with the consequences in tickets and reviews.",
    },
    {
      q: "How do I see what AI says about our customer service?",
      a: "Track prompts such as “Does Acme have good customer service?” across the engines your customers use. AutoSEO stores every answer, extracts praise and criticism by theme and shows how you compare with competitors over time.",
    },
    {
      q: "Can AutoSEO detect incorrect information about our products or policies?",
      a: "Yes. Fact Check compares claims in AI answers with the reference documents you provide and labels them as matched, contradicted, unsupported or outdated, with a severity and the exact quotes. You can resolve or ignore findings and see whether they come back.",
    },
    {
      q: "Which sources do AI engines use for reviews and complaints?",
      a: "AutoSEO lists every cited URL and groups sources by type, including forums, user-generated content, reviews and news. You see which threads and review pages feed the answers about your brand.",
    },
    {
      q: "Can support and marketing work in the same project?",
      a: "Yes. Invite colleagues with the Owner, Admin, Member or Client role or a custom role, and control access per project. Everyone signs in with a magic link — no passwords to manage.",
    },
    {
      q: "How much does AutoSEO cost?",
      a: "The open-source edition is free to self-host with every feature and no limits; AI and data providers bill self-hosters directly. AutoSEO Cloud, hosted in Germany, costs $50 per workspace per month with up to 10 projects, unlimited users and $10 of AI and data usage included.",
    },
  ],
  related: ["pr-brand-teams", "e-commerce", "saas-tech"],
  cta: {
    title: "See what AI tells your customers",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies SolutionPage;
