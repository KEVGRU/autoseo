import type { IntegrationCategoryPage } from "../../types";

export default {
  slug: "cms",
  nav: "CMS integrations",
  summary: "Publish AI-optimized drafts to WordPress, Webflow and Framer, as drafts or live.",
  meta: {
    title: "CMS Integrations for AI-Optimized Content",
    description:
      "CMS integrations for WordPress, Webflow and Framer: publish AI-optimized drafts from AutoSEO with title, slug and SEO fields — as a draft for review or live.",
  },
  hero: {
    eyebrow: "CMS integrations",
    title: "Publish AI-ready content to your CMS.",
    muted: "Without copy and paste.",
    subtitle:
      "AutoSEO turns visibility gaps into briefs and drafts. Connect WordPress, Webflow or Framer to publish them with title, slug, meta description and body — as a draft for your editors or straight to live. Framer also gets a CMS-ready export that works without an API key.",
  },
  benefits: {
    eyebrow: "Why connect your CMS",
    title: "From visibility gap to published page",
    muted: "in one workflow.",
    items: [
      {
        icon: "file-text",
        title: "Drafts written for AI answers",
        body: "Briefs and drafts start from the prompts, sources and questions where you're missing, and get an answer-engine score before you publish.",
      },
      {
        icon: "code",
        title: "Metadata and markup included",
        body: "Meta title, description and the FAQ section travel with the article. WordPress posts also carry the draft's JSON-LD and Yoast or Rank Math fields.",
      },
      {
        icon: "pen",
        title: "Editors stay in control",
        body: "Send an article as a draft and review, edit and schedule it in your CMS as usual — or publish it live when it's ready.",
      },
      {
        icon: "refresh",
        title: "Update instead of duplicate",
        body: "Revise a draft after the next tracking run and push the change to the same WordPress post or Webflow or Framer collection item.",
      },
    ],
  },
  faq: [
    {
      q: "Which CMS platforms does AutoSEO integrate with?",
      a: "WordPress, Webflow and Framer publish directly; all three integrations are in beta. For Framer, AutoSEO writes into a CMS collection through the Framer Server API and also offers a CMS-ready CSV, Markdown or HTML export. Publishing to a Shopify blog is coming soon.",
    },
    {
      q: "How do I publish AutoSEO content to WordPress?",
      a: "Create an application password in WordPress, then connect your site under Optimizations → Content with the site URL, username and password. AutoSEO publishes through the built-in REST API, so no plugin is needed. You choose per article whether it goes out as a draft or a live post.",
    },
    {
      q: "How does the Webflow integration work?",
      a: "Generate a Webflow API token with CMS read and write and Sites read access, then pick the collection for your articles. AutoSEO fills the name, slug, rich-text body, summary and SEO title fields it finds. Add Sites write access to publish items live instead of saving them as drafts.",
    },
    {
      q: "Can I use AutoSEO with Framer?",
      a: "Yes. Create an API key in your Framer project under Site settings → API Keys, connect it with the project URL and pick one of your own CMS collections. AutoSEO writes each draft into it through the Framer Server API — as a draft item, or live, which publishes the whole site. Without a key, export a CSV with title, slug, content, meta fields and FAQ, or Markdown and HTML.",
    },
    {
      q: "Is Shopify supported as a CMS?",
      a: "Publishing articles to a Shopify blog is coming soon. Shopify already works for attribution today: a custom pixel ties orders and revenue to AI search.",
    },
    {
      q: "Where are my CMS credentials stored?",
      a: "Encrypted with AES-256-GCM in AutoSEO's database — on your own server when you self-host, or in AutoSEO Cloud, hosted in Germany. Tokens and application passwords are never sent back to the browser and are only used to call your CMS.",
    },
    {
      q: "Are the CMS integrations free?",
      a: "Yes. They're part of the open-source app and free to self-host; AI usage for drafts is then billed by your AI provider or runs on your Claude Code or Codex subscription through a local agent. AutoSEO Cloud costs $50 per month per workspace with $10 of AI and data usage included, and you can connect your own local agent there too.",
    },
  ],
  cta: {
    title: "Turn visibility gaps into published pages",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationCategoryPage;
