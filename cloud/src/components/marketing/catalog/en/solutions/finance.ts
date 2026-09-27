import type { SolutionPage } from "../../types";

export default {
  slug: "finance",
  nav: "For financial services",
  summary: "See how AI describes your financial products and flag claims that contradict your terms.",
  meta: {
    title: "AI Visibility for Financial Services & Fintech",
    description:
      "Track how ChatGPT, Gemini and Perplexity describe your banking, insurance or fintech products and check their claims against your own terms. Self-host free.",
  },
  hero: {
    eyebrow: "AutoSEO for financial services",
    title: "AI visibility for financial services.",
    muted: "Tracked, sourced and fact-checked.",
    subtitle:
      "Banks, insurers and fintechs are compared in AI answers every day. AutoSEO tracks those answers across 16 AI engines, shows which sources they rely on and checks what they claim about your products against your own terms and product documents.",
  },
  visual: "factcheck",
  challenges: {
    eyebrow: "The challenge",
    title: "People ask AI about money.",
    muted: "The answers aren't always right.",
    items: [
      {
        title: "Comparisons happen without you",
        body: "“Best savings account” or “cheapest car insurance” is now a question for an assistant. If the answer doesn't name you, you aren't on the shortlist.",
      },
      {
        title: "Old fees and rates live on",
        body: "AI engines quote conditions from comparison sites, old pages and forum posts. A fee you changed months ago can still show up in answers today.",
      },
      {
        title: "Security rules can block AI crawlers",
        body: "Strict firewall and bot settings can keep AI crawlers away from your product pages, so engines fall back to what third parties say about you.",
      },
    ],
  },
  workflow: {
    eyebrow: "How financial brands use AutoSEO",
    title: "From monitoring to correction,",
    muted: "one workflow.",
    items: [
      {
        icon: "radar",
        title: "Track product prompts by market",
        body: "Run prompts about accounts, cards, loans and policies in every market you serve, daily or weekly across 16 engines.",
        feature: "ai-visibility-tracking",
      },
      {
        icon: "shield-check",
        title: "Fact-check what AI claims",
        body: "Upload your terms, fee schedules or product sheets. AutoSEO compares every AI statement about a product with them and flags deviations by severity.",
        feature: "ai-fact-check",
      },
      {
        icon: "link",
        title: "See which sources shape answers",
        body: "Comparison sites, reviews, news or forums: every cited URL by source type, and where competitors are listed and you aren't.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "swords",
        title: "Benchmark against competitors",
        body: "Share of voice, average position and head-to-head results against the banks, insurers and fintechs AI names next to you.",
        feature: "ai-competitor-analysis",
      },
      {
        icon: "bot",
        title: "Check AI crawler access",
        body: "Test robots.txt, firewall responses, rendering and llms.txt for the major AI crawlers before a blocked bot costs you citations.",
        feature: "ai-crawlability",
      },
      {
        icon: "heart",
        title: "Monitor tone and trust themes",
        body: "See what AI engines praise and criticize about you and your competitors — such as fees, service or the app.",
        feature: "ai-brand-sentiment",
      },
    ],
  },
  prompts: {
    eyebrow: "Example prompts",
    title: "Prompts financial brands track",
    items: [
      "Best free checking account for freelancers",
      "Which credit card has no foreign transaction fees?",
      "Acme Bank vs. a neobank — which is better for everyday banking?",
      "Is Acme Insurance good at paying out claims?",
      "What are the fees for Acme's investing app?",
      "Most reliable online broker for beginners",
      "Which banks offer a good business account for startups?",
    ],
  },
  outcomes: {
    eyebrow: "Why financial brands choose AutoSEO",
    title: "Evidence your teams can act on,",
    muted: "hosted on your terms.",
    items: [
      {
        title: "Deviations with evidence",
        body: "Every finding shows the AI quote, the matching passage from your document, the engine, the market and how often it was seen.",
      },
      {
        title: "Self-hosted or hosted in Germany",
        body: "Self-host AutoSEO on your own servers for full control over your data, or use an AutoSEO Cloud workspace hosted in Germany.",
      },
      {
        title: "Ready for internal review",
        body: "Roles, per-project access and CSV exports make it easy to share findings with legal, compliance and product teams.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track what ChatGPT says about my bank?",
      a: "Add the prompts your customers ask — about accounts, cards, loans or insurance — choose markets and engines, and AutoSEO runs them on a daily, weekly or monthly schedule. Every answer is stored, so you can see whether your brand is mentioned, cited or recommended, and how that changes over time.",
    },
    {
      q: "Can AutoSEO detect wrong fees or rates in AI answers?",
      a: "Yes, as long as you provide the reference. Upload your fee schedule, terms or product sheet as a PDF, URL or text, and the fact check compares every statement AI engines make about the product with it. Deviations are marked as contradicted, unsupported or outdated, with a severity and quotes from both sides.",
    },
    {
      q: "Does AutoSEO replace a compliance review?",
      a: "No. AutoSEO shows what AI engines say about your products and where it differs from your own documents. Deciding how to respond, and reviewing content before it is published, stays with your team.",
    },
    {
      q: "Can we self-host AutoSEO on our own infrastructure?",
      a: "Yes. AutoSEO is open source under the MIT license and runs on your own servers with the one-line installer, Docker Compose or Coolify. Tracking data, reference documents and findings stay on your infrastructure; only requests to the AI and data providers you configure leave it.",
    },
    {
      q: "Which security features does AutoSEO include?",
      a: "Passwordless magic-link sign-in, Owner, Admin, Member and Client roles with per-project access, secrets encrypted with AES-256-GCM, and GDPR export and erasure. When you self-host, the admin panel adds an audit log of sign-ins, role changes and settings changes.",
    },
    {
      q: "Why don't AI engines cite our product pages?",
      a: "Sometimes the pages aren't reachable for AI crawlers — because of a firewall rule, a robots.txt block or content that only renders with JavaScript. AutoSEO's crawlability check tests each of these for the major AI bots, and the sources view shows which third-party pages engines cite instead.",
    },
    {
      q: "How much does AutoSEO cost for a financial services company?",
      a: "Self-hosting is free with every feature and no limits. AutoSEO Cloud costs $50 per workspace per month plus VAT, for business customers, with unlimited users, up to 10 projects and $10 of AI and data usage included each month. When you self-host, third-party usage such as DataForSEO or AI API keys is billed by those providers.",
    },
  ],
  related: ["pharma", "pr-brand-teams", "customer-experience"],
  cta: {
    title: "Find out what AI tells your customers about your products",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition on your own infrastructure for free.",
  },
} satisfies SolutionPage;
