import type { SolutionPage } from "../../types";

export default {
  slug: "healthcare",
  nav: "Für das Gesundheitswesen",
  summary: "Welche Anbieter KI Patienten empfiehlt – und welchen Quellen sie dabei vertraut.",
  meta: {
    title: "KI-Sichtbarkeit im Gesundheitswesen",
    description:
      "Sehen Sie, ob ChatGPT, Gemini und AI Overviews Ihre Klinik empfehlen, welche Gesundheitsquellen sie zitieren und wo Angaben zu Ihren Leistungen falsch sind.",
  },
  hero: {
    eyebrow: "AutoSEO für das Gesundheitswesen",
    title: "KI-Sichtbarkeit im Gesundheitswesen.",
    muted: "Wissen, was Patienten erfahren.",
    subtitle:
      "Patienten fragen KI-Assistenten, welche Klinik, welche Praxis oder welcher Dienst der richtige ist. AutoSEO trackt diese Antworten in 16 KI-Engines, zeigt die Quellen dahinter und prüft Aussagen über Ihre Leistungen gegen Ihre eigenen Informationen.",
  },
  visual: "sources",
  challenges: {
    eyebrow: "Die Herausforderung",
    title: "Patienten fragen zuerst die KI.",
    muted: "Die Antwort sehen Sie nicht.",
    items: [
      {
        title: "Die Wahl beginnt in der Antwort",
        body: "Menschen fragen, welches Krankenhaus, welche Praxis oder welcher Telemedizin-Dienst infrage kommt. Der Assistent nennt ein paar Anbieter und zitiert eine Handvoll Seiten. Gehören Ihre nicht dazu, sind Sie nicht in der Auswahl.",
      },
      {
        title: "Veraltete Angaben erreichen Patienten",
        body: "Leistungen, die Sie nicht mehr anbieten, alte Öffnungszeiten oder falsche Angaben zu einer Abteilung kommen als selbstsichere Antworten an – und Sie erfahren nichts davon.",
      },
      {
        title: "Unklar, welche Quellen zählen",
        body: "KI-Engines stützen sich auf Quellen, denen sie vertrauen. Ohne Daten wissen Sie nicht, ob das Ihre eigene Website ist oder Nachschlageseiten, Bewertungen, News und Foren.",
      },
    ],
  },
  workflow: {
    eyebrow: "So nutzen Gesundheitsanbieter AutoSEO",
    title: "Erst die Antwort verstehen,",
    muted: "dann die Quellen verbessern.",
    items: [
      {
        icon: "radar",
        title: "Die Fragen der Patienten tracken",
        body: "Verfolgen Sie Prompts zu Fachgebieten, Standorten und Leistungen in 16 Engines und allen Märkten, in denen Sie tätig sind.",
        feature: "ai-visibility-tracking",
      },
      {
        icon: "lightbulb",
        title: "Die richtigen Prompts finden",
        body: "Recherchieren Sie Fragen nach Thema, Funnel-Stufe und Persona – damit Ihr Tracking abbildet, wie Patienten wirklich fragen.",
        feature: "prompt-research",
      },
      {
        icon: "link",
        title: "Sehen, welchen Quellen KI vertraut",
        body: "Jede zitierte URL, gruppiert nach Quelltyp – Nachschlageseiten, Bewertungen, News, Foren – inklusive Lücken, wo andere zitiert werden und Sie nicht.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "shield-check",
        title: "Aussagen über Ihre Leistungen prüfen",
        body: "Hinterlegen Sie Leistungsbeschreibungen oder Patienteninformationen als Referenzdokumente und sehen Sie, wo KI-Aussagen ihnen widersprechen oder nicht durch sie belegt sind.",
        feature: "ai-fact-check",
      },
      {
        icon: "file-text",
        title: "Inhalte für Patientenfragen erstellen",
        body: "Briefings und Entwürfe in der Stimme einer Autoren-Persona mit Rolle, Expertise und Qualifikationen. Veröffentlicht wird erst, wenn Ihr Team es entscheidet.",
        feature: "ai-content-optimization",
      },
      {
        icon: "heart",
        title: "Verstehen, wie KI Sie beschreibt",
        body: "Lob- und Kritikthemen für Sie und vergleichbare Anbieter – damit Sie wissen, wo Sie zuerst ansetzen.",
        feature: "ai-brand-sentiment",
      },
    ],
  },
  prompts: {
    eyebrow: "Beispiel-Prompts",
    title: "Prompts, die Gesundheitsanbieter tracken",
    items: [
      "Welche Kliniken in München sind am besten für eine Hüft-OP?",
      "Bester Telemedizin-Dienst für Hautarzt-Termine",
      "Ist die Acme Klinik eine gute Wahl bei Sportverletzungen?",
      "Wie finde ich einen Kinderarzt in meiner Nähe, der neue Patienten aufnimmt?",
      "Was sagen Patienten über die Online-Terminbuchung von Acme Health?",
      "Welche Gesundheits-Apps sind vertrauenswürdig, um den Schlaf zu tracken?",
      "Augenkliniken für Augenlasern – wie schneiden sie im Vergleich ab?",
    ],
  },
  outcomes: {
    eyebrow: "Warum Gesundheitsanbieter AutoSEO wählen",
    title: "Sehen Sie die Antwort, die Patienten sehen –",
    muted: "und handeln Sie danach.",
    items: [
      {
        title: "Belege statt Annahmen",
        body: "Jede Antwort wird mit ihren Quellen gespeichert. So zeigen Sie genau, was eine Engine gesagt hat, wann und in welchem Markt.",
      },
      {
        title: "Ungenauigkeiten früh erkennen",
        body: "Der Faktencheck läuft täglich, markiert neue Abweichungen und öffnet erledigte Befunde wieder, wenn KI-Engines sie wiederholen.",
      },
      {
        title: "Hosting nach Ihren Vorgaben",
        body: "Hosten Sie AutoSEO auf Ihren eigenen Servern und behalten Sie die volle Kontrolle über Ihre Daten – oder nutzen Sie einen AutoSEO-Cloud-Workspace, gehostet in Deutschland.",
      },
    ],
  },
  faq: [
    {
      q: "Wie finde ich heraus, was ChatGPT über meine Klinik sagt?",
      a: "Hinterlegen Sie die Fragen, die Patienten stellen – zu Fachgebieten, Standorten und Leistungen –, und AutoSEO führt sie regelmäßig in ChatGPT, Perplexity, Gemini, Google AI Overviews und weiteren Engines aus. Sie sehen, ob Ihre Klinik erwähnt oder zitiert wird, welche Anbieter neben Ihnen auftauchen und auf welche Seiten sich die Antworten stützen.",
    },
    {
      q: "Erkennt AutoSEO falsche Angaben zu unseren Leistungen?",
      a: "AutoSEO markiert KI-Aussagen über Ihre Leistungen, die von Ihren eigenen Referenzdokumenten abweichen, etwa von Leistungsbeschreibungen oder Patienteninformationen. Jeder Befund zeigt das KI-Zitat, die passende Stelle und einen Schweregrad, damit Ihr Team ihn prüfen kann. Über Ihre Dokumente hinaus bewertet AutoSEO keine medizinische Richtigkeit.",
    },
    {
      q: "Ist AutoSEO ein Medizin- oder Compliance-Tool?",
      a: "Nein. AutoSEO ist eine Plattform für AI Visibility und SEO. Sie zeigt, was KI-Engines sagen und wo das von Ihrem eigenen Material abweicht; die medizinische und regulatorische Prüfung von Inhalten bleibt bei Ihrem Team.",
    },
    {
      q: "Braucht AutoSEO Zugriff auf Patientendaten?",
      a: "Nein. AutoSEO arbeitet mit den Prompts, die Sie tracken, mit KI-Antworten, Ihrer Website und den Referenzdokumenten, die Sie hochladen. Die Plattform ist nicht für Patientenakten gebaut und benötigt sie nicht.",
    },
    {
      q: "Können wir AutoSEO selbst hosten?",
      a: "Ja. AutoSEO ist Open Source unter der MIT-Lizenz und läuft per Einzeiler, Docker Compose oder Coolify auf Ihren eigenen Servern. Ihre Daten bleiben auf Ihrer Infrastruktur – abgesehen von Anfragen an die KI- und Datenanbieter, die Sie selbst konfigurieren.",
    },
    {
      q: "Hilft AutoSEO auch bei der lokalen Suche für Kliniken?",
      a: "Ja. Neben AI Visibility enthält AutoSEO Local SEO für Google Business Profile und Maps: Einträge finden, lokale Rankings in einem Rank Grid prüfen und Bewertungen, Fragen und Antworten sowie Beiträge auditieren.",
    },
    {
      q: "Was kostet AutoSEO?",
      a: "Self-Hosting ist kostenlos, mit allen Funktionen und ohne Limits. AutoSEO Cloud kostet 50\u00a0$ pro Workspace und Monat zzgl. MwSt. für Geschäftskunden – mit unbegrenzt vielen Nutzern, bis zu 10 Projekten und KI- und Datennutzung im Wert von 10\u00a0$ pro Monat. Beim Self-Hosting rechnen Drittanbieter wie DataForSEO oder Ihr KI-Anbieter direkt mit Ihnen ab.",
    },
  ],
  related: ["pharma", "content-teams", "customer-experience"],
  cta: {
    title: "Sehen Sie, was KI Patienten über Sie sagt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos auf Ihrer eigenen Infrastruktur.",
  },
} satisfies SolutionPage;
