import type { IntegrationPage } from "../../types";

export default {
  slug: "surveymonkey",
  name: "SurveyMonkey",
  nav: "SurveyMonkey",
  summary: "SurveyMonkey-Antworten stündlich importieren und sehen, wie viele Kunden über KI kamen.",
  meta: {
    title: "SurveyMonkey-Attribution für die KI-Suche",
    description:
      "Importieren Sie Antworten auf „Wie sind Sie auf uns aufmerksam geworden?“ stündlich aus SurveyMonkey und sehen Sie, welche Kunden über ChatGPT & Co. kamen.",
  },
  hero: {
    subtitle:
      "Verbinden Sie eine SurveyMonkey-Umfrage mit dem Access Token einer Private App. AutoSEO holt abgeschlossene Antworten stündlich ab, übersetzt Antwortoptionen zurück in ihren Text und ordnet jede befragte Person der KI-Suche und Ihren anderen Kanälen zu.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der SurveyMonkey-Integration",
    items: [
      "Stündlicher Import über die SurveyMonkey-API v3, dazu Sync now",
      "Die erste Synchronisierung umfasst abgeschlossene Antworten der letzten 90 Tage",
      "Die Herkunftsfrage wird an ihrer Überschrift erkannt – oder Sie hinterlegen die Question-ID",
      "Choice-IDs werden in ihren Text übersetzt, „Sonstiges“-Antworten als Freitext eingeordnet",
      "E-Mail-Adressen aus den Kontaktdaten der Antwort, gespeichert nur als Hash",
      "CSV-Upload für ältere Exporte",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit SurveyMonkey und AutoSEO",
    items: [
      {
        icon: "users",
        title: "Bestehende Kunden befragen",
        body: "Versenden Sie eine Onboarding- oder Kundenumfrage und erfahren Sie, wie viele Kunden Sie nach eigener Aussage über die KI-Suche gefunden haben.",
      },
      {
        icon: "sparkles",
        title: "Den Assistenten hinter der Antwort sehen",
        body: "Auswahl- und Freitextantworten mit ChatGPT, Perplexity, Claude, Gemini oder Copilot werden je Assistent gezählt.",
      },
      {
        icon: "euro",
        title: "Befragte mit Umsatz verbinden",
        body: "Enthalten Antworten die E-Mail-Adresse, ordnet AutoSEO sie per E-Mail-Hash den Bestellungen oder Zahlungen aus Ihren anderen Quellen zu.",
      },
      {
        icon: "download",
        title: "Aus Exporten nachfüllen",
        body: "Laden Sie einen CSV-Export mit bis zu 5 MB hoch, um ältere Antworten zu übernehmen. Die Spalten werden automatisch erkannt.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "SurveyMonkey in vier Schritten verbinden –",
    muted: "über die API v3.",
    items: [
      {
        title: "Private App anlegen",
        body: "Legen Sie auf developer.surveymonkey.com eine Private App mit den Scopes „View surveys“ und „View responses“ an und kopieren Sie ihr Access Token.",
      },
      {
        title: "Umfrage-ID finden",
        body: "Kopieren Sie die numerische ID der Umfrage, die Ihre Frage „Wie sind Sie auf uns aufmerksam geworden?“ enthält.",
      },
      {
        title: "In AutoSEO verbinden",
        body: "Öffnen Sie Attribution → Integrations → SurveyMonkey, fügen Sie Token und Umfrage-ID ein und klicken Sie auf Connect. Der erste Import startet sofort.",
      },
      {
        title: "Synchronisieren lassen",
        body: "Neue abgeschlossene Antworten kommen stündlich an. Mit Sync now aktualisieren Sie jederzeit sofort.",
      },
    ],
  },
  faq: [
    {
      q: "Wie importiere ich SurveyMonkey-Antworten in AutoSEO?",
      a: "Legen Sie in SurveyMonkey eine Private App mit Lesezugriff auf Umfragen und Antworten an und verbinden Sie deren Access Token und Ihre Umfrage-ID unter Attribution → Integrations → SurveyMonkey. AutoSEO importiert abgeschlossene Antworten stündlich und ordnet jede Antwort KI-Suche, Suche, Social, Werbung, Empfehlung, Content oder Sonstigem zu.",
    },
    {
      q: "Welche SurveyMonkey-Berechtigungen braucht AutoSEO?",
      a: "Eine Private App mit den Scopes „View surveys“ und „View responses“. AutoSEO liest die Fragen der Umfrage, um Ihre Frage zu finden und Antwortoptionen in Text zu übersetzen, und danach die abgeschlossenen Antworten. In Ihr SurveyMonkey-Konto schreibt AutoSEO nie.",
    },
    {
      q: "Was, wenn AutoSEO meine Frage nicht findet?",
      a: "AutoSEO sucht nach Überschriften wie „Wie sind Sie auf uns aufmerksam geworden?“ oder „How did you hear about us?“. Ist Ihre Frage anders formuliert, hinterlegen Sie beim Verbinden die Question-ID – sonst meldet die Verbindung, dass keine passende Frage gefunden wurde.",
    },
    {
      q: "Werden unvollständige Antworten importiert?",
      a: "Nein. AutoSEO importiert nur abgeschlossene Antworten. Wird eine Antwort erneut importiert, aktualisiert sie den bestehenden Eintrag, statt ein Duplikat anzulegen.",
    },
    {
      q: "Ist mein SurveyMonkey-Token sicher?",
      a: "Das Token wird mit AES-256-GCM verschlüsselt gespeichert und nur für Aufrufe der SurveyMonkey-API genutzt. Trennen Sie die Integration, werden keine neuen Daten mehr angenommen; bereits importierte Antworten bleiben erhalten.",
    },
    {
      q: "Ist die SurveyMonkey-Integration kostenlos?",
      a: "Ja. Die Attribution und alle ihre Integrationen gehören zur Open-Source-App: kostenlos beim Self-Hosting oder enthalten in einem AutoSEO-Cloud-Workspace für 50\u00a0$ pro Monat. Antworten werden mit festen Regeln eingeordnet, nicht mit KI-Guthaben.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, wie viele Kunden die KI-Suche bringt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
