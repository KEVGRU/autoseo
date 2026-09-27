import type { SolutionPage } from "../../types";

export default {
  slug: "agencies",
  nav: "For agencies",
  summary: "Run AI visibility and SEO for every client, with white-label reports.",
  meta: {
    title: "AI Visibility & GEO Platform for Agencies",
    description:
      "Offer GEO and AI visibility services to every client: workspaces, client roles, white-label reports and no per-seat fees. Open source, self-host free or $50/month.",
  },
  hero: {
    eyebrow: "AutoSEO for agencies",
    title: "Run AI visibility for every client.",
    muted: "In one platform, under your brand.",
    subtitle:
      "Organize clients in workspaces and projects, track their brands across 16 AI engines next to a complete SEO suite, and send white-label reports — without per-seat fees.",
  },
  visual: "report",
  challenges: {
    eyebrow: "The challenge",
    title: "Clients ask about AI search.",
    muted: "Most agency stacks can't answer.",
    items: [
      {
        title: "A new question in every meeting",
        body: "Clients want to know why ChatGPT recommends a competitor. Without data, the answer is guesswork.",
      },
      {
        title: "Tools priced per seat and prompt",
        body: "Closed AI visibility tools charge per user, project or prompt — costs grow with every client you win.",
      },
      {
        title: "Reporting eats the margin",
        body: "Pulling screenshots from five tools into a monthly deck takes hours that nobody pays for.",
      },
    ],
  },
  workflow: {
    eyebrow: "How agencies use AutoSEO",
    title: "From pitch to monthly report,",
    muted: "one workflow.",
    items: [
      {
        icon: "radar",
        title: "Audit a prospect's AI visibility",
        body: "Track a prospect's key prompts before the pitch and show where AI engines prefer their competitors.",
        feature: "ai-visibility-tracking",
      },
      {
        icon: "swords",
        title: "Benchmark every competitor",
        body: "Share of voice, sentiment and head-to-head comparisons for each client's market.",
        feature: "ai-competitor-analysis",
      },
      {
        icon: "list-checks",
        title: "Deliver prioritized work",
        body: "Evidence-backed tasks pushed to Jira, Linear, Asana or ClickUp, so your team knows what to do next.",
        feature: "ai-seo-tasks",
      },
      {
        icon: "file-text",
        title: "Produce content that gets cited",
        body: "Briefs and drafts built from the prompts and sources that matter, published to the client's CMS.",
        feature: "ai-content-optimization",
      },
      {
        icon: "presentation",
        title: "Report under your brand",
        body: "Brand kits, 11 templates, live data, PPTX and PDF export and password-protected share links.",
        feature: "report-builder",
      },
      {
        icon: "search",
        title: "Keep classic SEO in the same place",
        body: "Keyword research, rank tracking, backlinks and site audits for every client, next to their AI data.",
        feature: "keyword-research",
      },
    ],
  },
  prompts: {
    eyebrow: "Example prompts",
    title: "Prompts agencies track for their clients",
    items: [
      "Which agency is best for B2B SEO in Munich?",
      "Best CRM for small construction companies",
      "Acme vs. its main competitor — which is better?",
      "What do customers say about Acme's customer service?",
      "Top-rated project management software for agencies",
      "Is Acme a good choice for enterprise teams?",
    ],
  },
  outcomes: {
    eyebrow: "Why agencies choose AutoSEO",
    title: "More clients,",
    muted: "not more tool costs.",
    items: [
      {
        title: "No per-seat fees",
        body: "Unlimited users everywhere. Self-host for free with unlimited projects, or use an AutoSEO Cloud workspace with up to 10 projects for $50 per month.",
      },
      {
        title: "Clients see only their own data",
        body: "The Client role and per-project access keep every client in their own space.",
      },
      {
        title: "Your brand, not ours",
        body: "Brand kits put your logo and colors on every report. Self-hosted, you can brand the app itself too.",
      },
    ],
  },
  faq: [
    {
      q: "Can I manage multiple clients in AutoSEO?",
      a: "Yes. Add a project for each client brand or market and invite your team. Self-hosted AutoSEO has no limits on workspaces, projects or users; an AutoSEO Cloud workspace holds up to 10 projects with unlimited users.",
    },
    {
      q: "Can clients log in and see their own data?",
      a: "Yes. Invite clients with the Client role and give them access to specific projects only. They sign in with a magic link — no passwords to manage.",
    },
    {
      q: "Are reports white-label?",
      a: "Yes. Create brand kits with your agency's logo and colors, build reports from 11 templates or from scratch, and export to PowerPoint or PDF or share a password-protected link.",
    },
    {
      q: "How much does AutoSEO cost for an agency?",
      a: "The open-source edition is free to self-host with every feature and no limits; third-party data such as DataForSEO is billed by the provider. AutoSEO Cloud costs $50 per workspace per month with up to 10 projects, unlimited users and $10 of AI and data usage included.",
    },
    {
      q: "How are AI and data costs handled?",
      a: "AutoSEO records the usage of every paid AI and data call. In AutoSEO Cloud you see it against the $10 of usage included each month; self-hosted admins set their own daily and monthly spend limits.",
    },
  ],
  related: ["geo-teams", "content-teams", "pr-brand-teams"],
  cta: {
    title: "Add AI visibility to every client retainer",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies SolutionPage;
