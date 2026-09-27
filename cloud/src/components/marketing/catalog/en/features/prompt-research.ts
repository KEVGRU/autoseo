import type { FeaturePage } from "../../types";

export default {
  slug: "prompt-research",
  nav: "Prompt research",
  summary: "Find the questions buyers ask AI assistants and turn them into tracked prompts.",
  meta: {
    title: "AI Prompt Research: Find What Buyers Ask AI",
    description:
      "AI prompt research by topic, funnel stage and persona, with search demand from DataForSEO. Generate, import and track the prompts your buyers ask ChatGPT.",
  },
  hero: {
    eyebrow: "AI prompt research",
    title: "AI prompt research that starts with your buyers.",
    muted: "Know what to track.",
    subtitle:
      "AutoSEO writes realistic prompts from your brand profile, personas and search interest — grouped by topic, funnel stage and persona, scored by search demand — and adds the best ones to your AI visibility tracker in one click.",
  },
  visual: "prompts",
  stats: [
    { value: 3, label: "Funnel stages", note: "Awareness, consideration, decision" },
    { value: 200, label: "Prompts per run", note: "Anywhere from 5 to 200" },
    { value: 2000, label: "Prompts per list", note: "Up to 50 lists per project" },
    { value: 143, label: "Markets", note: "Language and country per prompt set" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "Tracking is only as good as your prompts.",
    muted: "Guesswork skews every metric.",
    body: "People rarely type keywords into ChatGPT. They ask full questions with context, budgets and comparisons. If your tracked prompts don't match how buyers really ask, your visibility numbers describe a market that doesn't exist.",
    points: [
      {
        title: "Prompts are not keywords",
        body: "Conversational questions are longer and more specific than search queries. A keyword list alone misses how people describe problems, compare options and make decisions.",
      },
      {
        title: "Every funnel stage counts",
        body: "Awareness questions decide which brands a buyer hears about. Decision questions pick the winner. You need both to see where you drop out.",
      },
      {
        title: "Demand shows what to track first",
        body: "Topic keywords with real search volume show which questions matter most, so your tracking budget goes to prompts people actually ask.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What you get",
    title: "Research, score and track prompts",
    muted: "in one workflow.",
    items: [
      {
        icon: "sparkles",
        title: "Prompt Set Helper",
        body: "Generate 5 to 200 prompts per run for your topics, personas, funnel stages, prompt lengths and market, with a set share of branded prompts and optional competitor comparisons.",
      },
      {
        icon: "brain",
        title: "Built on Brand Knowledge",
        body: "Your brand profile, search interest clusters, sitemap sections and buyer personas define topics and perspectives, so prompts sound like your customers, not like a template.",
      },
      {
        icon: "trending-up",
        title: "Search demand per prompt",
        body: "Each prompt gets a topic keyword with monthly Google search volume and a 12-month trend from DataForSEO. Without DataForSEO, AI estimates relative demand and labels it as an estimate.",
      },
      {
        icon: "layers",
        title: "Labeled and filterable",
        body: "Every prompt carries topic, funnel stage, persona, intent, a branded flag and its length. Browse them as a topic tree or a flat list and filter in seconds.",
      },
      {
        icon: "download",
        title: "Import and export",
        body: "Upload a CSV or paste prompts, map the columns and check a preview before importing. Export any filtered list to CSV.",
      },
      {
        icon: "radar",
        title: "One click to the tracker",
        body: "Add selected prompts to the tracker, tagged with their topic, and see how much of your project's tracking limit is left.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From brand to prompt set",
    muted: "in three steps.",
    items: [
      {
        title: "Describe your brand once",
        body: "Run the Brand Knowledge analyses for profile, search interest, sitemap and personas. Once they're ready, AutoSEO can generate a first prompt list for you.",
      },
      {
        title: "Generate or import prompts",
        body: "Choose topics, personas, funnel stages and the branded share in the Prompt Set Helper, or import the list you already have. Search volumes are added automatically.",
      },
      {
        title: "Track the prompts that matter",
        body: "Filter by demand, stage or persona, test single prompts in Prompt Explorer and add the best ones to the tracker.",
      },
    ],
  },
  faq: [
    {
      q: "What is AI prompt research?",
      a: "AI prompt research finds the questions your audience asks AI assistants like ChatGPT, Perplexity or Gemini about your category. AutoSEO generates and labels these prompts by topic, funnel stage and persona, adds search demand and lets you track the best ones across 16 AI engines.",
    },
    {
      q: "How do I find the right prompts to track for my brand?",
      a: "Start with the Brand Knowledge analyses so AutoSEO understands your products, audience and search interest. Then open the Prompt Set Helper, choose topics, personas and funnel stages, and generate a balanced set. You can also import prompts you already use from a CSV file.",
    },
    {
      q: "How is search volume calculated for AI prompts?",
      a: "Each prompt gets a short topic keyword. With DataForSEO connected, AutoSEO fetches its monthly Google search volume and a 12-month trend. Without DataForSEO, the AI estimates relative demand on a 1–10 scale and marks the value as estimated.",
    },
    {
      q: "What is the difference between branded and non-branded prompts?",
      a: "Branded prompts name your brand, for example in a direct comparison with a competitor. Non-branded prompts describe a need without naming anyone, which shows whether AI recommends you on its own. The Prompt Set Helper lets you set the branded share from 0 to 100 percent; the default is 20 percent.",
    },
    {
      q: "Which AI generates the prompts?",
      a: "Generation runs on your own Claude Code or Codex CLI through AutoSEO's local agent, or on an AI API. On AutoSEO Cloud, it uses the AI providers the Codext team has connected, and usage counts toward the $10 included each month; when you self-host, you add your own API keys. Without any AI provider you can still import, filter and track your own prompt lists.",
    },
    {
      q: "Can I test a prompt before I track it?",
      a: "Yes. Prompt Explorer runs a single prompt on ChatGPT, Claude, Gemini and Perplexity through DataForSEO, or on your local agent or API. It shows each answer with its citations, any fan-out searches and whether your brand is mentioned, and you can start tracking the prompt from there.",
    },
    {
      q: "How many prompts can I research?",
      a: "A list holds up to 2,000 prompts, and a project can have up to 50 lists. How many prompts you track at the same time depends on the tracking limit of your project.",
    },
    {
      q: "Is AI prompt research free?",
      a: "Prompt research is part of the open-source AutoSEO app and free to self-host; DataForSEO and AI API usage is then billed by those providers. AutoSEO Cloud gives you a managed workspace for $50 per month with $10 of AI and data usage included.",
    },
  ],
  related: ["ai-visibility-tracking", "query-fanout-analysis", "keyword-research", "ai-competitor-analysis"],
  cta: {
    title: "Track the questions your buyers really ask",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
