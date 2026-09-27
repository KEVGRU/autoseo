import type { FeaturePage } from "../../types";

export default {
  slug: "ai-visibility-tracking",
  nav: "AI visibility tracking",
  summary: "Track how often 16 AI engines mention and cite your brand, every day.",
  meta: {
    title: "AI Visibility Tracker for ChatGPT, Gemini & Co.",
    description:
      "Track brand mentions, citations and position in ChatGPT, Perplexity, Gemini, Claude and Google AI Overviews. Open-source AI visibility tracker, self-host free.",
  },
  hero: {
    eyebrow: "AI visibility tracker",
    title: "Track your brand in every AI answer.",
    muted: "Every engine, every day.",
    subtitle:
      "AutoSEO runs the prompts your customers ask on ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews and six more engines — and shows how often you're mentioned, cited and recommended, compared with every competitor.",
  },
  visual: "answer",
  screenshot: {
    src: "/screenshots/ai-tracker.png",
    darkSrc: "/screenshots/ai-tracker-dark.png",
    alt: "AutoSEO AI visibility tracker with a visibility trend chart and tracked prompts per AI engine",
    url: "ai/tracker",
  },
  stats: [
    { value: 16, label: "AI engines", note: "ChatGPT, Gemini, Claude and more" },
    { value: 143, label: "Markets", note: "Country and language per prompt" },
    { value: 4, label: "Core metrics", note: "Visibility, mentions, citations, position" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "MIT licensed, every feature" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "Buyers ask AI first.",
    muted: "The shortlist is decided in the answer.",
    body: "When someone asks an assistant which tool, agency or product to choose, the answer names a handful of brands and links a few sources. Rank trackers can't see that moment. AI visibility tracking can.",
    points: [
      {
        title: "Answers replace result pages",
        body: "One answer stands in for ten blue links. If the model doesn't name you, you aren't considered — no matter where you rank on Google.",
      },
      {
        title: "Every engine answers differently",
        body: "ChatGPT, Perplexity, Gemini and Claude use different indexes and sources, so your visibility can be strong in one and missing in another.",
      },
      {
        title: "What gets measured gets fixed",
        body: "Daily data turns a vague feeling about AI search into trends you can report, explain and improve with concrete tasks.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What you can track",
    title: "Everything AI engines say about you,",
    muted: "in one tracker.",
    items: [
      {
        icon: "radar",
        title: "Visibility and mention rate",
        body: "The share of answers that mention your brand, per prompt, engine, market and period — with trends over time.",
      },
      {
        icon: "link",
        title: "Citation rate",
        body: "How often engines link to your own pages as a source, and which URLs they pick.",
      },
      {
        icon: "trending-up",
        title: "Average position",
        body: "Where your brand appears inside the answer when several brands are listed, so you know if you're the first recommendation or an afterthought.",
      },
      {
        icon: "swords",
        title: "Competitor share of voice",
        body: "Every brand the engines mention next to yours, ranked by visibility, mention depth and sentiment.",
      },
      {
        icon: "git-fork",
        title: "Prompt flow and fan-outs",
        body: "Which prompts gained or lost visibility between two periods, and the searches engines run behind the scenes.",
      },
      {
        icon: "map-pin",
        title: "Markets and locations",
        body: "Run the same prompt in different countries and languages and compare results on a map.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From prompt to trend line",
    muted: "in three steps.",
    items: [
      {
        title: "Add the prompts your customers ask",
        body: "Import prompts or generate them with prompt research by topic, funnel stage and persona. Group them with tags.",
      },
      {
        title: "Pick engines, markets and a schedule",
        body: "Choose any of the 16 engines, the countries you sell in and a daily, weekly or monthly schedule per project.",
      },
      {
        title: "Read the answers, act on the gaps",
        body: "Every answer is stored and scored. Drill into single responses, compare competitors and turn gaps into tasks.",
      },
    ],
  },
  faq: [
    {
      q: "What is AI visibility tracking?",
      a: "AI visibility tracking measures how often and how favorably AI assistants mention your brand when people ask relevant questions. AutoSEO runs a fixed set of prompts on a schedule, stores every answer and calculates visibility, mention rate, citation rate and average position per engine.",
    },
    {
      q: "Which AI engines can I track?",
      a: "ChatGPT (search and app), Perplexity, Google AI Overviews, Google AI Mode, Gemini, Claude, Microsoft Copilot, Grok, Mistral, DeepSeek, Meta AI, Qwen, Kimi, Sabiá and Solar. You choose the engines per project.",
    },
    {
      q: "How is AI visibility different from SEO rankings?",
      a: "Rankings show where a page appears in a list of links. AI visibility shows whether your brand is named in a generated answer, how it's described and which sources back it up. AutoSEO tracks both, so you can see how classic SEO and AI answers relate.",
    },
    {
      q: "How often are prompts tracked?",
      a: "You choose a daily, weekly or monthly schedule per project. Each run stores the full answers, so you can compare periods and see exactly what changed.",
    },
    {
      q: "Can I track competitors too?",
      a: "Yes. AutoSEO detects every brand mentioned in the answers and ranks them next to yours by visibility, mention depth, position and sentiment. You can also add competitors manually.",
    },
    {
      q: "Do I need API keys for every engine?",
      a: "No. Depending on the engine, answers come from DataForSEO, from direct API keys, or from your own Claude Code or Codex subscription through a local agent. On AutoSEO Cloud, AI and data features run through the providers the Codext team has connected, and usage counts toward the $10 included each month; when you self-host, you configure only what you want to use.",
    },
    {
      q: "Is the AI visibility tracker free?",
      a: "The complete tracker is part of the open-source AutoSEO app and free to self-host; third-party data such as DataForSEO or AI API usage is then billed by those providers. AutoSEO Cloud gives you a managed workspace for $50 per month with $10 of AI and data usage included.",
    },
  ],
  related: ["ai-competitor-analysis", "ai-citation-tracking", "prompt-research", "query-fanout-analysis"],
  cta: {
    title: "See where AI mentions you — and where it doesn't",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
