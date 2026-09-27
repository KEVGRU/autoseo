import type { SitePage } from "@/components/site/types";
import { site } from "@/lib/site";

const walkthrough = `mailto:${site.contactEmail}?subject=Live%20walkthrough`;

const page: SitePage = {
  path: "/webinars",
  crumb: "Webinars",
  meta: {
    title: "AutoSEO Webinars and On-Demand Learning Paths",
    description:
      "No live webinars are scheduled right now. Learn AI visibility and AutoSEO on demand with curated learning paths, or request a live walkthrough for your team.",
  },
  hero: {
    eyebrow: "Webinars",
    title: "Learn AI visibility on your schedule",
    subtitle:
      "No webinars are scheduled at the moment. Instead of a waiting list, here are curated learning paths through our guides and playbooks — and a live walkthrough for your team on request.",
    ctas: [
      { label: "Start a learning path", href: "#path-basics" },
      { label: "Request a walkthrough", href: walkthrough },
    ],
  },
  sections: [
    {
      kind: "prose",
      id: "schedule",
      eyebrow: "Schedule",
      title: "Upcoming webinars",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Nothing scheduled right now",
          text: "We only announce sessions that are actually planned. When we schedule one, it will appear here with date, time zone, agenda and speakers.",
        },
        {
          type: "p",
          text: "The learning paths below cover what a first webinar would: what AI visibility is and how to measure it, the technical basics, agency workflows and connecting AI search to revenue and working with AutoSEO from AI assistants. Each path takes you from the concept to a hands-on playbook. For background reading, see the [AutoSEO blog](/blog).",
        },
      ],
    },
    {
      kind: "links",
      id: "path-basics",
      eyebrow: "Learning path 1 · Basics",
      title: "Understand and measure AI visibility",
      subtitle: "For marketers and SEOs who are new to GEO.",
      links: [
        { label: "AI visibility tracking", href: "/ai-visibility-tracking", description: "What gets measured: visibility, mentions, citations and position per prompt and engine." },
        { label: "Prompt research", href: "/prompt-research", description: "How to find the questions your buyers actually ask AI." },
        { label: "Blog: What is query fan-out?", href: "/blog/query-fan-out", description: "How AI search splits one prompt into many searches, and what that means for your content." },
        { label: "Blog: Which GEO techniques work?", href: "/blog/geo-techniques", description: "What the research shows about raising AI visibility, why studies disagree and how to test a technique yourself." },
        { label: "Playbook: Win comparison prompts", href: "/case-studies/win-comparison-prompts", description: "A complete method with a prompt set to import." },
        { label: "Try the demo project", href: "/self-hosting", description: "After installing, open the built-in demo project with 90 days of sample data and the two-minute product tour." },
      ],
    },
    {
      kind: "links",
      id: "path-technical",
      eyebrow: "Learning path 2 · Technical",
      title: "Make your site readable for AI",
      subtitle: "For SEO, web and platform teams.",
      links: [
        { label: "Blog: Can AI crawlers read your site?", href: "/blog/ai-crawler-readability", description: "Which AI crawlers visit, which obey robots.txt, and how JavaScript, CDN bot settings and llms.txt affect them." },
        { label: "AI crawlability", href: "/ai-crawlability", description: "robots.txt, rendering, meta directives and llms.txt, checked per AI crawler." },
        { label: "AI bot traffic", href: "/ai-bot-traffic", description: "Which AI crawlers really visit, verified against published IP ranges." },
        { label: "Playbook: Fix AI crawler access", href: "/case-studies/fix-ai-crawler-access", description: "Checks, fixes and verification in one method." },
        { label: "Self-hosting guide", href: "/self-hosting", description: "Install AutoSEO on your own server with Docker in minutes." },
      ],
    },
    {
      kind: "links",
      id: "path-agencies",
      eyebrow: "Learning path 3 · Agencies",
      title: "Offer GEO as a service",
      subtitle: "For agencies and freelancers adding AI visibility to their offer.",
      links: [
        { label: "AutoSEO for agencies", href: "/solutions/agencies", description: "Client projects, client access and white-label reporting." },
        { label: "Report builder", href: "/report-builder", description: "Pitch, Monthly Report and Competitor Benchmark templates with your brand kit." },
        { label: "Playbook: Agency pitch in 14 days", href: "/case-studies/agency-pitch-in-14-days", description: "From a prospect's domain to a data-backed deck." },
        { label: "Partner program", href: "/partner-program", description: "How we work with agencies that deliver AutoSEO." },
      ],
    },
    {
      kind: "links",
      id: "path-impact",
      eyebrow: "Learning path 4 · Business impact",
      title: "Connect AI search to revenue",
      subtitle: "For marketing leads who have to justify a GEO budget.",
      links: [
        { label: "Blog: How to attribute leads and revenue to AI search", href: "/blog/ai-search-attribution", description: "Referrers, UTMs, GA4's AI Assistant channel and “How did you hear about us?” surveys." },
        { label: "AI search attribution", href: "/ai-search-attribution", description: "Self-reported attribution combined with orders and deals." },
        { label: "Playbook: Attribute AI search revenue", href: "/case-studies/attribute-ai-search-revenue", description: "Survey, conversions and referral traffic, step by step." },
        { label: "Blog: AI Mode vs. AI Overviews", href: "/blog/ai-mode-vs-ai-overviews", description: "How Google's two AI answer formats differ and how to measure both." },
        { label: "AI citation tracking", href: "/ai-citation-tracking", description: "Which sources AI cites for your topics." },
        { label: "Playbook: Get cited by trusted sources", href: "/case-studies/get-cited-by-trusted-sources", description: "Close the citation gaps that competitors fill." },
      ],
    },
    {
      kind: "links",
      id: "path-assistants",
      eyebrow: "Learning path 5 · AI assistants",
      title: "Work with AutoSEO from your AI assistant",
      subtitle: "For teams who want their SEO data inside Claude, ChatGPT or their code editor.",
      links: [
        { label: "MCP server", href: "/mcp-server", description: "Work with AutoSEO data from AI assistants such as Claude, ChatGPT or Cursor." },
        { label: "Blog: Connect AutoSEO to Claude via MCP", href: "/blog/claude-connector", description: "Setup for Claude, Claude Desktop and Claude Code with OAuth and safe scopes." },
        { label: "Blog: Connect AutoSEO to ChatGPT via MCP", href: "/blog/chatgpt-plugin", description: "Use AutoSEO from ChatGPT, Codex, Cursor and VS Code, with safe scopes and example prompts." },
        { label: "REST API", href: "/rest-api", description: "Pull AutoSEO data into your own tools." },
      ],
    },
    {
      kind: "split",
      id: "walkthrough",
      eyebrow: "For teams",
      title: "A live walkthrough for your team",
      body: "Evaluating AutoSEO with several people? We walk your team through the product by video call — focused on your questions and, if you like, on a project with your own domain.",
      bullets: [
        "For teams evaluating AutoSEO Cloud or a self-hosted rollout",
        "By video call, in English or German",
        "Tell us your goals, team size and a few possible dates",
      ],
      cta: { label: "Request a walkthrough", href: walkthrough },
    },
    {
      kind: "cards",
      id: "community",
      eyebrow: "Between sessions",
      title: "Where to ask questions",
      columns: 3,
      cards: [
        { icon: "message", title: "GitHub Discussions", href: `${site.github}/discussions`, body: "Ask questions, share setups and discuss ideas with other AutoSEO users and the people who build it." },
        { icon: "book", title: "Documentation", href: `${site.github}/tree/main/docs`, body: "Self-hosting, architecture and managed hosting docs live in the repository." },
        { icon: "heart", title: "Support", href: "/support", body: "How to get help with AutoSEO Cloud and the self-hosted edition." },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Questions about webinars and learning",
      items: [
        {
          q: "Are there any upcoming webinars?",
          a: "Not at the moment. We only list sessions that are actually scheduled, with date, time and agenda. Until then, the learning paths on this page cover the same ground on demand.",
        },
        {
          q: "Can my team get a live demo?",
          a: `Yes. Email ${site.contactEmail} with your goals, team size and a few possible dates, and we will walk your team through AutoSEO by video call.`,
        },
        {
          q: "Can I try AutoSEO without paying?",
          a: "Yes. Install the free self-hosted edition and open the built-in demo project: 90 days of generated sample data for fictional brands, with no provider credits used. The in-app product tour takes about two minutes.",
        },
        {
          q: "Where do I get help with a specific problem?",
          a: "Questions about using AutoSEO are best asked in GitHub Discussions, and bugs belong in GitHub issues. AutoSEO Cloud customers can also contact us by email.",
        },
        {
          q: "Is the learning material free?",
          a: "Yes. All guides, playbooks and documentation are free and don't require an account.",
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Learn by doing",
      body: "The fastest way to understand AI visibility is to track your own prompts.",
      primary: { label: `Start for $${site.priceMonthlyUsd}/month`, href: "/signup" },
      secondary: { label: "Self-host for free", href: "/self-hosting" },
    },
  ],
};

export default page;
