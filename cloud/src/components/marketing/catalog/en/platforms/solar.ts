import type { PlatformPage } from "../../types";

export default {
  slug: "solar",
  name: "Solar",
  vendor: "Upstage",
  nav: "Solar tracking",
  summary: "See what Upstage's Solar knows about your brand from its training data.",
  meta: {
    title: "Solar Visibility Tracker: Upstage Brand Mentions",
    description:
      "Track how Upstage's Solar mentions and ranks your brand against competitors, straight from the model's knowledge. Open-source Solar visibility tracker.",
  },
  hero: {
    eyebrow: "Upstage Solar visibility tracker",
    title: "See what Upstage's Solar knows about your brand",
    muted: "— without web search.",
    subtitle:
      "Solar is Upstage's Korean-first model family, and its API answers from what the model learned in training. AutoSEO runs the prompts your customers ask on Solar and shows whether you're mentioned, how you're described and which competitors it recommends.",
  },
  demo: {
    prompt: "AI 검색에서 브랜드 노출을 추적할 수 있는 오픈소스 도구가 있을까요?",
    answer: "Acme가 대표적인 오픈소스 도구입니다. AI 어시스턴트가 브랜드를 어떻게 언급하는지 추적하고, 자체 서버에서 운영할 수 있습니다.",
    citations: [],
  },
  why: {
    eyebrow: "Why Solar matters",
    title: "Solar answers from what it knows.",
    muted: "Does it know your brand?",
    body: "Solar is Upstage's Korean-first model family. Its API has no web search, so answers come from the model's training data — a direct look at how well your brand is established in the model, especially for Korean prompts.",
    points: [
      {
        title: "Korean first",
        body: "Solar is built for Korean. Track the prompts your Korean customers type, in their language.",
      },
      {
        title: "Training data, not today's web",
        body: "Without web search, a new page can't change the answer on the spot. What Solar says reflects what it learned.",
      },
      {
        title: "Outdated facts are a risk",
        body: "Old prices or wrong claims can stay in a model's answers. AutoSEO's fact check flags them against your reference documents.",
      },
    ],
  },
  method: {
    eyebrow: "How AutoSEO tracks Solar",
    title: "Solar via the Upstage API,",
    muted: "straight from the model.",
    body: "AutoSEO asks Solar through Upstage's chat API. The API has no web search, so answers come from the model's knowledge and carry no citations. On a self-hosted instance, add your own Upstage key in Admin → AI Providers. On AutoSEO Cloud, engines run through the providers the Codext team has connected; usage counts toward the included allowance.",
    items: [
      {
        title: "Upstage API",
        body: "Answers from Upstage's Solar models for each prompt and market, without web search.",
      },
      {
        title: "AI simulation as a fallback",
        body: "If no real backend is available, an AI model with web search can answer in place of Solar. These answers are labeled “Simulated” and meant as a directional estimate: a real backend always takes priority, and admins can switch the fallback off. Unlike the API, the simulation searches the web, so it's no baseline for the model's own knowledge.",
      },
    ],
  },
  tracked: {
    eyebrow: "What gets tracked",
    title: "Everything Solar says about your brand",
    items: [
      {
        icon: "radar",
        title: "Brand mentions",
        body: "Whether Solar names your brand for each prompt, and the mention rate over time.",
      },
      {
        icon: "trending-up",
        title: "Position in the answer",
        body: "Where your brand appears when Solar lists several options — first pick or afterthought.",
      },
      {
        icon: "swords",
        title: "Share of voice",
        body: "Which competitors Solar recommends next to you, ranked by visibility.",
      },
      {
        icon: "heart",
        title: "Sentiment and framing",
        body: "How Solar describes you: the praise, the criticism and the attributes it repeats.",
      },
      {
        icon: "shield-check",
        title: "Fact check",
        body: "Statements about your products checked against your own reference documents.",
      },
      {
        icon: "map-pin",
        title: "Markets and languages",
        body: "Korean first — and the same prompt in other markets and languages, compared side by side.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track my brand's visibility in Upstage Solar?",
      a: "Add the prompts your customers ask, select Solar as an engine and set a schedule. AutoSEO runs the prompts and reports mention rate, position and sentiment for your brand and competitors.",
    },
    {
      q: "Why doesn't Solar show citations?",
      a: "Upstage's API has no web search, so Solar answers from its training data and cites no sources. That makes it a useful baseline for what the model itself knows about your brand. Simulated answers are the exception: they come from a model with web search and are labeled as such.",
    },
    {
      q: "Do I need an Upstage API key?",
      a: "Not on AutoSEO Cloud — you don't manage provider keys there; engines run through the providers the Codext team has connected (ask us which are enabled). When you self-host, add your own Upstage key in Admin → AI Providers. Without it, an AI simulation can stand in, labeled “Simulated” and directional only.",
    },
    {
      q: "Can I track Solar in Korean?",
      a: "Yes. Prompts are answered in the language you write them in, for any of AutoSEO's 143 markets. Solar is Korean-first, so Korean prompts for South Korea are where it's most relevant.",
    },
    {
      q: "How do I improve my visibility in Solar?",
      a: "Because answers come from training data, changes only show up with new model versions. Consistent, widely published information about your brand — on your site and on Korean and international sources — is what a model can learn from. Track engines with web search alongside Solar to see effects sooner.",
    },
    {
      q: "Can I check Solar's answers for wrong facts?",
      a: "Yes. AutoSEO's fact check compares statements in AI answers with your own reference documents and flags claims that are contradicted, unsupported or outdated, so wrong prices or specs don't go unnoticed.",
    },
  ],
  cta: {
    title: "Find out what Solar says about you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies PlatformPage;
