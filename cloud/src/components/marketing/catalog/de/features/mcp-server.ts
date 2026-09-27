import type { FeaturePage } from "../../types";

export default {
  slug: "mcp-server",
  nav: "MCP-Server",
  summary: "Verbinden Sie Claude, ChatGPT, Cursor oder Codex über 100+ MCP-Tools mit Ihren Daten.",
  meta: {
    title: "SEO-MCP-Server mit über 100 Tools für KI-Agenten",
    description:
      "Verbinden Sie Claude, ChatGPT, Cursor oder Codex mit Ihren SEO-Daten: Der MCP-Server von AutoSEO bietet über 100 Tools, OAuth 2.1 und 17 Agent Skills.",
  },
  hero: {
    eyebrow: "MCP-Server",
    title: "Ein SEO-MCP-Server für jeden KI-Agenten.",
    muted: "Über 100 Tools hinter einer URL.",
    subtitle:
      "Verbinden Sie Claude, ChatGPT, Claude Code, Codex, Cursor oder VS Code mit AutoSEO und lassen Sie sie mit echten Daten zu AI Visibility, Keywords, Rankings, Audits und Analytics arbeiten. Melden Sie sich per OAuth 2.1 oder API-Key an und ergänzen Sie mit einem Plugin 17 fertige Agent Skills.",
  },
  visual: "terminal",
  stats: [
    { value: 100, suffix: "+", label: "MCP-Tools", note: "In 11 Gruppen" },
    { value: 17, label: "Agent Skills", note: "Workflows für SEO und AI Visibility" },
    { value: 4, label: "Berechtigungs-Scopes", note: "read, write, spend, export" },
    { value: 0, prefix: "$", label: "Self-Hosting", note: "MCP inklusive, MIT-Lizenz" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "Agenten sind nur so gut wie ihre Daten.",
    muted: "Geben Sie ihnen Ihre.",
    body: "KI-Assistenten können eine SEO-Strategie planen, Content entwerfen und Reports schreiben – ohne Live-Daten raten sie aber. Über das Model Context Protocol rufen sie die Tools von AutoSEO direkt auf und arbeiten mit Ihren getrackten Prompts, Rankings, Audits und Ihrem Traffic.",
    points: [
      {
        title: "Schluss mit Copy-and-paste",
        body: "Der Agent holt Kennzahlen, KI-Antworten und SERPs selbst, statt dass Sie CSV-Dateien in ein Chatfenster kopieren.",
      },
      {
        title: "Workflows statt Einzel-Prompts",
        body: "Skills führen den Agenten durch komplette Aufgaben – ein Audit, eine Lückenanalyse gegenüber Wettbewerbern, einen Monatsreport – und speichern das Ergebnis in AutoSEO.",
      },
      {
        title: "Sie behalten die Kontrolle",
        body: "OAuth-Freigabe, Scopes, Projektbeschränkungen und Rollenrechte legen fest, was ein Agent lesen, ändern oder ausgeben darf.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was enthalten ist",
    title: "Alles, was ein Agent braucht,",
    muted: "hinter einer MCP-URL.",
    items: [
      {
        icon: "layers",
        title: "Über 100 Tools in 11 Gruppen",
        body: "Projekte, AI Visibility, Aufgaben, Keywords und SERPs, Rank Tracking und Local SEO, Site Audits, Search Console und GA4, KI-Recherche, Content und Reports.",
      },
      {
        icon: "lock",
        title: "OAuth 2.1 oder API-Keys",
        body: "Melden Sie sich per OAuth 2.1 an und wählen Sie auf einer Freigabeseite Workspace, Projekte und Berechtigungen – oder senden Sie einen API-Key als Bearer-Token.",
      },
      {
        icon: "key",
        title: "Scopes und Kostenkontrolle",
        body: "Kostenpflichtige Tools brauchen den spend-Scope und die passende Rollenberechtigung, und die Ausgaben bleiben innerhalb Ihrer eingestellten Limits.",
      },
      {
        icon: "book",
        title: "17 Agent Skills",
        body: "Geführte Workflows wie seo-audit, keyword-research, competitor-gap, sentiment-review und ai-visibility-report, die ihre Ergebnisse als Reports speichern.",
      },
      {
        icon: "plug",
        title: "Plugins für Claude Code, Codex und Cursor",
        body: "Installieren Sie MCP-Verbindung und alle Skills in einem Schritt – über den Plugin-Marketplace Ihres AutoSEO oder ein vorkonfiguriertes Bundle.",
      },
      {
        icon: "message-square",
        title: "Funktioniert in Claude und ChatGPT",
        body: "Fügen Sie AutoSEO als benutzerdefinierten Connector in Claude oder im Entwicklermodus von ChatGPT hinzu oder richten Sie es in VS Code und der Codex CLI ein.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Verbinden Sie Ihren Agenten",
    muted: "in vier Schritten.",
    items: [
      {
        title: "MCP-URL kopieren",
        body: "Der Server läuft unter /api/mcp Ihrer AutoSEO-URL. Unter Settings → API & MCP finden Sie fertige Anleitungen für jeden Client.",
      },
      {
        title: "AutoSEO im Agenten hinzufügen",
        body: "Fügen Sie den Server in Claude, ChatGPT, Claude Code, Cursor, VS Code oder Codex hinzu und melden Sie sich per OAuth an oder hinterlegen Sie einen API-Key.",
      },
      {
        title: "Skills installieren",
        body: "Optional: Installieren Sie das AutoSEO-Plugin in Claude Code, Codex oder Cursor und erhalten Sie die MCP-Verbindung plus 17 Workflow-Skills.",
      },
      {
        title: "Agenten fragen",
        body: "Probieren Sie etwa „Welche technischen Probleme auf meiner Website sollte ich zuerst beheben?“ oder „Wie sichtbar ist meine Marke diesen Monat in ChatGPT?“",
      },
    ],
  },
  faq: [
    {
      q: "Was ist ein MCP-Server?",
      a: "Das Model Context Protocol (MCP) ist ein offener Standard, über den KI-Assistenten Tools aufrufen und Daten aus anderen Anwendungen lesen. Der MCP-Server von AutoSEO gibt Agenten wie Claude, ChatGPT, Codex und Cursor über Streamable HTTP Zugriff auf über 100 Tools für SEO und AI Visibility.",
    },
    {
      q: "Welche KI-Clients funktionieren mit dem MCP-Server von AutoSEO?",
      a: "AutoSEO bietet Anleitungen für Claude (Web, Desktop und Mobil), den Entwicklermodus von ChatGPT, Claude Code, Codex CLI, Cursor und VS Code. Jeder Client, der Streamable HTTP mit OAuth oder Bearer-Tokens unterstützt, kann sich verbinden. Claude und ChatGPT brauchen eine öffentlich per HTTPS erreichbare AutoSEO-URL, wie sie AutoSEO Cloud bietet.",
    },
    {
      q: "Wie verbinde ich Claude Code mit AutoSEO?",
      a: "Führen Sie claude mcp add --transport http autoseo mit der /api/mcp-URL Ihres AutoSEO aus, starten Sie dann /mcp in Claude Code und wählen Sie Authenticate. Alternativ übergeben Sie einen API-Key als Header oder installieren das AutoSEO-Plugin, das MCP-Server und alle 17 Skills auf einmal einrichtet.",
    },
    {
      q: "Wie funktioniert die Authentifizierung?",
      a: "AutoSEO unterstützt OAuth 2.1 mit PKCE und dynamischer Client-Registrierung. Auf der Freigabeseite wählen Sie Workspace, Projekte und Berechtigungen für den Agenten. Für Server und CI erstellen Sie unter Settings → API & MCP einen API-Key und senden ihn als Bearer-Token.",
    },
    {
      q: "Was sind die 17 Agent Skills?",
      a: "Skills sind Schritt-für-Schritt-Anleitungen, die einen Agenten mit den Tools von AutoSEO durch einen kompletten Workflow führen. Sie decken SEO-Aufgaben wie seo-audit, keyword-research und local-seo ab, AI-Visibility-Aufgaben wie competitor-gap, sentiment-review und source-outreach sowie Leitfäden wie seo-coach und seo-report.",
    },
    {
      q: "Kann ein Agent über den MCP-Server Geld ausgeben?",
      a: "Nur, wenn Sie es erlauben. Tools, die DataForSEO oder KI-Anbieter aufrufen, brauchen den spend-Scope der Verbindung und die passende Rollenberechtigung, und die Ausgaben bleiben innerhalb Ihrer Limits bzw. der inkludierten Nutzung Ihres Cloud-Workspace. Alle anderen Tools lesen Daten, die AutoSEO bereits hat.",
    },
    {
      q: "Funktioniert der MCP-Server auch beim Self-Hosting?",
      a: "Ja. Der MCP-Server ist Teil von AutoSEO selbst und liegt unter /api/mcp – beim Self-Hosting und in AutoSEO Cloud. Lokale Clients wie Claude Code funktionieren auch mit einer Installation auf localhost; Claude und ChatGPT brauchen eine öffentliche HTTPS-Adresse.",
    },
    {
      q: "Ist der MCP-Server von AutoSEO kostenlos?",
      a: "Ja. MCP-Server, Plugins und alle 17 Skills sind Teil der Open-Source-App AutoSEO und beim Self-Hosting kostenlos; DataForSEO- und KI-API-Nutzung rechnen dann diese Anbieter ab. Jeder AutoSEO-Cloud-Workspace enthält sie für 50\u00a0$ pro Monat, KI- und Datennutzung im Wert von 10\u00a0$ inklusive.",
    },
  ],
  related: ["rest-api", "ai-seo-agent", "keyword-research", "site-audit"],
  cta: {
    title: "Geben Sie Ihrem KI-Agenten echte SEO-Daten",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
