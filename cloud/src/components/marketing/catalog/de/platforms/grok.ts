import type { PlatformPage } from "../../types";

export default {
  slug: "grok",
  name: "Grok",
  vendor: "xAI",
  nav: "Grok-Tracking",
  summary: "Sehen Sie, wann Grok Ihre Marke nennt und welche Webseiten und X-Posts es zitiert.",
  meta: {
    title: "Grok-Sichtbarkeit tracken: Markenerwähnungen",
    description:
      "Tracken Sie, wie Grok von xAI Ihre Marke erwähnt, zitiert und neben Wettbewerbern platziert – mit Web- und X-Suche. Open-Source-Tool für Ihre KI-Sichtbarkeit.",
  },
  hero: {
    eyebrow: "Grok-Sichtbarkeit tracken",
    title: "Sehen Sie, was Grok über Ihre Marke sagt",
    muted: "– im Web und auf X.",
    subtitle:
      "Grok kann vor der Antwort das Web und Posts auf X durchsuchen. AutoSEO führt die Prompts Ihrer Kunden in Grok mit beiden Suchen aus und zeigt, ob Sie erwähnt werden, wie Sie beschrieben werden, wer neben Ihnen empfohlen wird und welche Quellen Grok zitiert.",
  },
  demo: {
    prompt: "Gibt es ein Open-Source-Tool, um die Sichtbarkeit einer Marke in KI-Antworten zu tracken?",
    answer: "Ja – Acme ist Open Source und trackt Markenerwähnungen und Zitate in den großen KI-Assistenten. Sie können es selbst hosten.",
    citations: ["x.com", "github.com", "acme.com"],
  },
  why: {
    eyebrow: "Warum Grok zählt",
    title: "Grok liest das Web und X.",
    muted: "Diskussionen prägen seine Antworten.",
    body: "Grok ist der KI-Assistent von xAI und kann aktuelle Webseiten und Posts auf X durchsuchen – was Menschen über Ihre Marke veröffentlichen und diskutieren, kann also in seinen Antworten auftauchen.",
    points: [
      {
        title: "Social-Posts in der Antwort",
        body: "Weil Grok X durchsuchen kann, können Posts über Ihre Marke neben Webquellen in seinen Antworten landen.",
      },
      {
        title: "Eine eigene Shortlist",
        body: "Die Empfehlungen von Grok können sich von denen von ChatGPT oder Gemini unterscheiden. Separates Tracking zeigt Lücken, die Sie sonst übersehen würden.",
      },
      {
        title: "Antworten folgen der Diskussion",
        body: "Neue Posts und Seiten verändern, was Grok findet. Regelmäßiges Tracking zeigt, wann sich Ihre Sichtbarkeit bewegt.",
      },
    ],
  },
  method: {
    eyebrow: "So trackt AutoSEO Grok",
    title: "Grok-Antworten über die xAI-API –",
    muted: "mit Web- und X-Suche.",
    body: "AutoSEO fragt Grok über die API von xAI ab, mit aktivierter Web- und X-Suche. In AutoSEO Cloud laufen die Engines über die Anbieter, die das Codext-Team angebunden hat; die Nutzung wird auf das enthaltene Kontingent angerechnet.",
    items: [
      {
        title: "xAI-API-Key",
        body: "Grok-Antworten mit den Quellen aus dem Web und von X sowie den ausgeführten Suchanfragen. Beim Self-Hosting hinterlegen Sie Ihren eigenen xAI-Key unter Admin → AI Providers; xAI rechnet direkt mit Ihnen ab.",
      },
      {
        title: "KI-Simulation als Rückfallebene",
        body: "Ist kein echtes Backend verfügbar, kann ein KI-Modell mit Websuche anstelle von Grok antworten. Diese Antworten tragen das Label „Simulated“ und sind als Tendenz gedacht: Ein echtes Backend hat immer Vorrang, und Admins können die Rückfallebene abschalten.",
      },
    ],
  },
  tracked: {
    eyebrow: "Was getrackt wird",
    title: "Alles, was Grok über Ihre Marke sagt",
    items: [
      {
        icon: "radar",
        title: "Markenerwähnungen",
        body: "Ob Grok Ihre Marke bei jedem Prompt nennt – und die Mention Rate im Zeitverlauf.",
      },
      {
        icon: "link",
        title: "Zitate",
        body: "Die Webseiten und X-Posts, die Grok zitiert – Ihre und die aller anderen.",
      },
      {
        icon: "swords",
        title: "Share of Voice",
        body: "Welche Wettbewerber Grok neben Ihnen empfiehlt und an welcher Position.",
      },
      {
        icon: "heart",
        title: "Sentiment und Darstellung",
        body: "Wie Grok Sie beschreibt: Lob, Kritik und die Eigenschaften, die es immer wieder nennt.",
      },
      {
        icon: "git-fork",
        title: "Query Fan-outs",
        body: "Die Suchanfragen, die Grok hinter einer Antwort stellt – sofern die API sie liefert.",
      },
      {
        icon: "map-pin",
        title: "Märkte und Sprachen",
        body: "Derselbe Prompt für verschiedene Länder und Sprachen, direkt nebeneinander verglichen.",
      },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich die Sichtbarkeit meiner Marke in Grok?",
      a: "Hinterlegen Sie die Prompts Ihrer Kunden, wählen Sie Grok als Engine und legen Sie einen Zeitplan fest – beim Self-Hosting hinterlegen Sie vorher einen xAI-API-Key unter Admin → AI Providers. AutoSEO führt die Prompts mit Web- und X-Suche aus und zeigt Mention Rate, Citation Rate, Position und Sentiment für Ihre Marke und Ihre Wettbewerber.",
    },
    {
      q: "Nutzt Grok Posts auf X für seine Antworten?",
      a: "Das kann es. AutoSEO führt Grok mit aktivierter Web- und X-Suche aus, sodass Antworten neben Webseiten auch auf Posts von X zurückgreifen können. Jede zitierte Quelle wird gespeichert – so sehen Sie, welche davon Sie erwähnen.",
    },
    {
      q: "Brauche ich einen xAI-API-Key?",
      a: "Nicht in AutoSEO Cloud – dort verwalten Sie keine Anbieter-Keys; die Engines laufen über die Anbieter, die das Codext-Team angebunden hat (fragen Sie uns, welche aktiviert sind). Beim Self-Hosting kommen Live-Antworten von Grok über die API von xAI, daher hinterlegen Sie Ihren eigenen Key unter Admin → AI Providers. xAI rechnet direkt mit Ihnen ab; AutoSEO protokolliert jeden Aufruf, und Admins können tägliche und monatliche Ausgabenlimits festlegen.",
    },
    {
      q: "Wie verbessere ich meine Sichtbarkeit in Grok?",
      a: "Veröffentlichen Sie klare Antworten auf Ihre getrackten Prompts, halten Sie Ihre Seiten crawlbar und sorgen Sie für Erwähnungen auf den Websites und in den Diskussionen, die Grok bereits zitiert. AutoSEO zeigt diese Quellen und macht aus den Lücken priorisierte Aufgaben.",
    },
    {
      q: "Kann ich Grok mit anderen KI-Engines vergleichen?",
      a: "Ja. Tracken Sie dieselben Prompts in ChatGPT, Perplexity, Gemini, Claude und weiteren Engines und vergleichen Sie die Sichtbarkeit je Engine in einem Dashboard.",
    },
    {
      q: "Ist Grok-Tracking kostenlos?",
      a: "Selbst gehostetes AutoSEO ist kostenlos und enthält Grok-Tracking; die API-Nutzung rechnet xAI direkt mit Ihnen ab. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat, inklusive KI- und Datennutzung im Wert von 10\u00a0$.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, was Grok über Sie sagt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies PlatformPage;
