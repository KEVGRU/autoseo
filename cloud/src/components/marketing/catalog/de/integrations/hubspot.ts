import type { IntegrationPage } from "../../types";

export default {
  slug: "hubspot",
  name: "HubSpot",
  nav: "HubSpot",
  summary: "HubSpot-Kontakte und Deals an AutoSEO senden und die Pipeline der KI-Suche zuordnen.",
  meta: {
    title: "HubSpot-Attribution für die KI-Suche",
    description:
      "Ordnen Sie HubSpot-Kontakte und Deals ChatGPT, Perplexity und anderen KI-Assistenten zu – per Workflow-Webhook mit Lead-Quelle und Deal-Wert in AutoSEO.",
  },
  hero: {
    subtitle:
      "Fügen Sie einem HubSpot-Workflow die Aktion „Webhook senden“ hinzu, und AutoSEO ordnet Ihre Kontakte und Deals – mit Lead-Quelle und Deal-Wert – der KI-Suche und Ihren anderen Kanälen zu.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der HubSpot-Integration",
    items: [
      "Anbindung über einen Webhook aus einem HubSpot-Workflow – ohne App und ohne Kontozugriff",
      "Kontakt- oder Deal-basierte Workflows inklusive Deal-Betrag und Währung",
      "Antworten auf „Wie sind Sie auf uns aufmerksam geworden?“ werden KI-Suche, Suche, Social, Werbung, Empfehlung und Content zugeordnet",
      "Antworten wie „ChatGPT“ oder „über Perplexity gefunden“ zählen als KI-Suche – je Assistent",
      "Field Mapping für eigene Properties – einmal zuordnen, künftige Payloads werden automatisch gelesen",
      "Webhook Logs zur Kontrolle jeder Zustellung",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit HubSpot und AutoSEO",
    items: [
      {
        icon: "euro",
        title: "Pipeline aus der KI-Suche messen",
        body: "Sehen Sie, welchen Deal-Wert Ihre HubSpot-Datensätze der KI-Suche zuschreiben – neben allen anderen Kanälen.",
      },
      {
        icon: "sparkles",
        title: "Sehen, welcher Assistent den Lead gebracht hat",
        body: "Leads, die ChatGPT, Perplexity, Claude, Gemini oder Copilot nennen, werden je Assistent gezählt.",
      },
      {
        icon: "users",
        title: "Website-Antworten mit Deals verbinden",
        body: "Fragen Sie „Wie sind Sie auf uns aufmerksam geworden?“ auf Ihrer Website und senden Sie Deals ohne Antwort – AutoSEO ordnet sie per E-Mail-Hash zu.",
      },
      {
        icon: "presentation",
        title: "Ihr GEO-Budget mit Zahlen begründen",
        body: "Zeigen Sie Stakeholdern, wie viel Pipeline Käufer der KI-Suche zuschreiben – neben Ihren AI-Visibility-Kennzahlen.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "HubSpot in vier Schritten verbinden –",
    muted: "per Workflow-Webhook.",
    items: [
      {
        title: "Webhook-URL erzeugen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → HubSpot und klicken Sie auf Connect. Kopieren Sie die Webhook-URL – sie wird nur einmal angezeigt.",
      },
      {
        title: "HubSpot-Workflow anlegen",
        body: "Erstellen Sie einen kontakt- oder dealbasierten Workflow und fügen Sie die Aktion „Webhook senden“ mit der Methode POST und Ihrer Webhook-URL hinzu.",
      },
      {
        title: "Request-Body anpassen",
        body: "Senden Sie Ihre Property für „Wie sind Sie auf uns aufmerksam geworden?“ als channelId, dazu E-Mail, Datensatz-ID, Betrag und Währung.",
      },
      {
        title: "Aktion testen",
        body: "Testen Sie die Aktion in HubSpot und prüfen Sie die Anfrage unter Webhook Logs. Ohne angepassten Body ordnen Sie die HubSpot-Properties einmalig unter Field Mapping zu.",
      },
    ],
  },
  faq: [
    {
      q: "Wie ordne ich HubSpot-Deals ChatGPT zu?",
      a: "Senden Sie Ihre Deals aus einem HubSpot-Workflow mit der Aktion „Webhook senden“ an AutoSEO – inklusive der Property für „Wie sind Sie auf uns aufmerksam geworden?“ und des Deal-Betrags. AutoSEO erkennt Antworten, die ChatGPT oder andere Assistenten nennen, als KI-Suche und summiert den Deal-Wert je Kanal.",
    },
    {
      q: "Muss ich eine HubSpot-App installieren?",
      a: "Nein. AutoSEO braucht keinen Zugriff auf Ihr HubSpot-Konto. HubSpot sendet die Daten aus einem Workflow, den Sie steuern, an die Webhook-URL Ihres Projekts – Sie entscheiden also, welche Properties HubSpot verlassen.",
    },
    {
      q: "Welchen HubSpot-Tarif brauche ich?",
      a: "Einen, dessen Workflows die Aktion „Webhook senden“ enthalten. Fehlt sie in Ihrem Tarif, senden Sie dieselben Daten über Zapier, Make oder n8n – auch diese nimmt AutoSEO an.",
    },
    {
      q: "Was, wenn unsere Lead-Quelle eigene Werte nutzt?",
      a: "AutoSEO normalisiert Antworten automatisch: Werte wie „ChatGPT“, „KI-Suche“ oder „Perplexity“ zählen als KI-Suche, „Google“ als Suche und „LinkedIn“ als Social. Andere Payload-Strukturen ordnen Sie einmalig unter Field Mapping zu.",
    },
    {
      q: "Wie ist der HubSpot-Webhook abgesichert?",
      a: "Jede Webhook-URL enthält ein geheimes Token, das AutoSEO nur als Hash speichert. Sie können die URL jederzeit neu erzeugen; die alte funktioniert dann sofort nicht mehr. E-Mail-Adressen werden als Hash mit maskierter Vorschau gespeichert.",
    },
  ],
  cta: {
    title: "Verbinden Sie Ihre Pipeline mit der KI-Suche",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
