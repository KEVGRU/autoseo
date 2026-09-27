import type { IntegrationPage } from "../../types";

export default {
  slug: "bing-webmaster-tools",
  name: "Bing Webmaster Tools",
  nav: "Bing Webmaster Tools",
  summary: "Bring Bing queries and pages into AutoSEO and find AI-style prompts in them.",
  meta: {
    title: "Bing Webmaster Tools Integration for GEO",
    description:
      "Connect Bing Webmaster Tools to AutoSEO with an API key, import Bing queries and pages daily and find the AI-style prompts people search for on Bing.",
  },
  hero: {
    subtitle:
      "Connect Bing Webmaster Tools with an API key and see your Bing queries, pages, clicks and impressions next to Google — including the conversational queries worth tracking in AI search.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Bing Webmaster Tools integration",
    items: [
      "Bing queries and pages with clicks, impressions and average position",
      "Daily clicks and impressions for the whole site",
      "AI-style prompts and intent labels, just like for Google Search Console",
      "A Google / Bing switch in the Search Console section of your project",
      "Add any Bing query to AI visibility tracking with one click",
      "Synced daily with a per-project API key",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Bing Webmaster Tools and AutoSEO",
    items: [
      {
        icon: "search",
        title: "See the search engine behind Copilot",
        body: "Bing also powers Copilot's search results, so your Bing queries and positions are worth watching next to Google.",
      },
      {
        icon: "message-square",
        title: "Find prompts in Bing queries",
        body: "Conversational and question-like Bing queries are flagged as AI prompts and can be tracked in AI visibility with one click.",
      },
      {
        icon: "layers",
        title: "Compare Google and Bing",
        body: "Switch between Google and Bing in the same views to see where queries and pages differ.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Bing in three steps,",
    muted: "with an API key.",
    items: [
      {
        title: "Create an API key",
        body: "In Bing Webmaster Tools, open Settings → API access and create an API key for the account that has your site verified.",
      },
      {
        title: "Enter site URL and key",
        body: "In your project, open Analytics → Search Console → Settings with the Bing source, or Integrations → Bing Webmaster Tools. Enter the site URL exactly as it's registered in Bing and the API key.",
      },
      {
        title: "Test and sync",
        body: "AutoSEO checks that the site belongs to the account behind the key, then imports your queries and pages and syncs daily.",
      },
    ],
  },
  faq: [
    {
      q: "How do I connect Bing Webmaster Tools to AutoSEO?",
      a: "Create an API key under Settings → API access in Bing Webmaster Tools, then enter it together with your site URL in the project's Search Console settings or on the Integrations page. AutoSEO verifies that the site is in that Bing account before the first sync.",
    },
    {
      q: "Why should I track Bing for AI visibility?",
      a: "Bing powers Copilot's search results, and the queries people type into Bing show how they phrase questions. AutoSEO flags the conversational ones so you can track them as prompts.",
    },
    {
      q: "What doesn't Bing provide compared to Google Search Console?",
      a: "Bing reports no countries and has no URL Inspection API, and its data doesn't support the query-by-page view that Search Opportunities need. Those views stay Google-only.",
    },
    {
      q: "Do I need my own Bing API key?",
      a: "On AutoSEO Cloud, yes — every project uses its own key. On a self-hosted instance, an admin can also store an instance-wide key under Admin → Data Providers, which then works for sites on each project's own domain.",
    },
    {
      q: "Where is my Bing API key stored?",
      a: "It's stored encrypted with AES-256-GCM in AutoSEO's database and never sent back to the browser. It's only used to call the Bing Webmaster API.",
    },
  ],
  cta: {
    title: "Add Bing to your search data",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
