import type { IntegrationCategoryPage } from "../../types";

export default {
  slug: "search-console",
  nav: "Search Console integrations",
  summary: "Turn Google Search Console and Bing queries into AI prompts, tasks and opportunities.",
  meta: {
    title: "Search Console Integration: Google & Bing",
    description:
      "Search Console integration for Google and Bing: find AI-style prompts in your search queries, score striking-distance pages and inspect URLs inside AutoSEO.",
  },
  hero: {
    eyebrow: "Search Console integrations",
    title: "Search Console data, read for AI search.",
    muted: "From Google and Bing.",
    subtitle:
      "Connect Google Search Console and Bing Webmaster Tools and AutoSEO imports your queries, pages and countries every day — then flags the long, conversational queries that look like AI prompts, so you know what to track next.",
  },
  benefits: {
    eyebrow: "What you get",
    title: "More than a copy",
    muted: "of your Search Console.",
    items: [
      {
        icon: "message-square",
        title: "AI-style prompts in your queries",
        body: "Long, question-like queries are flagged as prompts and sorted by intent — recommend, information, comparison or action. Add them to AI visibility tracking in one click.",
      },
      {
        icon: "target",
        title: "Striking-distance pages",
        body: "Pages ranking at positions 4–20 are scored by impressions, business value from GA4 and distance to the top, so you work on the ones closest to paying off.",
      },
      {
        icon: "list-checks",
        title: "Tasks from your search data",
        body: "Conversational queries you don't track yet and pages with impressions but weak snippets become prioritized, evidence-backed tasks.",
      },
      {
        icon: "search",
        title: "URL inspection",
        body: "Check a page's index status with Google's URL Inspection API without leaving AutoSEO. Earlier results are kept as history.",
      },
    ],
  },
  faq: [
    {
      q: "How do I connect Google Search Console to AutoSEO?",
      a: "Open Integrations in your project, connect Google Search Console with your Google account and choose the property. On AutoSEO Cloud, the Google OAuth client is managed by the Codext team for the shared app; when you self-host, an admin sets it up once under Admin → Data Providers. The first import starts right away, and data syncs daily after that.",
    },
    {
      q: "Can I connect Bing Webmaster Tools?",
      a: "Yes. Enter the site URL exactly as it's registered in Bing Webmaster Tools and an API key from its Settings → API access page. When you self-host, an admin can also set one key for the whole instance. Bing data appears in the same Search Console view, next to Google's.",
    },
    {
      q: "How does AutoSEO find AI prompts in Search Console data?",
      a: "Queries with many words or that start like a question — how, what, which, best — are flagged as conversational. With an AI provider configured, AutoSEO also classifies each query's intent. Filter the list to AI prompts and add the ones you want to your tracked prompts.",
    },
    {
      q: "What are striking-distance keywords?",
      a: "Queries and pages that rank just below the top positions, where a small improvement brings noticeably more clicks. AutoSEO lists pages at positions 4–20 and, with GA4 connected, scores them by impressions, conversion rate and distance to the top.",
    },
    {
      q: "How much Search Console history does AutoSEO keep?",
      a: "Up to 16 months of daily search data per property. The first sync backfills that history, and later syncs add the newest days.",
    },
    {
      q: "Is the Search Console integration free?",
      a: "Yes. The Google Search Console and Bing Webmaster Tools integrations are part of the open-source app and free to self-host. AutoSEO Cloud includes both in a managed workspace for $50 per month, with $10 of AI and data usage included.",
    },
  ],
  cta: {
    title: "Find the prompts hiding in your search data",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationCategoryPage;
