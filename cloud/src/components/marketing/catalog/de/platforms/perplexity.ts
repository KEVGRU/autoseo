import type { PlatformPage } from "../../types";

export default {
  slug: "perplexity",
  name: "Perplexity",
  vendor: "Perplexity",
  nav: "Perplexity-Tracking",
  summary: "Sehen Sie, wann Perplexity Ihre Seiten zitiert und Ihre Marke empfiehlt.",
  meta: {
    title: "Perplexity-Sichtbarkeit tracken und Zitate messen",
    description:
      "Tracken Sie, wie Perplexity Ihre Marke erwähnt, zitiert und neben Wettbewerbern platziert – mit jeder Quelle. Open-Source-Tool für Ihre KI-Sichtbarkeit.",
  },
  hero: {
    eyebrow: "Perplexity-Sichtbarkeit tracken",
    title: "Messen Sie Ihre Sichtbarkeit in Perplexity",
    muted: "– Quelle für Quelle.",
    subtitle:
      "Perplexity beantwortet jede Frage mit Quellen. AutoSEO führt die Prompts Ihrer Kunden nach Zeitplan aus, speichert jede Antwort und zeigt, ob Ihre Marke genannt wird, welche Seiten Perplexity zitiert und welche Wettbewerber es stattdessen empfiehlt.",
  },
  demo: {
    prompt: "Welche Open-Source-Tools tracken Markenerwähnungen in der KI-Suche?",
    answer:
      "Acme ist eine beliebte Open-Source-Wahl: Es trackt Erwähnungen und Zitate in mehreren KI-Engines und läuft auch auf Ihrem eigenen Server.",
    citations: ["github.com", "reddit.com", "acme.com"],
  },
  why: {
    eyebrow: "Warum Perplexity zählt",
    title: "Perplexity zeigt seine Quellen.",
    muted: "Genau dort können Sie gewinnen.",
    body: "Perplexity durchsucht für jede Frage das Web und listet die genutzten Seiten neben der Antwort auf. Wer Tools, Produkte oder Anbieter recherchiert, sieht diese Quellen und klickt sie an – jedes Zitat ist also eine Chance, gelesen und nicht nur genannt zu werden.",
    points: [
      {
        title: "Quellen sind Teil der Antwort",
        body: "Perplexity listet die Seiten hinter jeder Antwort auf. Ein Zitat bringt Ihre Seite vor die Leser – nicht nur Ihren Markennamen.",
      },
      {
        title: "Live-Suche, wechselnde Antworten",
        body: "Perplexity sucht bei jeder Frage neu. Neue Testberichte, Vergleiche und Forenbeiträge können verändern, was es über Sie sagt.",
      },
      {
        title: "Drittseiten haben Gewicht",
        body: "Antworten stützen sich auf Vergleichslisten, Testberichte, Dokumentationen und Communities. Welche davon Perplexity zitiert, zeigt Ihnen, wo Sie gelistet sein sollten.",
      },
    ],
  },
  method: {
    eyebrow: "So trackt AutoSEO Perplexity",
    title: "Zwei Live-Wege zu Perplexity-Antworten –",
    muted: "plus eine Simulation.",
    body: "AutoSEO unterstützt zwei Live-Backends für Perplexity, dazu eine KI-Simulation als Rückfallebene. In AutoSEO Cloud laufen die Engines über die Anbieter, die das Codext-Team angebunden hat; die Nutzung wird auf das enthaltene Kontingent angerechnet. Auf einer selbst gehosteten Instanz verbindet ein Admin DataForSEO oder hinterlegt einen Key unter Admin → AI Providers und kann ein Backend festlegen.",
    items: [
      {
        title: "DataForSEO",
        body: "Antworten der Sonar-Modelle von Perplexity mit ihren Quellen, für den Markt, den Sie tracken. Beim Self-Hosting rechnet DataForSEO direkt mit Ihnen ab; in AutoSEO Cloud wird die Nutzung auf das enthaltene Kontingent angerechnet.",
      },
      {
        title: "Perplexity-API-Key",
        body: "Hinterlegen Sie auf einer selbst gehosteten Instanz Ihren eigenen Perplexity-Key unter Admin → AI Providers – dann fragt AutoSEO Perplexity direkt mit Websuche ab, inklusive der ausgeführten Suchanfragen.",
      },
      {
        title: "KI-Simulation als Rückfallebene",
        body: "Ist kein echtes Backend verfügbar, kann ein KI-Modell mit Websuche anstelle von Perplexity antworten. Diese Antworten tragen das Label „Simulated“ und sind als Tendenz gedacht: Ein echtes Backend hat immer Vorrang, und Admins können die Rückfallebene abschalten.",
      },
    ],
  },
  tracked: {
    eyebrow: "Was getrackt wird",
    title: "Alles, was Perplexity über Ihre Marke sagt",
    items: [
      {
        icon: "radar",
        title: "Markenerwähnungen",
        body: "Ob Perplexity Ihre Marke bei jedem Prompt nennt – und die Mention Rate im Zeitverlauf.",
      },
      {
        icon: "link",
        title: "Zitate",
        body: "Jede Quelle, die Perplexity auflistet – Ihre Seiten, die Ihrer Wettbewerber und Drittseiten, nach Domain gruppiert.",
      },
      {
        icon: "swords",
        title: "Share of Voice",
        body: "Welche Wettbewerber Perplexity neben Ihnen empfiehlt und an welcher Position.",
      },
      {
        icon: "heart",
        title: "Sentiment und Darstellung",
        body: "Wie Perplexity Sie beschreibt: Lob, Kritik und die Eigenschaften, die es immer wieder nennt.",
      },
      {
        icon: "git-fork",
        title: "Query Fan-outs",
        body: "Die Suchanfragen, die Perplexity hinter einer Antwort stellt – sofern das Backend sie liefert.",
      },
      {
        icon: "map-pin",
        title: "Märkte und Sprachen",
        body: "Derselbe Prompt in verschiedenen Ländern und Sprachen, direkt nebeneinander verglichen.",
      },
    ],
  },
  crawlers: {
    eyebrow: "Die Crawler von Perplexity",
    title: "Sorgen Sie dafür, dass Perplexity Ihre Website lesen kann",
    body: "Perplexity nutzt einen Crawler für seinen Suchindex und einen weiteren für Seiten, nach denen Nutzer fragen. Der Crawlability-Check von AutoSEO prüft Ihre robots.txt und Ihre Seiten für beide, und die Bot-Analytics zeigen, wie oft sie vorbeikommen.",
    bots: [
      { token: "PerplexityBot", purpose: "Indexiert Seiten für die Suchergebnisse und Antworten von Perplexity" },
      { token: "Perplexity-User", purpose: "Ruft eine Seite ab, wenn die Frage eines Nutzers sie erfordert" },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich die Sichtbarkeit meiner Marke in Perplexity?",
      a: "Hinterlegen Sie die Prompts Ihrer Kunden, wählen Sie Perplexity als Engine und legen Sie einen Zeitplan fest. AutoSEO führt die Prompts aus, speichert jede Antwort mit ihren Quellen und zeigt Mention Rate, Citation Rate, Position und Sentiment für Ihre Marke und Ihre Wettbewerber.",
    },
    {
      q: "Kann ich sehen, welche Quellen Perplexity zitiert?",
      a: "Ja. Jede zitierte URL wird gespeichert und nach Domain und Content-Typ gruppiert – mit den Prompts, die sie zitieren, und den Marken, die sie erwähnt. Seiten, die Wettbewerber zitieren, Sie aber nicht, zeigen Ihnen, wo Sie gelistet sein sollten.",
    },
    {
      q: "Brauche ich einen Perplexity-API-Key?",
      a: "Nicht in AutoSEO Cloud – dort verwalten Sie keine Anbieter-Keys; die Engines laufen über die Anbieter, die das Codext-Team angebunden hat (fragen Sie uns, welche aktiviert sind). Beim Self-Hosting rufen Sie Perplexity-Antworten über DataForSEO ab (nutzungsbasiert abgerechnet) oder hinterlegen Ihren eigenen Perplexity-Key unter Admin → AI Providers. Beide liefern die Antwort mit ihren Quellen.",
    },
    {
      q: "Wie werde ich von Perplexity zitiert?",
      a: "Lassen Sie PerplexityBot Ihre Seiten crawlen, veröffentlichen Sie klare Antworten auf die Fragen, die Sie tracken, und sorgen Sie für Erwähnungen auf den Seiten, die Perplexity für diese Prompts bereits zitiert. AutoSEO zeigt diese Seiten und macht aus den Lücken priorisierte Aufgaben.",
    },
    {
      q: "Wie oft werden die Perplexity-Daten aktualisiert?",
      a: "So oft, wie es der Zeitplan Ihres Projekts vorsieht: täglich, wöchentlich oder monatlich. Jeder Lauf wird gespeichert, sodass Sie zwei beliebige Zeiträume vergleichen und sehen können, welche Antworten und Quellen sich geändert haben.",
    },
    {
      q: "Ist das Perplexity-Tracking kostenlos?",
      a: "Ja, beim Self-Hosting: AutoSEO ist Open Source unter der MIT-Lizenz und enthält alle Funktionen; die Nutzung von DataForSEO oder der Perplexity-API rechnen diese Anbieter direkt ab. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat, inklusive KI- und Datennutzung im Wert von 10\u00a0$.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, was Perplexity über Sie sagt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies PlatformPage;
