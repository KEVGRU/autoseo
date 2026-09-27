import type { SolutionPage } from "../../types";

export default {
  slug: "geo-teams",
  nav: "For GEO & SEO teams",
  summary: "Measure AI visibility, find the gaps and ship fixes, next to your SEO data.",
  meta: {
    title: "GEO Platform for SEO, GEO & AEO Teams",
    description:
      "The GEO platform for SEO teams: track prompts across 16 AI engines, find citation gaps and fan-outs, and turn them into tasks. Open source, self-host free.",
  },
  hero: {
    eyebrow: "AutoSEO for GEO & SEO teams",
    title: "One GEO platform for AI search and SEO.",
    muted: "Measure, fix, prove.",
    subtitle:
      "Track your prompts across 16 AI engines, see which sources and background searches shape each answer, and turn every gap into an evidence-backed task — next to keyword research, rank tracking and site audits.",
  },
  visual: "ranking",
  challenges: {
    eyebrow: "The challenge",
    title: "AI search needs its own data.",
    muted: "Your SEO stack can't see it.",
    items: [
      {
        title: "Rankings don't show recommendations",
        body: "A page can rank first on Google while ChatGPT recommends three competitors. Position tracking misses the answer layer entirely.",
      },
      {
        title: "Too many tools, no single picture",
        body: "Prompt tracking in one tool, keywords in another, crawler logs in a third. Connecting the dots eats the week.",
      },
      {
        title: "Hard to prove what worked",
        body: "Answers shift with every model update. Without stored answers over time, you can't show which fix moved visibility.",
      },
    ],
  },
  workflow: {
    eyebrow: "How GEO teams use AutoSEO",
    title: "From prompt research to shipped fixes,",
    muted: "one workflow.",
    items: [
      {
        icon: "lightbulb",
        title: "Research the prompts that matter",
        body: "Generate prompts by topic, funnel stage and persona, see their search demand and send the best ones to the tracker.",
        feature: "prompt-research",
      },
      {
        icon: "radar",
        title: "Track 16 engines on a schedule",
        body: "Visibility, mention rate, citation rate and average position per prompt, engine and market — daily, weekly or monthly.",
        feature: "ai-visibility-tracking",
      },
      {
        icon: "git-fork",
        title: "See the searches behind each answer",
        body: "Query fan-outs show the searches engines run before they answer, so you know which questions your pages must cover.",
        feature: "query-fanout-analysis",
      },
      {
        icon: "link",
        title: "Close citation gaps",
        body: "Find the domains and pages engines cite for competitors but not for you, grouped by content type.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "shield-check",
        title: "Check AI crawler access",
        body: "robots.txt rules per AI bot, llms.txt, meta robots and raw-HTML rendering, checked for your key pages.",
        feature: "ai-crawlability",
      },
      {
        icon: "list-checks",
        title: "Ship evidence-backed tasks",
        body: "Findings from every dataset become prioritized tasks with impact and effort, pushed to Jira, Linear, Asana and more.",
        feature: "ai-seo-tasks",
      },
    ],
  },
  prompts: {
    eyebrow: "Example prompts",
    title: "Prompts GEO teams track across the funnel",
    items: [
      "What is the best accounting software for freelancers?",
      "How do I choose a payroll provider for a small company?",
      "Which email marketing tools integrate with Shopify?",
      "Acme vs. its biggest competitor — which is better for small teams?",
      "Best alternatives to Acme for enterprise companies",
      "Is Acme worth the price?",
    ],
  },
  outcomes: {
    eyebrow: "Why GEO teams choose AutoSEO",
    title: "AI visibility and SEO,",
    muted: "in one data model.",
    items: [
      {
        title: "One source of truth",
        body: "AI answers, citations, keywords, rankings, audits, Search Console and GA4 live in the same project, so every finding has context.",
      },
      {
        title: "Built for technical teams",
        body: "REST API, an MCP server with 100+ tools and agent mode on your own Claude Code or Codex automate what you'd otherwise do by hand.",
      },
      {
        title: "No per-prompt pricing",
        body: "AutoSEO doesn't charge per prompt or seat. Cloud includes $10 of AI and data usage a month; self-hosted, you pay providers directly and set your own spend limits.",
      },
    ],
  },
  faq: [
    {
      q: "What is a GEO platform?",
      a: "A GEO (generative engine optimization) platform measures how AI assistants such as ChatGPT, Perplexity and Gemini mention and cite your brand, and helps you improve it. AutoSEO tracks your prompts across 16 AI engines, analyzes sources, competitors and sentiment, and turns gaps into tasks — next to a complete SEO suite.",
    },
    {
      q: "What's the difference between GEO, AEO and SEO?",
      a: "SEO optimizes pages to rank in search results. AEO (answer engine optimization) and GEO (generative engine optimization) aim at being named and cited in AI-generated answers. They overlap: AI engines rely on crawlable, trusted pages, which is why AutoSEO keeps both in one place.",
    },
    {
      q: "Which AI engines can a GEO team track with AutoSEO?",
      a: "ChatGPT (search and app), Perplexity, Google AI Overviews, Google AI Mode, Gemini, Claude, Microsoft Copilot, Grok, Mistral, DeepSeek, Meta AI, Qwen, Kimi, Sabiá and Solar — 16 engines in total. You pick the engines, markets and a daily, weekly or monthly schedule per project.",
    },
    {
      q: "Can I connect AutoSEO to our existing SEO data?",
      a: "Yes. Connect Google Search Console, Bing Webmaster Tools, GA4, Matomo or Piwik PRO, plus bot traffic from Cloudflare, Akamai or your server logs. Keyword, SERP and backlink data comes from DataForSEO.",
    },
    {
      q: "Can we automate GEO work with AI agents?",
      a: "Yes. Agent mode lets you chat with all project data through your own Claude Code or Codex. The REST API and an MCP server with more than 100 tools give your own agents and scripts access to the same data.",
    },
    {
      q: "How much does AutoSEO cost for an in-house team?",
      a: "The open-source edition is free to self-host with every feature and no limits; DataForSEO and AI provider usage is billed by those providers. AutoSEO Cloud costs $50 per workspace per month with up to 10 projects, unlimited users and $10 of AI and data usage included.",
    },
  ],
  related: ["content-teams", "agencies", "saas-tech"],
  cta: {
    title: "Give your GEO program real data",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies SolutionPage;
