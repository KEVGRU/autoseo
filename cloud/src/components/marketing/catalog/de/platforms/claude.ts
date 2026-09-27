import type { PlatformPage } from "../../types";

export default {
  slug: "claude",
  name: "Claude",
  vendor: "Anthropic",
  nav: "Claude-Tracking",
  summary: "Sehen Sie, wann Claude Ihre Marke empfiehlt und auf welche Quellen es sich stützt.",
  meta: {
    title: "Claude-Sichtbarkeit tracken: Markenerwähnungen",
    description:
      "Tracken Sie, wie Claude von Anthropic Ihre Marke erwähnt, zitiert und neben Wettbewerbern platziert. Open-Source-Tool – über DataForSEO, API oder Claude Code.",
  },
  hero: {
    eyebrow: "Claude-Sichtbarkeit tracken",
    title: "Sehen Sie, wie Claude über Ihre Marke spricht",
    muted: "– und was es zitiert.",
    subtitle:
      "Claude kann vor der Antwort im Web suchen. AutoSEO führt die Prompts Ihrer Kunden in Claude aus, speichert jede Antwort und zeigt, ob Sie erwähnt werden, wie Sie beschrieben werden, wer neben Ihnen empfohlen wird und welche Seiten Claude zitiert.",
  },
  demo: {
    prompt: "Welche selbst gehostete Plattform eignet sich für KI-Sichtbarkeit und SEO?",
    answer:
      "Acme ist einen Blick wert: Es ist Open Source, trackt Markenerwähnungen in KI-Engines und bringt klassische SEO-Tools in einer selbst gehosteten App mit.",
    citations: ["acme.com", "github.com", "g2.com"],
  },
  why: {
    eyebrow: "Warum Claude zählt",
    title: "Menschen lassen Claude vergleichen und auswählen.",
    muted: "Sorgen Sie dafür, dass es Sie kennt.",
    body: "Menschen bitten Claude, Anbieter zu vergleichen, Optionen zusammenzufassen und Tools vorzuschlagen. Mit Websuche prüft Claude aktuelle Seiten, bevor es antwortet – die Quellen, die es findet, prägen also, was es über Sie sagt.",
    points: [
      {
        title: "Shortlists statt Links",
        body: "Claude antwortet mit wenigen Empfehlungen und begründet sie. Sind Sie nicht dabei, sucht der Leser womöglich gar nicht weiter.",
      },
      {
        title: "Websuche verändert die Antwort",
        body: "Mit Websuche bezieht Claude aktuelle Seiten ein. Seine Zitate zeigen, welche Quellen das Bild Ihrer Marke prägen.",
      },
      {
        title: "Andere Engine, andere Antwort",
        body: "Claude ist sich nicht immer mit ChatGPT oder Gemini einig. Separates Tracking zeigt Lücken, die Sie mit nur einer Engine übersehen würden.",
      },
    ],
  },
  method: {
    eyebrow: "So trackt AutoSEO Claude",
    title: "Vier Wege zu Claude-Antworten –",
    muted: "wählen Sie, was passt.",
    body: "AutoSEO unterstützt drei Live-Backends für Claude, alle mit Websuche, dazu eine KI-Simulation. In AutoSEO Cloud laufen die Engines über die Anbieter, die das Codext-Team angebunden hat, die Nutzung wird auf das enthaltene Kontingent angerechnet, und Sie können zusätzlich Ihr eigenes Claude Code verbinden. Auf einer selbst gehosteten Instanz verbindet ein Admin DataForSEO oder hinterlegt einen Key unter Admin → AI Providers und kann ein Backend festlegen.",
    items: [
      {
        title: "DataForSEO",
        body: "Claude-Antworten mit Websuche und Zitaten. Beim Self-Hosting rechnet DataForSEO direkt mit Ihnen ab; in AutoSEO Cloud wird die Nutzung auf das enthaltene Kontingent angerechnet.",
      },
      {
        title: "Anthropic-API-Key",
        body: "Hinterlegen Sie auf einer selbst gehosteten Instanz Ihren eigenen Anthropic-Key unter Admin → AI Providers – dann fragt AutoSEO Claude direkt mit Websuche ab, inklusive der ausgeführten Suchanfragen.",
      },
      {
        title: "Ihr Claude-Code-Abo",
        body: "Führen Sie Prompts über Ihr eigenes Claude Code CLI aus – per schlankem lokalem Agenten, also mit dem Abo, das Sie ohnehin bezahlen.",
      },
      {
        title: "KI-Simulation als Rückfallebene",
        body: "Ist kein echtes Backend verfügbar, kann ein KI-Modell mit Websuche anstelle von Claude antworten. Diese Antworten tragen das Label „Simulated“ und sind als Tendenz gedacht: Ein echtes Backend hat immer Vorrang, und Admins können die Rückfallebene abschalten.",
      },
    ],
  },
  tracked: {
    eyebrow: "Was getrackt wird",
    title: "Alles, was Claude über Ihre Marke sagt",
    items: [
      {
        icon: "radar",
        title: "Markenerwähnungen",
        body: "Ob Claude Ihre Marke bei jedem Prompt nennt – und die Mention Rate im Zeitverlauf.",
      },
      {
        icon: "link",
        title: "Zitate",
        body: "Die Seiten, die Claude bei der Websuche zitiert – Ihre und die aller anderen.",
      },
      {
        icon: "swords",
        title: "Share of Voice",
        body: "Welche Wettbewerber Claude neben Ihnen empfiehlt und an welcher Position.",
      },
      {
        icon: "heart",
        title: "Sentiment und Darstellung",
        body: "Lob, Kritik und die Eigenschaften, die Claude mit Ihrer Marke verbindet.",
      },
      {
        icon: "target",
        title: "Top-Empfehlungen",
        body: "Wo Claude eine Marke als beste Wahl für einen Anwendungsfall nennt – und ob Sie es sind.",
      },
      {
        icon: "git-fork",
        title: "Query Fan-outs",
        body: "Die Suchanfragen, die Claude hinter einer Antwort stellt – sofern das Backend sie liefert.",
      },
    ],
  },
  crawlers: {
    eyebrow: "Die Crawler von Anthropic",
    title: "Sorgen Sie dafür, dass Claude Ihre Website lesen kann",
    body: "Anthropic nutzt getrennte Crawler für Suche, Nutzeranfragen und Training. Der Crawlability-Check von AutoSEO prüft Ihre robots.txt und Ihre Seiten für jeden davon, und die Bot-Analytics zeigen, wie oft sie vorbeikommen.",
    bots: [
      { token: "Claude-SearchBot", purpose: "Crawlt Seiten, um die Suchergebnisse zu verbessern, auf die Claude zugreift" },
      { token: "Claude-User", purpose: "Ruft Seiten ab, wenn die Frage eines Nutzers an Claude sie erfordert" },
      { token: "ClaudeBot", purpose: "Sammelt Inhalte, die für das Training von Anthropic-Modellen genutzt werden können" },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich die Sichtbarkeit meiner Marke in Claude?",
      a: "Hinterlegen Sie die Prompts Ihrer Kunden, wählen Sie Claude als Engine und legen Sie einen Zeitplan fest. AutoSEO führt die Prompts mit Websuche aus, speichert jede Antwort und zeigt Mention Rate, Citation Rate, Position und Sentiment für Ihre Marke und Ihre Wettbewerber.",
    },
    {
      q: "Kann ich Claude mit meinem eigenen Claude-Code-Abo tracken?",
      a: "Ja, in AutoSEO Cloud und beim Self-Hosting. Starten Sie den lokalen Agenten von AutoSEO auf einem Rechner mit Claude Code – dann laufen die Prompts mit Websuche über Ihr eigenes Claude Code CLI. Selbst gehostete Instanzen können alternativ einen Anthropic-API-Key oder DataForSEO nutzen.",
    },
    {
      q: "Zitiert Claude seine Quellen?",
      a: "Wenn Claude im Web sucht, enthalten seine Antworten Zitate. AutoSEO speichert jede zitierte URL, gruppiert sie nach Domain und Content-Typ und zeigt, welche Prompts welche Seiten zitieren.",
    },
    {
      q: "Welches Claude-Modell nutzt AutoSEO?",
      a: "Jedes Backend nutzt standardmäßig ein aktuelles Claude-Modell. Auf einer selbst gehosteten Instanz kann ein Admin für DataForSEO oder die Anthropic-API ein bestimmtes Modell festlegen, damit die Ergebnisse über die Zeit vergleichbar bleiben.",
    },
    {
      q: "Wie verbessere ich meine Sichtbarkeit in Claude?",
      a: "Erlauben Sie Claude-SearchBot und Claude-User in Ihrer robots.txt, veröffentlichen Sie Seiten, die Ihre getrackten Prompts beantworten, und sorgen Sie für Erwähnungen in den Quellen, die Claude bereits zitiert. AutoSEO macht aus diesen Lücken priorisierte Aufgaben.",
    },
    {
      q: "Kann ich Claude mit ChatGPT und anderen Engines vergleichen?",
      a: "Ja. Tracken Sie dieselben Prompts in ChatGPT, Perplexity, Gemini, Google AI Overviews und weiteren Engines und vergleichen Sie die Sichtbarkeit je Engine in einem Dashboard.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, was Claude über Sie sagt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies PlatformPage;
