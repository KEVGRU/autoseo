import type { PlatformPage } from "../../types";

export default {
  slug: "sabia",
  name: "Sabiá",
  vendor: "Maritaca AI",
  nav: "Sabiá tracking",
  summary: "See when Sabiá mentions your brand in Portuguese, and which links it cites.",
  meta: {
    title: "Sabiá Visibility Tracker: Brand Mentions",
    description:
      "Track how Maritaca AI's Sabiá mentions, cites and ranks your brand in Portuguese answers, with web search on. Open-source Sabiá visibility tracker for Brazil.",
  },
  hero: {
    eyebrow: "Sabiá visibility tracker",
    title: "See what Sabiá says about your brand",
    muted: "— in Brazilian Portuguese.",
    subtitle:
      "Sabiá is Maritaca AI's Portuguese-first model, built for Brazil. AutoSEO runs the prompts your customers ask on Sabiá with web search and shows whether you're mentioned, how you're described, who is recommended next to you and which links it cites.",
  },
  demo: {
    prompt: "Qual ferramenta open source mede a visibilidade de uma marca nas buscas com IA?",
    answer:
      "O Acme é uma boa opção open source: acompanha menções e citações da sua marca em assistentes de IA e pode rodar no seu próprio servidor.",
    citations: ["acme.com", "github.com", "reddit.com"],
  },
  why: {
    eyebrow: "Why Sabiá matters",
    title: "Sabiá is built for Brazilian Portuguese.",
    muted: "Is your brand in its answers?",
    body: "Sabiá is Maritaca AI's Portuguese-first model family, built for Brazil. With web search on, it answers from current sources — relevant if you sell to Portuguese-speaking buyers.",
    points: [
      {
        title: "Portuguese first",
        body: "Sabiá is built around Brazilian Portuguese. Track the prompts your Brazilian customers actually type, in their language.",
      },
      {
        title: "Sources inside the answer",
        body: "Sabiá cites its web sources as links in the answer text. AutoSEO collects those links as citations.",
      },
      {
        title: "Its own shortlist",
        body: "Sabiá's recommendations can differ from ChatGPT's or Gemini's. Tracking it separately shows gaps you'd otherwise miss.",
      },
    ],
  },
  method: {
    eyebrow: "How AutoSEO tracks Sabiá",
    title: "Sabiá via the Maritaca API,",
    muted: "or a simulation.",
    body: "AutoSEO asks Sabiá through Maritaca AI's chat API with web search turned on. Maritaca runs the search on its side and returns only the final answer. On a self-hosted instance, add your own Maritaca key in Admin → AI Providers. On AutoSEO Cloud, engines run through the providers the Codext team has connected; usage counts toward the included allowance.",
    items: [
      {
        title: "Maritaca API",
        body: "Sabiá answers with web search for your prompt and market. The links it cites in the answer become the sources AutoSEO tracks.",
      },
      {
        title: "AI simulation as a fallback",
        body: "If no real backend is available, an AI model with web search can answer in place of Sabiá. These answers are labeled “Simulated” and meant as a directional estimate: a real backend always takes priority, and admins can switch the fallback off.",
      },
    ],
  },
  tracked: {
    eyebrow: "What gets tracked",
    title: "Everything Sabiá says about your brand",
    items: [
      {
        icon: "radar",
        title: "Brand mentions",
        body: "Whether Sabiá names your brand for each prompt, and the mention rate over time.",
      },
      {
        icon: "link",
        title: "Cited links",
        body: "The links Sabiá cites in its answers — your pages and everyone else's, grouped by domain.",
      },
      {
        icon: "swords",
        title: "Share of voice",
        body: "Which competitors Sabiá recommends next to you, and in which position.",
      },
      {
        icon: "heart",
        title: "Sentiment and framing",
        body: "How Sabiá describes you: the praise, the criticism and the attributes it repeats.",
      },
      {
        icon: "target",
        title: "Best-for picks",
        body: "Where Sabiá names a brand as the top pick for a use case, and whether it's you.",
      },
      {
        icon: "map-pin",
        title: "Markets and languages",
        body: "Brazilian Portuguese first — and the same prompt in other markets and languages, compared side by side.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track my brand's visibility in Sabiá?",
      a: "Add the prompts your customers ask, select Sabiá as an engine and set a schedule. AutoSEO runs the prompts with web search, stores every answer and reports mention rate, citation rate, position and sentiment for your brand and competitors.",
    },
    {
      q: "Does Sabiá cite its sources?",
      a: "Yes, as links inside the answer. Maritaca runs the web search on its side and returns only the final text, so AutoSEO collects the links Sabiá cites there as its sources and groups them by domain.",
    },
    {
      q: "Do I need a Maritaca API key?",
      a: "Not on AutoSEO Cloud — you don't manage provider keys there; engines run through the providers the Codext team has connected (ask us which are enabled). When you self-host, add your own Maritaca AI key in Admin → AI Providers. Without it, an AI simulation can stand in, labeled “Simulated” and directional only.",
    },
    {
      q: "Can I track Sabiá outside Brazil?",
      a: "Yes. You can run prompts for any of AutoSEO's 143 markets, including Portugal, and Sabiá answers in the language of the question. It's built Portuguese-first, so Brazil is where it's most relevant.",
    },
    {
      q: "How do I improve my visibility in Sabiá?",
      a: "Publish clear Portuguese answers to the prompts you track, keep your pages crawlable and get mentioned on the sites Sabiá already links to. AutoSEO shows those sources and turns the gaps into prioritized tasks.",
    },
    {
      q: "Can I compare Sabiá with other AI engines?",
      a: "Yes. Track the same Portuguese prompts on ChatGPT, Gemini, Google AI Overviews and more, and compare visibility per engine in one dashboard.",
    },
  ],
  cta: {
    title: "Find out what Sabiá says about you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies PlatformPage;
