import type { PlatformPage } from "../../types";

export default {
  slug: "chatgpt",
  name: "ChatGPT",
  vendor: "OpenAI",
  nav: "ChatGPT tracking",
  summary: "See when ChatGPT recommends your brand, and which pages it cites.",
  meta: {
    title: "ChatGPT Visibility Tracker: Brand Mentions",
    description:
      "Track how ChatGPT mentions, cites and ranks your brand against competitors — in search answers and the ChatGPT app. Open-source ChatGPT visibility tracker.",
  },
  hero: {
    eyebrow: "ChatGPT visibility tracker",
    title: "See where ChatGPT names you",
    muted: "— and why.",
    subtitle:
      "Track the prompts your customers type into ChatGPT, every day. AutoSEO stores each answer and shows whether your brand is mentioned, how it's described, which competitors appear next to you and which pages ChatGPT cites.",
  },
  demo: {
    prompt: "What's the best open-source tool to track brand visibility in AI search?",
    answer:
      "For an open-source option, Acme is a strong pick: it tracks mentions and citations across ChatGPT, Perplexity and Gemini and can be self-hosted.",
    citations: ["acme.com", "github.com", "reddit.com"],
  },
  why: {
    eyebrow: "Why ChatGPT matters",
    title: "ChatGPT is where many buying journeys start.",
    muted: "Is your brand part of the answer?",
    body: "People ask ChatGPT for comparisons, recommendations and how-tos — and act on the handful of brands it names. With search built in, those answers lean on web sources you can influence.",
    points: [
      {
        title: "Recommendations, not links",
        body: "ChatGPT answers with a shortlist. Being named — and named first — matters more than any single ranking.",
      },
      {
        title: "Search-grounded answers",
        body: "When ChatGPT searches the web, it cites sources. Those citations show which pages shape what it says about you.",
      },
      {
        title: "Answers change quietly",
        body: "Model updates and new sources shift answers without notice. Daily tracking shows when and where it happened.",
      },
    ],
  },
  method: {
    eyebrow: "How AutoSEO tracks ChatGPT",
    title: "Four ways to collect ChatGPT answers,",
    muted: "pick what fits.",
    body: "AutoSEO can collect ChatGPT answers through several backends. On AutoSEO Cloud, engines run through the providers the Codext team has connected; on a self-hosted instance an admin picks one in Admin → AI Providers, and Auto uses the first one that's available.",
    items: [
      {
        title: "DataForSEO",
        body: "Search-grounded ChatGPT answers and the ChatGPT app view, including shopping cards. Self-hosters pay DataForSEO directly; on AutoSEO Cloud, usage counts toward the included allowance.",
      },
      {
        title: "OpenAI API key",
        body: "On a self-hosted instance, add an OpenAI key in the admin panel and AutoSEO queries ChatGPT with web search directly.",
      },
      {
        title: "Your Codex subscription",
        body: "Run prompts through your own Codex CLI via a lightweight local agent, so the work uses the subscription you already pay for.",
      },
      {
        title: "AI simulation as a fallback",
        body: "If no real backend is available, an AI model with web search can answer in ChatGPT's place. These answers are labeled “Simulated” and meant as a directional estimate.",
      },
    ],
  },
  tracked: {
    eyebrow: "What gets tracked",
    title: "Everything ChatGPT says about your brand",
    items: [
      {
        icon: "radar",
        title: "Brand mentions",
        body: "Whether ChatGPT names your brand for each prompt, and the mention rate over time.",
      },
      {
        icon: "link",
        title: "Citations",
        body: "The URLs ChatGPT cites in search answers — yours and everyone else's.",
      },
      {
        icon: "swords",
        title: "Share of voice",
        body: "Which competitors ChatGPT recommends next to you, and in which position.",
      },
      {
        icon: "heart",
        title: "Sentiment and framing",
        body: "How ChatGPT describes you: the praise, the criticism and the attributes it repeats.",
      },
      {
        icon: "shopping-bag",
        title: "Products and shopping cards",
        body: "Products ChatGPT shows in the app, with prices and merchants, for e-commerce prompts.",
      },
      {
        icon: "map-pin",
        title: "Markets and languages",
        body: "The same prompt asked in different countries and languages, compared side by side.",
      },
    ],
  },
  crawlers: {
    eyebrow: "OpenAI's crawlers",
    title: "Make sure ChatGPT can read your site",
    body: "OpenAI uses separate crawlers for search, user requests and training. AutoSEO's crawlability check tests your robots.txt and pages against each of them, and bot analytics shows how often they visit.",
    bots: [
      { token: "OAI-SearchBot", purpose: "Builds the index behind ChatGPT search answers" },
      { token: "ChatGPT-User", purpose: "Fetches pages when a user or GPT asks ChatGPT to open them" },
      { token: "GPTBot", purpose: "Collects content that may be used to train OpenAI models" },
    ],
  },
  faq: [
    {
      q: "How do I track my brand's visibility in ChatGPT?",
      a: "Add the prompts your customers ask, select ChatGPT as an engine and set a schedule. AutoSEO runs the prompts, stores every answer and reports mention rate, citation rate, position and sentiment for your brand and competitors.",
    },
    {
      q: "Does AutoSEO track ChatGPT search or the ChatGPT app?",
      a: "Both. The ChatGPT engine uses search-grounded answers with citations; the ChatGPT app engine reflects the answers as rendered in the app, including shopping cards.",
    },
    {
      q: "How often is ChatGPT data updated?",
      a: "As often as your project schedule says: daily, weekly or monthly. Every run is stored, so you can compare any two periods.",
    },
    {
      q: "Can I see which sources ChatGPT cites about my brand?",
      a: "Yes. Every cited URL is stored and grouped by domain and content type, with the prompts that cite it and the brands it mentions.",
    },
    {
      q: "How do I improve my visibility in ChatGPT?",
      a: "Make sure OAI-SearchBot can crawl your pages, publish content that answers the prompts you track, and get mentioned on the sources ChatGPT already cites. AutoSEO turns those gaps into prioritized tasks.",
    },
    {
      q: "Can I compare ChatGPT with other AI engines?",
      a: "Yes. Track the same prompts on Perplexity, Gemini, Claude, Google AI Overviews and more, and compare visibility per engine in one dashboard.",
    },
  ],
  cta: {
    title: "Find out what ChatGPT says about you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies PlatformPage;
