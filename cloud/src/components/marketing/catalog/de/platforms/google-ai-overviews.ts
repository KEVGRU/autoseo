import type { PlatformPage } from "../../types";

export default {
  slug: "google-ai-overviews",
  name: "Google AI Overviews",
  vendor: "Google",
  nav: "AI-Overviews-Tracking",
  summary: "Sehen Sie, wann die AI Overviews von Google Ihre Marke nennen und Ihre Seiten verlinken.",
  meta: {
    title: "Google AI Overviews tracken: Sichtbarkeit messen",
    description:
      "Tracken Sie, ob Google AI Overviews für Ihre Suchanfragen erscheinen, Ihre Marke nennen und Ihre Seiten zitieren – je Markt. Open-Source-Tool, über DataForSEO.",
  },
  hero: {
    eyebrow: "Google AI Overviews tracken",
    title: "Tracken Sie Ihre Marke in den Google AI Overviews",
    muted: "– über dem ersten Ergebnis.",
    subtitle:
      "AI Overviews – auf Deutsch „Übersicht mit KI“ – stehen bei vielen Suchanfragen über den Google-Ergebnissen. AutoSEO prüft Ihre Suchanfragen in den Märkten Ihrer Wahl, speichert jede AI Overview und zeigt, ob eine erscheint, ob sie Sie nennt und welche Seiten sie verlinkt.",
  },
  demo: {
    prompt: "open source tool ki sichtbarkeit tracken",
    answer:
      "Open-Source-Tracker für KI-Sichtbarkeit wie Acme führen eine feste Auswahl an Prompts in KI-Engines aus und zeigen, wie oft eine Marke erwähnt und zitiert wird.",
    citations: ["acme.com", "github.com", "reddit.com"],
  },
  why: {
    eyebrow: "Warum AI Overviews zählen",
    title: "AI Overviews stehen vor dem ersten Ergebnis.",
    muted: "Seien Sie darin – nicht darunter.",
    body: "Bei vielen Suchanfragen zeigt Google eine KI-generierte Übersicht über den organischen Ergebnissen, mit einigen verlinkten Quellen. Fehlen Ihre Marke oder Seite darin, bekommen Suchende ihre Antwort, ohne je bei Ihrem Eintrag anzukommen.",
    points: [
      {
        title: "Rankings sind nicht alles",
        body: "Eine Seite kann gut ranken und trotzdem in der AI Overview darüber fehlen. Sie müssen beides tracken.",
      },
      {
        title: "Nicht jede Anfrage löst eine aus",
        body: "Google zeigt AI Overviews bei manchen Suchanfragen und bei anderen nicht – und das ändert sich. AutoSEO hält fest, wann eine Übersicht erscheint und wann nicht.",
      },
      {
        title: "Quellen sind der Hebel",
        body: "AI Overviews verlinken die Seiten, auf die sie sich stützen. Welche Google auswählt, zeigt Ihnen, wo Sie ranken oder erwähnt werden müssen.",
      },
    ],
  },
  method: {
    eyebrow: "So trackt AutoSEO AI Overviews",
    title: "AI Overviews aus echten Suchergebnissen –",
    muted: "über DataForSEO.",
    body: "AutoSEO ruft die Google-Ergebnisseite für jede Suchanfrage über DataForSEO ab – mit Ihrem Markt und Ihrer Sprache – und lädt die AI Overview, wenn Google eine anzeigt. DataForSEO ist das einzige Live-Backend für diese Engine; ohne DataForSEO kann eine KI-Simulation einspringen.",
    items: [
      {
        title: "DataForSEO",
        body: "Google-Ergebnisse (Desktop) mit der AI Overview, ihren Links sowie Shopping-Ergebnissen oder Anzeigen auf der Seite. Beim Self-Hosting rechnet DataForSEO direkt mit Ihnen ab; in AutoSEO Cloud wird die Nutzung auf das enthaltene Kontingent angerechnet.",
      },
      {
        title: "KI-Simulation als Rückfallebene",
        body: "Ist kein echtes Backend verfügbar, kann ein KI-Modell mit Websuche anstelle von den AI Overviews antworten. Diese Antworten tragen das Label „Simulated“ und sind als Tendenz gedacht: Ein echtes Backend hat immer Vorrang, und Admins können die Rückfallebene abschalten. Die Simulation nutzt Gemini mit Google-Suche, wenn ein Gemini-Key hinterlegt ist, schätzt, ob überhaupt eine Übersicht erscheinen würde, und enthält nie Shopping-Ergebnisse oder Anzeigen.",
      },
    ],
  },
  tracked: {
    eyebrow: "Was getrackt wird",
    title: "Alles, was AI Overviews über Ihre Marke sagen",
    items: [
      {
        icon: "eye",
        title: "Präsenz der AI Overview",
        body: "Ob Google für Ihre Suchanfrage eine AI Overview zeigt – je Markt und Lauf.",
      },
      {
        icon: "radar",
        title: "Markenerwähnungen",
        body: "Ob die Übersicht Ihre Marke nennt – und die Mention Rate im Zeitverlauf.",
      },
      {
        icon: "link",
        title: "Zitierte Seiten",
        body: "Die Seiten, die die AI Overview verlinkt – Ihre, die Ihrer Wettbewerber und Drittseiten.",
      },
      {
        icon: "swords",
        title: "Share of Voice",
        body: "Welche Wettbewerber die Übersicht neben Ihnen nennt und in welcher Reihenfolge.",
      },
      {
        icon: "shopping-bag",
        title: "Shopping-Ergebnisse und Anzeigen",
        body: "Produktlistings und bezahlte Platzierungen in und rund um die AI Overview.",
      },
      {
        icon: "map-pin",
        title: "Märkte und Sprachen",
        body: "Dieselbe Suchanfrage in verschiedenen Ländern und Sprachen, direkt nebeneinander verglichen.",
      },
    ],
  },
  crawlers: {
    eyebrow: "Die Crawler von Google",
    title: "Sorgen Sie dafür, dass Google Ihre Website lesen kann",
    body: "AI Overviews entstehen aus dem Google-Suchindex – entscheidend ist also der Zugriff für Googlebot. Der Crawlability-Check von AutoSEO prüft Ihre robots.txt und Ihre Seiten für die Tokens von Google, und die Bot-Analytics zeigen, wie oft Googlebot und GoogleOther vorbeikommen.",
    bots: [
      { token: "Googlebot", purpose: "Crawlt und indexiert Seiten für die Google-Suche – auch die Seiten, die AI Overviews verlinken" },
      {
        token: "Google-Extended",
        purpose: "Kein eigener Crawler: ein robots.txt-Token für die Nutzung in Gemini-Modellen, ohne Einfluss auf die Google-Suche",
      },
      { token: "GoogleOther", purpose: "Allgemeiner Google-Crawler für Forschung und Entwicklung, außerhalb der Suche" },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich Google AI Overviews für meine Marke?",
      a: "Hinterlegen Sie die Suchanfragen, die Sie beobachten möchten, wählen Sie Google AI Overviews als Engine und legen Sie einen Zeitplan fest. AutoSEO ruft die Google-Ergebnisse über DataForSEO ab, speichert jede AI Overview und zeigt, ob sie erschienen ist, ob sie Sie erwähnt hat und welche Seiten sie zitiert hat.",
    },
    {
      q: "Warum gibt es bei manchen Suchanfragen keine AI Overview?",
      a: "Google zeigt AI Overviews nur bei manchen Suchanfragen, und das kann sich mit der Zeit und je nach Markt ändern. AutoSEO speichert auch Läufe ohne Übersicht, sodass Sie sehen, wie oft bei jeder Suchanfrage eine erscheint.",
    },
    {
      q: "Wie komme ich mit meiner Seite in die Google AI Overviews?",
      a: "Eine Seite muss in der Google-Suche indexiert und für ein Snippet geeignet sein, um in einer AI Overview verlinkt zu werden. Beantworten Sie darüber hinaus die Suchanfrage klar und sorgen Sie für Erwähnungen auf den Seiten, die Google bereits verlinkt. AutoSEO zeigt diese Seiten und macht aus den Lücken priorisierte Aufgaben.",
    },
    {
      q: "Entfernt mich das Blockieren von Google-Extended aus den AI Overviews?",
      a: "Nein. Google-Extended steuert, ob Google Ihre Inhalte für Gemini-Modelle nutzen darf, und hat keinen Einfluss auf die Google-Suche – AI Overviews sind Teil der Suche. Für AI Overviews zählt der Zugriff für Googlebot.",
    },
    {
      q: "Brauche ich DataForSEO, um AI Overviews zu tracken?",
      a: "Nicht in AutoSEO Cloud – dort verwalten Sie keine Zugangsdaten für Anbieter; die Engines laufen über die Anbieter, die das Codext-Team angebunden hat (fragen Sie uns, welche aktiviert sind). Beim Self-Hosting kommen Live-Ergebnisse der AI Overviews aus den Google-Ergebnissen von DataForSEO: Hinterlegen Sie Ihre Zugangsdaten einmal unter Admin → Data Providers – derselbe Account liefert auch Keyword-Recherche, Rank Tracking und Backlinks. Ohne DataForSEO kann eine KI-Simulation einspringen – gekennzeichnet als „Simulated“ und nur als Tendenz gedacht.",
    },
    {
      q: "Kann ich AI Overviews mit meinen klassischen Rankings vergleichen?",
      a: "Ja. AutoSEO enthält Rank Tracking neben AI Visibility, sodass Sie die organische Position einer Suchanfrage und ihre AI Overview in derselben App verfolgen können.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, was AI Overviews über Sie sagen",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies PlatformPage;
