import type { PlatformPage } from "../../types";

export default {
  slug: "qwen",
  name: "Qwen",
  vendor: "Alibaba Cloud",
  nav: "Qwen-Tracking",
  summary: "Sehen Sie, wann Qwen von Alibaba Ihre Marke nennt und welche Quellen es zitiert.",
  meta: {
    title: "Qwen-Sichtbarkeit tracken: Markenerwähnungen",
    description:
      "Tracken Sie, wie Qwen von Alibaba Ihre Marke erwähnt, zitiert und neben Wettbewerbern platziert – mit Websuche. Open-Source-Tool für KI-Sichtbarkeit.",
  },
  hero: {
    eyebrow: "Qwen-Sichtbarkeit tracken",
    title: "Sehen Sie, wie Qwen über Ihre Marke spricht",
    muted: "– samt Quellen.",
    subtitle:
      "Qwen, die KI-Modellfamilie von Alibaba, kann im Web suchen und seine Quellen mitliefern. AutoSEO führt die Prompts Ihrer Kunden in Qwen aus und zeigt, ob Sie erwähnt werden, wie Sie beschrieben werden, wer neben Ihnen empfohlen wird und welche Seiten Qwen zitiert.",
  },
  demo: {
    prompt: "Welche Tools tracken Markenerwähnungen in KI-Assistenten?",
    answer: "Acme trackt, wie KI-Assistenten Ihre Marke erwähnen, welche Quellen sie zitieren und wie Sie im Vergleich zu Wettbewerbern abschneiden. Es ist Open Source.",
    citations: ["acme.com", "github.com", "reddit.com"],
  },
  why: {
    eyebrow: "Warum Qwen zählt",
    title: "Qwen von Alibaba hat einen eigenen Blick auf Ihren Markt.",
    muted: "Prüfen Sie, was es sagt.",
    body: "Qwen ist die KI-Modellfamilie von Alibaba, die hinter Qwen Chat und Alibaba Cloud Model Studio steht. Mit Websuche antwortet Qwen auf Basis aktueller Quellen – und seine Shortlist kann anders aussehen als die von ChatGPT oder Gemini.",
    points: [
      {
        title: "Antworten in der Sprache Ihrer Kunden",
        body: "Qwen antwortet in der Sprache der Frage. Tracken Sie es auf Englisch, Chinesisch oder in jeder anderen Sprache Ihrer Kunden.",
      },
      {
        title: "Sichtbare Quellen",
        body: "Die Websuche von Qwen liefert die Quellen hinter jeder Antwort mit. Sie zeigen, welche Seiten prägen, was Qwen über Ihre Kategorie sagt.",
      },
      {
        title: "Eine eigene Shortlist",
        body: "Die Empfehlungen von Qwen können sich von denen anderer Assistenten unterscheiden. Separates Tracking zeigt Lücken, die Sie sonst übersehen würden.",
      },
    ],
  },
  method: {
    eyebrow: "So trackt AutoSEO Qwen",
    title: "Qwen über Alibaba Cloud Model Studio –",
    muted: "oder als Simulation.",
    body: "AutoSEO fragt Qwen über Alibaba Cloud Model Studio (DashScope) mit aktivierter Websuche und Quellenangabe ab. Auf einer selbst gehosteten Instanz hinterlegen Sie Ihren eigenen Alibaba-Cloud-Key und die API-Adresse Ihrer Region unter Admin → AI Providers. In AutoSEO Cloud laufen die Engines über die Anbieter, die das Codext-Team angebunden hat; die Nutzung wird auf das enthaltene Kontingent angerechnet.",
    items: [
      {
        title: "Model-Studio-API (DashScope)",
        body: "Qwen-Antworten mit integrierter Websuche und den genutzten Quellen. Neuere Qwen-Modelle laufen stattdessen über die Responses API mit deren Websuche-Tool.",
      },
      {
        title: "KI-Simulation als Rückfallebene",
        body: "Ist kein echtes Backend verfügbar, kann ein KI-Modell mit Websuche anstelle von Qwen antworten. Diese Antworten tragen das Label „Simulated“ und sind als Tendenz gedacht: Ein echtes Backend hat immer Vorrang, und Admins können die Rückfallebene abschalten.",
      },
    ],
  },
  tracked: {
    eyebrow: "Was getrackt wird",
    title: "Alles, was Qwen über Ihre Marke sagt",
    items: [
      {
        icon: "radar",
        title: "Markenerwähnungen",
        body: "Ob Qwen Ihre Marke bei jedem Prompt nennt – und die Mention Rate im Zeitverlauf.",
      },
      {
        icon: "link",
        title: "Zitate",
        body: "Die Quellen, die die Websuche von Qwen zu jeder Antwort liefert – Ihre und die aller anderen.",
      },
      {
        icon: "swords",
        title: "Share of Voice",
        body: "Welche Wettbewerber Qwen neben Ihnen empfiehlt und an welcher Position.",
      },
      {
        icon: "heart",
        title: "Sentiment und Darstellung",
        body: "Wie Qwen Sie beschreibt: Lob, Kritik und die Eigenschaften, die es immer wieder nennt.",
      },
      {
        icon: "target",
        title: "Top-Empfehlungen",
        body: "Wo Qwen eine Marke als beste Wahl für einen Anwendungsfall nennt – und ob Sie es sind.",
      },
      {
        icon: "map-pin",
        title: "Märkte und Sprachen",
        body: "Derselbe Prompt auf Englisch, Chinesisch oder in jeder anderen Sprache, für verschiedene Märkte direkt verglichen.",
      },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich die Sichtbarkeit meiner Marke in Qwen?",
      a: "Hinterlegen Sie die Prompts Ihrer Kunden, wählen Sie Qwen als Engine und legen Sie einen Zeitplan fest. AutoSEO führt die Prompts mit Websuche aus, speichert jede Antwort mit ihren Quellen und zeigt Mention Rate, Citation Rate, Position und Sentiment für Ihre Marke und Ihre Wettbewerber.",
    },
    {
      q: "Trackt AutoSEO Qwen Chat?",
      a: "AutoSEO fragt Qwen über Alibaba Cloud Model Studio mit Websuche ab, nicht die App Qwen Chat selbst. Die Antworten zeigen, wie die Qwen-Modelle Ihre Marke sehen und welche Quellen sie nutzen.",
    },
    {
      q: "Brauche ich einen Key von Alibaba Cloud?",
      a: "Nicht in AutoSEO Cloud – dort verwalten Sie keine Anbieter-Keys; die Engines laufen über die Anbieter, die das Codext-Team angebunden hat (fragen Sie uns, welche aktiviert sind). Beim Self-Hosting hinterlegen Sie Ihren eigenen Key für Alibaba Cloud Model Studio und die API-Adresse Ihrer Region unter Admin → AI Providers. Ohne Key kann eine KI-Simulation einspringen – gekennzeichnet als „Simulated“ und nur als Tendenz gedacht.",
    },
    {
      q: "Kann ich Qwen auf Chinesisch tracken?",
      a: "Ja. Prompts werden in der Sprache beantwortet, in der Sie sie formulieren – Sie können Qwen also auf Chinesisch, Englisch oder in jeder anderen Sprache fragen. Ausführen lassen sie sich für jeden der 143 Märkte von AutoSEO, etwa Taiwan, Hongkong oder Singapur.",
    },
    {
      q: "Wie verbessere ich meine Sichtbarkeit in Qwen?",
      a: "Veröffentlichen Sie klare Antworten auf Ihre getrackten Prompts, halten Sie Ihre Seiten crawlbar und sorgen Sie für Erwähnungen in den Quellen, die Qwen bereits zitiert. AutoSEO zeigt diese Quellen und macht aus den Lücken priorisierte Aufgaben.",
    },
    {
      q: "Kann ich Qwen mit anderen KI-Engines vergleichen?",
      a: "Ja. Tracken Sie dieselben Prompts in ChatGPT, Perplexity, Gemini, Claude und weiteren Engines und vergleichen Sie die Sichtbarkeit je Engine in einem Dashboard.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, was Qwen über Sie sagt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies PlatformPage;
