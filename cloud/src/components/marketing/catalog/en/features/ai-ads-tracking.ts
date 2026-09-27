import type { FeaturePage } from "../../types";

export default {
  slug: "ai-ads-tracking",
  nav: "AI ads tracking",
  summary: "See which ads appear with AI answers for your prompts, and who runs them.",
  meta: {
    title: "AI Ads Tracking: Ads in ChatGPT & AI Overviews",
    description:
      "AI ads tracking: see which sponsored placements appear in ChatGPT and Google AI Overviews for your prompts, who advertises, with which creatives and how often.",
  },
  hero: {
    eyebrow: "AI ads tracking",
    title: "AI ads tracking for answer engines.",
    muted: "See who pays to be next to the answer.",
    subtitle:
      "AutoSEO records the sponsored placements engines show with their answers — in the ChatGPT app, Google AI Overviews, AI Mode and Copilot results — with advertiser, headline, landing page and how often each ad appears.",
  },
  visual: "products",
  stats: [
    { value: 4, label: "Engines with ad data", note: "ChatGPT app, AI Overviews, AI Mode, Copilot" },
    { value: 4, label: "Ad metrics", note: "Appearances, ads, advertisers, answers with ads" },
    { value: 143, label: "Markets", note: "Ads per country and language" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "MIT licensed, every feature" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "AI answers can carry ads.",
    muted: "Organic visibility is only half the picture.",
    body: "Where an AI answer comes with sponsored results, a competitor can appear right next to your organic mention — or in place of it. Tracking ads alongside answers shows who pays for attention on the questions you care about.",
    points: [
      {
        title: "Competitors can buy the spot",
        body: "A rival's ad next to an answer that recommends you can still take the click. You only notice it if you look at the whole result.",
      },
      {
        title: "Creatives reveal positioning",
        body: "Headlines and descriptions show which messages and offers competitors push for each topic.",
      },
      {
        title: "Paid and organic belong together",
        body: "Seeing ads next to mentions, citations and products shows where paid placements fill gaps and where organic visibility already covers you.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What you can track",
    title: "Every ad next to an AI answer,",
    muted: "and who's behind it.",
    items: [
      {
        icon: "megaphone",
        title: "Ad appearances",
        body: "How often sponsored placements appear for your prompts and how many answers carry ads, with changes against the previous period.",
      },
      {
        icon: "building",
        title: "Top advertisers",
        body: "Who advertises most, with number of ads, appearances and share, and badges for your own brand and tracked competitors.",
      },
      {
        icon: "eye",
        title: "Ad creatives",
        body: "Headline, description, image and landing page of each ad, deduplicated so the same creative is counted once.",
      },
      {
        icon: "trending-up",
        title: "Rank and rating",
        body: "The average position of each ad among the sponsored results, and its rating where the engine shows one.",
      },
      {
        icon: "bot",
        title: "Engines and answers",
        body: "Which engines show an ad, how often it appeared over time and the prompts and answers it appeared with.",
      },
      {
        icon: "search",
        title: "Filters and search",
        body: "Slice ads by period, engine and prompt tag, or search by advertiser and headline.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From tracked prompt to ad overview",
    muted: "in three steps.",
    items: [
      {
        title: "Track commercial prompts",
        body: "Add the buying and comparison questions your market asks, and enable engines that return ads through DataForSEO.",
      },
      {
        title: "AutoSEO captures every placement",
        body: "Sponsored results are stored with advertiser, headline, landing page and position, and matched to your domain and your competitors'.",
      },
      {
        title: "Compare paid and organic",
        body: "Read each ad next to the answer it appeared with, and compare advertisers with your competitor ranking.",
      },
    ],
  },
  faq: [
    {
      q: "What is AI ads tracking?",
      a: "AI ads tracking records the paid placements that appear with AI-generated answers, such as sponsored results in the ChatGPT app or ads in Google AI Overviews. AutoSEO shows who advertises for your prompts, with which creatives and how often.",
    },
    {
      q: "How do I see ads in ChatGPT answers?",
      a: "Enable the ChatGPT app engine through DataForSEO and track your prompts. When the rendered ChatGPT answer includes sponsored placements, AutoSEO stores them with advertiser, headline and landing page and lists them on the Ads page.",
    },
    {
      q: "Which AI engines are tracked for ads?",
      a: "Ads are captured from the ChatGPT app, Google AI Overviews, Google AI Mode and Microsoft Copilot results, all via DataForSEO. For AI Overviews and Copilot this includes the search ads shown on the same results page.",
    },
    {
      q: "Can I see which competitors advertise in AI answers?",
      a: "Yes. Advertisers are matched to your domain and your tracked competitors by domain and brand name, and marked in the advertiser ranking. Advertisers you don't track are listed too, so you see everyone who advertises on your prompts.",
    },
    {
      q: "How are duplicate ads counted?",
      a: "An ad is identified by advertiser, headline and landing page, with tracking parameters removed from the URL. Every further appearance counts toward the same ad, so the numbers show reach instead of duplicates.",
    },
    {
      q: "Do I need DataForSEO for AI ads tracking?",
      a: "Yes. Ads come from the rendered results DataForSEO returns for the ChatGPT app, Google and Bing. On AutoSEO Cloud, AI and data features run through the providers the Codext team has connected; usage counts toward the $10 included each month. When you self-host, you connect your own DataForSEO account, and AutoSEO logs every paid call so admins can set spending limits.",
    },
    {
      q: "Is AI ads tracking free?",
      a: "Ad tracking is part of the open-source AutoSEO app and free to self-host; DataForSEO usage is then billed by DataForSEO. AutoSEO Cloud gives you a managed workspace for $50 per month with $10 of AI and data usage included.",
    },
  ],
  related: ["ai-shopping-visibility", "ai-competitor-analysis", "ai-visibility-tracking", "ai-citation-tracking"],
  cta: {
    title: "See who advertises next to AI answers in your market",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
