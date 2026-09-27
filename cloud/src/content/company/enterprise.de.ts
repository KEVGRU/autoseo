import type { SitePage } from "@/components/site/types";
import { site } from "@/lib/site";

const price = `${site.priceMonthlyUsd} $`;
const { projects, includedUsageUsd } = site.cloudPlan;
const includedUsage = `${includedUsageUsd} $`;
const contact = `mailto:${site.contactEmail}?subject=AutoSEO%20f%C3%BCr%20Unternehmen`;

const page: SitePage = {
  path: "/enterprise",
  crumb: "Enterprise",
  meta: {
    title: "AutoSEO für Unternehmen: Self-Hosting oder Cloud",
    description:
      "AutoSEO in Ihrer eigenen Infrastruktur oder in AutoSEO Cloud, gehostet in Deutschland: verschlüsselte Secrets, Rollen, Projektrechte, Audit-Log, DSGVO-Tools.",
  },
  hero: {
    eyebrow: "AutoSEO für Unternehmen",
    title: "AI Visibility für Unternehmen, die Kontrolle brauchen",
    subtitle:
      "Verfolgen Sie, wie ChatGPT, Perplexity, Gemini, Claude und die KI-Funktionen von Google jede Ihrer Marken in jedem Markt darstellen – auf Ihren eigenen Servern unter MIT-Lizenz oder in AutoSEO Cloud, gehostet in Deutschland.",
    ctas: [
      { label: "Sprechen Sie mit uns", href: contact },
      { label: "Zur Self-Hosting-Anleitung", href: "/self-hosting" },
    ],
  },
  sections: [
    {
      kind: "cards",
      id: "deployment",
      eyebrow: "Betrieb",
      title: "Zwei Betriebsmodelle. Eine Codebasis.",
      subtitle:
        "AutoSEO Cloud betreibt genau die Open-Source-App, die Sie auch selbst installieren können. Sie entscheiden danach, wer sie betreiben soll – nicht nach Funktionen.",
      columns: 2,
      cards: [
        {
          icon: "server",
          title: "Self-Hosting in Ihrer Infrastruktur",
          badge: "Kostenlos · MIT",
          body: "Betreiben Sie AutoSEO auf Ihrem eigenen Linux-Server – mit Docker Compose, dem Installer in einer Zeile oder Coolify. Ihre Datenbank, Ihre Backups, Ihre Netzwerkregeln: Die Daten bleiben dort, wo Sie AutoSEO betreiben, abgesehen von Anfragen an die KI- und SEO-Datenanbieter, die Sie selbst konfigurieren. Alle Funktionen, ohne Limits bei Nutzern, Projekten oder Prompts.",
        },
        {
          icon: "globe",
          title: "AutoSEO Cloud, gehostet in Deutschland",
          badge: `${price}/Monat`,
          body: `Ihr eigener Workspace in unserem vollständig verwalteten AutoSEO. KI-Anbieter, SEO-Daten und E-Mail-Versand werden von uns verwaltet (keine API-Keys nötig), Updates laufen automatisch, und Anbieter-Nutzung im Wert von ${includedUsage} pro Monat ist inklusive. Unbegrenzt viele Nutzer und bis zu ${projects} Projekte pro Workspace. [Pläne vergleichen](/de/pricing).`,
        },
      ],
    },
    {
      kind: "table",
      id: "security",
      eyebrow: "Sicherheit",
      title: "Sicherheitsfunktionen, die zum Produkt gehören",
      subtitle:
        "Kein Aufpreis, keine Zusatzstufe: Diese Kontrollen sind Teil des Open-Source-Codes. Ihr Security-Team kann also genau nachlesen, wie sie funktionieren.",
      head: ["Kontrolle", "Was sie leistet", "Self-Hosting", "AutoSEO Cloud"],
      rows: [
        ["Verschlüsselte Secrets", "API-Keys der Anbieter, SMTP-Zugangsdaten und OAuth-Client-Secrets werden mit AES-256-GCM verschlüsselt gespeichert.", "✓ Schlüssel liegt in Ihrem Daten-Volume", "✓ Von uns verwaltet"],
        ["Gehashte Tokens", "API-Keys, OAuth-Tokens und Tokens lokaler Agents werden nur als SHA-256-Hash gespeichert; den Klartext sehen Sie genau einmal.", "✓", "✓"],
        ["Anmeldung ohne Passwort", "Magic Links und Einmalcodes, nur auf Einladung. Sessions nutzen `__Host-`-Cookies (Secure, HttpOnly, SameSite=Lax) und lassen sich pro Gerät widerrufen.", "✓", "✓"],
        ["Freigabeliste für E-Mail-Domains", "Anmeldungen auf Ihre Firmendomains beschränken, Einladungspflicht erzwingen, Session-Dauer und Geräteanzahl begrenzen.", "✓ Admin → Authentication", "Instanzweite Richtlinie, von uns festgelegt"],
        ["Rollen & Rechte pro Projekt", "Rollen Owner, Admin, Member und Client. Member und Clients sehen nur die Projekte, die ihnen zugewiesen sind.", "✓ Plus eigene Rollen (Admin → Roles)", "✓ Vorhandene Rollen und Projektzugriff zuweisen"],
        ["Audit-Log", "Protokolliert Anmeldungen (auch abgelehnte), Einladungen, Rollenänderungen, API-Keys, Integrationen und Exporte; exportierbar.", "✓ Admin → Audit Log", "Von uns als Betreiber der Instanz geführt"],
        ["SSRF-Schutz", "Anfragen, die Integrationen auslösen (Webhooks, Crawling, Veröffentlichung), erreichen keine privaten oder LAN-Adressen – es sei denn, ein Admin gibt einen bestimmten Host frei.", "✓ Einzelne Intranet-Hosts freigeben", "✓ Keine internen Hosts"],
        ["DSGVO-Export & Löschung", "Jeder Nutzer kann seine personenbezogenen Daten herunterladen und sein Konto löschen; Admins können Nutzer löschen.", "✓", "✓"],
        ["API-Keys mit Scopes", "Keys sind auf die Scopes `read`, `write`, `spend` und `export` sowie auf alle oder ausgewählte Projekte beschränkt.", "✓", "✓"],
        ["OAuth 2.1 für MCP", "KI-Assistenten verbinden sich per OAuth 2.1 mit dem MCP-Server statt über geteilte statische Keys.", "✓", "✓"],
        ["Signierte Agent-Updates", "Lokale Agents öffnen keine eingehenden Ports, sprechen per ausgehendem HTTPS mit Ihrer Instanz und prüfen signierte Releases vor jedem Update.", "✓", "✓"],
      ],
      note: "Sie haben eine Schwachstelle gefunden? Melden Sie sie vertraulich über GitHub Security Advisories oder an security@codext.de, wie auf unserer [Sicherheitsseite](/de/security) beschrieben.",
    },
    {
      kind: "table",
      id: "control",
      eyebrow: "Kontrolle",
      title: "Wer was steuert",
      subtitle:
        "Beim Self-Hosting sind Sie Instanz-Admin und steuern alles. In AutoSEO Cloud gehört Ihnen Ihr Workspace, instanzweite Einstellungen betreiben wir.",
      head: ["Bereich", "Self-Hosting", "AutoSEO Cloud"],
      rows: [
        ["Mitglieder, Einladungen, Rollenzuweisung, Projektzugriff", "Sie", "Sie, als Workspace-Owner"],
        ["Projekte, Prompts, Wettbewerber, Engines, Reports", "Sie", "Sie"],
        ["DataForSEO-Konto", "Sie – für die Instanz (Admin → Data Providers) oder pro Workspace", "Von uns verwaltet; optional verbinden Sie ein eigenes Konto für Ihren Workspace"],
        ["Eigene Rollen", "Sie (Admin → Roles)", "Vom Instanzbetreiber definiert; Sie weisen die vorhandenen Rollen zu"],
        ["Audit-Log", "Sie (Admin → Audit Log)", "Von uns als Instanzbetreiber geführt"],
        ["Freigabeliste für E-Mail-Domains, Invite-only-Modus, Session-Richtlinien", "Sie (Admin → Authentication)", "Instanzweite Richtlinie, von uns festgelegt"],
        ["KI-Anbieter, E-Mail-Versand, Limits und Budgets", "Sie (Admin-Panel)", "Von uns verwaltet und betrieben"],
      ],
    },
    {
      kind: "cards",
      id: "structure",
      eyebrow: "Mehrere Marken, mehrere Märkte",
      title: "Bilden Sie Ihre Organisation ab: Workspaces, Projekte, Rollen",
      subtitle:
        "Tochtergesellschaften, Marken, Märkte und Kunden lassen sich mit zwei Bausteinen abbilden. Die Zugriffsrechte folgen derselben Struktur.",
      columns: 3,
      cards: [
        {
          icon: "layers",
          title: "Workspaces",
          body: "Ein Workspace ist eine Teamgrenze mit eigenen Mitgliedern, Rollen, Integrationen und API-Keys. Legen Sie einen pro Geschäftsbereich, Tochtergesellschaft oder Kundengruppe an.",
        },
        {
          icon: "globe",
          title: "Projekte pro Marke und Markt",
          body: "Ein Projekt ist eine Website oder Marke mit eigenen Prompts, Wettbewerbern, Engines und eigenem Markt (Land und Sprache). Dieselbe Marke in Deutschland und in den USA tracken Sie als zwei Projekte.",
        },
        {
          icon: "users",
          title: "Zugriff pro Projekt",
          body: "Owner und Admins sehen jedes Projekt ihres Workspace. Member und Clients mit Lesezugriff sehen nur die Projekte, die sie erhalten – ideal für regionale Teams und Agenturen.",
        },
        {
          icon: "list",
          title: "Portfolio-Übersicht",
          body: "Die wichtigsten AI-Visibility-Kennzahlen aller Ihrer Projekte in einer Tabelle – Sichtbarkeit samt Trend, Share of Voice, durchschnittliche Position, Sentiment, Zitate, offene Aufgaben mit hohem Impact und KI-Umsatz. So behalten zentrale Teams den Überblick über Marken und Märkte.",
        },
        {
          icon: "presentation",
          title: "White-Label-Reports",
          body: "Der Report Builder nutzt Brand Kits mit Ihrem Logo und Ihren Farben, exportiert PPTX und PDF und erstellt passwortgeschützte Freigabelinks. [Zum Report Builder](/de/report-builder).",
        },
        {
          icon: "code",
          title: "API, MCP und Exporte",
          body: "Eine REST-API mit OpenAPI-Spezifikation, ein MCP-Server für KI-Assistenten sowie Exporte als CSV oder nach Google Sheets versorgen Ihre eigenen Dashboards. [REST-API](/de/rest-api) · [MCP-Server](/de/mcp-server) · Anleitungen für [Claude](/de/blog/claude-connector) und [ChatGPT](/de/blog/chatgpt-plugin).",
        },
      ],
    },
    {
      kind: "checklist",
      id: "it",
      eyebrow: "Für IT- und Plattform-Teams",
      title: "Was der Eigenbetrieb von AutoSEO bedeutet",
      subtitle: "Self-Hosting ist bewusst unspektakulär: ein Container-Image, eine Datenbank und Einstellungen in einem Admin-Panel.",
      items: [
        "Ein Docker-Image (ghcr.io/codextde/autoseo) plus PostgreSQL 17 – keine weiteren Laufzeitdienste nötig",
        "Nur Domain und Datenbank stehen in Umgebungsvariablen; alles andere konfigurieren Sie im Admin-Panel",
        "Datenbankmigrationen laufen beim Start automatisch – ein Update ist ein erneutes Deployment",
        "Läuft hinter Ihrem Reverse Proxy (Traefik, nginx, Cloudflare Tunnel) oder mit dem mitgelieferten Caddy für automatisches HTTPS",
        "Tägliche und monatliche Ausgabenlimits für KI- und SEO-Datenanbieter",
        "KI über Ihre eigenen Claude-Code- oder Codex-Abos per lokalem Agent oder über Ihre eigenen API-Keys",
        "Quellcode, den Sie prüfen, forken und erweitern können – unter MIT-Lizenz",
      ],
      aside: [
        { type: "h3", text: "Dimensionierung" },
        { type: "p", text: "2 vCPU und 2–4 GB RAM reichen für kleine Teams. Skalieren Sie hoch, wenn Sie große Site-Audits oder umfangreiche Keyword- und Backlink-Jobs ausführen." },
        { type: "h3", text: "Zwei Volumes sichern" },
        { type: "p", text: "Das PostgreSQL-Volume und das Daten-Volume mit Uploads und dem Schlüssel für gespeicherte Secrets. Ohne diesen Schlüssel lassen sich gespeicherte Zugangsdaten der Anbieter nicht mehr entschlüsseln." },
        { type: "p", text: "[Zur Self-Hosting-Anleitung (englisch) →](/self-hosting)" },
      ],
    },
    {
      kind: "prose",
      id: "procurement",
      eyebrow: "Einkauf",
      title: "Die Fakten, nach denen Ihr Einkauf fragen wird",
      blocks: [
        { type: "p", text: "Wir sagen Ihnen lieber klar, wo AutoSEO steht, als Ihnen eine Wand voller Siegel zu zeigen:" },
        {
          type: "ul",
          items: [
            `**Anbieter:** ${site.legal.name}, ${site.legal.street}, ${site.legal.postalCode} ${site.legal.city}, Deutschland (${site.legal.registerCourt}, ${site.legal.registerNumber}).`,
            "**Lizenz:** MIT. Für den Betrieb in Ihrer eigenen Infrastruktur brauchen Sie keinen Vertrag mit uns.",
            "**Hosting von AutoSEO Cloud:** Server in Deutschland.",
            `**Auftragsverarbeitungsvertrag (Cloud):** auf Anfrage nach Art. 28 DSGVO – schreiben Sie an [${site.legal.email}](mailto:${site.legal.email}).`,
            "**Zertifizierungen:** Für AutoSEO Cloud beanspruchen wir keine Zertifizierung nach SOC 2 oder ISO 27001. Verlangen Ihre Richtlinien eine solche, betreiben Sie AutoSEO in Ihrer eigenen zertifizierten Umgebung.",
            "**Umgang mit Schwachstellen:** vertrauliche Meldung, Eingangsbestätigung innerhalb von zwei Werktagen, siehe [SECURITY.md](https://github.com/codextde/autoseo/blob/main/SECURITY.md).",
            `**Abrechnung (Cloud):** ${price} pro Workspace und Monat über Stripe, mit Rechnung für jede Zahlung; jederzeit kündbar.`,
          ],
        },
        {
          type: "callout",
          tone: "info",
          title: "Sie brauchen etwas, das hier nicht steht?",
          text: `Individuelle Konditionen, ein Fragebogen oder ein technischer Deep Dive: Schreiben Sie an [${site.contactEmail}](mailto:${site.contactEmail}), was Sie benötigen. Wir sagen Ihnen ehrlich, ob wir es liefern können.`,
        },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Fragen von Unternehmen",
      items: [
        {
          q: "Wo werden unsere Daten gespeichert?",
          a: "Beim Self-Hosting bleiben alle Daten in der PostgreSQL-Datenbank und im Daten-Volume auf Ihrem eigenen Server, wo auch immer Sie ihn betreiben. AutoSEO sendet nur die Anfragedaten, die eine Funktion benötigt – etwa getrackte Prompts, Marken- und Wettbewerbernamen, Domains und Keywords – an die KI- und SEO-Datenanbieter, die Sie konfigurieren. AutoSEO Cloud läuft auf Servern in Deutschland.",
        },
        {
          q: "Schließen Sie einen Auftragsverarbeitungsvertrag ab?",
          a: `Für AutoSEO Cloud ja: Wir verarbeiten personenbezogene Daten in Ihrem Workspace als Auftragsverarbeiter nach Art. 28 DSGVO und stellen auf Anfrage einen Auftragsverarbeitungsvertrag bereit – schreiben Sie an ${site.legal.email}. Beim Self-Hosting verarbeiten wir Ihre Daten überhaupt nicht, ein Vertrag mit uns ist also nicht nötig; Verträge mit den KI- und Datenanbietern, die Sie anbinden, brauchen Sie weiterhin.`,
        },
        {
          q: "Ist AutoSEO nach SOC 2 oder ISO 27001 zertifiziert?",
          a: "Für AutoSEO Cloud beanspruchen wir keine der beiden Zertifizierungen. Stattdessen bieten wir Transparenz: Der vollständige Quellcode ist öffentlich, das Sicherheitsmodell ist in SECURITY.md dokumentiert, und Sie können AutoSEO in Ihrer eigenen zertifizierten Infrastruktur betreiben, in der Ihre bestehenden Kontrollen greifen.",
        },
        {
          q: "Können wir Single Sign-on mit SAML oder OpenID Connect nutzen?",
          a: "Derzeit nicht. AutoSEO setzt auf passwortlose Anmeldung per Magic Link und Einmalcode, nur auf Einladung. Auf einer selbst gehosteten Instanz können Sie Anmeldungen auf Ihre Firmendomains beschränken, die Einladungspflicht erzwingen sowie Session-Dauer und Geräteanzahl begrenzen. Ist SAML oder OIDC für Sie zwingend, sagen Sie es uns – oder tragen Sie es auf GitHub bei.",
        },
        {
          q: "Wie verwalten wir viele Marken, Regionen oder Kunden?",
          a: `Legen Sie einen Workspace pro Geschäftsbereich oder Kundengruppe an und ein Projekt pro Marke und Markt – jeweils mit eigenen Prompts, Wettbewerbern, Engines, Land und Sprache. Member und Clients sehen nur die Projekte, die ihnen zugewiesen sind, und die Portfolio-Übersicht zeigt die wichtigsten AI-Visibility-Kennzahlen aller Ihrer Projekte in einer Tabelle (Sichtbarkeit samt Trend, Share of Voice, durchschnittliche Position, Sentiment, Zitate, offene Aufgaben mit hohem Impact und KI-Umsatz). AutoSEO Cloud enthält bis zu ${projects} Projekte pro Workspace; selbst gehostetes AutoSEO hat kein Projektlimit.`,
        },
        {
          q: "Wie behalten wir die Kosten für KI und Daten im Griff?",
          a: `Beim Self-Hosting rechnen Anbieter wie DataForSEO und Ihr KI-Anbieter direkt mit Ihnen ab, und AutoSEO setzt tägliche und monatliche Ausgabenlimits durch. Zusätzlich können Sie KI-Aufgaben über den lokalen Agent auf Claude-Code- oder Codex-Abos laufen lassen, die Sie ohnehin bezahlen. AutoSEO Cloud enthält pro Workspace und Monat Anbieter-Nutzung im Wert von ${includedUsage} im Rahmen einer Fair-Use-Regel; Workspace-Owner können zudem ein eigenes DataForSEO-Konto verbinden.`,
        },
        {
          q: "Bekommen wir einen individuellen Vertrag, eine Jahresrechnung oder eine Bestellung auf Rechnung?",
          a: `AutoSEO Cloud wird monatlich über Stripe abgerechnet, mit einer Rechnung für jede Zahlung. Braucht Ihr Unternehmen andere Konditionen, schreiben Sie Ihre Anforderungen an ${site.contactEmail} – wir sagen Ihnen, was möglich ist. Self-Hosting unter MIT-Lizenz erfordert überhaupt keinen Vertrag.`,
        },
        {
          q: "Kann unser Security-Team den Code vor dem Rollout prüfen?",
          a: "Ja. Der vollständige Quellcode der App, des lokalen Agents und der Deployment-Dateien liegt unter MIT-Lizenz auf GitHub. Melden Sie Schwachstellen bitte vertraulich über GitHub Security Advisories oder an security@codext.de statt in einem öffentlichen Issue.",
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Planen Sie Ihren Rollout mit uns",
      body: "Erzählen Sie uns von Ihren Marken, Märkten und Sicherheitsanforderungen – wir helfen Ihnen bei der Wahl zwischen Self-Hosting und AutoSEO Cloud.",
      primary: { label: "Sprechen Sie mit uns", href: contact },
      secondary: { label: "Pläne vergleichen", href: "/de/pricing" },
    },
  ],
};

export default page;
