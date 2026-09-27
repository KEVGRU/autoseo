import type { IntegrationPage } from "../../types";

export default {
  slug: "formstack",
  name: "Formstack",
  nav: "Formstack",
  summary: "Formstack-Einsendungen an AutoSEO senden und Leads und Anmeldungen der KI-Suche zuordnen.",
  meta: {
    title: "Formstack-Attribution für die KI-Suche",
    description:
      "Formstack per JSON-Webhook mit AutoSEO verbinden, die Herkunftsfrage einmal zuordnen und sehen, welche Einsendungen aus ChatGPT und der KI-Suche kommen.",
  },
  hero: {
    subtitle:
      "Legen Sie unter Settings → Emails & Actions einen Webhook an, senden Sie JSON mit Unterfeldnamen und ordnen Sie Ihr Feld „Wie sind Sie auf uns aufmerksam geworden?“ einmal zu. Ab dann ordnet AutoSEO jede Formstack-Einsendung der KI-Suche und Ihren anderen Kanälen zu.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Formstack-Integration",
    items: [
      "Nutzt die Formular-Webhooks von Formstack – Sie geben kein API-Token heraus",
      "JSON mit Unterfeldnamen für saubere, lesbare Payloads",
      "Submission-ID und Formular-ID werden automatisch erkannt",
      "Antwort- und E-Mail-Feld ordnen Sie einmal unter Field Mapping zu",
      "Wiederholte Zustellungen werden über die eindeutige Submission-ID dedupliziert",
      "Webhook Logs zeigen jede Zustellung und ihren Status",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Formstack und AutoSEO",
    items: [
      {
        icon: "file-text",
        title: "Anmeldungen und Bewerbungen zuordnen",
        body: "Stellen Sie in Ihren Formstack-Formularen die Frage „Wie sind Sie auf uns aufmerksam geworden?“ und sehen Sie, wie viele Einsendungen KI-Assistenten bringen.",
      },
      {
        icon: "sparkles",
        title: "KI-Suche von klassischer Suche trennen",
        body: "„ChatGPT“ zählt als KI-Suche, „Google“ als Suche und „Google Gemini“ wieder als KI-Suche – je Assistent.",
      },
      {
        icon: "lock",
        title: "Personenbezogene Daten sparsam halten",
        body: "Nur die zugeordneten Felder werden Teil einer Antwort. E-Mail-Adressen werden als Hash gespeichert und in Freitext maskiert.",
      },
      {
        icon: "chart",
        title: "Über alle Kanäle berichten",
        body: "Formstack-Antworten fließen in dieselbe Attributionsübersicht wie Ihre anderen Quellen – filtern Sie nach Quelle oder vergleichen Sie Kanäle über beliebige Zeiträume.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Formstack in vier Schritten verbinden –",
    muted: "per Formular-Webhook.",
    items: [
      {
        title: "Webhook-URL erzeugen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → Formstack und klicken Sie auf Connect. Kopieren Sie die URL – sie wird nur einmal angezeigt.",
      },
      {
        title: "Webhook in Formstack anlegen",
        body: "Öffnen Sie Ihr Formular → Settings → Emails & Actions → Add Webhook und fügen Sie die URL ein.",
      },
      {
        title: "Als JSON senden",
        body: "Aktivieren Sie „Post with sub-field names“ und „Post as JSON“ und speichern Sie den Webhook.",
      },
      {
        title: "Einmal absenden und zuordnen",
        body: "Senden Sie das Formular ab, öffnen Sie Field Mapping, bestätigen Sie Antwort- und E-Mail-Feld und speichern Sie. Spätere Einsendungen werden automatisch gelesen.",
      },
    ],
  },
  faq: [
    {
      q: "Wie ordne ich Formstack-Einsendungen ChatGPT zu?",
      a: "Fügen Sie Ihrem Formular das Feld „Wie sind Sie auf uns aufmerksam geworden?“ hinzu, senden Sie Einsendungen per Formstack-Webhook an AutoSEO und ordnen Sie das Feld einmal zu. Antworten mit ChatGPT oder einem anderen Assistenten zählen dann als KI-Suche – je Assistent.",
    },
    {
      q: "Warum „Post as JSON“ und „Post with sub-field names“ aktivieren?",
      a: "JSON mit Unterfeldnamen gibt jedem Feld einen lesbaren Schlüssel – das macht die einmalige Zuordnung einfach. AutoSEO nimmt auch Form-encoded-Anfragen an, die Anleitung nutzt aber JSON.",
    },
    {
      q: "Erkennt AutoSEO die Frage automatisch?",
      a: "Teilweise. AutoSEO erkennt Submission- und Formular-ID von Formstack und schlägt Felder vor, deren Namen nach der Herkunftsfrage oder einer E-Mail-Adresse aussehen. Sie bestätigen die Zuordnung einmal, danach wird jede Einsendung automatisch gelesen.",
    },
    {
      q: "Was speichert AutoSEO aus einer Formstack-Einsendung?",
      a: "Die zugeordnete Antwort, die eindeutige Submission-ID, die Formular-ID und – falls zugeordnet – die E-Mail-Adresse als SHA-256-Hash mit maskierter Vorschau. Das Token der Webhook-URL wird nur als Hash gespeichert und lässt sich jederzeit neu erzeugen.",
    },
    {
      q: "Ist die Formstack-Integration kostenlos?",
      a: "Ja. Die Attribution und alle ihre Integrationen gehören zur Open-Source-App: kostenlos beim Self-Hosting oder enthalten in einem AutoSEO-Cloud-Workspace für 50\u00a0$ pro Monat. Antworten werden mit festen Regeln eingeordnet, nicht mit KI-Guthaben.",
    },
  ],
  cta: {
    title: "Sehen Sie, welche Einsendungen die KI-Suche bringt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
