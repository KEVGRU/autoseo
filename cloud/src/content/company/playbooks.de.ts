import type { Playbook } from "@/components/site/company/types";

/** Reproduzierbare GEO-Playbooks (/de/case-studies/[slug]). Nur Methodik: keine Kundendaten, keine versprochenen Ergebnisse. */
const playbooks: Playbook[] = [
  {
    slug: "win-comparison-prompts",
    crumb: "Vergleichs-Prompts gewinnen",
    icon: "swords",
    meta: {
      title: "Playbook: Vergleichs-Prompts Ihrer Kategorie gewinnen",
      description:
        "Reproduzierbares GEO-Playbook: Prompt-Set für „beste X“- und „A vs. B“-Fragen, Ausgangsmessung in AutoSEO, Maßnahmen und ehrliche Messung der Share of Voice.",
    },
    hero: {
      title: "Vergleichs-Prompts in Ihrer Kategorie gewinnen",
      subtitle:
        "Wenn Käufer eine KI fragen „Was ist die beste … für …?“ oder „A oder B?“, ist die Antwort eine Shortlist. Dieses Playbook misst, ob Sie darauf stehen, findet heraus, warum Ihre Wettbewerber dort stehen, und zeigt, was Sie ändern können.",
    },
    teaser: "Messen Sie, wie oft KI Sie in „beste X für Y“- und „A vs. B“-Antworten empfiehlt, schließen Sie die Lücken, die Wettbewerber füllen, und verfolgen Sie Ihre Share of Voice.",
    facts: [
      { label: "Ziel", value: "Höhere Erwähnungsrate und Share of Voice in Vergleichsantworten" },
      { label: "Für", value: "Marken in umkämpften Kategorien, SaaS, E-Commerce" },
      { label: "Ausgangsmessung", value: "7 Tage tägliches Tracking" },
      { label: "Erneut messen", value: "Nach 6–8 Wochen, danach monatlich" },
    ],
    goal: [
      {
        type: "p",
        text: "Steigern Sie, wie oft und wie prominent KI-Engines Ihre Marke nennen, wenn Menschen in Ihrer Kategorie nach Empfehlungen oder Vergleichen fragen. Die Hauptkennzahlen für ein festes Prompt-Set sind die **Erwähnungsrate (Mention Rate)** – der Anteil der Antworten, die Sie nennen – und die **Share of Voice** – Ihre Erwähnungen im Verhältnis zu denen der getrackten Wettbewerber. **Position** und **Sentiment** sind zweitrangig.",
      },
    ],
    audience: [
      "Marken in Kategorien, in denen Käufer vor dem Kauf Optionen vergleichen",
      "SaaS- und Software-Unternehmen im Wettbewerb um „bestes Tool“-Listen",
      "E-Commerce-Marken im Wettbewerb um Produktempfehlungen",
      "Agenturen, die eine GEO-Wettbewerbsanalyse für einen Kunden vorbereiten",
    ],
    prompts: {
      intro:
        "Zwölf Vorlagen für die drei Formen, die Vergleichsfragen annehmen: Shortlist („beste“), Direktvergleich („vs.“) und Alternative („statt“). Über die Tags filtern Sie die Ergebnisse später nach Form.",
      placeholders: [
        "`[Kategorie]` – Ihre Produktkategorie in den Worten Ihrer Käufer, z. B. „Projektmanagement-Software“",
        "`[Zielgruppe]` – ein Käufersegment, z. B. „kleine Agenturen“",
        "`[Anwendungsfall]` – eine konkrete Aufgabe, z. B. „Kundenreporting“",
        "`[Wettbewerber]` – Ihr stärkster Wettbewerber (für weitere die Zeilen duplizieren)",
        "`[Marke]` – Ihr Markenname",
        "`[Budget]` – eine realistische Vorgabe, z. B. „unter 50 € im Monat“",
      ],
      rows: [
        { prompt: "Was ist die beste [Kategorie] für [Zielgruppe]?", tags: ["Vergleich", "Shortlist"] },
        { prompt: "Welche [Kategorie] empfehlen Experten?", tags: ["Vergleich", "Shortlist"] },
        { prompt: "Die 5 besten [Kategorie] für [Anwendungsfall]", tags: ["Vergleich", "Shortlist"] },
        { prompt: "Was ist die beste [Kategorie] [Budget]?", tags: ["Vergleich", "Shortlist", "Budget"] },
        { prompt: "Welche [Kategorie] lässt sich für [Zielgruppe] am einfachsten einrichten?", tags: ["Vergleich", "Shortlist"] },
        { prompt: "[Marke] vs. [Wettbewerber]: Was ist besser für [Anwendungsfall]?", tags: ["Vergleich", "Direktvergleich"] },
        { prompt: "[Wettbewerber] vs. [Marke] für [Zielgruppe]", tags: ["Vergleich", "Direktvergleich"] },
        { prompt: "Ist [Marke] besser als [Wettbewerber]?", tags: ["Vergleich", "Direktvergleich"] },
        { prompt: "Was sind die besten Alternativen zu [Wettbewerber]?", tags: ["Vergleich", "Alternative"] },
        { prompt: "Was kann ich statt [Wettbewerber] für [Anwendungsfall] nutzen?", tags: ["Vergleich", "Alternative"] },
        { prompt: "Günstigere Alternative zu [Wettbewerber] für [Zielgruppe]", tags: ["Vergleich", "Alternative", "Budget"] },
        { prompt: "Was sind die Vor- und Nachteile von [Marke]?", tags: ["Vergleich", "Marke"] },
      ],
    },
    engines: {
      intro: "Vergleichsantworten unterscheiden sich stark zwischen den Engines. Tracken Sie deshalb mehrere – und behalten Sie dieselben Engines über den gesamten Messzeitraum bei.",
      head: ["Engine", "Warum sie für Vergleichs-Prompts zählt"],
      rows: [
        ["ChatGPT", "Der Assistent, den die meisten Menschen für offene Fragen nutzen; mit Websuche nennt er die Quellen hinter seiner Shortlist."],
        ["Perplexity", "Zitiert in jeder Antwort Quellen – so sehen Sie genau, welche Vergleichsseiten die Shortlist prägen."],
        ["Google AI Overviews und AI Mode", "Erscheinen bei „beste …“-Suchen über oder anstelle der klassischen Ergebnisse."],
        ["Gemini, Claude, Microsoft Copilot", "Nehmen Sie sie dazu, wenn Ihre Käufer mit Google Workspace, Claude oder Microsoft 365 arbeiten."],
      ],
    },
    baseline: [
      {
        title: "Projekt anlegen",
        body: "Legen Sie Ihre Website als Projekt an, stellen Sie Land und Sprache Ihres Zielmarkts ein und fügen Sie unter AI Visibility → Competitors drei bis fünf Wettbewerber hinzu.",
      },
      {
        title: "Prompt-Set importieren",
        body: "Ersetzen Sie die Platzhalter und importieren Sie die CSV unter AI Visibility → Tracker → Import CSV. Die Tags werden mit den Prompts übernommen.",
      },
      {
        title: "Engines und Frequenz wählen",
        body: "Wählen Sie unter AI Visibility → Model Settings die Engines aus der Tabelle oben und stellen Sie das Tracking für die Messwoche auf täglich.",
      },
      {
        title: "Ausgangswert festhalten",
        body: "Notieren Sie nach sieben täglichen Läufen Erwähnungsrate, Share of Voice, Position und Sentiment je Tag und speichern Sie einen Report aus der Vorlage Baseline Snapshot.",
      },
    ],
    actions: [
      {
        title: "Antworten lesen, nicht nur Kennzahlen",
        body: "Öffnen Sie die Antworten, die Wettbewerber nennen, Sie aber nicht. Notieren Sie die Gründe der KI – Preis, Integrationen, Zielgruppe. Diese Gründe sind Ihr Content-Briefing.",
      },
      {
        title: "Die Quellen hinter der Shortlist angehen",
        body: "AI Visibility → Sources zeigt, welche Seiten und Domains für diese Prompts zitiert werden. Arbeiten Sie daran, dort aufzutauchen, wo Sie fehlen: Vergleichsartikel, Bewertungsplattformen, Verzeichnisse.",
      },
      {
        title: "Ehrliche Vergleichsseiten veröffentlichen",
        body: "Erstellen Sie Seiten wie „[Marke] vs. [Wettbewerber]“ und „Alternativen zu [Wettbewerber]“ mit korrekten, datierten Fakten, einem klaren Fazit je Anwendungsfall und einer Vergleichstabelle.",
      },
      {
        title: "Kernfakten leicht auslesbar machen",
        body: "Nennen Sie Preise, Zielgruppe, Integrationen und Grenzen als Klartext auf crawlbaren Seiten – nicht nur in Bildern, PDFs oder Skripten. Prüfen Sie das mit Crawlability.",
      },
      {
        title: "Die Aufgabenliste abarbeiten",
        body: "Optimizations → Tasks macht aus Belegen aus Tracker, Quellen und Audit priorisierte Aufgaben. Übertragen Sie sie nach Jira, Linear oder Asana, damit sie wirklich erledigt werden.",
      },
      {
        title: "Das Prompt-Set einfrieren",
        body: "Ändern oder löschen Sie während eines Messzeitraums keine Prompts. Neue Prompts kommen unter ein neues Tag, damit das ursprüngliche Set vergleichbar bleibt.",
      },
    ],
    measure: {
      items: [
        "Vergleichen Sie dasselbe Prompt-Set, dieselben Engines, dasselbe Land und dieselbe Sprache wie bei der Ausgangsmessung",
        "Nutzen Sie Durchschnitte über mindestens sieben Läufe je Zeitraum, niemals einzelne Tage",
        "Betrachten Sie Erwähnungsrate und Share of Voice je Tag (Shortlist, Direktvergleich, Alternative) getrennt",
        "Prüfen Sie, ob die Quellen, an denen Sie gearbeitet haben, jetzt unter Sources für diese Prompts erscheinen",
        "Achten Sie auf das Sentiment und die Begründungen der KI, nicht nur darauf, ob Sie genannt werden",
        "Zeigen Sie Vorher und Nachher mit der Vorlage Competitor Benchmark oder Monthly Report",
      ],
      aside: [
        { type: "h3", text: "Eine einfache Entscheidungsregel" },
        {
          type: "p",
          text: "Werten Sie eine Veränderung erst dann als echt, wenn sie zwei aufeinanderfolgende Messzeiträume hält und in mehr als einer Engine sichtbar ist. Ein einwöchiger Ausschlag in einer einzelnen Engine ist meist Rauschen.",
        },
      ],
    },
    variance: [
      {
        type: "p",
        text: "KI-Antworten sind probabilistisch. Derselbe Prompt kann morgen, in einem anderen Land oder nach einem Modell-Update eine andere Shortlist liefern. Rechnen Sie damit, dass sich Erwähnungsraten von Tag zu Tag um mehrere Prozentpunkte bewegen, auch wenn sich auf Ihrer Seite nichts geändert hat – je kleiner das Prompt-Set, desto größer die Ausschläge.",
      },
      { type: "p", text: "Drei Gewohnheiten machen Ihre Zahlen belastbarer:" },
      {
        type: "ul",
        items: [
          "**Mehr Prompts:** Zwölf Prompts liefern ein grobes Signal, 30–50 Prompts pro Thema ein deutlich stabileres.",
          "**Mehr Läufe:** Tägliches Tracking über eine Woche gleicht den Zufall einzelner Antworten aus.",
          "**Ein stabiles Setup:** Wechselnde Engines, Anbieter, Länder oder Sprachen zerstören die Vergleichbarkeit. AutoSEO kennzeichnet simulierte Engines, sodass Sie sie von nativen Antworten trennen können.",
        ],
      },
      {
        type: "callout",
        tone: "warn",
        title: "Engines verändern sich unter Ihnen",
        text: "Modell-Updates können die Antworten für alle gleichzeitig verschieben. Bewegen sich alle getrackten Marken zur selben Zeit in dieselbe Richtung, liegt es vermutlich an der Engine, nicht an Ihrer Arbeit.",
      },
    ],
    limitations: [
      "Das Tracking zeigt, was Engines auf Ihre Prompts antworten – nicht, wie viele Menschen diese Fragen tatsächlich stellen. Ein Gegenstück zum Suchvolumen gibt es für Prompts nicht.",
      "Antworten, die über APIs oder Datenanbieter abgerufen werden, können von dem abweichen, was eine angemeldete Person in der Consumer-App mit Personalisierung und Gedächtnis sieht.",
      "Änderungen an Ihren Seiten wirken erst, wenn Engines sie erneut crawlen oder abrufen; den Zeitpunkt bestimmen Sie nicht.",
      "Die Share of Voice bezieht sich auf die Wettbewerber, die Sie tracken. Eine geänderte Wettbewerberliste verändert den Vergleich – halten Sie sie für ein Vorher-Nachher konstant.",
    ],
    faq: [
      {
        q: "Wie viele Prompts brauche ich?",
        a: "Beginnen Sie mit den zwölf Vorlagen, erweitert um Ihre Kategorien und Wettbewerber. Für Entscheidungen sollten Sie 30 bis 50 Prompts pro Thema anstreben, weil mehr Prompts den Zufall einzelner Antworten ausgleichen. Halten Sie das Set während eines Messzeitraums unverändert.",
      },
      {
        q: "Wann sehe ich eine Veränderung?",
        a: "Einen verlässlichen Zeitplan gibt es nicht. Engines, die live im Web suchen – etwa ChatGPT mit Suche, Perplexity und Google AI Overviews –, können neue oder aktualisierte Seiten aufgreifen, sobald sie gecrawlt sind. Wissen aus dem Modelltraining ändert sich erst mit neuen Modellversionen. Messen Sie nach sechs bis acht Wochen erneut und danach monatlich.",
      },
      {
        q: "Sollten meine Prompts meinen Markennamen enthalten?",
        a: "Nutzen Sie beide Varianten und taggen Sie sie getrennt, denn sie messen Unterschiedliches. Prompts ohne Marke wie „beste [Kategorie]“ zeigen, ob KI Sie empfiehlt, ohne nach Ihnen gefragt zu werden – das Hauptziel dieses Playbooks. Prompts mit Marke wie „[Marke] vs. [Wettbewerber]“ zeigen, wie KI Sie bewertet, sobald Sie Teil der Frage sind.",
      },
      {
        q: "Ist es fair, Vergleichsseiten über Wettbewerber zu veröffentlichen?",
        a: "Ja, wenn sie korrekt, aktuell und fair sind. Irreführende Vergleiche schaden dem Vertrauen und können in vielen Ländern gegen die Regeln zur vergleichenden Werbung verstoßen. Belegen Sie Ihre Quellen, datieren Sie Ihre Fakten und aktualisieren Sie die Seiten, wenn sich Produkte ändern.",
      },
      {
        q: "Kann ich dieses Playbook für einen Kunden umsetzen?",
        a: "Ja. Legen Sie ein Projekt für den Kunden an, importieren Sie das Prompt-Set und nutzen Sie für die Präsentation die Report-Vorlagen Pitch oder Competitor Benchmark. Geben Sie dem Kunden mit der Rolle Client einen Lesezugriff.",
      },
    ],
    reading: [
      { label: "Query Fan-out erklärt", href: "/de/blog/query-fan-out", description: "Wie KI-Suchen eine Frage in viele Suchanfragen zerlegen und was das für Ihre Inhalte bedeutet." },
      { label: "Welche GEO-Techniken wirken?", href: "/de/blog/geo-techniques", description: "Was die Forschung über mehr KI-Sichtbarkeit zeigt, warum Studien sich widersprechen und wie Sie selbst testen." },
    ],
    related: ["get-cited-by-trusted-sources", "agency-pitch-in-14-days"],
  },
  {
    slug: "get-cited-by-trusted-sources",
    crumb: "Von vertrauten Quellen zitiert werden",
    icon: "link",
    meta: {
      title: "Playbook: Von den Quellen zitiert werden, denen KI vertraut",
      description:
        "GEO-Playbook: Finden Sie die Domains, die KI-Engines zu Ihren Themen zitieren, schließen Sie Zitierlücken seriös und messen Sie die Citation Rate.",
    },
    hero: {
      title: "Von den Quellen zitiert werden, denen KI vertraut",
      subtitle:
        "Engines, die im Web suchen, bauen ihre Antworten aus wenigen Quellen. Wenn diese Quellen Sie nicht erwähnen, tut es die Antwort auch nicht. Dieses Playbook erfasst die Quellen hinter Ihren Prompts und macht daraus einen Content- und Outreach-Plan.",
    },
    teaser: "Finden Sie die Seiten und Domains, die KI-Engines zu Ihren Themen zitieren, sehen Sie, wo Sie fehlen, und verdienen Sie sich dort seriöse Erwähnungen.",
    facts: [
      { label: "Ziel", value: "Höhere Citation Rate und mehr Erwähnungen in zitierten Quellen" },
      { label: "Für", value: "Content-, PR- und SEO-Teams" },
      { label: "Ausgangsmessung", value: "7–14 Tage tägliches Tracking" },
      { label: "Erneut messen", value: "Monatlich" },
    ],
    goal: [
      {
        type: "p",
        text: "Steigern Sie, wie oft KI-Engines **Ihre eigenen Seiten** zitieren – die **Zitierrate (Citation Rate)** – und wie oft die **Drittquellen, die sie zitieren,** Sie erwähnen. Ersteres hängt von Ihren Inhalten ab, Letzteres von Ihrer Präsenz in Medien, Bewertungsportalen, Verzeichnissen und Communitys.",
      },
    ],
    audience: [
      "Content-Teams, die entscheiden, was sie als Nächstes veröffentlichen",
      "PR-Teams, die auswählen, welche Medien sie ansprechen",
      "SEO-Teams mit Linkbuilding-Erfahrung, die nach KI-Wirkung priorisieren wollen",
      "Marken in Kategorien, die von Bewertungs- und Vergleichsportalen dominiert werden",
    ],
    prompts: {
      intro:
        "Zehn Vorlagen, teils Ratgeber-, teils Kauffragen. Ratgeberfragen zeigen, auf welche Erklärseiten und Leitfäden sich Engines stützen; Kauffragen zeigen, auf welche Tests und Listen.",
      placeholders: [
        "`[Thema]` – ein Thema, für das Sie bekannt sein wollen, z. B. „Balkonkraftwerke“",
        "`[Kategorie]` – Ihre Produktkategorie",
        "`[Problem]` – ein Problem, das Ihr Produkt löst",
        "`[Zielgruppe]` – ein Käufersegment",
      ],
      rows: [
        { prompt: "Was ist [Thema] und wie funktioniert es?", tags: ["Quellen", "Ratgeber"] },
        { prompt: "Wie finde ich die richtige [Kategorie]?", tags: ["Quellen", "Ratgeber", "Kaufberatung"] },
        { prompt: "Worauf sollte ich beim Kauf einer [Kategorie] achten?", tags: ["Quellen", "Ratgeber", "Kaufberatung"] },
        { prompt: "Wie kann ich [Problem] lösen?", tags: ["Quellen", "Ratgeber"] },
        { prompt: "Welche typischen Fehler gibt es bei [Thema]?", tags: ["Quellen", "Ratgeber"] },
        { prompt: "Welche [Kategorie] schneidet in Tests am besten ab?", tags: ["Quellen", "Kauffrage"] },
        { prompt: "Welche [Kategorie] ist am zuverlässigsten?", tags: ["Quellen", "Kauffrage"] },
        { prompt: "Lohnt sich eine [Kategorie] für [Zielgruppe]?", tags: ["Quellen", "Kauffrage"] },
        { prompt: "Welchen [Kategorie]-Marken kann man vertrauen?", tags: ["Quellen", "Kauffrage"] },
        { prompt: "Wo kann ich [Kategorie]-Angebote vergleichen?", tags: ["Quellen", "Kauffrage"] },
      ],
    },
    engines: {
      intro: "Für die Quellenanalyse brauchen Sie Engines, die ihre Quellen offenlegen.",
      head: ["Engine", "Warum sie für Zitate zählt"],
      rows: [
        ["Perplexity", "Zeigt zu jeder Antwort nummerierte Quellen – der klarste Blick darauf, was zitiert wird."],
        ["ChatGPT (mit Websuche)", "Nennt Quellen, wenn er sucht, und erreicht das größte Publikum aller Assistenten."],
        ["Google AI Overviews und AI Mode", "Verlinken die Seiten, die sie zusammenfassen – oft Seiten, die auch in den klassischen Ergebnissen ranken."],
        ["Gemini und Microsoft Copilot", "Stützen sich auf die Google- bzw. Bing-Suche – hilfreich, um die Unterschiede zwischen beiden Indizes zu sehen."],
      ],
    },
    baseline: [
      {
        title: "Importieren und tracken",
        body: "Importieren Sie das Prompt-Set, wählen Sie Engines, die Quellen zitieren, und tracken Sie ein bis zwei Wochen täglich, bis sich die Quellenliste stabilisiert.",
      },
      {
        title: "Quellen erfassen",
        body: "AI Visibility → Sources listet die für Ihre Prompts zitierten Seiten und Domains, gruppiert nach Quellentyp. Notieren Sie die am häufigsten zitierten Domains.",
      },
      {
        title: "Lücken markieren",
        body: "Prüfen Sie für jede Top-Domain, ob sie Sie erwähnt, nur Wettbewerber erwähnt oder keinen von beiden. Das ist Ihre Lückenliste.",
      },
      {
        title: "Ausgangswert festhalten",
        body: "Notieren Sie Ihre Citation Rate je Engine und Tag im Tracker und speichern Sie einen Report aus der Vorlage Citation Analysis.",
      },
    ],
    actions: [
      {
        title: "Nach Zitierhäufigkeit priorisieren",
        body: "Beginnen Sie mit den Domains, die für Ihre Prompts am häufigsten zitiert werden. Ein Nischenforum, das in vielen Antworten auftaucht, zählt mehr als eine bekannte Website, die nie vorkommt.",
      },
      {
        title: "Eigene Seiten verbessern",
        body: "Beantworten Sie die Frage des Prompts im ersten Absatz, ergänzen Sie Fakten mit Datum und Quelle und nutzen Sie klare Zwischenüberschriften und Tabellen. Seiten, die Engines bereits zitieren, sind Ihre Vorlage.",
      },
      {
        title: "Erwähnungen in redaktionellen Quellen verdienen",
        body: "Bieten Sie den zitierten Medien Daten, Expertenstatements oder Produktzugang an. Bezahlen Sie nie für nicht gekennzeichnete Platzierungen – das ist ein rechtliches Risiko und ein Vertrauensrisiko.",
      },
      {
        title: "Einträge vervollständigen",
        body: "Halten Sie Ihre Profile auf den Bewertungsplattformen, Marktplätzen und Verzeichnissen vollständig und aktuell, die unter Sources auftauchen.",
      },
      {
        title: "Ehrlich in Communitys mitwirken",
        body: "Werden Foren oder Q&A-Seiten zitiert, beantworten Sie dort Fragen hilfreich unter Ihrem echten Namen und legen Sie Ihre Zugehörigkeit offen. Astroturfing wird gelöscht – und nicht vergessen.",
      },
      {
        title: "Technischen Zugang prüfen",
        body: "Stellen Sie sicher, dass KI-Crawler Ihre Seiten abrufen können und dass Fakten im HTML stehen, nicht nur in Skripten oder Bildern. Siehe das Playbook zum Crawler-Zugang.",
      },
    ],
    measure: {
      items: [
        "Citation Rate Ihrer eigenen Domain je Engine, für dasselbe Prompt-Set, gemittelt über mindestens sieben Läufe",
        "Anzahl der meistzitierten Domains, die Sie inzwischen erwähnen, von Hand nachgeprüft",
        "Erwähnungsrate und Position für die Prompts mit dem Tag Kauffrage",
        "Neue eigene Seiten, die unter Sources erscheinen",
        "Vorher und Nachher mit der Report-Vorlage Citation Analysis",
      ],
      aside: [
        { type: "h3", text: "Protokollieren Sie, was Sie wann getan haben" },
        {
          type: "p",
          text: "Führen Sie ein datiertes Protokoll über veröffentlichte Seiten, Pitches und neue Einträge. Ohne dieses Protokoll können Sie eine spätere Veränderung bei den Zitaten keiner konkreten Maßnahme zuordnen.",
        },
      ],
    },
    variance: [
      {
        type: "p",
        text: "Zitierte Quellen ändern sich langsamer als der Wortlaut der Antworten, aber sie ändern sich: Engines ordnen die abgerufenen Seiten für jede Anfrage neu, und die Websuchergebnisse verschieben sich. Eine einzelne Antwort kann drei oder fünfzehn Quellen nennen. Beurteilen Sie eine Domain danach, wie oft sie über viele Antworten hinweg zitiert wird, nicht nach einer einzelnen Antwort.",
      },
      {
        type: "callout",
        tone: "info",
        title: "Zitate sind keine Klicks",
        text: "Zitiert zu werden garantiert keinen Traffic. Messen Sie Besuche, die von KI-Plattformen kommen, separat unter Analytics → Human Traffic.",
      },
    ],
    limitations: [
      "Drittquellen können Sie beeinflussen, aber nicht steuern: Was dort steht, entscheiden die Redaktionen.",
      "Engines, die ohne Websuche antworten, stützen sich auf Trainingsdaten und zitieren nichts; diese Antworten ändert das Playbook kurzfristig nicht.",
      "Quellen hängen von Land und Sprache ab – bearbeiten Sie jeden Markt separat.",
      "Eine höhere Citation Rate bedeutet nicht automatisch mehr Erwähnungen: Engines zitieren manchmal eine Seite und nennen in der Antwort trotzdem andere Marken.",
    ],
    faq: [
      {
        q: "Was ist der Unterschied zwischen einer Erwähnung und einem Zitat?",
        a: "Eine Erwähnung ist Ihr Markenname im Antworttext. Ein Zitat ist ein Link auf eine Quelle, die die Engine genutzt hat. Sie können zitiert werden, ohne erwähnt zu werden – wenn Ihre Seite in eine Antwort einfließt, die andere nennt –, und erwähnt werden, ohne zitiert zu werden – wenn die Engine Sie aus anderen Quellen kennt. AutoSEO trackt beides.",
      },
      {
        q: "Sollte ich für Platzierungen auf zitierten Websites bezahlen?",
        a: "Nicht für ungekennzeichnete. In den meisten Märkten müssen bezahlte Platzierungen als Werbung gekennzeichnet werden, und Redaktionen wie Engines werten erkennbar bezahlte Inhalte zunehmend ab. Verdienen Sie sich Erwähnungen stattdessen mit nützlichen Daten, Expertise und Produktzugang.",
      },
      {
        q: "An wie vielen Quellen sollte ich gleichzeitig arbeiten?",
        a: "Beginnen Sie mit den zehn Domains, die für Ihre Kauffragen am häufigsten zitiert werden. Das ist meist genug Arbeit für ein Quartal und bündelt den Aufwand dort, wo Engines tatsächlich hinschauen.",
      },
      {
        q: "Spielt klassisches SEO dafür noch eine Rolle?",
        a: "Ja. Engines, die im Web suchen, greifen oft auf Seiten zurück, die in ihrem Suchindex gut ranken. Keyword-Recherche, Rank Tracking und Site Audits in AutoSEO dienen demselben Ziel wie dieses Playbook.",
      },
      {
        q: "Warum zitiert Perplexity andere Quellen als ChatGPT?",
        a: "Die Engines nutzen unterschiedliche Suchindizes, Abrufverfahren und Rankings. Deshalb trackt dieses Playbook mehrere Engines und vergleicht die Quellen je Engine, statt davon auszugehen, dass eine Liste für alle gilt.",
      },
    ],
    reading: [
      { label: "Welche GEO-Techniken wirken?", href: "/de/blog/geo-techniques", description: "Was die Forschung über mehr KI-Sichtbarkeit zeigt, warum Studien sich widersprechen und wie Sie selbst testen." },
      { label: "Query Fan-out erklärt", href: "/de/blog/query-fan-out", description: "Wie KI-Suchen eine Frage in viele Suchanfragen zerlegen und was das für Ihre Inhalte bedeutet." },
      { label: "Google AI Mode vs. AI Overviews", href: "/de/blog/ai-mode-vs-ai-overviews", description: "Wie sich Googles zwei KI-Antwortformate unterscheiden und wie Sie beide messen." },
    ],
    related: ["win-comparison-prompts", "fix-ai-crawler-access"],
  },
  {
    slug: "fix-ai-crawler-access",
    crumb: "KI-Crawler-Zugang beheben",
    icon: "bot",
    meta: {
      title: "Playbook: KI-Crawler-Zugang zu Ihrer Website beheben",
      description:
        "Technisches GEO-Playbook: robots.txt, Rendering, Meta-Direktiven und Sitemaps für KI-Crawler prüfen, Blockaden beheben, mit echtem Bot-Traffic verifizieren.",
    },
    hero: {
      title: "KI-Crawler-Zugang beheben",
      subtitle:
        "Wenn KI-Crawler Ihre Seiten nicht abrufen oder lesen können, hilft keine Content-Strategie. Dieses Playbook führt zuerst die technischen Prüfungen durch, behebt, was KI-Engines blockiert, und verifiziert das Ergebnis mit echten Crawler-Besuchen.",
    },
    teaser: "Prüfen Sie, ob GPTBot, ClaudeBot, PerplexityBot und andere Ihre Website tatsächlich lesen können, beheben Sie Blockaden und verifizieren Sie das mit Bot-Traffic.",
    facts: [
      { label: "Ziel", value: "KI-Crawler können Ihre wichtigsten Seiten abrufen und lesen" },
      { label: "Für", value: "SEO-, Web- und Plattform-Teams" },
      { label: "Ausgangsmessung", value: "Ein Crawlability-Check plus 7 Tage Tracking" },
      { label: "Erneut messen", value: "Nach jedem Fix und jedem Release" },
    ],
    goal: [
      {
        type: "p",
        text: "Stellen Sie sicher, dass die Crawler hinter KI-Suche und Assistenten – etwa **OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot** und **Googlebot** – dort zugelassen sind, wo Sie es wollen, dieselben Inhalte wie Browser erhalten und Ihre wichtigen Seiten finden. Das ist die Voraussetzung für alle anderen Playbooks.",
      },
      {
        type: "p",
        text: "Crawler haben unterschiedliche Zwecke: **Such-Crawler** indexieren Seiten für die KI-Suche, **User-Agents** rufen eine Seite ab, wenn jemand danach fragt, und **Trainings-Crawler** wie GPTBot und ClaudeBot sammeln Daten für künftige Modelle. Sie können jede Gruppe unterschiedlich behandeln.",
      },
    ],
    audience: [
      "SEO-Teams, die technische Ursachen für geringe KI-Sichtbarkeit vermuten",
      "Web- und Plattform-Teams, die CDNs, Firewalls oder Bot-Schutz betreiben",
      "Websites, die als JavaScript-Single-Page-Apps gebaut sind",
      "Alle, die robots.txt oder Bot-Einstellungen geändert haben und die Wirkung prüfen wollen",
    ],
    prompts: {
      intro:
        "Zehn Abruf-Prompts: Faktenfragen, die Engines nur dann richtig beantworten können, wenn sie Ihre Seiten lesen können. Sie sind der Praxistest für den Crawler-Zugang.",
      placeholders: [
        "`[Marke]` – Ihr Markenname",
        "`[Produkt]` – ein Produkt oder Tarif",
        "`[Funktion]` – eine Funktion, die auf Ihrer Website beschrieben ist",
        "`[Domain]` – Ihre Domain, z. B. „beispiel.de“",
      ],
      rows: [
        { prompt: "Was kostet [Marke]?", tags: ["Abruf", "Preise"] },
        { prompt: "Bietet [Marke] [Funktion] an?", tags: ["Abruf", "Produkt"] },
        { prompt: "Was ist [Produkt] von [Marke]?", tags: ["Abruf", "Produkt"] },
        { prompt: "Welche Integrationen unterstützt [Marke]?", tags: ["Abruf", "Produkt"] },
        { prompt: "Für wen ist [Marke] gedacht?", tags: ["Abruf", "Positionierung"] },
        { prompt: "Wie sind die Rückgabe- oder Kündigungsbedingungen von [Marke]?", tags: ["Abruf", "Richtlinien"] },
        { prompt: "Wie erreiche ich den Support von [Marke]?", tags: ["Abruf", "Support"] },
        { prompt: "Was steht auf der Preisseite von [Domain]?", tags: ["Abruf", "Preise"] },
        { prompt: "Was gibt es Neues bei [Marke]?", tags: ["Abruf", "Aktualität"] },
        { prompt: "Wo sitzt [Marke] und wer steht dahinter?", tags: ["Abruf", "Unternehmen"] },
      ],
    },
    engines: {
      intro: "Tracken Sie die Engines, deren Crawler Sie freischalten, damit sich die Wirkung in den Antworten zeigen kann.",
      head: ["Engine", "Beteiligte Crawler"],
      rows: [
        ["ChatGPT", "OAI-SearchBot indexiert für die Suche, ChatGPT-User ruft Seiten auf Anfrage ab, GPTBot sammelt Trainingsdaten."],
        ["Claude", "Claude-SearchBot, Claude-User und ClaudeBot (Training) – jeder lässt sich einzeln zulassen oder sperren."],
        ["Perplexity", "PerplexityBot indexiert Seiten; Perplexity-User ruft sie ab, wenn jemand danach fragt."],
        ["Google AI Overviews, AI Mode und Gemini", "Stützen sich auf den Index des Googlebot. Google-Extended ist ein robots.txt-Token ohne eigenen Crawler, das die Nutzung für Gemini-Modelle regelt; aus den AI Overviews entfernt es Sie nicht."],
      ],
    },
    baseline: [
      {
        title: "Crawlability-Check ausführen",
        body: "Optimizations → Crawlability prüft robots.txt-Regeln je KI-Crawler, Crawl-Delay, ob Crawler-User-Agents dieselben Seiten wie Browser erhalten, serverseitiges Rendering, Meta Robots und X-Robots-Tag, Sitemaps, llms.txt, strukturierte Daten und Canonicals.",
      },
      {
        title: "Crawler-Richtlinie festlegen",
        body: "Entscheiden Sie je Zweck – Suche, Nutzeranfragen, Training –, welche Crawler Sie zulassen. Halten Sie die Entscheidung schriftlich fest, bevor Sie etwas ändern.",
      },
      {
        title: "Bot-Traffic anbinden",
        body: "Verbinden Sie unter Analytics → Bot Traffic Cloudflare oder Akamai, laden Sie Server-Logs hoch oder senden Sie sie per Webhook. Besuche werden mit den IP-Bereichen abgeglichen, die die Crawler-Betreiber veröffentlichen.",
      },
      {
        title: "Abruf-Prompts tracken",
        body: "Importieren Sie das Prompt-Set und tracken Sie es eine Woche lang täglich. Notieren Sie, welche Fragen jede Engine anhand Ihrer Seiten richtig beantwortet.",
      },
    ],
    actions: [
      {
        title: "Gewünschte Crawler freischalten",
        body: "Entfernen Sie Disallow-Regeln für die KI-Such- und User-Crawler, die Sie zulassen wollen. Achten Sie auf pauschale Regeln wie `User-agent: *` mit `Disallow: /` und auf Überbleibsel aus der Staging-Umgebung.",
      },
      {
        title: "CDN- und Firewall-Regeln prüfen",
        body: "Bot-Schutz und WAF-Regeln blockieren KI-Crawler oft, bevor robots.txt überhaupt greift. Lassen Sie verifizierte Crawler ausdrücklich zu und führen Sie den Check danach erneut aus.",
      },
      {
        title: "Inhalte im HTML ausliefern",
        body: "Viele Crawler führen kein JavaScript aus und sehen nur das rohe HTML. Rendern Sie wichtige Texte, Überschriften und Links auf dem Server.",
      },
      {
        title: "Versehentliches noindex und noai entfernen",
        body: "Prüfen Sie Meta Robots und X-Robots-Tag auf wichtigen Seiten. noindex, noai oder nosnippet können Inhalte aus Antworten heraushalten.",
      },
      {
        title: "Sitemaps und eine llms.txt veröffentlichen",
        body: "Eine vollständige XML-Sitemap hilft Crawlern, Seiten zu finden. llms.txt ist optional und wird nicht von jeder Engine genutzt, kostet aber wenig.",
      },
      {
        title: "Strukturierte Daten und saubere Canonicals ergänzen",
        body: "JSON-LD auf der Startseite und wichtigen Seiten sowie eindeutige Canonical-URLs machen klar, welche Seite welchen Fakt nennt.",
      },
    ],
    measure: {
      items: [
        "Behobene Crawlability-Befunde, nach jedem Fix erneut geprüft",
        "Verifizierte Besuche je KI-Crawler unter Bot Traffic, Woche für Woche verglichen",
        "Anteil der Abruf-Prompts, die je Engine richtig beantwortet werden",
        "Zitate Ihrer eigenen Seiten in den Antworten auf die Abruf-Prompts",
        "Ein neuer Check nach jedem Release, weil Deployments Blockaden oft wieder einführen",
      ],
      aside: [
        { type: "h3", text: "Rechnen Sie mit Verzögerung" },
        {
          type: "p",
          text: "Crawler kommen nach ihrem eigenen Zeitplan wieder. Es kann Tage oder Wochen dauern, bis eine freigeschaltete Seite abgerufen wird, und länger, bis sie in Antworten auftaucht.",
        },
      ],
    },
    variance: [
      {
        type: "p",
        text: "Die technischen Prüfungen sind deterministisch: Eine robots.txt-Regel blockiert einen Crawler oder eben nicht. Die Wirkung auf Antworten ist es nicht. Ob eine Engine Ihre Seite für eine Frage abruft, hängt von ihrem Abrufverfahren ab, und Trainings-Crawler beeinflussen nur künftige Modellversionen.",
      },
      {
        type: "p",
        text: "Auch Crawler-Besuche schwanken – mit dem Crawl-Budget und Ihrer eigenen Veröffentlichungsaktivität. Vergleichen Sie Wochensummen, keine einzelnen Tage.",
      },
    ],
    limitations: [
      "Crawler zuzulassen macht Sie berechtigt, nicht sichtbar. Ob Engines Ihre Seiten nutzen, entscheiden weiterhin Inhalt und Autorität.",
      "robots.txt ist eine Bitte, keine Zugriffskontrolle. Crawler, die sie ignorieren, müssen im CDN oder in der Firewall gestoppt werden.",
      "Besuche von Crawlern, deren Betreiber keine IP-Bereiche veröffentlichen, lassen sich nicht verifizieren.",
      "Wer Trainings-Crawler heute sperrt, entfernt seine Inhalte nicht aus Modellen, die es bereits gibt.",
    ],
    faq: [
      {
        q: "Sollte ich KI-Trainings-Crawler sperren?",
        a: "Das ist eine geschäftliche Entscheidung, keine technische. Wer Trainings-Crawler wie GPTBot oder ClaudeBot sperrt, hält seine Inhalte aus künftigen Trainingsdaten heraus, ändert aber nichts an bereits genutzten Inhalten. Such- und User-Crawler wie OAI-SearchBot, ChatGPT-User, Claude-SearchBot und PerplexityBot erlauben Engines, Ihre Seiten abzurufen, um Fragen zu beantworten – sie zu sperren kostet in der Regel Sichtbarkeit.",
      },
      {
        q: "Verbessert eine llms.txt die KI-Sichtbarkeit?",
        a: "Keine große Engine hat bestätigt, llms.txt für Ranking oder Zitate zu nutzen. Die Datei kostet wenig und hilft manchen KI-Agenten bei der Navigation auf Ihrer Website, deshalb prüft AutoSEO sie – beheben Sie aber zuerst robots.txt, Rendering und Meta-Direktiven.",
      },
      {
        q: "Warum sollten Crawler andere Seiten erhalten als Browser?",
        a: "Meist wegen Bot-Schutz: CDNs und Firewalls liefern unbekannten Bots Challenges, Sperren oder abgespeckte Seiten aus. AutoSEO ruft Ihre Seiten mit echten Crawler-User-Agents ab und vergleicht das Ergebnis mit einer Browser-Anfrage, sodass Sie den Unterschied sehen.",
      },
      {
        q: "Woher weiß ich, dass ein Besuch wirklich von OpenAI oder Anthropic kam?",
        a: "User-Agents lassen sich fälschen. AutoSEO gleicht Crawler-Besuche mit den IP-Bereichen ab, die OpenAI, Anthropic, Perplexity, Google und andere Betreiber veröffentlichen, und trennt verifizierte von nicht verifizierten Besuchen.",
      },
      {
        q: "Brauche ich für diese Fixes einen Entwickler?",
        a: "Für robots.txt und CDN-Einstellungen oft nicht. Rendering-Probleme, Meta-Direktiven und strukturierte Daten brauchen meist Ihr Web-Team. Machen Sie aus den Befunden Aufgaben und übertragen Sie sie aus Optimizations → Tasks nach Jira, Linear oder in Ihr Projekttool.",
      },
    ],
    reading: [
      { label: "Können KI-Crawler Ihre Website lesen?", href: "/de/blog/ai-crawler-readability", description: "Welche KI-Crawler kommen, welche die robots.txt befolgen und wie JavaScript, CDN-Bot-Schutz und llms.txt wirken." },
    ],
    related: ["get-cited-by-trusted-sources", "protect-brand-facts"],
  },
  {
    slug: "protect-brand-facts",
    crumb: "Markenfakten schützen",
    icon: "shield",
    meta: {
      title: "Playbook: Marken- und Produktfakten in KI-Antworten schützen",
      description:
        "Playbook für regulierte und detailreiche Marken: KI-Aussagen mit Fact Check gegen freigegebene Referenzdokumente prüfen, Fehlerquellen beheben, erneut messen.",
    },
    hero: {
      title: "Markenfakten mit Fact Check schützen",
      subtitle:
        "KI-Engines nennen Preise, Dosierungen, technische Daten und Bedingungen mit großer Sicherheit – und manchmal falsch. Dieses Playbook vergleicht KI-Aussagen mit Fact Check gegen Ihre freigegebenen Dokumente und macht aus Widersprüchen Korrekturen.",
    },
    teaser: "Prüfen Sie, was KI-Engines über Ihre Produkte sagen, gegen Ihre freigegebenen Dokumente und beheben Sie die Quellen hinter falschen Aussagen.",
    facts: [
      { label: "Ziel", value: "Weniger widersprüchliche, veraltete und unbelegte Aussagen" },
      { label: "Für", value: "Pharma, Finanzen, Gesundheit und komplexe B2B-Produkte" },
      { label: "Ausgangsmessung", value: "7–14 Tage tägliches Tracking" },
      { label: "Erneut messen", value: "Nach jedem Lauf; monatliche Auswertung" },
    ],
    goal: [
      {
        type: "p",
        text: "Senken Sie den Anteil der KI-Aussagen über Ihre Produkte, die Ihren freigegebenen Referenzdokumenten **widersprechen**, über sie **hinausgehen** (off-label), von ihnen **nicht gedeckt** sind oder **veraltete** Fakten wiedergeben. Korrekte Aussagen sollen als Übereinstimmung bestätigt werden.",
      },
    ],
    audience: [
      "Pharma- und Medizintechnikunternehmen mit zugelassenen Fachinformationen wie einer SmPC",
      "Banken, Versicherer und Fintechs mit Konditionen, Gebühren und Bedingungen",
      "Hersteller mit technischen Spezifikationen",
      "Jede Marke, deren Preise, Richtlinien oder Produktfakten sich häufig ändern",
    ],
    prompts: {
      intro:
        "Zwölf Vorlagen, die Engines dazu bringen, konkrete Fakten zu nennen. Fact Check prüft getrackte Antworten, die ein Asset erwähnen – deshalb nennen diese Prompts das Produkt.",
      placeholders: [
        "`[Produkt]` – das Produkt so, wie es in Fact Check heißt (Schreibvarianten dort als Aliase hinterlegen)",
        "`[Situation]` – eine Indikation, ein Anwendungsfall oder eine Kundensituation",
        "`[Land]` – ein Markt, den Sie prüfen, z. B. „Deutschland“",
        "`[Marke]` – Ihre Marke",
      ],
      rows: [
        { prompt: "Wofür wird [Produkt] verwendet?", tags: ["Fakten", "Indikation"] },
        { prompt: "Wie wendet man [Produkt] richtig an?", tags: ["Fakten", "Anwendung"] },
        { prompt: "Welche Nebenwirkungen oder Risiken hat [Produkt]?", tags: ["Fakten", "Risiko"] },
        { prompt: "Wer sollte [Produkt] nicht verwenden?", tags: ["Fakten", "Risiko"] },
        { prompt: "Was kostet [Produkt]?", tags: ["Fakten", "Preis"] },
        { prompt: "Welche Bedingungen gelten für [Produkt]?", tags: ["Fakten", "Bedingungen"] },
        { prompt: "Ist [Produkt] für [Situation] geeignet?", tags: ["Fakten", "Eignung"] },
        { prompt: "Welche technischen Daten hat [Produkt]?", tags: ["Fakten", "Technische Daten"] },
        { prompt: "Was unterscheidet [Produkt] von der Vorgängerversion?", tags: ["Fakten", "Versionen"] },
        { prompt: "Ist [Produkt] in [Land] zugelassen?", tags: ["Fakten", "Zulassung"] },
        { prompt: "Was sagen Experten über [Produkt]?", tags: ["Fakten", "Reputation"] },
        { prompt: "Was bietet [Marke] bei [Situation] an?", tags: ["Fakten", "Portfolio"] },
      ],
    },
    engines: {
      intro: "Prüfen Sie die Engines, die Ihre Kunden – und in regulierten Branchen auch Patienten und Berater – tatsächlich nutzen.",
      head: ["Engine", "Warum sie für den Faktencheck zählt"],
      rows: [
        ["ChatGPT", "Der Assistent, den Menschen am häufigsten für Gesundheits-, Finanz- und Produktfragen nutzen."],
        ["Google AI Overviews und AI Mode", "Beantworten Faktenfragen direkt auf der Suchergebnisseite."],
        ["Perplexity", "Dank zitierter Quellen lässt sich eine falsche Aussage leicht bis zur Seite dahinter zurückverfolgen."],
        ["Gemini, Claude, Microsoft Copilot", "Für eine vollständige Abdeckung: Falsche Fakten unterscheiden sich oft von Engine zu Engine."],
      ],
    },
    baseline: [
      {
        title: "Assets anlegen",
        body: "Legen Sie in Fact Check pro Produkt ein Asset an – mit Namen, Schreibvarianten und den zu prüfenden Märkten samt Behörde, z. B. DE · EMA oder US · FDA.",
      },
      {
        title: "Referenzdokumente hochladen",
        body: "Laden Sie die freigegebene Fachinformation, das Datenblatt oder die Bedingungen als PDF, eingefügten Text oder URL hoch. AutoSEO zerlegt sie für den Abgleich in Abschnitte.",
      },
      {
        title: "Prompts importieren und tracken",
        body: "Importieren Sie das Prompt-Set. Nach jedem Tracking-Lauf werden Antworten, die ein Asset erwähnen, gegen dessen Referenzdokumente geprüft.",
      },
      {
        title: "Verdicts festhalten",
        body: "Notieren Sie auf der Seite Accuracy die Anzahl je Verdict – matched, needs review, off-label, contradicted, unsupported, outdated – je Engine und Markt.",
      },
    ],
    actions: [
      {
        title: "Befunde sichten",
        body: "Beginnen Sie mit den Befunden contradicted und off-label, danach mit outdated. Jeder Befund zeigt die Aussage und ihr Verdict.",
      },
      {
        title: "Die Quelle jedes Fehlers finden",
        body: "Öffnen Sie die Antwort und ihre zitierten Quellen. Falsche Aussagen stammen meist von veralteten eigenen Seiten, alten Pressemitteilungen, Datenbanken Dritter oder Foren.",
      },
      {
        title: "Zuerst die eigenen Seiten korrigieren",
        body: "Aktualisieren Sie veraltete Seiten oder leiten Sie sie um, nennen Sie aktuelle Fakten als klaren, datierten Text und nehmen Sie alte PDFs offline, die noch im Umlauf sind.",
      },
      {
        title: "Dritte um Korrektur bitten",
        body: "Bitten Sie zitierte Verlage, Verzeichnisse und Datenbanken, falsche Fakten zu korrigieren – mit einem Link zum aktuellen Quelldokument.",
      },
      {
        title: "Befunde durch die Freigabe leiten",
        body: "Geben Sie medizinischen, rechtlichen oder Compliance-Prüfern mit einer passenden Rolle Zugriff auf das Projekt. Über Befunde mit „needs review“ entscheiden Menschen.",
      },
      {
        title: "Referenzdokumente aktuell halten",
        body: "Ändern sich Fachinformation, Preis oder Bedingung, laden Sie die neue Version sofort hoch – sonst sehen korrekte neue Antworten wie Fehler aus.",
      },
    ],
    measure: {
      items: [
        "Anzahl je Verdict, Engine und Markt auf der Seite Accuracy, verglichen mit der Ausgangsmessung",
        "Anteil der Aussagen mit contradicted und off-label an allen geprüften Aussagen",
        "Geschlossene gegenüber neuen Befunden pro Monat",
        "Ob die korrigierten Quellen weiterhin hinter falschen Aussagen auftauchen",
      ],
      aside: [
        { type: "h3", text: "Für Compliance dokumentieren" },
        {
          type: "p",
          text: "Dokumentieren Sie Befunde und die ergriffenen Maßnahmen. Fact Check zeigt, was die KI gesagt hat; Ihre Dokumentation zeigt, wie Sie reagiert haben.",
        },
      ],
    },
    variance: [
      {
        type: "p",
        text: "Faktenfehler sind hartnäckig und zufällig zugleich. Eine Engine wiederholt womöglich monatelang einen veralteten Preis, weil eine alte Seite gut rankt – und nennt am nächsten Tag einen anderen falschen Preis. Beurteilen Sie Fortschritt am Anteil problematischer Verdicts über viele Antworten, nicht an einzelnen Antworten.",
      },
      {
        type: "callout",
        tone: "warn",
        title: "Automatische Prüfungen brauchen menschliche Kontrolle",
        text: "Fact Check nutzt KI, um Aussagen mit Ihren Dokumenten abzugleichen. Es markiert Aussagen zur Prüfung; rechtliche oder medizinische Bewertungen trifft es nicht. Befunde mit „needs review“ und jeder kritische Befund sollten von einer qualifizierten Person geprüft werden.",
      },
    ],
    limitations: [
      "Fact Check kann nur Aussagen beurteilen, die Ihre hochgeladenen Referenzdokumente abdecken.",
      "Geprüft werden Antworten auf getrackte Prompts, nicht jedes Gespräch, das Menschen mit KI führen.",
      "Sie können keine Engine zwingen, eine Aussage zu korrigieren; Sie können nur die Quellen korrigieren und stärken, auf die sie sich stützt.",
      "Dies ist kein Pharmakovigilanz- oder Meldesystem. Könnte eine KI-Antwort Menschen schaden, folgen Sie Ihrem internen Eskalationsprozess.",
    ],
    faq: [
      {
        q: "Welche Dokumente kann ich als Referenz nutzen?",
        a: "Alles, was die freigegebenen Fakten festhält: eine Fachinformation oder SmPC, ein Datenblatt, Geschäftsbedingungen, eine Preisliste. Laden Sie sie als PDF, als eingefügten Text oder per URL hoch.",
      },
      {
        q: "Was bedeuten die Verdicts?",
        a: "Matched heißt, die Aussage stimmt mit Ihrer Referenz überein. Contradicted heißt, sie behauptet das Gegenteil. Off-label heißt, sie geht über das hinaus, was die Referenz abdeckt, etwa eine nicht zugelassene Anwendung. Unsupported heißt, die Referenz stützt sie nicht. Outdated heißt, sie gibt Fakten wieder, die nicht mehr aktuell sind. Needs review heißt, ein Mensch muss entscheiden.",
      },
      {
        q: "Kann ich mehrere Länder prüfen?",
        a: "Ja. Jedes Asset führt die Märkte, für die es geprüft wird, samt Behörde, zum Beispiel DE · EMA und US · FDA. Prompts tragen ein Land, sodass Sie die Antworten je Markt getrennt tracken können.",
      },
      {
        q: "Ersetzt das unsere medizinische oder rechtliche Prüfung?",
        a: "Nein. Fact Check hilft Ihnen, die prüfenswerten Aussagen schnell und konsistent zu finden. Die Entscheidung, was korrekt ist und was zu tun ist, bleibt bei qualifizierten Personen in Ihrem Unternehmen.",
      },
      {
        q: "Wo werden unsere Referenzdokumente verarbeitet?",
        a: "Sie werden in Ihrer AutoSEO-Instanz gespeichert. Für den Abgleich wird der relevante Text an den auf der Instanz konfigurierten KI-Anbieter gesendet oder über Ihren lokalen Claude-Code- oder Codex-Agenten verarbeitet. Hosten Sie AutoSEO selbst, wenn Dokumente Ihre Infrastruktur nur in Richtung eines KI-Anbieters Ihrer Wahl verlassen dürfen.",
      },
    ],
    reading: [
      { label: "Können KI-Crawler Ihre Website lesen?", href: "/de/blog/ai-crawler-readability", description: "Welche KI-Crawler kommen, welche die robots.txt befolgen und wie JavaScript, CDN-Bot-Schutz und llms.txt wirken." },
      { label: "Google AI Mode vs. AI Overviews", href: "/de/blog/ai-mode-vs-ai-overviews", description: "Wie sich Googles zwei KI-Antwortformate unterscheiden und wie Sie beide messen." },
    ],
    related: ["fix-ai-crawler-access", "get-cited-by-trusted-sources"],
  },
  {
    slug: "attribute-ai-search-revenue",
    crumb: "Umsatz aus KI-Suche zuordnen",
    icon: "chart",
    meta: {
      title: "Playbook: Umsatz der KI-Suche zuordnen",
      description:
        "Umsatz aus KI-Suche messen: Umfrage „Wie sind Sie auf uns aufmerksam geworden?“, Conversions aus Stripe, Shopify oder CRM und KI-Referral-Traffic.",
    },
    hero: {
      title: "Umsatz aus der KI-Suche zuordnen",
      subtitle:
        "Viele Käufer, die Sie über KI finden, klicken nie auf einen messbaren Link: Sie fragen, lesen und tippen später Ihren Namen ein. Dieses Playbook verbindet selbst angegebene Herkunft mit Bestellungen und Deals – so steht neben Ihrer KI-Sichtbarkeit eine Umsatzzahl.",
    },
    teaser: "Verbinden Sie Antworten auf „Wie sind Sie auf uns aufmerksam geworden?“ mit Bestellungen und Deals und sehen Sie, wie viel Umsatz die KI-Suche wirklich bringt.",
    facts: [
      { label: "Ziel", value: "Ein belastbarer Umsatzanteil aus der KI-Suche" },
      { label: "Für", value: "E-Commerce, SaaS, B2B-Leadgenerierung" },
      { label: "Ausgangsmessung", value: "2–4 Wochen Umfrageantworten" },
      { label: "Erneut messen", value: "Monatlich, in rollierenden 3-Monats-Fenstern" },
    ],
    goal: [
      {
        type: "p",
        text: "Beantworten Sie eine Frage mit Daten: **Wie viel Umsatz stammt von Menschen, die Sie über KI-Antworten gefunden haben?** Die Methode kombiniert die Frage „Wie sind Sie auf uns aufmerksam geworden?“ mit Ihren Conversions und ergänzt KI-Referral-Traffic aus Ihrer Webanalyse als zweites, klickbasiertes Signal.",
      },
    ],
    audience: [
      "E-Commerce-Shops auf Shopify, WooCommerce oder Shopware",
      "SaaS-Unternehmen, die über Stripe abrechnen",
      "B2B-Teams mit Leads in HubSpot, Salesforce, Pipedrive oder einem anderen CRM",
      "Marketingverantwortliche, die ein GEO-Budget begründen müssen",
    ],
    prompts: {
      intro:
        "Die Zuordnung wird mit einer Umfrage gemessen, nicht mit Prompts. Wer parallel Prompts mit Kaufabsicht trackt, sieht, ob sich Sichtbarkeit und Umsatz gemeinsam bewegen. Zehn Vorlagen.",
      placeholders: [
        "`[Kategorie]` – Ihre Produktkategorie",
        "`[Marke]` – Ihr Markenname",
        "`[Wettbewerber]` – Ihr stärkster Wettbewerber",
        "`[Zielgruppe]` und `[Anwendungsfall]` – ein Käufersegment und eine konkrete Aufgabe",
      ],
      rows: [
        { prompt: "Wo kann ich eine gute [Kategorie] kaufen?", tags: ["Kaufabsicht"] },
        { prompt: "Welche [Kategorie] sollte ich für [Anwendungsfall] kaufen?", tags: ["Kaufabsicht"] },
        { prompt: "Beste [Kategorie] für [Zielgruppe] mit gutem Support", tags: ["Kaufabsicht"] },
        { prompt: "Welche [Kategorie] hat das beste Preis-Leistungs-Verhältnis?", tags: ["Kaufabsicht"] },
        { prompt: "Wo kauft man [Kategorie] online?", tags: ["Kaufabsicht", "Handel"] },
        { prompt: "[Marke] oder [Wettbewerber]: Was soll ich kaufen?", tags: ["Kaufabsicht", "Direktvergleich"] },
        { prompt: "Ist [Marke] sein Geld wert?", tags: ["Kaufabsicht", "Marke"] },
        { prompt: "Ist [Marke] seriös?", tags: ["Kaufabsicht", "Marke"] },
        { prompt: "Was sagen Kunden über [Marke]?", tags: ["Kaufabsicht", "Marke"] },
        { prompt: "Bietet [Marke] eine kostenlose Testphase oder Rückgabe an?", tags: ["Kaufabsicht", "Marke"] },
      ],
    },
    engines: {
      intro: "Tracken Sie die Engines, die Ihre Umfrage als Antwort anbietet – so vergleichen Sie Sichtbarkeit und selbst angegebenen Umsatz je Engine.",
      head: ["Engine", "Wie sie zur Umfrage passt"],
      rows: [
        ["ChatGPT", "Standardmäßig tracken und „ChatGPT“ als eigene Antwortoption anbieten."],
        ["Perplexity, Gemini, Claude, Microsoft Copilot", "Als eigene Optionen anbieten, damit sich Antworten den getrackten Engines zuordnen lassen."],
        ["Google AI Overviews und AI Mode", "Befragte antworten womöglich nur „Google“. Bieten Sie „KI-Antwort bei Google“ als eigene Option an, um sie von der klassischen Suche zu trennen."],
      ],
    },
    baseline: [
      {
        title: "Die siebenstufige Einrichtung durchlaufen",
        body: "Attribution führt Sie durch Tracking-Ziel, Plattform, Ihre Formulare, die Umfrage, die Snippet-Installation, Conversions und die Live-Prüfung.",
      },
      {
        title: "Die Frage stellen",
        body: "Fragen Sie „Wie sind Sie auf uns aufmerksam geworden?“ im Checkout, im Registrierungsformular oder in Ihren Lead-Formularen – mit KI-Assistenten als ausdrücklichen Optionen neben Suche, Social Media und Empfehlung.",
      },
      {
        title: "Conversions anbinden",
        body: "Übermitteln Sie Käufe und Deals mit ihrem Wert: über das Website-Snippet, Stripe, Shopify, WooCommerce, Shopware oder einen CRM-Webhook für HubSpot, Salesforce, Pipedrive und andere.",
      },
      {
        title: "Prüfen, dann abwarten",
        body: "Der letzte Einrichtungsschritt bestätigt Snippet, erste Antwort und erste Conversion. Sammeln Sie danach zwei bis vier Wochen Antworten, bevor Sie die Zahlen auswerten.",
      },
    ],
    actions: [
      {
        title: "Antworten Kanälen zuordnen",
        body: "Ordnen Sie Freitextantworten Kanälen zu, damit „chatgpt“, „Chat GPT“ und „die KI“ alle als KI-Suche zählen.",
      },
      {
        title: "KI-Referral-Traffic ergänzen",
        body: "Verbinden Sie Google Analytics, Matomo oder Piwik PRO. Analytics → Human Traffic zeigt Besuche, die von KI-Plattformen kommen – die Klicks, die die Umfrage nicht sieht.",
      },
      {
        title: "Kanäle nach Umsatz vergleichen",
        body: "Stellen Sie die KI-Suche neben organische Suche, Paid, Social und Empfehlungen – nach Umsatz und Deal-Wert, nicht nur nach Zahl der Antworten.",
      },
      {
        title: "Sichtbarkeit und Umsatz in Bezug setzen",
        body: "Vergleichen Sie den Umsatz aus der KI-Suche mit der Erwähnungsrate für die Prompts mit Kaufabsicht über dieselben Monate.",
      },
      {
        title: "Monatlich berichten",
        body: "Erstellen Sie einen Monatsreport mit Attribution neben der Sichtbarkeit und exportieren Sie ihn als PPTX oder PDF für Stakeholder.",
      },
      {
        title: "Die Frage zwischen den Zeiträumen schärfen",
        body: "Sind viele Antworten vage („Internet“, „Google“), schärfen Sie die Optionen nach – zwischen den Messzeiträumen, niemals mittendrin.",
      },
    ],
    measure: {
      items: [
        "Anteil der Antworten, die einen KI-Assistenten nennen, pro Monat",
        "Umsatz und Deals, die der KI-Suche zugeordnet sind, neben den anderen Kanälen",
        "Antwortquote der Umfrage – niedrige Quoten machen die Anteile unzuverlässig",
        "Von KI-Plattformen vermittelte Sitzungen in der Webanalyse als separates Signal",
        "Erwähnungsrate für die Prompts mit Kaufabsicht im selben Zeitraum",
      ],
      aside: [
        { type: "h3", text: "Eine Spanne berichten, keinen Punkt" },
        {
          type: "p",
          text: "Selbst angegebene Daten sind ehrlich, aber ungenau. Berichten Sie die KI-Suche als Spanne über Monate und Methoden – Umfrage und Referral-Traffic – statt als eine exakte Zahl.",
        },
      ],
    },
    variance: [
      {
        type: "p",
        text: "Attributionszahlen hängen von der Stichprobengröße ab. Bei wenigen Antworten pro Monat können ein oder zwei Antworten den KI-Anteil spürbar verschieben. Warten Sie auf eine aussagekräftige Zahl an Antworten, bevor Sie Schlüsse ziehen, und betrachten Sie rollierende Drei-Monats-Fenster.",
      },
      {
        type: "p",
        text: "Selbst angegebene Antworten hängen außerdem vom Gedächtnis ab: Menschen erinnern sich eher an den letzten Berührungspunkt, nicht immer an den ersten. Betrachten Sie sie als eine Perspektive neben der klickbasierten Webanalyse.",
      },
    ],
    limitations: [
      "Wer die Umfrage nicht beantwortet, fehlt in den Daten. Antworten KI-Nutzer häufiger oder seltener als andere, sind die Anteile verzerrt.",
      "Umfrageantworten sind Selbstauskünfte und lassen sich nicht pro Person überprüfen.",
      "Referral-Traffic erfasst keine Käufer, die eine KI-Antwort lesen und später direkt kommen.",
      "Wenn sich Sichtbarkeit und Umsatz gemeinsam bewegen, ist das kein Beweis für Kausalität: Saisonalität und Kampagnen bewegen beides.",
    ],
    faq: [
      {
        q: "Warum nicht einfach die Webanalyse nutzen?",
        a: "Die Webanalyse sieht nur Besuche mit Referrer. Viele Menschen lesen eine KI-Antwort und kommen später zurück, indem sie Ihren Namen eintippen – die Webanalyse verbucht das als Direktzugriff oder Markensuche. Die Umfrage schließt diese Lücke, die Webanalyse ergänzt die klickbasierte Sicht.",
      },
      {
        q: "Wo sollte ich die Frage stellen?",
        a: "Dort, wo Menschen konvertieren: im Checkout oder auf der Bestellbestätigung, im Registrierungsformular oder in Lead- und Demo-Formularen. AutoSEO arbeitet mit dem eigenen Snippet und mit Formular- und Umfragetools wie Typeform, Tally, Jotform, Fairing, KnoCommerce und Zigpoll.",
      },
      {
        q: "Welche Antwortoptionen sollte ich anbieten?",
        a: "Nennen Sie die KI-Assistenten einzeln (ChatGPT, Perplexity, Gemini, Claude, Copilot), ergänzen Sie „KI-Antwort bei Google“, klassische Suche, Social Media, Empfehlung, Podcast oder Presse sowie ein freies Feld „Sonstiges“. Mischen Sie die Reihenfolge zufällig, wenn Ihr Formulartool das unterstützt.",
      },
      {
        q: "Wie viele Antworten brauche ich?",
        a: "Eine allgemeingültige Schwelle gibt es nicht, aber Anteile auf Basis weniger Dutzend Antworten pro Monat sind grob. Nutzen Sie rollierende Drei-Monats-Fenster, bis Sie genug Volumen haben, und nennen Sie immer die Zahl der Antworten neben dem Anteil.",
      },
      {
        q: "Kann ich früher gesammelte Umfrageantworten importieren?",
        a: "Ja. Attribution akzeptiert CSV-Importe. So bringen Sie Antworten aus der Zeit vor der Anbindung an AutoSEO ein und können Zeiträume vergleichen.",
      },
    ],
    reading: [
      { label: "Leads und Umsatz der KI-Suche zuordnen", href: "/de/blog/ai-search-attribution", description: "Referrer, UTM-Parameter, der GA4-Kanal „AI Assistant“ und die Frage „Wie sind Sie auf uns aufmerksam geworden?“." },
    ],
    related: ["win-comparison-prompts", "agency-pitch-in-14-days"],
  },
  {
    slug: "agency-pitch-in-14-days",
    crumb: "Agentur-Pitch in 14 Tagen",
    icon: "briefcase",
    meta: {
      title: "Playbook: Datenbasierter GEO-Pitch für Agenturen in 14 Tagen",
      description:
        "Agentur-Playbook: Pitch-Projekt, Prompt-Set, 14 Tage Tracking, Wettbewerbs- und Quellenanalyse, White-Label-Deck. Eine Methode, kein Ergebnisversprechen.",
    },
    hero: {
      title: "Agentur-Pitch in 14 Tagen",
      subtitle:
        "Interessenten wollen ihre eigenen Daten sehen, bevor sie unterschreiben. Dieses Playbook macht aus einer Domain zwei Wochen echtes Tracking und ein White-Label-Pitch-Deck – in einem Pitch-Projekt, das sich selbst archiviert, wenn Sie den Auftrag nicht gewinnen.",
    },
    teaser: "Machen Sie aus der Domain eines Interessenten in zwei Wochen einen datenbasierten Pitch zur KI-Sichtbarkeit – in einem Pitch-Projekt, das hinter sich aufräumt.",
    facts: [
      { label: "Ziel", value: "Ein Pitch-Deck auf Basis der echten KI-Sichtbarkeit des Interessenten" },
      { label: "Für", value: "Agenturen und Freelancer" },
      { label: "Dauer", value: "14 Tage tägliches Tracking" },
      { label: "Ergebnis", value: "White-Label-Deck (PPTX/PDF) und Freigabelink" },
    ],
    goal: [
      {
        type: "p",
        text: "Zeigen Sie einem Interessenten mit seinen eigenen Daten, **wo er in KI-Antworten steht, wer stattdessen gewinnt und was Sie dagegen tun würden** – ohne wochenlange unbezahlte Arbeit. Das Ergebnis ist ein White-Label-Deck aus 14 Tagen Tracking.",
      },
    ],
    audience: [
      "Agenturen, die GEO in SEO-, Content- oder PR-Retainer aufnehmen",
      "Freelancer, die Audits zur KI-Sichtbarkeit anbieten",
      "Inhouse-Teams, die intern für ein GEO-Budget werben",
    ],
    prompts: {
      intro:
        "Zwölf Vorlagen zu Kategorie, Vergleichen und Markenwahrnehmung des Interessenten: breit genug, um eine Geschichte zu finden, klein genug, um sie zwei Wochen lang zu überschaubaren Kosten zu tracken.",
      placeholders: [
        "`[Kategorie]`, `[Zielgruppe]`, `[Anwendungsfall]` – in den Worten des Interessenten (Website und Anzeigen prüfen)",
        "`[Interessent]` – die Marke des Interessenten",
        "`[Wettbewerber]` – der Wettbewerber, der dem Interessenten die meisten Sorgen macht (im Erstgespräch fragen)",
        "`[Land]` – der Hauptmarkt des Interessenten",
      ],
      rows: [
        { prompt: "Was ist die beste [Kategorie] für [Zielgruppe]?", tags: ["Pitch", "Kategorie"] },
        { prompt: "Welche [Kategorie]-Anbieter werden empfohlen?", tags: ["Pitch", "Kategorie"] },
        { prompt: "Welche [Kategorie] ist am besten für [Anwendungsfall]?", tags: ["Pitch", "Kategorie"] },
        { prompt: "Welche [Kategorie] ist am vertrauenswürdigsten?", tags: ["Pitch", "Kategorie"] },
        { prompt: "Was kostet eine [Kategorie]?", tags: ["Pitch", "Kategorie"] },
        { prompt: "Wer sind die führenden [Kategorie]-Anbieter in [Land]?", tags: ["Pitch", "Kategorie", "Lokal"] },
        { prompt: "Was sind die besten Alternativen zu [Wettbewerber]?", tags: ["Pitch", "Vergleich"] },
        { prompt: "[Interessent] vs. [Wettbewerber]", tags: ["Pitch", "Vergleich"] },
        { prompt: "Ist [Interessent] eine gute Wahl für [Anwendungsfall]?", tags: ["Pitch", "Marke"] },
        { prompt: "Was sind die Vor- und Nachteile von [Interessent]?", tags: ["Pitch", "Marke"] },
        { prompt: "Was sagen Kunden über [Interessent]?", tags: ["Pitch", "Marke"] },
        { prompt: "Ist [Interessent] seriös?", tags: ["Pitch", "Marke"] },
      ],
    },
    engines: {
      intro: "Jede Engine, die Sie 14 Tage lang tracken, kostet Geld. Wählen Sie die vier oder fünf, die für die Käufer des Interessenten zählen.",
      head: ["Engine", "Rolle im Pitch"],
      rows: [
        ["ChatGPT", "Die Engine, nach der jeder Interessent zuerst fragt."],
        ["Google AI Overviews", "Verbindet den Pitch mit dem Google-Traffic, den der Interessent bereits kennt."],
        ["Perplexity", "Ihre Quellen machen die Folie „Darum gewinnen die Wettbewerber“ konkret."],
        ["Gemini oder Microsoft Copilot", "Nehmen Sie eine davon dazu – je nachdem, ob die Käufer des Interessenten mit Google- oder Microsoft-Tools arbeiten."],
      ],
    },
    baseline: [
      {
        title: "Tag 1: Pitch-Projekt anlegen",
        body: "Legen Sie die Domain des Interessenten als Pitch-Projekt mit einer Laufzeit von 7 bis 90 Tagen an. Gewinnen Sie nicht, wird es automatisch archiviert.",
      },
      {
        title: "Tag 1: Prompts und Wettbewerber",
        body: "Importieren Sie das Prompt-Set, ergänzen Sie die vom Interessenten genannten Wettbewerber und die Vorschläge von AutoSEO und stellen Sie tägliches Tracking auf vier oder fünf Engines ein.",
      },
      {
        title: "Tag 2–13: Antworten lesen",
        body: "Schauen Sie alle paar Tage hinein. Suchen Sie die Geschichte: Wer wird stattdessen empfohlen, welche Quellen werden zitiert, was gibt die KI über den Interessenten falsch wieder?",
      },
      {
        title: "Tag 14: Das Deck bauen",
        body: "Erstellen Sie einen Report aus der Vorlage Pitch oder Audit Pitch, wenden Sie Ihr Brand Kit an und exportieren Sie PPTX oder PDF – oder senden Sie einen passwortgeschützten Freigabelink.",
      },
    ],
    actions: [
      {
        title: "Mit einer klaren Erkenntnis einsteigen",
        body: "Ein Satz, den der Interessent intern weitererzählt – etwa, welchen Wettbewerber die KI für seinen wertvollsten Prompt empfiehlt. Aus seinen Daten, nicht aus einem Benchmark.",
      },
      {
        title: "Das Warum zeigen",
        body: "Erklären Sie mit Sources und den Antworten selbst, warum Wettbewerber gewinnen: die Seiten, Bewertungen und Listen hinter den Antworten.",
      },
      {
        title: "Technische Quick Wins ergänzen",
        body: "Führen Sie einen Crawlability-Check für die Website des Interessenten aus. Blockierte KI-Crawler oder clientseitiges Rendering sind konkrete, behebbare Befunde.",
      },
      {
        title: "Einen messbaren Plan vorschlagen",
        body: "Bieten Sie eine Ausgangsmessung, ein festes Prompt-Set, monatliches Reporting und die Playbooks an, die Sie umsetzen werden – kein versprochenes Ranking.",
      },
      {
        title: "Offen mit Schwankungen umgehen",
        body: "Zeigen Sie, dass Antworten schwanken und dass Sie Durchschnitte über viele Läufe berichten. Das schafft Vertrauen und schützt Sie davor, an einem einzelnen Screenshot gemessen zu werden.",
      },
      {
        title: "Umwandeln oder auslaufen lassen",
        body: "Gewinnen Sie, wandeln Sie das Pitch-Projekt in ein reguläres Projekt um und behalten Sie die 14 Tage als Ausgangsmessung. Gewinnen Sie nicht, archiviert es sich selbst.",
      },
    ],
    measure: {
      items: [
        "Ihre Abschlussquote bei Pitches mit Daten gegenüber Pitches ohne, in Ihrer eigenen Pipeline",
        "Erwähnungsrate und Share of Voice nach 14 Tagen als Ausgangsmessung des Auftrags",
        "Tracking-Kosten je Pitch unter Settings → Usage, um künftige Pitches zu kalkulieren",
        "Aufgewendete Stunden je Pitch, um zu entscheiden, ob Sie das Prompt-Set standardisieren",
      ],
      aside: [
        { type: "h3", text: "Dem Kunden Zugriff geben" },
        {
          type: "p",
          text: "Sobald der Vertrag unterschrieben ist, laden Sie den Kunden mit der Rolle Client ein: Lesezugriff auf sein Projekt und sonst nichts.",
        },
      ],
    },
    variance: [
      {
        type: "p",
        text: "Vierzehn Tage liefern ein Richtungsbild, keine präzisen Zahlen. Ein kleines Prompt-Set auf wenigen Engines zeigt sichtbare Schwankungen von Tag zu Tag. Präsentieren Sie Ergebnisse als Spannen und Trends – und sagen Sie das auch auf der Folie.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "Nutzen Sie die Schwankung als Verkaufsargument",
        text: "Wer erklärt, warum einzelne Screenshots in die Irre führen – und wie er stattdessen sauber misst –, hebt sich von Pitches ab, die auf einer einzigen ChatGPT-Antwort beruhen.",
      },
    ],
    limitations: [
      "Tracking-Kosten fallen 14 Tage lang je Engine an; legen Sie ein Budget pro Pitch fest.",
      "Zwei Wochen zeigen, wo der Interessent heute steht – nicht, was Sie für ihn erreichen werden.",
      "Wettbewerberlisten aus dem Erstgespräch sind unvollständig; die Antworten selbst zeigen oft Wettbewerber, die niemand genannt hat.",
      "In AutoSEO Cloud zählt ein aktives Pitch-Projekt zum Projektlimit Ihres Workspace, bis es abläuft und archiviert wird.",
    ],
    faq: [
      {
        q: "Was kostet das Tracking für einen 14-Tage-Pitch?",
        a: "Das hängt von der Zahl der Prompts und Engines und von den konfigurierten Anbietern ab. Prüfen Sie nach den ersten Tagen Settings → Usage und rechnen Sie hoch. Auf einer selbst gehosteten Instanz kann die KI-Arbeit über den lokalen Agenten auf Claude-Code- oder Codex-Abos laufen, die Sie bereits haben; Engines, die über DataForSEO getrackt werden, rechnet DataForSEO pro Anfrage ab.",
      },
      {
        q: "Kann der Interessent das Projekt während des Pitches sehen?",
        a: "Nur wenn Sie ihn einladen. Das fertige Deck können Sie auch über einen passwortgeschützten Link teilen, ohne dem Interessenten ein Konto zu geben.",
      },
      {
        q: "Was passiert, wenn der Pitch-Zeitraum endet?",
        a: "Das Pitch-Projekt wird automatisch archiviert. Solange es läuft, können Sie es jederzeit in ein reguläres Projekt umwandeln; alle getrackten Daten bleiben erhalten und werden zur Ausgangsmessung des Auftrags.",
      },
      {
        q: "Kann ich das Deck im White Label gestalten?",
        a: "Ja. Brand Kits übertragen Ihr Logo und Ihre Farben auf Reports, die Sie als PPTX oder PDF exportieren oder über einen passwortgeschützten Link teilen.",
      },
      {
        q: "Sollte ich im Pitch Ergebnisse versprechen?",
        a: "Nein. KI-Antworten sind probabilistisch, und Engines ändern sich ohne Vorankündigung. Versprechen Sie eine Methode – Ausgangsmessung, festes Prompt-Set, monatliche Messung, konkrete Maßnahmen – und berichten Sie ehrlich daran entlang.",
      },
    ],
    reading: [
      { label: "Welche GEO-Techniken wirken?", href: "/de/blog/geo-techniques", description: "Was die Forschung über mehr KI-Sichtbarkeit zeigt, warum Studien sich widersprechen und wie Sie selbst testen." },
      { label: "Google AI Mode vs. AI Overviews", href: "/de/blog/ai-mode-vs-ai-overviews", description: "Wie sich Googles zwei KI-Antwortformate unterscheiden und wie Sie beide messen." },
    ],
    related: ["win-comparison-prompts", "attribute-ai-search-revenue"],
  },
];

export default playbooks;
