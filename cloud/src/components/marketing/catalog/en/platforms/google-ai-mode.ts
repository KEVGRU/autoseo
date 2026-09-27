import type { PlatformPage } from "../../types";

export default {
  slug: "google-ai-mode",
  name: "Google AI Mode",
  vendor: "Google",
  nav: "AI Mode tracking",
  summary: "See when Google AI Mode recommends your brand, and which pages it links.",
  meta: {
    title: "Google AI Mode Tracker: Brand Visibility",
    description:
      "Track how Google AI Mode mentions and cites your brand against competitors, per market and language. Open-source Google AI Mode tracker, powered by DataForSEO.",
  },
  hero: {
    eyebrow: "Google AI Mode tracker",
    title: "Track your brand in Google AI Mode",
    muted: "— market by market.",
    subtitle:
      "AI Mode answers search questions with a full AI response and source links. AutoSEO collects AI Mode answers for your prompts in the markets you choose and shows whether you're mentioned, how you're described, who appears next to you and which pages Google links.",
  },
  demo: {
    prompt: "What's the best way to monitor how AI search engines mention my brand?",
    answer:
      "Use an AI visibility tracker such as Acme: it runs your prompts on a schedule and shows how often AI engines mention and cite your brand.",
    citations: ["acme.com", "reddit.com", "g2.com"],
  },
  why: {
    eyebrow: "Why AI Mode matters",
    title: "AI Mode turns search into a conversation.",
    muted: "The answer is the result page.",
    body: "In AI Mode, Google answers a query with a generated response and a set of links instead of a classic list of results. The brands named in that response are the ones searchers see first.",
    points: [
      {
        title: "Built for comparisons",
        body: "AI Mode is made for complex questions and follow-ups — the kind where people compare options and ask for recommendations.",
      },
      {
        title: "Rankings don't tell the whole story",
        body: "A top position in classic search doesn't guarantee a mention in AI Mode. You have to check the answer itself.",
      },
      {
        title: "Different by market",
        body: "AI Mode isn't available everywhere, and answers differ by country and language. Tracking per market shows where you stand in each.",
      },
    ],
  },
  method: {
    eyebrow: "How AutoSEO tracks AI Mode",
    title: "AI Mode answers via DataForSEO,",
    muted: "for every market you track.",
    body: "AutoSEO collects AI Mode answers through DataForSEO, with the market and language of your project, and stores the full response with its links. DataForSEO is the only live backend for this engine; without it, an AI simulation can stand in.",
    items: [
      {
        title: "DataForSEO",
        body: "AI Mode answers for your prompt, market and language, with the linked sources and any products or ads inside the answer. Self-hosters pay DataForSEO directly; on AutoSEO Cloud, usage counts toward the included allowance.",
      },
      {
        title: "AI simulation as a fallback",
        body: "If no real backend is available, an AI model with web search can answer in place of AI Mode. These answers are labeled “Simulated” and meant as a directional estimate: a real backend always takes priority, and admins can switch the fallback off. It uses Gemini with Google Search grounding when a Gemini key is set and never includes products or ads.",
      },
    ],
  },
  tracked: {
    eyebrow: "What gets tracked",
    title: "Everything AI Mode says about your brand",
    items: [
      {
        icon: "radar",
        title: "Brand mentions",
        body: "Whether AI Mode names your brand for each prompt, and the mention rate over time.",
      },
      {
        icon: "link",
        title: "Citations",
        body: "The pages AI Mode links as sources — yours, competitors' and third-party sites.",
      },
      {
        icon: "swords",
        title: "Share of voice",
        body: "Which competitors AI Mode names next to you, and in which position.",
      },
      {
        icon: "heart",
        title: "Sentiment and framing",
        body: "How AI Mode describes you: the praise, the criticism and the attributes it repeats.",
      },
      {
        icon: "shopping-bag",
        title: "Products and ads",
        body: "Product listings and paid placements that appear inside AI Mode answers.",
      },
      {
        icon: "map-pin",
        title: "Markets and languages",
        body: "The same query in different countries and languages, wherever Google offers AI Mode.",
      },
    ],
  },
  crawlers: {
    eyebrow: "Google's crawlers",
    title: "Make sure Google can read your site",
    body: "AI Mode draws on Google's search index, so Googlebot access is what counts. AutoSEO's crawlability check tests your robots.txt and pages against Google's tokens, and bot analytics shows how often Googlebot and GoogleOther visit.",
    bots: [
      { token: "Googlebot", purpose: "Crawls and indexes pages for Google Search, including the pages AI Mode links" },
      {
        token: "Google-Extended",
        purpose: "No crawler of its own: a robots.txt token for Gemini model use that doesn't affect Google Search",
      },
      { token: "GoogleOther", purpose: "Google's general-purpose crawler for research and development, outside of Search" },
    ],
  },
  faq: [
    {
      q: "How do I track my brand in Google AI Mode?",
      a: "Add the prompts or queries you want to monitor, select Google AI Mode as an engine and set a schedule. AutoSEO collects the AI Mode answers via DataForSEO, stores them and reports mention rate, citation rate, position and sentiment for your brand and competitors.",
    },
    {
      q: "What's the difference between AI Mode and AI Overviews?",
      a: "AI Overviews are summaries shown above the regular Google results for some queries. AI Mode is a separate, conversational search mode where the AI answer is the main result. AutoSEO tracks them as two engines, so you can compare both for the same prompts.",
    },
    {
      q: "Do I need DataForSEO to track AI Mode?",
      a: "Not on AutoSEO Cloud — you don't manage provider credentials there; engines run through the providers the Codext team has connected (ask us which are enabled). When you self-host, live AI Mode answers come from DataForSEO: add your credentials once in Admin → Data Providers, and the same account also powers keyword research, rank tracking and backlinks. Without DataForSEO, an AI simulation can stand in, labeled “Simulated” and directional only.",
    },
    {
      q: "In which countries can I track AI Mode?",
      a: "AI Mode is only available where Google offers it. AutoSEO sends your project's market and language with every request, so you can track AI Mode in each country and language where it's live.",
    },
    {
      q: "How do I get my pages cited in AI Mode?",
      a: "Start with classic SEO: a page has to be indexed and eligible for a snippet in Google Search to appear as a link in AI Mode. Then answer the questions you track clearly and get mentioned on the pages AI Mode already links. AutoSEO shows those pages and turns the gaps into tasks.",
    },
    {
      q: "How often is AI Mode data updated?",
      a: "As often as your project schedule says: daily, weekly or monthly. Every run is stored, so you can compare any two periods and see what changed.",
    },
  ],
  cta: {
    title: "Find out what Google AI Mode says about you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies PlatformPage;
