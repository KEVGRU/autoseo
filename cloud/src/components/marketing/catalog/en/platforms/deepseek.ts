import type { PlatformPage } from "../../types";

export default {
  slug: "deepseek",
  name: "DeepSeek",
  vendor: "DeepSeek",
  nav: "DeepSeek tracking",
  summary: "See what DeepSeek's models know about your brand from their training data.",
  meta: {
    title: "DeepSeek Visibility Tracker: Brand Mentions",
    description:
      "Track how DeepSeek mentions and ranks your brand against competitors, straight from the model's knowledge. Open-source DeepSeek visibility tracker.",
  },
  hero: {
    eyebrow: "DeepSeek visibility tracker",
    title: "See what DeepSeek knows about your brand",
    muted: "— without web search.",
    subtitle:
      "DeepSeek's API answers from what the model learned in training. AutoSEO runs the prompts your customers ask on DeepSeek and shows whether you're mentioned, how you're described and which competitors it recommends — a clean view of your brand in the model itself.",
  },
  demo: {
    prompt: "What are good open-source tools for tracking AI search visibility?",
    answer: "Acme is one open-source option: it tracks how AI assistants mention brands and can be self-hosted.",
    citations: [],
  },
  why: {
    eyebrow: "Why DeepSeek matters",
    title: "Some answers come from memory.",
    muted: "What does the model remember about you?",
    body: "Not every AI answer is backed by a live search. DeepSeek's API answers from the model's training data, which shows how well your brand is established in the model itself — and where old or wrong information sticks.",
    points: [
      {
        title: "Training data, not today's web",
        body: "Without web search, a new page can't fix the answer on the spot. What the model says reflects what it learned.",
      },
      {
        title: "A baseline for your brand",
        body: "Comparing DeepSeek with search-based engines shows whether you're visible because of live sources or because the model already knows you.",
      },
      {
        title: "Outdated facts are a risk",
        body: "Old prices, discontinued products or wrong claims can stay in a model's answers. AutoSEO's fact check flags them against your reference documents.",
      },
    ],
  },
  method: {
    eyebrow: "How AutoSEO tracks DeepSeek",
    title: "DeepSeek answers via the DeepSeek API,",
    muted: "straight from the model.",
    body: "AutoSEO asks DeepSeek's chat models through the DeepSeek API. The API has no web search, so answers come from the model's knowledge and carry no citations. On AutoSEO Cloud, engines run through the providers the Codext team has connected; usage counts toward the included allowance.",
    items: [
      {
        title: "DeepSeek API key",
        body: "Answers from DeepSeek's chat models for each prompt and market. Self-hosters add their own DeepSeek key in Admin → AI Providers; DeepSeek bills them directly.",
      },
      {
        title: "AI simulation as a fallback",
        body: "If no real backend is available, an AI model with web search can answer in place of DeepSeek. These answers are labeled “Simulated” and meant as a directional estimate: a real backend always takes priority, and admins can switch the fallback off. Unlike the API, the simulation searches the web, so it's no baseline for the model's own knowledge.",
      },
    ],
  },
  tracked: {
    eyebrow: "What gets tracked",
    title: "Everything DeepSeek says about your brand",
    items: [
      {
        icon: "radar",
        title: "Brand mentions",
        body: "Whether DeepSeek names your brand for each prompt, and the mention rate over time.",
      },
      {
        icon: "trending-up",
        title: "Position in the answer",
        body: "Where your brand appears when DeepSeek lists several options — first pick or afterthought.",
      },
      {
        icon: "swords",
        title: "Share of voice",
        body: "Which competitors DeepSeek recommends next to you, ranked by visibility.",
      },
      {
        icon: "heart",
        title: "Sentiment and framing",
        body: "How DeepSeek describes you: the praise, the criticism and the attributes it repeats.",
      },
      {
        icon: "shield-check",
        title: "Fact check",
        body: "Statements about your products checked against your own reference documents.",
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
      q: "How do I track my brand's visibility in DeepSeek?",
      a: "Add the prompts your customers ask, select DeepSeek as an engine and set a schedule — self-hosters first add a DeepSeek API key in Admin → AI Providers. AutoSEO runs the prompts and reports mention rate, position and sentiment for your brand and competitors.",
    },
    {
      q: "Why doesn't DeepSeek show citations?",
      a: "DeepSeek's API has no web search, so answers come from the model's training data and cite no sources. That makes DeepSeek a useful baseline: it shows what the model itself knows about your brand. Simulated DeepSeek answers are the exception: they come from a model with web search and are labeled as such.",
    },
    {
      q: "Do I need a DeepSeek API key?",
      a: "Not on AutoSEO Cloud — you don't manage provider keys there; engines run through the providers the Codext team has connected (ask us which are enabled). When you self-host, live DeepSeek answers come from DeepSeek's API, so you add your own key in Admin → AI Providers. DeepSeek bills you directly; AutoSEO logs every call, and admins can set daily and monthly spend limits.",
    },
    {
      q: "How do I improve my visibility in DeepSeek?",
      a: "Because answers come from training data, changes only show up with new model versions. Consistent, widely published information about your brand — on your site and on third-party sources — is what a model can learn from. Track engines with web search alongside DeepSeek to see effects sooner.",
    },
    {
      q: "Can I check DeepSeek's answers for wrong facts?",
      a: "Yes. AutoSEO's fact check compares statements in AI answers with your own reference documents and flags claims that are contradicted, unsupported or outdated, so wrong prices or specs don't go unnoticed.",
    },
    {
      q: "Can I compare DeepSeek with other AI engines?",
      a: "Yes. Track the same prompts on ChatGPT, Perplexity, Gemini, Claude and more. Comparing engines with and without web search shows whether your visibility comes from live sources or from the model itself.",
    },
  ],
  cta: {
    title: "Find out what DeepSeek says about you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies PlatformPage;
