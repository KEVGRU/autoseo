import type { SupportPage } from "../types";

export default {
  meta: {
    title: "Support: Help for Cloud and Self-Hosting",
    description:
      "Get support for AutoSEO: email support included with AutoSEO Cloud, community support on GitHub for self-hosters, plus setup guides, the README and llms.txt.",
  },
  hero: {
    eyebrow: "Support",
    title: "Get support for AutoSEO,",
    muted: "wherever it runs.",
    subtitle:
      "AutoSEO Cloud includes email support from the team that builds AutoSEO. Self-hosters get community support on GitHub, and the guides below answer most setup questions.",
  },
  channels: {
    eyebrow: "Contact",
    title: "Pick the right channel",
    muted: "for your question.",
    items: [
      {
        icon: "headset",
        title: "Email support",
        body: "Included with AutoSEO Cloud: questions about your workspace, sign-in, billing or setup. Also the address for general questions before you sign up.",
        href: "mailto:info@codext.de",
        action: "Email info@codext.de",
      },
      {
        icon: "message-square",
        title: "GitHub Discussions",
        body: "Community support for self-hosted AutoSEO. Ask about installation, configuration, AI providers or local agents, and share your ideas.",
        href: "https://github.com/codextde/autoseo/discussions",
        action: "Open Discussions",
      },
      {
        icon: "flag",
        title: "Bug reports and feature requests",
        body: "Found a reproducible bug or missing a feature? Open an issue on GitHub. The templates ask for everything we need to help.",
        href: "https://github.com/codextde/autoseo/issues",
        action: "Open an issue",
      },
      {
        icon: "shield-check",
        title: "Security reports",
        body: "Please don't report vulnerabilities in public issues. Send them privately via GitHub Security Advisories or security@codext.de — details on our security page.",
        href: "/security",
        action: "Report a vulnerability",
      },
    ],
  },
  resources: {
    eyebrow: "Self-service",
    title: "Find answers yourself",
    muted: "in the docs.",
    items: [
      {
        title: "Self-hosting guide",
        body: "Requirements, one-line installer, Docker Compose, Coolify, local agents, updates and backups.",
        href: "/self-hosting",
      },
      {
        title: "README on GitHub",
        body: "Feature tour, admin configuration, local agents, REST API, MCP server and agent plugins.",
        href: "https://github.com/codextde/autoseo#readme",
      },
      {
        title: "Pricing and billing FAQ",
        body: "Plans, VAT, invoices, cancellation, data export and what happens after you cancel.",
        href: "/pricing",
      },
      {
        title: "llms.txt",
        body: "A plain-text product summary for AI assistants. Paste it into ChatGPT or Claude and ask your questions.",
        href: "/llms.txt",
      },
      {
        title: "Your Cloud dashboard",
        body: "For Cloud customers: open AutoSEO with one click, check your subscription and manage billing.",
        href: "/dashboard",
      },
      {
        title: "Contributing guide",
        body: "Development setup, conventions and good first issues if you want to fix something yourself.",
        href: "https://github.com/codextde/autoseo/blob/main/CONTRIBUTING.md",
      },
    ],
  },
  faq: [
    {
      q: "How do I contact AutoSEO support?",
      a: "AutoSEO Cloud customers email info@codext.de. Self-hosters get community support in GitHub Discussions, and reproducible bugs go into GitHub issues. Security vulnerabilities are reported privately via GitHub Security Advisories or security@codext.de.",
    },
    {
      q: "Is support included in AutoSEO Cloud?",
      a: "Yes. Every AutoSEO Cloud subscription includes email support for your workspace, sign-in, billing and setup at no extra cost. Updates and security fixes are deployed for you, so there's nothing to maintain on your side.",
    },
    {
      q: "Do I get support when I self-host AutoSEO?",
      a: "Yes, community support via GitHub. Ask questions in GitHub Discussions and file reproducible bugs as issues; the self-hosting guide covers installation, updates and backups. Email support is part of AutoSEO Cloud.",
    },
    {
      q: "How do I report a bug in AutoSEO?",
      a: "Open a bug report on GitHub. The template asks how you run AutoSEO, the version, image tag or commit (shown in Admin → System Health), the steps to reproduce and relevant logs. Please remove secrets from logs before you post them.",
    },
    {
      q: "Is there a guaranteed response time?",
      a: "AutoSEO Cloud support is provided on a best-effort basis without a guaranteed service level, as described in the terms of service. For security reports, we acknowledge receipt within 2 business days and send an initial assessment within 5 business days.",
    },
    {
      q: "How do I update a self-hosted AutoSEO instance?",
      a: "Run the installer with --update, run docker compose pull && docker compose up -d, or redeploy in Coolify. Database migrations run automatically at boot, and connected local agents update themselves. AutoSEO Cloud is updated for you automatically.",
    },
    {
      q: "How do I cancel or manage billing for AutoSEO Cloud?",
      a: "Open your dashboard and choose Manage billing to update your payment method, download invoices or cancel. Cancellation takes effect at the end of the current billing period; then your workspace is paused and its data is kept for 30 days before it's permanently deleted.",
    },
    {
      q: "Can I suggest a new feature?",
      a: "Yes. Open a feature request on GitHub, or start a thread in GitHub Discussions to talk the idea through first. AutoSEO is open source, so you can also build it yourself and send a pull request.",
    },
  ],
  cta: {
    title: "Questions answered? Start tracking your AI visibility",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies SupportPage;
