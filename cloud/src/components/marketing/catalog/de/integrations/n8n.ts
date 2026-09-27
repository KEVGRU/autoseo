import type { IntegrationPage } from "../../types";

export default {
  slug: "n8n",
  name: "n8n",
  nav: "n8n",
  summary: "Antworten und Bestellungen aus jedem n8n-Workflow an AutoSEO senden.",
  meta: {
    title: "n8n: Attribution für die KI-Suche",
    description:
      "Senden Sie Antworten auf „Wie sind Sie auf uns aufmerksam geworden?“ und Bestellungen per HTTP-Request-Node aus n8n an AutoSEO – zugeordnet zur KI-Suche.",
  },
  hero: {
    subtitle:
      "Fügen Sie einem n8n-Workflow einen HTTP-Request-Node hinzu und senden Sie Antworten, Leads und Bestellungen an AutoSEO – von jedem Trigger, den n8n kennt, ob n8n in der Cloud oder auf Ihrem eigenen Server läuft.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der n8n-Integration",
    items: [
      "Ein n8n-HTTP-Request-Node: Methode POST, Body als JSON",
      "Funktioniert mit n8n Cloud und selbst gehostetem n8n – n8n ruft AutoSEO auf, nicht umgekehrt",
      "Das AutoSEO-Schema: channelId für Antworten, transactionId und dealValue für Bestellungen",
      "Das Token in der URL oder in einem Header X-Attribution-Token bzw. Authorization: Bearer",
      "Jede andere Body-Struktur wird einmalig unter Field Mapping zugeordnet",
      "Jede Ausführung unter Webhook Logs",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit n8n und AutoSEO",
    items: [
      {
        icon: "workflow",
        title: "Jeder Trigger, ein Ziel",
        body: "Formulare, CRMs, Datenbanken oder Tabellen, die n8n lesen kann, werden zu Attribution-Quellen für AutoSEO.",
      },
      {
        icon: "server",
        title: "Den Datenfluss auf Ihren Servern halten",
        body: "Betreiben Sie n8n selbst und legen Sie im Workflow fest, welche Felder an AutoSEO gehen.",
      },
      {
        icon: "euro",
        title: "Bestellungen aus jedem Shopsystem",
        body: "Senden Sie Bestell-ID, Wert und Währung aus jedem System, und AutoSEO verknüpft die Bestellung mit der Antwort des Käufers.",
      },
      {
        icon: "bell",
        title: "Auf neue Antworten reagieren",
        body: "Richten Sie das AutoSEO-Event attribution.response_created auf einen n8n-Webhook-Node und leiten Sie neue Antworten weiter, wohin Sie wollen.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "n8n in vier Schritten verbinden –",
    muted: "mit einem HTTP-Request-Node.",
    items: [
      {
        title: "Webhook-URL erzeugen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → n8n und klicken Sie auf Connect. Kopieren Sie die Webhook-URL – sie wird nur einmal angezeigt.",
      },
      {
        title: "HTTP-Request-Node hinzufügen",
        body: "Methode POST, Ihre Webhook-URL, Send Body aktiviert und Body Content Type JSON.",
      },
      {
        title: "Body aufbauen",
        body: "Senden Sie channelId (die Antwort) und optional respondentEmail, respondentExternalId, dealValue, dealCurrency, formId und pageUrl.",
      },
      {
        title: "Workflow ausführen",
        body: "Führen Sie ihn einmal aus und prüfen Sie die Zustellung unter Webhook Logs.",
      },
    ],
  },
  faq: [
    {
      q: "Wie verbinde ich n8n mit AutoSEO?",
      a: "Fügen Sie Ihrem Workflow einen HTTP-Request-Node hinzu, setzen Sie die Methode auf POST und die URL auf Ihre AutoSEO-Webhook-URL und senden Sie einen JSON-Body mit mindestens channelId. AutoSEO ordnet jede Antwort einem Kanal zu und verknüpft Bestellungen per Bestell-ID oder E-Mail-Hash.",
    },
    {
      q: "Funktioniert es mit selbst gehostetem n8n?",
      a: "Ja. n8n muss nur Ihre AutoSEO-Webhook-URL per HTTPS erreichen; um Attribution-Daten zu empfangen, muss AutoSEO Ihren n8n-Server nie aufrufen.",
    },
    {
      q: "Kann ich das Token aus der URL heraushalten?",
      a: "Ja. Senden Sie es als Header X-Attribution-Token oder als Authorization: Bearer – etwa aus einem n8n-Header-Credential – und lassen Sie den Token-Parameter in der URL weg.",
    },
    {
      q: "Kann AutoSEO neue Antworten an n8n senden?",
      a: "Ja. Tragen Sie unter Integrations → Webhooks die URL Ihres n8n-Webhook-Nodes ein und abonnieren Sie attribution.response_created. Zustellungen sind signiert und werden wiederholt; einen n8n-Host im privaten Netz muss ein Admin Ihres selbst gehosteten AutoSEO freigeben.",
    },
    {
      q: "Gibt es Limits?",
      a: "Jedes Projekt nimmt bis zu 120 Requests pro Minute und 256 KB pro Payload an. Für große Nachträge nimmt der Bulk-Endpoint der REST API bis zu 1.000 Antworten pro Request an.",
    },
    {
      q: "Ist die n8n-Integration im Preis enthalten?",
      a: "Ja. Attribution und alle Integrationen sind Teil der Open-Source-App: kostenlos beim Self-Hosting oder in einem AutoSEO-Cloud-Workspace für 50\u00a0$ im Monat enthalten, inklusive 10\u00a0$ KI- und Datennutzung.",
    },
  ],
  cta: {
    title: "Automatisieren Sie Ihre Attribution-Daten",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
