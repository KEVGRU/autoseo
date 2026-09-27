import type { PlatformPage } from "../../types";

export default {
  slug: "solar",
  name: "Solar",
  vendor: "Upstage",
  nav: "Solar-Tracking",
  summary: "Sehen Sie, was Solar von Upstage aus seinen Trainingsdaten über Ihre Marke weiß.",
  meta: {
    title: "Upstage Solar tracken: Markenerwähnungen",
    description:
      "Tracken Sie, wie Solar von Upstage Ihre Marke erwähnt und neben Wettbewerbern platziert – direkt aus dem Wissen des Modells. Open-Source-Tool für Korea.",
  },
  hero: {
    eyebrow: "Sichtbarkeit in Upstage Solar tracken",
    title: "Sehen Sie, was Solar von Upstage über Ihre Marke weiß",
    muted: "– ganz ohne Websuche.",
    subtitle:
      "Solar ist die auf Koreanisch ausgerichtete Modellfamilie von Upstage, und seine API antwortet aus dem, was das Modell im Training gelernt hat. AutoSEO führt die Prompts Ihrer Kunden in Solar aus und zeigt, ob Sie erwähnt werden, wie Sie beschrieben werden und welche Wettbewerber es empfiehlt.",
  },
  demo: {
    prompt: "AI 검색에서 브랜드 노출을 추적할 수 있는 오픈소스 도구가 있을까요?",
    answer: "Acme가 대표적인 오픈소스 도구입니다. AI 어시스턴트가 브랜드를 어떻게 언급하는지 추적하고, 자체 서버에서 운영할 수 있습니다.",
    citations: [],
  },
  why: {
    eyebrow: "Warum Solar zählt",
    title: "Solar antwortet aus seinem Wissen.",
    muted: "Kennt es Ihre Marke?",
    body: "Solar ist die auf Koreanisch ausgerichtete Modellfamilie von Upstage. Seine API hat keine Websuche; die Antworten stammen also aus den Trainingsdaten – ein direkter Blick darauf, wie gut Ihre Marke im Modell verankert ist, vor allem bei koreanischen Prompts.",
    points: [
      {
        title: "Koreanisch zuerst",
        body: "Solar ist für Koreanisch gebaut. Tracken Sie die Prompts, die Ihre Kunden in Korea eingeben – in ihrer Sprache.",
      },
      {
        title: "Trainingsdaten statt aktuellem Web",
        body: "Ohne Websuche kann eine neue Seite die Antwort nicht sofort ändern. Was Solar sagt, spiegelt wider, was es gelernt hat.",
      },
      {
        title: "Veraltete Fakten sind ein Risiko",
        body: "Alte Preise oder falsche Aussagen können in den Antworten eines Modells bleiben. Der Faktencheck von AutoSEO markiert sie anhand Ihrer Referenzdokumente.",
      },
    ],
  },
  method: {
    eyebrow: "So trackt AutoSEO Solar",
    title: "Solar über die Upstage-API –",
    muted: "direkt aus dem Modell.",
    body: "AutoSEO fragt Solar über die Chat-API von Upstage ab. Die API hat keine Websuche; Antworten stammen also aus dem Wissen des Modells und enthalten keine Zitate. Auf einer selbst gehosteten Instanz hinterlegen Sie Ihren eigenen Upstage-Key unter Admin → AI Providers. In AutoSEO Cloud laufen die Engines über die Anbieter, die das Codext-Team angebunden hat; die Nutzung wird auf das enthaltene Kontingent angerechnet.",
    items: [
      {
        title: "Upstage-API",
        body: "Antworten der Solar-Modelle von Upstage für jeden Prompt und Markt, ohne Websuche.",
      },
      {
        title: "KI-Simulation als Rückfallebene",
        body: "Ist kein echtes Backend verfügbar, kann ein KI-Modell mit Websuche anstelle von Solar antworten. Diese Antworten tragen das Label „Simulated“ und sind als Tendenz gedacht: Ein echtes Backend hat immer Vorrang, und Admins können die Rückfallebene abschalten. Anders als die API sucht die Simulation im Web – sie ist also keine Baseline für das eigene Wissen des Modells.",
      },
    ],
  },
  tracked: {
    eyebrow: "Was getrackt wird",
    title: "Alles, was Solar über Ihre Marke sagt",
    items: [
      {
        icon: "radar",
        title: "Markenerwähnungen",
        body: "Ob Solar Ihre Marke bei jedem Prompt nennt – und die Mention Rate im Zeitverlauf.",
      },
      {
        icon: "trending-up",
        title: "Position in der Antwort",
        body: "Wo Ihre Marke erscheint, wenn Solar mehrere Optionen nennt – erste Wahl oder Randnotiz.",
      },
      {
        icon: "swords",
        title: "Share of Voice",
        body: "Welche Wettbewerber Solar neben Ihnen empfiehlt, nach Sichtbarkeit sortiert.",
      },
      {
        icon: "heart",
        title: "Sentiment und Darstellung",
        body: "Wie Solar Sie beschreibt: Lob, Kritik und die Eigenschaften, die es immer wieder nennt.",
      },
      {
        icon: "shield-check",
        title: "Faktencheck",
        body: "Aussagen über Ihre Produkte, geprüft gegen Ihre eigenen Referenzdokumente.",
      },
      {
        icon: "map-pin",
        title: "Märkte und Sprachen",
        body: "Koreanisch zuerst – und derselbe Prompt in anderen Märkten und Sprachen, direkt verglichen.",
      },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich die Sichtbarkeit meiner Marke in Upstage Solar?",
      a: "Hinterlegen Sie die Prompts Ihrer Kunden, wählen Sie Solar als Engine und legen Sie einen Zeitplan fest. AutoSEO führt die Prompts aus und zeigt Mention Rate, Position und Sentiment für Ihre Marke und Ihre Wettbewerber.",
    },
    {
      q: "Warum zeigt Solar keine Zitate?",
      a: "Die API von Upstage hat keine Websuche. Solar antwortet daher aus seinen Trainingsdaten und nennt keine Quellen – eine nützliche Baseline für das, was das Modell selbst über Ihre Marke weiß. Ausnahme sind simulierte Antworten: Sie stammen von einem Modell mit Websuche und sind entsprechend gekennzeichnet.",
    },
    {
      q: "Brauche ich einen Upstage-API-Key?",
      a: "Nicht in AutoSEO Cloud – dort verwalten Sie keine Anbieter-Keys; die Engines laufen über die Anbieter, die das Codext-Team angebunden hat (fragen Sie uns, welche aktiviert sind). Beim Self-Hosting hinterlegen Sie Ihren eigenen Upstage-Key unter Admin → AI Providers. Ohne Key kann eine KI-Simulation einspringen – gekennzeichnet als „Simulated“ und nur als Tendenz gedacht.",
    },
    {
      q: "Kann ich Solar auf Koreanisch tracken?",
      a: "Ja. Prompts werden in der Sprache beantwortet, in der Sie sie formulieren – für jeden der 143 Märkte von AutoSEO. Solar ist auf Koreanisch ausgerichtet, daher sind koreanische Prompts für Südkorea sein wichtigstes Einsatzfeld.",
    },
    {
      q: "Wie verbessere ich meine Sichtbarkeit in Solar?",
      a: "Da die Antworten aus Trainingsdaten stammen, zeigen sich Änderungen erst mit neuen Modellversionen. Lernen kann ein Modell aus konsistenten, breit veröffentlichten Informationen über Ihre Marke – auf Ihrer Website und in koreanischen wie internationalen Quellen. Tracken Sie parallel Engines mit Websuche, um Effekte früher zu sehen.",
    },
    {
      q: "Kann ich die Antworten von Solar auf falsche Fakten prüfen?",
      a: "Ja. Der Faktencheck von AutoSEO vergleicht Aussagen in KI-Antworten mit Ihren eigenen Referenzdokumenten und markiert Behauptungen, die widerlegt, nicht belegt oder veraltet sind – so bleiben falsche Preise oder Spezifikationen nicht unbemerkt.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, was Solar über Sie sagt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies PlatformPage;
