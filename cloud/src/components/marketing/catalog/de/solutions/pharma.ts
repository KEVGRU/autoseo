import type { SolutionPage } from "../../types";

export default {
  slug: "pharma",
  nav: "Für Pharma",
  summary: "Was KI über Ihre Arzneimittel sagt – geprüft gegen Ihre Produktinformation, je Markt.",
  meta: {
    title: "KI-Sichtbarkeit & Faktencheck für Pharma",
    description:
      "Tracken Sie, was ChatGPT, Gemini und Perplexity über Ihre Arzneimittel sagen, und prüfen Sie jede Aussage gegen Fachinformation oder Beipackzettel je Markt.",
  },
  hero: {
    eyebrow: "AutoSEO für Pharma",
    title: "KI-Sichtbarkeit und Faktencheck für Pharma.",
    muted: "Gemessen an Ihrer eigenen Produktinformation.",
    subtitle:
      "KI-Assistenten beantworten täglich Fragen zu Arzneimitteln. AutoSEO trackt diese Antworten in 16 KI-Engines und Ihren Märkten und vergleicht jede Aussage über Ihre Produkte mit Ihren Referenzdokumenten, etwa der Fachinformation oder der Gebrauchsinformation.",
  },
  visual: "factcheck",
  challenges: {
    eyebrow: "Die Herausforderung",
    title: "KI spricht über Ihre Produkte.",
    muted: "Nicht immer auf Basis Ihrer Produktinformation.",
    items: [
      {
        title: "Aussagen weichen von der Produktinformation ab",
        body: "Assistenten fassen viele Quellen zusammen. Aussagen zu Anwendungsgebiet, Zielgruppe oder Art der Anwendung können von dem abweichen, was Ihre Produktinformation tatsächlich sagt.",
      },
      {
        title: "Jeder Markt hat eigene Texte",
        body: "Zugelassene Informationen unterscheiden sich je Land und Version. Eine Antwort, die für einen Markt passt, kann in einem anderen falsch sein – oder eine überholte Version zitieren.",
      },
      {
        title: "Manuelle Prüfung skaliert nicht",
        body: "Antworten aus 16 Engines in mehreren Märkten und Sprachen jede Woche von Hand zu lesen, ist für ein Medical- oder Brand-Team nicht realistisch.",
      },
    ],
  },
  workflow: {
    eyebrow: "So nutzen Pharma-Teams AutoSEO",
    title: "Von der KI-Antwort zum geprüften Befund –",
    muted: "in einem Workflow.",
    items: [
      {
        icon: "radar",
        title: "Prompts in jedem Markt tracken",
        body: "Führen Sie die Fragen, die Menschen zu Ihren Produkten und Therapiegebieten stellen, in 16 Engines aus – in jedem Land und jeder Sprache, die Sie abdecken.",
        feature: "ai-visibility-tracking",
      },
      {
        icon: "shield-check",
        title: "Aussagen mit der Produktinformation abgleichen",
        body: "Laden Sie Fachinformation, Gebrauchsinformation oder eine andere Referenz je Markt und Version hoch. Jede KI-Aussage wird als übereinstimmend, widersprüchlich, nicht belegt, veraltet oder off-label bewertet.",
        feature: "ai-fact-check",
      },
      {
        icon: "link",
        title: "Die Quellen hinter einer Aussage finden",
        body: "Sehen Sie, welche Seiten Engines für jeden Prompt zitieren – Gesundheitsportale, News, Foren oder Ihre eigene Website – und wo korrekte Informationen fehlen.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "git-fork",
        title: "Die Suchen hinter den Antworten sehen",
        body: "Query Fan-outs zeigen, welche Websuchen Engines vor einer Antwort ausführen – so wissen Sie, welche Inhalte auffindbar sein müssen.",
        feature: "query-fanout-analysis",
      },
      {
        icon: "list-checks",
        title: "Abweichungen in Aufgaben verwandeln",
        body: "Offene kritische und erhebliche Befunde werden zu priorisierten Aufgaben mit Aussagen, Engines und nächsten Schritten – bereit für Jira, Linear oder Ihr eigenes Tool.",
        feature: "ai-seo-tasks",
      },
    ],
  },
  prompts: {
    eyebrow: "Beispiel-Prompts",
    title: "Prompts, die Pharma-Teams tracken",
    items: [
      "Wofür ist Acme zugelassen?",
      "Was sind die häufigsten Nebenwirkungen von Acme?",
      "Acme im Vergleich zu anderen Migränemitteln",
      "Ist Acme rezeptfrei erhältlich?",
      "Gibt es ein Generikum zu Acme?",
      "Wo finde ich den Beipackzettel von Acme?",
      "Welche Hersteller bieten Biosimilars bei rheumatoider Arthritis an?",
    ],
  },
  outcomes: {
    eyebrow: "Warum Pharma-Teams AutoSEO wählen",
    title: "Von verstreuten Antworten",
    muted: "zu einer prüfbaren Liste.",
    items: [
      {
        title: "Befunde, die Ihr Team prüfen kann",
        body: "Jeder Befund enthält das KI-Zitat, Textstelle und Abschnitt der Produktinformation, einen Schweregrad und wie oft die Aussage gesehen wurde – exportierbar als CSV.",
      },
      {
        title: "Neue Versionen im Griff",
        body: "Laden Sie eine neue Version unter demselben Titel hoch, und die alte wird als überholt markiert. Aussagen, die nur zum alten Text passen, gelten als veraltet.",
      },
      {
        title: "Hosting nach Ihren Vorgaben",
        body: "Hosten Sie AutoSEO selbst, um Referenzdokumente und Befunde auf Ihrer eigenen Infrastruktur zu halten – oder nutzen Sie einen AutoSEO-Cloud-Workspace, gehostet in Deutschland.",
      },
    ],
  },
  faq: [
    {
      q: "Wie können Pharmaunternehmen überwachen, was KI über ihre Arzneimittel sagt?",
      a: "Tracken Sie in AutoSEO die Fragen, die Menschen zu Ihren Produkten stellen – in 16 KI-Engines und allen Märkten, die Sie bedienen. Der Faktencheck vergleicht dann jede Aussage über ein Produkt mit Ihren Referenzdokumenten, etwa der Fachinformation, und listet Abweichungen mit Schweregrad auf.",
    },
    {
      q: "Was markiert der Faktencheck von AutoSEO?",
      a: "Aussagen, die Ihrem Referenztext widersprechen, nicht durch ihn belegt sind, nur zu einer überholten Version passen oder eine Anwendung beschreiben, die die Produktinformation nicht abdeckt. Unklare Fälle werden zur manuellen Prüfung markiert. Abweichungen werden als kritisch, erheblich oder gering eingestuft; kritisch umfasst Themen wie Sicherheit, Dosierung und Gegenanzeigen.",
    },
    {
      q: "Stellt AutoSEO regulatorische Compliance sicher?",
      a: "Nein. AutoSEO zeigt, wo KI-Antworten von Ihren eigenen Referenzdokumenten abweichen, damit Ihr Team sie prüfen kann. Die Plattform gibt keine medizinischen Ratschläge, ersetzt keine medizinische oder regulatorische Prüfung und trifft keine Aussage über Compliance.",
    },
    {
      q: "Können wir für jedes Land eine eigene Produktinformation verwenden?",
      a: "Ja. Jedes Produkt kann mehrere Märkte abdecken, und jedes Referenzdokument gilt entweder für einen Markt oder für alle. KI-Aussagen werden mit den Dokumenten des Markts verglichen, in dem sie aufgetaucht sind.",
    },
    {
      q: "Braucht der Faktencheck einen KI-Anbieter?",
      a: "Mit einem KI-Anbieter funktioniert er am besten. In AutoSEO Cloud laufen KI-Funktionen über die Anbieter, die das Codext-Team angebunden hat – die Nutzung zählt auf die monatlich enthaltenen 10\u00a0$ –, und Sie können zusätzlich Ihren eigenen Claude-Code- oder Codex-Agenten verbinden; beim Self-Hosting verbinden Sie Ihr eigenes Claude Code oder Codex CLI über einen lokalen Agenten oder hinterlegen einen API-Key. Ganz ohne KI-Anbieter vergleicht AutoSEO Antworten und Dokumente Wort für Wort.",
    },
    {
      q: "Wo werden unsere Referenzdokumente gespeichert?",
      a: "Beim Self-Hosting liegen hochgeladene PDFs und ihr extrahierter Text auf Ihrem eigenen Server. In AutoSEO Cloud liegen sie in Ihrem Workspace auf Servern in Deutschland, logisch getrennt von anderen Workspaces. Ist die KI-Bewertung aktiv, gehen die relevanten Auszüge an den KI-Anbieter, der die Prüfung ausführt.",
    },
    {
      q: "Was kostet AutoSEO?",
      a: "Self-Hosting ist kostenlos, mit allen Funktionen und ohne Limits. AutoSEO Cloud kostet 50\u00a0$ pro Workspace und Monat zzgl. MwSt. für Geschäftskunden – mit unbegrenzt vielen Nutzern, bis zu 10 Projekten und KI- und Datennutzung im Wert von 10\u00a0$ pro Monat. Beim Self-Hosting rechnen Drittanbieter wie DataForSEO oder Ihr KI-Anbieter direkt mit Ihnen ab.",
    },
  ],
  related: ["healthcare", "finance", "pr-brand-teams"],
  cta: {
    title: "Prüfen Sie, was KI über Ihre Produkte sagt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos auf Ihrer eigenen Infrastruktur.",
  },
} satisfies SolutionPage;
