import type { FeaturePage } from "../../types";

export default {
  slug: "ai-competitor-analysis",
  nav: "AI competitor analysis",
  summary: "See which brands AI recommends instead of you, and where they win.",
  meta: {
    title: "AI Competitor Analysis & Share of Voice",
    description:
      "AI competitor analysis for ChatGPT, Perplexity, Gemini and AI Overviews: share of voice, position, sentiment and head-to-head results for every brand AI names.",
  },
  hero: {
    eyebrow: "AI competitor analysis",
    title: "AI competitor analysis for every answer.",
    muted: "See who AI recommends instead.",
    subtitle:
      "AutoSEO ranks every brand that AI engines mention next to yours — by visibility, share of voice, position, citations and sentiment — and shows the prompts, sources and comparisons where competitors win.",
  },
  visual: "ranking",
  screenshot: {
    src: "/screenshots/competitors.png",
    darkSrc: "/screenshots/competitors-dark.png",
    alt: "AutoSEO competitor analysis with mention rate over time and a visibility ranking of competing brands",
    url: "ai/competitors",
  },
  stats: [
    { value: 12, label: "Competitor metrics", note: "Visibility to citation share" },
    { value: 16, label: "AI engines", note: "Compared side by side" },
    { value: 3, label: "Chart views", note: "Line, bar and heatmap" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "MIT licensed, every feature" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "AI answers are a shortlist.",
    muted: "Your competitors are on it.",
    body: "When an assistant answers a buying question, it names a few brands and puts them in order. Whoever is named first, described best and cited most has the advantage. Competitor analysis shows who that is for each prompt and engine.",
    points: [
      {
        title: "AI names brands you don't track",
        body: "Answers often recommend niche specialists, marketplaces or newcomers. Without a list of who actually gets named, you benchmark against the wrong companies.",
      },
      {
        title: "Position inside the answer matters",
        body: "Being mentioned fifth in a list of five is not the same as being the top pick. Average position, mention depth and #1 share show the difference.",
      },
      {
        title: "Gaps point to concrete work",
        body: "Prompts where a competitor appears and you don't, and the sources cited for them, tell you where to publish, pitch or improve.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What you can compare",
    title: "Every brand AI names,",
    muted: "ranked against you.",
    items: [
      {
        icon: "chart",
        title: "Visibility ranking",
        body: "Rank every brand by visibility, mention rate, share of voice, average position, mention depth, citation rate and sentiment, with changes against the previous period.",
      },
      {
        icon: "trending-up",
        title: "Trends by engine and tag",
        body: "Chart any metric over time as lines, bars or a heatmap, and slice it by AI engine or prompt tag.",
      },
      {
        icon: "users",
        title: "Suggested competitors",
        body: "Brands that engines name alongside you but you don't track yet, with answers, prompts, engines and average position. Add them to your list in one click.",
      },
      {
        icon: "swords",
        title: "Head-to-head",
        body: "When you and a competitor appear in the same answer, see who is named first per engine, and which direct comparisons AI decides in whose favor.",
      },
      {
        icon: "target",
        title: "Prompt gaps",
        body: "Every prompt where a competitor is named and you aren't, so you know which questions to win back first.",
      },
      {
        icon: "link",
        title: "Their cited sources",
        body: "The pages AI cites in answers that name a competitor — the reviews, lists and articles behind their visibility.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From tracked prompts to competitive gaps",
    muted: "in three steps.",
    items: [
      {
        title: "Track your prompts",
        body: "AutoSEO runs your prompts on the engines and markets you choose and stores every answer.",
      },
      {
        title: "Confirm your competitors",
        body: "Accept suggested brands or add competitors with their domain and alternative spellings, so every mention is matched correctly.",
      },
      {
        title: "Close the gaps",
        body: "Open a competitor to see lost prompts, head-to-head results and cited sources. Lost comparisons and share-of-voice gaps become prioritized tasks.",
      },
    ],
  },
  faq: [
    {
      q: "What is AI competitor analysis?",
      a: "AI competitor analysis compares how often and how favorably AI assistants mention your brand versus competing brands for the same questions. AutoSEO measures visibility, share of voice, position, citations and sentiment for every brand in the answers, per engine and over time.",
    },
    {
      q: "How do I see which competitors ChatGPT recommends?",
      a: "Track the prompts your buyers ask with ChatGPT enabled. AutoSEO detects the brands mentioned in the answers, suggests the ones you don't track yet and ranks all of them next to you. The same works for Perplexity, Gemini, Claude, Google AI Overviews and the other engines.",
    },
    {
      q: "What is share of voice in AI search?",
      a: "Share of voice is your brand's answer appearances divided by the answer appearances of all tracked brands. It shows how much of the conversation you own compared with your competitors for the prompts you track.",
    },
    {
      q: "How does AutoSEO detect competitor mentions?",
      a: "Brand names, alternative spellings and domains are matched in every answer. An AI analysis pass also finds brands that aren't on your list yet and extracts sentiment, recommendations and direct comparisons. It runs on your local Claude Code or Codex agent or on a configured AI provider.",
    },
    {
      q: "Can I check a competitor without tracking prompts?",
      a: "Yes. Brand Lookup queries DataForSEO's AI mention data for ChatGPT and Google AI Overviews for any domain or keyword. It returns mentions, top queries, cited pages and share of voice against the competitors you enter.",
    },
    {
      q: "Can I export competitor data?",
      a: "Yes. The visibility ranking exports to CSV, and the report builder has blocks for the competitor ranking and visibility against competitors. The REST API returns the ranking, and the MCP server adds gap analysis and head-to-head data.",
    },
    {
      q: "Is AI competitor analysis included in the free version?",
      a: "Yes. Competitor analysis is part of the open-source AutoSEO app and free to self-host; DataForSEO and AI API usage is then billed by those providers. AutoSEO Cloud gives you a managed workspace for $50 per month with $10 of AI and data usage included.",
    },
  ],
  related: ["ai-visibility-tracking", "ai-brand-sentiment", "ai-citation-tracking", "ai-seo-tasks"],
  cta: {
    title: "Find out who AI recommends instead of you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
