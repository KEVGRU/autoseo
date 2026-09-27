import type { SupportPage } from "../types";

export default {
  meta: {
    title: "Support & Hilfe für Cloud und Self-Hosting",
    description:
      "Support für AutoSEO: E-Mail-Support inklusive bei AutoSEO Cloud, Community-Support auf GitHub für Self-Hosting, dazu Anleitungen, das README und die llms.txt.",
  },
  hero: {
    eyebrow: "Support",
    title: "Support für AutoSEO,",
    muted: "ganz gleich, wo es läuft.",
    subtitle:
      "Bei AutoSEO Cloud ist E-Mail-Support vom Team hinter AutoSEO inklusive. Beim Self-Hosting hilft die Community auf GitHub, und die Anleitungen unten beantworten die meisten Fragen zur Einrichtung.",
  },
  channels: {
    eyebrow: "Kontakt",
    title: "Der richtige Kanal",
    muted: "für Ihr Anliegen.",
    items: [
      {
        icon: "headset",
        title: "E-Mail-Support",
        body: "Inklusive bei AutoSEO Cloud: Fragen zu Ihrem Workspace, zur Anmeldung, Abrechnung oder Einrichtung. Auch für allgemeine Fragen, bevor Sie starten.",
        href: "mailto:info@codext.de",
        action: "E-Mail an info@codext.de",
      },
      {
        icon: "message-square",
        title: "GitHub Discussions",
        body: "Community-Support für selbst gehostetes AutoSEO. Stellen Sie Fragen zu Installation, Konfiguration, KI-Anbietern oder lokalen Agenten und teilen Sie Ihre Ideen.",
        href: "https://github.com/codextde/autoseo/discussions",
        action: "Discussions öffnen",
      },
      {
        icon: "flag",
        title: "Fehler und Feature-Wünsche",
        body: "Sie haben einen reproduzierbaren Fehler gefunden oder vermissen eine Funktion? Eröffnen Sie ein Issue auf GitHub. Die Vorlagen fragen alles ab, was wir für die Hilfe brauchen.",
        href: "https://github.com/codextde/autoseo/issues",
        action: "Issue eröffnen",
      },
      {
        icon: "shield-check",
        title: "Sicherheitsmeldungen",
        body: "Bitte melden Sie Schwachstellen nicht in öffentlichen Issues, sondern vertraulich über GitHub Security Advisories oder an security@codext.de. Details finden Sie auf unserer Sicherheitsseite.",
        href: "/de/security",
        action: "Schwachstelle melden",
      },
    ],
  },
  resources: {
    eyebrow: "Selbst nachlesen",
    title: "Antworten finden",
    muted: "in der Dokumentation.",
    items: [
      {
        title: "Self-Hosting-Anleitung",
        body: "Voraussetzungen, Installation per Einzeiler, Docker Compose, Coolify, lokale Agenten, Updates und Backups – auf Englisch.",
        href: "/self-hosting",
      },
      {
        title: "README auf GitHub",
        body: "Feature-Tour, Admin-Konfiguration, lokale Agenten, REST API, MCP-Server und Agent-Plugins – auf Englisch.",
        href: "https://github.com/codextde/autoseo#readme",
      },
      {
        title: "Preise und FAQ zur Abrechnung",
        body: "Tarife, MwSt., Rechnungen, Kündigung, Datenexport und was nach der Kündigung mit Ihren Daten passiert.",
        href: "/de/pricing",
      },
      {
        title: "llms.txt",
        body: "Eine Produktzusammenfassung im Klartext für KI-Assistenten, auf Englisch. Fügen Sie sie in ChatGPT oder Claude ein und stellen Sie Ihre Fragen.",
        href: "/llms.txt",
      },
      {
        title: "Ihr Cloud-Dashboard",
        body: "Für Cloud-Kunden: AutoSEO per Klick öffnen, Abo-Status prüfen und die Abrechnung verwalten.",
        href: "/dashboard",
      },
      {
        title: "Contributing-Guide",
        body: "Entwicklungsumgebung, Konventionen und Good First Issues, falls Sie selbst etwas beheben möchten – auf Englisch.",
        href: "https://github.com/codextde/autoseo/blob/main/CONTRIBUTING.md",
      },
    ],
  },
  faq: [
    {
      q: "Wie erreiche ich den AutoSEO-Support?",
      a: "Kunden von AutoSEO Cloud schreiben an info@codext.de. Beim Self-Hosting gibt es Community-Support in den GitHub Discussions, reproduzierbare Fehler gehören in die GitHub Issues. Sicherheitslücken melden Sie vertraulich über GitHub Security Advisories oder an security@codext.de.",
    },
    {
      q: "Ist Support bei AutoSEO Cloud inklusive?",
      a: "Ja. Jedes Abo von AutoSEO Cloud enthält E-Mail-Support zu Ihrem Workspace, zur Anmeldung, Abrechnung und Einrichtung – ohne Aufpreis. Updates und Sicherheits-Fixes spielen wir für Sie ein, Sie müssen also nichts selbst warten.",
    },
    {
      q: "Bekomme ich Support, wenn ich AutoSEO selbst hoste?",
      a: "Ja, Community-Support über GitHub. Stellen Sie Fragen in den GitHub Discussions und melden Sie reproduzierbare Fehler als Issue; die Self-Hosting-Anleitung erklärt Installation, Updates und Backups. E-Mail-Support ist Teil von AutoSEO Cloud.",
    },
    {
      q: "Wie melde ich einen Fehler in AutoSEO?",
      a: "Eröffnen Sie einen Bug Report auf GitHub. Die Vorlage fragt ab, wie Sie AutoSEO betreiben, welche Version, welches Image-Tag oder welchen Commit Sie nutzen (zu sehen unter Admin → System Health), wie sich der Fehler reproduzieren lässt und welche Logs relevant sind. Bitte entfernen Sie Secrets aus den Logs, bevor Sie sie posten.",
    },
    {
      q: "Gibt es garantierte Antwortzeiten?",
      a: "Der Support für AutoSEO Cloud erfolgt nach bestem Bemühen, ohne garantiertes Service-Level – so steht es in den Nutzungsbedingungen. Bei Sicherheitsmeldungen bestätigen wir den Eingang innerhalb von 2 Arbeitstagen und schicken innerhalb von 5 Arbeitstagen eine erste Einschätzung.",
    },
    {
      q: "Wie aktualisiere ich eine selbst gehostete AutoSEO-Instanz?",
      a: "Starten Sie den Installer mit --update, führen Sie docker compose pull && docker compose up -d aus oder deployen Sie die Ressource in Coolify neu. Datenbank-Migrationen laufen beim Start automatisch, und verbundene lokale Agenten aktualisieren sich selbst. AutoSEO Cloud aktualisieren wir automatisch für Sie.",
    },
    {
      q: "Wie kündige ich AutoSEO Cloud oder verwalte die Abrechnung?",
      a: "Öffnen Sie Ihr Dashboard und wählen Sie „Manage billing“, um die Zahlungsmethode zu ändern, Rechnungen herunterzuladen oder zu kündigen. Die Kündigung wird zum Ende des laufenden Abrechnungszeitraums wirksam; dann wird Ihr Workspace pausiert, und wir bewahren die Daten noch 30 Tage auf, bevor sie endgültig gelöscht werden.",
    },
    {
      q: "Kann ich neue Funktionen vorschlagen?",
      a: "Ja. Eröffnen Sie einen Feature Request auf GitHub oder starten Sie zuerst eine Diskussion in den GitHub Discussions. AutoSEO ist Open Source – Sie können die Funktion also auch selbst bauen und einen Pull Request schicken.",
    },
  ],
  cta: {
    title: "Alles geklärt? Dann tracken Sie Ihre AI Visibility",
    subtitle:
      "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$ im Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies SupportPage;
