import type { FeaturePage } from "../../types";

export default {
  slug: "ai-content-optimization",
  nav: "AI content optimization",
  summary: "Research, draft and score content that AI engines can quote, then publish it to your CMS.",
  meta: {
    title: "AI Content Optimization for ChatGPT & Co.",
    description:
      "AI content optimization with web-researched briefs, expert drafts and a six-pillar AEO score. Rewrite existing pages and publish to WordPress or Webflow.",
  },
  hero: {
    eyebrow: "AI content optimization",
    title: "Optimize content for AI answers.",
    muted: "From brief to published page.",
    subtitle:
      "AutoSEO researches a topic on the web, writes a brief, drafts the article in an expert's voice with inline sources, adds FAQs, entities and JSON-LD, and scores the result on six answer-engine pillars. Existing pages get the same score and a rewrite. When a piece is ready, publish it to WordPress, Webflow or Framer.",
  },
  visual: "content",
  stats: [
    { value: 6, label: "AEO pillars", note: "Extractability to metadata" },
    { value: 7, label: "Content formats", note: "Guides, comparisons, FAQs …" },
    { value: 3, label: "CMS destinations", note: "WordPress, Webflow, Framer" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "MIT licensed, every feature" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "AI engines quote passages,",
    muted: "not pages.",
    body: "An answer engine lifts a sentence, a number or a list from a page and cites the source. Content that buries the answer, lacks specifics or has no clear structure gets passed over — even when it ranks.",
    points: [
      {
        title: "Direct answers get extracted",
        body: "Self-contained answers under question-style headings are easy for a model to lift and attribute to you.",
      },
      {
        title: "Facts beat filler",
        body: "Specific numbers, named entities and cited sources make a passage worth quoting. Vague copy gives an engine nothing to cite.",
      },
      {
        title: "Structure and schema help machines",
        body: "Clear headings, lists, tables and valid JSON-LD tell crawlers what a page covers and which part answers which question.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What you get",
    title: "From topic to published page,",
    muted: "in one editor.",
    items: [
      {
        icon: "search",
        title: "Web-researched briefs",
        body: "Audience, intent, angle, key takeaways, an outline phrased as questions, entities and current sources found with web search.",
      },
      {
        icon: "pen",
        title: "Drafts in an expert's voice",
        body: "Answer articles, guides, comparisons, best-of lists, how-tos, FAQ and product pages from 500 to 3,500 words, written from an expert persona or your brand voice.",
      },
      {
        icon: "gauge",
        title: "Live AEO score",
        body: "Extractability, fact density, structure, schema markup, depth and metadata, scored from 0 to 100 while you edit.",
      },
      {
        icon: "code",
        title: "FAQs, entities and JSON-LD",
        body: "Generate FAQs, extract entities, write meta titles and descriptions, and build Article, BlogPosting or HowTo schema with FAQs.",
      },
      {
        icon: "refresh",
        title: "Optimize existing pages",
        body: "Enter a URL: AutoSEO fetches the page, scores it on the same six pillars and suggests or drafts a rewrite.",
      },
      {
        icon: "download",
        title: "Publish or export",
        body: "Save drafts or publish to WordPress with JSON-LD and Yoast or Rank Math meta, create Webflow and Framer CMS items, or export Markdown, HTML and CSV.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From question to citable page",
    muted: "in four steps.",
    items: [
      {
        title: "Pick the question to answer",
        body: "Start from a content task or your own topic. Choose the format, language, length and an expert persona.",
      },
      {
        title: "Research and draft",
        body: "AI finds sources, builds the brief and writes the draft, grounded in your brand profile, products and personas from Brand Knowledge.",
      },
      {
        title: "Score and refine",
        body: "Edit in Markdown with a live AEO score, generate FAQs and meta data, and move the piece from draft to review.",
      },
      {
        title: "Publish and measure",
        body: "Send it to WordPress or Webflow, or export it — then watch in AI visibility tracking whether engines start citing the page.",
      },
    ],
  },
  faq: [
    {
      q: "What is AI content optimization?",
      a: "AI content optimization means writing and structuring pages so AI answer engines can understand, quote and cite them. That includes direct answers, specific facts with sources, a clear heading structure, structured data and accurate metadata. AutoSEO measures these properties with an AEO score and helps you improve them.",
    },
    {
      q: "What is an AEO score?",
      a: "The AEO (answer-engine optimization) score rates content from 0 to 100 on six pillars: extractability 20, fact density 20, structure 15, schema markup 15, depth 15 and metadata 15. Pieces scoring 87 or more are rated “Primary Source”, 70–86 “Strong”, 50–69 “Needs work” and below 50 “Weak”.",
    },
    {
      q: "How does AutoSEO avoid made-up sources?",
      a: "The brief step uses web search and keeps only real URLs it found. The draft is instructed to cite only those sources, as inline links right after the facts they support. You review every draft before it's published.",
    },
    {
      q: "Can I optimize pages that already exist?",
      a: "Yes. Enter the URL, optionally with a target keyword and the question the page should answer. AutoSEO fetches the page, scores it on the six AEO pillars and suggests or drafts a rewrite you can edit and publish.",
    },
    {
      q: "Which CMS can I publish to?",
      a: "WordPress through the REST API with an application password, including JSON-LD and Yoast or Rank Math meta, Webflow CMS collections through an API token, and Framer CMS collections through the Framer Server API with a project API key. All three are in beta. Every draft can also be exported as Markdown, HTML or a CMS-ready CSV.",
    },
    {
      q: "Do I need an AI subscription?",
      a: "Not necessarily. On AutoSEO Cloud, drafting runs through the AI providers the Codext team has connected, with usage counting toward the $10 included each month, or on your own Claude Code or Codex through a local agent. When you self-host, connect a local agent or add your own API keys. Without AI you can still write in the editor with live AEO scoring.",
    },
    {
      q: "Is AI content optimization free?",
      a: "Content optimization is part of the open-source AutoSEO app and free to self-host with every feature; AI API usage is then billed by your provider. AutoSEO Cloud gives you a managed workspace for $50 per month with $10 of AI and data usage included.",
    },
  ],
  related: ["ai-seo-tasks", "prompt-research", "ai-citation-tracking", "query-fanout-analysis"],
  cta: {
    title: "Write the page AI engines want to quote",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
