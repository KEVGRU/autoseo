import type { IntegrationPage } from "../../types";

export default {
  slug: "tally",
  name: "Tally",
  nav: "Tally",
  summary: "Tally-Einsendungen an AutoSEO senden und Anmeldungen und Leads der KI-Suche zuordnen.",
  meta: {
    title: "Tally-Formulare: Attribution für die KI-Suche",
    description:
      "Tally per Webhook mit AutoSEO verbinden: Auswahlantworten werden in ihre Labels übersetzt, Anmeldungen mit ChatGPT oder Perplexity zählen als KI-Suche.",
  },
  hero: {
    subtitle:
      "Fügen Sie Ihrem Tally-Formular eine Webhook-URL hinzu. AutoSEO übersetzt Tallys Options-IDs zurück in die gewählten Labels, findet die Antwort auf „Wie sind Sie auf uns aufmerksam geworden?“ und ordnet jede Anmeldung der KI-Suche und Ihren anderen Kanälen zu.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Tally-Integration",
    items: [
      "Anbindung über die eingebauten Tally-Webhooks – ohne API-Key",
      "Auswahl- und Checkbox-Antworten werden von Options-IDs in ihre Labels übersetzt",
      "E-Mail-Felder werden am Feldtyp erkannt und nur als SHA-256-Hash gespeichert",
      "Response-ID, Formularname und Absendezeit werden automatisch zugeordnet",
      "Eine Zuordnung je Formular, erkannt an der Formular-ID",
      "Webhook Logs zeigen jede Zustellung – und warum eine Payload übersprungen wurde",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Tally und AutoSEO",
    items: [
      {
        icon: "rocket",
        title: "Produkt-Anmeldungen zuordnen",
        body: "Stellen Sie die Herkunftsfrage in Ihrem Tally-Anmelde- oder Wartelistenformular und sehen Sie, wie viele neue Nutzer KI-Assistenten schicken.",
      },
      {
        icon: "sparkles",
        title: "KI-Suche nach Assistent aufschlüsseln",
        body: "Antworten mit ChatGPT, Claude, Perplexity, Gemini, Copilot und weiteren werden je Assistent gezählt – nicht in einen Topf geworfen.",
      },
      {
        icon: "euro",
        title: "Umsatz später ergänzen",
        body: "Wird aus einer Anmeldung ein zahlender Stripe-Kunde mit derselben E-Mail-Adresse, ordnet AutoSEO die Zahlung der ursprünglichen Antwort zu.",
      },
      {
        icon: "check-circle",
        title: "Keine frühen Einsendungen verlieren",
        body: "Die erste Einsendung eines neuen Formulars erscheint unter Field Mapping. Was vor Ihrer Bestätigung eintrifft, wird danach verarbeitet.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Tally in vier Schritten verbinden –",
    muted: "per Formular-Webhook.",
    items: [
      {
        title: "Webhook-URL erzeugen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → Tally und klicken Sie auf Connect. Kopieren Sie die URL – sie wird nur einmal angezeigt.",
      },
      {
        title: "In Tally verbinden",
        body: "Öffnen Sie in Tally Ihr Formular → Integrations → Webhooks → Connect und fügen Sie die URL ein.",
      },
      {
        title: "Formular einmal absenden",
        body: "Füllen Sie das Formular selbst aus. Die Einsendung erscheint innerhalb von Sekunden unter Webhook Logs.",
      },
      {
        title: "Vorgeschlagene Felder bestätigen",
        body: "Öffnen Sie Field Mapping, prüfen Sie die vorgeschlagenen Antwort- und E-Mail-Felder und speichern Sie. Künftige Einsendungen werden automatisch gelesen.",
      },
    ],
  },
  faq: [
    {
      q: "Wie sehe ich, welche Tally-Anmeldungen aus der KI-Suche kommen?",
      a: "Stellen Sie in Ihrem Tally-Formular die Frage „Wie sind Sie auf uns aufmerksam geworden?“ und hinterlegen Sie die Webhook-URL von AutoSEO unter Integrations → Webhooks. AutoSEO liest jede Einsendung, ordnet die Antwort ein und zählt die KI-Suche je Assistent.",
    },
    {
      q: "Tally sendet Options-IDs statt Labels – ist das ein Problem?",
      a: "Nein. Bei Feldern mit Optionen enthält der Tally-Webhook die Optionsliste, und AutoSEO ersetzt die gewählten IDs durch ihre Labels, bevor es die Antwort einordnet. Mehrere gewählte Optionen bleiben zusammen, getrennt durch Kommas.",
    },
    {
      q: "Kann ich mehrere Tally-Formulare verbinden?",
      a: "Ja. Verwenden Sie in jedem Formular dieselbe Webhook-URL. AutoSEO erkennt jedes Formular an seiner ID und führt eine Zuordnung je Formular – unterschiedliche Fragenlayouts geraten so nicht durcheinander.",
    },
    {
      q: "Was passiert mit Einsendungen, die vor dem Speichern der Zuordnung eintreffen?",
      a: "AutoSEO bewahrt sie verschlüsselt auf und verarbeitet sie, sobald Sie die Zuordnung bestätigen – bis zu 200 wartende Einsendungen für sieben Tage.",
    },
    {
      q: "Ist die Tally-Integration kostenlos?",
      a: "Ja. Die Attribution und alle ihre Integrationen gehören zur Open-Source-App: kostenlos beim Self-Hosting oder enthalten in einem AutoSEO-Cloud-Workspace für 50\u00a0$ pro Monat. Antworten werden mit festen Regeln eingeordnet, nicht mit KI-Guthaben.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, wie viele Anmeldungen die KI-Suche bringt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
