import type { FeaturePage } from "../../types";

export default {
  slug: "query-fanout-analysis",
  nav: "Query fan-out analysis",
  summary: "The searches AI engines run behind the scenes, turned into content plans.",
  meta: {
    title: "Query Fan-Out Analysis for ChatGPT & AI Search",
    description:
      "Query fan-out analysis: see the hidden searches ChatGPT, Gemini, Claude and Perplexity run for your prompts, how often, and which content should answer them.",
  },
  hero: {
    eyebrow: "Query fan-out analysis",
    title: "Query fan-out analysis for AI search.",
    muted: "See what AI searches before it answers.",
    subtitle:
      "Before an engine answers, it often runs several web searches of its own. AutoSEO captures these fan-out queries for every tracked prompt, counts them across engines and turns them into content plans for the pages you're missing.",
  },
  visual: "fanout",
  stats: [
    { value: 7, label: "Engines with fan-out data", note: "Where the provider exposes them" },
    { value: 8, label: "Fan-outs per content plan", note: "Most frequent questions first" },
    { value: 100, suffix: "+", label: "MCP tools", note: "Including get_query_fanouts" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "MIT licensed, every feature" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "One prompt, many searches.",
    muted: "Each one is a chance to be found.",
    body: "A question like “best CRM for a small agency” rarely leads to a single search. The engine splits it into sub-queries about pricing, integrations or alternatives, reads the results and builds its answer from them. Fan-outs show you those sub-queries.",
    points: [
      {
        title: "Fan-outs reveal the real topics",
        body: "They show which facts an engine looks up to answer your prompt, often more specific than what a keyword tool suggests.",
      },
      {
        title: "Matching pages get read",
        body: "When your content answers the sub-queries directly, the engine can find it while it searches — and has a reason to cite it.",
      },
      {
        title: "Patterns beat single prompts",
        body: "The same fan-out across many prompts and engines is a strong signal for a page, section or FAQ worth writing.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What you get",
    title: "Every hidden search,",
    muted: "counted and connected.",
    items: [
      {
        icon: "git-fork",
        title: "All fan-out queries",
        body: "Every sub-query engines ran for your tracked prompts, deduplicated and ranked by how often it appears.",
      },
      {
        icon: "bot",
        title: "Engines and prompts",
        body: "For each fan-out: the engines that ran it and the prompts it came from, with first and last seen dates.",
      },
      {
        icon: "download",
        title: "Search and export",
        body: "Search fan-outs by text, pick a period and download them as CSV for keyword and content planning.",
      },
      {
        icon: "file-text",
        title: "Content plans",
        body: "Content-gap tasks list the top fan-out questions for prompts where engines cite other pages but none of yours, with a suggested outline.",
      },
      {
        icon: "sparkles",
        title: "Prompt Explorer",
        body: "Run a new prompt on ChatGPT, Claude, Gemini or Perplexity and see the fan-out searches next to the answer and its citations.",
      },
      {
        icon: "presentation",
        title: "Reports and API",
        body: "Add a “What AI searched for” block to client reports, or pull fan-outs through the REST API and the MCP server.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From prompt to content plan",
    muted: "in three steps.",
    items: [
      {
        title: "Track prompts on engines with fan-outs",
        body: "Use engines that expose their searches, such as ChatGPT, Gemini, Claude and Perplexity, through DataForSEO or the engine's API.",
      },
      {
        title: "AutoSEO collects the sub-queries",
        body: "Each answer's fan-out queries are stored with prompt, engine and date, and grouped across all answers.",
      },
      {
        title: "Write the pages engines look for",
        body: "Use the most frequent fan-outs as headings and FAQs, or start from the content plan in a content-gap task.",
      },
    ],
  },
  faq: [
    {
      q: "What is query fan-out?",
      a: "Query fan-out is how an AI engine splits a prompt into several web searches, reads the results and combines them into one answer. The sub-queries it runs are called fan-out queries. They show which information the engine looks for before it answers.",
    },
    {
      q: "How can I see the searches ChatGPT runs?",
      a: "Track your prompts with ChatGPT enabled. When the provider returns the search queries, AutoSEO stores them with each answer and lists them on the Query Fanouts page with frequency, engines and the prompts they came from.",
    },
    {
      q: "Which AI engines report fan-out queries?",
      a: "AutoSEO captures fan-outs from ChatGPT (search and app), Gemini, Claude, Perplexity, Grok and Mistral whenever DataForSEO or the engine's API returns them; for Meta AI, Qwen and Kimi it depends on the API and model. Google AI Overviews, AI Mode, Copilot, DeepSeek, Sabiá and Solar don't return fan-out queries, and neither do answers from the local agent.",
    },
    {
      q: "How do fan-outs help with content?",
      a: "Fan-outs are the questions an engine needs answered to respond to your prompt. Covering them on your page as headings, facts or FAQs gives the engine a page that matches what it searches for. AutoSEO's content-gap tasks build an outline from them.",
    },
    {
      q: "Are fan-out queries the same as keywords?",
      a: "No. Keywords describe what people type into a search engine. Fan-outs are what AI engines search for on their behalf, and they are often longer and more specific. Use them alongside keyword research to cover both.",
    },
    {
      q: "Can I export fan-out queries?",
      a: "Yes. The Query Fanouts page downloads as CSV with frequency, engines, prompts and dates. You can also add fan-outs to reports, or query them through the REST API and the MCP tool get_query_fanouts.",
    },
    {
      q: "Is query fan-out analysis free?",
      a: "Fan-out analysis is part of the open-source AutoSEO app and free to self-host; DataForSEO and AI API usage is then billed by those providers. AutoSEO Cloud gives you a managed workspace for $50 per month with $10 of AI and data usage included.",
    },
  ],
  related: ["prompt-research", "ai-content-optimization", "ai-citation-tracking", "keyword-research"],
  cta: {
    title: "See what AI searches for before it answers",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
