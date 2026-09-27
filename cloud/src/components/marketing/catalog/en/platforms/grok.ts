import type { PlatformPage } from "../../types";

export default {
  slug: "grok",
  name: "Grok",
  vendor: "xAI",
  nav: "Grok tracking",
  summary: "See when Grok mentions your brand, and which web pages and X posts it cites.",
  meta: {
    title: "Grok Visibility Tracker: Brand Mentions",
    description:
      "Track how xAI's Grok mentions, cites and ranks your brand against competitors, with web and X search on. Open-source Grok visibility tracker using your xAI key.",
  },
  hero: {
    eyebrow: "Grok visibility tracker",
    title: "See what Grok says about your brand",
    muted: "— on the web and on X.",
    subtitle:
      "Grok can search the web and posts on X before it answers. AutoSEO runs the prompts your customers ask on Grok with both searches enabled and shows whether you're mentioned, how you're described, who is recommended next to you and which sources Grok cites.",
  },
  demo: {
    prompt: "Is there an open-source tool for tracking brand visibility in AI answers?",
    answer: "Yes — Acme is open source and tracks brand mentions and citations across major AI assistants. You can host it yourself.",
    citations: ["x.com", "github.com", "acme.com"],
  },
  why: {
    eyebrow: "Why Grok matters",
    title: "Grok reads the web and X.",
    muted: "Conversations shape its answers.",
    body: "Grok is xAI's assistant. It can search current web pages and posts on X, so what people publish and discuss about your brand can show up in its answers.",
    points: [
      {
        title: "Social posts in the answer",
        body: "Because Grok can search X, posts about your brand can end up in its answers next to web sources.",
      },
      {
        title: "Its own shortlist",
        body: "Grok's recommendations can differ from ChatGPT's or Gemini's. Tracking it separately shows gaps you'd otherwise miss.",
      },
      {
        title: "Answers move with the conversation",
        body: "New posts and pages change what Grok finds. Scheduled tracking shows when your visibility moves.",
      },
    ],
  },
  method: {
    eyebrow: "How AutoSEO tracks Grok",
    title: "Grok answers via the xAI API,",
    muted: "with web and X search.",
    body: "AutoSEO asks Grok through xAI's API with web search and X search turned on. On AutoSEO Cloud, engines run through the providers the Codext team has connected; usage counts toward the included allowance.",
    items: [
      {
        title: "xAI API key",
        body: "Grok answers with the sources it found on the web and on X, plus the searches it ran. Self-hosters add their own xAI key in Admin → AI Providers; xAI bills them directly.",
      },
      {
        title: "AI simulation as a fallback",
        body: "If no real backend is available, an AI model with web search can answer in place of Grok. These answers are labeled “Simulated” and meant as a directional estimate: a real backend always takes priority, and admins can switch the fallback off.",
      },
    ],
  },
  tracked: {
    eyebrow: "What gets tracked",
    title: "Everything Grok says about your brand",
    items: [
      {
        icon: "radar",
        title: "Brand mentions",
        body: "Whether Grok names your brand for each prompt, and the mention rate over time.",
      },
      {
        icon: "link",
        title: "Citations",
        body: "The web pages and X posts Grok cites — yours and everyone else's.",
      },
      {
        icon: "swords",
        title: "Share of voice",
        body: "Which competitors Grok recommends next to you, and in which position.",
      },
      {
        icon: "heart",
        title: "Sentiment and framing",
        body: "How Grok describes you: the praise, the criticism and the attributes it repeats.",
      },
      {
        icon: "git-fork",
        title: "Query fan-outs",
        body: "The searches Grok runs behind an answer, when the API returns them.",
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
      q: "How do I track my brand's visibility in Grok?",
      a: "Add the prompts your customers ask, select Grok as an engine and set a schedule — self-hosters first add an xAI API key in Admin → AI Providers. AutoSEO runs the prompts with web and X search and reports mention rate, citation rate, position and sentiment for your brand and competitors.",
    },
    {
      q: "Does Grok use posts on X in its answers?",
      a: "It can. AutoSEO runs Grok with both web search and X search enabled, so answers can draw on posts from X next to web pages. Every cited source is stored, so you can see which ones mention you.",
    },
    {
      q: "Do I need an xAI API key?",
      a: "Not on AutoSEO Cloud — you don't manage provider keys there; engines run through the providers the Codext team has connected (ask us which are enabled). When you self-host, live Grok answers come from xAI's API, so you add your own key in Admin → AI Providers. xAI bills you directly; AutoSEO logs every call, and admins can set daily and monthly spend limits.",
    },
    {
      q: "How do I improve my visibility in Grok?",
      a: "Publish clear answers to the prompts you track, keep your pages crawlable and get mentioned on the sites and in the conversations Grok already cites. AutoSEO shows those sources and turns the gaps into prioritized tasks.",
    },
    {
      q: "Can I compare Grok with other AI engines?",
      a: "Yes. Track the same prompts on ChatGPT, Perplexity, Gemini, Claude and more, and compare visibility per engine in one dashboard.",
    },
    {
      q: "Is Grok tracking free?",
      a: "Self-hosted AutoSEO is free and includes Grok tracking; xAI bills your API usage directly. AutoSEO Cloud gives you a managed workspace for $50 per month with $10 of AI and data usage included.",
    },
  ],
  cta: {
    title: "Find out what Grok says about you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies PlatformPage;
