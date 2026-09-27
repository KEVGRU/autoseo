import type { FeaturePage } from "../../types";

export default {
  slug: "ai-competitor-analysis",
  nav: "KI-Wettbewerbsanalyse",
  summary: "Sehen Sie, welche Marken die KI statt Ihnen empfiehlt – und wo sie vorne liegen.",
  meta: {
    title: "KI-Wettbewerbsanalyse & Share of Voice",
    description:
      "KI-Wettbewerbsanalyse für ChatGPT, Perplexity, Gemini und AI Overviews: Share of Voice, Position, Sentiment und Head-to-Head für jede Marke in KI-Antworten.",
  },
  hero: {
    eyebrow: "KI-Wettbewerbsanalyse",
    title: "KI-Wettbewerbsanalyse für jede Antwort.",
    muted: "Sehen Sie, wen die KI stattdessen empfiehlt.",
    subtitle:
      "AutoSEO stellt jede Marke, die KI-Engines neben Ihrer nennen, in eine Rangliste – nach Visibility, Share of Voice, Position, Zitaten und Sentiment – und zeigt die Prompts, Quellen und Vergleiche, in denen Wettbewerber vorne liegen.",
  },
  visual: "ranking",
  screenshot: {
    src: "/screenshots/competitors.png",
    darkSrc: "/screenshots/competitors-dark.png",
    alt: "AutoSEO-Wettbewerbsanalyse mit Mention Rate im Zeitverlauf und Visibility-Ranking der Wettbewerber",
    url: "ai/competitors",
  },
  stats: [
    { value: 12, label: "Wettbewerber-Metriken", note: "Von Visibility bis Citation Share" },
    { value: 16, label: "KI-Engines", note: "Direkt nebeneinander verglichen" },
    { value: 3, label: "Diagrammansichten", note: "Linie, Balken und Heatmap" },
    { value: 0, prefix: "$", label: "Self-Hosting", note: "MIT-Lizenz, alle Funktionen" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "KI-Antworten sind eine Shortlist.",
    muted: "Ihre Wettbewerber stehen darauf.",
    body: "Beantwortet ein Assistent eine Kauffrage, nennt er ein paar Marken und bringt sie in eine Reihenfolge. Wer zuerst genannt, am besten beschrieben und am häufigsten zitiert wird, ist im Vorteil. Die Wettbewerbsanalyse zeigt, wer das je Prompt und Engine ist.",
    points: [
      {
        title: "Die KI nennt Marken, die Sie nicht tracken",
        body: "Antworten empfehlen oft Nischenanbieter, Marktplätze oder Newcomer. Ohne Liste der tatsächlich genannten Marken vergleichen Sie sich mit den falschen Unternehmen.",
      },
      {
        title: "Die Position in der Antwort zählt",
        body: "Als fünfte von fünf Marken genannt zu werden ist etwas anderes, als die Top-Empfehlung zu sein. Durchschnittliche Position, Erwähnungstiefe und #1-Anteil zeigen den Unterschied.",
      },
      {
        title: "Lücken zeigen konkrete Arbeit",
        body: "Prompts, in denen ein Wettbewerber vorkommt und Sie nicht, und die dort zitierten Quellen zeigen Ihnen, wo Sie veröffentlichen, pitchen oder nachbessern sollten.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was Sie vergleichen",
    title: "Jede Marke, die die KI nennt,",
    muted: "im Ranking gegen Sie.",
    items: [
      {
        icon: "chart",
        title: "Visibility-Ranking",
        body: "Sortieren Sie jede Marke nach Visibility, Mention Rate, Share of Voice, durchschnittlicher Position, Erwähnungstiefe, Citation Rate und Sentiment – mit Veränderung zum Vorzeitraum.",
      },
      {
        icon: "trending-up",
        title: "Trends nach Engine und Tag",
        body: "Stellen Sie jede Metrik im Zeitverlauf als Linien, Balken oder Heatmap dar und schlüsseln Sie sie nach KI-Engine oder Prompt-Tag auf.",
      },
      {
        icon: "users",
        title: "Vorgeschlagene Wettbewerber",
        body: "Marken, die Engines neben Ihnen nennen, die Sie aber noch nicht tracken – mit Antworten, Prompts, Engines und durchschnittlicher Position. Mit einem Klick landen sie auf Ihrer Liste.",
      },
      {
        icon: "swords",
        title: "Head-to-Head",
        body: "Erscheinen Sie und ein Wettbewerber in derselben Antwort, sehen Sie je Engine, wer zuerst genannt wird – und welche direkten Vergleiche die KI zu wessen Gunsten entscheidet.",
      },
      {
        icon: "target",
        title: "Prompt-Lücken",
        body: "Jeder Prompt, in dem ein Wettbewerber genannt wird und Sie nicht. So wissen Sie, welche Fragen Sie zuerst zurückgewinnen sollten.",
      },
      {
        icon: "link",
        title: "Quellen der Wettbewerber",
        body: "Die Seiten, die die KI in Antworten mit einem Wettbewerber zitiert – die Testberichte, Vergleichslisten und Artikel hinter dessen Sichtbarkeit.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Von getrackten Prompts zu Wettbewerbslücken",
    muted: "in drei Schritten.",
    items: [
      {
        title: "Prompts tracken",
        body: "AutoSEO führt Ihre Prompts in den gewählten Engines und Märkten aus und speichert jede Antwort.",
      },
      {
        title: "Wettbewerber bestätigen",
        body: "Übernehmen Sie vorgeschlagene Marken oder legen Sie Wettbewerber mit Domain und alternativen Schreibweisen an, damit jede Erwähnung korrekt zugeordnet wird.",
      },
      {
        title: "Lücken schließen",
        body: "Öffnen Sie einen Wettbewerber und sehen Sie verlorene Prompts, Head-to-Head-Ergebnisse und zitierte Quellen. Verlorene Vergleiche und Lücken im Share of Voice werden zu priorisierten Aufgaben.",
      },
    ],
  },
  faq: [
    {
      q: "Was ist eine KI-Wettbewerbsanalyse?",
      a: "Eine KI-Wettbewerbsanalyse vergleicht, wie oft und wie positiv KI-Assistenten Ihre Marke im Vergleich zu Wettbewerbern bei denselben Fragen nennen. AutoSEO misst Visibility, Share of Voice, Position, Zitate und Sentiment für jede Marke in den Antworten – je Engine und im Zeitverlauf.",
    },
    {
      q: "Wie sehe ich, welche Wettbewerber ChatGPT empfiehlt?",
      a: "Tracken Sie die Fragen Ihrer Käufer mit aktiviertem ChatGPT. AutoSEO erkennt die Marken in den Antworten, schlägt die noch nicht getrackten vor und stellt alle Ihrer Marke gegenüber. Das funktioniert genauso für Perplexity, Gemini, Claude, Google AI Overviews und die übrigen Engines.",
    },
    {
      q: "Was bedeutet Share of Voice in der KI-Suche?",
      a: "Share of Voice ist die Zahl der Antworten, in denen Ihre Marke vorkommt, geteilt durch die Antwort-Auftritte aller getrackten Marken. Die Kennzahl zeigt, welchen Anteil am Gespräch Sie bei Ihren getrackten Prompts im Vergleich zu Ihren Wettbewerbern haben.",
    },
    {
      q: "Wie erkennt AutoSEO Erwähnungen von Wettbewerbern?",
      a: "Markennamen, alternative Schreibweisen und Domains werden in jeder Antwort abgeglichen. Ein zusätzlicher KI-Analyseschritt findet Marken, die noch nicht auf Ihrer Liste stehen, und extrahiert Sentiment, Empfehlungen und direkte Vergleiche. Er läuft über Ihren lokalen Claude-Code- oder Codex-Agenten oder einen konfigurierten KI-Anbieter.",
    },
    {
      q: "Kann ich einen Wettbewerber prüfen, ohne Prompts zu tracken?",
      a: "Ja. Brand Lookup fragt die KI-Erwähnungsdaten von DataForSEO für ChatGPT und Google AI Overviews zu jeder Domain oder jedem Keyword ab. Sie erhalten Erwähnungen, Top-Anfragen, zitierte Seiten und den Share of Voice gegenüber den Wettbewerbern, die Sie angeben.",
    },
    {
      q: "Kann ich Wettbewerberdaten exportieren?",
      a: "Ja. Das Visibility-Ranking lässt sich als CSV exportieren, und der Report-Builder bietet Bausteine für das Wettbewerber-Ranking und die Visibility im Vergleich. Die REST API liefert das Ranking, der MCP-Server zusätzlich Lückenanalyse und Head-to-Head-Daten.",
    },
    {
      q: "Ist die KI-Wettbewerbsanalyse in der kostenlosen Version enthalten?",
      a: "Ja. Die Wettbewerbsanalyse ist Teil der Open-Source-App AutoSEO und beim Self-Hosting kostenlos; DataForSEO- und KI-API-Nutzung rechnen dann diese Anbieter ab. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat, KI- und Datennutzung im Wert von 10\u00a0$ inklusive.",
    },
  ],
  related: ["ai-visibility-tracking", "ai-brand-sentiment", "ai-citation-tracking", "ai-seo-tasks"],
  cta: {
    title: "Finden Sie heraus, wen die KI statt Ihnen empfiehlt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
