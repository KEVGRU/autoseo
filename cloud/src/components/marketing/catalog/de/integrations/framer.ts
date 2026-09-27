import type { IntegrationPage } from "../../types";

export default {
  slug: "framer",
  name: "Framer",
  nav: "Framer",
  summary: "KI-optimierte Entwürfe in Framer-Collections veröffentlichen oder als Datei exportieren.",
  meta: {
    title: "Framer-CMS-Integration für KI-SEO-Content",
    description:
      "Veröffentlichen Sie KI-optimierte Artikel aus AutoSEO per Framer Server API in einer CMS-Collection – oder exportieren Sie Markdown, HTML und eine CMS-CSV.",
  },
  hero: {
    subtitle:
      "Verbinden Sie ein Framer-Projekt per API-Key und veröffentlichen Sie die Inhalte, die AutoSEO für die KI-Suche entwirft, in einer Ihrer CMS-Collections – als Entwurf oder live. Ohne Key exportieren Sie Markdown, HTML oder eine CSV.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Framer-Integration",
    items: [
      "Items in Ihren eigenen Framer-CMS-Collections über die Framer Server API anlegen oder aktualisieren",
      "Titel, Slug und Artikeltext landen in der Collection; SEO-Titel, SEO-Beschreibung, Zusammenfassung und Datum, sofern passende Felder existieren",
      "Als Entwurf speichern oder live veröffentlichen – dabei wird die gesamte Framer-Website veröffentlicht",
      "Erneutes Veröffentlichen aktualisiert dasselbe Item, statt ein neues anzulegen",
      "Markdown, eigenständiges HTML mit JSON-LD und eine Framer-taugliche CSV für jeden Entwurf",
      "Beta: funktioniert mit selbst verwalteten Collections, nicht mit Plugin-verwalteten",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Framer und AutoSEO",
    items: [
      {
        icon: "file-text",
        title: "Aus Sichtbarkeitslücken Framer-Artikel machen",
        body: "Entwerfen Sie Inhalte zu Prompts, bei denen Wettbewerber genannt werden und Sie nicht, und übernehmen Sie sie mit einem Klick in Ihre Framer-Blog-Collection.",
      },
      {
        icon: "pen",
        title: "Prüfen, bevor etwas live geht",
        body: "Speichern Sie Artikel als Entwurf, prüfen Sie sie im Framer-Editor und veröffentlichen Sie die Website, wenn alles passt.",
      },
      {
        icon: "refresh",
        title: "Artikel aktuell halten",
        body: "Überarbeiten Sie einen Entwurf nach dem nächsten Tracking-Lauf und veröffentlichen Sie erneut – AutoSEO aktualisiert das bestehende CMS-Item anhand von ID oder Slug.",
      },
      {
        icon: "download",
        title: "Import ohne API-Key",
        body: "Laden Sie eine CSV mit Titel, Slug, Inhalt, Meta-Feldern und FAQs herunter und importieren Sie sie in eine CMS-Collection – oder fügen Sie den HTML-Export in ein Formatted-Text-Feld ein.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Framer in vier Schritten verbinden –",
    muted: "mit einem Projekt-API-Key.",
    items: [
      {
        title: "API-Key in Framer erstellen",
        body: "Öffnen Sie das Projekt in Framer, gehen Sie zu Site settings → API Keys und erstellen Sie einen Key namens „AutoSEO“. Kopieren Sie außerdem die Projekt-URL aus der Adresszeile des Editors.",
      },
      {
        title: "In AutoSEO verbinden",
        body: "Öffnen Sie in Ihrem Projekt Optimizations → Content, wählen Sie Connect CMS → Framer und fügen Sie Projekt-URL und Key ein. Die URL der veröffentlichten Website ist optional.",
      },
      {
        title: "CMS-Collection auswählen",
        body: "Wählen Sie eine Ihrer eigenen Collections. Sie braucht ein Formatted-Text-Feld für den Artikeltext; Felder werden anhand von Name und Typ zugeordnet.",
      },
      {
        title: "Veröffentlichen oder exportieren",
        body: "Wählen Sie im Content-Editor Framer als Ziel und nutzen Sie Save as draft oder Publish live – oder laden Sie Markdown, HTML oder die CMS-CSV herunter.",
      },
    ],
  },
  faq: [
    {
      q: "Wie veröffentliche ich KI-optimierte Inhalte in Framer?",
      a: "Erstellen Sie in den Site settings Ihres Framer-Projekts einen API-Key, verbinden Sie ihn unter Optimizations → Content zusammen mit der Projekt-URL und wählen Sie eine CMS-Collection. AutoSEO schreibt dann jeden Content-Entwurf über die Framer Server API in diese Collection.",
    },
    {
      q: "Was macht Publish live in Framer?",
      a: "Es legt das CMS-Item an oder aktualisiert es und veröffentlicht anschließend die gesamte Framer-Website – inklusive aller anderen unveröffentlichten Änderungen im Projekt. Mit Save as draft fügen Sie nur das Item hinzu und veröffentlichen selbst in Framer.",
    },
    {
      q: "In welche Framer-CMS-Collections kann AutoSEO schreiben?",
      a: "In Collections, die Sie selbst verwalten. Plugin-verwaltete Collections lassen sich über die API nicht bearbeiten. Die Collection braucht ein Formatted-Text-Feld für den Artikeltext; verlangt sie weitere Pflichtfelder, bricht die Veröffentlichung ab und nennt diese.",
    },
    {
      q: "Kann ich AutoSEO mit Framer auch ohne API-Key nutzen?",
      a: "Ja. Jeder Entwurf lässt sich als Markdown mit Front Matter, als eigenständiges HTML mit Meta-Tags und JSON-LD oder als CSV exportieren, die Sie in eine Framer-CMS-Collection importieren.",
    },
    {
      q: "Warum ist die Framer-Integration in der Beta?",
      a: "Sie nutzt die Server API von Framer, und Collections sind von Projekt zu Projekt unterschiedlich aufgebaut. Die Felder werden anhand von Name und Typ zugeordnet – prüfen Sie daher das erste veröffentlichte Item, bevor Sie einen ganzen Content-Plan darüber abwickeln.",
    },
    {
      q: "Wo wird mein Framer-API-Key gespeichert?",
      a: "Er wird mit AES-256-GCM verschlüsselt in der Datenbank von AutoSEO gespeichert und nie an den Browser zurückgegeben. Er dient ausschließlich dazu, eine Sitzung mit Ihrem Framer-Projekt aufzubauen.",
    },
  ],
  cta: {
    title: "Liefern Sie Content, den KI-Engines zitieren",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
