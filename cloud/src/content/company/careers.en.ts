import type { SitePage } from "@/components/site/types";
import { site } from "@/lib/site";

const goodFirstIssues = `${site.github}/issues?q=is%3Aopen+label%3A%22good+first+issue%22`;
const helpWanted = `${site.github}/issues?q=is%3Aopen+label%3A%22help+wanted%22`;
const contributing = `${site.github}/blob/main/CONTRIBUTING.md`;
const apply = `mailto:${site.contactEmail}?subject=Application`;

const page: SitePage = {
  path: "/careers",
  crumb: "Careers",
  meta: {
    title: "Careers at AutoSEO: Contribute to Open-Source GEO",
    description:
      "There are no open positions at AutoSEO right now. Contribute to the open-source AI visibility platform on GitHub, or send us a speculative application.",
  },
  hero: {
    eyebrow: "Careers",
    title: "Help build the open-source platform for AI search",
    subtitle:
      "We have no open positions at the moment, and we'd rather say so than run an empty job board. You can still work on AutoSEO today: the whole codebase is on GitHub, and contributions of every size are welcome.",
    ctas: [
      { label: "Find a good first issue", href: goodFirstIssues },
      { label: "Read the contributing guide", href: contributing },
    ],
  },
  sections: [
    {
      kind: "prose",
      id: "positions",
      eyebrow: "Open positions",
      title: "No open positions right now",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Current status: not hiring",
          text: "There are no open roles for AutoSEO at Codext GmbH at the moment. When we hire, the role will be listed on this page with a complete description.",
        },
        {
          type: "p",
          text: "Until then, the best way to work with us is through the code. Everything happens in public on [GitHub](" + site.github + "): issues, discussions, pull requests and releases.",
        },
      ],
    },
    {
      kind: "cards",
      id: "help-wanted",
      eyebrow: "Contribute",
      title: "Where help is most welcome",
      subtitle: `Look for issues labeled [good first issue](${goodFirstIssues}) or [help wanted](${helpWanted}), or pick one of these areas.`,
      columns: 3,
      cards: [
        {
          icon: "bot",
          title: "AI engines",
          body: "Add new answer engines, improve how citations and shopping cards are parsed and make providers more robust. Engines are defined in `src/lib/engines.ts`.",
        },
        {
          icon: "link",
          title: "Integrations",
          body: "CMS publishing, analytics, CRM and project-management connectors. Some are still in beta or marked “coming soon”, such as Fastly and AWS CloudFront.",
        },
        {
          icon: "globe",
          title: "Translations",
          body: "The app interface is English today, with the onboarding wizard in English and German. Help bring more of the app and this website into other languages.",
        },
        {
          icon: "book",
          title: "Documentation",
          body: "Self-hosting guides for more platforms, API and MCP examples, troubleshooting. The docs live in the repository next to the code.",
        },
        {
          icon: "sparkles",
          title: "Agent skills and plugins",
          body: "AutoSEO ships agent skills and plugins for Claude Code, Codex and Cursor. New skills and better instructions are welcome.",
        },
        {
          icon: "search",
          title: "Bug reports and testing",
          body: "A precise bug report with steps to reproduce is a contribution, too. Use the issue templates on GitHub.",
        },
      ],
    },
    {
      kind: "steps",
      id: "first-contribution",
      eyebrow: "Getting started",
      title: "Your first contribution in four steps",
      steps: [
        {
          title: "Pick an issue",
          body: `Start with a [good first issue](${goodFirstIssues}). For bigger ideas, open a thread in [Discussions](${site.github}/discussions) first so we can agree on the approach.`,
        },
        {
          title: "Set up locally",
          body: "Node 24, pnpm and Docker for PostgreSQL. Run `pnpm install`, `pnpm db:push` and `pnpm dev`; the details are in CONTRIBUTING.md.",
        },
        {
          title: "Follow the conventions",
          body: "Read `docs/ARCHITECTURE.md`. Run `pnpm typecheck`, `pnpm lint` and `pnpm test` before you open a pull request — CI runs exactly these.",
        },
        {
          title: "Open a pull request",
          body: "Use Conventional Commits and keep changes focused. Review and discussion happen in the open.",
        },
      ],
    },
    {
      kind: "split",
      id: "speculative",
      eyebrow: "Speculative applications",
      title: "Want to work on AutoSEO professionally?",
      body: "If you believe you can make a real difference — in engineering, GEO research or working with agencies — write to us anyway. Tell us what you would work on first and link to things you have built. Contributions to AutoSEO say more than any CV.",
      bullets: [
        `Send it to ${site.contactEmail} with the subject “Application”`,
        "A short note and links are enough; no cover letter template needed",
        "We can't promise a position while no role is open",
      ],
      cta: { label: "Email your application", href: apply },
    },
    {
      kind: "cards",
      id: "why",
      eyebrow: "Why contribute",
      title: "What you get out of it",
      columns: 3,
      cards: [
        {
          icon: "git",
          title: "Work in public",
          body: "Every contribution is visible and credited in the commit history — a portfolio that speaks for itself.",
        },
        {
          icon: "sparkles",
          title: "A young field",
          body: "Generative engine optimization is being defined right now. Engines, crawlers and answer formats change quickly, so there is real ground to break.",
        },
        {
          icon: "code",
          title: "A modern stack",
          body: "Next.js 16, React 19, Tailwind v4, PostgreSQL 17 and Drizzle, plus a local agent that runs Claude Code and Codex.",
        },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Questions about working on AutoSEO",
      items: [
        {
          q: "Are you hiring?",
          a: "Not at the moment. There are no open positions for AutoSEO at Codext GmbH right now. When that changes, the role will be listed on this page.",
        },
        {
          q: "Can I apply speculatively?",
          a: `Yes. Email ${site.contactEmail} with the subject “Application”, a short note on what you would work on first and links to your work. We can't promise a position while no role is open.`,
        },
        {
          q: "Do I need to be an experienced developer to contribute?",
          a: "No. Issues labeled good first issue are scoped for newcomers, and documentation, translations and precise bug reports are valuable contributions that need no deep knowledge of the codebase.",
        },
        {
          q: "Are contributions paid?",
          a: "No. AutoSEO is an open-source project under the MIT license, and contributions are voluntary. If you would like to work on AutoSEO professionally, send a speculative application.",
        },
        {
          q: "Under which license are contributions published?",
          a: "AutoSEO has no contributor license agreement. Contributions are published under the project's MIT license, like the rest of the code, and you are credited in the commit history.",
        },
        {
          q: "Where do I ask questions before I start?",
          a: "In GitHub Discussions. For larger changes, open a discussion or an issue first, so we can agree on the approach before you invest a lot of time.",
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Start with one issue",
      body: "The fastest way to work with us is a pull request.",
      primary: { label: "Browse good first issues", href: goodFirstIssues },
      secondary: { label: "Join the discussions", href: `${site.github}/discussions` },
    },
  ],
};

export default page;
