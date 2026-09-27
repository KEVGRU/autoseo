import type { IntegrationPage } from "../../types";

export default {
  slug: "zapier",
  name: "Zapier / Make",
  nav: "Zapier / Make",
  summary: "Antworten, Leads und Bestellungen aus jeder App per Zapier oder Make an AutoSEO senden.",
  meta: {
    title: "Zapier & Make: Attribution für die KI-Suche",
    description:
      "Senden Sie Antworten auf „Wie sind Sie auf uns aufmerksam geworden?“, Leads und Bestellungen per Zapier oder Make an AutoSEO und ordnen Sie sie der KI-Suche zu.",
  },
  hero: {
    subtitle:
      "Nutzen Sie einen POST mit „Webhooks by Zapier“ oder einen HTTP-Request in Make, um Antworten, Leads und Bestellungen aus Formularen, CRMs und Shops ohne native AutoSEO-Integration zu senden – zugeordnet zur KI-Suche und Ihren anderen Kanälen.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit Zapier und Make",
    items: [
      "Zapier: die Aktion „Webhooks by Zapier → POST“ mit Payload-Typ JSON",
      "Make: das Modul „HTTP → Make a request“ mit Methode POST und JSON-Body",
      "Das AutoSEO-Schema – eine Antwort braucht nur channelId",
      "Bestellungen ohne Antwort werden aus transactionId und dealValue als Conversions gespeichert",
      "Jede andere Body-Struktur wird einmalig unter Field Mapping zugeordnet",
      "Jeder Lauf unter Webhook Logs",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Zapier, Make und AutoSEO",
    items: [
      {
        icon: "plug",
        title: "Tools ohne native Integration anbinden",
        body: "Jedes Formular, CRM oder jeder Shop, den Zapier oder Make lesen kann, sendet seine Antworten auf „Wie sind Sie auf uns aufmerksam geworden?“ an AutoSEO.",
      },
      {
        icon: "euro",
        title: "Bestellungen und Deals senden",
        body: "Übergeben Sie Bestell-ID, Wert und Währung, und AutoSEO ordnet die Bestellung per Bestell-ID oder E-Mail-Hash der Antwort des Käufers zu.",
      },
      {
        icon: "workflow",
        title: "Daten vor dem Versand bereinigen",
        body: "Filtern, formatieren oder ergänzen Sie Felder zuerst in Ihrem Zap oder Szenario – nur was Sie auswählen, erreicht AutoSEO.",
      },
      {
        icon: "lock",
        title: "Einen Hash statt der E-Mail senden",
        body: "Übergeben Sie respondentEmailHash (einen SHA-256-Hash) statt der Adresse – AutoSEO ordnet Antworten und Bestellungen trotzdem zu.",
      },
      {
        icon: "bell",
        title: "Neue Antworten weiterleiten",
        body: "Abonnieren Sie mit einem Zapier- oder Make-Webhook das AutoSEO-Event attribution.response_created und leiten Sie neue Antworten an Slack, eine Tabelle oder Ihr CRM weiter.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Zapier oder Make in vier Schritten verbinden –",
    muted: "ohne eigenen Code.",
    items: [
      {
        title: "Webhook-URL erzeugen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → Zapier / Make und klicken Sie auf Connect. Kopieren Sie die Webhook-URL – sie wird nur einmal angezeigt.",
      },
      {
        title: "Webhook-Schritt hinzufügen",
        body: "In Zapier fügen Sie „Webhooks by Zapier → POST“ mit Payload-Typ JSON hinzu, in Make „HTTP → Make a request“ mit Methode POST und Body-Typ JSON. Nutzen Sie Ihre Webhook-URL.",
      },
      {
        title: "Schema befüllen",
        body: "Senden Sie channelId (die Antwort) und optional respondentEmail, respondentExternalId, dealValue, dealCurrency, formId und pageUrl.",
      },
      {
        title: "Test ausführen",
        body: "Testen Sie den Schritt – das Event erscheint innerhalb von Sekunden unter Webhook Logs.",
      },
    ],
  },
  faq: [
    {
      q: "Wie sende ich Daten aus Zapier an AutoSEO?",
      a: "Fügen Sie Ihrem Zap die Aktion „Webhooks by Zapier → POST“ hinzu, tragen Sie Ihre AutoSEO-Webhook-URL ein, wählen Sie den Payload-Typ JSON und senden Sie mindestens channelId, die Antwort auf „Wie sind Sie auf uns aufmerksam geworden?“. AutoSEO ordnet die Antwort einem Kanal zu und verknüpft sie mit E-Mail oder Bestell-ID auch mit Umsatz.",
    },
    {
      q: "Funktioniert es auch mit Make?",
      a: "Ja. Fügen Sie in Make das Modul „HTTP → Make a request“ mit Methode POST, Body-Typ JSON und Ihrer Webhook-URL hinzu. Der Body folgt demselben Schema wie bei Zapier.",
    },
    {
      q: "Welche Felder kann ich senden?",
      a: "channelId (Pflicht für Antworten), channelDetail für den Assistenten wie chatgpt, freetextResponse, respondentEmail oder respondentEmailHash, respondentExternalId, respondentName, dealValue, dealCurrency, transactionId, formId, formName, pageUrl und occurredAt.",
    },
    {
      q: "Wie sende ich eine Bestellung ohne Antwort?",
      a: "Senden Sie transactionId mit dealValue und dealCurrency, dazu die E-Mail, falls vorhanden. AutoSEO speichert sie als Conversion und verknüpft sie per Bestell-ID oder E-Mail-Hash mit der Antwort des Käufers – bis zu 90 Tage rückwirkend.",
    },
    {
      q: "Gibt es Limits?",
      a: "Jedes Projekt nimmt bis zu 120 Requests pro Minute und 256 KB pro Payload an. Für große Nachträge nimmt der Bulk-Endpoint der REST API bis zu 1.000 Antworten pro Request an.",
    },
    {
      q: "Ist die Zapier- und Make-Integration im Preis enthalten?",
      a: "Auf AutoSEO-Seite ja: Attribution und alle Integrationen sind Teil der Open-Source-App – kostenlos beim Self-Hosting oder in einem AutoSEO-Cloud-Workspace für 50\u00a0$ im Monat enthalten. Zapier und Make berechnen ihre eigenen Tarife.",
    },
  ],
  cta: {
    title: "Ordnen Sie jedes Tool Ihres Stacks zu",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
