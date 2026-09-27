import type { FeaturePage } from "../../types";

export default {
  slug: "prompt-research",
  nav: "Prompt-Recherche",
  summary: "Finden Sie die Fragen, die Käufer KI-Assistenten stellen – und tracken Sie sie.",
  meta: {
    title: "Prompt-Recherche für ChatGPT & KI-Suche",
    description:
      "Prompt-Recherche für die KI-Suche: Prompts nach Thema, Funnel-Stufe und Persona, mit Suchvolumen von DataForSEO. Generieren, importieren und in ChatGPT tracken.",
  },
  hero: {
    eyebrow: "Prompt-Recherche",
    title: "Prompt-Recherche, die bei Ihren Käufern beginnt.",
    muted: "Damit Sie das Richtige tracken.",
    subtitle:
      "AutoSEO schreibt realistische Prompts auf Basis Ihres Markenprofils, Ihrer Personas und des Suchinteresses – gruppiert nach Thema, Funnel-Stufe und Persona, bewertet nach Suchnachfrage – und übernimmt die besten mit einem Klick in Ihren AI Visibility Tracker.",
  },
  visual: "prompts",
  stats: [
    { value: 3, label: "Funnel-Stufen", note: "Aufmerksamkeit, Abwägung, Entscheidung" },
    { value: 200, label: "Prompts pro Durchlauf", note: "Frei wählbar von 5 bis 200" },
    { value: 2000, label: "Prompts pro Liste", note: "Bis zu 50 Listen pro Projekt" },
    { value: 143, label: "Märkte", note: "Sprache und Land je Prompt-Set" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "Tracking ist nur so gut wie Ihre Prompts.",
    muted: "Raten verzerrt jede Kennzahl.",
    body: "In ChatGPT tippen Menschen selten Keywords. Sie stellen ganze Fragen – mit Kontext, Budget und Vergleichen. Passen Ihre getrackten Prompts nicht dazu, wie Käufer wirklich fragen, beschreiben Ihre Sichtbarkeitswerte einen Markt, den es so nicht gibt.",
    points: [
      {
        title: "Prompts sind keine Keywords",
        body: "Fragen im Dialog sind länger und konkreter als Suchanfragen. Eine reine Keyword-Liste verfehlt, wie Menschen Probleme beschreiben, Optionen vergleichen und Entscheidungen treffen.",
      },
      {
        title: "Jede Funnel-Stufe zählt",
        body: "Fragen in der Orientierungsphase entscheiden, welche Marken ein Käufer überhaupt kennenlernt. Fragen kurz vor dem Kauf küren den Gewinner. Sie brauchen beides, um zu sehen, wo Sie herausfallen.",
      },
      {
        title: "Nachfrage zeigt, was zuerst zählt",
        body: "Themen-Keywords mit echtem Suchvolumen zeigen, welche Fragen am wichtigsten sind. So fließt Ihr Tracking-Budget in Prompts, die tatsächlich gestellt werden.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was Sie bekommen",
    title: "Prompts recherchieren, bewerten und tracken",
    muted: "in einem Ablauf.",
    items: [
      {
        icon: "sparkles",
        title: "Prompt Set Helper",
        body: "Erstellen Sie pro Durchlauf 5 bis 200 Prompts für Ihre Themen, Personas, Funnel-Stufen, Prompt-Längen und Ihren Markt – mit festgelegtem Anteil an Marken-Prompts und optionalen Wettbewerbervergleichen.",
      },
      {
        icon: "brain",
        title: "Basiert auf Brand Knowledge",
        body: "Markenprofil, Interessen-Cluster aus der Suche, Sitemap-Bereiche und Käufer-Personas bestimmen Themen und Perspektiven. So klingen die Prompts nach Ihren Kunden, nicht nach Vorlage.",
      },
      {
        icon: "trending-up",
        title: "Suchnachfrage je Prompt",
        body: "Jeder Prompt erhält ein Themen-Keyword mit monatlichem Google-Suchvolumen und 12-Monats-Trend von DataForSEO. Ohne DataForSEO schätzt die KI die relative Nachfrage und kennzeichnet sie als Schätzung.",
      },
      {
        icon: "layers",
        title: "Gekennzeichnet und filterbar",
        body: "Jeder Prompt trägt Thema, Funnel-Stufe, Persona, Intent, eine Marken-Kennzeichnung und seine Länge. Sehen Sie ihn im Themenbaum oder in der flachen Liste und filtern Sie in Sekunden.",
      },
      {
        icon: "download",
        title: "Import und Export",
        body: "Laden Sie eine CSV-Datei hoch oder fügen Sie Prompts ein, ordnen Sie die Spalten zu und prüfen Sie die Vorschau vor dem Import. Jede gefilterte Liste lässt sich als CSV exportieren.",
      },
      {
        icon: "radar",
        title: "Mit einem Klick in den Tracker",
        body: "Übernehmen Sie ausgewählte Prompts mit ihrem Thema als Tag in den Tracker und sehen Sie, wie viel vom Tracking-Limit Ihres Projekts noch frei ist.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Von der Marke zum Prompt-Set",
    muted: "in drei Schritten.",
    items: [
      {
        title: "Marke einmal beschreiben",
        body: "Führen Sie die Brand-Knowledge-Analysen für Profil, Suchinteresse, Sitemap und Personas aus. Sobald sie fertig sind, kann AutoSEO eine erste Prompt-Liste für Sie erstellen.",
      },
      {
        title: "Prompts generieren oder importieren",
        body: "Wählen Sie im Prompt Set Helper Themen, Personas, Funnel-Stufen und den Anteil an Marken-Prompts – oder importieren Sie Ihre bestehende Liste. Suchvolumen werden automatisch ergänzt.",
      },
      {
        title: "Die wichtigen Prompts tracken",
        body: "Filtern Sie nach Nachfrage, Stufe oder Persona, testen Sie einzelne Prompts im Prompt Explorer und übernehmen Sie die besten in den Tracker.",
      },
    ],
  },
  faq: [
    {
      q: "Was ist Prompt-Recherche für die KI-Suche?",
      a: "Prompt-Recherche findet die Fragen, die Ihre Zielgruppe KI-Assistenten wie ChatGPT, Perplexity oder Gemini zu Ihrer Kategorie stellt. AutoSEO erstellt und kennzeichnet diese Prompts nach Thema, Funnel-Stufe und Persona, ergänzt die Suchnachfrage und trackt die besten in 16 KI-Engines.",
    },
    {
      q: "Wie finde ich die richtigen Prompts für meine Marke?",
      a: "Starten Sie mit den Brand-Knowledge-Analysen, damit AutoSEO Ihre Produkte, Ihre Zielgruppe und das Suchinteresse kennt. Öffnen Sie dann den Prompt Set Helper, wählen Sie Themen, Personas und Funnel-Stufen und generieren Sie ein ausgewogenes Set. Vorhandene Prompts importieren Sie per CSV.",
    },
    {
      q: "Wie wird das Suchvolumen für KI-Prompts ermittelt?",
      a: "Jeder Prompt erhält ein kurzes Themen-Keyword. Ist DataForSEO verbunden, ruft AutoSEO dessen monatliches Google-Suchvolumen und einen 12-Monats-Trend ab. Ohne DataForSEO schätzt die KI die relative Nachfrage auf einer Skala von 1 bis 10 und kennzeichnet den Wert als Schätzung.",
    },
    {
      q: "Was unterscheidet Marken-Prompts von generischen Prompts?",
      a: "Marken-Prompts nennen Ihre Marke, etwa in einem direkten Vergleich mit einem Wettbewerber. Generische Prompts beschreiben einen Bedarf, ohne jemanden zu nennen – und zeigen so, ob die KI Sie von sich aus empfiehlt. Im Prompt Set Helper legen Sie den Anteil an Marken-Prompts zwischen 0 und 100 Prozent fest; voreingestellt sind 20 Prozent.",
    },
    {
      q: "Welche KI erstellt die Prompts?",
      a: "Die Generierung läuft über Ihr eigenes Claude Code oder Codex CLI mit dem lokalen Agenten von AutoSEO oder über eine KI-API. In AutoSEO Cloud nutzt sie die KI-Anbieter, die das Codext-Team angebunden hat, und die Nutzung zählt auf die monatlich enthaltenen 10\u00a0$; beim Self-Hosting hinterlegen Sie eigene API-Keys. Auch ohne KI-Anbieter können Sie eigene Prompt-Listen importieren, filtern und tracken.",
    },
    {
      q: "Kann ich einen Prompt testen, bevor ich ihn tracke?",
      a: "Ja. Der Prompt Explorer führt einen einzelnen Prompt in ChatGPT, Claude, Gemini und Perplexity über DataForSEO aus – oder über Ihren lokalen Agenten bzw. eine API. Er zeigt jede Antwort mit Quellen, eventuellen Fan-out-Suchen und ob Ihre Marke genannt wird. Von dort aus starten Sie das Tracking direkt.",
    },
    {
      q: "Wie viele Prompts kann ich recherchieren?",
      a: "Eine Liste fasst bis zu 2.000 Prompts, ein Projekt bis zu 50 Listen. Wie viele Prompts Sie gleichzeitig tracken, hängt vom Tracking-Limit Ihres Projekts ab.",
    },
    {
      q: "Ist die Prompt-Recherche kostenlos?",
      a: "Die Prompt-Recherche ist Teil der Open-Source-App AutoSEO und beim Self-Hosting kostenlos; DataForSEO- und KI-API-Nutzung rechnen dann diese Anbieter ab. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat, KI- und Datennutzung im Wert von 10\u00a0$ inklusive.",
    },
  ],
  related: ["ai-visibility-tracking", "query-fanout-analysis", "keyword-research", "ai-competitor-analysis"],
  cta: {
    title: "Tracken Sie die Fragen, die Ihre Käufer wirklich stellen",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
