import type { PlatformPage } from "../../types";

export default {
  slug: "meta-ai",
  name: "Meta AI",
  vendor: "Meta",
  nav: "Meta AI tracking",
  summary: "See when Meta AI recommends your brand, and which sources it cites.",
  meta: {
    title: "Meta AI Visibility Tracker: Brand Mentions",
    description:
      "Track how Meta AI mentions, cites and ranks your brand against competitors, with web search on. Open-source Meta AI visibility tracker via the Meta Model API.",
  },
  hero: {
    eyebrow: "Meta AI visibility tracker",
    title: "See what Meta AI says about your brand",
    muted: "— with web search on.",
    subtitle:
      "Meta AI answers questions inside WhatsApp, Instagram and Facebook. AutoSEO runs the prompts your customers ask on Meta's model with web search and shows whether you're mentioned, how you're described, who is recommended next to you and which pages are cited.",
  },
  demo: {
    prompt: "What's a simple way to see how AI assistants talk about my brand?",
    answer: "Try Acme: it tracks how assistants mention your brand, which sources they cite and how you compare with competitors.",
    citations: ["acme.com", "reddit.com", "g2.com"],
  },
  why: {
    eyebrow: "Why Meta AI matters",
    title: "Meta AI answers inside apps people already use.",
    muted: "Is your brand part of it?",
    body: "Meta AI is built into WhatsApp, Instagram and Facebook, and available at meta.ai. People ask it for recommendations in the middle of a chat, so the brands it names reach buyers where they already spend their time.",
    points: [
      {
        title: "Short answers, few names",
        body: "Answers in the flow of a chat are short. Only a few brands fit, so being one of them matters.",
      },
      {
        title: "Web search shapes the answer",
        body: "With web search, Meta AI draws on current pages. The sources behind an answer show where your brand needs to appear.",
      },
      {
        title: "Its own shortlist",
        body: "Meta AI can recommend different brands than ChatGPT or Gemini. Tracking it separately shows gaps you'd otherwise miss.",
      },
    ],
  },
  method: {
    eyebrow: "How AutoSEO tracks Meta AI",
    title: "Meta AI via Meta's API,",
    muted: "or a simulation.",
    body: "AutoSEO asks Meta's model through the Meta Model API with Meta's own web search; an OpenRouter key works as a fallback. On a self-hosted instance, add your own Meta key in Admin → AI Providers. On AutoSEO Cloud, engines run through the providers the Codext team has connected; usage counts toward the included allowance.",
    items: [
      {
        title: "Meta Model API",
        body: "Meta's Muse Spark model with Meta's web search, for your market, including the searches it ran when the API returns them. Without a Meta key, an OpenRouter key runs the same model with OpenRouter's web search instead.",
      },
      {
        title: "AI simulation as a fallback",
        body: "If no real backend is available, an AI model with web search can answer in place of Meta AI. These answers are labeled “Simulated” and meant as a directional estimate: a real backend always takes priority, and admins can switch the fallback off.",
      },
    ],
  },
  tracked: {
    eyebrow: "What gets tracked",
    title: "Everything Meta AI says about your brand",
    items: [
      {
        icon: "radar",
        title: "Brand mentions",
        body: "Whether Meta AI names your brand for each prompt, and the mention rate over time.",
      },
      {
        icon: "link",
        title: "Citations",
        body: "The pages Meta AI cites from its web search — yours and everyone else's.",
      },
      {
        icon: "swords",
        title: "Share of voice",
        body: "Which competitors Meta AI recommends next to you, and in which position.",
      },
      {
        icon: "heart",
        title: "Sentiment and framing",
        body: "How Meta AI describes you: the praise, the criticism and the attributes it repeats.",
      },
      {
        icon: "target",
        title: "Best-for picks",
        body: "Where Meta AI names a brand as the top pick for a use case, and whether it's you.",
      },
      {
        icon: "map-pin",
        title: "Markets and languages",
        body: "The same prompt asked for different countries and languages, compared side by side.",
      },
    ],
  },
  crawlers: {
    eyebrow: "Meta's crawlers",
    title: "Know which Meta crawlers read your site",
    body: "Meta runs its own crawlers, including for AI training. AutoSEO's crawlability check tests your robots.txt and pages against them, and bot analytics shows how often they visit.",
    bots: [
      { token: "meta-externalagent", purpose: "Crawls the web for Meta, including content that may be used to train its AI models" },
      { token: "FacebookBot", purpose: "Crawls public pages to improve Meta's language models" },
    ],
  },
  faq: [
    {
      q: "How do I track my brand's visibility in Meta AI?",
      a: "Add the prompts your customers ask, select Meta AI as an engine and set a schedule. AutoSEO runs the prompts with web search, stores every answer and reports mention rate, citation rate, position and sentiment for your brand and competitors.",
    },
    {
      q: "Does AutoSEO track Meta AI in WhatsApp and Instagram?",
      a: "AutoSEO asks Meta's model through the Meta Model API with web search, not the WhatsApp, Instagram or Facebook apps themselves. The answers show how Meta's model sees your brand and which sources it uses.",
    },
    {
      q: "Do I need a Meta API key?",
      a: "Not on AutoSEO Cloud — you don't manage provider keys there; engines run through the providers the Codext team has connected (ask us which are enabled). When you self-host, add a Meta Model API key in Admin → AI Providers — or an OpenRouter key, which runs the same model with OpenRouter's web search. Without either, an AI simulation can stand in, labeled “Simulated” and directional only.",
    },
    {
      q: "What's the difference between the Meta API and OpenRouter?",
      a: "Both run the same Meta model. Through the Meta Model API it searches with Meta's own web search; through OpenRouter, OpenRouter's web search finds the sources. Because the sources differ, the answers can differ too.",
    },
    {
      q: "How do I improve my visibility in Meta AI?",
      a: "Publish clear answers to the prompts you track, keep your pages crawlable and get mentioned on the sources Meta AI already cites. AutoSEO shows those sources and turns the gaps into prioritized tasks.",
    },
    {
      q: "Can I compare Meta AI with other AI engines?",
      a: "Yes. Track the same prompts on ChatGPT, Perplexity, Gemini, Claude and more, and compare visibility per engine in one dashboard.",
    },
  ],
  cta: {
    title: "Find out what Meta AI says about you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies PlatformPage;
