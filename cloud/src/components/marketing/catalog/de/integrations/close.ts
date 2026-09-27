import type { IntegrationPage } from "../../types";

export default {
  slug: "close",
  name: "Close",
  nav: "Close",
  summary: "Close-Leads und Opportunities per Webhook-Abo der KI-Suche zuordnen.",
  meta: {
    title: "Close-CRM-Leads der KI-Suche zuordnen",
    description:
      "Ordnen Sie Close-CRM-Leads und Opportunities ChatGPT, Perplexity und anderen KI-Assistenten zu: Ein Webhook-Abo sendet Lead- und Opportunity-Events an AutoSEO.",
  },
  hero: {
    subtitle:
      "Abonnieren Sie in Close die Events lead.created und opportunity.updated für AutoSEO, ordnen Sie Ihr eigenes Lead-Quellen-Feld einmalig zu und sehen Sie, wie viele Leads und wie viel Opportunity-Wert die KI-Suche bringt.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Close-Integration",
    items: [
      "Ein Close-Webhook-Abo für lead.created und opportunity.updated",
      "Datensatz-ID, Opportunity-Wert und Währung im Field Mapping vorausgefüllt",
      "Ihr eigenes Feld „Wie sind Sie auf uns aufmerksam geworden?“ einmalig unter Field Mapping zugeordnet",
      "Wiederholte Events zu einem Lead oder einer Opportunity aktualisieren einen Eintrag",
      "Lead-Quellen wie „ChatGPT“ oder „KI-Suche“ zählen als KI-Suche – je Assistent",
      "Jedes Event unter Webhook Logs",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Close und AutoSEO",
    items: [
      {
        icon: "users",
        title: "Leads aus der KI-Suche zählen",
        body: "Neue Leads kommen an, sobald sie in Close angelegt werden – sortiert nach KI-Suche, Suche, Social, Werbung, Empfehlung und Content.",
      },
      {
        icon: "euro",
        title: "Opportunity-Wert je Kanal",
        body: "Opportunity-Updates enthalten Wert und Währung, so sehen Sie die Pipeline je Kanal, während Deals vorankommen.",
      },
      {
        icon: "sparkles",
        title: "Sehen, welcher Assistent den Lead gebracht hat",
        body: "Lead-Quellen, die ChatGPT, Perplexity, Claude, Gemini oder Copilot nennen, werden je Assistent gezählt.",
      },
      {
        icon: "refresh",
        title: "Nichts geht während der Einrichtung verloren",
        body: "Events, die vor dem fertigen Mapping eintreffen, werden sieben Tage verschlüsselt aufbewahrt und verarbeitet, sobald Sie speichern.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Close in vier Schritten verbinden –",
    muted: "per Webhook-Abo.",
    items: [
      {
        title: "Webhook-URL erzeugen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → Close und klicken Sie auf Connect. Kopieren Sie die Webhook-URL – sie wird nur einmal angezeigt.",
      },
      {
        title: "Webhook-Abo anlegen",
        body: "Öffnen Sie in Close Settings → Developer → Webhooks und abonnieren Sie lead.created und opportunity.updated mit Ihrer Webhook-URL.",
      },
      {
        title: "Test-Event auslösen",
        body: "Legen Sie einen Lead an oder ändern Sie eine Opportunity; das Event erscheint unter Webhook Logs.",
      },
      {
        title: "Eigene Felder zuordnen",
        body: "Öffnen Sie Field Mapping, wählen Sie Ihr Lead-Quellen-Feld aus event.data als Antwort und speichern Sie.",
      },
    ],
  },
  faq: [
    {
      q: "Wie ordne ich Close-Leads ChatGPT zu?",
      a: "Abonnieren Sie in Close Lead- und Opportunity-Events mit Ihrer AutoSEO-Webhook-URL und ordnen Sie Ihr Lead-Quellen-Feld einmalig zu. Leads, deren Quelle ChatGPT, Perplexity oder „KI-Suche“ nennt, zählen dann als KI-Suche – je Assistent.",
    },
    {
      q: "Welche Close-Events nutzt AutoSEO?",
      a: "lead.created für neue Leads und opportunity.updated für Opportunities. Datensatz-ID, Opportunity-Wert und Währung sind im Field Mapping vorausgefüllt; Ihr Lead-Quellen-Feld ergänzen Sie einmalig.",
    },
    {
      q: "Muss ich AutoSEO einen Close-API-Key geben?",
      a: "Nein. Close sendet Events an Ihre Webhook-URL, und AutoSEO ruft die Close-API nie auf und liest Ihr Konto nicht.",
    },
    {
      q: "Was, wenn Events vor dem fertigen Mapping eintreffen?",
      a: "Sie werden bis zu sieben Tage verschlüsselt gespeichert und verarbeitet, sobald Sie das Mapping speichern. Danach wird jedes Event mit derselben Struktur automatisch gelesen.",
    },
    {
      q: "Wie ist der Close-Webhook abgesichert?",
      a: "Die Webhook-URL enthält ein geheimes Token, das AutoSEO nur als Hash speichert. Sie können die URL jederzeit neu erzeugen; die alte funktioniert dann sofort nicht mehr.",
    },
    {
      q: "Ist die Close-Integration im Preis enthalten?",
      a: "Ja. Attribution und alle Integrationen sind Teil der Open-Source-App: kostenlos beim Self-Hosting oder in einem AutoSEO-Cloud-Workspace für 50\u00a0$ im Monat enthalten, inklusive 10\u00a0$ KI- und Datennutzung.",
    },
  ],
  cta: {
    title: "Erfahren Sie, welche Close-Leads die KI-Suche schickt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
