import type { SitePage } from "@/components/site/types";
import { site } from "@/lib/site";

const goodFirstIssues = `${site.github}/issues?q=is%3Aopen+label%3A%22good+first+issue%22`;
const helpWanted = `${site.github}/issues?q=is%3Aopen+label%3A%22help+wanted%22`;
const contributing = `${site.github}/blob/main/CONTRIBUTING.md`;
const apply = `mailto:${site.contactEmail}?subject=Bewerbung`;

const page: SitePage = {
  path: "/careers",
  crumb: "Karriere",
  meta: {
    title: "Karriere bei AutoSEO: an Open-Source-GEO mitarbeiten",
    description:
      "Derzeit keine offenen Stellen bei AutoSEO. Arbeiten Sie auf GitHub an der Open-Source-Plattform für KI-Sichtbarkeit mit oder bewerben Sie sich initiativ.",
  },
  hero: {
    eyebrow: "Karriere",
    title: "Bauen Sie mit an der Open-Source-Plattform für KI-Suche",
    subtitle:
      "Derzeit haben wir keine offenen Stellen – und sagen das lieber offen, als eine leere Jobbörse zu pflegen. Mitarbeiten können Sie trotzdem schon heute: Der gesamte Code liegt auf GitHub, und Beiträge jeder Größe sind willkommen.",
    ctas: [
      { label: "Good First Issue finden", href: goodFirstIssues },
      { label: "Contributing-Guide lesen (englisch)", href: contributing },
    ],
  },
  sections: [
    {
      kind: "prose",
      id: "positions",
      eyebrow: "Offene Stellen",
      title: "Aktuell keine offenen Stellen",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Aktueller Stand: keine Ausschreibungen",
          text: "Bei der Codext GmbH gibt es derzeit keine offenen Stellen für AutoSEO. Sobald wir einstellen, finden Sie die Stelle mit vollständiger Beschreibung auf dieser Seite.",
        },
        {
          type: "p",
          text: "Bis dahin arbeiten Sie am besten über den Code mit uns zusammen. Alles passiert öffentlich auf [GitHub](" + site.github + "): Issues, Diskussionen, Pull Requests und Releases.",
        },
      ],
    },
    {
      kind: "cards",
      id: "help-wanted",
      eyebrow: "Mitmachen",
      title: "Wo Hilfe besonders willkommen ist",
      subtitle: `Achten Sie auf Issues mit den Labels [good first issue](${goodFirstIssues}) oder [help wanted](${helpWanted}) – oder wählen Sie einen dieser Bereiche.`,
      columns: 3,
      cards: [
        {
          icon: "bot",
          title: "KI-Engines",
          body: "Neue Antwort-Engines anbinden, das Auslesen von Zitaten und Shopping-Karten verbessern, Provider robuster machen. Die Engines sind in `src/lib/engines.ts` definiert.",
        },
        {
          icon: "link",
          title: "Integrationen",
          body: "Anbindungen für CMS-Publishing, Analytics, CRM und Projektmanagement. Einige sind noch in der Beta oder als „coming soon“ markiert, etwa Fastly und AWS CloudFront.",
        },
        {
          icon: "globe",
          title: "Übersetzungen",
          body: "Die Oberfläche der App ist heute englisch, den Onboarding-Assistenten gibt es auf Englisch und Deutsch. Helfen Sie, mehr von der App und dieser Website in weitere Sprachen zu bringen.",
        },
        {
          icon: "book",
          title: "Dokumentation",
          body: "Self-Hosting-Anleitungen für weitere Plattformen, Beispiele für API und MCP, Fehlerbehebung. Die Dokumentation liegt im Repository direkt neben dem Code.",
        },
        {
          icon: "sparkles",
          title: "Agent-Skills und Plugins",
          body: "AutoSEO bringt Agent-Skills und Plugins für Claude Code, Codex und Cursor mit. Neue Skills und bessere Anweisungen sind willkommen.",
        },
        {
          icon: "search",
          title: "Bug-Reports und Tests",
          body: "Auch ein präziser Bug-Report mit Schritten zur Reproduktion ist ein Beitrag. Nutzen Sie dafür die Issue-Vorlagen auf GitHub.",
        },
      ],
    },
    {
      kind: "steps",
      id: "first-contribution",
      eyebrow: "Einstieg",
      title: "Ihr erster Beitrag in vier Schritten",
      steps: [
        {
          title: "Issue auswählen",
          body: `Beginnen Sie mit einem [good first issue](${goodFirstIssues}). Für größere Ideen eröffnen Sie zuerst einen Thread in den [Discussions](${site.github}/discussions), damit wir uns über den Ansatz abstimmen können.`,
        },
        {
          title: "Lokal einrichten",
          body: "Node 24, pnpm und Docker für PostgreSQL. Führen Sie `pnpm install`, `pnpm db:push` und `pnpm dev` aus; die Details stehen in CONTRIBUTING.md.",
        },
        {
          title: "Konventionen beachten",
          body: "Lesen Sie `docs/ARCHITECTURE.md`. Führen Sie vor dem Pull Request `pnpm typecheck`, `pnpm lint` und `pnpm test` aus – genau das prüft auch die CI.",
        },
        {
          title: "Pull Request öffnen",
          body: "Nutzen Sie Conventional Commits und halten Sie Änderungen fokussiert. Review und Diskussion finden öffentlich statt.",
        },
      ],
    },
    {
      kind: "split",
      id: "speculative",
      eyebrow: "Initiativbewerbung",
      title: "Sie möchten beruflich an AutoSEO arbeiten?",
      body: "Wenn Sie überzeugt sind, wirklich etwas bewegen zu können – in der Entwicklung, in der GEO-Forschung oder in der Arbeit mit Agenturen –, schreiben Sie uns trotzdem. Erzählen Sie, woran Sie als Erstes arbeiten würden, und verlinken Sie Dinge, die Sie gebaut haben. Beiträge zu AutoSEO sagen mehr als jeder Lebenslauf.",
      bullets: [
        `Schicken Sie Ihre Bewerbung an ${site.contactEmail} mit dem Betreff „Bewerbung“`,
        "Ein kurzer Text und Links genügen – kein Anschreiben nach Schema nötig",
        "Solange keine Stelle offen ist, können wir keine Anstellung zusagen",
      ],
      cta: { label: "Bewerbung per E-Mail senden", href: apply },
    },
    {
      kind: "cards",
      id: "why",
      eyebrow: "Warum mitmachen",
      title: "Was Sie davon haben",
      columns: 3,
      cards: [
        {
          icon: "git",
          title: "Öffentlich arbeiten",
          body: "Jeder Beitrag ist sichtbar und in der Commit-Historie Ihnen zugeordnet – ein Portfolio, das für sich spricht.",
        },
        {
          icon: "sparkles",
          title: "Ein junges Feld",
          body: "Generative Engine Optimization entsteht gerade erst. Engines, Crawler und Antwortformate ändern sich schnell – hier lässt sich echtes Neuland betreten.",
        },
        {
          icon: "code",
          title: "Ein moderner Stack",
          body: "Next.js 16, React 19, Tailwind v4, PostgreSQL 17 und Drizzle, dazu ein lokaler Agent, der Claude Code und Codex ausführt.",
        },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Fragen zur Mitarbeit an AutoSEO",
      items: [
        {
          q: "Stellen Sie gerade ein?",
          a: "Im Moment nicht. Bei der Codext GmbH gibt es derzeit keine offenen Stellen für AutoSEO. Sobald sich das ändert, finden Sie die Stelle auf dieser Seite.",
        },
        {
          q: "Kann ich mich initiativ bewerben?",
          a: `Ja. Schreiben Sie an ${site.contactEmail} mit dem Betreff „Bewerbung“, einer kurzen Notiz dazu, woran Sie als Erstes arbeiten würden, und Links zu Ihren Arbeiten. Solange keine Stelle offen ist, können wir keine Anstellung zusagen.`,
        },
        {
          q: "Brauche ich viel Entwicklungserfahrung, um beizutragen?",
          a: "Nein. Issues mit dem Label good first issue sind für den Einstieg zugeschnitten, und Dokumentation, Übersetzungen und präzise Bug-Reports sind wertvolle Beiträge, die kein tiefes Wissen über die Codebasis erfordern.",
        },
        {
          q: "Werden Beiträge bezahlt?",
          a: "Nein. AutoSEO ist ein Open-Source-Projekt unter der MIT-Lizenz, Beiträge sind freiwillig. Wenn Sie beruflich an AutoSEO arbeiten möchten, bewerben Sie sich initiativ.",
        },
        {
          q: "Unter welcher Lizenz werden Beiträge veröffentlicht?",
          a: "AutoSEO hat kein Contributor License Agreement. Beiträge werden wie der übrige Code unter der MIT-Lizenz des Projekts veröffentlicht, und Sie werden in der Commit-Historie genannt.",
        },
        {
          q: "Wo stelle ich Fragen, bevor ich loslege?",
          a: "In den GitHub Discussions. Bei größeren Änderungen eröffnen Sie zuerst eine Diskussion oder ein Issue, damit wir uns über den Ansatz einig sind, bevor Sie viel Zeit investieren.",
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Fangen Sie mit einem Issue an",
      body: "Der schnellste Weg, mit uns zusammenzuarbeiten, ist ein Pull Request.",
      primary: { label: "Good First Issues ansehen", href: goodFirstIssues },
      secondary: { label: "Zu den Discussions", href: `${site.github}/discussions` },
    },
  ],
};

export default page;
