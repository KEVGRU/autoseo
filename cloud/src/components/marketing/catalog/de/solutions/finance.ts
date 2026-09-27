import type { SolutionPage } from "../../types";

export default {
  slug: "finance",
  nav: "Für Finanzdienstleister",
  summary: "Wie KI Ihre Finanzprodukte beschreibt – und wo Aussagen Ihren Bedingungen widersprechen.",
  meta: {
    title: "KI-Sichtbarkeit für Banken & Finanzdienstleister",
    description:
      "Sehen Sie, wie ChatGPT, Gemini und Perplexity Ihre Bank-, Versicherungs- oder Fintech-Produkte darstellen, und prüfen Sie Aussagen gegen Ihre Bedingungen.",
  },
  hero: {
    eyebrow: "AutoSEO für Finanzdienstleister",
    title: "KI-Sichtbarkeit für Banken und Finanzdienstleister.",
    muted: "Gemessen, belegt und geprüft.",
    subtitle:
      "Banken, Versicherer und Fintechs werden täglich in KI-Antworten verglichen. AutoSEO trackt diese Antworten in 16 KI-Engines, zeigt, auf welche Quellen sie sich stützen, und prüft Aussagen über Ihre Produkte gegen Ihre eigenen Bedingungen und Produktunterlagen.",
  },
  visual: "factcheck",
  challenges: {
    eyebrow: "Die Herausforderung",
    title: "Geldfragen gehen heute an die KI.",
    muted: "Die Antworten stimmen nicht immer.",
    items: [
      {
        title: "Vergleiche finden ohne Sie statt",
        body: "„Bestes Tagesgeldkonto“ oder „günstigste Kfz-Versicherung“ ist heute eine Frage an einen Assistenten. Nennt die Antwort Sie nicht, stehen Sie nicht auf der Shortlist.",
      },
      {
        title: "Alte Gebühren und Zinsen leben weiter",
        body: "KI-Engines zitieren Konditionen von Vergleichsportalen, alten Seiten und aus Foren. Eine Gebühr, die Sie vor Monaten geändert haben, kann heute noch in Antworten auftauchen.",
      },
      {
        title: "Sicherheitsregeln können KI-Crawler aussperren",
        body: "Strenge Firewall- und Bot-Einstellungen können KI-Crawler von Ihren Produktseiten fernhalten. Dann greifen die Engines auf das zurück, was Dritte über Sie schreiben.",
      },
    ],
  },
  workflow: {
    eyebrow: "So nutzen Finanzmarken AutoSEO",
    title: "Vom Monitoring zur Korrektur –",
    muted: "in einem Workflow.",
    items: [
      {
        icon: "radar",
        title: "Produkt-Prompts je Markt tracken",
        body: "Führen Sie Prompts zu Konten, Karten, Krediten und Policen in jedem Ihrer Märkte aus – täglich oder wöchentlich in 16 Engines.",
        feature: "ai-visibility-tracking",
      },
      {
        icon: "shield-check",
        title: "KI-Aussagen per Faktencheck prüfen",
        body: "Laden Sie Bedingungen, Preisverzeichnisse oder Produktblätter hoch. AutoSEO vergleicht jede KI-Aussage zu einem Produkt damit und markiert Abweichungen nach Schweregrad.",
        feature: "ai-fact-check",
      },
      {
        icon: "link",
        title: "Quellen hinter den Antworten sehen",
        body: "Vergleichsportale, Testberichte, News oder Foren: jede zitierte URL nach Quelltyp – und wo Wettbewerber gelistet sind und Sie nicht.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "swords",
        title: "Mit Wettbewerbern vergleichen",
        body: "Share of Voice, durchschnittliche Position und direkte Vergleiche mit den Banken, Versicherern und Fintechs, die KI neben Ihnen nennt.",
        feature: "ai-competitor-analysis",
      },
      {
        icon: "bot",
        title: "Zugang für KI-Crawler prüfen",
        body: "Testen Sie robots.txt, Firewall-Antworten, Rendering und llms.txt für die wichtigsten KI-Crawler, bevor ein blockierter Bot Sie Zitate kostet.",
        feature: "ai-crawlability",
      },
      {
        icon: "heart",
        title: "Tonalität und Vertrauensthemen verfolgen",
        body: "Sehen Sie, was KI-Engines an Ihnen und Ihren Wettbewerbern loben und kritisieren – etwa Gebühren, Service oder die App.",
        feature: "ai-brand-sentiment",
      },
    ],
  },
  prompts: {
    eyebrow: "Beispiel-Prompts",
    title: "Prompts, die Finanzmarken tracken",
    items: [
      "Bestes kostenloses Girokonto für Selbstständige",
      "Welche Kreditkarte hat keine Auslandseinsatzgebühr?",
      "Acme Bank oder Neobank – was ist besser fürs tägliche Banking?",
      "Zahlt die Acme Versicherung im Schadensfall zuverlässig?",
      "Welche Gebühren hat die Trading-App von Acme?",
      "Zuverlässigster Online-Broker für Einsteiger",
      "Welche Banken bieten ein gutes Geschäftskonto für Start-ups?",
    ],
  },
  outcomes: {
    eyebrow: "Warum Finanzmarken AutoSEO wählen",
    title: "Belege, mit denen Ihre Teams arbeiten können –",
    muted: "gehostet, wie Sie es brauchen.",
    items: [
      {
        title: "Abweichungen mit Belegen",
        body: "Jeder Befund zeigt das KI-Zitat, die passende Stelle aus Ihrem Dokument, die Engine, den Markt und wie oft die Aussage gesehen wurde.",
      },
      {
        title: "Selbst gehostet oder in Deutschland",
        body: "Hosten Sie AutoSEO auf Ihren eigenen Servern und behalten Sie die volle Kontrolle über Ihre Daten – oder nutzen Sie einen AutoSEO-Cloud-Workspace, gehostet in Deutschland.",
      },
      {
        title: "Bereit für interne Prüfungen",
        body: "Rollen, Zugriff pro Projekt und CSV-Exporte machen es leicht, Befunde mit Rechts-, Compliance- und Produktteams zu teilen.",
      },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich, was ChatGPT über meine Bank sagt?",
      a: "Hinterlegen Sie die Fragen Ihrer Kunden – zu Konten, Karten, Krediten oder Versicherungen –, wählen Sie Märkte und Engines, und AutoSEO führt die Prompts täglich, wöchentlich oder monatlich aus. Jede Antwort wird gespeichert. So sehen Sie, ob Ihre Marke erwähnt, zitiert oder empfohlen wird und wie sich das über die Zeit verändert.",
    },
    {
      q: "Erkennt AutoSEO falsche Gebühren oder Zinsen in KI-Antworten?",
      a: "Ja, sofern Sie die Referenz liefern. Laden Sie Ihr Preisverzeichnis, Ihre Bedingungen oder ein Produktblatt als PDF, URL oder Text hoch, und der Faktencheck vergleicht jede Aussage der KI-Engines zu diesem Produkt damit. Abweichungen werden als widersprüchlich, nicht belegt oder veraltet markiert – mit Schweregrad und Zitaten beider Seiten.",
    },
    {
      q: "Ersetzt AutoSEO eine Compliance-Prüfung?",
      a: "Nein. AutoSEO zeigt, was KI-Engines über Ihre Produkte sagen und wo das von Ihren eigenen Dokumenten abweicht. Wie Sie darauf reagieren und wie Inhalte vor der Veröffentlichung geprüft werden, entscheidet weiterhin Ihr Team.",
    },
    {
      q: "Können wir AutoSEO auf eigener Infrastruktur betreiben?",
      a: "Ja. AutoSEO ist Open Source unter der MIT-Lizenz und läuft per Einzeiler, Docker Compose oder Coolify auf Ihren eigenen Servern. Tracking-Daten, Referenzdokumente und Befunde bleiben auf Ihrer Infrastruktur; nur Anfragen an die KI- und Datenanbieter, die Sie selbst konfigurieren, verlassen sie.",
    },
    {
      q: "Welche Sicherheitsfunktionen bietet AutoSEO?",
      a: "Passwortlose Anmeldung per Magic Link, die Rollen Owner, Admin, Member und Client mit Zugriff pro Projekt, mit AES-256-GCM verschlüsselte Secrets sowie DSGVO-Export und -Löschung. Beim Self-Hosting kommt im Admin-Bereich ein Audit-Log für Anmeldungen, Rollen- und Einstellungsänderungen hinzu.",
    },
    {
      q: "Warum zitieren KI-Engines unsere Produktseiten nicht?",
      a: "Manchmal sind die Seiten für KI-Crawler nicht erreichbar – wegen einer Firewall-Regel, einer Sperre in der robots.txt oder Inhalten, die erst per JavaScript erscheinen. Der Crawlability-Check von AutoSEO prüft all das für die wichtigsten KI-Bots, und die Quellenansicht zeigt, welche Seiten Dritter die Engines stattdessen zitieren.",
    },
    {
      q: "Was kostet AutoSEO für Finanzdienstleister?",
      a: "Self-Hosting ist kostenlos, mit allen Funktionen und ohne Limits. AutoSEO Cloud kostet 50\u00a0$ pro Workspace und Monat zzgl. MwSt. für Geschäftskunden – mit unbegrenzt vielen Nutzern, bis zu 10 Projekten und KI- und Datennutzung im Wert von 10\u00a0$ pro Monat. Beim Self-Hosting rechnen Drittanbieter wie DataForSEO oder Ihr KI-Anbieter direkt mit Ihnen ab.",
    },
  ],
  related: ["pharma", "pr-brand-teams", "customer-experience"],
  cta: {
    title: "Finden Sie heraus, was KI Ihren Kunden über Ihre Produkte sagt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos auf Ihrer eigenen Infrastruktur.",
  },
} satisfies SolutionPage;
