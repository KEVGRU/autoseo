import type { IntegrationPage } from "../../types";

export default {
  slug: "webflow",
  name: "Webflow",
  nav: "Webflow",
  summary: "KI-optimierte Entwürfe in Webflow-CMS-Collections veröffentlichen – als Entwurf oder live.",
  meta: {
    title: "Webflow-Integration für KI-SEO-Content",
    description:
      "Verbinden Sie Webflow mit AutoSEO und veröffentlichen Sie KI-optimierte Artikel in einer CMS-Collection – mit Name, Slug, Rich-Text und SEO-Titel.",
  },
  hero: {
    subtitle:
      "Verbinden Sie Ihre Webflow-Website per API-Token und veröffentlichen Sie die Inhalte, die AutoSEO für die KI-Suche entwirft, in einer CMS-Collection – als Entwurf zur Prüfung oder direkt live.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Webflow-Integration",
    items: [
      "Content-Entwürfe mit einem Klick in einer Webflow-CMS-Collection veröffentlichen",
      "Name, Slug und HTML-Inhalt landen im Rich-Text-Feld der Collection",
      "Zusammenfassung und SEO-Titel werden befüllt, wenn die Collection passende Felder hat",
      "FAQs aus dem Entwurf werden an den Artikeltext angehängt",
      "Als Entwurf speichern oder direkt live auf Ihrer Website veröffentlichen",
      "Erneutes Veröffentlichen aktualisiert dasselbe Collection-Item",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Webflow und AutoSEO",
    items: [
      {
        icon: "file-text",
        title: "Aus Sichtbarkeitslücken Artikel machen",
        body: "Entwerfen Sie Inhalte zu Prompts, bei denen Wettbewerber genannt werden und Sie nicht, und veröffentlichen Sie sie in Ihrer Webflow-Blog-Collection.",
      },
      {
        icon: "pen",
        title: "Die Redaktion behält die Kontrolle",
        body: "Speichern Sie Artikel als Entwurf und prüfen, bearbeiten und veröffentlichen Sie sie wie gewohnt in Webflow.",
      },
      {
        icon: "refresh",
        title: "Artikel nach dem nächsten Lauf aktualisieren",
        body: "Überarbeiten Sie einen Entwurf in AutoSEO, sobald neue Tracking-Daten vorliegen, und veröffentlichen Sie erneut – das bestehende Item wird aktualisiert, nicht dupliziert.",
      },
      {
        icon: "layers",
        title: "In der richtigen Collection veröffentlichen",
        body: "AutoSEO listet die Collections, auf die Ihr Token zugreifen kann – für Blog, Ratgeber oder jede andere Collection mit Rich-Text-Feld.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Webflow in vier Schritten verbinden –",
    muted: "mit einem API-Token der Website.",
    items: [
      {
        title: "API-Token erstellen",
        body: "Öffnen Sie in Webflow Site settings → Apps & integrations → API access und erstellen Sie ein Token mit Lese- und Schreibzugriff auf CMS sowie Lesezugriff auf Sites. Für Live-Veröffentlichungen ergänzen Sie Schreibzugriff auf Sites.",
      },
      {
        title: "In AutoSEO verbinden",
        body: "Öffnen Sie in Ihrem Projekt Optimizations → Content, wählen Sie Connect CMS → Webflow und fügen Sie das Token ein. AutoSEO prüft, auf welche Websites es zugreifen kann.",
      },
      {
        title: "Collection auswählen",
        body: "Wählen Sie die CMS-Collection für neue Artikel. Sie braucht ein Rich-Text-Feld für den Artikeltext.",
      },
      {
        title: "Entwurf veröffentlichen",
        body: "Öffnen Sie einen Content-Entwurf und veröffentlichen Sie ihn in Webflow – mit Save as draft zur Prüfung oder mit Publish live direkt auf Ihrer Website.",
      },
    ],
  },
  faq: [
    {
      q: "Wie veröffentliche ich KI-optimierte Inhalte in Webflow?",
      a: "Verbinden Sie Webflow unter Optimizations → Content mit einem API-Token, wählen Sie eine CMS-Collection und veröffentlichen Sie einen beliebigen Content-Entwurf. AutoSEO legt ein Collection-Item mit Name, Slug und Rich-Text an und befüllt Zusammenfassung und SEO-Titel, sofern die Collection diese Felder hat.",
    },
    {
      q: "Welche Berechtigungen braucht das Webflow-API-Token?",
      a: "Lese- und Schreibzugriff auf CMS sowie Lesezugriff auf Sites. Soll AutoSEO Items live veröffentlichen, ergänzen Sie Schreibzugriff auf Sites; der Verbindungstest meldet, wenn das Token auf keine Website zugreifen kann.",
    },
    {
      q: "Kann ich Artikel prüfen, bevor sie in Webflow live gehen?",
      a: "Ja. Mit Save as draft wird der Artikel als Entwurf in Ihrer Collection angelegt. Prüfen und veröffentlichen Sie ihn in Webflow – oder später direkt aus AutoSEO.",
    },
    {
      q: "Was passiert, wenn meine Collection weitere Pflichtfelder hat?",
      a: "AutoSEO befüllt Name, Slug, Artikeltext, Zusammenfassung und SEO-Titel. Verlangt die Collection weitere Pflichtfelder, bricht die Veröffentlichung ab und nennt diese Felder, damit Sie sie in Webflow optional machen können.",
    },
    {
      q: "Fügt AutoSEO JSON-LD in Webflow-Items ein?",
      a: "Nicht automatisch. Der Content-Editor erzeugt für jeden Entwurf JSON-LD, das Sie im Schema-Tab als Script-Tag kopieren und in Webflow einfügen können.",
    },
    {
      q: "Wo wird mein Webflow-API-Token gespeichert?",
      a: "Es wird mit AES-256-GCM verschlüsselt in der Datenbank von AutoSEO gespeichert und nie an den Browser zurückgegeben. Es dient ausschließlich für Aufrufe der Webflow API.",
    },
  ],
  cta: {
    title: "Liefern Sie Content, den KI-Engines zitieren",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
