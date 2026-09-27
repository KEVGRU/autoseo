import type { PlatformPage } from "../../types";

export default {
  slug: "kimi",
  name: "Kimi",
  vendor: "Moonshot AI",
  nav: "Kimi tracking",
  summary: "See when Kimi recommends your brand, and which pages it cites.",
  meta: {
    title: "Kimi Visibility Tracker: Brand Mentions",
    description:
      "Track how Moonshot AI's Kimi mentions, cites and ranks your brand against competitors, with web search on. Open-source Kimi visibility tracker for AI search.",
  },
  hero: {
    eyebrow: "Kimi visibility tracker",
    title: "See what Kimi says about your brand",
    muted: "— and what it cites.",
    subtitle:
      "Kimi, Moonshot AI's assistant, searches the web before it answers. AutoSEO runs the prompts your customers ask on Kimi and shows whether you're mentioned, how you're described, who is recommended next to you and which pages Kimi cites.",
  },
  demo: {
    prompt: "What's a good open-source tool for AI search visibility?",
    answer: "Acme is a solid open-source option: it tracks brand mentions and citations across AI assistants and runs on your own server.",
    citations: ["acme.com", "github.com", "reddit.com"],
  },
  why: {
    eyebrow: "Why Kimi matters",
    title: "Kimi searches the web before it answers.",
    muted: "Which sources does it pick?",
    body: "Kimi is the AI assistant from Moonshot AI. With web search on, it pulls in current pages and names the brands it finds most relevant — which may not be the ones ChatGPT or Gemini pick.",
    points: [
      {
        title: "Sources behind every answer",
        body: "Kimi's web search returns the pages it used. They show which sources shape its view of your category.",
      },
      {
        title: "Its own shortlist",
        body: "Kimi's recommendations can differ from other assistants'. Tracking it separately shows gaps you'd otherwise miss.",
      },
      {
        title: "Changes you'd otherwise miss",
        body: "New model versions and new pages change answers without notice. Scheduled tracking shows when it happened.",
      },
    ],
  },
  method: {
    eyebrow: "How AutoSEO tracks Kimi",
    title: "Kimi via the Moonshot API,",
    muted: "or a simulation.",
    body: "AutoSEO asks Kimi through Moonshot AI's API with its server-side web search. On a self-hosted instance, add your own Moonshot key in Admin → AI Providers. On AutoSEO Cloud, engines run through the providers the Codext team has connected; usage counts toward the included allowance.",
    items: [
      {
        title: "Moonshot API",
        body: "Kimi answers with the sources from its web search, plus the searches it ran when the API returns them. Moonshot's search takes no location, so AutoSEO passes your market in the instructions.",
      },
      {
        title: "AI simulation as a fallback",
        body: "If no real backend is available, an AI model with web search can answer in place of Kimi. These answers are labeled “Simulated” and meant as a directional estimate: a real backend always takes priority, and admins can switch the fallback off.",
      },
    ],
  },
  tracked: {
    eyebrow: "What gets tracked",
    title: "Everything Kimi says about your brand",
    items: [
      {
        icon: "radar",
        title: "Brand mentions",
        body: "Whether Kimi names your brand for each prompt, and the mention rate over time.",
      },
      {
        icon: "link",
        title: "Citations",
        body: "The pages Kimi cites from its web search — yours and everyone else's.",
      },
      {
        icon: "swords",
        title: "Share of voice",
        body: "Which competitors Kimi recommends next to you, and in which position.",
      },
      {
        icon: "heart",
        title: "Sentiment and framing",
        body: "How Kimi describes you: the praise, the criticism and the attributes it repeats.",
      },
      {
        icon: "git-fork",
        title: "Query fan-outs",
        body: "The searches Kimi runs behind an answer, when the API returns them.",
      },
      {
        icon: "map-pin",
        title: "Markets and languages",
        body: "The same prompt asked for different countries and languages, compared side by side.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track my brand's visibility in Kimi?",
      a: "Add the prompts your customers ask, select Kimi as an engine and set a schedule. AutoSEO runs the prompts with web search, stores every answer with its sources and reports mention rate, citation rate, position and sentiment for your brand and competitors.",
    },
    {
      q: "Does AutoSEO track the Kimi app?",
      a: "AutoSEO asks Kimi through Moonshot AI's API with web search, not the Kimi app itself. The answers show how Kimi's models see your brand and which sources they use.",
    },
    {
      q: "Do I need a Moonshot API key?",
      a: "Not on AutoSEO Cloud — you don't manage provider keys there; engines run through the providers the Codext team has connected (ask us which are enabled). When you self-host, add your own Moonshot AI key in Admin → AI Providers. Without it, an AI simulation can stand in, labeled “Simulated” and directional only.",
    },
    {
      q: "Can I track Kimi for different countries?",
      a: "Yes, with a caveat. Moonshot's web search takes no location, so AutoSEO tells Kimi your market in the instructions and Kimi answers in the language of your prompt. Treat differences between markets as an approximation.",
    },
    {
      q: "How do I improve my visibility in Kimi?",
      a: "Publish clear answers to the prompts you track, keep your pages crawlable and get mentioned on the sources Kimi already cites. AutoSEO shows those sources and turns the gaps into prioritized tasks.",
    },
    {
      q: "Can I compare Kimi with other AI engines?",
      a: "Yes. Track the same prompts on ChatGPT, Perplexity, Gemini, Claude and more, and compare visibility per engine in one dashboard.",
    },
  ],
  cta: {
    title: "Find out what Kimi says about you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies PlatformPage;
