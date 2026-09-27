import type { PlatformPage } from "../../types";

export default {
  slug: "gemini",
  name: "Gemini",
  vendor: "Google",
  nav: "Gemini-Tracking",
  summary: "Sehen Sie, wann Gemini Ihre Marke nennt und auf welchen Quellen die Antworten beruhen.",
  meta: {
    title: "Gemini-Sichtbarkeit tracken: Marke & Quellen",
    description:
      "Tracken Sie, wie Gemini Ihre Marke erwähnt, zitiert und neben Wettbewerbern platziert – mit den Quellen jeder Antwort. Open-Source-Tool für KI-Sichtbarkeit.",
  },
  hero: {
    eyebrow: "Gemini-Sichtbarkeit tracken",
    title: "Sehen Sie, wie Gemini Ihre Marke darstellt",
    muted: "– und worauf es sich stützt.",
    subtitle:
      "Gemini kann seine Antworten auf die Google-Suche stützen. AutoSEO führt die Prompts Ihrer Kunden in Gemini aus, speichert jede Antwort und zeigt, ob Sie erwähnt werden, wie Sie beschrieben werden, welche Wettbewerber neben Ihnen auftauchen und welche Quellen Gemini nutzt.",
  },
  demo: {
    prompt: "Welche Tools zeigen, wie KI-Assistenten über meine Marke sprechen?",
    answer:
      "Acme trackt, wie Assistenten wie Gemini und ChatGPT Ihre Marke erwähnen, welche Quellen sie zitieren und wie Sie im Vergleich zu Wettbewerbern abschneiden.",
    citations: ["acme.com", "g2.com", "reddit.com"],
  },
  why: {
    eyebrow: "Warum Gemini zählt",
    title: "Gemini antwortet mit der Google-Suche.",
    muted: "Ihre Präsenz in der Suche zählt mit.",
    body: "Gemini ist der KI-Assistent von Google. Stützt Gemini eine Antwort auf die Google-Suche, entscheiden die gefundenen Seiten, welche Marken es nennt und wie es sie beschreibt.",
    points: [
      {
        title: "Gestützt auf die Google-Suche",
        body: "Gemini kann vor der Antwort Google-Suchen ausführen. Die Ergebnisse, die es nutzt, werden zu den Quellen der Antwort.",
      },
      {
        title: "Ein anderer Blick als andere Assistenten",
        body: "Gemini nutzt den Google-Index, andere Assistenten ihren eigenen. Ihre Sichtbarkeit kann in einem stark sein und im anderen fehlen.",
      },
      {
        title: "Antworten verschieben sich",
        body: "Modell-Updates und neue Suchergebnisse verändern Antworten ohne Vorwarnung. Regelmäßiges Tracking zeigt, wann und wo es passiert ist.",
      },
    ],
  },
  method: {
    eyebrow: "So trackt AutoSEO Gemini",
    title: "Zwei Live-Wege zu Gemini-Antworten –",
    muted: "plus eine Simulation.",
    body: "AutoSEO unterstützt zwei Live-Backends für Gemini, dazu eine KI-Simulation als Rückfallebene. In AutoSEO Cloud laufen die Engines über die Anbieter, die das Codext-Team angebunden hat; die Nutzung wird auf das enthaltene Kontingent angerechnet. Auf einer selbst gehosteten Instanz verbindet ein Admin DataForSEO oder hinterlegt einen Key unter Admin → AI Providers und kann ein Backend festlegen.",
    items: [
      {
        title: "DataForSEO",
        body: "Gemini-Antworten mit Websuche und ihren Quellen. Beim Self-Hosting rechnet DataForSEO direkt mit Ihnen ab; in AutoSEO Cloud wird die Nutzung auf das enthaltene Kontingent angerechnet.",
      },
      {
        title: "Gemini-API-Key",
        body: "Hinterlegen Sie auf einer selbst gehosteten Instanz Ihren eigenen Gemini-Key unter Admin → AI Providers – dann fragt AutoSEO Gemini mit der Google-Suche als Grundlage ab, inklusive der ausgeführten Suchanfragen.",
      },
      {
        title: "KI-Simulation als Rückfallebene",
        body: "Ist kein echtes Backend verfügbar, kann ein KI-Modell mit Websuche anstelle von Gemini antworten. Diese Antworten tragen das Label „Simulated“ und sind als Tendenz gedacht: Ein echtes Backend hat immer Vorrang, und Admins können die Rückfallebene abschalten.",
      },
    ],
  },
  tracked: {
    eyebrow: "Was getrackt wird",
    title: "Alles, was Gemini über Ihre Marke sagt",
    items: [
      {
        icon: "radar",
        title: "Markenerwähnungen",
        body: "Ob Gemini Ihre Marke bei jedem Prompt nennt – und die Mention Rate im Zeitverlauf.",
      },
      {
        icon: "link",
        title: "Quellen der Antwort",
        body: "Die Seiten hinter den Antworten von Gemini – als echte URLs gespeichert und nach Domain gruppiert.",
      },
      {
        icon: "swords",
        title: "Share of Voice",
        body: "Welche Wettbewerber Gemini neben Ihnen empfiehlt und an welcher Position.",
      },
      {
        icon: "heart",
        title: "Sentiment und Darstellung",
        body: "Wie Gemini Sie beschreibt: Lob, Kritik und die Eigenschaften, die es immer wieder nennt.",
      },
      {
        icon: "git-fork",
        title: "Query Fan-outs",
        body: "Die Google-Suchen, die Gemini für eine Antwort ausführt – sofern das Backend sie liefert.",
      },
      {
        icon: "map-pin",
        title: "Märkte und Sprachen",
        body: "Derselbe Prompt für verschiedene Länder und Sprachen, direkt nebeneinander verglichen.",
      },
    ],
  },
  crawlers: {
    eyebrow: "Die Crawler von Google",
    title: "Sorgen Sie dafür, dass Gemini Ihre Website lesen kann",
    body: "Gemini stützt Antworten auf die Google-Suche, deren Index Googlebot aufbaut. Google-Extended ist kein Crawler, sondern ein robots.txt-Token. Der Crawlability-Check von AutoSEO prüft Ihre robots.txt und Ihre Seiten für jeden davon, und die Bot-Analytics zeigen, wie oft Googlebot und GoogleOther vorbeikommen.",
    bots: [
      { token: "Googlebot", purpose: "Crawlt und indexiert Seiten für die Google-Suche, auf die sich Gemini stützt" },
      {
        token: "Google-Extended",
        purpose: "Kein eigener Crawler: ein robots.txt-Token, das steuert, ob Ihre Inhalte für Gemini-Modelle genutzt werden dürfen",
      },
      { token: "GoogleOther", purpose: "Allgemeiner Google-Crawler für Forschung und Entwicklung, außerhalb der Suche" },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich die Sichtbarkeit meiner Marke in Gemini?",
      a: "Hinterlegen Sie die Prompts Ihrer Kunden, wählen Sie Gemini als Engine und legen Sie einen Zeitplan fest. AutoSEO führt die Prompts mit Suche aus, speichert jede Antwort und zeigt Mention Rate, Citation Rate, Position und Sentiment für Ihre Marke und Ihre Wettbewerber.",
    },
    {
      q: "Nutzt Gemini die Google-Suche für seine Antworten?",
      a: "Das kann es, und AutoSEO führt Gemini immer mit aktivierter Suche aus. Die Antworten enthalten die Quellen, die Gemini genutzt hat – also die Seiten, die prägen, was es über Sie sagt.",
    },
    {
      q: "Ist Gemini-Tracking dasselbe wie Google AI Overviews?",
      a: "Nein. Gemini ist der Assistent von Google, AI Overviews und der AI Mode sind Teil der Google-Suche. AutoSEO trackt alle drei als eigene Engines, sodass Sie sie für dieselben Prompts vergleichen können.",
    },
    {
      q: "Brauche ich einen Gemini-API-Key?",
      a: "Nicht in AutoSEO Cloud – dort verwalten Sie keine Anbieter-Keys; die Engines laufen über die Anbieter, die das Codext-Team angebunden hat (fragen Sie uns, welche aktiviert sind). Beim Self-Hosting rufen Sie Gemini-Antworten über DataForSEO ab (nutzungsbasiert abgerechnet) oder hinterlegen Ihren eigenen Gemini-Key unter Admin → AI Providers. Beide liefern Antworten auf Basis der Suche.",
    },
    {
      q: "Wie verbessere ich meine Sichtbarkeit in Gemini?",
      a: "Stellen Sie sicher, dass Googlebot Ihre Seiten crawlen und indexieren kann, veröffentlichen Sie Inhalte, die Ihre getrackten Prompts beantworten, und sorgen Sie für Erwähnungen in den Quellen, die Gemini bereits nutzt. AutoSEO macht aus diesen Lücken priorisierte Aufgaben.",
    },
    {
      q: "Wie oft werden die Gemini-Daten aktualisiert?",
      a: "So oft, wie es der Zeitplan Ihres Projekts vorsieht: täglich, wöchentlich oder monatlich. Jeder Lauf wird gespeichert, sodass Sie zwei beliebige Zeiträume vergleichen und sehen können, was sich geändert hat.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, was Gemini über Sie sagt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies PlatformPage;
