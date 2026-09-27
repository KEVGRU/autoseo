import type { SitePage } from "@/components/site/types";
import { site } from "@/lib/site";

const price = `$${site.priceMonthlyUsd}`;
const { projects, includedUsageUsd } = site.cloudPlan;
const contact = `mailto:${site.contactEmail}?subject=AutoSEO%20for%20organizations`;

const page: SitePage = {
  path: "/enterprise",
  crumb: "Enterprise",
  meta: {
    title: "AutoSEO for Organizations: Self-Hosted or Cloud in Germany",
    description:
      "Run AutoSEO in your own infrastructure or in AutoSEO Cloud, hosted in Germany: encrypted secrets, roles, per-project access, audit log and scoped API keys.",
  },
  hero: {
    eyebrow: "AutoSEO for organizations",
    title: "AI visibility for organizations that need control",
    subtitle:
      "Track how ChatGPT, Perplexity, Gemini, Claude and Google's AI features describe every brand and market you own — on your own servers under the MIT license, or in AutoSEO Cloud, hosted in Germany.",
    ctas: [
      { label: "Talk to us", href: contact },
      { label: "Read the self-hosting guide", href: "/self-hosting" },
    ],
  },
  sections: [
    {
      kind: "cards",
      id: "deployment",
      eyebrow: "Deployment",
      title: "Two ways to run it. One codebase.",
      subtitle:
        "AutoSEO Cloud runs exactly the open-source app you can install yourself. Choose by who should operate it, not by features.",
      columns: 2,
      cards: [
        {
          icon: "server",
          title: "Self-hosted in your infrastructure",
          badge: "Free · MIT",
          body: "Run AutoSEO on your own Linux server with Docker Compose, the one-line installer or Coolify. Your database, your backups, your network rules: data stays where you deploy it, apart from requests to the AI and SEO data providers you configure. Every feature, no limits on users, projects or prompts.",
        },
        {
          icon: "globe",
          title: "AutoSEO Cloud, hosted in Germany",
          badge: `${price}/month`,
          body: `Your own workspace in our fully managed AutoSEO. AI providers, SEO data and email are managed by us (no API keys needed), updates are automatic and $${includedUsageUsd} of provider usage per month is included. Unlimited users and up to ${projects} projects per workspace. [Compare plans](/pricing).`,
        },
      ],
    },
    {
      kind: "table",
      id: "security",
      eyebrow: "Security",
      title: "Security controls that ship with the product",
      subtitle:
        "No add-on tier: these controls are part of the open-source code, so your security team can read exactly how they work.",
      head: ["Control", "What it does", "Self-hosted", "AutoSEO Cloud"],
      rows: [
        ["Encrypted secrets", "Provider API keys, SMTP credentials and OAuth client secrets are encrypted at rest with AES-256-GCM.", "✓ Key lives in your data volume", "✓ Managed by us"],
        ["Hashed tokens", "API keys, OAuth tokens and local-agent tokens are stored only as SHA-256 hashes; the plaintext is shown once.", "✓", "✓"],
        ["Passwordless sign-in", "Invite-only magic links and one-time codes. Sessions use `__Host-` cookies (Secure, HttpOnly, SameSite=Lax) and can be revoked per device.", "✓", "✓"],
        ["Email-domain allow-list", "Restrict sign-ins to your company domains, enforce invite-only mode, set session length and device limits.", "✓ Admin → Authentication", "Instance-wide policy set by us"],
        ["Roles & per-project access", "Owner, Admin, Member and Client roles. Members and clients only see the projects they are assigned to.", "✓ Plus custom roles (Admin → Roles)", "✓ Assign existing roles and project access"],
        ["Audit log", "Records sign-ins (including denied ones), invitations, role changes, API keys, integrations and exports; exportable.", "✓ Admin → Audit Log", "Kept by us as instance operator"],
        ["SSRF protection", "Requests triggered by integrations (webhooks, crawling, publishing) cannot reach private or LAN addresses unless an admin allows a specific host.", "✓ Allow specific intranet hosts", "✓ No internal hosts"],
        ["GDPR export & erasure", "Every user can download their personal data and delete their account; admins can erase users.", "✓", "✓"],
        ["Scoped API keys", "Keys are limited to the scopes `read`, `write`, `spend` and `export`, and to all or selected projects.", "✓", "✓"],
        ["OAuth 2.1 for MCP", "AI assistants connect to the MCP server through OAuth 2.1 instead of shared static keys.", "✓", "✓"],
        ["Signed agent updates", "Local agents open no inbound ports, talk to your instance over outbound HTTPS and verify signed releases before updating.", "✓", "✓"],
      ],
      note: "Found a vulnerability? Report it privately via GitHub Security Advisories or security@codext.de, as described on our [security page](/security).",
    },
    {
      kind: "table",
      id: "control",
      eyebrow: "Control",
      title: "Who controls what",
      subtitle:
        "Self-hosted, you are the instance admin and control everything. On AutoSEO Cloud, you own your workspace, while instance-wide settings are operated by us.",
      head: ["Area", "Self-hosted", "AutoSEO Cloud"],
      rows: [
        ["Members, invitations, role assignment, per-project access", "You", "You, as workspace owner"],
        ["Projects, prompts, competitors, engines, reports", "You", "You"],
        ["DataForSEO account", "You — for the instance (Admin → Data Providers) or per workspace", "Managed by us; you can connect your own account for your workspace"],
        ["Custom roles", "You (Admin → Roles)", "Defined by the instance operator; you assign the available roles"],
        ["Audit log", "You (Admin → Audit Log)", "Kept by us as instance operator"],
        ["Email-domain allow-list, invite-only mode, session policy", "You (Admin → Authentication)", "Instance-wide policy set by us"],
        ["AI providers, email delivery, limits and budgets", "You (admin panel)", "Managed and operated by us"],
      ],
    },
    {
      kind: "cards",
      id: "structure",
      eyebrow: "Multi-brand, multi-region",
      title: "Mirror your organization: workspaces, projects, roles",
      subtitle:
        "Subsidiaries, brands, markets and clients map onto two building blocks. Access follows the same structure.",
      columns: 3,
      cards: [
        {
          icon: "layers",
          title: "Workspaces",
          body: "A workspace is a team boundary with its own members, roles, integrations and API keys. Use one per business unit, subsidiary or client group.",
        },
        {
          icon: "globe",
          title: "Projects per brand and market",
          body: "A project is one website or brand with its own prompts, competitors, engines and market (country and language). Track the same brand in Germany and the US as two projects.",
        },
        {
          icon: "users",
          title: "Per-project access",
          body: "Owners and Admins see every project in their workspace. Members and read-only Clients see only the projects they are given — ideal for regional teams and agencies.",
        },
        {
          icon: "list",
          title: "Portfolio overview",
          body: "Key AI-visibility metrics for all your projects in one table — visibility and its trend, share of voice, average position, sentiment, citations, open high-impact tasks and AI revenue — so central teams keep the overview across brands and markets.",
        },
        {
          icon: "presentation",
          title: "White-label reports",
          body: "The report builder uses brand kits with your logo and colors, exports PPTX and PDF and creates password-protected share links. [See the report builder](/report-builder).",
        },
        {
          icon: "code",
          title: "API, MCP and exports",
          body: "A REST API with OpenAPI spec, an MCP server for AI assistants and CSV or Google Sheets exports feed your own dashboards. [REST API](/rest-api) · [MCP server](/mcp-server) · guides for [Claude](/blog/claude-connector) and [ChatGPT](/blog/chatgpt-plugin).",
        },
      ],
    },
    {
      kind: "checklist",
      id: "it",
      eyebrow: "For IT and platform teams",
      title: "What running AutoSEO yourself involves",
      subtitle: "Self-hosting is deliberately boring: one container image, one database and settings in an admin panel.",
      items: [
        "One Docker image (ghcr.io/codextde/autoseo) plus PostgreSQL 17 — no other runtime services required",
        "Only the domain and database live in environment variables; everything else is configured in the admin panel",
        "Database migrations run automatically at boot, so an update is a redeploy",
        "Works behind your reverse proxy (Traefik, nginx, Cloudflare Tunnel) or with the bundled Caddy for automatic HTTPS",
        "Daily and monthly spend caps for AI and SEO data providers",
        "AI through your own Claude Code or Codex subscriptions via local agents, or through your own API keys",
        "Source code you can audit, fork and extend under the MIT license",
      ],
      aside: [
        { type: "h3", text: "Sizing" },
        { type: "p", text: "2 vCPU and 2–4 GB RAM are enough for small teams. Scale up if you run large site audits or heavy keyword and backlink jobs." },
        { type: "h3", text: "Back up two volumes" },
        { type: "p", text: "The PostgreSQL volume and the data volume, which holds uploads and the encryption key for stored secrets. Without that key, stored provider credentials cannot be decrypted." },
        { type: "p", text: "[Read the self-hosting guide →](/self-hosting)" },
      ],
    },
    {
      kind: "prose",
      id: "procurement",
      eyebrow: "Procurement",
      title: "The facts your procurement team will ask for",
      blocks: [
        { type: "p", text: "We would rather tell you plainly where AutoSEO stands than show you a wall of badges:" },
        {
          type: "ul",
          items: [
            `**Vendor:** ${site.legal.name}, ${site.legal.street}, ${site.legal.postalCode} ${site.legal.city}, Germany (${site.legal.registerCourt}, ${site.legal.registerNumber}).`,
            "**License:** MIT. Running AutoSEO in your own infrastructure requires no contract with us.",
            "**AutoSEO Cloud hosting:** servers in Germany.",
            `**Data processing agreement (Cloud):** available on request under Art. 28 GDPR — email [${site.legal.email}](mailto:${site.legal.email}).`,
            "**Certifications:** we do not claim SOC 2 or ISO 27001 certification for AutoSEO Cloud. If your policy requires one, run AutoSEO inside your own certified environment.",
            "**Vulnerability handling:** private disclosure, acknowledgement within two business days, see [SECURITY.md](https://github.com/codextde/autoseo/blob/main/SECURITY.md).",
            `**Billing (Cloud):** ${price} per workspace and month via Stripe, with an invoice for every payment; cancel anytime.`,
          ],
        },
        {
          type: "callout",
          tone: "info",
          title: "Need something that is not on this list?",
          text: `Custom terms, a questionnaire or a technical deep dive: write to [${site.contactEmail}](mailto:${site.contactEmail}) and tell us what you need. We will tell you honestly whether we can provide it.`,
        },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Questions from organizations",
      items: [
        {
          q: "Where is our data stored?",
          a: "When you self-host, all data stays in the PostgreSQL database and data volume on your own server, wherever you run it. AutoSEO only sends the request data needed for a feature — for example tracked prompts, brand and competitor names, domains and keywords — to the AI and SEO data providers you configure. AutoSEO Cloud runs on servers in Germany.",
        },
        {
          q: "Do you sign a data processing agreement?",
          a: `For AutoSEO Cloud, yes: we process personal data in your workspace as a processor under Art. 28 GDPR and provide a data processing agreement on request — email ${site.legal.email}. When you self-host, we do not process your data at all, so no agreement with us is needed; you still need agreements with the AI and data providers you connect.`,
        },
        {
          q: "Is AutoSEO SOC 2 or ISO 27001 certified?",
          a: "We do not claim either certification for AutoSEO Cloud. What we offer instead is transparency: the complete source code is public, the security model is documented in SECURITY.md, and you can run AutoSEO inside your own certified infrastructure, where your existing controls apply.",
        },
        {
          q: "Can we use single sign-on with SAML or OpenID Connect?",
          a: "Not today. AutoSEO uses passwordless sign-in with invite-only magic links and one-time codes. On a self-hosted instance you can restrict sign-ins to your company email domains, enforce invite-only mode and limit session length and devices. If SAML or OIDC is a hard requirement for you, tell us — or contribute it on GitHub.",
        },
        {
          q: "How do we manage many brands, regions or clients?",
          a: `Create a workspace per business unit or client group and a project per brand and market, each with its own prompts, competitors, engines, country and language. Members and clients only see the projects they are assigned to, and the portfolio overview shows key AI-visibility metrics for all your projects in one table (visibility and its trend, share of voice, average position, sentiment, citations, open high-impact tasks and AI revenue). AutoSEO Cloud includes up to ${projects} projects per workspace; self-hosted AutoSEO has no project limit.`,
        },
        {
          q: "How do we keep AI and data costs under control?",
          a: `When you self-host, providers such as DataForSEO and your AI provider bill you directly, and AutoSEO enforces daily and monthly spend caps. You can also route AI work through Claude Code or Codex subscriptions you already pay for, via the local agent. AutoSEO Cloud includes $${includedUsageUsd} of provider usage per workspace and month under fair use, and workspace owners can connect their own DataForSEO account.`,
        },
        {
          q: "Can we get a custom contract, annual invoice or purchase order?",
          a: `AutoSEO Cloud is billed monthly via Stripe, with an invoice for every payment. If your organization needs different terms, email ${site.contactEmail} with your requirements and we will tell you what is possible. Self-hosting under the MIT license needs no contract at all.`,
        },
        {
          q: "Can our security team review the code before we roll it out?",
          a: "Yes. The full source code of the app, the local agent and the deployment files is on GitHub under the MIT license. Please report any vulnerability privately via GitHub Security Advisories or security@codext.de rather than in a public issue.",
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Plan your rollout with us",
      body: "Tell us about your brands, markets and security requirements, and we will help you choose between self-hosting and AutoSEO Cloud.",
      primary: { label: "Talk to us", href: contact },
      secondary: { label: "Compare plans", href: "/pricing" },
    },
  ],
};

export default page;
