import type { PlatformPage } from "../../types";

export default {
  slug: "google-ai-mode",
  name: "Google AI Mode",
  vendor: "Google",
  nav: "AI-Mode-Tracking",
  summary: "Sehen Sie, wann der Google AI Mode Ihre Marke empfiehlt und welche Seiten er verlinkt.",
  meta: {
    title: "Google AI Mode tracken: Sichtbarkeit im KI-Modus",
    description:
      "Tracken Sie, wie der Google AI Mode (KI-Modus) Ihre Marke erwähnt und zitiert – neben Wettbewerbern, je Markt und Sprache. Open Source, über DataForSEO.",
  },
  hero: {
    eyebrow: "Google AI Mode tracken",
    title: "Tracken Sie Ihre Marke im Google AI Mode",
    muted: "– Markt für Markt.",
    subtitle:
      "Im AI Mode – auf Deutsch „KI-Modus“ – beantwortet Google Suchanfragen mit einer vollständigen KI-Antwort und Quelllinks. AutoSEO erfasst die Antworten für Ihre Prompts in den Märkten Ihrer Wahl und zeigt, ob Sie erwähnt werden, wie Sie beschrieben werden, wer neben Ihnen auftaucht und welche Seiten Google verlinkt.",
  },
  demo: {
    prompt: "Wie überwache ich am besten, wie KI-Suchmaschinen meine Marke erwähnen?",
    answer:
      "Nutzen Sie einen AI-Visibility-Tracker wie Acme: Er führt Ihre Prompts nach Zeitplan aus und zeigt, wie oft KI-Engines Ihre Marke erwähnen und zitieren.",
    citations: ["acme.com", "reddit.com", "g2.com"],
  },
  why: {
    eyebrow: "Warum der AI Mode zählt",
    title: "Der AI Mode macht aus der Suche ein Gespräch.",
    muted: "Die Antwort ist die Ergebnisseite.",
    body: "Im AI Mode beantwortet Google eine Anfrage mit einer generierten Antwort und einigen Links statt einer klassischen Ergebnisliste. Die Marken, die in dieser Antwort stehen, sehen Suchende zuerst.",
    points: [
      {
        title: "Gemacht für Vergleiche",
        body: "Der AI Mode ist für komplexe Fragen und Folgefragen gedacht – genau die, bei denen Menschen Optionen vergleichen und nach Empfehlungen fragen.",
      },
      {
        title: "Rankings erzählen nicht alles",
        body: "Eine Top-Position in der klassischen Suche garantiert keine Erwähnung im AI Mode. Sie müssen die Antwort selbst prüfen.",
      },
      {
        title: "Unterschiedlich je Markt",
        body: "Der AI Mode ist nicht überall verfügbar, und die Antworten unterscheiden sich nach Land und Sprache. Tracking je Markt zeigt, wo Sie jeweils stehen.",
      },
    ],
  },
  method: {
    eyebrow: "So trackt AutoSEO den AI Mode",
    title: "AI-Mode-Antworten über DataForSEO –",
    muted: "für jeden Markt, den Sie tracken.",
    body: "AutoSEO ruft AI-Mode-Antworten über DataForSEO ab – mit Markt und Sprache Ihres Projekts – und speichert die vollständige Antwort mit ihren Links. DataForSEO ist das einzige Live-Backend für diese Engine; ohne DataForSEO kann eine KI-Simulation einspringen.",
    items: [
      {
        title: "DataForSEO",
        body: "AI-Mode-Antworten für Ihren Prompt, Markt und Ihre Sprache – mit den verlinkten Quellen sowie Produkten oder Anzeigen in der Antwort. Beim Self-Hosting rechnet DataForSEO direkt mit Ihnen ab; in AutoSEO Cloud wird die Nutzung auf das enthaltene Kontingent angerechnet.",
      },
      {
        title: "KI-Simulation als Rückfallebene",
        body: "Ist kein echtes Backend verfügbar, kann ein KI-Modell mit Websuche anstelle von dem AI Mode antworten. Diese Antworten tragen das Label „Simulated“ und sind als Tendenz gedacht: Ein echtes Backend hat immer Vorrang, und Admins können die Rückfallebene abschalten. Die Simulation nutzt Gemini mit Google-Suche, wenn ein Gemini-Key hinterlegt ist, und enthält nie Produkte oder Anzeigen.",
      },
    ],
  },
  tracked: {
    eyebrow: "Was getrackt wird",
    title: "Alles, was der AI Mode über Ihre Marke sagt",
    items: [
      {
        icon: "radar",
        title: "Markenerwähnungen",
        body: "Ob der AI Mode Ihre Marke bei jedem Prompt nennt – und die Mention Rate im Zeitverlauf.",
      },
      {
        icon: "link",
        title: "Zitate",
        body: "Die Seiten, die der AI Mode als Quellen verlinkt – Ihre, die Ihrer Wettbewerber und Drittseiten.",
      },
      {
        icon: "swords",
        title: "Share of Voice",
        body: "Welche Wettbewerber der AI Mode neben Ihnen nennt und an welcher Position.",
      },
      {
        icon: "heart",
        title: "Sentiment und Darstellung",
        body: "Wie der AI Mode Sie beschreibt: Lob, Kritik und die Eigenschaften, die er immer wieder nennt.",
      },
      {
        icon: "shopping-bag",
        title: "Produkte und Anzeigen",
        body: "Produktlistings und bezahlte Platzierungen, die in AI-Mode-Antworten erscheinen.",
      },
      {
        icon: "map-pin",
        title: "Märkte und Sprachen",
        body: "Dieselbe Anfrage in verschiedenen Ländern und Sprachen – überall dort, wo Google den AI Mode anbietet.",
      },
    ],
  },
  crawlers: {
    eyebrow: "Die Crawler von Google",
    title: "Sorgen Sie dafür, dass Google Ihre Website lesen kann",
    body: "Der AI Mode greift auf den Google-Suchindex zurück – entscheidend ist also der Zugriff für Googlebot. Der Crawlability-Check von AutoSEO prüft Ihre robots.txt und Ihre Seiten für die Tokens von Google, und die Bot-Analytics zeigen, wie oft Googlebot und GoogleOther vorbeikommen.",
    bots: [
      { token: "Googlebot", purpose: "Crawlt und indexiert Seiten für die Google-Suche – auch die Seiten, die der AI Mode verlinkt" },
      {
        token: "Google-Extended",
        purpose: "Kein eigener Crawler: ein robots.txt-Token für die Nutzung in Gemini-Modellen, ohne Einfluss auf die Google-Suche",
      },
      { token: "GoogleOther", purpose: "Allgemeiner Google-Crawler für Forschung und Entwicklung, außerhalb der Suche" },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich meine Marke im Google AI Mode?",
      a: "Hinterlegen Sie die Prompts oder Suchanfragen, die Sie beobachten möchten, wählen Sie Google AI Mode als Engine und legen Sie einen Zeitplan fest. AutoSEO erfasst die Antworten über DataForSEO, speichert sie und zeigt Mention Rate, Citation Rate, Position und Sentiment für Ihre Marke und Ihre Wettbewerber.",
    },
    {
      q: "Was ist der Unterschied zwischen AI Mode und AI Overviews?",
      a: "AI Overviews – auf Deutsch „Übersicht mit KI“ – sind Zusammenfassungen über den regulären Google-Ergebnissen, die bei manchen Suchanfragen erscheinen. Der AI Mode ist ein eigener, dialogorientierter Suchmodus, in dem die KI-Antwort das Hauptergebnis ist. AutoSEO trackt beide als getrennte Engines, sodass Sie sie für dieselben Prompts vergleichen können.",
    },
    {
      q: "Brauche ich DataForSEO, um den AI Mode zu tracken?",
      a: "Nicht in AutoSEO Cloud – dort verwalten Sie keine Zugangsdaten für Anbieter; die Engines laufen über die Anbieter, die das Codext-Team angebunden hat (fragen Sie uns, welche aktiviert sind). Beim Self-Hosting kommen Live-Antworten des AI Mode von DataForSEO: Hinterlegen Sie Ihre Zugangsdaten einmal unter Admin → Data Providers – derselbe Account liefert auch Keyword-Recherche, Rank Tracking und Backlinks. Ohne DataForSEO kann eine KI-Simulation einspringen – gekennzeichnet als „Simulated“ und nur als Tendenz gedacht.",
    },
    {
      q: "In welchen Ländern kann ich den AI Mode tracken?",
      a: "Der AI Mode ist nur dort verfügbar, wo Google ihn anbietet. AutoSEO sendet Markt und Sprache Ihres Projekts mit jeder Anfrage, sodass Sie den AI Mode in jedem Land und jeder Sprache tracken können, in denen er live ist.",
    },
    {
      q: "Wie werden meine Seiten im AI Mode zitiert?",
      a: "Beginnen Sie mit klassischem SEO: Eine Seite muss in der Google-Suche indexiert und für ein Snippet geeignet sein, um im AI Mode als Link zu erscheinen. Beantworten Sie dann die getrackten Fragen klar und sorgen Sie für Erwähnungen auf den Seiten, die der AI Mode bereits verlinkt. AutoSEO zeigt diese Seiten und macht aus den Lücken Aufgaben.",
    },
    {
      q: "Wie oft werden die AI-Mode-Daten aktualisiert?",
      a: "So oft, wie es der Zeitplan Ihres Projekts vorsieht: täglich, wöchentlich oder monatlich. Jeder Lauf wird gespeichert, sodass Sie zwei beliebige Zeiträume vergleichen und sehen können, was sich geändert hat.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, was der Google AI Mode über Sie sagt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies PlatformPage;
