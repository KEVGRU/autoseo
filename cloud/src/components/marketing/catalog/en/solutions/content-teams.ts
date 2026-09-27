import type { SolutionPage } from "../../types";

export default {
  slug: "content-teams",
  nav: "For content teams",
  summary: "Plan, write and improve content that AI engines quote and cite.",
  meta: {
    title: "AI Search Content Tool for Content Teams",
    description:
      "Plan content for AI search: prompt research, citation gaps, fan-out searches and AEO-scored briefs and drafts you push to WordPress or Webflow. Self-host free.",
  },
  hero: {
    eyebrow: "AutoSEO for content teams",
    title: "Create the content AI search cites.",
    muted: "Planned from real answers.",
    subtitle:
      "See which questions your audience asks AI, which pages engines cite instead of yours and which searches they run behind the scenes — then write briefs and drafts scored for AI answers and publish them to your CMS.",
  },
  visual: "content",
  challenges: {
    eyebrow: "The challenge",
    title: "Content plans are built on keywords.",
    muted: "AI answers work differently.",
    items: [
      {
        title: "Questions, not keywords",
        body: "People ask AI full questions with context. Keyword tools don't show which of those questions matter for your brand.",
      },
      {
        title: "Good pages that never get cited",
        body: "Engines quote pages that answer directly, with facts and a clear structure. Many articles bury the answer halfway down.",
      },
      {
        title: "No feedback loop",
        body: "Once a piece is live, most teams can't tell whether AI engines started citing it — or which competitor page they still prefer.",
      },
    ],
  },
  workflow: {
    eyebrow: "How content teams use AutoSEO",
    title: "From question to cited page,",
    muted: "one workflow.",
    items: [
      {
        icon: "lightbulb",
        title: "Find the questions worth answering",
        body: "Prompt research by topic, funnel stage and persona shows what your audience asks AI and how much demand each topic has.",
        feature: "prompt-research",
      },
      {
        icon: "link",
        title: "See which pages get cited instead",
        body: "For every prompt, the URLs engines cite, their content type and whether a competitor or a third party owns them.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "git-fork",
        title: "Cover the sub-questions",
        body: "Query fan-outs reveal the searches engines run before they answer — the outline of the page you should write.",
        feature: "query-fanout-analysis",
      },
      {
        icon: "pen",
        title: "Write briefs and drafts",
        body: "Answer articles, guides, comparisons, how-tos and FAQ pages, scored on six AEO pillars and pushed to WordPress or Webflow.",
        feature: "ai-content-optimization",
      },
      {
        icon: "search",
        title: "Back every topic with keyword data",
        body: "Search volume, difficulty and intent for the keywords behind each topic, in saved lists you can tag and export.",
        feature: "keyword-research",
      },
      {
        icon: "chart",
        title: "Measure what happens next",
        body: "See which pages AI platforms send visitors to via GA4, Matomo or Piwik PRO, and what those visits convert to.",
        feature: "ai-traffic-analytics",
      },
    ],
  },
  prompts: {
    eyebrow: "Example prompts",
    title: "Questions content teams build pages for",
    items: [
      "How do I write a project brief for a website redesign?",
      "What's the difference between a CRM and a marketing automation tool?",
      "Best tools for managing a content calendar",
      "How much does it cost to build an online store?",
      "Step-by-step guide to moving a blog to a new CMS",
      "Is Acme a good fit for small marketing teams?",
    ],
  },
  outcomes: {
    eyebrow: "Why content teams choose AutoSEO",
    title: "Content that earns citations,",
    muted: "not just clicks.",
    items: [
      {
        title: "Briefs grounded in real answers",
        body: "Every brief starts from tracked prompts, cited sources and fan-out searches instead of guesswork.",
      },
      {
        title: "A clear quality bar",
        body: "The AEO score rates extractability, fact density, structure, schema, depth and metadata, and updates live as you edit.",
      },
      {
        title: "Proof that it worked",
        body: "Tracking and analytics show whether engines start mentioning and citing your pages after you publish.",
      },
    ],
  },
  faq: [
    {
      q: "How do I optimize content for AI search?",
      a: "Answer the question directly near the top, back it with specific facts and sources, use clear headings, lists and structured data, and keep the page crawlable for AI bots. AutoSEO scores drafts and existing pages on these factors and shows which prompts and sources to target.",
    },
    {
      q: "What is an AEO score?",
      a: "AutoSEO's AEO (answer engine optimization) score rates a page from 0 to 100 on six pillars: extractability, fact density, structure, schema markup, depth and metadata. It updates live in the editor and comes with concrete suggestions for each pillar.",
    },
    {
      q: "Which content types can AutoSEO draft?",
      a: "Answer articles, ultimate guides, comparison pages, best-of lists, how-tos, FAQ pages and product or landing pages. Drafts are built from your prompts, cited sources and brand knowledge, and you edit them before publishing.",
    },
    {
      q: "Can I optimize pages that are already live?",
      a: "Yes. Enter a URL, optionally with a target keyword and the question it should answer. AutoSEO scores the page and lists concrete fixes, or drafts an optimized rewrite.",
    },
    {
      q: "Can I publish directly to my CMS?",
      a: "Yes. Connect WordPress, where content arrives as drafts, or Webflow or Framer CMS collections, and publish from the editor. Framer drafts can also be exported as a CMS-ready CSV and imported in one step.",
    },
    {
      q: "Does content generation use my own AI subscription?",
      a: "It can. Connect your own Claude Code or Codex CLI through a lightweight local agent, and drafts run on the subscription you already pay for — in AutoSEO Cloud and self-hosted. Cloud also includes $10 of AI and data usage per month; self-hosted, you can add your own API keys instead.",
    },
  ],
  related: ["geo-teams", "pr-brand-teams", "agencies"],
  cta: {
    title: "Plan your next piece around real AI answers",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies SolutionPage;
