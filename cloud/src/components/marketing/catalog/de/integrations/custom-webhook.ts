import type { IntegrationPage } from "../../types";

export default {
  slug: "custom-webhook",
  name: "Eigener Webhook",
  nav: "Eigener Webhook",
  summary: "Antworten, Leads und Bestellungen aus jedem System als JSON an AutoSEO senden.",
  meta: {
    title: "Attribution-Webhook für die KI-Suche",
    description:
      "Senden Sie Leads, Bestellungen und Antworten auf „Wie sind Sie auf uns aufmerksam geworden?“ per JSON-Webhook an AutoSEO und ordnen Sie sie der KI-Suche zu.",
  },
  hero: {
    subtitle:
      "Senden Sie JSON aus Ihrem eigenen Backend, Checkout oder Formular-Handler an die Webhook-URL Ihres Projekts. Nutzen Sie direkt das AutoSEO-Schema oder senden Sie eine beliebige Struktur und ordnen Sie sie einmal zu – spätere Payloads werden automatisch gelesen.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit dem eigenen Webhook",
    items: [
      "Ein HTTPS-Endpoint pro Projekt, mit dem Token in der URL oder im Header",
      "JSON-, form-encoded- und Multipart-Bodys bis 256 KB",
      "Das AutoSEO-Schema für Antworten (channelId) und Bestellungen (transactionId und dealValue)",
      "Unbekannte Strukturen legen bei der ersten Zustellung einen Field-Mapping-Workflow an",
      "Payloads, die auf ein Mapping warten, werden sieben Tage verschlüsselt aufbewahrt und danach verarbeitet",
      "Bis zu 120 Requests pro Minute und Projekt, jeder unter Webhook Logs",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit dem eigenen Webhook",
    items: [
      {
        icon: "code",
        title: "Aus dem eigenen Backend melden",
        body: "Senden Sie die Antwort aus Ihrem Anmelde- oder Checkout-Handler zusammen mit Bestell-ID und Wert.",
      },
      {
        icon: "layers",
        title: "Jede Payload-Struktur annehmen",
        body: "Richten Sie einen vorhandenen Webhook eines anderen Tools auf AutoSEO und ordnen Sie seine Felder einmalig unter Field Mapping zu.",
      },
      {
        icon: "lock",
        title: "Zuordnen, ohne E-Mails zu teilen",
        body: "Hashen Sie E-Mails selbst und senden Sie respondentEmailHash; AutoSEO ordnet über den Hash zu und sieht die Adresse nie.",
      },
      {
        icon: "sparkles",
        title: "Den Assistenten nennen",
        body: "Senden Sie channelDetail wie chatgpt oder perplexity oder Freitext – AutoSEO ordnet beides dem richtigen Assistenten zu.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Den Webhook in vier Schritten einrichten –",
    muted: "in jeder Sprache und jedem Tool.",
    items: [
      {
        title: "Webhook-URL erzeugen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → Custom Webhook und klicken Sie auf Connect. Kopieren Sie die URL – sie wird nur einmal angezeigt.",
      },
      {
        title: "Token-Übergabe wählen",
        body: "Lassen Sie es in der URL oder senden Sie es als Header X-Attribution-Token bzw. als Authorization: Bearer.",
      },
      {
        title: "Daten per POST senden",
        body: "Senden Sie channelId für eine Antwort oder transactionId mit dealValue und dealCurrency für eine Bestellung. Mit respondentEmail oder respondentEmailHash verknüpfen Sie beides.",
      },
      {
        title: "Andere Strukturen einmal zuordnen",
        body: "Nutzt Ihre Payload eine andere Struktur, öffnen Sie den neuen Workflow unter Field Mapping, wählen Sie Antwort, E-Mail, Wert und Bestellfelder und speichern Sie. Wartende Payloads werden sofort verarbeitet.",
      },
    ],
  },
  faq: [
    {
      q: "Wie sende ich Attribution-Daten aus meinem eigenen System an AutoSEO?",
      a: "Senden Sie JSON per POST an die Webhook-URL Ihres Projekts, mit mindestens channelId, der Antwort auf „Wie sind Sie auf uns aufmerksam geworden?“. AutoSEO ordnet die Antwort einem Kanal zu – KI-Suche, Suche, Social, Werbung, Empfehlung, Content oder Sonstiges – und verknüpft sie per Bestell-ID oder E-Mail-Hash mit Bestellungen.",
    },
    {
      q: "Wie sieht das JSON-Schema aus?",
      a: "Eine Antwort braucht channelId, zum Beispiel ai_search oder Freitext wie „ChatGPT“. Optional sind channelDetail, freetextResponse, respondentEmail oder respondentEmailHash, respondentExternalId, respondentName, dealValue, dealCurrency, transactionId, formId, formName, pageUrl, occurredAt und bis zu 8 KB metadata.",
    },
    {
      q: "Kann ich Bestellungen ohne Antwort senden?",
      a: "Ja. Eine Payload mit transactionId oder mit dealValue und E-Mail wird als Conversion gespeichert. AutoSEO verknüpft sie per Bestell-ID oder E-Mail-Hash mit der Antwort des Kunden und schaut dabei bis zu 90 Tage zurück.",
    },
    {
      q: "Was, wenn meine Payload anders aufgebaut ist?",
      a: "Die erste Zustellung legt unter Field Mapping einen Workflow mit vorgeschlagenen Feldern an. Pfade reichen in verschachtelte Objekte und Arrays, etwa answers[field.ref=hdyhau].choice.label, und nach dem Speichern werden künftige Payloads dieser Struktur automatisch gelesen.",
    },
    {
      q: "Webhook oder REST API – was soll ich nutzen?",
      a: "Nutzen Sie den Webhook für Events aus anderen Systemen; er braucht nur das Token der URL. Die REST API benötigt einen API-Key mit dem Scope write und bietet zusätzlich einen Bulk-Endpoint für bis zu 1.000 Antworten pro Request.",
    },
    {
      q: "Wie ist der eigene Webhook abgesichert?",
      a: "Das Token wird nur als Hash gespeichert und lässt sich jederzeit neu erzeugen. Requests ohne gültiges Token werden abgelehnt und pro IP begrenzt, und E-Mails werden beim Eingang gehasht.",
    },
    {
      q: "Ist der eigene Webhook im Preis enthalten?",
      a: "Ja. Attribution und alle Integrationen sind Teil der Open-Source-App: kostenlos beim Self-Hosting oder in einem AutoSEO-Cloud-Workspace für 50\u00a0$ im Monat enthalten, inklusive 10\u00a0$ KI- und Datennutzung.",
    },
  ],
  cta: {
    title: "Ordnen Sie jedes System der KI-Suche zu",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
