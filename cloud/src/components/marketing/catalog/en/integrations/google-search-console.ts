import type { IntegrationPage } from "../../types";

export default {
  slug: "google-search-console",
  name: "Google Search Console",
  nav: "Google Search Console",
  summary: "Find AI-style prompts and striking-distance pages in your Search Console data.",
  meta: {
    title: "Google Search Console Integration for GEO",
    description:
      "Connect Google Search Console to AutoSEO to find AI-style prompts in your search queries, spot pages close to the top and track them in AI search.",
  },
  hero: {
    subtitle:
      "Connect Search Console with your Google account and turn up to 16 months of queries, pages and countries into prompts to track, pages to improve and tasks to work on.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Search Console integration",
    items: [
      "Queries, pages and countries from Google Search, synced daily",
      "Up to 16 months of history on the first sync",
      "An AI Prompts view that flags conversational, question-like queries",
      "Intent labels: Recommend, Information, Comparison and Action",
      "Add any query to AI visibility tracking with one click",
      "URL Inspection for index status, right inside AutoSEO",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Search Console and AutoSEO",
    items: [
      {
        icon: "message-square",
        title: "Discover the prompts people already ask",
        body: "Long, conversational queries show how people phrase questions — the same way they ask AI assistants. Track them as prompts in one click.",
      },
      {
        icon: "trending-up",
        title: "Win pages close to the top",
        body: "Connect GA4 as well, and Search Opportunities score pages in positions 4–20 by demand, business value and distance to the top.",
      },
      {
        icon: "list-checks",
        title: "Get tasks from your search data",
        body: "Untracked conversational queries and pages with impressions but weak snippets become prioritized tasks.",
      },
      {
        icon: "search",
        title: "Check indexing without switching tools",
        body: "Inspect a URL's index status with Google's URL Inspection API and keep the results in a history.",
      },
      {
        icon: "globe",
        title: "See where you're found",
        body: "Break clicks and impressions down by country to decide which markets to track in AI search.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Search Console in four steps,",
    muted: "read-only via OAuth.",
    items: [
      {
        title: "Open the Search Console settings",
        body: "In your project, open Analytics → Search Console → Settings, or Integrations → Google Search Console.",
      },
      {
        title: "Sign in with Google",
        body: "Grant read-only access with the Google account that has access to your Search Console property.",
      },
      {
        title: "Choose the property",
        body: "Pick the Search Console property that matches this project's website.",
      },
      {
        title: "Let the first sync run",
        body: "AutoSEO imports up to 16 months of queries, pages and countries in the background and syncs daily after that.",
      },
    ],
  },
  faq: [
    {
      q: "How do I find AI prompts in Google Search Console?",
      a: "Connect Search Console to AutoSEO and open the AI Prompts view. It flags conversational and question-like queries — the way people phrase requests to ChatGPT and other assistants — and lets you add them to AI visibility tracking.",
    },
    {
      q: "What access does AutoSEO need to Search Console?",
      a: "Read-only access through Google's webmasters.readonly scope. AutoSEO can't change settings, submit sitemaps or remove URLs. Disconnecting removes the connection and the imported data for the project.",
    },
    {
      q: "How much Search Console history does AutoSEO import?",
      a: "Up to 16 months, the maximum Google keeps. After the first sync, data updates daily.",
    },
    {
      q: "Does AutoSEO support Bing Webmaster Tools too?",
      a: "Yes. Bing Webmaster Tools connects with an API key and shows Bing queries and pages in the same Search Console section. Bing also powers Copilot's search results.",
    },
    {
      q: "How many URLs can I inspect?",
      a: "Google allows 2,000 URL inspections per property per day and 600 per minute. AutoSEO serves results younger than 24 hours from its history instead of calling Google again.",
    },
    {
      q: "Do I need a Google OAuth client to self-host?",
      a: "Yes. On a self-hosted instance, an admin registers a Google OAuth client once under Admin → Data Providers, and then every user can connect their Google account. On AutoSEO Cloud, the Codext team manages the OAuth client for the shared app, so workspace owners don't register their own.",
    },
  ],
  cta: {
    title: "Turn search data into AI visibility",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
