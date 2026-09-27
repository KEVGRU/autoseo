import type { SolutionPage } from "../../types";

export default {
  slug: "automotive",
  nav: "For automotive",
  summary: "See how AI ranks your models against rivals and where it gets your specs wrong.",
  meta: {
    title: "AI Visibility for Automotive Brands & Dealers",
    description:
      "Track how ChatGPT, Gemini and Google AI Overviews rank your car models against rivals, which reviews they cite and where specs are outdated. Self-host free.",
  },
  hero: {
    eyebrow: "AutoSEO for automotive",
    title: "AI visibility for automotive brands.",
    muted: "From model research to dealer choice.",
    subtitle:
      "Car buyers ask AI assistants which model, trim or dealer to choose. AutoSEO tracks how 16 AI engines rank your models against the competition, which reviews and tests they cite, and where their answers get your specs wrong.",
  },
  visual: "ranking",
  challenges: {
    eyebrow: "The challenge",
    title: "The shortlist is built in the chat.",
    muted: "Brochures don't reach it.",
    items: [
      {
        title: "Models are compared in one answer",
        body: "“Best family EV” or “most reliable hybrid” returns a ranked list. The position in that list shapes which models people look at next.",
      },
      {
        title: "Specs and prices go stale",
        body: "Range, prices, trims and equipment change with every model year. AI answers can keep repeating last year's numbers from reviews and forums.",
      },
      {
        title: "Tests and reviews decide",
        body: "Engines build their answers from test reports, buying guides and videos. Without data, you can't tell which of them shape the verdict on your models.",
      },
    ],
  },
  workflow: {
    eyebrow: "How automotive teams use AutoSEO",
    title: "From model ranking to fixed specs,",
    muted: "one workflow.",
    items: [
      {
        icon: "trending-up",
        title: "Track model rankings in AI answers",
        body: "Visibility, mention rate and position for each model across 16 engines and every market you sell in.",
        feature: "ai-visibility-tracking",
      },
      {
        icon: "swords",
        title: "Win the head-to-heads",
        body: "See when AI compares your models with rivals, who comes out ahead and which brands appear most often.",
        feature: "ai-competitor-analysis",
      },
      {
        icon: "link",
        title: "Get into the tests AI cites",
        body: "Reviews, tests, buying guides, videos and forums: find the sources behind each answer and where you're missing.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "shield-check",
        title: "Catch outdated specs",
        body: "Upload spec sheets and price lists per market. AutoSEO flags AI claims that contradict them or only match an older version.",
        feature: "ai-fact-check",
      },
      {
        icon: "git-fork",
        title: "See the searches behind answers",
        body: "Query fan-outs show what engines search for before they recommend a car, so you can build content for exactly that.",
        feature: "query-fanout-analysis",
      },
      {
        icon: "search",
        title: "Keep classic rankings in view",
        body: "Desktop and mobile positions by market for model and dealer keywords, right next to your AI data.",
        feature: "rank-tracking",
      },
    ],
  },
  prompts: {
    eyebrow: "Example prompts",
    title: "Prompts automotive brands track",
    items: [
      "Best electric SUV for families",
      "Which EV has the longest range for the price?",
      "Acme's compact SUV vs. its main rivals — which is more reliable?",
      "Most reliable hybrid cars to buy used",
      "Is the Acme compact SUV worth it?",
      "Which cars have the lowest running costs?",
      "What do owners say about Acme's infotainment system?",
      "Best car dealership in Stuttgart for a test drive",
    ],
  },
  outcomes: {
    eyebrow: "Why automotive teams choose AutoSEO",
    title: "Know where your models stand",
    muted: "in every AI answer.",
    items: [
      {
        title: "Visibility per model",
        body: "Tag prompts by model or segment and filter the competitor ranking by tag to see where each model stands.",
      },
      {
        title: "Spec errors made visible",
        body: "Deviations from your spec sheets surface as findings, with the AI quote next to the passage from your document.",
      },
      {
        title: "AI and classic search in one tool",
        body: "Keyword research, rank tracking and site audits sit next to your AI visibility data — no second subscription.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track my car models in ChatGPT answers?",
      a: "Add the prompts buyers ask — by segment, powertrain, budget or model name — and AutoSEO runs them on ChatGPT, Gemini, Perplexity, Google AI Overviews and more. You see which models are mentioned, their position in the answer and which sources are cited.",
    },
    {
      q: "Can AutoSEO compare our models with competitors in AI answers?",
      a: "Yes. Competitor analysis shows share of voice, average position and head-to-head results for every brand AI engines mention next to yours, per engine and market.",
    },
    {
      q: "What if AI engines quote outdated prices or specs?",
      a: "Add your current spec sheets or price lists as reference documents. The fact check compares AI statements about each model with them and flags contradictions and claims that only match an older version. The sources view shows which pages the outdated information comes from.",
    },
    {
      q: "Does AutoSEO work for dealer groups?",
      a: "Yes. Track prompts per country and language, and name the city in the prompt for local questions. Local SEO covers Google Business Profile and Maps rankings, and each dealer or region can be its own project with its own access rights — up to 10 in AutoSEO Cloud, unlimited when self-hosted.",
    },
    {
      q: "Which AI engines does AutoSEO track?",
      a: "ChatGPT (search and app), Perplexity, Google AI Overviews, Google AI Mode, Gemini, Claude, Microsoft Copilot, Grok, Mistral, DeepSeek, Meta AI, Qwen, Kimi, Sabiá and Solar. You choose the engines, markets and schedule per project.",
    },
    {
      q: "How much does AutoSEO cost?",
      a: "Self-hosting is free with every feature and no limits. AutoSEO Cloud costs $50 per workspace per month plus VAT, for business customers, with unlimited users, up to 10 projects and $10 of AI and data usage included each month. When you self-host, third-party usage such as DataForSEO or AI API keys is billed by those providers.",
    },
  ],
  related: ["e-commerce", "travel", "geo-teams"],
  cta: {
    title: "See how AI ranks your models",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies SolutionPage;
