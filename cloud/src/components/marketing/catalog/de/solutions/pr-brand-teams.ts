import type { SolutionPage } from "../../types";

export default {
  slug: "pr-brand-teams",
  nav: "Für PR- & Markenteams",
  summary: "Sehen, wie KI-Engines Ihre Marke beschreiben und welche Medien die Antwort prägen.",
  meta: {
    title: "KI-Markenmonitoring für PR- und Markenteams",
    description:
      "KI-Markenmonitoring für PR-Teams: Sehen Sie, wie ChatGPT, Gemini & Co. Ihre Marke beschreiben, welche Medien sie zitieren und wie Ihr Sentiment abschneidet.",
  },
  hero: {
    eyebrow: "AutoSEO für PR- & Markenteams",
    title: "Wissen, wie KI Ihre Marke beschreibt.",
    muted: "KI-Markenmonitoring für PR-Teams.",
    subtitle:
      "Tracken Sie, was ChatGPT, Perplexity, Gemini, Claude und sieben weitere Engines über Ihre Marke sagen, welche Publikationen und Foren sie zitieren und wie Ihr Sentiment und Ihr Share of Voice im Vergleich zu Wettbewerbern ausfallen.",
  },
  visual: "sentiment",
  challenges: {
    eyebrow: "Die Herausforderung",
    title: "Die KI erzählt jetzt Ihre Markengeschichte.",
    muted: "Oft ohne Sie.",
    items: [
      {
        title: "Antworten ersetzen Schlagzeilen",
        body: "Menschen fragen einen Assistenten, wofür ein Unternehmen bekannt ist, und bekommen eine einzige Zusammenfassung – gebaut aus Berichterstattung, Bewertungen und Foren, die Sie vielleicht nie sehen.",
      },
      {
        title: "Alte Geschichten bleiben",
        body: "Ein kritischer Artikel oder eine veraltete Angabe kann noch lange in KI-Antworten auftauchen, wenn die Nachricht längst vergessen ist.",
      },
      {
        title: "Share of Voice bleibt unsichtbar",
        body: "Medienbeobachtung zählt Artikel. Sie zeigt nicht, wie oft KI Sie empfiehlt – oder stattdessen einen Wettbewerber.",
      },
    ],
  },
  workflow: {
    eyebrow: "So nutzen PR- & Markenteams AutoSEO",
    title: "Vom Monitoring zur Maßnahme,",
    muted: "an einem Ort.",
    items: [
      {
        icon: "heart",
        title: "Sentiment und Wahrnehmung verfolgen",
        body: "Lob, Kritik und neutrale Aussagen über Ihre Marke im Zeitverlauf – und die Themen und Eigenschaften, die KI mit Ihnen verbindet.",
        feature: "ai-brand-sentiment",
      },
      {
        icon: "newspaper",
        title: "Sehen, welche Medien die Antworten prägen",
        body: "Jede zitierte Publikation, jedes Forum und jede Bewertungsseite, nach Typ gruppiert – mit einer Anleitung, wie Sie dort gelistet werden.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "swords",
        title: "Share of Voice vergleichen",
        body: "Wie oft KI Sie im Vergleich zu Wettbewerbern nennt, wer Head-to-Head-Vergleiche gewinnt und wer die „Am besten für …“-Empfehlungen besetzt.",
        feature: "ai-competitor-analysis",
      },
      {
        icon: "shield-check",
        title: "Falsche Aussagen erkennen",
        body: "Prüfen Sie, was Engines über Ihre Produkte sagen, gegen Ihre eigenen Referenzdokumente und markieren Sie widerlegte oder veraltete Aussagen.",
        feature: "ai-fact-check",
      },
      {
        icon: "list-checks",
        title: "Aus Kritik einen Plan machen",
        body: "Wiederkehrende Kritik und Zitat-Lücken werden zu priorisierten Aufgaben – mit Zitaten und Quellen als Beleg.",
        feature: "ai-seo-tasks",
      },
      {
        icon: "presentation",
        title: "An die Geschäftsführung berichten",
        body: "Präsentationen im eigenen Branding mit Live-Daten aus 11 Vorlagen, exportiert nach PowerPoint oder PDF oder geteilt per passwortgeschütztem Link.",
        feature: "report-builder",
      },
    ],
  },
  prompts: {
    eyebrow: "Beispiel-Prompts",
    title: "Prompts, die PR- & Markenteams beobachten",
    items: [
      "Wofür ist Acme bekannt?",
      "Ist Acme ein vertrauenswürdiges Unternehmen?",
      "War Acme in Kontroversen verwickelt?",
      "Welche Unternehmen führen bei nachhaltigen Verpackungen?",
      "Wie ist es, bei Acme zu arbeiten?",
      "Acme oder der größte Wettbewerber – welche Marke hat den besseren Ruf?",
    ],
  },
  outcomes: {
    eyebrow: "Warum PR-Teams AutoSEO wählen",
    title: "Gestalten Sie die Geschichte,",
    muted: "die KI über Sie erzählt.",
    items: [
      {
        title: "Veränderungen erkennen, wenn sie passieren",
        body: "Gespeicherte Antworten und tägliches Tracking zeigen, wann sich die Tonalität ändert, in welcher Engine und welche Quellen die Antworten zitieren.",
      },
      {
        title: "Eine Outreach-Liste aus echten Daten",
        body: "Zitierte Publikationen und Bewertungsseiten, die Wettbewerber erwähnen, aber nicht Sie, werden zu Ihrer Medien- und Outreach-Liste.",
      },
      {
        title: "Zahlen für die Geschäftsführung",
        body: "Share of Voice, Sentiment und Visibility-Trends in Reports, die sich mit jedem Berichtszeitraum aktualisieren.",
      },
    ],
  },
  faq: [
    {
      q: "Was ist KI-Markenmonitoring?",
      a: "KI-Markenmonitoring verfolgt, wie KI-Assistenten wie ChatGPT, Perplexity und Gemini Ihre Marke beschreiben, wenn Menschen nach ihr oder Ihrer Branche fragen. AutoSEO führt einen festen Satz an Prompts nach Zeitplan aus, speichert jede Antwort und misst Erwähnungen, Sentiment, Zitate und Share of Voice.",
    },
    {
      q: "Wie finde ich heraus, was ChatGPT über meine Marke sagt?",
      a: "Legen Sie Prompts wie „Wofür ist Acme bekannt?“ in einem Projekt an und wählen Sie ChatGPT und weitere Engines. AutoSEO führt sie täglich, wöchentlich oder monatlich aus und speichert jede Antwort – so lesen Sie genau, was wann gesagt wurde. Für einzelne Fragen zeigt der Prompt Explorer die Antworten mehrerer Modelle nebeneinander.",
    },
    {
      q: "Kann AutoSEO das Marken-Sentiment in KI-Antworten messen?",
      a: "Ja. AutoSEO extrahiert Lob, Kritik und neutrale Aussagen aus jeder Antwort, zeigt das Sentiment im Zeitverlauf und gruppiert Aussagen nach Themen. Ihr Sentiment vergleichen Sie mit jedem Wettbewerber, der in den Antworten auftaucht.",
    },
    {
      q: "Welche Quellen nutzen KI-Engines, wenn sie über uns sprechen?",
      a: "AutoSEO listet jede URL, die die Engines für Ihre Prompts zitieren, und gruppiert sie nach Typ – etwa News, Testberichte, Foren, Listen und Videos. Quellen, die Wettbewerber erwähnen, aber nicht Sie, werden hervorgehoben und ergeben eine naheliegende Outreach-Liste.",
    },
    {
      q: "Was können wir tun, wenn KI falsche oder veraltete Informationen wiederholt?",
      a: "Der Faktencheck vergleicht Aussagen in KI-Antworten mit Ihren eigenen Referenzdokumenten und markiert widerlegte, unbelegte oder veraltete Aussagen – mit dem Zitat aus der Antwort und der passenden Textstelle. Wiederkehrende Probleme werden zu Aufgaben, damit Sie die zugrunde liegenden Quellen korrigieren und verfolgen können, ob sich die Antworten ändern.",
    },
    {
      q: "Ersetzt AutoSEO die Medienbeobachtung?",
      a: "Nein. AutoSEO konzentriert sich auf KI-Antworten und die Quellen, die sie zitieren – nicht auf Presseclippings oder Social Listening. Nutzen Sie es neben Ihrem Tool für Medienbeobachtung, um die KI-Seite Ihrer Reputation abzudecken.",
    },
  ],
  related: ["customer-experience", "content-teams", "agencies"],
  cta: {
    title: "Finden Sie heraus, wie KI Ihre Marke heute beschreibt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies SolutionPage;
