import type { IntegrationPage } from "../../types";

export default {
  slug: "calendly",
  name: "Calendly",
  nav: "Calendly",
  summary: "Antworten auf „Wie sind Sie auf uns aufmerksam geworden?“ aus Calendly-Buchungen erfassen.",
  meta: {
    title: "Calendly-Buchungen der KI-Suche zuordnen",
    description:
      "Ordnen Sie Calendly-Buchungen ChatGPT, Perplexity und anderen KI-Assistenten zu: Ergänzen Sie eine Buchungsfrage, AutoSEO liest die Antwort aus jedem Webhook.",
  },
  hero: {
    subtitle:
      "Ergänzen Sie Ihren Calendly-Terminen die Frage „Wie sind Sie auf uns aufmerksam geworden?“ und abonnieren Sie für AutoSEO neue Buchungen. Die Antwort wird in jeder Buchung automatisch gefunden und der KI-Suche oder Ihren anderen Kanälen zugeordnet.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Calendly-Integration",
    items: [
      "Eine Buchungsfrage „Wie sind Sie auf uns aufmerksam geworden?“ in Ihrem Termintyp",
      "Ein Calendly-Webhook-Abo für invitee.created",
      "Die Antwort wird in questions_and_answers gefunden und unter Field Mapping vorgeschlagen",
      "E-Mail, Name, Buchungs-URI und Buchungszeit aus jedem Event",
      "Buchungen werden späteren Zahlungen oder Deals per E-Mail-Hash zugeordnet",
      "Jede Buchung unter Webhook Logs",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Calendly und AutoSEO",
    items: [
      {
        icon: "calendar",
        title: "Demos aus der KI-Suche",
        body: "Sehen Sie, wie viele Sales-Calls und Demos Menschen gebucht haben, die Sie über ChatGPT, Perplexity oder Claude gefunden haben.",
      },
      {
        icon: "euro",
        title: "Buchungen bis zum Umsatz verfolgen",
        body: "Verbinden Sie zusätzlich Stripe oder Ihr CRM, und AutoSEO verknüpft Zahlung oder Deal per E-Mail-Hash mit der Buchungsantwort.",
      },
      {
        icon: "message-square",
        title: "Freitext-Antworten willkommen",
        body: "Eine Antwort wie „ChatGPT hat Sie empfohlen“ wird als KI-Suche erkannt und dem richtigen Assistenten zugeschrieben.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Calendly in vier Schritten verbinden –",
    muted: "per Buchungsfrage.",
    items: [
      {
        title: "Buchungsfrage ergänzen",
        body: "Ergänzen Sie in Calendly Ihrem Termintyp die Frage „Wie sind Sie auf uns aufmerksam geworden?“ – als Freitext oder mit Auswahloptionen.",
      },
      {
        title: "Webhook-URL erzeugen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → Calendly und klicken Sie auf Connect. Kopieren Sie die Webhook-URL – sie wird nur einmal angezeigt.",
      },
      {
        title: "Webhook-Abo anlegen",
        body: "Calendly legt Webhooks über seine API an: Erstellen Sie ein Abo für das Event invitee.created mit Ihrer Webhook-URL.",
      },
      {
        title: "Testtermin buchen",
        body: "Die Buchung erscheint unter Webhook Logs, und Field Mapping schlägt die Antwort aus questions_and_answers vor. Bestätigen Sie sie einmalig.",
      },
    ],
  },
  faq: [
    {
      q: "Wie erkenne ich, welche Calendly-Buchungen von ChatGPT kommen?",
      a: "Fragen Sie im Calendly-Buchungsformular „Wie sind Sie auf uns aufmerksam geworden?“ und senden Sie neue Buchungen per invitee.created-Webhook an AutoSEO. Antworten, die ChatGPT oder einen anderen Assistenten nennen, zählen als KI-Suche – je Assistent.",
    },
    {
      q: "Wie lege ich den Calendly-Webhook an?",
      a: "Calendly verwaltet Webhook-Abos über seine API: Senden Sie einen POST-Request an /webhook_subscriptions mit Ihrer AutoSEO-Webhook-URL und dem Event invitee.created. Webhook-Abos sind eine API-Funktion; prüfen Sie daher, ob Ihr Calendly-Tarif sie enthält.",
    },
    {
      q: "Muss die Frage genau so formuliert sein?",
      a: "Nein. AutoSEO erkennt gängige Formulierungen auf Deutsch und Englisch, etwa „Wie sind Sie auf uns aufmerksam geworden?“ oder „How did you hear about us?“. Sie können die Frage außerdem jederzeit manuell unter Field Mapping wählen.",
    },
    {
      q: "Sendet Calendly Umsatz?",
      a: "Nein, nur die Buchung und ihre Antworten. Umsatz kommt aus Stripe, Ihrem Shop oder Ihrem CRM; AutoSEO verknüpft diese Conversions per E-Mail-Hash mit der Buchungsantwort.",
    },
    {
      q: "Wie ist der Calendly-Webhook abgesichert?",
      a: "Die Webhook-URL enthält ein geheimes Token, das AutoSEO nur als Hash speichert, und E-Mails von Eingeladenen werden als Hash mit maskierter Vorschau gespeichert. Sie können die URL jederzeit neu erzeugen.",
    },
    {
      q: "Ist die Calendly-Integration im Preis enthalten?",
      a: "Ja. Attribution und alle Integrationen sind Teil der Open-Source-App: kostenlos beim Self-Hosting oder in einem AutoSEO-Cloud-Workspace für 50\u00a0$ im Monat enthalten, inklusive 10\u00a0$ KI- und Datennutzung.",
    },
  ],
  cta: {
    title: "Sehen Sie, welche Termine die KI-Suche bucht",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
