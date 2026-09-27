import type { PlatformPage } from "../../types";

export default {
  slug: "sabia",
  name: "Sabiá",
  vendor: "Maritaca AI",
  nav: "Sabiá-Tracking",
  summary: "Sehen Sie, wann Sabiá Ihre Marke auf Portugiesisch nennt und welche Links es zitiert.",
  meta: {
    title: "Sabiá-Sichtbarkeit tracken: Markenerwähnungen",
    description:
      "Tracken Sie, wie Sabiá von Maritaca AI Ihre Marke in portugiesischen Antworten erwähnt, zitiert und platziert – mit Websuche. Open-Source-Tool für Brasilien.",
  },
  hero: {
    eyebrow: "Sabiá-Sichtbarkeit tracken",
    title: "Sehen Sie, was Sabiá über Ihre Marke sagt",
    muted: "– auf brasilianischem Portugiesisch.",
    subtitle:
      "Sabiá ist das portugiesischsprachige Modell von Maritaca AI, entwickelt für Brasilien. AutoSEO führt die Prompts Ihrer Kunden mit Websuche in Sabiá aus und zeigt, ob Sie erwähnt werden, wie Sie beschrieben werden, wer neben Ihnen empfohlen wird und welche Links Sabiá zitiert.",
  },
  demo: {
    prompt: "Qual ferramenta open source mede a visibilidade de uma marca nas buscas com IA?",
    answer:
      "O Acme é uma boa opção open source: acompanha menções e citações da sua marca em assistentes de IA e pode rodar no seu próprio servidor.",
    citations: ["acme.com", "github.com", "reddit.com"],
  },
  why: {
    eyebrow: "Warum Sabiá zählt",
    title: "Sabiá ist für brasilianisches Portugiesisch gebaut.",
    muted: "Kommt Ihre Marke in seinen Antworten vor?",
    body: "Sabiá ist die Modellfamilie von Maritaca AI, die zuerst auf Portugiesisch ausgerichtet und für Brasilien entwickelt ist. Mit Websuche antwortet Sabiá auf Basis aktueller Quellen – relevant, wenn Sie an portugiesischsprachige Kunden verkaufen.",
    points: [
      {
        title: "Portugiesisch zuerst",
        body: "Sabiá ist auf brasilianisches Portugiesisch ausgerichtet. Tracken Sie die Prompts, die Ihre Kunden in Brasilien tatsächlich eingeben – in ihrer Sprache.",
      },
      {
        title: "Quellen in der Antwort",
        body: "Sabiá zitiert seine Webquellen als Links im Antworttext. AutoSEO erfasst diese Links als Zitate.",
      },
      {
        title: "Eine eigene Shortlist",
        body: "Die Empfehlungen von Sabiá können sich von denen von ChatGPT oder Gemini unterscheiden. Separates Tracking zeigt Lücken, die Sie sonst übersehen würden.",
      },
    ],
  },
  method: {
    eyebrow: "So trackt AutoSEO Sabiá",
    title: "Sabiá über die Maritaca-API –",
    muted: "oder als Simulation.",
    body: "AutoSEO fragt Sabiá über die Chat-API von Maritaca AI mit aktivierter Websuche ab. Maritaca führt die Suche selbst aus und liefert nur die fertige Antwort. Auf einer selbst gehosteten Instanz hinterlegen Sie Ihren eigenen Maritaca-Key unter Admin → AI Providers. In AutoSEO Cloud laufen die Engines über die Anbieter, die das Codext-Team angebunden hat; die Nutzung wird auf das enthaltene Kontingent angerechnet.",
    items: [
      {
        title: "Maritaca-API",
        body: "Sabiá-Antworten mit Websuche für Ihren Prompt und Markt. Die Links, die Sabiá in der Antwort zitiert, werden zu den Quellen, die AutoSEO trackt.",
      },
      {
        title: "KI-Simulation als Rückfallebene",
        body: "Ist kein echtes Backend verfügbar, kann ein KI-Modell mit Websuche anstelle von Sabiá antworten. Diese Antworten tragen das Label „Simulated“ und sind als Tendenz gedacht: Ein echtes Backend hat immer Vorrang, und Admins können die Rückfallebene abschalten.",
      },
    ],
  },
  tracked: {
    eyebrow: "Was getrackt wird",
    title: "Alles, was Sabiá über Ihre Marke sagt",
    items: [
      {
        icon: "radar",
        title: "Markenerwähnungen",
        body: "Ob Sabiá Ihre Marke bei jedem Prompt nennt – und die Mention Rate im Zeitverlauf.",
      },
      {
        icon: "link",
        title: "Zitierte Links",
        body: "Die Links, die Sabiá in seinen Antworten zitiert – Ihre Seiten und die aller anderen, nach Domain gruppiert.",
      },
      {
        icon: "swords",
        title: "Share of Voice",
        body: "Welche Wettbewerber Sabiá neben Ihnen empfiehlt und an welcher Position.",
      },
      {
        icon: "heart",
        title: "Sentiment und Darstellung",
        body: "Wie Sabiá Sie beschreibt: Lob, Kritik und die Eigenschaften, die es immer wieder nennt.",
      },
      {
        icon: "target",
        title: "Top-Empfehlungen",
        body: "Wo Sabiá eine Marke als beste Wahl für einen Anwendungsfall nennt – und ob Sie es sind.",
      },
      {
        icon: "map-pin",
        title: "Märkte und Sprachen",
        body: "Brasilianisches Portugiesisch zuerst – und derselbe Prompt in anderen Märkten und Sprachen, direkt verglichen.",
      },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich die Sichtbarkeit meiner Marke in Sabiá?",
      a: "Hinterlegen Sie die Prompts Ihrer Kunden, wählen Sie Sabiá als Engine und legen Sie einen Zeitplan fest. AutoSEO führt die Prompts mit Websuche aus, speichert jede Antwort und zeigt Mention Rate, Citation Rate, Position und Sentiment für Ihre Marke und Ihre Wettbewerber.",
    },
    {
      q: "Zitiert Sabiá seine Quellen?",
      a: "Ja, als Links in der Antwort. Maritaca führt die Websuche selbst aus und liefert nur den fertigen Text – AutoSEO erfasst die dort zitierten Links als Quellen und gruppiert sie nach Domain.",
    },
    {
      q: "Brauche ich einen Maritaca-API-Key?",
      a: "Nicht in AutoSEO Cloud – dort verwalten Sie keine Anbieter-Keys; die Engines laufen über die Anbieter, die das Codext-Team angebunden hat (fragen Sie uns, welche aktiviert sind). Beim Self-Hosting hinterlegen Sie Ihren eigenen Key von Maritaca AI unter Admin → AI Providers. Ohne Key kann eine KI-Simulation einspringen – gekennzeichnet als „Simulated“ und nur als Tendenz gedacht.",
    },
    {
      q: "Kann ich Sabiá auch außerhalb Brasiliens tracken?",
      a: "Ja. Sie können Prompts für jeden der 143 Märkte von AutoSEO ausführen, auch für Portugal, und Sabiá antwortet in der Sprache der Frage. Da es zuerst auf Portugiesisch ausgerichtet ist, ist Brasilien sein wichtigster Markt.",
    },
    {
      q: "Wie verbessere ich meine Sichtbarkeit in Sabiá?",
      a: "Veröffentlichen Sie klare portugiesische Antworten auf Ihre getrackten Prompts, halten Sie Ihre Seiten crawlbar und sorgen Sie für Erwähnungen auf den Websites, auf die Sabiá bereits verlinkt. AutoSEO zeigt diese Quellen und macht aus den Lücken priorisierte Aufgaben.",
    },
    {
      q: "Kann ich Sabiá mit anderen KI-Engines vergleichen?",
      a: "Ja. Tracken Sie dieselben portugiesischen Prompts in ChatGPT, Gemini, Google AI Overviews und weiteren Engines und vergleichen Sie die Sichtbarkeit je Engine in einem Dashboard.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, was Sabiá über Sie sagt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies PlatformPage;
