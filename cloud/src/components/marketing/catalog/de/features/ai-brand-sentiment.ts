import type { FeaturePage } from "../../types";

export default {
  slug: "ai-brand-sentiment",
  nav: "KI-Sentiment-Analyse",
  summary: "Was KI-Engines an Ihrer Marke loben und kritisieren – und wen sie empfehlen.",
  meta: {
    title: "KI-Sentiment-Analyse: Was ChatGPT über Sie sagt",
    description:
      "KI-Sentiment-Analyse für Ihre Marke: Was loben und kritisieren ChatGPT, Perplexity und Gemini an Ihnen? Mit wörtlichen Zitaten und Vergleich mit Wettbewerbern.",
  },
  hero: {
    eyebrow: "KI-Sentiment-Analyse",
    title: "KI-Sentiment-Analyse, Zitat für Zitat.",
    muted: "So beschreibt die KI Ihre Marke.",
    subtitle:
      "AutoSEO liest jede getrackte Antwort und extrahiert, was KI-Engines an Ihnen und Ihren Wettbewerbern loben und kritisieren – mit Sentiment-Score von 0 bis 100, Themen, wörtlichen Zitaten und den Marken, die sie stattdessen empfehlen.",
  },
  visual: "sentiment",
  screenshot: {
    src: "/screenshots/sentiment.png",
    alt: "AutoSEO-Sentimentübersicht mit Sentiment-Score, Lob und Kritik im Zeitverlauf sowie den meistgelobten und meistkritisierten Eigenschaften",
    url: "ai/sentiment",
  },
  stats: [
    { value: 100, prefix: "0–", label: "Sentiment-Score", note: "Ab 80 stark positiv" },
    { value: 3, label: "Aussagetypen", note: "Lob, neutral, Kritik" },
    { value: 5, label: "Sentiment-Ansichten", note: "Von Übersicht bis Empfehlungen" },
    { value: 16, label: "KI-Engines", note: "Filter nach Engine und Tag" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "Erwähnt zu werden reicht nicht.",
    muted: "Wie die KI Sie beschreibt, prägt die Entscheidung.",
    body: "Eine Antwort kann Ihre Marke nennen und Käufer trotzdem abschrecken: zu teuer, aufwendig einzurichten, schwacher Support. Solche Urteile wiederholen sich in jedem Gespräch mit derselben Frage. Die Sentiment-Analyse macht sie sichtbar – mit dem genauen Wortlaut.",
    points: [
      {
        title: "Die KI wiederholt, was sie liest",
        body: "Engines fassen Testberichte, Foren und Vergleichsartikel zusammen. Alte Beschwerden und veraltete Fakten tauchen so lange auf, bis sich die Quellen dahinter ändern.",
      },
      {
        title: "Empfehlungen schlagen Erwähnungen",
        body: "Viele Antworten nennen mehrere Marken, empfehlen aber nur eine. Zu wissen, wann die KI Sie nennt und dann jemand anderen wählt, zeigt die eigentliche Lücke.",
      },
      {
        title: "Themen zeigen, was zu tun ist",
        body: "Nach Aspekten wie Preis, Support oder Bedienbarkeit gruppiert, werden aus verstreuten Zitaten klar benannte Wahrnehmungsprobleme.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was Sie sehen",
    title: "Jedes Urteil der KI über Sie,",
    muted: "mit dem Zitat dahinter.",
    items: [
      {
        icon: "heart",
        title: "Sentiment-Score",
        body: "Ein Score von 0 bis 100 je Marke, basierend darauf, wie jede Antwort sie darstellt – mit dem Anteil lobender, neutraler und kritischer Aussagen und dem Verlauf über die Zeit.",
      },
      {
        icon: "message-square",
        title: "Lob und Kritik",
        body: "Jede Aussage der KI über eine Marke, gruppiert nach Thema und Eigenschaft, mit wörtlichem Zitat und Link zur vollständigen Antwort.",
      },
      {
        icon: "layers",
        title: "Wahrnehmung nach Themen",
        body: "Das Profil einer Marke über Themen wie Preis, Qualität oder Service – und welche Marke bei welcher Eigenschaft vorne liegt.",
      },
      {
        icon: "swords",
        title: "Vergleich mit einem Wettbewerber",
        body: "Stellen Sie in jedem Diagramm einen getrackten Wettbewerber neben Ihre Marke und sehen Sie, wo die KI ihn besser – oder schlechter – beschreibt.",
      },
      {
        icon: "check-circle",
        title: "Empfehlungen",
        body: "Welche Marke die KI für welche Situation wählt, etwa „am besten für Einsteiger“ oder „beste günstige Option“ – und die Antworten, die Sie nennen, aber jemand anderen empfehlen.",
      },
      {
        icon: "list-checks",
        title: "Aufgaben zur Reputation",
        body: "Wiederkehrende Kritik wird zu priorisierten Aufgaben – mit Zitaten, Engines und Prompts als Beleg.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Von der Antwort zur Wahrnehmung",
    muted: "in drei Schritten.",
    items: [
      {
        title: "Prompts in allen Engines tracken",
        body: "Ihre Prompts laufen täglich, wöchentlich oder monatlich, und jede Antwort wird gespeichert.",
      },
      {
        title: "Jede Antwort wird analysiert",
        body: "Ein KI-Durchlauf über Ihren lokalen Claude-Code- oder Codex-Agenten oder einen konfigurierten KI-Anbieter extrahiert Sentiment, Aussagen, Empfehlungen und Vergleiche – allein aus dem Antworttext.",
      },
      {
        title: "Quellen verbessern, dann messen",
        body: "Lesen Sie die Zitate, finden Sie die Seiten dahinter und verfolgen Sie den Score, um zu sehen, ob Ihre Änderungen wirken.",
      },
    ],
  },
  faq: [
    {
      q: "Was ist Marken-Sentiment in der KI-Suche?",
      a: "Marken-Sentiment beschreibt, wie positiv oder negativ KI-Assistenten Ihre Marke in ihren Antworten darstellen. AutoSEO bewertet es je Marke von 0 bis 100 und schlüsselt es in lobende, neutrale und kritische Aussagen mit den genauen Zitaten auf.",
    },
    {
      q: "Wie finde ich heraus, was ChatGPT über meine Marke sagt?",
      a: "Tracken Sie die Fragen Ihrer Kunden mit aktiviertem ChatGPT. AutoSEO speichert jede Antwort und extrahiert jede Aussage über Ihre Marke. So lesen Sie, was ChatGPT lobt und kritisiert – und wie sich das über die Zeit verändert.",
    },
    {
      q: "Wie wird der Sentiment-Score berechnet?",
      a: "Jede Antwort wird darauf analysiert, wie sie jede getrackte Marke darstellt – von 0 (sehr negativ) bis 100 (sehr positiv) –, und die Werte werden über den Zeitraum gemittelt. Ab 80 gilt ein Score als stark positiv, 60–79 als positiv, 40–59 als neutral und unter 40 als kritisch.",
    },
    {
      q: "Kann ich das Sentiment mit meinen Wettbewerbern vergleichen?",
      a: "Ja. Wählen Sie einen getrackten Wettbewerber, um Scores, Lob und Kritik, die Wahrnehmung nach Themen und die Führung je Eigenschaft zu vergleichen. Head-to-Head-Aussagen zeigen, welche Marke die KI bevorzugt, wenn sie beide direkt vergleicht.",
    },
    {
      q: "Warum nennt die KI meine Marke, empfiehlt aber einen Wettbewerber?",
      a: "Antworten listen oft mehrere Optionen auf und wählen dann eine für einen bestimmten Bedarf. Die Ansicht „Recommendations“ zeigt die Antworten, die Sie nennen, aber eine andere Marke empfehlen – und welche Marke die KI für welche Situation wählt. Jede davon öffnen Sie mit vollständiger Antwort und Quellen.",
    },
    {
      q: "Welche KI-Engines fließen in die Sentiment-Analyse ein?",
      a: "Alle Engines, die Sie tracken: ChatGPT (Suche und App), Perplexity, Google AI Overviews, Google AI Mode, Gemini, Claude, Microsoft Copilot, Grok, Mistral, DeepSeek, Meta AI, Qwen, Kimi, Sabiá und Solar. Jede Sentiment-Ansicht lässt sich nach Engine, Prompt-Tag und Zeitraum filtern.",
    },
    {
      q: "Ist die KI-Sentiment-Analyse kostenlos?",
      a: "Die Sentiment-Analyse ist Teil der Open-Source-App AutoSEO und beim Self-Hosting kostenlos – mit eigenen API-Keys oder einem lokalen Claude-Code- bzw. Codex-Agenten. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat, KI- und Datennutzung im Wert von 10\u00a0$ inklusive; auch dort können Sie Ihr eigenes Claude Code oder Codex verbinden.",
    },
  ],
  related: ["ai-competitor-analysis", "ai-fact-check", "ai-visibility-tracking", "report-builder"],
  cta: {
    title: "Lesen Sie, was die KI Käufern über Ihre Marke erzählt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
