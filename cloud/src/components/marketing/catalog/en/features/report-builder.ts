import type { FeaturePage } from "../../types";

export default {
  slug: "report-builder",
  nav: "Report builder",
  summary: "Branded client reports with live data, 11 templates, PPTX/PDF export and share links.",
  meta: {
    title: "SEO Report Builder with White-Label Templates",
    description:
      "Build white-label SEO and AI visibility reports with drag and drop, 11 templates and brand kits. Export to PPTX or PDF, or share a password-protected link.",
  },
  hero: {
    eyebrow: "SEO report builder",
    title: "An SEO report builder for client-ready decks.",
    muted: "Branded, live and done in minutes.",
    subtitle:
      "Drag live AI visibility, SEO and traffic data onto branded slides or start from one of 11 templates. Present in the browser, export to PowerPoint or PDF, or send a password-protected link — and let AI write the summary.",
  },
  visual: "report",
  screenshot: {
    src: "/screenshots/reports.png",
    alt: "AutoSEO report builder editing a branded monthly AI visibility report slide",
    url: "reports",
  },
  stats: [
    { value: 11, label: "Report templates", note: "From pitch deck to monthly report" },
    { value: 2, label: "Export formats", note: "PowerPoint (PPTX) and PDF" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "MIT licensed, every feature" },
    { value: 50, prefix: "$", label: "Cloud per month", note: "Per workspace, unlimited users" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "Clients want proof,",
    muted: "not screenshots.",
    body: "Agencies and in-house teams lose hours every month copying numbers from several tools into slides. When the data already lives in one place, the report can pull it in automatically and look the same from month to month.",
    points: [
      {
        title: "AI visibility is new to clients",
        body: "Most stakeholders have never seen how AI engines talk about their brand. A clear deck with visibility, competitors and sources makes the case.",
      },
      {
        title: "Consistency builds trust",
        body: "The same template, metrics and brand every month make changes easy to read and hard to dispute.",
      },
      {
        title: "Time belongs to the work",
        body: "Every hour spent formatting slides is an hour not spent fixing pages, earning citations or winning new clients.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What's included",
    title: "Everything you need for client reporting,",
    muted: "in one editor.",
    items: [
      {
        icon: "layers",
        title: "Drag and drop with live data",
        body: "Place KPIs, charts, tables, lists, text and images on slides. Data fields such as visibility, citations or audit score update with the reporting period.",
      },
      {
        icon: "presentation",
        title: "11 templates",
        body: "Pitch, Audit Pitch, Monthly Report, Competitor Benchmark, Citation Analysis, GEO Audit, Executive One-Pager and more — or save your own.",
      },
      {
        icon: "pen",
        title: "Brand kits",
        body: "Your agency's name, logo, colors and fonts, with a client logo and accent color per project on top.",
      },
      {
        icon: "download",
        title: "PPTX, PDF and present mode",
        body: "Download PowerPoint files with native charts, export PDFs, or present full screen right in the browser.",
      },
      {
        icon: "lock",
        title: "Password-protected share links",
        body: "Share a report by link with an optional password and expiry date, see how often it was viewed and revoke it at any time.",
      },
      {
        icon: "sparkles",
        title: "AI-written reports",
        body: "Let AI summarize the period, rewrite text or design a slide — or generate a complete HTML report from your data and your instructions.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From data to deck",
    muted: "in three steps.",
    items: [
      {
        title: "Pick a template and a period",
        body: "Start from one of 11 templates and choose the last 7, 30 or 90 days, month to date, last month or a custom range.",
      },
      {
        title: "Make it yours",
        body: "Apply your brand kit, drag in metrics and charts, and add your commentary — or let AI draft the summary for you.",
      },
      {
        title: "Present, export or share",
        body: "Present in the browser, download PPTX or PDF, or send a password-protected link that expires when you want it to.",
      },
    ],
  },
  faq: [
    {
      q: "What is an SEO report builder?",
      a: "An SEO report builder turns your SEO data into presentations for clients or stakeholders without copying numbers by hand. AutoSEO's report builder places live AI visibility, SEO and traffic metrics on branded slides that update with the reporting period.",
    },
    {
      q: "Can I create white-label SEO reports?",
      a: "Yes. A brand kit stores your agency's name, logo, website, contact email, colors and fonts. Each project can add the client's name, logo and accent color, so every report carries your brand and your client's.",
    },
    {
      q: "Which report templates are included?",
      a: "AutoSEO includes 11 templates: Blank, Blank (Classic), Pitch, Audit Pitch, Monthly Report, Competitor Benchmark, Citation Analysis, Prompt Coverage, GEO Audit, Baseline Snapshot and Executive One-Pager. You can also save any report as your own template.",
    },
    {
      q: "Can I export reports to PowerPoint or PDF?",
      a: "Yes. Download any report as a PPTX file with text, shapes, images, tables and native charts, or as a PDF. You can also present it full screen in the browser.",
    },
    {
      q: "How do report share links work?",
      a: "Turn on sharing to get a read-only link your client can open without signing in. You can protect it with a password, set an expiry date, see the number of views and revoke the link at any time.",
    },
    {
      q: "What data can I put in a report?",
      a: "AI visibility, mention and citation rates, prompts, competitors and share of voice, sentiment, cited sources, site audit and crawlability scores, Search Console clicks and sessions from AI platforms. Values follow the reporting period you pick.",
    },
    {
      q: "Can AI write the report for me?",
      a: "Yes. AI can summarize the period, rewrite text, design single slides or generate a complete HTML report from presets such as a monthly client check-in or a GEO audit narrative. It runs on your own Claude Code or Codex through the local agent, or on the AI provider configured for your AutoSEO.",
    },
    {
      q: "Is the report builder free?",
      a: "The report builder is part of the open-source AutoSEO app and free to self-host with every feature. AutoSEO Cloud gives you a managed workspace for $50 per month with unlimited users, no per-seat fees and $10 of AI and data usage included.",
    },
  ],
  related: ["ai-visibility-tracking", "ai-competitor-analysis", "ai-seo-agent", "site-audit"],
  cta: {
    title: "Send your next client report in minutes",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
