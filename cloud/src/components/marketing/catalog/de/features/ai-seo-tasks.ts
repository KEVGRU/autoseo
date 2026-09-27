import type { FeaturePage } from "../../types";

export default {
  slug: "ai-seo-tasks",
  nav: "KI-SEO-Aufgaben",
  summary: "Belegbare GEO- und SEO-Aufgaben, priorisiert und an Jira, Linear oder Asana übergeben.",
  meta: {
    title: "KI-SEO-Aufgaben: priorisierter GEO-Maßnahmenplan",
    description:
      "KI-SEO-Aufgaben aus Visibility-, Zitat-, Wettbewerbs-, Crawl- und Search-Console-Daten – nach Wirkung und Aufwand priorisiert und an Jira oder Linear übergeben.",
  },
  hero: {
    eyebrow: "KI-SEO-Aufgaben",
    title: "Machen Sie aus KI-SEO-Daten Aufgaben,",
    muted: "die Ihr Team erledigen kann.",
    subtitle:
      "AutoSEO analysiert täglich Ihre Prompt-Visibility, Zitate, Wettbewerber, Sentiment, Crawl-Zugriff und Search-Console-Daten und macht aus den Befunden priorisierte Aufgaben – mit Belegen, Schritten und Abnahmekriterien. Übergeben Sie sie an Jira, Linear, Asana und fünf weitere Tools. Verschwindet das Signal, erledigt sich die Aufgabe von selbst.",
  },
  visual: "tasks",
  screenshot: {
    src: "/screenshots/tasks.png",
    alt: "AutoSEO-Aufgabenliste mit Priorität, Wirkung und Aufwand, Kategorie, Zuständigen und Status für AI-Visibility- und SEO-Aufgaben",
    url: "tasks",
  },
  stats: [
    { value: 8, label: "Signalquellen", note: "Von Visibility bis Search Console" },
    { value: 7, label: "Aufgabenkategorien", note: "Von Technik bis Reputation" },
    { value: 9, label: "Übergabeziele", note: "8 PM-Tools plus Webhooks" },
    { value: 0, prefix: "$", label: "Self-Hosting", note: "MIT-Lizenz, alle Funktionen" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "Dashboards beheben nichts.",
    muted: "Zugewiesene Aufgaben schon.",
    body: "Daten zur AI Visibility werfen mehr Fragen auf, als sie beantworten: An welchem Prompt arbeiten? Welche Seite schreiben? In welchem Forum präsent sein? Ohne klare nächste Schritte bleiben Erkenntnisse in Reports liegen, während Wettbewerber handeln.",
    points: [
      {
        title: "Zu viele Signale, zu wenig Zeit",
        body: "Visibility-Lücken, fehlende Zitate, Crawl-Fehler und Kritik konkurrieren um Aufmerksamkeit. Ein Prioritätswert aus Wirkung und Aufwand bringt sie in eine Reihenfolge.",
      },
      {
        title: "Jede Aufgabe braucht einen Grund",
        body: "Eine Aufgabe, die mit den auslösenden Prompts, Antworten und URLs belegt ist, lässt sich leichter freigeben – und nach der Umsetzung leichter prüfen.",
      },
      {
        title: "Gearbeitet wird im PM-Tool",
        body: "Entwickler arbeiten in Jira, Content-Teams in Asana oder Notion. Aufgaben sollten dort ankommen, wo die Verantwortlichen schon arbeiten.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was Sie bekommen",
    title: "Ein Maßnahmenplan, der sich selbst aktualisiert –",
    muted: "jeden Tag.",
    items: [
      {
        icon: "list-checks",
        title: "Sieben Aufgabenkategorien",
        body: "Technik, Content, Visibility, Wettbewerb, Offsite, Reputation und Setup – jeweils mit vorgeschlagenem Owner, vom Web-Team bis zur PR.",
      },
      {
        icon: "target",
        title: "Priorität aus Wirkung und Aufwand",
        body: "Jede Aufgabe erhält Werte für Wirkung und Aufwand von 1 bis 10, eine Priorität von 10 bis 100 und eine Stufe von P1 bis P4 – so stehen Quick Wins oben.",
      },
      {
        icon: "database",
        title: "Belege inklusive",
        body: "Die Prompts, Antworten, zitierten URLs, Audit-Ergebnisse oder Search-Console-Daten hinter jeder Aufgabe, dazu Schritte und Abnahmekriterien.",
      },
      {
        icon: "refresh",
        title: "Eine Liste, die sich selbst pflegt",
        body: "Täglich und nach jedem Tracking-Lauf neu analysiert. Aufgaben erledigen sich, wenn ihr Signal verschwindet, und öffnen sich wieder, wenn es zurückkehrt.",
      },
      {
        icon: "plug",
        title: "Übergabe an Ihr PM-Tool",
        body: "Linear, Jira Cloud, Asana, ClickUp, Trello, monday.com, Notion und awork mit Status-Rücksync – oder signierte Webhooks für Zapier, n8n und Make.",
      },
      {
        icon: "users",
        title: "Routing nach Kategorie",
        body: "Legen Sie je Kategorie eine Standardzuständigkeit und ein Zieltool fest – neue Aufgaben werden automatisch zugewiesen und übergeben.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Von den Daten zur erledigten Aufgabe",
    muted: "in drei Schritten.",
    items: [
      {
        title: "AutoSEO analysiert Ihre Daten",
        body: "Acht Signalquellen prüfen Visibility, Zitate, Wettbewerber, Reputation, Content-Abdeckung, technischen Zustand, Search Console und Ihr Tracking-Setup.",
      },
      {
        title: "Aufgaben werden formuliert und gerankt",
        body: "Steht ein KI-Anbieter zur Verfügung, formuliert die KI jede Aufgabe aus ihren Belegen; sonst kommen klare Vorlagen zum Einsatz. Duplikate werden automatisch zusammengeführt.",
      },
      {
        title: "Ihr Team arbeitet sie ab",
        body: "Weisen Sie Aufgaben zu, übergeben Sie sie an Jira oder Linear, erstellen Sie Content direkt aus dem Content-Plan einer Aufgabe oder exportieren Sie die Liste als CSV.",
      },
    ],
  },
  faq: [
    {
      q: "Wie erstellt AutoSEO SEO-Aufgaben?",
      a: "AutoSEO lässt acht Signalquellen über Ihre Projektdaten laufen: AI Visibility, Zitate, Wettbewerber, Reputation, Content-Abdeckung, technischer Zustand, Search Console und Tracking-Setup. Jeder Befund wird zu einer Aufgabe mit Belegen, Schritten und Abnahmekriterien. Die Analyse läuft täglich und zusätzlich nach jedem Tracking-Lauf.",
    },
    {
      q: "Welche Aufgaben entstehen dabei?",
      a: "Zum Beispiel: für einen Prompt erwähnt werden, bei dem Wettbewerber auftauchen; eine Seite veröffentlichen, die eine offene Frage beantwortet; direkte Vergleiche gewinnen; auf einer Website gelistet werden, die KI für Wettbewerber zitiert; wiederkehrende Kritik adressieren; falsche KI-Aussagen korrigieren; Seiten freigeben, die Crawler abweisen.",
    },
    {
      q: "Wie werden Aufgaben priorisiert?",
      a: "Jede Aufgabe hat einen Wert für Wirkung und einen für Aufwand von 1 bis 10. Die Priorität ist 10 × (0,65 × Wirkung + 0,35 × (11 − Aufwand)) – hohe Wirkung dominiert, bei Gleichstand gewinnt der geringere Aufwand. Ab 75 gilt P1, ab 60 P2, ab 45 P3, darunter P4.",
    },
    {
      q: "Kann ich Aufgaben an Jira oder Linear übergeben?",
      a: "Ja. Verbinden Sie Jira Cloud, Linear, Asana, ClickUp, Trello, monday.com, Notion oder awork per API-Token und wählen Sie Projekt, Team oder Liste. Der Status wird zurückgespielt: Eine im PM-Tool geschlossene Aufgabe ist auch in AutoSEO erledigt. Ein signierter Webhook sendet Ereignisse an Zapier, n8n, Make oder Ihren eigenen Endpunkt.",
    },
    {
      q: "Aktualisieren sich Aufgaben automatisch?",
      a: "Ja. Aufgaben werden per Fingerprint dedupliziert, ihre Belege bei jeder Analyse aktualisiert, und eine Aufgabe, deren Signal verschwunden ist, erledigt sich selbst. Kehrt das Problem zurück, öffnet sie sich wieder. Die automatische Erledigung lässt sich pro Projekt abschalten.",
    },
    {
      q: "Brauche ich für Aufgaben einen KI-Anbieter?",
      a: "Nein. Aufgaben werden ohne KI in Ihren Daten gefunden und aus Vorlagen formuliert. Ist KI verfügbar – über die Anbieter, die das Codext-Team in AutoSEO Cloud angebunden hat, Ihr eigenes Claude Code oder Codex per lokalem Agenten oder eigene API-Keys beim Self-Hosting –, schreibt sie Titel, Zusammenfassung und Schritte aus den Belegen.",
    },
    {
      q: "Sind die KI-SEO-Aufgaben kostenlos?",
      a: "Die Aufgaben sind Teil der Open-Source-App AutoSEO und beim Self-Hosting mit allen Funktionen kostenlos. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat mit bis zu 10 Projekten, KI- und Datennutzung im Wert von 10\u00a0$ inklusive. Gebühren pro Aufgabe oder pro Nutzer gibt es nicht.",
    },
  ],
  related: ["ai-content-optimization", "ai-crawlability", "ai-citation-tracking", "ai-competitor-analysis"],
  cta: {
    title: "Holen Sie sich einen priorisierten Maßnahmenplan für die KI-Suche",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
