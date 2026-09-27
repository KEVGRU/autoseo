import type { IntegrationPage } from "../../types";

export default {
  slug: "clickup",
  name: "ClickUp",
  nav: "ClickUp",
  summary: "AI-Visibility- und SEO-Aufgaben mit Priorität, Tags und Status-Sync an ClickUp übergeben.",
  meta: {
    title: "ClickUp-Integration für SEO- und GEO-Aufgaben",
    description:
      "Übergeben Sie priorisierte SEO- und AI-Visibility-Aufgaben an ClickUp-Listen – mit Markdown, Priorität, Tags und Fälligkeit, Status stündlich synchronisiert.",
  },
  hero: {
    subtitle:
      "Verbinden Sie ClickUp per persönlichem API-Token und übergeben Sie die belegbaren Aufgaben von AutoSEO an jede Liste – nach Impact priorisiert, nach Kategorie getaggt und in AutoSEO geschlossen, sobald Sie sie in ClickUp schließen.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der ClickUp-Integration",
    items: [
      "ClickUp-Aufgaben in jeder Liste, jedem Ordner und jedem Space, den Ihr Token erreicht",
      "Markdown-Beschreibungen mit Schritten, Akzeptanzkriterien, Belegen und Ziel-Prompts",
      "Priorität aus dem Impact-Score – Urgent, High, Normal oder Low",
      "Tags für autoseo und die Aufgabenkategorie, dazu Fälligkeitsdaten",
      "Zuständige werden per E-Mail, Benutzername oder User-ID den Workspace-Mitgliedern zugeordnet",
      "Stündlicher Status-Sync: Geschlossene Aufgaben werden erledigt, eigene Status zählen als in Arbeit",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit ClickUp und AutoSEO",
    items: [
      {
        icon: "trending-up",
        title: "GEO-Arbeit nach Impact sortieren",
        body: "Aufgaben kommen mit einer ClickUp-Priorität aus ihrem Impact-Score an, sodass die größten Hebel oben in Ihrer Liste stehen.",
      },
      {
        icon: "layers",
        title: "AutoSEO-Aufgaben in jeder Ansicht finden",
        body: "Jede Aufgabe trägt den Tag autoseo plus ihre Kategorie, sodass Ansichten und Filter in ClickUp sie über Listen hinweg erfassen.",
      },
      {
        icon: "workflow",
        title: "Nach Kategorie routen und zuweisen",
        body: "Übergeben Sie neue Aufgaben ausgewählter Kategorien automatisch und legen Sie unter Routing je Kategorie die zuständige Person in ClickUp fest.",
      },
      {
        icon: "refresh",
        title: "Den Kreis schließen",
        body: "Setzen Sie eine Aufgabe in ClickUp auf einen geschlossenen oder erledigten Status, und AutoSEO schließt sie innerhalb einer Stunde.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "ClickUp in drei Schritten verbinden –",
    muted: "mit einem persönlichen API-Token.",
    items: [
      {
        title: "Persönliches API-Token erstellen",
        body: "Klicken Sie in ClickUp auf Ihren Avatar → Settings → Apps und erstellen Sie ein persönliches API-Token. Es beginnt mit pk_.",
      },
      {
        title: "In AutoSEO verbinden",
        body: "Öffnen Sie in Ihrem Projekt Optimizations → Tasks, wählen Sie Connect PM Tool → ClickUp, fügen Sie das Token ein und wählen Sie die Liste für neue Aufgaben.",
      },
      {
        title: "Aufgaben übergeben",
        body: "Übergeben Sie eine Aufgabe aus ihrer Detailansicht, wählen Sie mehrere auf einmal aus oder aktivieren Sie unter Routing die automatische Übergabe je Kategorie.",
      },
    ],
  },
  faq: [
    {
      q: "Wie übergebe ich SEO-Aufgaben an ClickUp?",
      a: "Verbinden Sie ClickUp unter Optimizations → Tasks mit einem persönlichen API-Token und wählen Sie eine Liste. Übergeben Sie dann einzelne Aufgaben – oder lassen Sie Routing neue Aufgaben einer Kategorie automatisch übergeben. Jede Aufgabe wird zu einer ClickUp-Aufgabe mit Markdown-Beschreibung, Priorität, Tags und Rücklink zu AutoSEO.",
    },
    {
      q: "Wie legt AutoSEO die Priorität in ClickUp fest?",
      a: "Anhand des Impact-Scores der Aufgabe auf einer Skala von 1 bis 10: 9–10 wird Urgent, 7–8 High, 4–6 Normal und 1–3 Low.",
    },
    {
      q: "Wie geht der Status-Sync mit eigenen ClickUp-Status um?",
      a: "AutoSEO liest den Statustyp. Geschlossene und erledigte Status schließen die Aufgabe, eigene Status zählen als in Arbeit, offene Status lassen sie offen. Geprüft wird stündlich; Änderungen werden nicht nach ClickUp zurückgeschrieben.",
    },
    {
      q: "Kann AutoSEO ClickUp-Aufgaben zuweisen?",
      a: "Ja. AutoSEO ordnet die zuständige Person aus Routing – oder die E-Mail der in AutoSEO zugewiesenen Person – per E-Mail, Benutzername oder User-ID Ihren ClickUp-Workspace-Mitgliedern zu. Passt niemand, wird der Name stattdessen in der Beschreibung ergänzt.",
    },
    {
      q: "Wo wird mein ClickUp-Token gespeichert?",
      a: "Es wird mit AES-256-GCM verschlüsselt in der Datenbank von AutoSEO gespeichert und nie an den Browser zurückgegeben. Es dient ausschließlich für Aufrufe der ClickUp API.",
    },
  ],
  cta: {
    title: "Machen Sie aus AI-Visibility-Erkenntnissen ClickUp-Aufgaben",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
