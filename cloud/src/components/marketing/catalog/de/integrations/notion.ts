import type { IntegrationPage } from "../../types";

export default {
  slug: "notion",
  name: "Notion",
  nav: "Notion",
  summary: "AI-Visibility- und SEO-Aufgaben mit Checklisten und Status-Sync an Notion übergeben.",
  meta: {
    title: "Notion-Integration für SEO- und GEO-Aufgaben",
    description:
      "Übergeben Sie SEO- und AI-Visibility-Aufgaben als Seiten an eine Notion-Datenbank – mit Schritten, Checklisten und Belegen, Status stündlich synchronisiert.",
  },
  hero: {
    subtitle:
      "Verbinden Sie Notion über eine interne Integration und machen Sie aus den belegbaren Aufgaben von AutoSEO Seiten in Ihrer Aufgaben-Datenbank – als native Notion-Blöcke, mit Status-Sync aus Ihren eigenen Eigenschaften.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Notion-Integration",
    items: [
      "Eine Seite pro Aufgabe in der Notion-Datenbank Ihrer Wahl",
      "Native Blöcke: Überschriften, nummerierte Schritte, To-do-Checkboxen für Akzeptanzkriterien und Links",
      "Eine People-Eigenschaft, per E-Mail befüllt, sofern Ihre Datenbank eine hat",
      "Status-Sync aus einer Status-Eigenschaft, einer Status-Auswahl oder einer Erledigt-Checkbox",
      "Archivierte oder gelöschte Seiten schließen die Aufgabe in AutoSEO",
      "Einzelne Aufgaben, eine Auswahl oder neue Aufgaben je Kategorie automatisch übergeben",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Notion und AutoSEO",
    items: [
      {
        icon: "database",
        title: "Ihre eigene Aufgaben-Datenbank nutzen",
        body: "AutoSEO schreibt in die Datenbank, die Ihr Team bereits führt – gesetzt werden nur Titel und People-Eigenschaft, alles andere bleibt Ihnen überlassen.",
      },
      {
        icon: "list-checks",
        title: "Akzeptanzkriterien abhaken",
        body: "Akzeptanzkriterien kommen als To-do-Checkboxen an, sodass die zuständige Person sie direkt in Notion abhaken kann.",
      },
      {
        icon: "refresh",
        title: "Aufgaben aus Notion schließen",
        body: "Setzen Sie den Status auf „Erledigt“ oder haken Sie eine Erledigt-Checkbox ab, und AutoSEO schließt die Aufgabe innerhalb einer Stunde.",
      },
      {
        icon: "workflow",
        title: "Nach Kategorie routen",
        body: "Übergeben Sie neue Aufgaben ausgewählter Kategorien automatisch an Notion und behalten Sie den Rest in AutoSEO oder einem anderen Tool.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Notion in vier Schritten verbinden –",
    muted: "mit einer internen Integration.",
    items: [
      {
        title: "Interne Integration anlegen",
        body: "Öffnen Sie notion.so/profile/integrations → New integration, wählen Sie „intern“ und kopieren Sie das Secret.",
      },
      {
        title: "Aufgaben-Datenbank freigeben",
        body: "Öffnen Sie die Datenbank in Notion → ••• → Verbindungen und fügen Sie die Integration hinzu.",
      },
      {
        title: "In AutoSEO verbinden",
        body: "Öffnen Sie in Ihrem Projekt Optimizations → Tasks, wählen Sie Connect PM Tool → Notion, fügen Sie das Secret ein und wählen Sie die Datenbank.",
      },
      {
        title: "Aufgaben übergeben",
        body: "Übergeben Sie eine Aufgabe aus ihrer Detailansicht, wählen Sie mehrere auf einmal aus oder aktivieren Sie unter Routing die automatische Übergabe je Kategorie.",
      },
    ],
  },
  faq: [
    {
      q: "Wie übergebe ich SEO-Aufgaben an Notion?",
      a: "Legen Sie eine interne Notion-Integration an, fügen Sie sie Ihrer Aufgaben-Datenbank unter Verbindungen hinzu und verbinden Sie sie unter Optimizations → Tasks. Übergeben Sie dann einzelne Aufgaben – oder lassen Sie Routing neue Aufgaben einer Kategorie automatisch übergeben. Jede Aufgabe wird zu einer Seite mit Schritten, Checklisten, Belegen und Rücklink.",
    },
    {
      q: "Warum sieht AutoSEO meine Notion-Datenbank nicht?",
      a: "Notion zeigt nur Datenbanken, die für die Integration freigegeben sind. Öffnen Sie die Datenbank → ••• → Verbindungen, fügen Sie die Integration hinzu und laden Sie die Liste in AutoSEO erneut.",
    },
    {
      q: "Welche Notion-Eigenschaften nutzt AutoSEO?",
      a: "Die Titel-Eigenschaft für den Aufgabennamen und, falls vorhanden, eine People-Eigenschaft für die zuständige Person. Für den Status-Sync liest AutoSEO eine Status-Eigenschaft, eine Auswahl namens Status oder State oder eine Checkbox namens Done. Alle anderen Eigenschaften bleiben unberührt.",
    },
    {
      q: "Wie weist AutoSEO in Notion Personen zu?",
      a: "Es ordnet die E-Mail der zuständigen Person einem Mitglied Ihres Notion-Workspace zu – dafür braucht die Integration die Berechtigung, Benutzerinformationen inklusive E-Mail-Adressen zu lesen. Passt niemand, wird der Name stattdessen oben auf der Seite ergänzt.",
    },
    {
      q: "Funktioniert der Status-Sync in beide Richtungen?",
      a: "Der Status fließt von Notion zu AutoSEO. Jede Stunde prüft AutoSEO die verknüpften Seiten und setzt Aufgaben anhand Ihrer Status-Eigenschaft auf In Arbeit oder Erledigt. Änderungen in AutoSEO werden nicht nach Notion zurückgeschrieben.",
    },
  ],
  cta: {
    title: "Machen Sie aus AI-Visibility-Erkenntnissen Notion-Seiten",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
