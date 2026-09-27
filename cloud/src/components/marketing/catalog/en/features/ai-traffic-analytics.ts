import type { FeaturePage } from "../../types";

export default {
  slug: "ai-traffic-analytics",
  nav: "AI traffic analytics",
  summary: "See how many visitors ChatGPT, Perplexity and Gemini send you, and what they convert.",
  meta: {
    title: "AI Traffic Analytics: Visitors from ChatGPT & Co.",
    description:
      "Measure AI traffic from ChatGPT, Perplexity, Gemini and Claude with GA4, Matomo or Piwik PRO: sessions, conversions and revenue per AI platform. Open source.",
  },
  hero: {
    eyebrow: "AI traffic analytics",
    title: "Measure the AI traffic that reaches your site.",
    muted: "Down to the conversion.",
    subtitle:
      "Connect Google Analytics 4, Matomo or Piwik PRO and AutoSEO picks out every session referred by ChatGPT, Perplexity, Gemini, Claude, Copilot and 15 more AI platforms — with landing pages, conversions and revenue. Search Console and Bing Webmaster Tools show which of your search queries already read like AI prompts.",
  },
  visual: "traffic",
  stats: [
    { value: 20, label: "AI platforms detected", note: "ChatGPT to Character.AI" },
    { value: 3, label: "Analytics tools", note: "GA4, Matomo, Piwik PRO" },
    { value: 16, label: "Months of history", note: "Imported on the first sync" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "MIT licensed, every feature" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "Visibility is half the story.",
    muted: "Clicks show whether it pays off.",
    body: "Being named in AI answers matters most when people click through and buy. Standard analytics reports file that traffic under referral or direct, so the channel never shows up in the numbers your team reports on.",
    points: [
      {
        title: "AI referrals hide in referral reports",
        body: "Visitors from AI assistants arrive under dozens of hostnames and utm_source values. AutoSEO maps each session to one AI platform, so the channel adds up.",
      },
      {
        title: "Each platform sends different visitors",
        body: "One assistant may send readers to your blog while another sends buyers straight to pricing. Numbers per platform show where the value is.",
      },
      {
        title: "Search queries are turning into prompts",
        body: "Long, question-style queries in Search Console preview what people ask AI. Spotting them early tells you which prompts are worth tracking.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What you get",
    title: "Every AI visitor, from referral to revenue,",
    muted: "in one report.",
    items: [
      {
        icon: "chart",
        title: "Sessions, conversions and revenue",
        body: "Daily or monthly AI-referred sessions with conversions and revenue, compared with the previous period and split by platform.",
      },
      {
        icon: "bot",
        title: "20 AI platforms recognized",
        body: "ChatGPT, Perplexity, Gemini, Claude, Copilot, Meta AI, DeepSeek, Grok, Mistral Le Chat and more, detected from session source or referrer.",
      },
      {
        icon: "workflow",
        title: "Model → page → outcome flow",
        body: "Follow visitors from each AI platform to the pages they land on and on to sessions, conversions, conversion rate or page intent.",
      },
      {
        icon: "globe",
        title: "Landing pages, countries, engagement",
        body: "Tables by URL, country and platform with engagement rate, average time, conversion rate and revenue — filterable by AI platform.",
      },
      {
        icon: "search",
        title: "Search Console insights",
        body: "Queries, pages and countries from Google Search Console and Bing Webmaster Tools, with a filter for queries that read like AI prompts.",
      },
      {
        icon: "target",
        title: "Opportunities and URL inspection",
        body: "Pages ranking on positions 4–20 scored with GA4 engagement data, plus Google's index status, canonical and rich results for any URL.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From analytics login to an AI channel report",
    muted: "in three steps.",
    items: [
      {
        title: "Connect your analytics",
        body: "Sign in with Google and pick your GA4 property, or add Matomo or Piwik PRO with API credentials. A health check flags GA4 setups that can't measure conversions.",
      },
      {
        title: "AutoSEO imports and classifies",
        body: "The first sync imports up to 16 months of AI-referred sessions, then data updates daily. Every session is assigned to an AI platform.",
      },
      {
        title: "Compare platforms and act",
        body: "Filter by platform, drill into landing pages and connect Search Console to find the queries that already look like prompts.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track traffic from ChatGPT in Google Analytics 4?",
      a: "Connect GA4 to AutoSEO with your Google account and choose the property. AutoSEO reads sessions through the GA4 Data API and assigns every session whose source points to ChatGPT, such as chatgpt.com or utm_source=chatgpt, to the ChatGPT platform. You don't need to build a custom channel group.",
    },
    {
      q: "Which AI platforms does AutoSEO detect?",
      a: "ChatGPT, Perplexity, Google Gemini, Claude, Microsoft Copilot, Meta AI, DeepSeek, Grok, Mistral Le Chat, You.com, Phind, Poe, Duck.ai, HuggingChat, Pi, Kagi Assistant, Qwen, Kimi, Sabiá and Character.AI. Each is recognized by its domains and common utm_source values.",
    },
    {
      q: "Does it work with Matomo or Piwik PRO?",
      a: "Yes. Connect a self-hosted or cloud Matomo with a read-only auth token, or Piwik PRO with API client credentials. AI-referred visits from every source are stored in the same format, so the reports look the same whichever tool you use.",
    },
    {
      q: "Can I see revenue from AI traffic?",
      a: "Yes. Conversions and revenue come from your analytics tool and are shown per AI platform, landing page and country. For deals and orders where the AI influence never produced a click, use AI search attribution, which asks buyers directly.",
    },
    {
      q: "How far back does the data go?",
      a: "The first sync imports up to 16 months of history. After that, AutoSEO syncs once a day and keeps a rolling 16-month window.",
    },
    {
      q: "What are AI prompts in Search Console?",
      a: "They are search queries that look like something a person would type into ChatGPT: long, conversational or phrased as a question. AutoSEO flags them in your Google Search Console and Bing Webmaster Tools data and labels their intent, so you can add the best ones to AI visibility tracking.",
    },
    {
      q: "Is AI traffic analytics free?",
      a: "AI traffic analytics is part of the open-source AutoSEO app and free to self-host with every feature. AutoSEO Cloud gives you a managed workspace for $50 per month with $10 of AI and data usage included. Connecting Google Analytics, Matomo, Piwik PRO or Search Console costs nothing extra.",
    },
  ],
  related: ["ai-search-attribution", "ai-bot-traffic", "ai-visibility-tracking", "report-builder"],
  cta: {
    title: "Find out how much traffic AI already sends you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
