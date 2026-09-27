import type { SecurityPage } from "../types";

export default {
  meta: {
    title: "Security & Data Protection: Trust Center",
    description:
      "Security and data protection in AutoSEO: passwordless sign-in, AES-256-GCM encrypted secrets, audit log and GDPR export. Open source, Cloud hosted in Germany.",
  },
  hero: {
    eyebrow: "Security & data protection",
    title: "Security and data protection",
    muted: "you can verify in the code.",
    subtitle:
      "AutoSEO is open source, so every control on this page is in the public repository for your security review. Self-host it and keep full control on your own infrastructure, or use an AutoSEO Cloud workspace, fully managed by us on servers in Germany.",
  },
  pillars: {
    eyebrow: "Overview",
    title: "Secure by default,",
    muted: "in every installation.",
    items: [
      {
        icon: "key",
        title: "Passwordless, invite-only sign-in",
        body: "No passwords to leak or reuse. Users sign in with a single-use magic link or a 6-digit code that expires after 15 minutes by default. Out of the box, nobody gets in without an invitation, and self-hosters can limit sign-in to their company's email domains.",
      },
      {
        icon: "lock",
        title: "Encrypted secrets, hashed tokens",
        body: "AI provider keys, SMTP passwords, OAuth client secrets and integration credentials are encrypted with AES-256-GCM. API keys, OAuth and agent tokens that AutoSEO issues are stored only as SHA-256 hashes and shown once.",
      },
      {
        icon: "users",
        title: "Roles and per-project access",
        body: "Owner, Admin, Member and Client roles plus custom roles. Members and clients only see the projects you give them, and clients get read-only access. Instance administration is granted separately.",
      },
      {
        icon: "list-checks",
        title: "Audit log",
        body: "Sign-ins, invitations, role changes, API keys, integrations and project changes are recorded with the acting user and IP address. Self-hosted, you review and export the log in the admin panel.",
      },
      {
        icon: "server",
        title: "Separated workspaces, hosted in Germany",
        body: "AutoSEO Cloud is one shared instance on servers in Germany. Each customer's workspace is logically separated within a shared database, workspace roles can never grant admin access to the instance, and budgets apply per workspace.",
      },
      {
        icon: "code",
        title: "Open source and auditable",
        body: "The complete app is MIT licensed and public on GitHub. AutoSEO Cloud runs the same open-source app, so your security team can review the code that handles your data.",
      },
    ],
  },
  data: {
    eyebrow: "Data location",
    title: "Where your data lives",
    muted: "and who processes it.",
    body: "AutoSEO keeps projects, prompts, AI answers, reports and stored credentials in PostgreSQL and a data volume. Where that runs depends on how you use AutoSEO.",
    items: [
      {
        title: "AutoSEO Cloud",
        body: "One shared instance on servers in Germany, operated by Codext GmbH on Hetzner infrastructure. Your workspace's data is logically separated within a shared database, and only your members — plus our administrators where needed to operate the service — can access it. We act as your processor under Art. 28 GDPR.",
      },
      {
        title: "Self-hosted",
        body: "Your data stays on your server, in your own database. The app doesn't report anything to Codext, and you control updates, backups and network access.",
      },
      {
        title: "Third-party providers",
        body: "In AutoSEO Cloud, the AI and SEO data providers we configure act as our sub-processors; the list is available on request. When you self-host, you choose them. With a local agent, AI requests run on your machine under your own Claude Code or Codex account.",
      },
    ],
  },
  controls: {
    eyebrow: "Controls",
    title: "What's in the code today,",
    muted: "in every installation.",
    items: [
      "Session cookies with the __Host- prefix, Secure, HttpOnly and SameSite=Lax",
      "Session tokens, API keys, OAuth and agent tokens stored only as SHA-256 hashes",
      "SMTP passwords, AI provider keys and OAuth client secrets encrypted with AES-256-GCM",
      "Invite-only sign-in by default, with an optional email-domain allow-list",
      "Per-device sessions you can revoke one by one, plus an optional device limit",
      "SSRF protection that blocks private, LAN and link-local addresses on every redirect hop",
      "API keys scoped to read, write, spend and export",
      "Daily and monthly spend limits for paid AI and data calls",
      "GDPR data export and erasure, self-service or by an admin",
      "HSTS, Content Security Policy and anti-framing headers on every response",
    ],
  },
  disclosure: {
    title: "Responsible disclosure",
    body: "Found a vulnerability? Please don't open a public issue. Report it privately through GitHub Security Advisories or by email, with steps to reproduce, the affected version or commit and the impact. We acknowledge reports within 2 business days, send an initial assessment within 5 business days and aim to fix critical issues within 7 days. If you like, we credit you in the advisory.",
    advisoryLabel: "Report via GitHub Security Advisories",
    emailLabel: "Email security@codext.de",
  },
  faq: [
    {
      q: "Where is my data stored?",
      a: "AutoSEO Cloud runs on servers in Germany. Every customer gets their own workspace, and its data is logically separated from other workspaces within a shared database. When you self-host, everything stays on your own server — apart from the requests AutoSEO makes to the AI and data providers you configure.",
    },
    {
      q: "Is AutoSEO GDPR compliant?",
      a: "AutoSEO gives you the tools GDPR asks for: an export of each user's personal data, erasure with a dry run, and an audit log. For AutoSEO Cloud, Codext GmbH in Germany acts as your processor under Art. 28 GDPR, and the AI and SEO data providers we configure act as our sub-processors. Whether your overall setup is compliant also depends on how you use it and which third-party providers you connect.",
    },
    {
      q: "How are API keys and passwords stored?",
      a: "Stored credentials — AI provider keys, SMTP passwords, DataForSEO credentials, OAuth client secrets and integration credentials — are encrypted with AES-256-GCM using a key that is generated on first boot and kept in the data volume, so a database dump alone reveals none of them. API keys and tokens that AutoSEO issues are stored only as SHA-256 hashes. Sign-in doesn't use passwords at all.",
    },
    {
      q: "How is my data separated from other AutoSEO Cloud customers?",
      a: "Every customer gets their own workspace in one shared AutoSEO instance, and its data is logically separated from other workspaces within a shared database. Workspace roles can never grant admin access to the instance, and budgets and project limits apply per workspace. Codext is the only instance administrator and accesses workspace data only where needed to operate the service.",
    },
    {
      q: "Can I get a data processing agreement (DPA)?",
      a: "Yes. For personal data in your AutoSEO Cloud workspace, Codext GmbH acts as your processor under Art. 28 GDPR and provides a data processing agreement on request — email kontakt@codext.de. When you self-host, we don't process your data, so no DPA with us is needed.",
    },
    {
      q: "What happens to my data after I cancel AutoSEO Cloud?",
      a: "At the end of the billing period, your workspace is paused: it can no longer be opened, its API keys stop working and scheduled tracking stops. We keep its data for 30 days so you can resubscribe and continue where you left off. After that, the workspace and its data are permanently deleted.",
    },
    {
      q: "Does AutoSEO have SOC 2 or ISO 27001 certification?",
      a: "No, AutoSEO doesn't hold formal security certifications. Instead, the complete source code is public for your security review, and you can self-host it inside infrastructure that your own certifications already cover.",
    },
    {
      q: "How do I report a security vulnerability?",
      a: "Report it privately through GitHub Security Advisories on the codextde/autoseo repository or by email to security@codext.de — please don't open a public issue. We acknowledge reports within 2 business days and send an initial assessment within 5 business days.",
    },
  ],
  cta: {
    title: "Review the code, then decide where it runs",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies SecurityPage;
