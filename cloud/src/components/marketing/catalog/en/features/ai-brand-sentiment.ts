import type { FeaturePage } from "../../types";

export default {
  slug: "ai-brand-sentiment",
  nav: "AI brand sentiment",
  summary: "What AI engines praise and criticize about your brand, and whom they recommend.",
  meta: {
    title: "AI Brand Sentiment Analysis for ChatGPT & Co.",
    description:
      "AI brand sentiment analysis: see what ChatGPT, Perplexity and Gemini praise and criticize about your brand, with verbatim quotes and competitor comparisons.",
  },
  hero: {
    eyebrow: "AI brand sentiment",
    title: "AI brand sentiment, quote by quote.",
    muted: "Know how AI describes you.",
    subtitle:
      "AutoSEO reads every tracked answer and extracts what AI engines praise and criticize about you and your competitors — with a 0–100 sentiment score, themes, verbatim quotes and the brands they recommend instead.",
  },
  visual: "sentiment",
  screenshot: {
    src: "/screenshots/sentiment.png",
    alt: "AutoSEO sentiment overview with a sentiment score, praise and criticism over time and the most praised and criticized attributes",
    url: "ai/sentiment",
  },
  stats: [
    { value: 100, prefix: "0–", label: "Sentiment score", note: "80 and above is strongly positive" },
    { value: 3, label: "Statement types", note: "Praise, neutral, criticism" },
    { value: 5, label: "Sentiment views", note: "From overview to recommendations" },
    { value: 16, label: "AI engines", note: "Filter by engine and tag" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "Being mentioned isn't enough.",
    muted: "How AI describes you shapes the decision.",
    body: "An answer can name your brand and still steer buyers away: too expensive, hard to set up, weaker support. Those judgments repeat in every conversation that asks the same question. Sentiment analysis makes them visible, with the exact words.",
    points: [
      {
        title: "AI repeats what it reads",
        body: "Engines summarize reviews, forums and comparison articles. Old complaints and outdated facts keep showing up until the sources behind them change.",
      },
      {
        title: "Recommendations beat mentions",
        body: "Many answers list several brands but recommend one. Knowing when AI names you and then picks someone else shows where the real gap is.",
      },
      {
        title: "Themes show what to fix",
        body: "Grouping statements by aspect, such as price, support or ease of use, turns scattered quotes into a clear list of perception problems.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What you can see",
    title: "Every judgment AI makes about you,",
    muted: "with the quote behind it.",
    items: [
      {
        icon: "heart",
        title: "Sentiment score",
        body: "A 0–100 score per brand, based on how each answer portrays it, with the share of praise, neutral and critical statements and the trend over time.",
      },
      {
        icon: "message-square",
        title: "Praise and criticism",
        body: "Every statement AI makes about a brand, grouped by theme and attribute, with the verbatim quote and a link to the full answer.",
      },
      {
        icon: "layers",
        title: "Perception by theme",
        body: "A brand shape across themes like price, quality or service, and which brand leads each attribute.",
      },
      {
        icon: "swords",
        title: "Compare with a competitor",
        body: "Put any tracked competitor next to your brand in every chart and see where AI describes them better — or worse.",
      },
      {
        icon: "check-circle",
        title: "Recommendations",
        body: "Which brand AI picks for each situation, such as best for beginners or best budget option, and the answers that mention you but recommend someone else.",
      },
      {
        icon: "list-checks",
        title: "Reputation tasks",
        body: "Recurring criticism becomes prioritized tasks with the quotes, engines and prompts attached as evidence.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From answer to perception",
    muted: "in three steps.",
    items: [
      {
        title: "Track prompts across engines",
        body: "Your prompts run on a daily, weekly or monthly schedule, and every answer is stored.",
      },
      {
        title: "Every answer is analyzed",
        body: "An AI pass on your local Claude Code or Codex agent, or on a configured AI provider, extracts sentiment, statements, picks and comparisons from the answer text alone.",
      },
      {
        title: "Fix the sources, then measure",
        body: "Read the quotes, find the pages behind them and follow the score over time to see whether your changes land.",
      },
    ],
  },
  faq: [
    {
      q: "What is AI brand sentiment?",
      a: "AI brand sentiment describes how positively or negatively AI assistants portray your brand in their answers. AutoSEO scores it from 0 to 100 per brand and breaks it down into praise, neutral and critical statements with the exact quotes.",
    },
    {
      q: "How do I find out what ChatGPT says about my brand?",
      a: "Track the prompts your customers ask with ChatGPT enabled. AutoSEO stores every answer and extracts each statement about your brand, so you can read what ChatGPT praises and criticizes and how that changes over time.",
    },
    {
      q: "How is the AI sentiment score calculated?",
      a: "Each answer is analyzed for how it portrays each tracked brand, from 0 (very negative) to 100 (very positive), and the scores are averaged for the period. 80 and above counts as strongly positive, 60–79 as positive, 40–59 as neutral and below 40 as critical.",
    },
    {
      q: "Can I compare brand sentiment with my competitors?",
      a: "Yes. Select any tracked competitor to compare scores, praise and criticism, perception by theme and who leads each attribute. Head-to-head claims show which brand AI favors when it compares the two directly.",
    },
    {
      q: "Why does AI mention my brand but recommend a competitor?",
      a: "Answers often list several options and then pick one for a specific need. The Recommendations view shows the answers that mention you but recommend another brand, and which brand AI picks for each situation. Open any of them to read the full answer and its sources.",
    },
    {
      q: "Which AI engines are included in the sentiment analysis?",
      a: "Every engine you track: ChatGPT (search and app), Perplexity, Google AI Overviews, Google AI Mode, Gemini, Claude, Microsoft Copilot, Grok, Mistral, DeepSeek, Meta AI, Qwen, Kimi, Sabiá and Solar. You can filter every sentiment view by engine, prompt tag and period.",
    },
    {
      q: "Is AI sentiment analysis free?",
      a: "Sentiment analysis is part of the open-source AutoSEO app and free to self-host with your own API keys or a local Claude Code or Codex agent. AutoSEO Cloud gives you a managed workspace for $50 per month with $10 of AI and data usage included, and you can connect your own Claude Code or Codex there too.",
    },
  ],
  related: ["ai-competitor-analysis", "ai-fact-check", "ai-visibility-tracking", "report-builder"],
  cta: {
    title: "Read what AI tells buyers about your brand",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
