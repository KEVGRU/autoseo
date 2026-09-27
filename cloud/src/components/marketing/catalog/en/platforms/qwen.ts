import type { PlatformPage } from "../../types";

export default {
  slug: "qwen",
  name: "Qwen",
  vendor: "Alibaba Cloud",
  nav: "Qwen tracking",
  summary: "See when Alibaba's Qwen mentions your brand, and which sources it cites.",
  meta: {
    title: "Qwen Visibility Tracker: Brand Mentions",
    description:
      "Track how Alibaba's Qwen mentions, cites and ranks your brand against competitors, with web search and sources. Open-source Qwen visibility tracker.",
  },
  hero: {
    eyebrow: "Qwen visibility tracker",
    title: "See how Qwen talks about your brand",
    muted: "— with its sources.",
    subtitle:
      "Qwen, Alibaba's AI model family, can search the web and return its sources. AutoSEO runs the prompts your customers ask on Qwen and shows whether you're mentioned, how you're described, who is recommended next to you and which pages Qwen cites.",
  },
  demo: {
    prompt: "Which tools track brand mentions in AI assistants?",
    answer:
      "Acme tracks how AI assistants mention your brand, which sources they cite and how you compare with competitors. It's open source.",
    citations: ["acme.com", "github.com", "reddit.com"],
  },
  why: {
    eyebrow: "Why Qwen matters",
    title: "Alibaba's Qwen has its own view of your market.",
    muted: "Check what it says.",
    body: "Qwen is Alibaba's family of AI models, behind Qwen Chat and Alibaba Cloud Model Studio. With web search on, it answers from current sources — and its shortlist can look different from ChatGPT's or Gemini's.",
    points: [
      {
        title: "Answers in your buyers' language",
        body: "Qwen answers in the language of the question. Track it in English, Chinese or any other language your buyers use.",
      },
      {
        title: "Sources you can see",
        body: "Qwen's web search returns the sources behind each answer. They show which pages shape what it says about your category.",
      },
      {
        title: "Its own shortlist",
        body: "Qwen's recommendations can differ from other assistants'. Tracking it separately shows gaps you'd otherwise miss.",
      },
    ],
  },
  method: {
    eyebrow: "How AutoSEO tracks Qwen",
    title: "Qwen via Alibaba Cloud Model Studio,",
    muted: "or a simulation.",
    body: "AutoSEO asks Qwen through Alibaba Cloud Model Studio (DashScope) with web search and sources turned on. On a self-hosted instance, add your own Alibaba Cloud key and the API address of your region in Admin → AI Providers. On AutoSEO Cloud, engines run through the providers the Codext team has connected; usage counts toward the included allowance.",
    items: [
      {
        title: "Model Studio API (DashScope)",
        body: "Qwen answers with built-in web search and the sources it used. Newer Qwen models run through the Responses API with its web search tool instead.",
      },
      {
        title: "AI simulation as a fallback",
        body: "If no real backend is available, an AI model with web search can answer in place of Qwen. These answers are labeled “Simulated” and meant as a directional estimate: a real backend always takes priority, and admins can switch the fallback off.",
      },
    ],
  },
  tracked: {
    eyebrow: "What gets tracked",
    title: "Everything Qwen says about your brand",
    items: [
      {
        icon: "radar",
        title: "Brand mentions",
        body: "Whether Qwen names your brand for each prompt, and the mention rate over time.",
      },
      {
        icon: "link",
        title: "Citations",
        body: "The sources Qwen's web search returns with each answer — yours and everyone else's.",
      },
      {
        icon: "swords",
        title: "Share of voice",
        body: "Which competitors Qwen recommends next to you, and in which position.",
      },
      {
        icon: "heart",
        title: "Sentiment and framing",
        body: "How Qwen describes you: the praise, the criticism and the attributes it repeats.",
      },
      {
        icon: "target",
        title: "Best-for picks",
        body: "Where Qwen names a brand as the top pick for a use case, and whether it's you.",
      },
      {
        icon: "map-pin",
        title: "Markets and languages",
        body: "The same prompt in English, Chinese or any other language, for different markets, compared side by side.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track my brand's visibility in Qwen?",
      a: "Add the prompts your customers ask, select Qwen as an engine and set a schedule. AutoSEO runs the prompts with web search, stores every answer with its sources and reports mention rate, citation rate, position and sentiment for your brand and competitors.",
    },
    {
      q: "Does AutoSEO track Qwen Chat?",
      a: "AutoSEO asks Qwen through Alibaba Cloud Model Studio with web search, not the Qwen Chat app itself. The answers show how Qwen's models see your brand and which sources they use.",
    },
    {
      q: "Do I need an Alibaba Cloud key?",
      a: "Not on AutoSEO Cloud — you don't manage provider keys there; engines run through the providers the Codext team has connected (ask us which are enabled). When you self-host, add your own Alibaba Cloud Model Studio key and the API address of your region in Admin → AI Providers. Without it, an AI simulation can stand in, labeled “Simulated” and directional only.",
    },
    {
      q: "Can I track Qwen in Chinese?",
      a: "Yes. Prompts are answered in the language you write them in, so you can ask Qwen in Chinese, English or any other language. You can run them for any of AutoSEO's 143 markets, such as Taiwan, Hong Kong or Singapore.",
    },
    {
      q: "How do I improve my visibility in Qwen?",
      a: "Publish clear answers to the prompts you track, keep your pages crawlable and get mentioned on the sources Qwen already cites. AutoSEO shows those sources and turns the gaps into prioritized tasks.",
    },
    {
      q: "Can I compare Qwen with other AI engines?",
      a: "Yes. Track the same prompts on ChatGPT, Perplexity, Gemini, Claude and more, and compare visibility per engine in one dashboard.",
    },
  ],
  cta: {
    title: "Find out what Qwen says about you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies PlatformPage;
