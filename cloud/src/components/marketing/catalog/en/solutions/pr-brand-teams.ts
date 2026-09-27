import type { SolutionPage } from "../../types";

export default {
  slug: "pr-brand-teams",
  nav: "For PR & brand teams",
  summary: "Monitor how AI engines describe your brand and which media shape the answer.",
  meta: {
    title: "AI Brand Monitoring for PR & Brand Teams",
    description:
      "AI brand monitoring for PR teams: see how ChatGPT, Perplexity and Gemini describe your brand, which media they cite and how sentiment compares with competitors.",
  },
  hero: {
    eyebrow: "AutoSEO for PR & brand teams",
    title: "Know how AI describes your brand.",
    muted: "AI brand monitoring for PR teams.",
    subtitle:
      "Track what ChatGPT, Perplexity, Gemini, Claude and seven more engines say about your brand, which publications and forums they cite, and how your sentiment and share of voice compare with competitors.",
  },
  visual: "sentiment",
  challenges: {
    eyebrow: "The challenge",
    title: "AI now tells your brand story.",
    muted: "Often without you.",
    items: [
      {
        title: "Answers replace headlines",
        body: "People ask an assistant what a company is known for and get one summary, built from coverage, reviews and forums you may never see.",
      },
      {
        title: "Old stories live on",
        body: "A critical article or an outdated fact can keep resurfacing in AI answers long after the news cycle has moved on.",
      },
      {
        title: "Share of voice is invisible",
        body: "Media monitoring counts articles. It doesn't show how often AI recommends you — or a competitor instead.",
      },
    ],
  },
  workflow: {
    eyebrow: "How PR & brand teams use AutoSEO",
    title: "From monitoring to action,",
    muted: "in one place.",
    items: [
      {
        icon: "heart",
        title: "Track sentiment and perception",
        body: "Praise, criticism and neutral statements about your brand over time, and the themes and attributes AI associates with you.",
        feature: "ai-brand-sentiment",
      },
      {
        icon: "newspaper",
        title: "See which media shape the answers",
        body: "Every cited publication, forum and review site, grouped by type — with a playbook for getting listed on each.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "swords",
        title: "Benchmark share of voice",
        body: "How often AI names you versus competitors, who wins head-to-head comparisons and who owns the “best for” picks.",
        feature: "ai-competitor-analysis",
      },
      {
        icon: "shield-check",
        title: "Catch wrong claims",
        body: "Check what engines say about your products against your own reference documents and flag contradicted or outdated claims.",
        feature: "ai-fact-check",
      },
      {
        icon: "list-checks",
        title: "Turn criticism into a plan",
        body: "Recurring criticism and citation gaps become prioritized tasks, with the quotes and sources attached as evidence.",
        feature: "ai-seo-tasks",
      },
      {
        icon: "presentation",
        title: "Report to leadership",
        body: "Branded decks with live data from 11 templates, exported to PowerPoint or PDF or shared as a password-protected link.",
        feature: "report-builder",
      },
    ],
  },
  prompts: {
    eyebrow: "Example prompts",
    title: "Prompts PR & brand teams monitor",
    items: [
      "What is Acme known for?",
      "Is Acme a trustworthy company?",
      "Has Acme been involved in any controversies?",
      "Who are the leading companies in sustainable packaging?",
      "What is it like to work at Acme?",
      "Acme vs. its main competitor — which brand has the better reputation?",
    ],
  },
  outcomes: {
    eyebrow: "Why PR teams choose AutoSEO",
    title: "Shape the story",
    muted: "AI tells about you.",
    items: [
      {
        title: "See shifts when they happen",
        body: "Stored answers and daily tracking show when the tone changes, on which engine, and which sources the answers cite.",
      },
      {
        title: "An outreach list from real data",
        body: "Cited publications and review sites that mention competitors but not you become your media and outreach list.",
      },
      {
        title: "Numbers for the board",
        body: "Share of voice, sentiment and visibility trends in reports that update with every reporting period.",
      },
    ],
  },
  faq: [
    {
      q: "What is AI brand monitoring?",
      a: "AI brand monitoring tracks how AI assistants such as ChatGPT, Perplexity and Gemini describe your brand when people ask about it or your category. AutoSEO runs a fixed set of prompts on a schedule, stores every answer and measures mentions, sentiment, citations and share of voice.",
    },
    {
      q: "How do I find out what ChatGPT says about my brand?",
      a: "Add prompts such as “What is Acme known for?” to a project and pick ChatGPT and any other engines you care about. AutoSEO runs them daily, weekly or monthly and keeps every answer, so you can read exactly what was said and when. For one-off questions, Prompt Explorer shows several models' answers side by side.",
    },
    {
      q: "Can AutoSEO track brand sentiment in AI answers?",
      a: "Yes. AutoSEO extracts praise, criticism and neutral statements from each answer, shows sentiment over time and groups statements by theme. You can compare your sentiment with every competitor that appears in the answers.",
    },
    {
      q: "Which sources do AI engines use when they talk about us?",
      a: "AutoSEO lists every URL the engines cite for your prompts and groups them by type, such as news, reviews, forums, listicles and video. It highlights sources that feature competitors but not you, which makes them a natural outreach list.",
    },
    {
      q: "What can we do if AI repeats false or outdated information?",
      a: "Fact Check compares claims in AI answers with your own reference documents and flags contradicted, unsupported or outdated statements, with the quote from the answer and the matching passage. Recurring issues become tasks, so you can fix the underlying sources and track whether the answers change.",
    },
    {
      q: "Does AutoSEO replace media monitoring?",
      a: "No. AutoSEO focuses on AI answers and the sources they cite, not on press clippings or social listening. Use it next to your media monitoring tool to cover the AI side of your reputation.",
    },
  ],
  related: ["customer-experience", "content-teams", "agencies"],
  cta: {
    title: "Find out how AI describes your brand today",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies SolutionPage;
