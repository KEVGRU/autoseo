import type { IntegrationPage } from "../../types";

export default {
  slug: "attio",
  name: "Attio",
  nav: "Attio",
  summary: "Attio-Datensätze und Deals samt Lead-Quelle per Workflow an AutoSEO senden.",
  meta: {
    title: "Attio-Deals der KI-Suche zuordnen",
    description:
      "Ordnen Sie Attio-Datensätze und Deals ChatGPT, Perplexity und anderen KI-Assistenten zu: Ein Workflow-Block „Send HTTP request“ sendet Lead-Quelle und Wert.",
  },
  hero: {
    subtitle:
      "Fügen Sie einem Attio-Workflow den Block „Send HTTP request“ hinzu und senden Sie Lead-Quelle, E-Mail und Deal-Wert jedes neuen oder geänderten Datensatzes an AutoSEO – zugeordnet zur KI-Suche und Ihren anderen Kanälen.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Attio-Integration",
    items: [
      "Ein Attio-Workflow, der bei neuen oder geänderten Datensätzen startet",
      "Ein Block „Send HTTP request“, der JSON an die Webhook-URL Ihres Projekts sendet",
      "Das AutoSEO-Schema: Nur channelId ist Pflicht; E-Mail, Datensatz-ID, Wert und Währung sind optional",
      "Die Datensatz-ID als Schlüssel – Updates ändern einen Eintrag, statt einen neuen anzulegen",
      "Datensätze werden Antworten aus der Website-Umfrage per E-Mail-Hash zugeordnet",
      "Jede Zustellung unter Webhook Logs",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Attio und AutoSEO",
    items: [
      {
        icon: "euro",
        title: "Pipeline je Kanal",
        body: "Senden Sie Deal-Werte mit der Lead-Quelle und sehen Sie, wie viel Pipeline die KI-Suche im Vergleich zu allen anderen Kanälen bringt.",
      },
      {
        icon: "workflow",
        title: "Genau das senden, was Sie wählen",
        body: "Trigger und Attribute legen Sie im Workflow fest – nur die Daten, die Sie auswählen, verlassen Attio.",
      },
      {
        icon: "users",
        title: "Website-Antworten mit CRM-Datensätzen verbinden",
        body: "Fragen Sie „Wie sind Sie auf uns aufmerksam geworden?“ auf Ihrer Website und senden Sie Datensätze aus Attio mit E-Mail – AutoSEO verknüpft beides per Hash.",
      },
      {
        icon: "sparkles",
        title: "Leads je Assistent zählen",
        body: "Eine Lead-Quelle wie „ChatGPT“ oder „Perplexity“ wird als KI-Suche erkannt und je Assistent gezählt.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Attio in vier Schritten verbinden –",
    muted: "per Workflow-Block.",
    items: [
      {
        title: "Webhook-URL erzeugen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → Attio und klicken Sie auf Connect. Kopieren Sie die Webhook-URL – sie wird nur einmal angezeigt.",
      },
      {
        title: "Attio-Workflow anlegen",
        body: "Lassen Sie ihn starten, wenn ein Datensatz angelegt oder geändert wird – etwa bei Deals oder Personen.",
      },
      {
        title: "„Send HTTP request“ hinzufügen",
        body: "Methode POST, Ihre Webhook-URL und ein JSON-Body mit channelId (Ihre Lead-Quelle), respondentEmail, respondentExternalId, dealValue und dealCurrency.",
      },
      {
        title: "Einmal ausführen",
        body: "Führen Sie den Workflow aus und prüfen Sie die Zustellung unter Webhook Logs. Einen Body mit anderer Struktur ordnen Sie einmalig unter Field Mapping zu.",
      },
    ],
  },
  faq: [
    {
      q: "Wie sende ich Attio-Daten an AutoSEO?",
      a: "Legen Sie einen Attio-Workflow an, der bei neuen oder geänderten Datensätzen startet, und fügen Sie einen Block „Send HTTP request“ hinzu, der JSON an Ihre AutoSEO-Webhook-URL sendet. AutoSEO liest Lead-Quelle, E-Mail und Deal-Wert und ordnet den Datensatz einem Kanal zu.",
    },
    {
      q: "Welche Felder muss ich senden?",
      a: "Nur channelId, die Antwort auf „Wie sind Sie auf uns aufmerksam geworden?“. Ergänzen Sie respondentEmail, um Website-Antworten zu verknüpfen, respondentExternalId (die Datensatz-ID), damit Updates keine Duplikate erzeugen, und dealValue mit einer dreistelligen dealCurrency für den Umsatz.",
    },
    {
      q: "Welche Werte akzeptiert channelId?",
      a: "ai_search, search, social, ads, referral, content oder other – oder Freitext. AutoSEO normalisiert Antworten wie „ChatGPT“, „über Perplexity gefunden“ oder „LinkedIn“ auf den passenden Kanal und erkennt den Assistenten.",
    },
    {
      q: "Was passiert, wenn sich ein Datensatz erneut ändert?",
      a: "Mit gesetzter respondentExternalId aktualisiert AutoSEO den vorhandenen Eintrag, statt einen neuen anzulegen, und ein neuer Deal-Wert ersetzt den alten.",
    },
    {
      q: "Braucht AutoSEO Zugriff auf meinen Attio-Workspace?",
      a: "Nein. Attio sendet die Daten aus einem Workflow, den Sie steuern, und AutoSEO ruft die Attio-API nie auf. Die Webhook-URL enthält ein geheimes Token, das AutoSEO nur als Hash speichert.",
    },
    {
      q: "Ist die Attio-Integration im Preis enthalten?",
      a: "Ja. Attribution und alle Integrationen sind Teil der Open-Source-App: kostenlos beim Self-Hosting oder in einem AutoSEO-Cloud-Workspace für 50\u00a0$ im Monat enthalten, inklusive 10\u00a0$ KI- und Datennutzung.",
    },
  ],
  cta: {
    title: "Verbinden Sie Ihre Attio-Pipeline mit der KI-Suche",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
