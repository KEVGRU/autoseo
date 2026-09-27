import type { FeaturePage } from "../../types";

export default {
  slug: "site-audit",
  nav: "Site Audit",
  summary: "Crawlen Sie Ihre Website mit 29 technischen SEO-Prüfungen, Lighthouse und Vergleichen.",
  meta: {
    title: "SEO-Audit-Tool mit 29 technischen Prüfungen",
    description:
      "Technisches SEO-Audit für Ihre Website: Crawler mit 29 Prüfungen, Lighthouse-Scores und Health-Score-Verlauf. Open Source, mit geplanten Audits und Vergleichen.",
  },
  hero: {
    eyebrow: "SEO-Audit-Tool",
    title: "Ein SEO-Audit, das Fehler findet",
    muted: "und zeigt, was sich geändert hat.",
    subtitle:
      "Der integrierte Crawler von AutoSEO prüft Ihre Seiten auf 29 technische SEO-Probleme – defekte Links, Weiterleitungsketten, doppelte Titles, widersprüchliche Canonicals, dünne Inhalte und mehr –, ergänzt Lighthouse-Scores und verfolgt Ihren Health Score von Lauf zu Lauf.",
  },
  visual: "audit",
  screenshot: {
    src: "/screenshots/site-audit.png",
    alt: "AutoSEO-Site-Audit mit Health Score, Problemkategorien und einer Liste der gefundenen Probleme",
    url: "seo/audit",
  },
  stats: [
    { value: 29, label: "Technische Prüfungen", note: "Fehler, Warnungen und Hinweise" },
    { value: 12, label: "Problemkategorien", note: "Von Crawl-Zugriff bis Indexierbarkeit" },
    { value: 4, label: "Lighthouse-Kategorien", note: "Performance, Barrierefreiheit, Best Practices, SEO" },
    { value: 0, prefix: "$", label: "Self-Hosting", note: "MIT-Lizenz, alle Funktionen" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "Technische Fehler kosten Sichtbarkeit",
    muted: "in der Suche und in KI-Antworten.",
    body: "Suchmaschinen und KI-Assistenten können nur Seiten ranken oder zitieren, die sie erreichen, lesen und verstehen. Defekte Links, Weiterleitungsschleifen, noindex-Tags und langsame Antworten nehmen Seiten still und leise aus dem Rennen.",
    points: [
      {
        title: "Kleine Fehler summieren sich",
        body: "Ein fehlender Title schadet kaum. Hunderte doppelte Titles, verwaiste Seiten und Weiterleitungsketten verwässern die Signale der ganzen Website.",
      },
      {
        title: "Websites ändern sich jede Woche",
        body: "Neue Seiten, Plugins und Releases bringen neue Fehler mit. Geplante Audits finden sie, bevor Ihre Rankings darunter leiden.",
      },
      {
        title: "Fixes brauchen Belege",
        body: "Der Vergleich zweier Läufe zeigt, welche Probleme behoben und welche neu sind – so wissen Sie, dass ein Release sie wirklich gelöst hat.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was geprüft wird",
    title: "Ein vollständiges technisches Audit,",
    muted: "ohne Desktop-Crawler.",
    items: [
      {
        icon: "search",
        title: "29 technische Prüfungen",
        body: "HTTP-Fehler, defekte interne Links, Weiterleitungen, Titles und Meta Descriptions, Überschriften, Canonicals, Duplikate, dünne Inhalte, Alt-Texte und Indexierbarkeit.",
      },
      {
        icon: "gauge",
        title: "Lighthouse-Scores",
        body: "Performance, Barrierefreiheit, Best Practices und SEO für bis zu 10 Beispielseiten auf Mobilgeräten und Desktop – über PageSpeed Insights oder DataForSEO.",
      },
      {
        icon: "chart",
        title: "Health Score und Verlauf",
        body: "Ein Health Score von 0 bis 100 für die Website und jede einzelne Seite, mit einem Verlauf aller Läufe, damit Sie den Trend sehen.",
      },
      {
        icon: "refresh",
        title: "Läufe vergleichen",
        body: "Wählen Sie zwei Audits und sehen Sie die Zahl der Probleme vorher und nachher sowie Listen neuer und behobener Probleme mit den betroffenen Seiten.",
      },
      {
        icon: "layers",
        title: "Seitenstruktur",
        body: "Crawl-Tiefe, eingehende Links, verwaiste Seiten und Sackgassen für jede URL – gefunden über Links, die robots.txt und Ihre XML-Sitemaps.",
      },
      {
        icon: "bell",
        title: "Geplante Audits und Alerts",
        body: "Lassen Sie Audits wöchentlich oder monatlich laufen und erhalten Sie eine Benachrichtigung in der App und per E-Mail, wenn der Health Score sinkt.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Vom Crawl zur Fix-Liste",
    muted: "in drei Schritten.",
    items: [
      {
        title: "Audit starten",
        body: "Geben Sie eine Start-URL und die Zahl der zu crawlenden Seiten ein und entscheiden Sie, ob Lighthouse mitlaufen soll. Der Crawler beachtet die robots.txt und liest Ihre Sitemaps.",
      },
      {
        title: "Probleme nach Schwere prüfen",
        body: "Die Probleme sind in Fehler, Warnungen und Hinweise über 12 Kategorien gegliedert – jeweils mit Erklärung, Lösungsweg und den betroffenen Seiten.",
      },
      {
        title: "Beheben, neu prüfen, vergleichen",
        body: "Starten Sie das Audit nach einem Release erneut, vergleichen Sie es mit dem vorherigen Lauf und planen Sie wöchentliche oder monatliche Audits zur Überwachung.",
      },
    ],
  },
  faq: [
    {
      q: "Was ist ein SEO-Audit?",
      a: "Ein SEO-Audit crawlt Ihre Website wie eine Suchmaschine und markiert technische Probleme, die Rankings kosten können – etwa defekte Links, Weiterleitungsketten, doppelte Titles oder von der Indexierung ausgeschlossene Seiten. Der Crawler von AutoSEO führt 29 Prüfungen durch und bewertet jede Seite und die gesamte Website mit 0 bis 100 Punkten.",
    },
    {
      q: "Was prüft das Site Audit von AutoSEO?",
      a: "Es deckt 12 Kategorien ab: Crawl-Zugriff, HTTP-Status, Links, Titles und Meta Descriptions, Duplikate, Überschriften, Weiterleitungen, Canonicals, Inhalte, Seitenstruktur, Server-Antwortzeit und Indexierbarkeit. Zu jedem Problem gibt es eine Erklärung und einen Lösungsweg.",
    },
    {
      q: "Wie viele Seiten kann ich crawlen?",
      a: "Sie legen die Seitenzahl pro Audit fest, von 10 bis zum konfigurierten Limit Ihres AutoSEO – standardmäßig 2.000 Seiten. Beim Self-Hosting können Admins dieses Limit im Admin-Bereich anpassen.",
    },
    {
      q: "Enthält das Audit Lighthouse und Core Web Vitals?",
      a: "Ja, optional. AutoSEO führt Lighthouse für die Startseite und je eine Seite pro URL-Vorlage aus, bis zu 10 Seiten auf Mobilgeräten und Desktop, und speichert die Kategorie-Scores sowie Labormetriken wie LCP, TBT und CLS. Dafür nutzt es die kostenlose PageSpeed-Insights-API von Google oder DataForSEO.",
    },
    {
      q: "Kann ich regelmäßige SEO-Audits planen?",
      a: "Ja. Planen Sie Audits je Projekt wöchentlich oder monatlich. Sinkt der Health Score eines geplanten Laufs, benachrichtigt AutoSEO Sie in der App und per E-Mail.",
    },
    {
      q: "Kann ich zwei Audits vergleichen?",
      a: "Ja. Wählen Sie zwei beliebige Läufe und sehen Sie die Veränderung je Problemtyp sowie neue und behobene Probleme. So prüfen Sie am schnellsten, ob ein Release das behoben hat, was es sollte.",
    },
    {
      q: "Prüft das Audit auch den Zugriff von KI-Crawlern?",
      a: "Das Site Audit meldet Seiten, die der Crawler nicht lesen konnte, etwa wegen Bot-Schutz oder Rate Limits. Für die robots.txt-Regeln je KI-Bot und die llms.txt nutzen Sie den separaten KI-Crawlability-Check in AutoSEO.",
    },
    {
      q: "Ist das SEO-Audit-Tool kostenlos?",
      a: "Ja. Der Crawler ist Teil der Open-Source-App AutoSEO und beim Self-Hosting kostenlos, ohne Gebühren pro Seite. Lighthouse läuft über die kostenlose PageSpeed-Insights-API, DataForSEO ist optional. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat, KI- und Datennutzung im Wert von 10\u00a0$ inklusive.",
    },
  ],
  related: ["ai-crawlability", "rank-tracking", "ai-seo-tasks", "report-builder"],
  cta: {
    title: "Finden Sie heraus, was Ihre Website bremst",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
