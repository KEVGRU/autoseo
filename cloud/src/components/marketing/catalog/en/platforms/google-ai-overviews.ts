import type { PlatformPage } from "../../types";

export default {
  slug: "google-ai-overviews",
  name: "Google AI Overviews",
  vendor: "Google",
  nav: "AI Overviews tracking",
  summary: "See when Google's AI Overviews mention your brand and link your pages.",
  meta: {
    title: "Google AI Overviews Tracker: Brand Visibility",
    description:
      "Track whether Google AI Overviews appear for your queries, mention your brand and cite your pages, per market. Open-source AI Overview tracker via DataForSEO.",
  },
  hero: {
    eyebrow: "Google AI Overviews tracker",
    title: "Track your brand in Google AI Overviews",
    muted: "— above the first result.",
    subtitle:
      "AI Overviews sit on top of Google's search results for many queries. AutoSEO checks your queries in the markets you choose, stores each AI Overview and shows whether one appears, whether it names you and which pages it links.",
  },
  demo: {
    prompt: "open source ai visibility tracker",
    answer:
      "Open-source AI visibility trackers such as Acme run a set of prompts on AI engines and report how often a brand is mentioned and cited.",
    citations: ["acme.com", "github.com", "reddit.com"],
  },
  why: {
    eyebrow: "Why AI Overviews matter",
    title: "AI Overviews come before the first result.",
    muted: "Be in them, not below them.",
    body: "For many searches, Google shows an AI-generated overview above the organic results, with a few linked sources. If your brand or page isn't part of it, searchers can get their answer without ever reaching your listing.",
    points: [
      {
        title: "Rankings aren't the whole picture",
        body: "A page can rank well and still be missing from the AI Overview above it. You need to track both.",
      },
      {
        title: "Not every query triggers one",
        body: "Google shows AI Overviews for some queries and not for others, and that changes. AutoSEO records when an overview appears and when it doesn't.",
      },
      {
        title: "Sources are the lever",
        body: "AI Overviews link the pages they draw on. Knowing which ones Google picks shows where you need to rank or be mentioned.",
      },
    ],
  },
  method: {
    eyebrow: "How AutoSEO tracks AI Overviews",
    title: "AI Overviews from real search results,",
    muted: "via DataForSEO.",
    body: "AutoSEO requests the Google results page for each query through DataForSEO, with your market and language, and loads the AI Overview when Google shows one. DataForSEO is the only live backend for this engine; without it, an AI simulation can stand in.",
    items: [
      {
        title: "DataForSEO",
        body: "Desktop Google results with the AI Overview, its links and any shopping results or ads on the page. Self-hosters pay DataForSEO directly; on AutoSEO Cloud, usage counts toward the included allowance.",
      },
      {
        title: "AI simulation as a fallback",
        body: "If no real backend is available, an AI model with web search can answer in place of AI Overviews. These answers are labeled “Simulated” and meant as a directional estimate: a real backend always takes priority, and admins can switch the fallback off. It uses Gemini with Google Search grounding when a Gemini key is set, estimates whether an overview would appear at all, and never includes shopping results or ads.",
      },
    ],
  },
  tracked: {
    eyebrow: "What gets tracked",
    title: "Everything AI Overviews say about your brand",
    items: [
      {
        icon: "eye",
        title: "AI Overview presence",
        body: "Whether Google shows an AI Overview for your query, per market and run.",
      },
      {
        icon: "radar",
        title: "Brand mentions",
        body: "Whether the overview names your brand, and the mention rate over time.",
      },
      {
        icon: "link",
        title: "Cited pages",
        body: "The pages the AI Overview links — yours, competitors' and third-party sites.",
      },
      {
        icon: "swords",
        title: "Share of voice",
        body: "Which competitors the overview names next to you, and in which order.",
      },
      {
        icon: "shopping-bag",
        title: "Shopping results and ads",
        body: "Product listings and paid placements shown in and around the AI Overview.",
      },
      {
        icon: "map-pin",
        title: "Markets and languages",
        body: "The same query in different countries and languages, compared side by side.",
      },
    ],
  },
  crawlers: {
    eyebrow: "Google's crawlers",
    title: "Make sure Google can read your site",
    body: "AI Overviews are built from Google's search index, so Googlebot access is what counts. AutoSEO's crawlability check tests your robots.txt and pages against Google's tokens, and bot analytics shows how often Googlebot and GoogleOther visit.",
    bots: [
      { token: "Googlebot", purpose: "Crawls and indexes pages for Google Search, including the pages AI Overviews link" },
      {
        token: "Google-Extended",
        purpose: "No crawler of its own: a robots.txt token for Gemini model use that doesn't affect Google Search",
      },
      { token: "GoogleOther", purpose: "Google's general-purpose crawler for research and development, outside of Search" },
    ],
  },
  faq: [
    {
      q: "How do I track Google AI Overviews for my brand?",
      a: "Add the queries you want to monitor, select Google AI Overviews as an engine and set a schedule. AutoSEO requests the Google results via DataForSEO, stores every AI Overview and reports whether it appeared, whether it mentioned you and which pages it cited.",
    },
    {
      q: "Why is there no AI Overview for some of my queries?",
      a: "Google only shows AI Overviews for some queries, and that can change over time and by market. AutoSEO stores runs without an overview too, so you can see how often one appears for each query.",
    },
    {
      q: "How do I get my page into Google AI Overviews?",
      a: "A page has to be indexed and eligible for a snippet in Google Search to be linked in an AI Overview. Beyond that, answer the query clearly and get mentioned on the pages Google already links. AutoSEO shows those pages and turns the gaps into prioritized tasks.",
    },
    {
      q: "Does blocking Google-Extended remove me from AI Overviews?",
      a: "No. Google-Extended controls whether Google may use your content for Gemini models, and it doesn't affect Google Search — AI Overviews are part of Search. For AI Overviews, Googlebot access is what matters.",
    },
    {
      q: "Do I need DataForSEO to track AI Overviews?",
      a: "Not on AutoSEO Cloud — you don't manage provider credentials there; engines run through the providers the Codext team has connected (ask us which are enabled). When you self-host, live AI Overviews come from DataForSEO's Google results: add your credentials once in Admin → Data Providers, and the same account also powers keyword research, rank tracking and backlinks. Without DataForSEO, an AI simulation can stand in, labeled “Simulated” and directional only.",
    },
    {
      q: "Can I compare AI Overviews with my classic rankings?",
      a: "Yes. AutoSEO includes rank tracking next to AI visibility, so you can follow a query's organic position and its AI Overview in the same app.",
    },
  ],
  cta: {
    title: "Find out what AI Overviews say about you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies PlatformPage;
