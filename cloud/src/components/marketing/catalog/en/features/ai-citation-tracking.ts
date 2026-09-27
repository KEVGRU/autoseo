import type { FeaturePage } from "../../types";

export default {
  slug: "ai-citation-tracking",
  nav: "AI citation tracking",
  summary: "See which pages AI engines cite for your prompts, and where you need to be listed.",
  meta: {
    title: "AI Citation Tracking: Sources AI Engines Cite",
    description:
      "AI citation tracking for ChatGPT, Perplexity and AI Overviews: every cited page and domain, grouped by type, plus the sources that cite competitors, not you.",
  },
  hero: {
    eyebrow: "AI citation tracking",
    title: "AI citation tracking for every source.",
    muted: "Find the pages that shape answers.",
    subtitle:
      "AutoSEO records every URL that AI engines cite when they answer your prompts, groups them by domain and content type, and shows which sources name your competitors but not you — your outreach list, ready to use.",
  },
  visual: "sources",
  screenshot: {
    src: "/screenshots/sources.png",
    alt: "AutoSEO sources view with top cited domains over time, source types and a source analysis table",
    url: "ai/sources",
  },
  stats: [
    { value: 13, label: "Source types", note: "From listicles to docs" },
    { value: 3, label: "Ownership classes", note: "Yours, competitors', third-party" },
    { value: 16, label: "AI engines", note: "Wherever engines return sources" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "MIT licensed, every feature" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "AI answers are built from sources.",
    muted: "Get into the sources, get into the answer.",
    body: "Search-grounded engines like ChatGPT search, Perplexity and Google AI Overviews read pages before they answer and link the ones they used. The pages they trust influence which brands appear. Citation tracking tells you which pages those are.",
    points: [
      {
        title: "Third-party pages carry weight",
        body: "Reviews, comparison lists, forums and videos are often cited more than brand sites. If they don't mention you, the answer often won't either.",
      },
      {
        title: "Your own pages need to be citable",
        body: "Citation rate shows how often engines link to your domain. High mentions with a low citation rate mean AI knows you but uses someone else's page as proof.",
      },
      {
        title: "Sources change over time",
        body: "New articles get picked up and old ones drop out. Tracking citations on a schedule shows which sources are gaining influence.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What you can track",
    title: "Every cited page,",
    muted: "with the context that matters.",
    items: [
      {
        icon: "link",
        title: "Top cited sources",
        body: "The domains and pages AI engines cite most for your prompts, with citations over time and changes against the previous period.",
      },
      {
        icon: "layers",
        title: "Source types",
        body: "Citations grouped into 13 content types, such as listicles, buying guides, reviews, UGC, news, video, retail and docs.",
      },
      {
        icon: "shield-check",
        title: "Ownership",
        body: "Every source classified as your domain, a competitor's domain or third-party, so you can filter for the pages you don't control.",
      },
      {
        icon: "search",
        title: "Source analysis",
        body: "For one page or domain: citations over time, engines, average citation position, the prompts that cite it and the brands named alongside it.",
      },
      {
        icon: "target",
        title: "Where you're missing",
        body: "The share of answers citing a source that also name you. Sources cited without you are where a listing directly affects your visibility.",
      },
      {
        icon: "lightbulb",
        title: "Get-listed playbooks",
        body: "Next steps per content type — pitching a listicle, supplying a buying guide, joining a forum thread — plus citation-gap tasks you can push to your project tool.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From citation to outreach list",
    muted: "in three steps.",
    items: [
      {
        title: "Track prompts on engines that cite",
        body: "Enable engines that return sources, such as ChatGPT, Perplexity, Google AI Overviews, AI Mode, Gemini and Claude, for the markets you sell in.",
      },
      {
        title: "AutoSEO normalizes and classifies",
        body: "Cited URLs are cleaned of tracking parameters, grouped by page and domain, and labeled by content type and owner.",
      },
      {
        title: "Get listed where it counts",
        body: "Filter for third-party sources that cite competitors but not you, follow the playbook and watch your citations and mentions over time.",
      },
    ],
  },
  faq: [
    {
      q: "What is AI citation tracking?",
      a: "AI citation tracking records which web pages AI assistants link to as sources when they answer a question. AutoSEO stores every citation for your tracked prompts, groups them by page, domain and content type, and shows how often your own domain is cited.",
    },
    {
      q: "How do I find out which sources ChatGPT cites?",
      a: "Track your prompts with ChatGPT enabled. AutoSEO saves every source the answer links to, so the Sources view lists the pages and domains ChatGPT relies on for your topics, per prompt and over time.",
    },
    {
      q: "What is the difference between a mention and a citation?",
      a: "A mention means the answer names your brand in its text. A citation means the answer links to a page on your domain as a source. AutoSEO tracks both: mention rate shows whether AI knows you, citation rate shows whether it uses your pages as evidence.",
    },
    {
      q: "Which AI engines show citations?",
      a: "Engines that search the web before answering return sources, including ChatGPT, Perplexity, Google AI Overviews, Google AI Mode, Gemini, Claude, Microsoft Copilot, Grok, Mistral, Meta AI, Qwen, Kimi and Sabiá. DeepSeek and Solar answer from model knowledge, without citations. Whether an answer contains citations depends on the engine and on the provider AutoSEO uses to get it.",
    },
    {
      q: "How do I get cited by AI engines?",
      a: "Make sure your pages are crawlable and answer the prompt directly with concrete facts, and get listed on the third-party pages engines already cite. AutoSEO shows those pages, suggests next steps per content type and creates citation-gap tasks for sources that cite competitors but not you.",
    },
    {
      q: "Can I export the list of cited sources?",
      a: "Yes. The source analysis exports to CSV by page or by domain, and the report builder has blocks for top cited sources, source types and citation ownership. The REST API and MCP server return top sources for your own tools.",
    },
    {
      q: "Is AI citation tracking free?",
      a: "Citation tracking is part of the open-source AutoSEO app and free to self-host; DataForSEO and AI API usage is then billed by those providers. AutoSEO Cloud gives you a managed workspace for $50 per month with $10 of AI and data usage included.",
    },
  ],
  related: ["ai-visibility-tracking", "ai-competitor-analysis", "ai-crawlability", "ai-seo-tasks"],
  cta: {
    title: "See the pages AI trusts in your market",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
