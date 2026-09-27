import type { IntegrationPage } from "../../types";

export default {
  slug: "linear",
  name: "Linear",
  nav: "Linear",
  summary: "AI-Visibility- und SEO-Aufgaben an Linear übergeben und bei erledigten Issues schließen.",
  meta: {
    title: "Linear-Integration für SEO- und GEO-Aufgaben",
    description:
      "Übergeben Sie priorisierte SEO- und AI-Visibility-Aufgaben als Issues an Linear – mit Priorität, Fälligkeit und vollem Kontext, Status stündlich synchronisiert.",
  },
  hero: {
    subtitle:
      "Verbinden Sie Linear per persönlichem API-Key und machen Sie aus den belegbaren Aufgaben von AutoSEO Issues für Ihr Team – nach Impact priorisiert, mit Schritten und Rücklink.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Linear-Integration",
    items: [
      "Linear-Issues im Team Ihrer Wahl",
      "Priorität aus dem Impact-Score der Aufgabe – Urgent, High, Medium oder Low",
      "Markdown-Beschreibungen mit Schritten, Akzeptanzkriterien, Belegen und Ziel-Prompts",
      "Das Fälligkeitsdatum wird übernommen, wenn die Aufgabe eines hat",
      "Stündlicher Status-Sync: Abgeschlossene oder abgebrochene Issues schließen die Aufgabe in AutoSEO",
      "Einzelne Aufgaben, eine Auswahl oder neue Aufgaben je Kategorie automatisch übergeben",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Linear und AutoSEO",
    items: [
      {
        icon: "zap",
        title: "GEO-Fixes mit der Produktarbeit ausliefern",
        body: "Bringen Sie AI-Visibility-Arbeit – Content-Lücken, fehlende Zitate, technische Fixes – in dasselbe Backlog wie alles andere, was Ihr Team baut.",
      },
      {
        icon: "trending-up",
        title: "Mit den größten Hebeln beginnen",
        body: "Issues kommen mit einer Priorität aus dem Impact-Score der Aufgabe an, sodass die wertvollste Arbeit oben steht.",
      },
      {
        icon: "workflow",
        title: "Aufgaben nach Kategorie routen",
        body: "Übergeben Sie neue Aufgaben ausgewählter Kategorien automatisch an Linear und behalten Sie den Rest in AutoSEO oder einem anderen Tool.",
      },
      {
        icon: "refresh",
        title: "Den Kreis schließen",
        body: "Wird ein Issue in Linear abgeschlossen oder abgebrochen, markiert AutoSEO die Aufgabe innerhalb einer Stunde als erledigt.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Linear in vier Schritten verbinden –",
    muted: "mit einem persönlichen API-Key.",
    items: [
      {
        title: "Persönlichen API-Key erstellen",
        body: "Öffnen Sie in Linear Settings → Account → Security & access → Personal API keys und erstellen Sie einen Key mit dem Namen „AutoSEO“ und Lese- und Schreibzugriff.",
      },
      {
        title: "In AutoSEO verbinden",
        body: "Öffnen Sie in Ihrem Projekt Optimizations → Tasks, wählen Sie Connect PM Tool → Linear und fügen Sie den Key ein.",
      },
      {
        title: "Team auswählen",
        body: "Wählen Sie das Linear-Team, in dem neue Issues angelegt werden.",
      },
      {
        title: "Aufgaben übergeben",
        body: "Übergeben Sie eine Aufgabe aus ihrer Detailansicht, wählen Sie mehrere auf einmal aus oder aktivieren Sie unter Routing die automatische Übergabe je Kategorie.",
      },
    ],
  },
  faq: [
    {
      q: "Wie übergebe ich SEO-Aufgaben an Linear?",
      a: "Verbinden Sie Linear unter Optimizations → Tasks mit einem persönlichen API-Key und wählen Sie ein Team. Übergeben Sie dann einzelne Aufgaben – oder lassen Sie Routing neue Aufgaben einer Kategorie automatisch übergeben. Jede Aufgabe wird zu einem Linear-Issue mit Priorität, Schritten, Belegen und Rücklink zu AutoSEO.",
    },
    {
      q: "Wie legt AutoSEO die Priorität in Linear fest?",
      a: "Anhand des Impact-Scores der Aufgabe auf einer Skala von 1 bis 10: 9–10 wird Urgent, 7–8 High, 4–6 Medium und 1–3 Low.",
    },
    {
      q: "Funktioniert der Status-Sync in beide Richtungen?",
      a: "Der Status fließt von Linear zu AutoSEO. Jede Stunde prüft AutoSEO die verknüpften Issues: Begonnene Issues setzen die Aufgabe auf In Arbeit, abgeschlossene oder abgebrochene markieren sie als erledigt. Änderungen in AutoSEO werden nicht nach Linear zurückgeschrieben.",
    },
    {
      q: "Entstehen doppelte Issues, wenn ich eine Aufgabe zweimal übergebe?",
      a: "Nein. Eine Aufgabe, die bereits mit einem Linear-Issue verknüpft ist, wird übersprungen, und Wiederholungen einer fehlgeschlagenen Übergabe erzeugen keine Duplikate.",
    },
    {
      q: "Wo wird mein Linear-API-Key gespeichert?",
      a: "Er wird mit AES-256-GCM verschlüsselt in der Datenbank von AutoSEO gespeichert und nie an den Browser zurückgegeben. Er dient ausschließlich für Aufrufe der Linear API.",
    },
  ],
  cta: {
    title: "Machen Sie aus AI-Visibility-Erkenntnissen Linear-Issues",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
