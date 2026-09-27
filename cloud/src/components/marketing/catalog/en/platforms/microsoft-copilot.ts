import type { PlatformPage } from "../../types";

export default {
  slug: "microsoft-copilot",
  name: "Microsoft Copilot",
  vendor: "Microsoft",
  nav: "Copilot tracking",
  summary: "See when Copilot mentions your brand in Bing, and which pages it cites.",
  meta: {
    title: "Microsoft Copilot Visibility Tracker for Brands",
    description:
      "Track how Microsoft Copilot mentions and cites your brand in Bing, against competitors and per market. Open-source Copilot visibility tracker via DataForSEO.",
  },
  hero: {
    eyebrow: "Microsoft Copilot tracker",
    title: "See where Microsoft Copilot names you",
    muted: "— in Bing's AI answers.",
    subtitle:
      "Copilot answers are grounded in Bing. AutoSEO collects the Copilot answer Bing shows for your queries in the markets you choose, and reports whether you're mentioned, who appears next to you and which pages are cited.",
  },
  demo: {
    prompt: "best tools to track brand visibility in ai search",
    answer:
      "Tools like Acme track how often AI assistants mention and cite a brand, and compare it with competitors across engines.",
    citations: ["acme.com", "g2.com", "reddit.com"],
  },
  why: {
    eyebrow: "Why Copilot matters",
    title: "Copilot answers from Bing's index.",
    muted: "Bing SEO counts again.",
    body: "Microsoft Copilot is grounded in Bing search. The pages Bing indexes and ranks feed the answers Copilot gives, so a gap in Bing can become a gap in Copilot.",
    points: [
      {
        title: "A separate index",
        body: "Bing crawls and ranks the web on its own. Strong Google rankings don't guarantee that Copilot knows your pages.",
      },
      {
        title: "Answers inside the results",
        body: "Bing shows Copilot answers in its search results, so searchers can get a recommendation before they click anything.",
      },
      {
        title: "Different engine, different shortlist",
        body: "Copilot's picks can differ from ChatGPT's or Google's. Tracking it separately shows where you're missing.",
      },
    ],
  },
  method: {
    eyebrow: "How AutoSEO tracks Copilot",
    title: "Copilot answers from Bing results,",
    muted: "via DataForSEO.",
    body: "AutoSEO requests Bing's search results for each query through DataForSEO, with your market and language, and stores the Copilot answer shown there. DataForSEO is the only live backend for this engine; without it, an AI simulation can stand in.",
    items: [
      {
        title: "DataForSEO",
        body: "Desktop Bing results with the Copilot answer, its sources and any shopping results or ads on the page. Self-hosters pay DataForSEO directly; on AutoSEO Cloud, usage counts toward the included allowance.",
      },
      {
        title: "AI simulation as a fallback",
        body: "If no real backend is available, an AI model with web search can answer in place of Copilot. These answers are labeled “Simulated” and meant as a directional estimate: a real backend always takes priority, and admins can switch the fallback off. It uses OpenAI with web search when an OpenAI key is set and never includes shopping results or ads.",
      },
    ],
  },
  tracked: {
    eyebrow: "What gets tracked",
    title: "Everything Copilot says about your brand",
    items: [
      {
        icon: "eye",
        title: "Copilot answer presence",
        body: "Whether Bing shows a Copilot answer for your query, per market and run.",
      },
      {
        icon: "radar",
        title: "Brand mentions",
        body: "Whether Copilot names your brand for each query, and the mention rate over time.",
      },
      {
        icon: "link",
        title: "Citations",
        body: "The pages Copilot cites — yours, competitors' and third-party sites.",
      },
      {
        icon: "swords",
        title: "Share of voice",
        body: "Which competitors Copilot names next to you, and in which position.",
      },
      {
        icon: "heart",
        title: "Sentiment and framing",
        body: "How Copilot describes you: the praise, the criticism and the attributes it repeats.",
      },
      {
        icon: "shopping-bag",
        title: "Shopping results and ads",
        body: "Product listings and paid placements on the Bing results page next to the answer.",
      },
    ],
  },
  crawlers: {
    eyebrow: "Microsoft's crawler",
    title: "Make sure Bing can read your site",
    body: "Copilot relies on Bing's index, and Bingbot builds it. AutoSEO's crawlability check tests your robots.txt and pages against Bingbot, and bot analytics shows how often it visits.",
    bots: [{ token: "Bingbot", purpose: "Crawls and indexes pages for Bing search, which grounds Copilot answers" }],
  },
  faq: [
    {
      q: "How do I track my brand in Microsoft Copilot?",
      a: "Add the queries you want to monitor, select Microsoft Copilot as an engine and set a schedule. AutoSEO collects the Copilot answers from Bing via DataForSEO and reports mention rate, citation rate, position and sentiment for your brand and competitors.",
    },
    {
      q: "Does AutoSEO track the Copilot app or Copilot in Bing?",
      a: "AutoSEO tracks the Copilot answers Bing shows in its search results, collected through DataForSEO. The Copilot app itself isn't queried directly.",
    },
    {
      q: "How do I improve my visibility in Copilot?",
      a: "Start with Bing: let Bingbot crawl your pages and check that they're indexed, for example in Bing Webmaster Tools. Then answer the queries you track clearly and get mentioned on the pages Copilot already cites. AutoSEO turns those gaps into prioritized tasks.",
    },
    {
      q: "Do I need DataForSEO to track Copilot?",
      a: "Not on AutoSEO Cloud — you don't manage provider credentials there; engines run through the providers the Codext team has connected (ask us which are enabled). When you self-host, live Copilot answers come from DataForSEO's Bing results: add your credentials once in Admin → Data Providers, and the same account also powers keyword research, rank tracking and backlinks. Without DataForSEO, an AI simulation can stand in, labeled “Simulated” and directional only.",
    },
    {
      q: "Can I compare Copilot with ChatGPT and Google?",
      a: "Yes. Track the same prompts on ChatGPT, Google AI Overviews, Perplexity and more, and compare visibility per engine in one dashboard.",
    },
    {
      q: "How often is Copilot data updated?",
      a: "As often as your project schedule says: daily, weekly or monthly. Every run is stored, so you can compare any two periods and see what changed.",
    },
  ],
  cta: {
    title: "Find out what Copilot says about you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies PlatformPage;
