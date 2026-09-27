import type { IntegrationCategoryPage } from "../../types";

export default {
  slug: "cms",
  nav: "CMS-Integrationen",
  summary: "KI-optimierte Entwürfe in WordPress, Webflow und Framer veröffentlichen.",
  meta: {
    title: "CMS-Integrationen für KI-optimierte Inhalte",
    description:
      "CMS-Integrationen für WordPress, Webflow und Framer: Veröffentlichen Sie KI-optimierte Entwürfe mit Titel, Slug und SEO-Feldern – als Entwurf oder direkt live.",
  },
  hero: {
    eyebrow: "CMS-Integrationen",
    title: "KI-optimierte Inhalte direkt im CMS veröffentlichen.",
    muted: "Ohne Copy-and-paste.",
    subtitle:
      "AutoSEO macht aus Lücken in Ihrer AI Visibility Briefings und Entwürfe. Verbinden Sie WordPress, Webflow oder Framer und veröffentlichen Sie sie mit Titel, Slug, Meta-Beschreibung und Text – als Entwurf für Ihre Redaktion oder direkt live. Für Framer gibt es zusätzlich einen CMS-fertigen Export, der auch ohne API-Key funktioniert.",
  },
  benefits: {
    eyebrow: "Warum Sie Ihr CMS anbinden",
    title: "Von der Sichtbarkeitslücke zur fertigen Seite",
    muted: "in einem Workflow.",
    items: [
      {
        icon: "file-text",
        title: "Geschrieben für KI-Antworten",
        body: "Briefings und Entwürfe setzen bei den Prompts, Quellen und Fragen an, bei denen Sie fehlen, und erhalten vor der Veröffentlichung einen Score für Answer Engines.",
      },
      {
        icon: "code",
        title: "Metadaten und Markup inklusive",
        body: "Meta-Titel, Beschreibung und FAQ-Abschnitt wandern mit dem Artikel. WordPress-Beiträge erhalten zusätzlich das JSON-LD des Entwurfs und die Felder von Yoast oder Rank Math.",
      },
      {
        icon: "pen",
        title: "Ihre Redaktion behält die Kontrolle",
        body: "Senden Sie einen Artikel als Entwurf und prüfen, bearbeiten und planen Sie ihn wie gewohnt im CMS – oder veröffentlichen Sie ihn direkt, sobald er fertig ist.",
      },
      {
        icon: "refresh",
        title: "Aktualisieren statt duplizieren",
        body: "Überarbeiten Sie einen Entwurf nach dem nächsten Tracking-Lauf und übertragen Sie die Änderung in denselben WordPress-Beitrag oder dasselbe Webflow- bzw. Framer-Collection-Item.",
      },
    ],
  },
  faq: [
    {
      q: "Mit welchen CMS arbeitet AutoSEO zusammen?",
      a: "WordPress, Webflow und Framer veröffentlichen direkt; alle drei Integrationen sind in der Beta. Bei Framer schreibt AutoSEO über die Framer Server API in eine CMS-Collection und bietet zusätzlich einen CMS-fertigen Export als CSV, Markdown oder HTML. Die Veröffentlichung in einen Shopify-Blog folgt demnächst.",
    },
    {
      q: "Wie veröffentliche ich Inhalte aus AutoSEO in WordPress?",
      a: "Erstellen Sie in WordPress ein Anwendungspasswort und verbinden Sie Ihre Website unter Optimizations → Content mit Website-URL, Benutzername und Passwort. AutoSEO veröffentlicht über die integrierte REST API, ein Plugin ist nicht nötig. Pro Artikel entscheiden Sie, ob er als Entwurf oder als veröffentlichter Beitrag angelegt wird.",
    },
    {
      q: "Wie funktioniert die Webflow-Integration?",
      a: "Erzeugen Sie in Webflow ein API-Token mit Lese- und Schreibrechten für das CMS sowie Leserechten für Sites und wählen Sie die Collection für Ihre Artikel. AutoSEO befüllt die gefundenen Felder für Name, Slug, Rich-Text-Inhalt, Zusammenfassung und SEO-Titel. Mit Schreibrechten für Sites werden Items direkt live veröffentlicht statt als Entwurf gespeichert.",
    },
    {
      q: "Kann ich AutoSEO mit Framer nutzen?",
      a: "Ja. Erstellen Sie in Ihrem Framer-Projekt unter Site settings → API Keys einen API-Key, verbinden Sie ihn zusammen mit der Projekt-URL und wählen Sie eine Ihrer eigenen CMS-Collections. AutoSEO schreibt jeden Entwurf über die Framer Server API hinein – als Entwurf oder live, wobei die gesamte Website veröffentlicht wird. Ohne Key exportieren Sie eine CSV mit Titel, Slug, Inhalt, Meta-Feldern und FAQ oder Markdown und HTML.",
    },
    {
      q: "Wird Shopify als CMS unterstützt?",
      a: "Die Veröffentlichung von Artikeln in einen Shopify-Blog folgt demnächst. Für die Attribution funktioniert Shopify schon heute: Ein Custom Pixel ordnet Bestellungen und Umsatz der KI-Suche zu.",
    },
    {
      q: "Wo werden meine CMS-Zugangsdaten gespeichert?",
      a: "Verschlüsselt mit AES-256-GCM in der Datenbank von AutoSEO – beim Self-Hosting auf Ihrem eigenen Server, bei AutoSEO Cloud in Deutschland. Tokens und Anwendungspasswörter werden nie an den Browser zurückgegeben und nur für Aufrufe Ihres CMS verwendet.",
    },
    {
      q: "Sind die CMS-Integrationen kostenlos?",
      a: "Ja. Sie sind Teil der Open-Source-App und kostenlos selbst hostbar; die KI-Nutzung für Entwürfe rechnet dann Ihr KI-Anbieter ab, oder sie läuft per lokalem Agenten über Ihr Claude-Code- oder Codex-Abo. AutoSEO Cloud kostet 50\u00a0$ pro Workspace und Monat, inklusive 10\u00a0$ für KI- und Datennutzung, und auch dort können Sie Ihren eigenen lokalen Agenten verbinden.",
    },
  ],
  cta: {
    title: "Aus Sichtbarkeitslücken werden veröffentlichte Seiten",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationCategoryPage;
