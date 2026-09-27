import type { IntegrationPage } from "../../types";

export default {
  slug: "typeform",
  name: "Typeform",
  nav: "Typeform",
  summary: "Typeform-Einsendungen an AutoSEO senden und sehen, welche Leads über die KI-Suche kamen.",
  meta: {
    title: "Typeform-Attribution für die KI-Suche",
    description:
      "Typeform per Webhook mit AutoSEO verbinden: Die Herkunftsfrage wird am Titel erkannt, und Leads aus ChatGPT & Co. werden je KI-Assistent gezählt. Open Source.",
  },
  hero: {
    subtitle:
      "Fügen Sie Ihrem Typeform einen Webhook hinzu. AutoSEO erkennt die Frage „Wie sind Sie auf uns aufmerksam geworden?“ an ihrem Titel, liest die Auswahl- oder Textantwort und zählt Leads aus ChatGPT, Perplexity und anderen Assistenten – Formular für Formular.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Typeform-Integration",
    items: [
      "Ein Typeform-Webhook an Ihrem Formular – ohne App-Installation und ohne Kontozugriff",
      "Die Herkunftsfrage wird an ihrem Titel erkannt, auf Deutsch oder Englisch",
      "Einfachauswahl, Mehrfachauswahl und Freitext werden direkt gelesen",
      "E-Mail-Frage, Response-Token, Formulartitel und Absendezeit werden automatisch zugeordnet",
      "Hidden Fields page_url und deal_value für zusätzlichen Kontext",
      "Wiederholte Zustellungen derselben Antwort aktualisieren sie, statt ein Duplikat anzulegen",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Typeform und AutoSEO",
    items: [
      {
        icon: "sparkles",
        title: "Demo-Anfragen aus der KI-Suche zählen",
        body: "Sehen Sie, wie viele Typeform-Leads ChatGPT, Perplexity, Claude oder einen anderen Assistenten nennen – neben Suche, Social und Empfehlungen.",
      },
      {
        icon: "users",
        title: "Leads mit späteren Käufen verbinden",
        body: "Taucht dieselbe E-Mail-Adresse später als Conversion aus Stripe, Shopify oder WooCommerce auf, führt AutoSEO beides zusammen – der Lead trägt dann seinen Umsatz.",
      },
      {
        icon: "layers",
        title: "Formulare vergleichen",
        body: "Jede Antwort behält den Titel des Typeforms. So filtern Sie die Attributionsübersicht nach Formular – Newsletter, Demo oder Angebot.",
      },
      {
        icon: "trending-up",
        title: "Leads mit der AI Visibility abgleichen",
        body: "AutoSEO korreliert Ihre tägliche AI Visibility aus dem Tracker mit den Antworten „KI-Suche“, die Ihre Formulare erhalten.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Typeform in vier Schritten verbinden –",
    muted: "per Formular-Webhook.",
    items: [
      {
        title: "Webhook-URL erzeugen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → Typeform und klicken Sie auf Connect. Kopieren Sie die URL – sie wird nur einmal angezeigt.",
      },
      {
        title: "Im Formular hinterlegen",
        body: "Öffnen Sie in Typeform das Formular → Connect → Webhooks → Add a webhook, fügen Sie die URL ein und schalten Sie den Webhook ein.",
      },
      {
        title: "Test senden",
        body: "Klicken Sie auf View deliveries → Send test request oder senden Sie das Formular einmal selbst ab.",
      },
      {
        title: "Zuordnung bestätigen",
        body: "Unter Field Mapping schlägt AutoSEO Antwort-, E-Mail- und Formularfelder vor. Bestätigen und speichern – künftige Einsendungen werden automatisch gelesen.",
      },
    ],
  },
  faq: [
    {
      q: "Wie sehe ich, welche Typeform-Leads von ChatGPT kommen?",
      a: "Fügen Sie Ihrem Formular die Frage „Wie sind Sie auf uns aufmerksam geworden?“ hinzu und verbinden Sie es per Typeform-Webhook mit AutoSEO. AutoSEO erkennt die Frage am Titel, und Antworten wie „ChatGPT“ oder „über Perplexity gefunden“ zählen als KI-Suche – je Assistent.",
    },
    {
      q: "Funktioniert das mit Auswahl- und Freitextfragen?",
      a: "Ja. AutoSEO liest Einfachauswahl, Mehrfachauswahl und Freitext. Freitextantworten werden mit festen Regeln eingeordnet: „Google Ads“ zählt als Werbung, „ein Freund hat es empfohlen“ als Empfehlung und „ChatGPT gefragt“ als KI-Suche.",
    },
    {
      q: "Was, wenn meine Frage anders formuliert ist?",
      a: "AutoSEO erkennt gängige deutsche und englische Formulierungen wie „Wie haben Sie uns gefunden?“, „Wo haben Sie von uns erfahren?“ oder „How did you hear about us?“. Bei jeder anderen Formulierung wählen Sie das Feld einmalig unter Field Mapping aus.",
    },
    {
      q: "Kann ich Seiten-URL oder Deal-Wert mitsenden?",
      a: "Ja. Legen Sie in Ihrem Typeform die Hidden Fields page_url und deal_value an. AutoSEO speichert die Seiten-URL ohne Query-String und nutzt den Wert als Deal-Wert des Leads.",
    },
    {
      q: "Welche Daten speichert AutoSEO aus einer Typeform-Antwort?",
      a: "Die Antwort, den Response-Token, Formulartitel und Absendezeit – und, falls Ihr Formular danach fragt, die E-Mail-Adresse als SHA-256-Hash mit maskierter Vorschau. E-Mail-Adressen in Freitextantworten werden ebenfalls maskiert.",
    },
    {
      q: "Ist die Typeform-Integration kostenlos?",
      a: "Ja. Die Attribution und alle ihre Integrationen gehören zur Open-Source-App: kostenlos beim Self-Hosting oder enthalten in einem AutoSEO-Cloud-Workspace für 50\u00a0$ pro Monat. Antworten werden mit festen Regeln eingeordnet, nicht mit KI-Guthaben.",
    },
  ],
  cta: {
    title: "Sehen Sie, welche Leads die KI-Suche bringt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
