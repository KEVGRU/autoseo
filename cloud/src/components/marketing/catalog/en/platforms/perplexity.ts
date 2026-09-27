import type { PlatformPage } from "../../types";

export default {
  slug: "perplexity",
  name: "Perplexity",
  vendor: "Perplexity",
  nav: "Perplexity tracking",
  summary: "See when Perplexity cites your pages and recommends your brand.",
  meta: {
    title: "Perplexity Visibility Tracker: Brand Citations",
    description:
      "Track how Perplexity mentions, cites and ranks your brand against competitors, with every source it uses. Open-source Perplexity visibility tracker.",
  },
  hero: {
    eyebrow: "Perplexity visibility tracker",
    title: "Track your visibility in Perplexity",
    muted: "— source by source.",
    subtitle:
      "Perplexity answers every question with sources. AutoSEO runs the prompts your customers ask on a schedule, stores each answer and shows whether your brand is named, which pages Perplexity cites and which competitors it recommends instead.",
  },
  demo: {
    prompt: "Which open-source tools track brand mentions in AI search?",
    answer:
      "Acme is a popular open-source choice: it tracks mentions and citations across several AI engines and can run on your own server.",
    citations: ["github.com", "reddit.com", "acme.com"],
  },
  why: {
    eyebrow: "Why Perplexity matters",
    title: "Perplexity shows its sources.",
    muted: "That makes them yours to win.",
    body: "Perplexity searches the web for each question and lists the pages it used next to the answer. People researching tools, products and vendors see those sources and click them — so every citation is a chance to be read, not just named.",
    points: [
      {
        title: "Sources are part of the answer",
        body: "Perplexity lists the pages behind each answer. A citation puts your page in front of the reader, not only your brand name.",
      },
      {
        title: "Live search, changing answers",
        body: "Perplexity searches for every question, so new reviews, comparisons and forum threads can change what it says about you.",
      },
      {
        title: "Third-party pages carry weight",
        body: "Answers draw on comparison lists, reviews, docs and communities. Knowing which ones Perplexity cites tells you where to get listed.",
      },
    ],
  },
  method: {
    eyebrow: "How AutoSEO tracks Perplexity",
    title: "Two live ways to collect Perplexity answers,",
    muted: "plus a simulation.",
    body: "AutoSEO supports two live backends for Perplexity, plus an AI simulation as a fallback. On AutoSEO Cloud, engines run through the providers the Codext team has connected; usage counts toward the included allowance. On a self-hosted instance, an admin connects DataForSEO or adds a key in Admin → AI Providers and can pin one backend.",
    items: [
      {
        title: "DataForSEO",
        body: "Answers from Perplexity's Sonar models with their sources, for the market you track. Self-hosters pay DataForSEO directly; on AutoSEO Cloud, usage counts toward the included allowance.",
      },
      {
        title: "Perplexity API key",
        body: "On a self-hosted instance, add your own Perplexity key in Admin → AI Providers and AutoSEO queries Perplexity with web search directly, including the searches it ran.",
      },
      {
        title: "AI simulation as a fallback",
        body: "If no real backend is available, an AI model with web search can answer in place of Perplexity. These answers are labeled “Simulated” and meant as a directional estimate: a real backend always takes priority, and admins can switch the fallback off.",
      },
    ],
  },
  tracked: {
    eyebrow: "What gets tracked",
    title: "Everything Perplexity says about your brand",
    items: [
      {
        icon: "radar",
        title: "Brand mentions",
        body: "Whether Perplexity names your brand for each prompt, and the mention rate over time.",
      },
      {
        icon: "link",
        title: "Citations",
        body: "Every source Perplexity lists — your pages, competitors' pages and third-party sites, grouped by domain.",
      },
      {
        icon: "swords",
        title: "Share of voice",
        body: "Which competitors Perplexity recommends next to you, and in which position.",
      },
      {
        icon: "heart",
        title: "Sentiment and framing",
        body: "How Perplexity describes you: the praise, the criticism and the attributes it repeats.",
      },
      {
        icon: "git-fork",
        title: "Query fan-outs",
        body: "The searches Perplexity runs behind an answer, when the backend returns them.",
      },
      {
        icon: "map-pin",
        title: "Markets and languages",
        body: "The same prompt asked in different countries and languages, compared side by side.",
      },
    ],
  },
  crawlers: {
    eyebrow: "Perplexity's crawlers",
    title: "Make sure Perplexity can read your site",
    body: "Perplexity uses one crawler for its search index and another for pages users ask about. AutoSEO's crawlability check tests your robots.txt and pages against both, and bot analytics shows how often they visit.",
    bots: [
      { token: "PerplexityBot", purpose: "Indexes pages for Perplexity's search results and answers" },
      { token: "Perplexity-User", purpose: "Fetches a page when a user's question needs it" },
    ],
  },
  faq: [
    {
      q: "How do I track my brand's visibility in Perplexity?",
      a: "Add the prompts your customers ask, select Perplexity as an engine and set a schedule. AutoSEO runs the prompts, stores every answer with its sources and reports mention rate, citation rate, position and sentiment for your brand and competitors.",
    },
    {
      q: "Can I see which sources Perplexity cites?",
      a: "Yes. Every cited URL is stored and grouped by domain and content type, with the prompts that cite it and the brands it mentions. Pages that cite competitors but not you show where to get listed.",
    },
    {
      q: "Do I need a Perplexity API key?",
      a: "Not on AutoSEO Cloud — you don't manage provider keys there; engines run through the providers the Codext team has connected (ask us which are enabled). When you self-host, you can collect Perplexity answers through DataForSEO, billed pay-as-you-go, or add your own Perplexity key in Admin → AI Providers. Both return the answer with its sources.",
    },
    {
      q: "How do I get cited by Perplexity?",
      a: "Let PerplexityBot crawl your pages, publish clear answers to the questions you track, and get mentioned on the sites Perplexity already cites for those prompts. AutoSEO shows those sites and turns the gaps into prioritized tasks.",
    },
    {
      q: "How often is Perplexity data updated?",
      a: "As often as your project schedule says: daily, weekly or monthly. Every run is stored, so you can compare any two periods and see which answers and sources changed.",
    },
    {
      q: "Is the Perplexity tracker free?",
      a: "Yes, when you self-host: AutoSEO is open source under the MIT license with every feature included, and DataForSEO or Perplexity API usage is billed by those providers. AutoSEO Cloud gives you a managed workspace for $50 per month with $10 of AI and data usage included.",
    },
  ],
  cta: {
    title: "Find out what Perplexity says about you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies PlatformPage;
