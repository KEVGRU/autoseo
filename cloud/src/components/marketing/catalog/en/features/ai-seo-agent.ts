import type { FeaturePage } from "../../types";

export default {
  slug: "ai-seo-agent",
  nav: "AI SEO agent",
  summary: "Chat with your SEO and AI visibility data on your own Claude Code or Codex.",
  meta: {
    title: "AI SEO Agent on Your Claude Code or Codex",
    description:
      "Chat with your SEO and AI visibility data. AutoSEO's AI SEO agent runs on your own Claude Code or Codex subscription with every AutoSEO tool, or on API keys.",
  },
  hero: {
    eyebrow: "AI SEO agent",
    title: "An AI SEO agent that knows your data.",
    muted: "Running on your own Claude Code or Codex.",
    subtitle:
      "Ask questions in plain language and Agent mode answers with your real numbers — visibility, competitors, keywords, rankings, audits and traffic. It runs on the Claude Code or Codex subscription you already pay for through a local agent, with API keys as a fallback.",
  },
  visual: "agent",
  screenshot: {
    src: "/screenshots/agent.png",
    alt: "AutoSEO Agent mode start screen with example questions about AI visibility and SEO data",
    url: "agent",
  },
  stats: [
    { value: 100, suffix: "+", label: "AutoSEO tools", note: "Available in every chat" },
    { value: 2, label: "Local runtimes", note: "Claude Code and Codex CLI" },
    { value: 3, label: "API fallbacks", note: "Anthropic, OpenAI, OpenRouter" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "MIT licensed, every feature" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "Dashboards show what happened.",
    muted: "An agent explains why and what's next.",
    body: "AutoSEO collects a lot of data: AI answers, citations, competitors, rankings, audits and traffic. Agent mode lets anyone on the team ask a question and get an answer built from that data, with every tool call visible, instead of clicking through ten reports.",
    points: [
      {
        title: "Questions cross datasets",
        body: "Why did visibility drop? Which prompts does a competitor win? The answer usually needs tracking, sources and rankings at once.",
      },
      {
        title: "Your subscription, not another bill",
        body: "If you already pay for Claude Code or Codex, the agent uses that subscription through a local agent. API keys are only a fallback.",
      },
      {
        title: "Grounded in real numbers",
        body: "The agent calls AutoSEO tools for every figure, so answers come from your tracked data instead of the model's memory.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What the agent can do",
    title: "An SEO analyst in a chat window,",
    muted: "with every AutoSEO tool.",
    items: [
      {
        icon: "message-square",
        title: "Chat with all your data",
        body: "Ask about visibility, competitors, sentiment, sources, keywords, rankings, audits, Search Console and GA4 — with every tool call shown.",
      },
      {
        icon: "terminal",
        title: "Runs on Claude Code or Codex",
        body: "A lightweight local agent runs each chat as a fresh CLI session on your machine, connected over outbound HTTPS only — no open ports.",
      },
      {
        icon: "key",
        title: "API fallback",
        body: "No local agent online? Chats fall back to an Anthropic, OpenAI or OpenRouter model configured for your AutoSEO.",
      },
      {
        icon: "file-text",
        title: "Reports and briefs on request",
        body: "Ask for a monthly report, a content brief or a pitch outline, and the agent builds it from your data and saves it in AutoSEO.",
      },
      {
        icon: "layers",
        title: "Files and voice input",
        body: "Attach up to six images, PDFs, CSVs or text files per message, or dictate your question instead of typing it.",
      },
      {
        icon: "shield-check",
        title: "Scoped and permission-aware",
        body: "Each chat gets a short-lived token restricted to the active project, and your role decides which tools can run or spend money.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From question to answer",
    muted: "in three steps.",
    items: [
      {
        title: "Install the local agent",
        body: "Open Settings → Local Agents, copy the one-line installer for macOS, Linux or Windows and run it on a machine with Claude Code or Codex.",
      },
      {
        title: "Pick a project and ask",
        body: "Start from an example question or type your own. The agent calls AutoSEO tools and shows each step as it works.",
      },
      {
        title: "Act on the answer",
        body: "Turn findings into reports and content briefs, or keep the conversation going. Chats are saved per project and searchable.",
      },
    ],
  },
  faq: [
    {
      q: "What is an AI SEO agent?",
      a: "An AI SEO agent is an AI assistant that can look up SEO data itself and act on it, instead of only answering from its training. AutoSEO's Agent mode connects Claude Code, Codex or an API model to every AutoSEO tool, so it can analyze your AI visibility, rankings, audits and traffic and build reports from them.",
    },
    {
      q: "Do I need an API key to use Agent mode?",
      a: "No. Agent mode can run on your own Claude Code or Codex CLI through AutoSEO's local agent — in AutoSEO Cloud too — so it uses the subscription you already have. Without a local agent, it falls back to an AI provider API: on AutoSEO Cloud it uses the providers the Codext team has connected, with usage counting toward the $10 included each month, and when you self-host you add Anthropic, OpenAI or OpenRouter keys.",
    },
    {
      q: "How does the local agent work?",
      a: "The local agent is a small Node.js program you install with one command on macOS, Linux or Windows. It connects to AutoSEO over outbound HTTPS only, runs every job in a fresh CLI session in its own folder, and updates itself from signed releases.",
    },
    {
      q: "Is it safe to run the agent on my machine?",
      a: "The agent opens no ports and its token is stored on the server only as a hash. By default it runs the CLI in lean mode, without your personal settings, MCP servers or shell. Full mode, with your own MCP servers, only runs for jobs you started and only if you allowed it locally.",
    },
    {
      q: "Can teammates use my Claude Code subscription?",
      a: "Not for chats. Agent mode conversations only run on the local agent of the person who asks. Each teammate connects their own Claude Code or Codex, or uses the API fallback.",
    },
    {
      q: "Which data can the agent access?",
      a: "The agent works inside the active project and uses the same permissions as you. It can read AI visibility, competitors, sources, keywords, rankings, audits, Search Console and GA4 data, and it can only run paid tools if your role allows it.",
    },
    {
      q: "Can I use AutoSEO from my own Claude Code or Cursor instead?",
      a: "Yes. Besides the built-in Agent mode, AutoSEO has an MCP server with 100+ tools and plugins for Claude Code, Codex and Cursor. Connect your agent to AutoSEO and work with the same data from your editor or terminal.",
    },
    {
      q: "What does Agent mode cost?",
      a: "Agent mode is part of the free, open-source AutoSEO app. On a local agent it uses your existing Claude Code or Codex subscription. API fallback usage is billed by the provider when you self-host, or counts toward the $10 of AI and data usage included in an AutoSEO Cloud workspace for $50 per month.",
    },
  ],
  related: ["mcp-server", "report-builder", "ai-visibility-tracking", "ai-seo-tasks"],
  cta: {
    title: "Ask your SEO data anything",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month and connect your own Claude Code or Codex, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
