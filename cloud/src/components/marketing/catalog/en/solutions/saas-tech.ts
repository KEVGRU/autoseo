import type { SolutionPage } from "../../types";

export default {
  slug: "saas-tech",
  nav: "For SaaS & tech",
  summary: "Get recommended when buyers ask AI for software, and see the pipeline it creates.",
  meta: {
    title: "GEO for SaaS: Get Recommended in AI Search",
    description:
      "GEO for SaaS: track when ChatGPT, Claude and Perplexity recommend your software, win comparison prompts and attribute HubSpot or Salesforce deals to AI search.",
  },
  hero: {
    eyebrow: "AutoSEO for SaaS & tech",
    title: "Get your software recommended in AI search.",
    muted: "GEO for SaaS and tech companies.",
    subtitle:
      "Buyers ask AI for the best tool, the best alternative and how products compare. AutoSEO tracks those prompts across 16 engines, shows which reviews, docs and comparison pages shape the answers, and ties deals and subscriptions back to AI search.",
  },
  visual: "answer",
  challenges: {
    eyebrow: "The challenge",
    title: "Software shortlists start in AI chats.",
    muted: "Not every vendor makes the cut.",
    items: [
      {
        title: "Comparison prompts decide deals",
        body: "Buyers ask assistants for the best tool and the best alternatives. The answer names a few vendors and moves on.",
      },
      {
        title: "Docs and reviews shape the answer",
        body: "Engines cite documentation, review platforms, forums and comparison posts. If your advantages aren't documented where crawlers can read them, they can't be quoted.",
      },
      {
        title: "Pipeline without a source",
        body: "A demo request from a buyer who researched in ChatGPT rarely says so. AI search stays invisible in the CRM.",
      },
    ],
  },
  workflow: {
    eyebrow: "How SaaS teams use AutoSEO",
    title: "From comparison prompt",
    muted: "to closed deal.",
    items: [
      {
        icon: "swords",
        title: "Win comparison prompts",
        body: "Head-to-head results, “best for” picks and share of voice against every vendor AI names next to you.",
        feature: "ai-competitor-analysis",
      },
      {
        icon: "book",
        title: "Make docs and pages readable for AI",
        body: "Check AI bot access, llms.txt and raw-HTML rendering for your docs, pricing and feature pages.",
        feature: "ai-crawlability",
      },
      {
        icon: "link",
        title: "Find the reviews and threads that matter",
        body: "Review sites, forums, docs and comparison posts that engines cite for competitors but not for you.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "bot",
        title: "See which AI crawlers read your site",
        body: "Visits from GPTBot, ClaudeBot, PerplexityBot and more, from Cloudflare, Akamai or your server logs.",
        feature: "ai-bot-traffic",
      },
      {
        icon: "euro",
        title: "Attribute pipeline to AI search",
        body: "Connect HubSpot, Salesforce, Pipedrive or Stripe and see the leads, deals and subscriptions that came from AI search.",
        feature: "ai-search-attribution",
      },
      {
        icon: "terminal",
        title: "Automate with your own agents",
        body: "An MCP server with 100+ tools, a REST API and agent mode on your own Claude Code or Codex.",
        feature: "mcp-server",
      },
    ],
  },
  prompts: {
    eyebrow: "Example prompts",
    title: "Prompts software buyers ask AI",
    items: [
      "What's the best CRM for a 20-person B2B startup?",
      "Best alternatives to Acme for enterprise teams",
      "Acme vs. its main competitor — which has better integrations?",
      "Which project management tools have a free plan?",
      "Is Acme SOC 2 compliant?",
      "How do I connect Acme to Slack?",
      "Open-source alternatives to expensive analytics tools",
    ],
  },
  outcomes: {
    eyebrow: "Why SaaS teams choose AutoSEO",
    title: "Get on the AI shortlist,",
    muted: "and see what it's worth.",
    items: [
      {
        title: "Know where you win and lose",
        body: "Head-to-head claims, recommendations and share of voice per engine show which comparisons to work on first.",
      },
      {
        title: "Docs that engines can read",
        body: "Crawlability checks and bot traffic show whether AI crawlers reach the pages that explain your product.",
      },
      {
        title: "AI search in your pipeline reports",
        body: "Leads, deals and subscriptions attributed to AI search, next to the channels your team already reports on.",
      },
    ],
  },
  faq: [
    {
      q: "How do SaaS companies get recommended by ChatGPT?",
      a: "ChatGPT and other engines recommend software they find in trusted sources: review platforms, comparison articles, forums, documentation and your own site. Track the category and comparison prompts buyers ask, find the sources that favor competitors, and document your advantages where engines can read and cite them.",
    },
    {
      q: "Can AutoSEO track “alternatives” and comparison prompts?",
      a: "Yes. Add prompts such as “best alternatives to Acme” or “Acme vs. its main competitor” to a project. AutoSEO shows who is named and in which position, who wins head-to-head comparisons and which sources the engines cite.",
    },
    {
      q: "How do I attribute pipeline to AI search?",
      a: "Send contacts and deals from HubSpot, Salesforce or Pipedrive to AutoSEO via webhook, or payments and subscriptions from Stripe. Add a “How did you hear about us?” question to your forms, and AutoSEO maps the answers, deal values and conversions to AI search and the specific assistant.",
    },
    {
      q: "Should we add an llms.txt file?",
      a: "An llms.txt file gives AI systems a curated map of your most important pages, such as docs and pricing. AutoSEO's crawlability check validates your llms.txt and your robots.txt rules per AI bot, so you can see what each crawler is allowed to read.",
    },
    {
      q: "Can our developers use AutoSEO data in their own tools?",
      a: "Yes. Everything is available through REST API v1 with an OpenAPI spec and an MCP server with more than 100 tools, using OAuth 2.1 or scoped API keys. Plugins for Claude Code, Codex and Cursor add 17 agent skills.",
    },
    {
      q: "Is AutoSEO open source?",
      a: "Yes. AutoSEO is MIT licensed and free to self-host with every feature, so your security team can review the code. AutoSEO Cloud runs the same app as a managed workspace, hosted in Germany, for $50 per month with $10 of AI and data usage included.",
    },
  ],
  related: ["geo-teams", "content-teams", "customer-experience"],
  cta: {
    title: "Find out which tools AI recommends in your category",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies SolutionPage;
