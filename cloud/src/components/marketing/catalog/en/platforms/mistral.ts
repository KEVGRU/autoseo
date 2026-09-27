import type { PlatformPage } from "../../types";

export default {
  slug: "mistral",
  name: "Mistral",
  vendor: "Mistral AI",
  nav: "Mistral tracking",
  summary: "See when Mistral's models mention your brand, and which sources they cite.",
  meta: {
    title: "Mistral Visibility Tracker: Le Chat Mentions",
    description:
      "Track how the Mistral AI models behind Le Chat mention, cite and rank your brand, with web search on. Open-source Mistral visibility tracker using your API key.",
  },
  hero: {
    eyebrow: "Mistral visibility tracker",
    title: "See how Mistral talks about your brand",
    muted: "— with web search on.",
    subtitle:
      "Mistral AI builds the models behind Le Chat. AutoSEO runs the prompts your customers ask on Mistral's models with web search and shows whether you're mentioned, how you're described, who is recommended next to you and which pages are cited.",
  },
  demo: {
    prompt: "Which AI visibility tools can I host in the EU?",
    answer: "Acme is open source, so you can run it on your own server in the EU and track how AI assistants mention your brand.",
    citations: ["acme.com", "github.com", "reddit.com"],
  },
  why: {
    eyebrow: "Why Mistral matters",
    title: "A European AI assistant",
    muted: "with its own view of your market.",
    body: "Mistral AI is a French AI company, and Le Chat is its assistant. With web search on, its models draw on current pages and build their own shortlists — so your visibility there can differ from what you see in ChatGPT or Gemini.",
    points: [
      {
        title: "Relevant in European markets",
        body: "If you sell in Europe, Mistral is an assistant your buyers may use. Track it in the markets and languages you care about.",
      },
      {
        title: "Different sources, different picks",
        body: "Mistral searches the web on its own terms. The pages it cites show which sources shape its view of your category.",
      },
      {
        title: "Changes you'd otherwise miss",
        body: "New model versions and new pages change answers without notice. Scheduled tracking shows when it happened.",
      },
    ],
  },
  method: {
    eyebrow: "How AutoSEO tracks Mistral",
    title: "Mistral answers via the Mistral API,",
    muted: "with web search.",
    body: "AutoSEO asks Mistral's models through the Mistral API with the web search tool enabled. On AutoSEO Cloud, engines run through the providers the Codext team has connected; usage counts toward the included allowance.",
    items: [
      {
        title: "Mistral API key",
        body: "Answers from Mistral's models with the sources they cite. Self-hosters add their own Mistral key in Admin → AI Providers; Mistral bills them directly.",
      },
      {
        title: "AI simulation as a fallback",
        body: "If no real backend is available, an AI model with web search can answer in place of Mistral. These answers are labeled “Simulated” and meant as a directional estimate: a real backend always takes priority, and admins can switch the fallback off.",
      },
    ],
  },
  tracked: {
    eyebrow: "What gets tracked",
    title: "Everything Mistral says about your brand",
    items: [
      {
        icon: "radar",
        title: "Brand mentions",
        body: "Whether Mistral names your brand for each prompt, and the mention rate over time.",
      },
      {
        icon: "link",
        title: "Citations",
        body: "The pages Mistral cites when it searches the web — yours and everyone else's.",
      },
      {
        icon: "swords",
        title: "Share of voice",
        body: "Which competitors Mistral recommends next to you, and in which position.",
      },
      {
        icon: "heart",
        title: "Sentiment and framing",
        body: "How Mistral describes you: the praise, the criticism and the attributes it repeats.",
      },
      {
        icon: "target",
        title: "Best-for picks",
        body: "Where Mistral names a brand as the top pick for a use case, and whether it's you.",
      },
      {
        icon: "map-pin",
        title: "Markets and languages",
        body: "The same prompt asked in French, German, English or any other language, compared side by side.",
      },
    ],
  },
  crawlers: {
    eyebrow: "Mistral's crawler",
    title: "Make sure Mistral can read your site",
    body: "Mistral fetches pages for Le Chat users with its own user agent. AutoSEO's crawlability check tests your robots.txt and pages against it, and bot analytics shows how often it visits.",
    bots: [{ token: "MistralAI-User", purpose: "Fetches pages when a Le Chat user's request needs them" }],
  },
  faq: [
    {
      q: "How do I track my brand's visibility in Mistral?",
      a: "Add the prompts your customers ask, select Mistral as an engine and set a schedule — self-hosters first add a Mistral API key in Admin → AI Providers. AutoSEO runs the prompts with web search and reports mention rate, citation rate, position and sentiment for your brand and competitors.",
    },
    {
      q: "Does AutoSEO track Le Chat?",
      a: "AutoSEO asks Mistral's models through the Mistral API with web search, not the Le Chat app itself. The answers show how Mistral's models see your brand and which sources they use.",
    },
    {
      q: "Do I need a Mistral API key?",
      a: "Not on AutoSEO Cloud — you don't manage provider keys there; engines run through the providers the Codext team has connected (ask us which are enabled). When you self-host, live Mistral answers come from Mistral's API, so you add your own key in Admin → AI Providers. Mistral bills you directly; AutoSEO logs every call, and admins can set daily and monthly spend limits.",
    },
    {
      q: "Can I track Mistral in French or German?",
      a: "Yes. Prompts are answered in the language you write them in, for any of AutoSEO's 143 markets, so you can compare how Mistral answers in France, Germany or anywhere else.",
    },
    {
      q: "How do I improve my visibility in Mistral?",
      a: "Allow MistralAI-User in your robots.txt, publish clear answers to the prompts you track and get mentioned on the sources Mistral already cites. AutoSEO turns those gaps into prioritized tasks.",
    },
    {
      q: "Can I compare Mistral with other AI engines?",
      a: "Yes. Track the same prompts on ChatGPT, Perplexity, Gemini, Claude and more, and compare visibility per engine in one dashboard.",
    },
  ],
  cta: {
    title: "Find out what Mistral says about you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies PlatformPage;
