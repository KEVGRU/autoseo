import type { SolutionPage } from "../../types";

export default {
  slug: "content-teams",
  nav: "Für Content-Teams",
  summary: "Content planen, schreiben und verbessern, den KI-Engines zitieren.",
  meta: {
    title: "Content für die KI-Suche: Tool für Content-Teams",
    description:
      "Content für die KI-Suche planen: Prompt-Recherche, Zitat-Lücken, Fan-out-Suchen und AEO-bewertete Briefings und Entwürfe für WordPress und Webflow. Open Source.",
  },
  hero: {
    eyebrow: "AutoSEO für Content-Teams",
    title: "Content, den die KI-Suche zitiert.",
    muted: "Geplant auf Basis echter Antworten.",
    subtitle:
      "Sehen Sie, welche Fragen Ihre Zielgruppe KI-Assistenten stellt, welche Seiten Engines statt Ihrer zitieren und welche Suchen sie im Hintergrund ausführen – und schreiben Sie dann Briefings und Entwürfe, die für KI-Antworten bewertet sind und direkt in Ihr CMS gehen.",
  },
  visual: "content",
  challenges: {
    eyebrow: "Die Herausforderung",
    title: "Content-Pläne basieren auf Keywords.",
    muted: "KI-Antworten funktionieren anders.",
    items: [
      {
        title: "Fragen statt Keywords",
        body: "Menschen stellen KI-Assistenten ganze Fragen mit Kontext. Keyword-Tools zeigen nicht, welche dieser Fragen für Ihre Marke zählen.",
      },
      {
        title: "Gute Seiten, die nie zitiert werden",
        body: "Engines zitieren Seiten, die direkt antworten – mit Fakten und klarer Struktur. Viele Artikel verstecken die Antwort irgendwo in der Mitte.",
      },
      {
        title: "Kein Feedback",
        body: "Ist ein Artikel online, wissen die meisten Teams nicht, ob KI-Engines ihn zitieren – oder welche Wettbewerberseite sie weiterhin bevorzugen.",
      },
    ],
  },
  workflow: {
    eyebrow: "So nutzen Content-Teams AutoSEO",
    title: "Von der Frage zur zitierten Seite,",
    muted: "ein Workflow.",
    items: [
      {
        icon: "lightbulb",
        title: "Die Fragen finden, die sich lohnen",
        body: "Prompt-Recherche nach Thema, Funnel-Stufe und Persona zeigt, was Ihre Zielgruppe KI fragt und wie groß die Nachfrage je Thema ist.",
        feature: "prompt-research",
      },
      {
        icon: "link",
        title: "Sehen, welche Seiten stattdessen zitiert werden",
        body: "Für jeden Prompt die URLs, die Engines zitieren, ihr Content-Typ und ob sie einem Wettbewerber oder einem Dritten gehören.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "git-fork",
        title: "Die Unterfragen abdecken",
        body: "Query Fan-outs zeigen die Suchen, die Engines vor der Antwort ausführen – die Gliederung der Seite, die Sie schreiben sollten.",
        feature: "query-fanout-analysis",
      },
      {
        icon: "pen",
        title: "Briefings und Entwürfe schreiben",
        body: "Antwortartikel, Ratgeber, Vergleiche, Anleitungen und FAQ-Seiten – bewertet nach sechs AEO-Kriterien und an WordPress oder Webflow übergeben.",
        feature: "ai-content-optimization",
      },
      {
        icon: "search",
        title: "Jedes Thema mit Keyword-Daten absichern",
        body: "Suchvolumen, Schwierigkeit und Suchintention der Keywords hinter jedem Thema – in gespeicherten Listen, die Sie taggen und exportieren.",
        feature: "keyword-research",
      },
      {
        icon: "chart",
        title: "Messen, was danach passiert",
        body: "Sehen Sie über GA4, Matomo oder Piwik PRO, auf welche Seiten KI-Plattformen Besucher schicken und was daraus wird.",
        feature: "ai-traffic-analytics",
      },
    ],
  },
  prompts: {
    eyebrow: "Beispiel-Prompts",
    title: "Fragen, für die Content-Teams Seiten bauen",
    items: [
      "Wie schreibe ich ein Briefing für einen Website-Relaunch?",
      "Was ist der Unterschied zwischen einem CRM und einem Marketing-Automation-Tool?",
      "Die besten Tools für einen Redaktionsplan",
      "Was kostet es, einen Onlineshop aufzubauen?",
      "Schritt-für-Schritt-Anleitung: Blog auf ein neues CMS umziehen",
      "Passt Acme zu kleinen Marketingteams?",
    ],
  },
  outcomes: {
    eyebrow: "Warum Content-Teams AutoSEO wählen",
    title: "Content, der zitiert wird –",
    muted: "nicht nur geklickt.",
    items: [
      {
        title: "Briefings auf Basis echter Antworten",
        body: "Jedes Briefing startet bei getrackten Prompts, zitierten Quellen und Fan-out-Suchen statt bei Vermutungen.",
      },
      {
        title: "Ein klarer Qualitätsmaßstab",
        body: "Der AEO-Score bewertet Extrahierbarkeit, Faktendichte, Struktur, Schema, Tiefe und Metadaten und aktualisiert sich live beim Schreiben.",
      },
      {
        title: "Der Beleg, dass es wirkt",
        body: "Tracking und Analytics zeigen, ob Engines Ihre Seiten nach der Veröffentlichung häufiger erwähnen und zitieren.",
      },
    ],
  },
  faq: [
    {
      q: "Wie optimiere ich Content für die KI-Suche?",
      a: "Beantworten Sie die Frage direkt am Anfang, belegen Sie sie mit konkreten Fakten und Quellen, nutzen Sie klare Überschriften, Listen und strukturierte Daten und halten Sie die Seite für KI-Bots crawlbar. AutoSEO bewertet Entwürfe und bestehende Seiten nach genau diesen Faktoren und zeigt, welche Prompts und Quellen Sie ansteuern sollten.",
    },
    {
      q: "Was ist ein AEO-Score?",
      a: "Der AEO-Score (Answer Engine Optimization) von AutoSEO bewertet eine Seite von 0 bis 100 anhand von sechs Kriterien: Extrahierbarkeit, Faktendichte, Struktur, Schema-Markup, Tiefe und Metadaten. Er aktualisiert sich live im Editor und liefert konkrete Vorschläge je Kriterium.",
    },
    {
      q: "Welche Content-Typen kann AutoSEO entwerfen?",
      a: "Antwortartikel, umfassende Ratgeber, Vergleichsseiten, Bestenlisten, Anleitungen, FAQ-Seiten sowie Produkt- und Landingpages. Die Entwürfe entstehen aus Ihren Prompts, den zitierten Quellen und Ihren Markeninformationen, und Sie bearbeiten sie vor der Veröffentlichung.",
    },
    {
      q: "Kann ich bereits veröffentlichte Seiten optimieren?",
      a: "Ja. Geben Sie eine URL ein, optional mit Ziel-Keyword und der Frage, die die Seite beantworten soll. AutoSEO bewertet die Seite und listet konkrete Verbesserungen auf – oder entwirft eine optimierte Neufassung.",
    },
    {
      q: "Kann ich direkt in mein CMS veröffentlichen?",
      a: "Ja. Verbinden Sie WordPress, wo Inhalte als Entwurf ankommen, oder Webflow- bzw. Framer-CMS-Collections und veröffentlichen Sie direkt aus dem Editor. Framer-Entwürfe können Sie zusätzlich als CMS-fertige CSV-Datei exportieren und in einem Schritt importieren.",
    },
    {
      q: "Nutzt die Content-Erstellung mein eigenes KI-Abo?",
      a: "Auf Wunsch ja. Verbinden Sie Ihr eigenes Claude Code oder Codex CLI über einen schlanken lokalen Agenten – dann laufen Entwürfe über das Abo, das Sie ohnehin bezahlen, in AutoSEO Cloud wie beim Self-Hosting. Die Cloud enthält zusätzlich KI- und Datennutzung im Wert von 10\u00a0$ pro Monat; beim Self-Hosting können Sie stattdessen eigene API-Keys hinterlegen.",
    },
  ],
  related: ["geo-teams", "pr-brand-teams", "agencies"],
  cta: {
    title: "Planen Sie Ihren nächsten Artikel auf Basis echter KI-Antworten",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies SolutionPage;
