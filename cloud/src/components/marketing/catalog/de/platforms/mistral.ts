import type { PlatformPage } from "../../types";

export default {
  slug: "mistral",
  name: "Mistral",
  vendor: "Mistral AI",
  nav: "Mistral-Tracking",
  summary: "Sehen Sie, wann Mistral Ihre Marke nennt und welche Quellen es zitiert.",
  meta: {
    title: "Mistral-Sichtbarkeit tracken: Markenerwähnungen",
    description:
      "Tracken Sie, wie die Modelle von Mistral AI hinter Le Chat Ihre Marke erwähnen, zitieren und platzieren – mit Websuche. Open-Source-Tool für KI-Sichtbarkeit.",
  },
  hero: {
    eyebrow: "Mistral-Sichtbarkeit tracken",
    title: "Sehen Sie, wie Mistral über Ihre Marke spricht",
    muted: "– mit aktivierter Websuche.",
    subtitle:
      "Mistral AI entwickelt die Modelle hinter Le Chat. AutoSEO führt die Prompts Ihrer Kunden mit Websuche in den Modellen von Mistral aus und zeigt, ob Sie erwähnt werden, wie Sie beschrieben werden, wer neben Ihnen empfohlen wird und welche Seiten zitiert werden.",
  },
  demo: {
    prompt: "Welche Tools für KI-Sichtbarkeit kann ich in der EU hosten?",
    answer: "Acme ist Open Source – Sie können es auf Ihrem eigenen Server in der EU betreiben und tracken, wie KI-Assistenten Ihre Marke erwähnen.",
    citations: ["acme.com", "github.com", "reddit.com"],
  },
  why: {
    eyebrow: "Warum Mistral zählt",
    title: "Ein europäischer KI-Assistent",
    muted: "mit eigenem Blick auf Ihren Markt.",
    body: "Mistral AI ist ein französisches KI-Unternehmen, Le Chat sein Assistent. Mit Websuche greifen die Modelle auf aktuelle Seiten zurück und bilden eigene Shortlists – Ihre Sichtbarkeit dort kann sich also von der in ChatGPT oder Gemini unterscheiden.",
    points: [
      {
        title: "Relevant für europäische Märkte",
        body: "Wenn Sie in Europa verkaufen, ist Mistral ein Assistent, den Ihre Kunden nutzen könnten. Tracken Sie ihn in den Märkten und Sprachen, die für Sie zählen.",
      },
      {
        title: "Andere Quellen, andere Empfehlungen",
        body: "Mistral durchsucht das Web auf eigene Weise. Die zitierten Seiten zeigen, welche Quellen den Blick auf Ihre Kategorie prägen.",
      },
      {
        title: "Änderungen, die Sie sonst verpassen",
        body: "Neue Modellversionen und neue Seiten verändern Antworten ohne Vorwarnung. Regelmäßiges Tracking zeigt, wann es passiert ist.",
      },
    ],
  },
  method: {
    eyebrow: "So trackt AutoSEO Mistral",
    title: "Mistral-Antworten über die Mistral-API –",
    muted: "mit Websuche.",
    body: "AutoSEO fragt die Modelle von Mistral über die Mistral-API ab, mit aktiviertem Websuche-Tool. In AutoSEO Cloud laufen die Engines über die Anbieter, die das Codext-Team angebunden hat; die Nutzung wird auf das enthaltene Kontingent angerechnet.",
    items: [
      {
        title: "Mistral-API-Key",
        body: "Antworten der Mistral-Modelle mit den zitierten Quellen. Beim Self-Hosting hinterlegen Sie Ihren eigenen Mistral-Key unter Admin → AI Providers; Mistral rechnet direkt mit Ihnen ab.",
      },
      {
        title: "KI-Simulation als Rückfallebene",
        body: "Ist kein echtes Backend verfügbar, kann ein KI-Modell mit Websuche anstelle von Mistral antworten. Diese Antworten tragen das Label „Simulated“ und sind als Tendenz gedacht: Ein echtes Backend hat immer Vorrang, und Admins können die Rückfallebene abschalten.",
      },
    ],
  },
  tracked: {
    eyebrow: "Was getrackt wird",
    title: "Alles, was Mistral über Ihre Marke sagt",
    items: [
      {
        icon: "radar",
        title: "Markenerwähnungen",
        body: "Ob Mistral Ihre Marke bei jedem Prompt nennt – und die Mention Rate im Zeitverlauf.",
      },
      {
        icon: "link",
        title: "Zitate",
        body: "Die Seiten, die Mistral bei der Websuche zitiert – Ihre und die aller anderen.",
      },
      {
        icon: "swords",
        title: "Share of Voice",
        body: "Welche Wettbewerber Mistral neben Ihnen empfiehlt und an welcher Position.",
      },
      {
        icon: "heart",
        title: "Sentiment und Darstellung",
        body: "Wie Mistral Sie beschreibt: Lob, Kritik und die Eigenschaften, die es immer wieder nennt.",
      },
      {
        icon: "target",
        title: "Top-Empfehlungen",
        body: "Wo Mistral eine Marke als beste Wahl für einen Anwendungsfall nennt – und ob Sie es sind.",
      },
      {
        icon: "map-pin",
        title: "Märkte und Sprachen",
        body: "Derselbe Prompt auf Französisch, Deutsch, Englisch oder in jeder anderen Sprache, direkt nebeneinander verglichen.",
      },
    ],
  },
  crawlers: {
    eyebrow: "Der Crawler von Mistral",
    title: "Sorgen Sie dafür, dass Mistral Ihre Website lesen kann",
    body: "Mistral ruft Seiten für Nutzer von Le Chat mit einem eigenen User-Agent ab. Der Crawlability-Check von AutoSEO prüft Ihre robots.txt und Ihre Seiten dafür, und die Bot-Analytics zeigen, wie oft er vorbeikommt.",
    bots: [{ token: "MistralAI-User", purpose: "Ruft Seiten ab, wenn die Anfrage eines Le-Chat-Nutzers sie erfordert" }],
  },
  faq: [
    {
      q: "Wie tracke ich die Sichtbarkeit meiner Marke in Mistral?",
      a: "Hinterlegen Sie die Prompts Ihrer Kunden, wählen Sie Mistral als Engine und legen Sie einen Zeitplan fest – beim Self-Hosting hinterlegen Sie vorher einen Mistral-API-Key unter Admin → AI Providers. AutoSEO führt die Prompts mit Websuche aus und zeigt Mention Rate, Citation Rate, Position und Sentiment für Ihre Marke und Ihre Wettbewerber.",
    },
    {
      q: "Trackt AutoSEO Le Chat?",
      a: "AutoSEO fragt die Modelle von Mistral über die Mistral-API mit Websuche ab, nicht die App Le Chat selbst. Die Antworten zeigen, wie die Modelle von Mistral Ihre Marke sehen und welche Quellen sie nutzen.",
    },
    {
      q: "Brauche ich einen Mistral-API-Key?",
      a: "Nicht in AutoSEO Cloud – dort verwalten Sie keine Anbieter-Keys; die Engines laufen über die Anbieter, die das Codext-Team angebunden hat (fragen Sie uns, welche aktiviert sind). Beim Self-Hosting kommen Live-Antworten von Mistral über die API von Mistral, daher hinterlegen Sie Ihren eigenen Key unter Admin → AI Providers. Mistral rechnet direkt mit Ihnen ab; AutoSEO protokolliert jeden Aufruf, und Admins können tägliche und monatliche Ausgabenlimits festlegen.",
    },
    {
      q: "Kann ich Mistral auf Deutsch oder Französisch tracken?",
      a: "Ja. Prompts werden in der Sprache beantwortet, in der Sie sie formulieren – für jeden der 143 Märkte von AutoSEO. So vergleichen Sie, wie Mistral in Deutschland, Frankreich oder anderswo antwortet.",
    },
    {
      q: "Wie verbessere ich meine Sichtbarkeit in Mistral?",
      a: "Erlauben Sie MistralAI-User in Ihrer robots.txt, veröffentlichen Sie klare Antworten auf Ihre getrackten Prompts und sorgen Sie für Erwähnungen in den Quellen, die Mistral bereits zitiert. AutoSEO macht aus diesen Lücken priorisierte Aufgaben.",
    },
    {
      q: "Kann ich Mistral mit anderen KI-Engines vergleichen?",
      a: "Ja. Tracken Sie dieselben Prompts in ChatGPT, Perplexity, Gemini, Claude und weiteren Engines und vergleichen Sie die Sichtbarkeit je Engine in einem Dashboard.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, was Mistral über Sie sagt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies PlatformPage;
