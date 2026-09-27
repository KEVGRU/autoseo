import type { FeaturePage } from "../../types";

export default {
  slug: "ai-shopping-visibility",
  nav: "AI shopping visibility",
  summary: "Track the products AI engines recommend and show in shopping cards.",
  meta: {
    title: "AI Shopping Visibility: Track Products in ChatGPT",
    description:
      "AI shopping visibility: see which products ChatGPT shopping cards and Google AI Overviews show for your prompts, with prices, stores and competitor brands.",
  },
  hero: {
    eyebrow: "AI shopping visibility",
    title: "AI shopping visibility for your products.",
    muted: "See what AI puts in front of buyers.",
    subtitle:
      "AutoSEO captures the products AI engines name in their answers and the shopping cards they render — from the ChatGPT app to Google AI Overviews — with prices, ratings, stores and the brands behind them.",
  },
  visual: "products",
  stats: [
    { value: 4, label: "Engines with shopping data", note: "ChatGPT app, AI Overviews, AI Mode, Copilot" },
    { value: 16, label: "Engines for product mentions", note: "Products named in the answer text" },
    { value: 143, label: "Markets", note: "Prices and stores per country" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "MIT licensed, every feature" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "AI recommends products,",
    muted: "not just brands.",
    body: "Ask an assistant for the best running shoe or a quiet dishwasher and it answers with specific models, prices and places to buy. If your products aren't in that list, shoppers asking that question don't see them.",
    points: [
      {
        title: "Shopping cards come with the answer",
        body: "Rendered product listings show price, rating and store right next to the text, so buyers can compare before they visit any shop.",
      },
      {
        title: "Models matter, not only brands",
        body: "A brand can be visible while its best product is missing. Product-level data shows which models AI actually recommends.",
      },
      {
        title: "Stores shape the offer",
        body: "The seller behind a shopping card sets the price and availability buyers see. Knowing which stores AI shows helps you manage those listings.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What you can track",
    title: "Every product AI surfaces,",
    muted: "in one list.",
    items: [
      {
        icon: "shopping-bag",
        title: "Products in AI answers",
        body: "Products named in the answer text and products in rendered shopping listings, unified into one list with appearances and changes over time.",
      },
      {
        icon: "chart",
        title: "Prices, ratings and reviews",
        body: "Current and previous price, currency, rating and review count as shown in the shopping card.",
      },
      {
        icon: "store",
        title: "Stores and sellers",
        body: "Which stores AI shows products from, with appearances, share, product count and average price, plus prices by store for each product.",
      },
      {
        icon: "swords",
        title: "Brands behind the products",
        body: "Whose products AI recommends most, with product count, mentions, sentiment and share, matched to your brand and your tracked competitors.",
      },
      {
        icon: "list-checks",
        title: "Product attributes",
        body: "Key facts an answer states about a product, such as price or capacity, extracted from the text.",
      },
      {
        icon: "search",
        title: "Prompts and engines",
        body: "For each product: the prompts and engines it appears in, recent appearances and a trend over time.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From shopping prompt to product data",
    muted: "in three steps.",
    items: [
      {
        title: "Track buying prompts",
        body: "Add the product questions shoppers ask and enable the ChatGPT app, Google AI Overviews, AI Mode or Copilot through DataForSEO.",
      },
      {
        title: "AutoSEO extracts the products",
        body: "Shopping cards are parsed with price, rating and store. An AI pass adds products named in the answer text and matches brands to you and your competitors.",
      },
      {
        title: "Compare and act",
        body: "See which models, prices and stores show up in the answer, filter by engine and tag, and export the product list to CSV.",
      },
    ],
  },
  faq: [
    {
      q: "What is AI shopping visibility?",
      a: "AI shopping visibility measures how often your products appear when AI assistants answer buying questions, either named in the text or shown as a card with price and store. AutoSEO tracks both for your prompts and compares your products with your competitors'.",
    },
    {
      q: "How do I track my products in ChatGPT shopping results?",
      a: "Add product-related prompts to the tracker and enable the ChatGPT app engine through DataForSEO. AutoSEO stores the product cards ChatGPT renders, with price, rating, reviews and store, and lists every product on the Products page.",
    },
    {
      q: "Which AI engines show shopping results?",
      a: "AutoSEO captures shopping listings from the ChatGPT app and from Google AI Overviews, Google AI Mode and Microsoft Copilot results via DataForSEO. Products named in the answer text are extracted from every tracked engine by the AI analysis pass.",
    },
    {
      q: "Can I see competitor products and prices?",
      a: "Yes. Products are linked to their brand where possible, so you can filter by brand and see whose products AI recommends most. The product detail shows prices by store and how often each product appeared.",
    },
    {
      q: "Do I need to upload my product catalog?",
      a: "No. Product tracking works from the AI answers themselves. Products are matched to your brand and your competitors by brand name and alternative spellings.",
    },
    {
      q: "Why does a product show up without a price?",
      a: "Prices, ratings and stores come from rendered shopping cards. Products that were only named in the answer text have no listing data, and AutoSEO marks them as LLM mentions.",
    },
    {
      q: "Is AI shopping visibility tracking free?",
      a: "Product tracking is part of the open-source AutoSEO app and free to self-host; shopping data then comes from your own DataForSEO account, which bills its usage directly. AutoSEO Cloud gives you a managed workspace for $50 per month with $10 of AI and data usage included.",
    },
  ],
  related: ["ai-ads-tracking", "ai-competitor-analysis", "ai-brand-sentiment", "ai-visibility-tracking"],
  cta: {
    title: "See which products AI recommends to your buyers",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
