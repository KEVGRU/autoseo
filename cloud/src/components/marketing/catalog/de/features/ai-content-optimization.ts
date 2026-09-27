import type { FeaturePage } from "../../types";

export default {
  slug: "ai-content-optimization",
  nav: "Content für KI-Suche",
  summary: "Zitierfähigen Content recherchieren, schreiben, bewerten und im CMS veröffentlichen.",
  meta: {
    title: "Content für KI-Suche optimieren: AEO & GEO",
    description:
      "Content für die KI-Suche optimieren: Briefings mit Web-Recherche, Expertenentwürfe und ein AEO-Score aus sechs Säulen. Veröffentlichen in WordPress und Webflow.",
  },
  hero: {
    eyebrow: "Content-Optimierung für KI",
    title: "Optimieren Sie Content für KI-Antworten.",
    muted: "Vom Briefing bis zur veröffentlichten Seite.",
    subtitle:
      "AutoSEO recherchiert ein Thema im Web, erstellt ein Briefing, schreibt den Artikel aus Sicht eines Experten mit Quellen im Text, ergänzt FAQs, Entitäten und JSON-LD und bewertet das Ergebnis nach sechs Säulen der Answer Engine Optimization. Bestehende Seiten erhalten denselben Score und einen Rewrite. Ist ein Text fertig, veröffentlichen Sie ihn in WordPress, Webflow oder Framer.",
  },
  visual: "content",
  stats: [
    { value: 6, label: "AEO-Säulen", note: "Von Extrahierbarkeit bis Metadaten" },
    { value: 7, label: "Content-Formate", note: "Ratgeber, Vergleiche, FAQs …" },
    { value: 3, label: "CMS-Ziele", note: "WordPress, Webflow, Framer" },
    { value: 0, prefix: "$", label: "Self-Hosting", note: "MIT-Lizenz, alle Funktionen" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "KI-Engines zitieren Passagen,",
    muted: "keine ganzen Seiten.",
    body: "Eine Antwortmaschine übernimmt einen Satz, eine Zahl oder eine Liste aus einer Seite und nennt die Quelle. Content, der die Antwort versteckt, vage bleibt oder keine klare Struktur hat, wird übergangen – selbst wenn er gut rankt.",
    points: [
      {
        title: "Direkte Antworten werden übernommen",
        body: "In sich geschlossene Antworten unter Überschriften in Frageform kann ein Modell leicht herauslösen und Ihnen zuordnen.",
      },
      {
        title: "Fakten schlagen Füllwörter",
        body: "Konkrete Zahlen, benannte Entitäten und belegte Quellen machen eine Passage zitierwürdig. Vage Texte geben einer Engine nichts zum Zitieren.",
      },
      {
        title: "Struktur und Schema helfen Maschinen",
        body: "Klare Überschriften, Listen, Tabellen und valides JSON-LD zeigen Crawlern, worum es auf einer Seite geht und welcher Abschnitt welche Frage beantwortet.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was Sie bekommen",
    title: "Vom Thema zur veröffentlichten Seite –",
    muted: "in einem Editor.",
    items: [
      {
        icon: "search",
        title: "Briefings mit Web-Recherche",
        body: "Zielgruppe, Suchintention, Blickwinkel, Kernaussagen, eine Gliederung in Frageform, Entitäten und aktuelle Quellen aus der Websuche.",
      },
      {
        icon: "pen",
        title: "Entwürfe aus Expertensicht",
        body: "Antwortartikel, Ratgeber, Vergleiche, Bestenlisten, Anleitungen, FAQ- und Produktseiten mit 500 bis 3.500 Wörtern – aus Sicht einer Experten-Persona oder in Ihrer Markenstimme.",
      },
      {
        icon: "gauge",
        title: "Live-AEO-Score",
        body: "Extrahierbarkeit, Faktendichte, Struktur, Schema-Markup, Tiefe und Metadaten – bewertet von 0 bis 100, während Sie schreiben.",
      },
      {
        icon: "code",
        title: "FAQs, Entitäten und JSON-LD",
        body: "FAQs erzeugen, Entitäten extrahieren, Meta-Titel und -Beschreibungen schreiben und Article-, BlogPosting- oder HowTo-Schema samt FAQs erstellen.",
      },
      {
        icon: "refresh",
        title: "Bestehende Seiten optimieren",
        body: "URL eingeben: AutoSEO ruft die Seite ab, bewertet sie nach denselben sechs Säulen und schlägt einen Rewrite vor oder schreibt ihn gleich.",
      },
      {
        icon: "download",
        title: "Veröffentlichen oder exportieren",
        body: "Als Entwurf speichern oder in WordPress veröffentlichen, inklusive JSON-LD und Yoast- oder Rank-Math-Metadaten, CMS-Einträge in Webflow und Framer anlegen oder Markdown, HTML und CSV exportieren.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Von der Frage zur zitierfähigen Seite",
    muted: "in vier Schritten.",
    items: [
      {
        title: "Frage auswählen",
        body: "Starten Sie mit einer Content-Aufgabe oder einem eigenen Thema. Wählen Sie Format, Sprache, Länge und eine Experten-Persona.",
      },
      {
        title: "Recherchieren und schreiben",
        body: "Die KI sucht Quellen, erstellt das Briefing und schreibt den Entwurf – auf Basis von Markenprofil, Produkten und Personas aus Ihrem Brand Knowledge.",
      },
      {
        title: "Bewerten und verfeinern",
        body: "Bearbeiten Sie den Text in Markdown mit Live-AEO-Score, erzeugen Sie FAQs und Metadaten und geben Sie ihn vom Entwurf in die Prüfung.",
      },
      {
        title: "Veröffentlichen und messen",
        body: "Senden Sie ihn an WordPress oder Webflow oder exportieren Sie ihn – und verfolgen Sie im AI Visibility Tracking, ob die Engines die Seite zitieren.",
      },
    ],
  },
  faq: [
    {
      q: "Was bedeutet Content-Optimierung für die KI-Suche?",
      a: "Gemeint ist, Seiten so zu schreiben und zu strukturieren, dass KI-Antwortmaschinen sie verstehen, zitieren und als Quelle nennen können. Dazu gehören direkte Antworten, konkrete Fakten mit Quellen, eine klare Überschriftenstruktur, strukturierte Daten und passende Metadaten. AutoSEO misst diese Eigenschaften mit einem AEO-Score und hilft Ihnen, sie zu verbessern.",
    },
    {
      q: "Was ist ein AEO-Score?",
      a: "Der AEO-Score (Answer Engine Optimization) bewertet Content von 0 bis 100 nach sechs Säulen: Extrahierbarkeit 20, Faktendichte 20, Struktur 15, Schema-Markup 15, Tiefe 15 und Metadaten 15. Ab 87 Punkten gilt ein Text als „Primary Source“, von 70 bis 86 als „Strong“, von 50 bis 69 als „Needs work“, darunter als „Weak“.",
    },
    {
      q: "Wie vermeidet AutoSEO erfundene Quellen?",
      a: "Der Briefing-Schritt nutzt die Websuche und behält nur echte URLs, die er gefunden hat. Der Entwurf darf ausschließlich diese Quellen zitieren, als Link direkt nach dem Fakt, den sie belegen. Jeden Entwurf prüfen Sie vor der Veröffentlichung selbst.",
    },
    {
      q: "Kann ich bestehende Seiten optimieren?",
      a: "Ja. Geben Sie die URL ein, optional mit Ziel-Keyword und der Frage, die die Seite beantworten soll. AutoSEO ruft die Seite ab, bewertet sie nach den sechs AEO-Säulen und schlägt einen Rewrite vor oder schreibt ihn, den Sie bearbeiten und veröffentlichen.",
    },
    {
      q: "In welchen CMS kann ich veröffentlichen?",
      a: "In WordPress über die REST API mit einem Anwendungspasswort, inklusive JSON-LD und Yoast- oder Rank-Math-Metadaten, in Webflow-CMS-Collections per API-Token und in Framer-CMS-Collections über die Framer Server API mit einem Projekt-API-Key. Alle drei sind in der Beta. Jeder Entwurf lässt sich außerdem als Markdown, HTML oder CMS-fertige CSV exportieren.",
    },
    {
      q: "Brauche ich ein KI-Abo?",
      a: "Nicht unbedingt. In AutoSEO Cloud laufen Entwürfe über die KI-Anbieter, die das Codext-Team angebunden hat – die Nutzung zählt auf die monatlich enthaltenen 10\u00a0$ –, oder über Ihr eigenes Claude Code oder Codex per lokalem Agenten. Beim Self-Hosting verbinden Sie einen lokalen Agenten oder hinterlegen eigene API-Keys. Auch ohne KI schreiben Sie im Editor mit Live-AEO-Score.",
    },
    {
      q: "Ist die Content-Optimierung kostenlos?",
      a: "Die Content-Optimierung ist Teil der Open-Source-App AutoSEO und beim Self-Hosting mit allen Funktionen kostenlos; die Nutzung von KI-APIs rechnet dann Ihr Anbieter ab. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat, KI- und Datennutzung im Wert von 10\u00a0$ inklusive.",
    },
  ],
  related: ["ai-seo-tasks", "prompt-research", "ai-citation-tracking", "query-fanout-analysis"],
  cta: {
    title: "Schreiben Sie die Seite, die KI-Engines zitieren wollen",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
