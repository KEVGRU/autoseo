import type { SitePage } from "@/components/site/types";
import { site } from "@/lib/site";

const price = `$${site.priceMonthlyUsd}`;

const page: SitePage = {
  path: "/customers",
  crumb: "Customers",
  meta: {
    title: "Who Uses AutoSEO: Teams, Agencies and Industries",
    description:
      "How SEO and GEO teams, content, PR, agencies, e-commerce, SaaS and regulated industries use open-source AutoSEO. Built in public, with opt-in listings.",
  },
  hero: {
    eyebrow: "Customers",
    title: "Who uses AutoSEO",
    subtitle:
      "AutoSEO is open source: anyone can run it without telling us, and self-hosted instances send us nothing. So instead of logos and quotes we can't back up, here is who AutoSEO is built for, how each team uses it and how you can get listed.",
    ctas: [
      { label: "Get started", href: "/signup" },
      { label: "View on GitHub", href: site.github },
    ],
  },
  sections: [
    {
      kind: "cards",
      id: "teams",
      eyebrow: "Use cases",
      title: "How teams use AutoSEO",
      subtitle: "One platform for AI visibility and classic SEO. Every team starts from the same data and uses the parts it needs.",
      columns: 3,
      cards: [
        {
          icon: "target",
          title: "SEO and GEO teams",
          href: "/solutions/geo-teams",
          body: "Track visibility, mention rate, citation rate and position per prompt across AI engines, next to rankings, backlinks, site audits and Search Console — one tool for classic and AI search.",
        },
        {
          icon: "file",
          title: "Content teams",
          href: "/solutions/content-teams",
          body: "Find the prompts and sources where you are missing, turn the evidence into prioritized tasks, and draft briefs and articles you can publish to WordPress or Webflow.",
        },
        {
          icon: "megaphone",
          title: "PR and brand teams",
          href: "/solutions/pr-brand-teams",
          body: "See how AI describes your brand, what it praises and criticizes, which competitors it recommends instead and which publications it cites.",
        },
        {
          icon: "briefcase",
          title: "Agencies",
          href: "/solutions/agencies",
          body: "Run every client as a project, compare them in the portfolio overview, give clients read-only access, open pitch projects that expire automatically and send white-label reports.",
        },
        {
          icon: "layers",
          title: "E-commerce",
          href: "/solutions/e-commerce",
          body: "See which products AI engines recommend, including ChatGPT app answers with shopping cards, and attribute orders from Shopify, WooCommerce or Shopware to AI search.",
        },
        {
          icon: "rocket",
          title: "SaaS and tech",
          href: "/solutions/saas-tech",
          body: "Win “best tool for …” and “X vs. Y” prompts, see which review sites and comparisons AI cites, and connect deals from HubSpot, Salesforce or Stripe to AI search.",
        },
      ],
    },
    {
      kind: "split",
      id: "regulated",
      eyebrow: "Finance, healthcare, pharma",
      title: "Regulated industries: accuracy and control first",
      body: "When AI misstates a dosage, a fee or a contract term, that is a compliance problem, not just a marketing one. AutoSEO checks AI answers against the documents you approved and can run entirely inside your own infrastructure. More on [finance](/solutions/finance), [healthcare](/solutions/healthcare) and [pharma](/solutions/pharma).",
      bullets: [
        "Fact Check compares AI statements with your reference documents (label, spec sheet, terms) and flags contradicted, unsupported, outdated and off-label claims",
        "Each checked product or asset carries its markets and regulator, for example DE · EMA or US · FDA",
        "Self-host to keep prompts, answers and findings in your own database",
        "Audit log, roles and per-project access support review and approval workflows",
      ],
      cta: { label: "How Fact Check works", href: "/ai-fact-check" },
    },
    {
      kind: "cards",
      id: "open-source",
      eyebrow: "Built in public",
      title: "Everything happens on GitHub",
      subtitle: "The code, the roadmap discussions and every change are public. Judge the project by its work, not by our marketing.",
      columns: 4,
      cards: [
        {
          icon: "git",
          title: "Repository",
          href: site.github,
          body: "The complete source under the MIT license: app, local agent, plugins and deployment files.",
        },
        {
          icon: "users",
          title: "Contributors",
          href: `${site.github}/graphs/contributors`,
          body: "Everyone who has shaped AutoSEO, listed by GitHub straight from the commit history.",
        },
        {
          icon: "rocket",
          title: "Releases",
          href: `${site.github}/releases`,
          body: "Tagged versions and the Docker image ghcr.io/codextde/autoseo. The main branch ships continuously.",
        },
        {
          icon: "message",
          title: "Discussions",
          href: `${site.github}/discussions`,
          body: "Questions, ideas and show-and-tell from people who run AutoSEO.",
        },
      ],
    },
    {
      kind: "steps",
      id: "get-listed",
      eyebrow: "Opt-in only",
      title: "Get listed as an AutoSEO user",
      subtitle:
        "We never add an organization because we saw it in a signup, an invoice or a log. Only you can add yourself — and remove yourself again.",
      steps: [
        { title: "Fork the repository", body: `Fork [codextde/autoseo](${site.github}) on GitHub.` },
        {
          title: "Add a line to USERS.md",
          body: "Organization name, website and, if you like, how you use AutoSEO (for example “self-hosted, 12 brands in 4 markets”). Create the file if it does not exist yet.",
        },
        {
          title: "Open a pull request",
          body: "Submit it from an account that can speak for your organization, or tell us in the pull request how we can verify it.",
        },
        {
          title: "Remove it anytime",
          body: `Another pull request or an email to [${site.contactEmail}](mailto:${site.contactEmail}) and the entry is gone.`,
        },
      ],
    },
    {
      kind: "checklist",
      id: "rules",
      eyebrow: "Our rules for social proof",
      title: "What you will not find on this site",
      items: [
        "Logos of companies that have not given us written permission",
        "Testimonials we cannot attribute to a real person who approved the wording",
        "Growth figures or results we cannot reproduce from data",
        "Listings based on signups, payments or server logs",
      ],
      aside: [
        { type: "h3", text: "Case studies, done differently" },
        {
          type: "p",
          text: "Instead of customer stories we publish reproducible playbooks: the prompt set, the engines, how to take a baseline and how to measure change. You can check the method yourself.",
        },
        { type: "p", text: "[Browse the playbooks →](/case-studies)" },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Questions about our users",
      items: [
        {
          q: "Why don't you show customer logos?",
          a: "Because we only publish what we can back up. AutoSEO is open source and self-hosted instances send us no data, so most people who run it are unknown to us. Showing logos without permission, or implying endorsements, would be misleading. Organizations that opt in via USERS.md on GitHub get listed.",
        },
        {
          q: "Is AutoSEO a good fit for a small team?",
          a: `Yes. One person can set it up: self-host it on a small server (2 vCPU, 2–4 GB RAM) for free, or use AutoSEO Cloud for ${price} per month with AI providers and SEO data already configured. Neither option charges per seat.`,
        },
        {
          q: "Which AI engines does AutoSEO track?",
          a: "ChatGPT (API and app), Perplexity, Google AI Overviews, Google AI Mode, Gemini, Claude, Microsoft Copilot, Grok, Mistral and DeepSeek, among others. Which engines are available depends on the providers configured on the instance: API keys, a local Claude Code or Codex agent, or DataForSEO.",
        },
        {
          q: "Can agencies use AutoSEO for client work?",
          a: "Yes. The MIT license allows you to host AutoSEO for clients. Use one project per client, give clients read-only access with the Client role, open pitch projects that expire automatically and send white-label reports with your own brand kit. The partner program page describes how we work with agencies.",
        },
        {
          q: "Do you publish case studies?",
          a: "We publish reproducible playbooks instead of customer stories. Each one lists the prompt set, the engines to track, how to take a baseline in AutoSEO, which actions to take and how to measure the change, including the expected variance of AI answers.",
        },
        {
          q: "How do I get my organization listed?",
          a: `Open a pull request on GitHub that adds your organization to USERS.md in the AutoSEO repository. Listing is opt-in only, and you can remove the entry at any time with another pull request or an email to ${site.contactEmail}.`,
        },
        {
          q: "Where can I share my own results?",
          a: "In GitHub Discussions. Include your prompt set, the engines, the time frame and how you measured, so others can reproduce what you did and learn from it.",
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "See where your brand stands in AI answers",
      body: "Start with AutoSEO Cloud or self-host the open-source edition for free. Every feature is included in both.",
      primary: { label: `Start for ${price}/month`, href: "/signup" },
      secondary: { label: "Self-host for free", href: "/self-hosting" },
    },
  ],
};

export default page;
