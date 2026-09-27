import type { FeaturePage } from "../../types";

export default {
  slug: "ai-visibility-tracking",
  nav: "KI-Sichtbarkeit tracken",
  summary: "Messen Sie täglich, wie oft 16 KI-Engines Ihre Marke erwähnen und zitieren.",
  meta: {
    title: "KI-Sichtbarkeit tracken: ChatGPT, Gemini & Co.",
    description:
      "Tracken Sie Erwähnungen, Zitate und Position Ihrer Marke in ChatGPT, Perplexity, Gemini, Claude und AI Overviews. Open-Source-Tracker, kostenlos selbst hosten.",
  },
  hero: {
    eyebrow: "AI Visibility Tracker",
    title: "Ihre Marke in jeder KI-Antwort tracken.",
    muted: "KI-Sichtbarkeit über alle Engines, jeden Tag.",
    subtitle:
      "AutoSEO stellt die Fragen Ihrer Kunden an ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews und sechs weitere Engines – und zeigt, wie oft Sie erwähnt, zitiert und empfohlen werden, im Vergleich mit jedem Wettbewerber.",
  },
  visual: "answer",
  screenshot: {
    src: "/screenshots/ai-tracker.png",
    darkSrc: "/screenshots/ai-tracker-dark.png",
    alt: "AutoSEO-Tracker für AI Visibility mit Trenddiagramm und getrackten Prompts je KI-Engine",
    url: "ai/tracker",
  },
  stats: [
    { value: 16, label: "KI-Engines", note: "ChatGPT, Gemini, Claude und mehr" },
    { value: 143, label: "Märkte", note: "Land und Sprache je Prompt" },
    { value: 4, label: "Kernmetriken", note: "Visibility, Erwähnungen, Zitate, Position" },
    { value: 0, prefix: "$", label: "Self-Hosting", note: "MIT-Lizenz, alle Funktionen" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "Käufer fragen zuerst die KI.",
    muted: "Die Shortlist entsteht in der Antwort.",
    body: "Wer einen Assistenten fragt, welches Tool, welche Agentur oder welches Produkt passt, bekommt eine Antwort mit einer Handvoll Marken und ein paar verlinkten Quellen. Rank Tracker sehen diesen Moment nicht. AI Visibility Tracking schon.",
    points: [
      {
        title: "Antworten ersetzen Ergebnisseiten",
        body: "Eine Antwort steht für zehn blaue Links. Nennt das Modell Sie nicht, sind Sie nicht im Rennen – ganz gleich, wo Sie bei Google ranken.",
      },
      {
        title: "Jede Engine antwortet anders",
        body: "ChatGPT, Perplexity, Gemini und Claude nutzen unterschiedliche Indizes und Quellen. Ihre Sichtbarkeit kann in einer Engine stark sein und in einer anderen fehlen.",
      },
      {
        title: "Was gemessen wird, wird verbessert",
        body: "Tägliche Daten machen aus einem vagen Gefühl zur KI-Suche Trends, die Sie berichten, erklären und mit konkreten Aufgaben verbessern können.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was Sie tracken",
    title: "Alles, was KI-Engines über Sie sagen,",
    muted: "in einem Tracker.",
    items: [
      {
        icon: "radar",
        title: "Visibility und Mention Rate",
        body: "Der Anteil der Antworten, die Ihre Marke nennen – je Prompt, Engine, Markt und Zeitraum, mit Trends im Zeitverlauf.",
      },
      {
        icon: "link",
        title: "Citation Rate",
        body: "Wie oft Engines Ihre eigenen Seiten als Quelle verlinken – und welche URLs sie dafür auswählen.",
      },
      {
        icon: "trending-up",
        title: "Durchschnittliche Position",
        body: "Wo Ihre Marke in der Antwort steht, wenn mehrere Marken genannt werden. So sehen Sie, ob Sie die erste Empfehlung sind oder nur eine Randnotiz.",
      },
      {
        icon: "swords",
        title: "Share of Voice der Wettbewerber",
        body: "Jede Marke, die die Engines neben Ihrer nennen, sortiert nach Visibility, Erwähnungstiefe und Sentiment.",
      },
      {
        icon: "git-fork",
        title: "Prompt Flow und Fan-outs",
        body: "Welche Prompts zwischen zwei Zeiträumen Sichtbarkeit gewonnen oder verloren haben – und welche Suchanfragen die Engines im Hintergrund stellen.",
      },
      {
        icon: "map-pin",
        title: "Märkte und Standorte",
        body: "Führen Sie denselben Prompt in verschiedenen Ländern und Sprachen aus und vergleichen Sie die Ergebnisse auf einer Karte.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Vom Prompt zur Trendlinie",
    muted: "in drei Schritten.",
    items: [
      {
        title: "Fragen Ihrer Kunden hinterlegen",
        body: "Importieren Sie Prompts oder erstellen Sie sie mit der Prompt-Recherche nach Thema, Funnel-Stufe und Persona. Mit Tags gruppieren Sie sie.",
      },
      {
        title: "Engines, Märkte und Rhythmus wählen",
        body: "Wählen Sie aus den 16 Engines, legen Sie die Länder fest, in denen Sie verkaufen, und bestimmen Sie je Projekt einen täglichen, wöchentlichen oder monatlichen Rhythmus.",
      },
      {
        title: "Antworten lesen, Lücken schließen",
        body: "Jede Antwort wird gespeichert und bewertet. Öffnen Sie einzelne Antworten, vergleichen Sie Wettbewerber und machen Sie aus Lücken konkrete Aufgaben.",
      },
    ],
  },
  faq: [
    {
      q: "Was ist KI-Sichtbarkeit (AI Visibility)?",
      a: "KI-Sichtbarkeit beschreibt, wie oft und wie positiv KI-Assistenten Ihre Marke erwähnen, wenn Menschen relevante Fragen stellen. AutoSEO führt dafür feste Prompts nach Zeitplan aus, speichert jede Antwort und berechnet Visibility, Mention Rate, Citation Rate und durchschnittliche Position je Engine.",
    },
    {
      q: "Welche KI-Engines kann ich tracken?",
      a: "ChatGPT (Suche und App), Perplexity, Google AI Overviews, Google AI Mode, Gemini, Claude, Microsoft Copilot, Grok, Mistral, DeepSeek, Meta AI, Qwen, Kimi, Sabiá und Solar. Die Engines legen Sie pro Projekt fest.",
    },
    {
      q: "Worin unterscheidet sich KI-Sichtbarkeit von SEO-Rankings?",
      a: "Rankings zeigen, an welcher Stelle eine Seite in einer Liste von Links steht. KI-Sichtbarkeit zeigt, ob Ihre Marke in einer generierten Antwort genannt wird, wie sie beschrieben wird und welche Quellen das stützen. AutoSEO misst beides, sodass Sie sehen, wie klassisches SEO und KI-Antworten zusammenhängen.",
    },
    {
      q: "Wie oft werden die Prompts getrackt?",
      a: "Sie wählen je Projekt einen täglichen, wöchentlichen oder monatlichen Rhythmus. Jeder Lauf speichert die vollständigen Antworten, sodass Sie Zeiträume vergleichen und genau sehen, was sich verändert hat.",
    },
    {
      q: "Kann ich auch meine Wettbewerber tracken?",
      a: "Ja. AutoSEO erkennt jede Marke, die in den Antworten vorkommt, und stellt sie Ihrer gegenüber – nach Visibility, Erwähnungstiefe, Position und Sentiment. Zusätzlich können Sie Wettbewerber manuell anlegen.",
    },
    {
      q: "Brauche ich API-Keys für jede Engine?",
      a: "Nein. Je nach Engine kommen die Antworten von DataForSEO, über direkte API-Keys oder über Ihr eigenes Claude-Code- bzw. Codex-Abo mit einem lokalen Agenten. In AutoSEO Cloud laufen KI- und Datenfunktionen über die Anbieter, die das Codext-Team angebunden hat, und die Nutzung zählt auf die monatlich enthaltenen 10\u00a0$; beim Self-Hosting konfigurieren Sie nur, was Sie nutzen möchten.",
    },
    {
      q: "Ist der AI Visibility Tracker kostenlos?",
      a: "Der komplette Tracker ist Teil der Open-Source-App AutoSEO und beim Self-Hosting kostenlos; Drittanbieterdaten wie DataForSEO oder KI-API-Nutzung rechnen dann diese Anbieter ab. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat, KI- und Datennutzung im Wert von 10\u00a0$ inklusive.",
    },
  ],
  related: ["ai-competitor-analysis", "ai-citation-tracking", "prompt-research", "query-fanout-analysis"],
  cta: {
    title: "Sehen Sie, wo die KI Sie erwähnt – und wo nicht",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
