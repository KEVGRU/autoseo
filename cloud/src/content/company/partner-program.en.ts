import type { SitePage } from "@/components/site/types";
import { site } from "@/lib/site";

const apply = `mailto:${site.contactEmail}?subject=Partner%20program`;
const { projects } = site.cloudPlan;

const page: SitePage = {
  path: "/partner-program",
  crumb: "Partner program",
  meta: {
    title: "AutoSEO Partner Program for Agencies and Freelancers",
    description:
      "Offer AI visibility services with open-source AutoSEO: host it for clients under the MIT license, manage clients as projects, send white-label reports.",
  },
  hero: {
    eyebrow: "Partner program",
    title: "Build your GEO service on open-source AutoSEO",
    subtitle:
      "The MIT license lets you host AutoSEO for your clients without license fees. The partner program adds what open source alone doesn't: a direct line to the people who build it, early access to new features and, if you want, a listing.",
    ctas: [
      { label: "Become a partner", href: apply },
      { label: "Read the agency pitch playbook", href: "/case-studies/agency-pitch-in-14-days" },
    ],
  },
  sections: [
    {
      kind: "cards",
      id: "delivery",
      eyebrow: "Delivery models",
      title: "Three ways to deliver AutoSEO to clients",
      subtitle: "Same software in every model. Choose by who should run the servers and where client data has to live.",
      columns: 3,
      cards: [
        {
          icon: "server",
          title: "Your own instance",
          badge: "Free · MIT",
          body: "Self-host one AutoSEO for all your clients. Give it your name, logo and colors under Admin → Branding and run it on your own domain.",
        },
        {
          icon: "globe",
          title: "AutoSEO Cloud",
          badge: `$${site.priceMonthlyUsd}/month`,
          body: `A managed workspace hosted in Germany with up to ${projects} client projects, unlimited users and included usage. No servers to run.`,
        },
        {
          icon: "building",
          title: "Your client's infrastructure",
          body: "Install AutoSEO on your client's servers and operate it for them — when data has to stay with the client.",
        },
      ],
    },
    {
      kind: "cards",
      id: "client-work",
      eyebrow: "Built for client work",
      title: "What agencies use every day",
      columns: 3,
      cards: [
        {
          icon: "layers",
          title: "A project per client",
          body: "Each client is a project with its own prompts, competitors, market and integrations. The portfolio overview shows visibility, share of voice, average position, sentiment, citations, open high-impact tasks and AI revenue for all of them in one table.",
        },
        {
          icon: "users",
          title: "Client access",
          body: "Invite clients with the read-only Client role: they see their own project and nothing else.",
        },
        {
          icon: "target",
          title: "Pitch projects",
          body: "Track a prospect in a pitch project that archives itself after 7 to 90 days if you don't win the account.",
        },
        {
          icon: "presentation",
          title: "White-label reports",
          body: "Templates such as Pitch, Monthly Report and Competitor Benchmark, your brand kit, PPTX and PDF export and password-protected share links.",
        },
        {
          icon: "code",
          title: "API and MCP",
          body: "Automate reporting through the REST API and let your team's AI assistants work with client data through the MCP server — see the guides for [Claude](/blog/claude-connector) and [ChatGPT](/blog/chatgpt-plugin).",
        },
        {
          icon: "gauge",
          title: "Cost control",
          body: "Daily and monthly spend caps, plus a cost estimator with an optional agency markup to price client work (self-hosted).",
        },
      ],
    },
    {
      kind: "cards",
      id: "benefits",
      eyebrow: "What partners get",
      title: "Concrete, and not about commissions",
      subtitle: "The partner program pays no commissions. If you want to earn from referrals, see the [referral program](/affiliate-program).",
      columns: 3,
      cards: [
        {
          icon: "star",
          title: "Listing on request",
          body: "If you want, we list your agency as an AutoSEO partner on this page, with a link. Opt-in, and removed whenever you ask.",
        },
        {
          icon: "rocket",
          title: "Early access",
          body: "Access to new features while they are in beta, before we announce them, and a say in what we build next.",
        },
        {
          icon: "message",
          title: "A direct line",
          body: "A direct email line to the people who build AutoSEO for bugs and questions that block client work — in addition to public GitHub issues.",
        },
      ],
    },
    {
      kind: "steps",
      id: "join",
      eyebrow: "How to join",
      title: "Become a partner in four steps",
      steps: [
        { title: "Try AutoSEO", body: "Self-host it or start an AutoSEO Cloud workspace and use it for one or two clients." },
        {
          title: "Write to us",
          body: `Email [${site.contactEmail}](${apply}) with the subject “Partner program”: your agency, your clients' industries and how you want to deliver AutoSEO.`,
        },
        { title: "Short call", body: "We talk about your setup, what you need from us and what we can offer." },
        { title: "Get started", body: "You get the direct line and early access; the listing follows if you want it." },
      ],
    },
    {
      kind: "checklist",
      id: "expectations",
      eyebrow: "Fair play",
      title: "What we ask of partners",
      items: [
        "Describe AutoSEO accurately — no promised rankings or guaranteed AI mentions",
        "Keep the MIT license notice in every copy of AutoSEO you distribute",
        "Don't present yourself as Codext GmbH or imply an exclusive partnership",
        "Report security issues privately, never in public",
      ],
      aside: [
        { type: "h3", text: "Rebranding and the license" },
        {
          type: "p",
          text: "The MIT license allows you to use, modify and host AutoSEO for clients, including under your own name via Admin → Branding. It grants no rights to the AutoSEO name or logo: use them only to describe the software accurately.",
        },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Questions from agencies",
      items: [
        {
          q: "Do I need permission to host AutoSEO for clients?",
          a: "No. The MIT license allows commercial use, modification and hosting for others. The partner program is optional and adds a direct relationship with us.",
        },
        {
          q: "Does the partner program pay commissions?",
          a: "No. The partner program is about support, early access and visibility. If you want to refer customers to AutoSEO Cloud for a commission, apply for the referral program, whose terms are agreed individually in writing.",
        },
        {
          q: "Can I white-label AutoSEO?",
          a: "Yes, on a self-hosted instance: set your own app name, logo and colors under Admin → Branding, use your own domain and create reports with your brand kit. On AutoSEO Cloud, reports carry your brand kit, while the app itself remains AutoSEO.",
        },
        {
          q: "Can I charge my clients for AutoSEO?",
          a: "Yes. How you price your services is up to you. On a self-hosted instance, the cost estimator can include an agency markup on provider costs to help you price client work.",
        },
        {
          q: "How many clients can I manage?",
          a: `Self-hosted AutoSEO has no limit on projects or users. An AutoSEO Cloud workspace includes up to ${projects} projects; use additional workspaces or self-host for more.`,
        },
        {
          q: "Can my clients log in themselves?",
          a: "Yes, with the Client role: read-only access to the projects you assign, without seeing other clients or any settings.",
        },
        {
          q: "Is there a partner certification or badge?",
          a: "No. We don't run a certification program, and partners may not describe themselves as certified by Codext GmbH.",
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Let's work together",
      body: "Tell us about your agency and your clients, and we'll take it from there.",
      primary: { label: "Become a partner", href: apply },
      secondary: { label: "Referral program", href: "/affiliate-program" },
    },
  ],
};

export default page;
