import type { SolutionPage } from "../../types";

export default {
  slug: "e-commerce",
  nav: "For e-commerce",
  summary: "See which products AI recommends, which stores it cites and what AI search earns you.",
  meta: {
    title: "AI Search Visibility for E-Commerce",
    description:
      "See which products ChatGPT and Google AI Overviews recommend, which stores and guides they cite and how much revenue AI search drives. AI visibility for shops.",
  },
  hero: {
    eyebrow: "AutoSEO for e-commerce",
    title: "Get your products into AI shopping answers.",
    muted: "AI search visibility for e-commerce.",
    subtitle:
      "See which products ChatGPT, Google AI Overviews and nine more engines recommend, which stores, guides and reviews they rely on, and how many orders AI search really brings in.",
  },
  visual: "products",
  challenges: {
    eyebrow: "The challenge",
    title: "Shoppers ask AI what to buy.",
    muted: "The answer names a few products.",
    items: [
      {
        title: "The shortlist is in the answer",
        body: "AI assistants recommend a handful of products with prices, ratings and stores. If yours isn't among them, the shopper never sees it.",
      },
      {
        title: "Guides and reviews decide",
        body: "Engines lean on buying guides, test reports and retailers. Your own product pages are only part of the picture.",
      },
      {
        title: "Revenue you can't attribute",
        body: "Shoppers who researched in an AI assistant don't always show up as AI referrals in analytics, so the channel looks smaller than it is.",
      },
    ],
  },
  workflow: {
    eyebrow: "How e-commerce teams use AutoSEO",
    title: "From product prompt",
    muted: "to attributed order.",
    items: [
      {
        icon: "shopping-bag",
        title: "See which products AI recommends",
        body: "Every product in AI answers and shopping listings, with position, rating, prices by store and the prompts it appears for.",
        feature: "ai-shopping-visibility",
      },
      {
        icon: "store",
        title: "Know which stores and guides get cited",
        body: "Retailers, buying guides, test reports and forums engines rely on, grouped by source type, with a playbook to get listed.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "megaphone",
        title: "Watch ads in AI answers",
        body: "Which advertisers and ad creatives appear next to or inside AI answers for the products you sell.",
        feature: "ai-ads-tracking",
      },
      {
        icon: "file-text",
        title: "Write pages AI can quote",
        body: "Product, comparison and best-of pages scored for AI answers, with structured data, drafted from the prompts that matter.",
        feature: "ai-content-optimization",
      },
      {
        icon: "chart",
        title: "Measure AI referral traffic",
        body: "Sessions, conversions and revenue from ChatGPT, Perplexity, Gemini and more via GA4, Matomo or Piwik PRO.",
        feature: "ai-traffic-analytics",
      },
      {
        icon: "euro",
        title: "Attribute orders to AI search",
        body: "A Shopify pixel, WooCommerce, Shopware or Stripe plus a “How did you hear about us?” survey tie revenue to AI assistants.",
        feature: "ai-search-attribution",
      },
    ],
  },
  prompts: {
    eyebrow: "Example prompts",
    title: "Prompts shoppers ask AI",
    items: [
      "Best running shoes for flat feet under $150",
      "Which robot vacuum is best for pet hair?",
      "Is the Acme espresso machine worth the money?",
      "Where can I buy Acme headphones with free shipping?",
      "Acme vs. a cheaper alternative — what's the difference?",
      "Most comfortable office chair for back pain",
      "Gift ideas for a coffee lover under $50",
    ],
  },
  outcomes: {
    eyebrow: "Why e-commerce teams choose AutoSEO",
    title: "Win the product shortlist,",
    muted: "and prove the revenue.",
    items: [
      {
        title: "Know where each product stands",
        body: "Appearances, average position and engines per product, next to the brands AI recommends instead.",
      },
      {
        title: "A clear outreach list",
        body: "Buying guides, test sites and retailers that list competitors but not you, with next steps for each source type.",
      },
      {
        title: "Revenue, not just mentions",
        body: "Orders and revenue attributed to AI search next to referral traffic, so you can put a number on the channel.",
      },
    ],
  },
  faq: [
    {
      q: "How do I get my products recommended by ChatGPT?",
      a: "AI engines recommend products they find in trusted sources: buying guides, test reports, retailers, reviews and your own product pages. Track the prompts shoppers ask, see which products and sources win today, then close the gaps with better product content and outreach. AutoSEO gives you the data for each step.",
    },
    {
      q: "Can AutoSEO track products in ChatGPT shopping results?",
      a: "Yes. Through DataForSEO, AutoSEO captures the products ChatGPT and Google AI Overviews show as shopping listings, plus products any engine names in its answer text. For each product you see appearances, average position, rating, prices by store and the prompts it appears for.",
    },
    {
      q: "Can I import my product catalog?",
      a: "Yes. Connect a Google Merchant or Shopify product feed, upload a file or use the push API. Your products are matched against AI answers and used as context for prompt research and content.",
    },
    {
      q: "How do I measure revenue from AI search?",
      a: "Connect GA4, Matomo or Piwik PRO for AI referral sessions and revenue, and set up attribution with a Shopify pixel, WooCommerce, Shopware or Stripe. An optional “How did you hear about us?” survey with a follow-up question about the AI assistant captures buyers that analytics misses.",
    },
    {
      q: "Does AutoSEO track ads in AI answers?",
      a: "Yes. When Google AI Overviews, AI Mode, ChatGPT or Perplexity show sponsored results next to or inside an answer, AutoSEO records them through DataForSEO. You see top ads, top advertisers and the share of answers with ads.",
    },
    {
      q: "How much does AutoSEO cost for an online shop?",
      a: "The open-source edition is free to self-host with every feature; DataForSEO and AI provider usage is billed by those providers. AutoSEO Cloud costs $50 per workspace per month with up to 10 projects, unlimited users and $10 of AI and data usage included.",
    },
  ],
  related: ["customer-experience", "content-teams", "geo-teams"],
  cta: {
    title: "See which products AI recommends in your category",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies SolutionPage;
