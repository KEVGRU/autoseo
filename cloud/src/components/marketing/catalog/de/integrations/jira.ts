import type { IntegrationPage } from "../../types";

export default {
  slug: "jira",
  name: "Jira",
  nav: "Jira",
  summary: "AI-Visibility- und SEO-Aufgaben an Jira Cloud übergeben und den Status zurückholen.",
  meta: {
    title: "Jira-Integration für SEO- und GEO-Aufgaben",
    description:
      "Übergeben Sie priorisierte SEO- und AI-Visibility-Aufgaben als Issues an Jira Cloud – mit Schritten, Belegen und Fälligkeit, Status stündlich synchronisiert.",
  },
  hero: {
    subtitle:
      "Verbinden Sie Jira Cloud per API-Token und übergeben Sie die belegbaren Aufgaben von AutoSEO als Issues an Ihr Projekt – mit Schritten, Akzeptanzkriterien und Rücklink. Ist das Issue erledigt, ist es die Aufgabe auch.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Jira-Integration",
    items: [
      "Jira-Issues vom Typ Task bzw. Aufgabe im Projekt Ihrer Wahl",
      "Formatierte Beschreibungen mit Schritten, Akzeptanzkriterien, Belegen und Ziel-URLs",
      "Ein Label für die Aufgabenkategorie, Fälligkeitsdatum inklusive",
      "Einzelne Aufgaben, eine Auswahl oder neue Aufgaben je Kategorie automatisch übergeben",
      "Stündlicher Status-Sync: Erledigt in Jira schließt die Aufgabe in AutoSEO",
      "Bereits verknüpfte Aufgaben werden nie doppelt angelegt",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Jira und AutoSEO",
    items: [
      {
        icon: "list-checks",
        title: "SEO-Fixes an die Entwicklung übergeben",
        body: "Technische Aufgaben aus Audits und Crawlability-Checks landen mitsamt Belegen im Backlog der Entwicklung.",
      },
      {
        icon: "workflow",
        title: "Aufgaben nach Kategorie routen",
        body: "Übergeben Sie neue technische Aufgaben automatisch an Jira, während Content- oder Offsite-Aufgaben in AutoSEO bleiben – Routing entscheidet je Kategorie.",
      },
      {
        icon: "refresh",
        title: "Beide Tools synchron halten",
        body: "Wechselt ein Issue in Jira auf In Arbeit oder Erledigt, aktualisiert AutoSEO die Aufgabe innerhalb einer Stunde.",
      },
      {
        icon: "link",
        title: "Den Kontext behalten",
        body: "Jedes Issue zeigt Impact, Aufwand und Priorität der Aufgabe und verlinkt zurück zur Aufgabe in AutoSEO.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Jira in vier Schritten verbinden –",
    muted: "mit einem Atlassian-API-Token.",
    items: [
      {
        title: "API-Token erstellen",
        body: "Öffnen Sie id.atlassian.com → Sicherheit → API-Token erstellen und verwalten und erstellen Sie ein Token für AutoSEO.",
      },
      {
        title: "In AutoSEO verbinden",
        body: "Öffnen Sie in Ihrem Projekt Optimizations → Tasks, wählen Sie Connect PM Tool → Jira Cloud und geben Sie Site-URL, Konto-E-Mail und Token ein.",
      },
      {
        title: "Projekt auswählen",
        body: "Wählen Sie das Jira-Projekt, in dem neue Issues angelegt werden.",
      },
      {
        title: "Aufgaben übergeben",
        body: "Übergeben Sie eine Aufgabe aus ihrer Detailansicht, wählen Sie mehrere auf einmal aus oder aktivieren Sie unter Routing die automatische Übergabe je Kategorie.",
      },
    ],
  },
  faq: [
    {
      q: "Wie übergebe ich SEO-Aufgaben an Jira?",
      a: "Verbinden Sie Jira Cloud unter Optimizations → Tasks mit Site-URL, Konto-E-Mail und einem Atlassian-API-Token und wählen Sie ein Projekt. Übergeben Sie dann einzelne Aufgaben – oder lassen Sie Routing neue Aufgaben einer Kategorie automatisch übergeben. Jede Aufgabe wird zu einem Jira-Issue mit Schritten, Belegen und Rücklink.",
    },
    {
      q: "Funktioniert AutoSEO mit Jira Server oder Data Center?",
      a: "Nein. Die Integration ist für Jira Cloud (ihrefirma.atlassian.net) gebaut und meldet sich mit Atlassian-Konto-E-Mail und API-Token an. Für andere Umgebungen kann die signierte Webhook-Integration Aufgaben über Zapier, n8n oder Make weiterleiten.",
    },
    {
      q: "Welchen Issue-Typ legt AutoSEO an?",
      a: "Den Issue-Typ Task. Hat Ihr Projekt keinen Typ namens Task, wählt AutoSEO die nächstliegende Entsprechung wie Aufgabe oder den ersten Standard-Issue-Typ des Projekts.",
    },
    {
      q: "Funktioniert der Status-Sync in beide Richtungen?",
      a: "Der Status fließt von Jira zu AutoSEO. Jede Stunde prüft AutoSEO die verknüpften Issues und setzt Aufgaben anhand der Statuskategorie auf In Arbeit oder Erledigt. Änderungen in AutoSEO werden nicht nach Jira zurückgeschrieben.",
    },
    {
      q: "Entstehen doppelte Issues, wenn ich eine Aufgabe zweimal übergebe?",
      a: "Nein. Eine Aufgabe, die bereits mit einem Jira-Issue verknüpft ist, wird übersprungen, und Wiederholungen einer fehlgeschlagenen Übergabe erzeugen keine Duplikate.",
    },
    {
      q: "Wo wird mein Jira-API-Token gespeichert?",
      a: "Es wird mit AES-256-GCM verschlüsselt in der Datenbank von AutoSEO gespeichert und nie an den Browser zurückgegeben. Es dient ausschließlich für Aufrufe der REST API Ihrer Jira-Site.",
    },
  ],
  cta: {
    title: "Machen Sie aus AI-Visibility-Erkenntnissen Jira-Issues",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
