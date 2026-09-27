import type { FeaturePage } from "../../types";

export default {
  slug: "query-fanout-analysis",
  nav: "Query-Fan-out-Analyse",
  summary: "Die Suchen, die KI-Engines im Hintergrund stellen – als Content-Plan aufbereitet.",
  meta: {
    title: "Query-Fan-out-Analyse für ChatGPT & KI-Suche",
    description:
      "Query-Fan-out-Analyse: Sehen Sie die versteckten Suchanfragen, die ChatGPT, Gemini, Claude und Perplexity zu Ihren Prompts stellen – und welche Inhalte fehlen.",
  },
  hero: {
    eyebrow: "Query-Fan-out-Analyse",
    title: "Query-Fan-out-Analyse für die KI-Suche.",
    muted: "Sehen Sie, wonach die KI sucht, bevor sie antwortet.",
    subtitle:
      "Bevor eine Engine antwortet, stellt sie oft selbst mehrere Websuchen. AutoSEO erfasst diese Fan-out-Anfragen für jeden getrackten Prompt, zählt sie über alle Engines hinweg und macht daraus Content-Pläne für die Seiten, die Ihnen fehlen.",
  },
  visual: "fanout",
  stats: [
    { value: 7, label: "Engines mit Fan-out-Daten", note: "Sofern der Anbieter sie liefert" },
    { value: 8, label: "Fan-outs pro Content-Plan", note: "Häufigste Fragen zuerst" },
    { value: 100, suffix: "+", label: "MCP-Tools", note: "Inklusive get_query_fanouts" },
    { value: 0, prefix: "$", label: "Self-Hosting", note: "MIT-Lizenz, alle Funktionen" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "Ein Prompt, viele Suchen.",
    muted: "Jede ist eine Chance, gefunden zu werden.",
    body: "Eine Frage wie „bestes CRM für eine kleine Agentur“ führt selten zu nur einer Suche. Die Engine zerlegt sie in Teilanfragen zu Preisen, Integrationen oder Alternativen, liest die Ergebnisse und baut daraus ihre Antwort. Fan-outs zeigen Ihnen diese Teilanfragen.",
    points: [
      {
        title: "Fan-outs zeigen die echten Themen",
        body: "Sie verraten, welche Fakten eine Engine nachschlägt, um Ihren Prompt zu beantworten – oft konkreter als alles, was ein Keyword-Tool vorschlägt.",
      },
      {
        title: "Passende Seiten werden gelesen",
        body: "Beantworten Ihre Inhalte die Teilanfragen direkt, kann die Engine sie bei ihrer Suche finden – und hat einen Grund, sie zu zitieren.",
      },
      {
        title: "Muster schlagen Einzelfälle",
        body: "Taucht derselbe Fan-out in vielen Prompts und Engines auf, ist das ein starkes Signal für eine Seite, einen Abschnitt oder eine FAQ, die sich lohnt.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was Sie bekommen",
    title: "Jede versteckte Suche,",
    muted: "gezählt und zugeordnet.",
    items: [
      {
        icon: "git-fork",
        title: "Alle Fan-out-Anfragen",
        body: "Jede Teilanfrage, die Engines zu Ihren getrackten Prompts gestellt haben – dedupliziert und nach Häufigkeit sortiert.",
      },
      {
        icon: "bot",
        title: "Engines und Prompts",
        body: "Für jeden Fan-out: die Engines, die ihn gestellt haben, und die Prompts, aus denen er stammt – mit erstem und letztem Auftreten.",
      },
      {
        icon: "download",
        title: "Suche und Export",
        body: "Durchsuchen Sie Fan-outs nach Text, wählen Sie einen Zeitraum und laden Sie sie als CSV für die Keyword- und Content-Planung herunter.",
      },
      {
        icon: "file-text",
        title: "Content-Pläne",
        body: "Aufgaben zu Content-Lücken listen die wichtigsten Fan-out-Fragen für Prompts, bei denen Engines andere Seiten zitieren, aber keine von Ihnen – mit Gliederungsvorschlag.",
      },
      {
        icon: "sparkles",
        title: "Prompt Explorer",
        body: "Führen Sie einen neuen Prompt in ChatGPT, Claude, Gemini oder Perplexity aus und sehen Sie die Fan-out-Suchen neben der Antwort und ihren Quellen.",
      },
      {
        icon: "presentation",
        title: "Reports und API",
        body: "Fügen Sie Kunden-Reports einen Baustein „What AI searched for“ hinzu oder rufen Sie Fan-outs über die REST API und den MCP-Server ab.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Vom Prompt zum Content-Plan",
    muted: "in drei Schritten.",
    items: [
      {
        title: "Prompts in Engines mit Fan-outs tracken",
        body: "Nutzen Sie Engines, die ihre Suchen offenlegen – etwa ChatGPT, Gemini, Claude und Perplexity – über DataForSEO oder die API der jeweiligen Engine.",
      },
      {
        title: "AutoSEO sammelt die Teilanfragen",
        body: "Die Fan-out-Anfragen jeder Antwort werden mit Prompt, Engine und Datum gespeichert und über alle Antworten hinweg gruppiert.",
      },
      {
        title: "Seiten schreiben, nach denen Engines suchen",
        body: "Nutzen Sie die häufigsten Fan-outs als Überschriften und FAQs – oder starten Sie mit dem Content-Plan einer Aufgabe zu einer Content-Lücke.",
      },
    ],
  },
  faq: [
    {
      q: "Was ist Query Fan-out?",
      a: "Query Fan-out bezeichnet, wie eine KI-Engine einen Prompt in mehrere Websuchen aufteilt, die Ergebnisse liest und zu einer Antwort zusammenführt. Die dabei gestellten Teilanfragen heißen Fan-out-Anfragen. Sie zeigen, welche Informationen die Engine sucht, bevor sie antwortet.",
    },
    {
      q: "Wie sehe ich, wonach ChatGPT im Hintergrund sucht?",
      a: "Tracken Sie Ihre Prompts mit aktiviertem ChatGPT. Liefert der Anbieter die Suchanfragen mit, speichert AutoSEO sie zu jeder Antwort und listet sie auf der Seite „Query Fanouts“ mit Häufigkeit, Engines und den zugehörigen Prompts.",
    },
    {
      q: "Welche KI-Engines liefern Fan-out-Anfragen?",
      a: "AutoSEO erfasst Fan-outs von ChatGPT (Suche und App), Gemini, Claude, Perplexity, Grok und Mistral, sofern DataForSEO oder die API der Engine sie liefert; bei Meta AI, Qwen und Kimi hängt es von API und Modell ab. Google AI Overviews, AI Mode, Copilot, DeepSeek, Sabiá und Solar liefern keine Fan-out-Anfragen, ebenso wenig Antworten über den lokalen Agenten.",
    },
    {
      q: "Wie helfen Fan-outs bei der Content-Erstellung?",
      a: "Fan-outs sind die Fragen, die eine Engine klären muss, um Ihren Prompt zu beantworten. Decken Sie sie auf Ihrer Seite als Überschriften, Fakten oder FAQs ab, bieten Sie der Engine eine Seite, die zu ihren Suchen passt. Die Aufgaben zu Content-Lücken in AutoSEO bauen daraus eine Gliederung.",
    },
    {
      q: "Sind Fan-out-Anfragen dasselbe wie Keywords?",
      a: "Nein. Keywords beschreiben, was Menschen in eine Suchmaschine eingeben. Fan-outs sind das, wonach KI-Engines in deren Auftrag suchen – oft länger und konkreter. Nutzen Sie Fan-outs zusammen mit der Keyword-Recherche, um beides abzudecken.",
    },
    {
      q: "Kann ich Fan-out-Anfragen exportieren?",
      a: "Ja. Die Seite „Query Fanouts“ lässt sich mit Häufigkeit, Engines, Prompts und Datum als CSV herunterladen. Außerdem können Sie Fan-outs in Reports übernehmen oder über die REST API und das MCP-Tool get_query_fanouts abfragen.",
    },
    {
      q: "Ist die Query-Fan-out-Analyse kostenlos?",
      a: "Die Fan-out-Analyse ist Teil der Open-Source-App AutoSEO und beim Self-Hosting kostenlos; DataForSEO- und KI-API-Nutzung rechnen dann diese Anbieter ab. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat, KI- und Datennutzung im Wert von 10\u00a0$ inklusive.",
    },
  ],
  related: ["prompt-research", "ai-content-optimization", "ai-citation-tracking", "keyword-research"],
  cta: {
    title: "Sehen Sie, wonach die KI sucht, bevor sie antwortet",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
