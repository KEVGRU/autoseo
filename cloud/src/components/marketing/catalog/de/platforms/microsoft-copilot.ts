import type { PlatformPage } from "../../types";

export default {
  slug: "microsoft-copilot",
  name: "Microsoft Copilot",
  vendor: "Microsoft",
  nav: "Copilot-Tracking",
  summary: "Sehen Sie, wann Copilot Ihre Marke in Bing nennt und welche Seiten er zitiert.",
  meta: {
    title: "Microsoft-Copilot-Sichtbarkeit tracken (Bing)",
    description:
      "Tracken Sie, wie Microsoft Copilot Ihre Marke in Bing erwähnt und zitiert – im Vergleich zu Wettbewerbern und je Markt. Open-Source-Tool, über DataForSEO.",
  },
  hero: {
    eyebrow: "Microsoft Copilot tracken",
    title: "Sehen Sie, wo Microsoft Copilot Sie nennt",
    muted: "– in den KI-Antworten von Bing.",
    subtitle:
      "Copilot-Antworten stützen sich auf Bing. AutoSEO erfasst die Copilot-Antwort, die Bing für Ihre Suchanfragen zeigt, in den Märkten Ihrer Wahl und zeigt, ob Sie erwähnt werden, wer neben Ihnen auftaucht und welche Seiten zitiert werden.",
  },
  demo: {
    prompt: "beste tools um markensichtbarkeit in der ki suche zu tracken",
    answer:
      "Tools wie Acme tracken, wie oft KI-Assistenten eine Marke erwähnen und zitieren, und vergleichen sie über mehrere Engines hinweg mit Wettbewerbern.",
    citations: ["acme.com", "g2.com", "reddit.com"],
  },
  why: {
    eyebrow: "Warum Copilot zählt",
    title: "Copilot antwortet aus dem Bing-Index.",
    muted: "Bing-SEO zählt wieder.",
    body: "Microsoft Copilot stützt sich auf die Bing-Suche. Die Seiten, die Bing indexiert und rankt, fließen in die Antworten von Copilot ein – eine Lücke in Bing kann also zur Lücke in Copilot werden.",
    points: [
      {
        title: "Ein eigener Index",
        body: "Bing crawlt und rankt das Web unabhängig von Google. Gute Google-Rankings garantieren nicht, dass Copilot Ihre Seiten kennt.",
      },
      {
        title: "Antworten mitten in den Ergebnissen",
        body: "Bing zeigt Copilot-Antworten direkt in den Suchergebnissen – Suchende bekommen eine Empfehlung, bevor sie überhaupt klicken.",
      },
      {
        title: "Andere Engine, andere Shortlist",
        body: "Die Empfehlungen von Copilot können sich von denen von ChatGPT oder Google unterscheiden. Separates Tracking zeigt, wo Sie fehlen.",
      },
    ],
  },
  method: {
    eyebrow: "So trackt AutoSEO Copilot",
    title: "Copilot-Antworten aus Bing-Ergebnissen –",
    muted: "über DataForSEO.",
    body: "AutoSEO ruft die Bing-Suchergebnisse für jede Suchanfrage über DataForSEO ab – mit Ihrem Markt und Ihrer Sprache – und speichert die dort angezeigte Copilot-Antwort. DataForSEO ist das einzige Live-Backend für diese Engine; ohne DataForSEO kann eine KI-Simulation einspringen.",
    items: [
      {
        title: "DataForSEO",
        body: "Bing-Ergebnisse (Desktop) mit der Copilot-Antwort, ihren Quellen sowie Shopping-Ergebnissen oder Anzeigen auf der Seite. Beim Self-Hosting rechnet DataForSEO direkt mit Ihnen ab; in AutoSEO Cloud wird die Nutzung auf das enthaltene Kontingent angerechnet.",
      },
      {
        title: "KI-Simulation als Rückfallebene",
        body: "Ist kein echtes Backend verfügbar, kann ein KI-Modell mit Websuche anstelle von Copilot antworten. Diese Antworten tragen das Label „Simulated“ und sind als Tendenz gedacht: Ein echtes Backend hat immer Vorrang, und Admins können die Rückfallebene abschalten. Die Simulation nutzt OpenAI mit Websuche, wenn ein OpenAI-Key hinterlegt ist, und enthält nie Shopping-Ergebnisse oder Anzeigen.",
      },
    ],
  },
  tracked: {
    eyebrow: "Was getrackt wird",
    title: "Alles, was Copilot über Ihre Marke sagt",
    items: [
      {
        icon: "eye",
        title: "Präsenz der Copilot-Antwort",
        body: "Ob Bing für Ihre Suchanfrage eine Copilot-Antwort zeigt – je Markt und Lauf.",
      },
      {
        icon: "radar",
        title: "Markenerwähnungen",
        body: "Ob Copilot Ihre Marke bei jeder Suchanfrage nennt – und die Mention Rate im Zeitverlauf.",
      },
      {
        icon: "link",
        title: "Zitate",
        body: "Die Seiten, die Copilot zitiert – Ihre, die Ihrer Wettbewerber und Drittseiten.",
      },
      {
        icon: "swords",
        title: "Share of Voice",
        body: "Welche Wettbewerber Copilot neben Ihnen nennt und an welcher Position.",
      },
      {
        icon: "heart",
        title: "Sentiment und Darstellung",
        body: "Wie Copilot Sie beschreibt: Lob, Kritik und die Eigenschaften, die er immer wieder nennt.",
      },
      {
        icon: "shopping-bag",
        title: "Shopping-Ergebnisse und Anzeigen",
        body: "Produktlistings und bezahlte Platzierungen auf der Bing-Ergebnisseite neben der Antwort.",
      },
    ],
  },
  crawlers: {
    eyebrow: "Der Crawler von Microsoft",
    title: "Sorgen Sie dafür, dass Bing Ihre Website lesen kann",
    body: "Copilot stützt sich auf den Bing-Index, und den baut Bingbot auf. Der Crawlability-Check von AutoSEO prüft Ihre robots.txt und Ihre Seiten für Bingbot, und die Bot-Analytics zeigen, wie oft er vorbeikommt.",
    bots: [{ token: "Bingbot", purpose: "Crawlt und indexiert Seiten für die Bing-Suche, auf die sich Copilot-Antworten stützen" }],
  },
  faq: [
    {
      q: "Wie tracke ich meine Marke in Microsoft Copilot?",
      a: "Hinterlegen Sie die Suchanfragen, die Sie beobachten möchten, wählen Sie Microsoft Copilot als Engine und legen Sie einen Zeitplan fest. AutoSEO erfasst die Copilot-Antworten aus Bing über DataForSEO und zeigt Mention Rate, Citation Rate, Position und Sentiment für Ihre Marke und Ihre Wettbewerber.",
    },
    {
      q: "Trackt AutoSEO die Copilot-App oder Copilot in Bing?",
      a: "AutoSEO trackt die Copilot-Antworten, die Bing in seinen Suchergebnissen zeigt, erfasst über DataForSEO. Die Copilot-App selbst wird nicht direkt abgefragt.",
    },
    {
      q: "Wie verbessere ich meine Sichtbarkeit in Copilot?",
      a: "Beginnen Sie bei Bing: Lassen Sie Bingbot Ihre Seiten crawlen und prüfen Sie, ob sie indexiert sind – etwa in den Bing Webmaster Tools. Beantworten Sie dann die getrackten Suchanfragen klar und sorgen Sie für Erwähnungen auf den Seiten, die Copilot bereits zitiert. AutoSEO macht aus diesen Lücken priorisierte Aufgaben.",
    },
    {
      q: "Brauche ich DataForSEO, um Copilot zu tracken?",
      a: "Nicht in AutoSEO Cloud – dort verwalten Sie keine Zugangsdaten für Anbieter; die Engines laufen über die Anbieter, die das Codext-Team angebunden hat (fragen Sie uns, welche aktiviert sind). Beim Self-Hosting kommen Live-Antworten von Copilot aus den Bing-Ergebnissen von DataForSEO: Hinterlegen Sie Ihre Zugangsdaten einmal unter Admin → Data Providers – derselbe Account liefert auch Keyword-Recherche, Rank Tracking und Backlinks. Ohne DataForSEO kann eine KI-Simulation einspringen – gekennzeichnet als „Simulated“ und nur als Tendenz gedacht.",
    },
    {
      q: "Kann ich Copilot mit ChatGPT und Google vergleichen?",
      a: "Ja. Tracken Sie dieselben Prompts in ChatGPT, Google AI Overviews, Perplexity und weiteren Engines und vergleichen Sie die Sichtbarkeit je Engine in einem Dashboard.",
    },
    {
      q: "Wie oft werden die Copilot-Daten aktualisiert?",
      a: "So oft, wie es der Zeitplan Ihres Projekts vorsieht: täglich, wöchentlich oder monatlich. Jeder Lauf wird gespeichert, sodass Sie zwei beliebige Zeiträume vergleichen und sehen können, was sich geändert hat.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, was Copilot über Sie sagt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies PlatformPage;
