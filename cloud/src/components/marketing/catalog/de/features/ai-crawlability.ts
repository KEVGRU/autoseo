import type { FeaturePage } from "../../types";

export default {
  slug: "ai-crawlability",
  nav: "KI-Crawlability-Check",
  summary: "Prüfen Sie, ob KI-Crawler Ihre Website erreichen und lesen können – mit fertigen Fixes.",
  meta: {
    title: "KI-Crawlability-Check: robots.txt & llms.txt",
    description:
      "KI-Crawlability prüfen für GPTBot, ClaudeBot, PerplexityBot und 24 weitere Bots: robots.txt, Bot-Zugriff, Rendering und llms.txt, mit Score von 0–100 und Fixes.",
  },
  hero: {
    eyebrow: "KI-Crawlability",
    title: "Prüfen Sie die KI-Crawlability Ihrer Website.",
    muted: "Und beheben Sie, was Bots blockiert.",
    subtitle:
      "AutoSEO prüft Ihre robots.txt für 27 KI- und Such-Crawler, ruft Ihre Seiten mit deren echten User-Agents ab, analysiert das rohe HTML, das sie erhalten, und validiert Ihre llms.txt. Sie erhalten einen Score von 0 bis 100, nach Schweregrad sortierte Befunde und Fixes, die Sie direkt übernehmen können.",
  },
  visual: "audit",
  stats: [
    { value: 27, label: "Geprüfte Crawler", note: "Gegen Ihre robots.txt" },
    { value: 9, label: "Prüfbereiche", note: "Von robots.txt bis Antwortzeit" },
    { value: 100, label: "Punkte-Score", note: "Gewichtet nach Zweck des Crawlers" },
    { value: 0, prefix: "$", label: "Self-Hosting", note: "MIT-Lizenz, alle Funktionen" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "Blockierte Seiten werden nicht zitiert.",
    muted: "Die meisten Sperren sind ein Versehen.",
    body: "Eine zu breite Disallow-Regel, eine Firewall, die unbekannte Bots herausfordert, oder eine Seite, die nur mit JavaScript rendert: So bleiben KI-Crawler draußen, ohne dass es jemand merkt. Das sieht nach schwacher AI Visibility aus, die Ursache ist aber technisch.",
    points: [
      {
        title: "Die meisten KI-Crawler führen kein JavaScript aus",
        body: "Sie lesen das rohe HTML. Erscheint Ihr Inhalt erst nach clientseitigem Rendering, sehen sie nur eine leere App-Hülle.",
      },
      {
        title: "robots.txt-Regeln greifen ineinander",
        body: "Wildcard-Gruppen, Gruppen je Bot und Crawl-Delays wirken auf eine Weise zusammen, die von Hand schwer zu durchschauen ist – erst recht bei 27 User-Agents.",
      },
      {
        title: "CDNs behandeln Bots anders",
        body: "Ein Bot-Schutz kann GPTBot eine Challenge ausliefern, während Browser die normale Seite sehen. Das zeigt nur eine Anfrage mit dem User-Agent des Crawlers.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was der Check abdeckt",
    title: "Neun Bereiche, ein Score –",
    muted: "Fixes inklusive.",
    items: [
      {
        icon: "bot",
        title: "robots.txt je KI-Crawler",
        body: "Erlaubt, teilweise oder ganz blockiert – für jeden KI-Such-, Assistenten-, Trainings- und SEO-Crawler, mit der genauen Regel und Zeile, die entscheidet.",
      },
      {
        icon: "shield-check",
        title: "Bot-Zugriff vs. Browser",
        body: "Ihre Seiten, abgerufen mit dem echten User-Agent jedes Crawlers und verglichen mit einer Browser-Anfrage – so fallen Firewall-Sperren, Challenges und Fehler auf.",
      },
      {
        icon: "code",
        title: "Rendering im rohen HTML",
        body: "Ob das HTML, das Crawler erhalten, Ihre Inhalte enthält oder nur eine App-Hülle – samt erkannten Frameworks.",
      },
      {
        icon: "book",
        title: "llms.txt prüfen und erstellen",
        body: "Prüft /llms.txt und /llms-full.txt gegen das llmstxt.org-Format und erstellt einen Entwurf aus Ihrer Seitenstruktur – per Vorlage oder von der KI geschrieben.",
      },
      {
        icon: "list-checks",
        title: "Meta Robots, Sitemaps, Schema",
        body: "Meta-Robots- und X-Robots-Tag-Direktiven, Sitemap-Erkennung, strukturierte Daten, Canonicals, Time to First Byte und HTML-Größe.",
      },
      {
        icon: "bell",
        title: "Zeitpläne und Warnungen",
        body: "Lassen Sie den Check wöchentlich oder monatlich laufen und erhalten Sie eine Benachrichtigung in der App und per E-Mail, wenn der Score fällt.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Von der Domain zur Fix-Liste",
    muted: "in etwa einer Minute.",
    items: [
      {
        title: "Check starten",
        body: "Ihre Startseite wird immer geprüft. Ergänzen Sie wichtige Seiten wie Preise, Produkte oder Doku – oder lassen Sie AutoSEO Seiten aus Ihrer Sitemap auswählen.",
      },
      {
        title: "Score und Befunde lesen",
        body: "Der Score gewichtet KI-Such- und nutzerausgelöste Crawler dreimal so stark wie Trainings-Crawler. Die Befunde reichen von kritisch bis bestanden.",
      },
      {
        title: "Fix übernehmen und neu prüfen",
        body: "Befunde enthalten fertige Snippets, etwa eine robots.txt-Gruppe, die blockierte Crawler wieder zulässt und Ihre bestehenden Ausschlüsse beibehält.",
      },
    ],
  },
  faq: [
    {
      q: "Was ist KI-Crawlability?",
      a: "KI-Crawlability beschreibt, ob die Crawler hinter ChatGPT, Claude, Perplexity, Gemini und anderen KI-Engines Ihre Seiten erreichen und lesen können. Sie hängt von den Regeln in der robots.txt ab, davon, wie Server und CDN auf Bot-User-Agents reagieren, und davon, ob Ihre Inhalte ohne JavaScript im HTML stehen.",
    },
    {
      q: "Wie prüfe ich, ob GPTBot meine Website crawlen darf?",
      a: "Starten Sie in AutoSEO einen Crawlability-Check. Er liest Ihre robots.txt für GPTBot, OAI-SearchBot, ChatGPT-User und 24 weitere Crawler und ruft Ihre Seiten mit deren echten User-Agents ab. Für jeden Bot sehen Sie, ob der Zugriff erlaubt, teilweise oder ganz blockiert ist – und warum.",
    },
    {
      q: "Sollte ich KI-Trainings-Crawler blockieren?",
      a: "Das ist eine geschäftliche Entscheidung, und AutoSEO behandelt sie auch so. Trainings-Crawler wie GPTBot, ClaudeBot und Google-Extended werden getrennt von Such- und nutzerausgelösten Crawlern ausgewiesen: Blockierte Trainings-Bots sind eine Warnung, blockierte KI-Such-Bots kritisch, weil sie Sie aus Live-Antworten ausschließen.",
    },
    {
      q: "Was ist eine llms.txt und brauche ich eine?",
      a: "Die llms.txt ist eine vorgeschlagene Markdown-Datei im Root Ihrer Domain, die Sprachmodellen eine kurze Übersicht Ihrer Website mit Links zu den wichtigsten Seiten gibt – nach dem Format von llmstxt.org. Sie ist optional und zählt 10 der 100 Punkte. AutoSEO prüft eine vorhandene Datei oder erstellt einen Entwurf, den Sie prüfen und veröffentlichen.",
    },
    {
      q: "Wie wird der Crawlability-Score berechnet?",
      a: "Der Score setzt sich aus neun gewichteten Bereichen zusammen: robots.txt-Zugriff 30, HTTP-Zugriff für Bots 20, serverseitiges Rendering 15, llms.txt 10, Meta Robots 10, Sitemap 5, strukturierte Daten 5, Canonical 3 sowie Antwortzeit und Seitengewicht 2. SEO-Tool-Crawler werden angezeigt, aber nicht bewertet.",
    },
    {
      q: "Worin unterscheidet sich das von einem Site Audit?",
      a: "Das Site Audit crawlt Ihre gesamte Website mit 29 technischen SEO-Checks und Lighthouse. Der Crawlability-Check konzentriert sich auf KI-Crawler: robots.txt-Regeln je Bot, Antworten auf Bot-User-Agents, Rendering im rohen HTML und llms.txt. Nutzen Sie beides.",
    },
    {
      q: "Ist der KI-Crawlability-Check kostenlos?",
      a: "Der Crawlability-Check ist Teil der Open-Source-App AutoSEO und beim Self-Hosting mit allen Funktionen kostenlos. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat, KI- und Datennutzung im Wert von 10\u00a0$ inklusive. KI-geschriebene llms.txt-Entwürfe können auch über Ihr eigenes Claude Code oder Codex per lokalem Agenten laufen.",
    },
  ],
  related: ["ai-bot-traffic", "site-audit", "ai-seo-tasks", "ai-citation-tracking"],
  cta: {
    title: "Finden Sie heraus, was KI-Crawler auf Ihrer Website sehen",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
