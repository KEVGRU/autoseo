import type { SolutionPage } from "../../types";

export default {
  slug: "customer-experience",
  nav: "Für CX-Teams",
  summary: "Sehen, wie KI Ihren Support, Bewertungen und Richtlinien beschreibt – und Fehler beheben.",
  meta: {
    title: "KI-Reputationsmonitoring für CX-Teams",
    description:
      "KI-Reputationsmonitoring für CX-Teams: Wie beschreiben ChatGPT, Gemini & Co. Ihren Support und Ihre Richtlinien? Finden Sie falsche Antworten per Faktencheck.",
  },
  hero: {
    eyebrow: "AutoSEO für Customer-Experience-Teams",
    title: "Wissen, was KI Ihren Kunden erzählt.",
    muted: "KI-Reputationsmonitoring für CX-Teams.",
    subtitle:
      "Kunden fragen KI-Assistenten nach Ihrem Support, Ihren Rückgabebedingungen und Ihrer Zuverlässigkeit, bevor sie Sie kontaktieren. AutoSEO trackt diese Antworten in 16 Engines, extrahiert Lob und Kritik und prüft Aussagen gegen Ihre eigene Dokumentation.",
  },
  visual: "factcheck",
  challenges: {
    eyebrow: "Die Herausforderung",
    title: "Kunden fragen die KI, bevor sie Sie fragen.",
    muted: "Die Antwort prägt die Erwartung.",
    items: [
      {
        title: "Falsche Antworten erzeugen Tickets",
        body: "Nennt ein Assistent eine Richtlinie, einen Preis oder eine Funktion falsch, kommen Kunden mit falschen Erwartungen – und Ihr Team muss sie korrigieren.",
      },
      {
        title: "Alte Beschwerden tauchen wieder auf",
        body: "KI-Engines fassen Bewertungen und Forenbeiträge zusammen. Ein Problem, das Sie letztes Jahr behoben haben, kann heute noch das Bild prägen.",
      },
      {
        title: "Niemand ist für die KI-Antwort zuständig",
        body: "Der Support verfolgt Tickets, das Marketing Rankings. Was KI über Ihre Servicequalität sagt, fällt zwischen die Teams.",
      },
    ],
  },
  workflow: {
    eyebrow: "So nutzen CX-Teams AutoSEO",
    title: "Von der Kundenfrage",
    muted: "zur korrigierten Antwort.",
    items: [
      {
        icon: "heart",
        title: "Sehen, was KI lobt und kritisiert",
        body: "Aussagen über Ihren Support, Ihre Preise und Ihre Zuverlässigkeit, nach Themen gruppiert und mit Wettbewerbern verglichen.",
        feature: "ai-brand-sentiment",
      },
      {
        icon: "shield-check",
        title: "Antworten gegen Ihre Dokumente prüfen",
        body: "Hinterlegen Sie Referenzdokumente als PDF, Text oder URL – der Faktencheck markiert widerlegte, unbelegte oder veraltete Aussagen je Engine.",
        feature: "ai-fact-check",
      },
      {
        icon: "message-square",
        title: "Die Threads hinter den Antworten finden",
        body: "Die Foren, Bewertungsseiten und Community-Beiträge, die Engines zitieren, wenn sie Ihren Service beschreiben.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "radar",
        title: "Supportfragen in jeder Engine tracken",
        body: "Beobachten Sie, wie 16 KI-Engines die Fragen beantworten, die Kunden vor dem Kontakt stellen – in jedem Markt, den Sie bedienen.",
        feature: "ai-visibility-tracking",
      },
      {
        icon: "file-text",
        title: "Klare Antworten veröffentlichen",
        body: "Machen Sie aus wiederkehrenden Fragen FAQ- und Anleitungsseiten, bewertet für KI-Antworten und an WordPress oder Webflow übergeben.",
        feature: "ai-content-optimization",
      },
      {
        icon: "list-checks",
        title: "Korrekturen an das richtige Team geben",
        body: "Wiederkehrende Kritik und falsche Aussagen werden zu belegten Aufgaben, synchronisiert mit Jira, Linear, Asana oder ClickUp.",
        feature: "ai-seo-tasks",
      },
    ],
  },
  prompts: {
    eyebrow: "Beispiel-Prompts",
    title: "Fragen, die Kunden der KI über Sie stellen",
    items: [
      "Hat Acme einen guten Kundenservice?",
      "Wie kündige ich mein Acme-Abo?",
      "Wie sind die Rückgabebedingungen bei Acme?",
      "Ist Acme zuverlässig oder gibt es häufige Probleme?",
      "Wie erreiche ich den Acme-Support?",
      "Worüber beschweren sich Kunden bei Acme am häufigsten?",
      "Welcher Anbieter hat den besten Kundensupport für kleine Unternehmen?",
    ],
  },
  outcomes: {
    eyebrow: "Warum CX-Teams AutoSEO wählen",
    title: "Weniger Überraschungen,",
    muted: "bessere erste Eindrücke.",
    items: [
      {
        title: "Korrekte Antworten zu Ihren Richtlinien",
        body: "Faktenchecks zeigen, wo Engines Ihre Bedingungen falsch wiedergeben – so korrigieren Sie die Seiten, auf die sie sich stützen.",
      },
      {
        title: "Eine neue Quelle für Kundenfeedback",
        body: "Wiederkehrende Kritik in KI-Antworten zeigt, welche Servicethemen Ihren Ruf gerade prägen.",
      },
      {
        title: "Eine Sicht für alle Teams",
        body: "Support, Marketing und Produkt lesen dieselben Antworten – mit Rollen und Zugriff pro Projekt für jedes Team.",
      },
    ],
  },
  faq: [
    {
      q: "Warum sollten sich Customer-Experience-Teams mit der KI-Suche befassen?",
      a: "Kunden fragen KI-Assistenten nach Servicequalität, Richtlinien und typischen Problemen, bevor sie ein Unternehmen kontaktieren. Die Antworten setzen Erwartungen. Sind sie veraltet oder falsch, landen die Folgen als Tickets und Bewertungen bei Ihrem Team.",
    },
    {
      q: "Wie sehe ich, was KI über unseren Kundenservice sagt?",
      a: "Tracken Sie Prompts wie „Hat Acme einen guten Kundenservice?“ in den Engines, die Ihre Kunden nutzen. AutoSEO speichert jede Antwort, extrahiert Lob und Kritik nach Themen und zeigt Ihre Entwicklung im Vergleich zu Wettbewerbern.",
    },
    {
      q: "Erkennt AutoSEO falsche Informationen über unsere Produkte oder Richtlinien?",
      a: "Ja. Der Faktencheck vergleicht Aussagen in KI-Antworten mit den Referenzdokumenten, die Sie hinterlegen, und stuft sie als bestätigt, widerlegt, unbelegt oder veraltet ein – mit Schweregrad und den genauen Zitaten. Sie können Befunde als erledigt markieren oder ignorieren und sehen, ob sie wieder auftauchen.",
    },
    {
      q: "Welche Quellen nutzen KI-Engines für Bewertungen und Beschwerden?",
      a: "AutoSEO listet jede zitierte URL und gruppiert die Quellen nach Typ, darunter Foren, nutzergenerierte Inhalte, Testberichte und News. So sehen Sie, welche Threads und Bewertungsseiten die Antworten über Ihre Marke speisen.",
    },
    {
      q: "Können Support und Marketing im selben Projekt arbeiten?",
      a: "Ja. Laden Sie Kolleginnen und Kollegen mit der Rolle Owner, Admin, Member oder Client oder einer eigenen Rolle ein und steuern Sie den Zugriff pro Projekt. Die Anmeldung läuft per Magic Link – ohne Passwörter.",
    },
    {
      q: "Was kostet AutoSEO?",
      a: "Die Open-Source-Edition lässt sich mit allen Funktionen und ohne Limits kostenlos selbst hosten; KI- und Datenanbieter rechnen dann direkt mit Ihnen ab. AutoSEO Cloud, gehostet in Deutschland, kostet 50\u00a0$ pro Workspace und Monat – mit bis zu 10 Projekten, unbegrenzt vielen Nutzern und KI- und Datennutzung im Wert von 10\u00a0$ inklusive.",
    },
  ],
  related: ["pr-brand-teams", "e-commerce", "saas-tech"],
  cta: {
    title: "Sehen Sie, was KI Ihren Kunden erzählt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies SolutionPage;
