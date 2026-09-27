import type { FeaturePage } from "../../types";

export default {
  slug: "keyword-research",
  nav: "Keyword-Recherche",
  summary: "Suchvolumen, Difficulty und Suchintention für jedes Keyword in 143 Märkten.",
  meta: {
    title: "Keyword-Recherche-Tool: Suchvolumen, KD & Intent",
    description:
      "Keyword-Recherche mit Suchvolumen, CPC, Keyword Difficulty und Suchintention in 143 Märkten. Listen mit Tags speichern, Export als CSV oder nach Google Sheets.",
  },
  hero: {
    eyebrow: "Keyword-Recherche-Tool",
    title: "Keyword-Recherche in 143 Märkten,",
    muted: "direkt neben Ihren AI-Visibility-Daten.",
    subtitle:
      "Geben Sie ein Seed-Keyword ein, und AutoSEO liefert verwandte Keywords, Vorschläge und Ideen von DataForSEO – mit Suchvolumen, CPC, Wettbewerb, Keyword Difficulty, Suchintention und 12-Monats-Trend. Speichern Sie die besten in Listen mit Tags, prüfen Sie die SERP und exportieren Sie als CSV oder nach Google Sheets.",
  },
  visual: "keywords",
  screenshot: {
    src: "/screenshots/keywords.png",
    alt: "AutoSEO-Keyword-Liste mit Suchvolumen, CPC, Wettbewerb, Keyword Difficulty und Suchintention je Keyword",
    url: "seo/keywords",
  },
  stats: [
    { value: 143, label: "Märkte", note: "Land und Sprache je Suche" },
    { value: 500, label: "Keywords pro Suche", note: "150, 300 oder 500 Ergebnisse" },
    { value: 3, label: "Keyword-Quellen", note: "Verwandte Keywords, Vorschläge, Ideen" },
    { value: 0, prefix: "$", label: "Self-Hosting", note: "MIT-Lizenz, alle Funktionen" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "Keywords zeigen die Nachfrage.",
    muted: "KI-Antworten beginnen bei denselben Fragen.",
    body: "Das Suchvolumen zeigt, wonach Menschen suchen, die Keyword Difficulty, was es zum Ranken braucht, und die Suchintention, was sie als Nächstes vorhaben. Klassische Suche und KI-Assistenten beantworten dieselben Fragen – Keyword-Daten bleiben deshalb die klarste Landkarte dessen, was Ihre Zielgruppe wissen will.",
    points: [
      {
        title: "Volumen ohne Intention ist Rauschen",
        body: "Ein Keyword mit hohem Suchvolumen bringt nichts, wenn Suchende etwas anderes wollen, als Sie anbieten. Die Suchintention hilft, die passenden Begriffe herauszufiltern.",
      },
      {
        title: "Die Difficulty bestimmt den Zeitplan",
        body: "Keyword Difficulty und Wettbewerb zeigen, welche Begriffe Sie bald gewinnen können und welche stärkere Seiten, Links und Zeit brauchen.",
      },
      {
        title: "Recherche lohnt sich nur, wenn sie bleibt",
        body: "Gespeicherte Listen mit Tags machen aus einzelnen Suchen einen Keyword-Plan, den Ihr Team aktualisieren, filtern und für Content nutzen kann.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was Sie bekommen",
    title: "Alles für die Keyword-Auswahl,",
    muted: "an einem Ort.",
    items: [
      {
        icon: "search",
        title: "Verwandte Keywords, Vorschläge und Ideen",
        body: "Drei DataForSEO-Quellen – oder der Auto-Modus, der sie nacheinander abfragt, bis genug echte Alternativen zu Ihrem Seed-Keyword gefunden sind.",
      },
      {
        icon: "chart",
        title: "Suchvolumen, CPC, Difficulty und Intention",
        body: "Zu jedem Keyword: Suchvolumen, CPC, Wettbewerb, ein Schwierigkeitswert von 0 bis 100 und die Suchintention, dazu der Suchtrend der letzten 12 Monate.",
      },
      {
        icon: "eye",
        title: "SERP-Analyse",
        body: "Öffnen Sie die Google-Ergebnisse zu jedem Keyword – Top 20 oder Top 100 – und sehen Sie, welche Domains ranken und welche Seitentypen gewinnen.",
      },
      {
        icon: "list-checks",
        title: "Filter, die die Liste eindampfen",
        body: "Schließen Sie Begriffe ein oder aus und setzen Sie Bereiche für Suchvolumen, CPC und Difficulty – bis nur noch passende Keywords übrig sind.",
      },
      {
        icon: "layers",
        title: "Gespeicherte Listen mit Tags",
        body: "Speichern Sie Keywords im Projekt, ordnen Sie sie mit farbigen Tags, filtern Sie nach Tag und aktualisieren Sie die Kennzahlen, wann immer Sie aktuelle Zahlen brauchen.",
      },
      {
        icon: "download",
        title: "Export als CSV und nach Google Sheets",
        body: "Übertragen Sie Ergebnisse oder gespeicherte Listen direkt in ein neues Google Sheet in Ihrem verknüpften Konto oder laden Sie sie als CSV herunter.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Vom Seed-Keyword zum Keyword-Plan",
    muted: "in drei Schritten.",
    items: [
      {
        title: "Seed-Keyword eingeben",
        body: "Wählen Sie Markt und Sprache, die Anzahl der Ergebnisse und die Keyword-Quelle. AutoSEO zeigt die geschätzten Kosten, bevor Sie suchen.",
      },
      {
        title: "Filtern, sortieren, SERP prüfen",
        body: "Sortieren Sie nach Suchvolumen oder Difficulty, grenzen Sie die Liste mit Begriffs- und Bereichsfiltern ein und öffnen Sie die Suchergebnisse zu jedem Keyword.",
      },
      {
        title: "Speichern, taggen, exportieren",
        body: "Legen Sie die Keywords, auf die Sie zielen, in Listen mit Tags ab, aktualisieren Sie ihre Kennzahlen später und exportieren Sie sie als CSV oder nach Google Sheets.",
      },
    ],
  },
  faq: [
    {
      q: "Was ist ein Keyword-Recherche-Tool?",
      a: "Ein Keyword-Recherche-Tool zeigt, wie oft nach einem Begriff gesucht wird, wie schwer es ist, dafür zu ranken, und was Suchende wollen. AutoSEO liefert zu jedem Seed-Keyword verwandte Keywords, Vorschläge und Ideen – mit Suchvolumen, CPC, Difficulty und Suchintention in 143 Märkten.",
    },
    {
      q: "Woher stammen die Keyword-Daten?",
      a: "Die Daten stammen von DataForSEO Labs, ergänzt um Google-Ads-Keyworddaten für Märkte, die Labs nicht abdeckt. In AutoSEO Cloud laufen Datenfunktionen über die Anbieter, die das Codext-Team angebunden hat, und die Nutzung zählt auf die monatlich enthaltenen 10\u00a0$; beim Self-Hosting verbinden Sie Ihr eigenes DataForSEO-Konto. Ergebnisse werden 24 Stunden zwischengespeichert, eine wiederholte Suche kostet also nicht erneut.",
    },
    {
      q: "Wie wird die Keyword Difficulty berechnet?",
      a: "Die Keyword Difficulty ist der organische Schwierigkeitswert von DataForSEO auf einer Skala von 0 bis 100 – je höher, desto schwerer erreichen Sie die Top 10 bei Google. Der Wettbewerb ist ein separater Wert von 0 bis 1 und zeigt, wie viele Werbetreibende in Google Ads auf das Keyword bieten.",
    },
    {
      q: "Kann ich Keywords nach Google Sheets exportieren?",
      a: "Ja. Mit verknüpftem Google-Konto legt AutoSEO über die Google Sheets API eine neue Tabelle an. Ohne Verknüpfung kopiert AutoSEO die Tabelle in die Zwischenablage und öffnet ein leeres Sheet zum Einfügen. Der CSV-Export ist immer verfügbar.",
    },
    {
      q: "Kann ich Keywords speichern und organisieren?",
      a: "Ja. Speichern Sie Keywords aus jeder Suche in Ihrem Projekt, gruppieren Sie sie mit farbigen Tags und filtern Sie die Liste nach Tag. Die Kennzahlen gespeicherter Keywords lassen sich jederzeit aktualisieren, damit Suchvolumen und Difficulty aktuell bleiben.",
    },
    {
      q: "Funktioniert die Keyword-Recherche für Deutschland, Österreich und die Schweiz?",
      a: "Ja. Sie wählen Land und Sprache je Suche aus 143 Märkten, darunter Deutschland, Österreich und die Schweiz. Suchvolumen und Difficulty gelten jeweils für diesen Markt – so vergleichen Sie die Nachfrage in allen Ländern, in denen Sie verkaufen.",
    },
    {
      q: "Können KI-Agenten in AutoSEO Keywords recherchieren?",
      a: "Ja. Der Agent-Modus und der MCP-Server enthalten Tools, um Keywords zu recherchieren, SERPs zu prüfen und Keywords mit Tags zu speichern. Die Agent Skills keyword-research und keyword-clustering führen Claude Code, Codex oder Cursor durch den gesamten Ablauf.",
    },
    {
      q: "Ist das Keyword-Recherche-Tool kostenlos?",
      a: "Das Keyword-Recherche-Tool ist Teil der Open-Source-App AutoSEO und beim Self-Hosting kostenlos; die Keyword-Daten rechnet dann DataForSEO pro Anfrage ab, und AutoSEO zeigt vor jeder Suche die geschätzten Kosten. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat, KI- und Datennutzung im Wert von 10\u00a0$ inklusive.",
    },
  ],
  related: ["rank-tracking", "site-audit", "prompt-research", "ai-seo-agent"],
  cta: {
    title: "Finden Sie die Keywords, für die sich Content lohnt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
