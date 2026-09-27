import type { FeaturePage } from "../../types";

export default {
  slug: "mcp-server",
  nav: "MCP server",
  summary: "Connect Claude, ChatGPT, Cursor or Codex to your data with 100+ MCP tools.",
  meta: {
    title: "SEO MCP Server with 100+ Tools for AI Agents",
    description:
      "Connect Claude, ChatGPT, Cursor or Codex to your SEO and AI visibility data. AutoSEO's MCP server has 100+ tools, OAuth 2.1 sign-in and 17 agent skills.",
  },
  hero: {
    eyebrow: "MCP server",
    title: "An SEO MCP server for every AI agent.",
    muted: "100+ tools behind one URL.",
    subtitle:
      "Connect Claude, ChatGPT, Claude Code, Codex, Cursor or VS Code to AutoSEO and let them work with real AI visibility, keyword, ranking, audit and analytics data. Sign in with OAuth 2.1 or an API key, and add 17 ready-made agent skills with one plugin.",
  },
  visual: "terminal",
  stats: [
    { value: 100, suffix: "+", label: "MCP tools", note: "In 11 groups" },
    { value: 17, label: "Agent skills", note: "SEO and AI visibility workflows" },
    { value: 4, label: "Permission scopes", note: "Read, write, spend, export" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "MCP included, MIT licensed" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "Agents are only as good as their data.",
    muted: "Give them yours.",
    body: "AI assistants can plan an SEO strategy, draft content and write reports — but without live data they guess. The Model Context Protocol lets them call AutoSEO's tools directly and work with your tracked prompts, rankings, audits and traffic.",
    points: [
      {
        title: "No more copy and paste",
        body: "The agent pulls metrics, AI answers and SERPs itself instead of you exporting CSV files into a chat window.",
      },
      {
        title: "Workflows, not one-off prompts",
        body: "Skills guide the agent through complete jobs — an audit, a competitor gap analysis, a monthly report — and save the result in AutoSEO.",
      },
      {
        title: "You stay in control",
        body: "OAuth consent, scopes, project restrictions and role permissions decide what an agent may read, change or spend.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What's included",
    title: "Everything an agent needs,",
    muted: "behind one MCP URL.",
    items: [
      {
        icon: "layers",
        title: "100+ tools in 11 groups",
        body: "Projects, AI visibility, tasks, keywords and SERPs, rank tracking and local SEO, site audits, Search Console and GA4, AI research, content and reports.",
      },
      {
        icon: "lock",
        title: "OAuth 2.1 or API keys",
        body: "Sign in with OAuth 2.1 and choose the workspace, projects and permissions on a consent screen — or send an API key as a bearer token.",
      },
      {
        icon: "key",
        title: "Scopes and spend control",
        body: "Tools that cost money need the spend scope and the matching role permission, and spending stays within your configured limits.",
      },
      {
        icon: "book",
        title: "17 agent skills",
        body: "Guided workflows such as seo-audit, keyword-research, competitor-gap, sentiment-review and ai-visibility-report that save their results as reports.",
      },
      {
        icon: "plug",
        title: "Plugins for Claude Code, Codex and Cursor",
        body: "Install the MCP connection and all skills in one step from your AutoSEO plugin marketplace or a pre-configured bundle.",
      },
      {
        icon: "message-square",
        title: "Works in Claude and ChatGPT",
        body: "Add AutoSEO as a custom connector in Claude or in ChatGPT's developer mode, or configure it in VS Code and the Codex CLI.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "Connect your agent",
    muted: "in four steps.",
    items: [
      {
        title: "Copy your MCP URL",
        body: "The server runs at /api/mcp on your AutoSEO URL. Settings → API & MCP shows ready-made setup steps for each client.",
      },
      {
        title: "Add AutoSEO to your agent",
        body: "Add the server in Claude, ChatGPT, Claude Code, Cursor, VS Code or Codex, then sign in with OAuth or paste an API key.",
      },
      {
        title: "Install the skills",
        body: "Optional: add the AutoSEO plugin to Claude Code, Codex or Cursor to get the MCP connection plus 17 workflow skills.",
      },
      {
        title: "Ask your agent",
        body: "Try “Audit my website and tell me what to fix first” or “How visible is my brand in ChatGPT this month?”",
      },
    ],
  },
  faq: [
    {
      q: "What is an MCP server?",
      a: "The Model Context Protocol (MCP) is an open standard that lets AI assistants call tools and read data from other applications. AutoSEO's MCP server gives agents such as Claude, ChatGPT, Codex and Cursor access to 100+ SEO and AI visibility tools over Streamable HTTP.",
    },
    {
      q: "Which AI clients work with the AutoSEO MCP server?",
      a: "AutoSEO has setup guides for Claude (web, desktop and mobile), ChatGPT developer mode, Claude Code, Codex CLI, Cursor and VS Code. Any client that supports Streamable HTTP with OAuth or bearer tokens can connect. Claude and ChatGPT need an AutoSEO URL that is publicly reachable over HTTPS, as AutoSEO Cloud is.",
    },
    {
      q: "How do I connect Claude Code to AutoSEO?",
      a: "Run claude mcp add --transport http autoseo with your AutoSEO /api/mcp URL, then run /mcp in Claude Code and choose Authenticate. You can also pass an API key header instead, or install the AutoSEO plugin to get the MCP server and all 17 skills at once.",
    },
    {
      q: "How does authentication work?",
      a: "AutoSEO supports OAuth 2.1 with PKCE and dynamic client registration. On the consent screen you choose the workspace, projects and permissions the agent gets. For servers and CI, create an API key under Settings → API & MCP and send it as a bearer token.",
    },
    {
      q: "What are the 17 agent skills?",
      a: "Skills are step-by-step instructions that guide an agent through a complete workflow using AutoSEO's tools. They cover SEO work such as seo-audit, keyword-research and local-seo, AI visibility work such as competitor-gap, sentiment-review and source-outreach, and guides like seo-coach and seo-report.",
    },
    {
      q: "Can an agent spend money through the MCP server?",
      a: "Only if you allow it. Tools that call DataForSEO or AI providers need the spend scope on the connection and the matching role permission, and spending stays within your spend limits or your Cloud workspace's included usage. All other tools read data AutoSEO already has.",
    },
    {
      q: "Does the MCP server work with a self-hosted instance?",
      a: "Yes. The MCP server is part of AutoSEO itself, at /api/mcp — self-hosted and in AutoSEO Cloud. Local clients such as Claude Code also work with an instance on localhost; Claude and ChatGPT need a public HTTPS address.",
    },
    {
      q: "Is the AutoSEO MCP server free?",
      a: "Yes. The MCP server, the plugins and all 17 skills are part of the open-source AutoSEO app and free to self-host; DataForSEO and AI API usage is then billed by those providers. Every AutoSEO Cloud workspace includes them for $50 per month, with $10 of AI and data usage included.",
    },
  ],
  related: ["rest-api", "ai-seo-agent", "keyword-research", "site-audit"],
  cta: {
    title: "Give your AI agent real SEO data",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
