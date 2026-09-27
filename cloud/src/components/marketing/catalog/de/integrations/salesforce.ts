import type { IntegrationPage } from "../../types";

export default {
  slug: "salesforce",
  name: "Salesforce",
  nav: "Salesforce",
  summary: "Salesforce-Leads und Opportunities an AutoSEO senden und der KI-Suche zuordnen.",
  meta: {
    title: "Salesforce-Attribution für die KI-Suche",
    description:
      "Ordnen Sie Salesforce-Leads und Opportunities ChatGPT, Perplexity und anderen KI-Assistenten zu – per Record-Triggered Flow mit Lead-Quelle und Betrag.",
  },
  hero: {
    subtitle:
      "Rufen Sie AutoSEO aus einem Record-Triggered Flow in Salesforce auf und sehen Sie, welche Leads und gewonnenen Opportunities aus der KI-Suche kamen – mit Lead-Quelle, Betrag und Währung.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Salesforce-Integration",
    items: [
      "Anbindung über einen HTTP-Callout im Flow – ohne Managed Package und ohne Zugriff auf Ihre Org",
      "Leads oder Opportunities, sobald sie Closed Won erreichen",
      "Id, Email, LeadSource, Amount und CurrencyIsoCode sind vorab zugeordnet",
      "Eigene Felder für „Wie sind Sie auf uns aufmerksam geworden?“ per Field Mapping",
      "Werte wie „ChatGPT“ oder „KI-Suche“ zählen als KI-Suche – je Assistent",
      "Webhook Logs zur Kontrolle jedes Callouts",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Salesforce und AutoSEO",
    items: [
      {
        icon: "euro",
        title: "Umsatz aus der KI-Suche messen",
        body: "Gewonnene Opportunities bringen ihren Betrag mit – so sehen Sie, welchen Umsatz Käufer der KI-Suche zuschreiben.",
      },
      {
        icon: "target",
        title: "Leads aus der KI-Suche qualifizieren",
        body: "Sehen Sie, wie viele Leads die KI-Suche als Quelle angeben – und welchen Assistenten: ChatGPT, Perplexity, Claude, Gemini oder Copilot.",
      },
      {
        icon: "users",
        title: "Website-Antworten mit Opportunities verbinden",
        body: "Fragen Sie „Wie sind Sie auf uns aufmerksam geworden?“ auf Ihrer Website und senden Sie Opportunities ohne Antwort – AutoSEO ordnet sie per E-Mail-Hash zu.",
      },
      {
        icon: "lock",
        title: "Die Kontrolle über Ihre Salesforce-Daten behalten",
        body: "AutoSEO meldet sich nie bei Salesforce an. Ihr Flow entscheidet, welche Felder wann gesendet werden.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Salesforce in vier Schritten verbinden –",
    muted: "per HTTP-Callout im Flow.",
    items: [
      {
        title: "Webhook-URL erzeugen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → Salesforce und klicken Sie auf Connect. Kopieren Sie die Webhook-URL – sie wird nur einmal angezeigt.",
      },
      {
        title: "Named Credential anlegen",
        body: "Legen Sie in Salesforce unter Setup → Named Credentials eine External Credential und eine Named Credential an, die auf Ihren AutoSEO-Host zeigen.",
      },
      {
        title: "Record-Triggered Flow erstellen",
        body: "Lösen Sie ihn bei Leads aus – oder bei Opportunities, sobald sie Closed Won sind – und fügen Sie die Aktion „Create HTTP Callout“ hinzu, die den Datensatz als JSON per POST an den Webhook-Pfad samt Token sendet.",
      },
      {
        title: "Zuordnen und prüfen",
        body: "Senden Sie Id, Email, LeadSource oder Ihr eigenes Feld, Amount und CurrencyIsoCode. Prüfen Sie den ersten Callout unter Webhook Logs und bestätigen Sie die Felder unter Field Mapping.",
      },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich Leads aus ChatGPT in Salesforce?",
      a: "Erfassen Sie, wie Leads Sie gefunden haben – in LeadSource oder einem eigenen Feld für „Wie sind Sie auf uns aufmerksam geworden?“ –, und senden Sie neue Leads per Record-Triggered Flow an AutoSEO. AutoSEO erkennt Antworten, die ChatGPT oder andere Assistenten nennen, als KI-Suche und weist sie je Assistent aus.",
    },
    {
      q: "Muss ich eine Salesforce-App oder ein Managed Package installieren?",
      a: "Nein. Die Integration nutzt einen Standard-Flow in Salesforce mit HTTP-Callout. AutoSEO erhält keinen Zugriff auf Ihre Org – nur die Felder, die Ihr Flow sendet.",
    },
    {
      q: "Welche Salesforce-Felder nutzt AutoSEO?",
      a: "Standardmäßig Id, Email, LeadSource, Amount und CurrencyIsoCode. Speichern Sie die Antwort in einem eigenen Feld, senden Sie dieses mit und ordnen Sie es einmalig unter Field Mapping zu.",
    },
    {
      q: "Kann ich statt Leads auch Opportunities senden?",
      a: "Ja. Lösen Sie den Flow bei Opportunities aus, sobald die Phase auf Closed Won wechselt, und senden Sie Amount und CurrencyIsoCode mit – so wird der Umsatz dem Kanal der Antwort zugeordnet.",
    },
    {
      q: "Unsere Picklist für die Lead-Quelle hat keine KI-Option. Was tun?",
      a: "Ergänzen Sie einen Wert wie „KI-Suche (ChatGPT, Perplexity …)“ oder nutzen Sie ein Freitextfeld. AutoSEO erkennt Namen von Assistenten im Freitext, sodass Antworten wie „ChatGPT gefragt“ als KI-Suche zählen.",
    },
    {
      q: "Wie ist der Salesforce-Webhook abgesichert?",
      a: "Jede Webhook-URL enthält ein geheimes Token, das AutoSEO nur als Hash speichert. Sie können die URL jederzeit neu erzeugen; die alte funktioniert dann sofort nicht mehr. E-Mail-Adressen werden als Hash mit maskierter Vorschau gespeichert.",
    },
  ],
  cta: {
    title: "Verbinden Sie Ihre Pipeline mit der KI-Suche",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
