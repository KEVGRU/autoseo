import type { PlatformPage } from "../../types";

export default {
  slug: "chatgpt",
  name: "ChatGPT",
  vendor: "OpenAI",
  nav: "ChatGPT-Tracking",
  summary: "Sehen Sie, wann ChatGPT Ihre Marke empfiehlt und welche Seiten es zitiert.",
  meta: {
    title: "ChatGPT-Sichtbarkeit tracken: Marken-Monitoring",
    description:
      "Tracken Sie, wie ChatGPT Ihre Marke erwähnt, zitiert und neben Wettbewerbern platziert – in der Suche und in der App. Open-Source-Tool für Ihre KI-Sichtbarkeit.",
  },
  hero: {
    eyebrow: "ChatGPT-Sichtbarkeit tracken",
    title: "Sehen Sie, wo ChatGPT Sie nennt",
    muted: "– und warum.",
    subtitle:
      "Tracken Sie täglich die Prompts, die Ihre Kunden in ChatGPT eingeben. AutoSEO speichert jede Antwort und zeigt, ob Ihre Marke erwähnt wird, wie sie beschrieben wird, welche Wettbewerber neben Ihnen auftauchen und welche Seiten ChatGPT zitiert.",
  },
  demo: {
    prompt: "Welches Open-Source-Tool eignet sich, um die Sichtbarkeit einer Marke in der KI-Suche zu tracken?",
    answer:
      "Als Open-Source-Lösung ist Acme eine gute Wahl: Es trackt Erwähnungen und Zitate in ChatGPT, Perplexity und Gemini und lässt sich selbst hosten.",
    citations: ["acme.com", "github.com", "reddit.com"],
  },
  why: {
    eyebrow: "Warum ChatGPT zählt",
    title: "Viele Kaufentscheidungen beginnen in ChatGPT.",
    muted: "Ist Ihre Marke Teil der Antwort?",
    body: "Menschen fragen ChatGPT nach Vergleichen, Empfehlungen und Anleitungen – und handeln nach den wenigen Marken, die es nennt. Mit integrierter Suche stützen sich diese Antworten auf Webquellen, die Sie beeinflussen können.",
    points: [
      {
        title: "Empfehlungen statt Links",
        body: "ChatGPT antwortet mit einer Shortlist. Genannt zu werden – und zwar zuerst – zählt mehr als jedes einzelne Ranking.",
      },
      {
        title: "Antworten auf Basis der Websuche",
        body: "Wenn ChatGPT im Web sucht, zitiert es Quellen. Diese Zitate zeigen, welche Seiten prägen, was es über Sie sagt.",
      },
      {
        title: "Antworten ändern sich unbemerkt",
        body: "Modell-Updates und neue Quellen verschieben Antworten ohne Vorwarnung. Tägliches Tracking zeigt, wann und wo es passiert ist.",
      },
    ],
  },
  method: {
    eyebrow: "So trackt AutoSEO ChatGPT",
    title: "Vier Wege zu ChatGPT-Antworten –",
    muted: "wählen Sie, was passt.",
    body: "AutoSEO kann ChatGPT-Antworten über mehrere Backends abrufen. In AutoSEO Cloud laufen die Engines über die Anbieter, die das Codext-Team angebunden hat; auf einer selbst gehosteten Instanz wählt ein Admin eines unter Admin → AI Providers, und „Auto“ nutzt das erste verfügbare.",
    items: [
      {
        title: "DataForSEO",
        body: "Suchbasierte ChatGPT-Antworten und die Ansicht der ChatGPT-App inklusive Shopping-Karten. Beim Self-Hosting rechnet DataForSEO direkt mit Ihnen ab; in AutoSEO Cloud wird die Nutzung auf das enthaltene Kontingent angerechnet.",
      },
      {
        title: "OpenAI-API-Key",
        body: "Hinterlegen Sie auf einer selbst gehosteten Instanz einen OpenAI-Key unter Admin → AI Providers – dann fragt AutoSEO ChatGPT direkt mit Websuche ab.",
      },
      {
        title: "Ihr Codex-Abo",
        body: "Führen Sie Prompts über Ihr eigenes Codex CLI aus – per schlankem lokalem Agenten, also mit dem Abo, das Sie ohnehin bezahlen.",
      },
      {
        title: "KI-Simulation als Rückfallebene",
        body: "Ist kein echtes Backend verfügbar, kann ein KI-Modell mit Websuche an Stelle von ChatGPT antworten. Diese Antworten tragen das Label „Simulated“ und sind als Tendenz gedacht.",
      },
    ],
  },
  tracked: {
    eyebrow: "Was getrackt wird",
    title: "Alles, was ChatGPT über Ihre Marke sagt",
    items: [
      {
        icon: "radar",
        title: "Markenerwähnungen",
        body: "Ob ChatGPT Ihre Marke bei jedem Prompt nennt – und die Mention Rate im Zeitverlauf.",
      },
      {
        icon: "link",
        title: "Zitate",
        body: "Die URLs, die ChatGPT in Suchantworten zitiert – Ihre und die aller anderen.",
      },
      {
        icon: "swords",
        title: "Share of Voice",
        body: "Welche Wettbewerber ChatGPT neben Ihnen empfiehlt und an welcher Position.",
      },
      {
        icon: "heart",
        title: "Sentiment und Darstellung",
        body: "Wie ChatGPT Sie beschreibt: Lob, Kritik und die Eigenschaften, die es immer wieder nennt.",
      },
      {
        icon: "shopping-bag",
        title: "Produkte und Shopping-Karten",
        body: "Produkte, die ChatGPT in der App zeigt – mit Preisen und Händlern, bei E-Commerce-Prompts.",
      },
      {
        icon: "map-pin",
        title: "Märkte und Sprachen",
        body: "Derselbe Prompt in verschiedenen Ländern und Sprachen, direkt nebeneinander verglichen.",
      },
    ],
  },
  crawlers: {
    eyebrow: "Die Crawler von OpenAI",
    title: "Sorgen Sie dafür, dass ChatGPT Ihre Website lesen kann",
    body: "OpenAI nutzt getrennte Crawler für Suche, Nutzeranfragen und Training. Der Crawlability-Check von AutoSEO prüft Ihre robots.txt und Ihre Seiten für jeden davon, und die Bot-Analytics zeigen, wie oft sie vorbeikommen.",
    bots: [
      { token: "OAI-SearchBot", purpose: "Baut den Index für die Suchantworten von ChatGPT auf" },
      { token: "ChatGPT-User", purpose: "Ruft Seiten ab, wenn ein Nutzer oder ein GPT ChatGPT bittet, sie zu öffnen" },
      { token: "GPTBot", purpose: "Sammelt Inhalte, die für das Training von OpenAI-Modellen genutzt werden können" },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich die Sichtbarkeit meiner Marke in ChatGPT?",
      a: "Hinterlegen Sie die Prompts Ihrer Kunden, wählen Sie ChatGPT als Engine und legen Sie einen Zeitplan fest. AutoSEO führt die Prompts aus, speichert jede Antwort und zeigt Mention Rate, Citation Rate, Position und Sentiment für Ihre Marke und Ihre Wettbewerber.",
    },
    {
      q: "Trackt AutoSEO die ChatGPT-Suche oder die ChatGPT-App?",
      a: "Beides. Die Engine ChatGPT nutzt suchbasierte Antworten mit Zitaten; die Engine ChatGPT (App) bildet die Antworten so ab, wie sie in der App erscheinen – inklusive Shopping-Karten.",
    },
    {
      q: "Wie oft werden die ChatGPT-Daten aktualisiert?",
      a: "So oft, wie es der Zeitplan Ihres Projekts vorsieht: täglich, wöchentlich oder monatlich. Jeder Lauf wird gespeichert, sodass Sie zwei beliebige Zeiträume vergleichen können.",
    },
    {
      q: "Kann ich sehen, welche Quellen ChatGPT über meine Marke zitiert?",
      a: "Ja. Jede zitierte URL wird gespeichert und nach Domain und Content-Typ gruppiert – mit den Prompts, die sie zitieren, und den Marken, die sie erwähnt.",
    },
    {
      q: "Wie verbessere ich meine Sichtbarkeit in ChatGPT?",
      a: "Stellen Sie sicher, dass OAI-SearchBot Ihre Seiten crawlen kann, veröffentlichen Sie Inhalte, die Ihre getrackten Prompts beantworten, und sorgen Sie für Erwähnungen in den Quellen, die ChatGPT bereits zitiert. AutoSEO macht aus diesen Lücken priorisierte Aufgaben.",
    },
    {
      q: "Kann ich ChatGPT mit anderen KI-Engines vergleichen?",
      a: "Ja. Tracken Sie dieselben Prompts in Perplexity, Gemini, Claude, Google AI Overviews und weiteren Engines und vergleichen Sie die Sichtbarkeit je Engine in einem Dashboard.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, was ChatGPT über Sie sagt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies PlatformPage;
