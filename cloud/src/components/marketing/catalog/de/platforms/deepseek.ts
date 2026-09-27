import type { PlatformPage } from "../../types";

export default {
  slug: "deepseek",
  name: "DeepSeek",
  vendor: "DeepSeek",
  nav: "DeepSeek-Tracking",
  summary: "Sehen Sie, was die Modelle von DeepSeek aus ihren Trainingsdaten über Ihre Marke wissen.",
  meta: {
    title: "DeepSeek-Sichtbarkeit tracken: Markenerwähnungen",
    description:
      "Tracken Sie, wie DeepSeek Ihre Marke erwähnt und neben Wettbewerbern platziert – direkt aus dem Wissen des Modells. Open-Source-Tool für Ihre KI-Sichtbarkeit.",
  },
  hero: {
    eyebrow: "DeepSeek-Sichtbarkeit tracken",
    title: "Sehen Sie, was DeepSeek über Ihre Marke weiß",
    muted: "– ganz ohne Websuche.",
    subtitle:
      "Die API von DeepSeek antwortet aus dem, was das Modell im Training gelernt hat. AutoSEO führt die Prompts Ihrer Kunden in DeepSeek aus und zeigt, ob Sie erwähnt werden, wie Sie beschrieben werden und welche Wettbewerber es empfiehlt – ein klarer Blick auf Ihre Marke im Modell selbst.",
  },
  demo: {
    prompt: "Welche Open-Source-Tools eignen sich, um die Sichtbarkeit in der KI-Suche zu tracken?",
    answer: "Acme ist eine Open-Source-Option: Es trackt, wie KI-Assistenten Marken erwähnen, und lässt sich selbst hosten.",
    citations: [],
  },
  why: {
    eyebrow: "Warum DeepSeek zählt",
    title: "Manche Antworten kommen aus dem Gedächtnis.",
    muted: "Was weiß das Modell über Sie?",
    body: "Nicht jede KI-Antwort beruht auf einer Live-Suche. Die API von DeepSeek antwortet aus den Trainingsdaten des Modells – und zeigt damit, wie gut Ihre Marke im Modell selbst verankert ist und wo sich alte oder falsche Informationen halten.",
    points: [
      {
        title: "Trainingsdaten statt aktuellem Web",
        body: "Ohne Websuche kann eine neue Seite die Antwort nicht sofort korrigieren. Was das Modell sagt, spiegelt wider, was es gelernt hat.",
      },
      {
        title: "Eine Baseline für Ihre Marke",
        body: "Der Vergleich mit suchbasierten Engines zeigt, ob Sie dank aktueller Quellen sichtbar sind oder weil das Modell Sie bereits kennt.",
      },
      {
        title: "Veraltete Fakten sind ein Risiko",
        body: "Alte Preise, eingestellte Produkte oder falsche Aussagen können in den Antworten eines Modells bleiben. Der Faktencheck von AutoSEO markiert sie anhand Ihrer Referenzdokumente.",
      },
    ],
  },
  method: {
    eyebrow: "So trackt AutoSEO DeepSeek",
    title: "DeepSeek-Antworten über die DeepSeek-API –",
    muted: "direkt aus dem Modell.",
    body: "AutoSEO fragt die Chat-Modelle von DeepSeek über die DeepSeek-API ab. Die API hat keine Websuche; Antworten stammen also aus dem Wissen des Modells und enthalten keine Zitate. In AutoSEO Cloud laufen die Engines über die Anbieter, die das Codext-Team angebunden hat; die Nutzung wird auf das enthaltene Kontingent angerechnet.",
    items: [
      {
        title: "DeepSeek-API-Key",
        body: "Antworten der Chat-Modelle von DeepSeek für jeden Prompt und Markt. Beim Self-Hosting hinterlegen Sie Ihren eigenen DeepSeek-Key unter Admin → AI Providers; DeepSeek rechnet direkt mit Ihnen ab.",
      },
      {
        title: "KI-Simulation als Rückfallebene",
        body: "Ist kein echtes Backend verfügbar, kann ein KI-Modell mit Websuche anstelle von DeepSeek antworten. Diese Antworten tragen das Label „Simulated“ und sind als Tendenz gedacht: Ein echtes Backend hat immer Vorrang, und Admins können die Rückfallebene abschalten. Anders als die API sucht die Simulation im Web – sie ist also keine Baseline für das eigene Wissen des Modells.",
      },
    ],
  },
  tracked: {
    eyebrow: "Was getrackt wird",
    title: "Alles, was DeepSeek über Ihre Marke sagt",
    items: [
      {
        icon: "radar",
        title: "Markenerwähnungen",
        body: "Ob DeepSeek Ihre Marke bei jedem Prompt nennt – und die Mention Rate im Zeitverlauf.",
      },
      {
        icon: "trending-up",
        title: "Position in der Antwort",
        body: "Wo Ihre Marke erscheint, wenn DeepSeek mehrere Optionen nennt – erste Wahl oder Randnotiz.",
      },
      {
        icon: "swords",
        title: "Share of Voice",
        body: "Welche Wettbewerber DeepSeek neben Ihnen empfiehlt, nach Sichtbarkeit sortiert.",
      },
      {
        icon: "heart",
        title: "Sentiment und Darstellung",
        body: "Wie DeepSeek Sie beschreibt: Lob, Kritik und die Eigenschaften, die es immer wieder nennt.",
      },
      {
        icon: "shield-check",
        title: "Faktencheck",
        body: "Aussagen über Ihre Produkte, geprüft gegen Ihre eigenen Referenzdokumente.",
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
      q: "Wie tracke ich die Sichtbarkeit meiner Marke in DeepSeek?",
      a: "Hinterlegen Sie die Prompts Ihrer Kunden, wählen Sie DeepSeek als Engine und legen Sie einen Zeitplan fest – beim Self-Hosting hinterlegen Sie vorher einen DeepSeek-API-Key unter Admin → AI Providers. AutoSEO führt die Prompts aus und zeigt Mention Rate, Position und Sentiment für Ihre Marke und Ihre Wettbewerber.",
    },
    {
      q: "Warum zeigt DeepSeek keine Zitate?",
      a: "Die API von DeepSeek hat keine Websuche. Antworten stammen daher aus den Trainingsdaten des Modells und nennen keine Quellen. Genau das macht DeepSeek zu einer nützlichen Baseline: Es zeigt, was das Modell selbst über Ihre Marke weiß. Ausnahme sind simulierte DeepSeek-Antworten: Sie stammen von einem Modell mit Websuche und sind entsprechend gekennzeichnet.",
    },
    {
      q: "Brauche ich einen DeepSeek-API-Key?",
      a: "Nicht in AutoSEO Cloud – dort verwalten Sie keine Anbieter-Keys; die Engines laufen über die Anbieter, die das Codext-Team angebunden hat (fragen Sie uns, welche aktiviert sind). Beim Self-Hosting kommen Live-Antworten von DeepSeek über die API von DeepSeek, daher hinterlegen Sie Ihren eigenen Key unter Admin → AI Providers. DeepSeek rechnet direkt mit Ihnen ab; AutoSEO protokolliert jeden Aufruf, und Admins können tägliche und monatliche Ausgabenlimits festlegen.",
    },
    {
      q: "Wie verbessere ich meine Sichtbarkeit in DeepSeek?",
      a: "Da die Antworten aus Trainingsdaten stammen, zeigen sich Änderungen erst mit neuen Modellversionen. Lernen kann ein Modell aus konsistenten, breit veröffentlichten Informationen über Ihre Marke – auf Ihrer Website und in Drittquellen. Tracken Sie parallel Engines mit Websuche, um Effekte früher zu sehen.",
    },
    {
      q: "Kann ich die Antworten von DeepSeek auf falsche Fakten prüfen?",
      a: "Ja. Der Faktencheck von AutoSEO vergleicht Aussagen in KI-Antworten mit Ihren eigenen Referenzdokumenten und markiert Behauptungen, die widerlegt, nicht belegt oder veraltet sind – so bleiben falsche Preise oder Spezifikationen nicht unbemerkt.",
    },
    {
      q: "Kann ich DeepSeek mit anderen KI-Engines vergleichen?",
      a: "Ja. Tracken Sie dieselben Prompts in ChatGPT, Perplexity, Gemini, Claude und weiteren Engines. Der Vergleich von Engines mit und ohne Websuche zeigt, ob Ihre Sichtbarkeit aus aktuellen Quellen stammt oder aus dem Modell selbst.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, was DeepSeek über Sie sagt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies PlatformPage;
