import type { PressPage } from "@/components/site/company/types";
import { site } from "@/lib/site";

const { legal } = site;
const press = `mailto:${site.contactEmail}?subject=Press%20inquiry`;

/** Boilerplates in both languages: journalists of either language may need both. */
export const boilerplates = {
  en50: "AutoSEO is an open-source AI visibility and SEO platform by Codext GmbH. It shows how ChatGPT, Perplexity, Gemini, Claude and Google's AI features mention a brand, alongside keyword research, rank tracking and site audits. It is MIT-licensed and free to self-host; the managed AutoSEO Cloud, hosted in Germany, costs $50 per month.",
  en100:
    "AutoSEO is an open-source platform for AI visibility (GEO/AEO) and search engine optimization, developed by Codext GmbH in Germany. It tracks how AI engines such as ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews and Microsoft Copilot mention and cite a brand, compares it with competitors and analyzes the sources behind the answers. AutoSEO also covers classic SEO — keyword research, rank tracking, site audits, backlinks — plus analytics, attribution, content workflows and white-label reports. Teams can self-host AutoSEO for free under the MIT license or use AutoSEO Cloud, a managed service hosted in Germany, for $50 per month.",
  de50: "AutoSEO ist eine Open-Source-Plattform für KI-Sichtbarkeit und SEO der Codext GmbH. Sie zeigt, wie ChatGPT, Perplexity, Gemini, Claude und die KI-Funktionen von Google eine Marke erwähnen – ergänzt um Keyword-Recherche, Rank Tracking und Site-Audits. AutoSEO steht unter MIT-Lizenz und lässt sich kostenlos selbst hosten; AutoSEO Cloud, gehostet in Deutschland, kostet 50 $ im Monat.",
  de100:
    "AutoSEO ist eine Open-Source-Plattform für KI-Sichtbarkeit (GEO/AEO) und Suchmaschinenoptimierung, entwickelt von der Codext GmbH in Deutschland. Sie misst, wie KI-Engines wie ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews und Microsoft Copilot eine Marke erwähnen und zitieren, vergleicht sie mit Wettbewerbern und analysiert die Quellen hinter den Antworten. Dazu deckt AutoSEO klassisches SEO ab – Keyword-Recherche, Rank Tracking, Site-Audits, Backlinks – sowie Analytics, Attribution, Content-Workflows und White-Label-Reports. Teams können AutoSEO unter der MIT-Lizenz kostenlos selbst hosten oder AutoSEO Cloud nutzen, einen in Deutschland gehosteten Managed Service für 50 $ im Monat.",
};

const page: PressPage = {
  path: "/press",
  crumb: "Press",
  meta: {
    title: "AutoSEO Press Kit: Boilerplate, Facts, Logos, Screenshots",
    description:
      "Press kit for AutoSEO, the open-source AI visibility and SEO platform by Codext GmbH: boilerplates in English and German, fact sheet, logos and screenshots.",
  },
  hero: {
    eyebrow: "Press",
    title: "Press kit",
    subtitle:
      "Everything you need to write about AutoSEO: short descriptions in English and German, verifiable facts, logos, product screenshots and a direct contact.",
    ctas: [
      { label: "Contact us", href: press },
      { label: "Logos and screenshots", href: "#logos" },
    ],
  },
  sections: [
    {
      kind: "prose",
      id: "boilerplate",
      eyebrow: "Boilerplate",
      title: "Describe AutoSEO in 50 or 100 words",
      blocks: [
        { type: "h3", text: "English · about 50 words" },
        { type: "p", text: boilerplates.en50 },
        { type: "h3", text: "English · about 100 words" },
        { type: "p", text: boilerplates.en100 },
        { type: "h3", text: "German · about 50 words" },
        { type: "p", text: boilerplates.de50 },
        { type: "h3", text: "German · about 100 words" },
        { type: "p", text: boilerplates.de100 },
        {
          type: "callout",
          tone: "tip",
          title: "Spelling",
          text: "Write **AutoSEO** as one word. The managed service is **AutoSEO Cloud**; the company behind it is **Codext GmbH**.",
        },
      ],
    },
    {
      kind: "table",
      id: "fact-sheet",
      eyebrow: "Fact sheet",
      title: "AutoSEO at a glance",
      head: ["Fact", "Details"],
      rows: [
        ["Product", "AutoSEO — open-source platform for AI visibility (GEO/AEO) and SEO"],
        ["Company", `${legal.name}, ${legal.street}, ${legal.postalCode} ${legal.city}, Germany`],
        ["Managing director", legal.managingDirector],
        ["Commercial register", `${legal.registerCourt}, ${legal.registerNumber}`],
        ["License", "MIT (open source)"],
        ["Source code", `[github.com/codextde/autoseo](${site.github})`],
        ["Website", `[${site.host}](https://${site.host})`],
        ["Pricing", `Self-hosted: free, every feature. AutoSEO Cloud: $${site.priceMonthlyUsd} per workspace and month.`],
        ["Hosting", "Self-hosted: on the operator's own server (Docker). AutoSEO Cloud: hosted in Germany."],
        ["AI engines tracked", "ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews, Google AI Mode, Microsoft Copilot, Grok, Mistral, DeepSeek and more"],
        ["Technology", "Next.js, React and PostgreSQL; distributed as the Docker image `ghcr.io/codextde/autoseo`"],
      ],
      note: "Need a figure that isn't listed here? Ask us — we only publish facts we can back up.",
    },
    {
      kind: "checklist",
      id: "usage",
      eyebrow: "Guidelines",
      title: "Using our name, logo and screenshots",
      items: [
        "Use the logo and screenshots to report on or link to AutoSEO",
        "Keep clear space around the mark and show it on a calm background",
        "Don't change the colors or proportions of the mark, crop it or add effects",
        "Don't imply that Codext GmbH endorses, sponsors or partners with you unless agreed in writing",
        "Write the name as AutoSEO — one word, no space",
      ],
      aside: [
        { type: "h3", text: "About the screenshots" },
        {
          type: "p",
          text: "They show the demo project that ships with AutoSEO: fictional brands and generated sample data. Please don't present them as the results of a real company.",
        },
      ],
    },
    {
      kind: "cards",
      id: "contact",
      eyebrow: "Contact",
      title: "Talk to us",
      columns: 3,
      cards: [
        {
          icon: "mail",
          title: "Press inquiries",
          body: `Interviews, quotes, background and fact checks: [${site.contactEmail}](${press}). Please mention your deadline.`,
        },
        {
          icon: "building",
          title: "Company",
          body: `${legal.name}, ${legal.street}, ${legal.postalCode} ${legal.city}, Germany · [${legal.email}](mailto:${legal.email}) · ${legal.phone}. Full details in the [imprint](/imprint).`,
        },
        {
          icon: "shield",
          title: "Security researchers",
          body: "Please report vulnerabilities privately to [security@codext.de](mailto:security@codext.de) or via GitHub Security Advisories, not through the press contact.",
        },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Questions from journalists",
      items: [
        {
          q: "Who is behind AutoSEO?",
          a: `AutoSEO is developed by ${legal.name}, a software company based in ${legal.city}, Germany (managing director: ${legal.managingDirector}), together with open-source contributors on GitHub.`,
        },
        {
          q: "Is AutoSEO really free?",
          a: `Yes. The complete software is MIT-licensed and free to self-host, with every feature and no limits on users or projects. ${legal.name} earns money with AutoSEO Cloud, a managed service hosted in Germany that costs $${site.priceMonthlyUsd} per workspace and month.`,
        },
        {
          q: "How is AutoSEO different from other AI visibility tools?",
          a: "It is open source, can run on the customer's own server, combines AI visibility with a complete classic SEO suite and can run AI work through the Claude Code or Codex subscriptions a team already has. Many comparable tools are closed-source services priced per seat or per prompt.",
        },
        {
          q: "May I use the screenshots in my article?",
          a: "Yes, for editorial coverage of AutoSEO. They show the demo project with fictional brands and generated data. Please credit “AutoSEO” as the source.",
        },
        {
          q: "Can I get access for a review?",
          a: `Yes. Email ${site.contactEmail} and ask for a complimentary AutoSEO Cloud workspace for your review, or install the free self-hosted edition yourself; it includes a demo project with 90 days of sample data.`,
        },
        {
          q: "Where can I follow product changes?",
          a: "Changes ship continuously from the main branch on GitHub. Tagged versions are listed under Releases, and every commit is public in the repository history.",
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Writing about AI search?",
      body: "We are happy to explain how AI visibility tracking works — including what it can't tell you.",
      primary: { label: "Contact us", href: press },
      secondary: { label: "View on GitHub", href: site.github },
    },
  ],
  assetsAfter: "fact-sheet",
  logos: {
    title: "Logos",
    subtitle: "The AutoSEO mark as SVG and PNG. In running text, write the name as “AutoSEO”.",
    items: [
      { label: "AutoSEO mark", src: "/icon.svg", format: "SVG", size: "vector, scalable" },
      { label: "AutoSEO app icon", src: "/apple-touch-icon.png", format: "PNG", size: "180 × 180 px" },
    ],
  },
  screenshots: {
    title: "Screenshots",
    subtitle: "Product screenshots of the built-in demo project (fictional brands, generated data), free to use in coverage of AutoSEO. Click to open, or download the PNG.",
    items: [
      { src: "/screenshots/dashboard.png", alt: "AutoSEO dashboard with AI visibility, mention rate, citation rate, share of voice and sentiment", caption: "Dashboard: AI visibility KPIs next to competitor trends.", width: 1600, height: 1000 },
      { src: "/screenshots/ai-tracker.png", alt: "AI visibility tracker with daily visibility trend and prompts per day", caption: "AI visibility tracker across engines and prompts.", width: 1600, height: 1000 },
      { src: "/screenshots/competitors.png", alt: "Competitor mention rate over time and visibility ranking table", caption: "Competitors: share of voice and ranking.", width: 1600, height: 1000 },
      { src: "/screenshots/sources.png", alt: "Top cited sources, source types and source analysis table", caption: "Sources: which pages AI engines cite.", width: 1600, height: 1000 },
      { src: "/screenshots/sentiment.png", alt: "Sentiment score, sentiment over time and praise and criticism themes", caption: "Sentiment: what AI praises and criticizes.", width: 1600, height: 1000 },
      { src: "/screenshots/site-audit.png", alt: "Site audit report with health score, issue categories and issues list", caption: "Site audit with health score and issues.", width: 1600, height: 1000 },
      { src: "/screenshots/reports.png", alt: "Report builder editing a monthly AI visibility report slide", caption: "Report builder with white-label slides.", width: 1600, height: 1000 },
      { src: "/screenshots/attribution.png", alt: "Attribution comparing AI search with other channels and revenue", caption: "Attribution: revenue from AI search.", width: 1600, height: 1000 },
      { src: "/screenshots/bot-traffic.png", alt: "Bot traffic analytics with AI crawler visits per day", caption: "AI bot traffic from logs and CDN connectors.", width: 1600, height: 1000 },
    ],
  },
};

export default page;
