import type { SecurityPage } from "../types";

export default {
  meta: {
    title: "Sicherheit & Datenschutz: Hosting in Deutschland",
    description:
      "Sicherheit und Datenschutz bei AutoSEO: passwortlose Anmeldung, AES-256-GCM-verschlüsselte Secrets, Audit-Log, DSGVO-Export. Open Source, Cloud in Deutschland.",
  },
  hero: {
    eyebrow: "Sicherheit & Datenschutz",
    title: "Sicherheit und Datenschutz,",
    muted: "die Sie im Code prüfen können.",
    subtitle:
      "AutoSEO ist Open Source: Jede Maßnahme auf dieser Seite steht im öffentlichen Repository und lässt sich in Ihrem Security-Review nachvollziehen. Hosten Sie AutoSEO selbst und behalten Sie die volle Kontrolle auf Ihrer eigenen Infrastruktur – oder nutzen Sie einen Workspace in AutoSEO Cloud, vollständig von uns auf Servern in Deutschland betrieben.",
  },
  pillars: {
    eyebrow: "Überblick",
    title: "Sicher ab Werk,",
    muted: "in jeder Installation.",
    items: [
      {
        icon: "key",
        title: "Passwortlose Anmeldung nur auf Einladung",
        body: "Keine Passwörter, die geleakt oder mehrfach verwendet werden können. Die Anmeldung läuft über einen einmaligen Magic Link oder einen 6-stelligen Code, der standardmäßig nach 15 Minuten abläuft. Ab Werk kommt niemand ohne Einladung hinein, und beim Self-Hosting lässt sich die Anmeldung auf Ihre Firmen-Domains beschränken.",
      },
      {
        icon: "lock",
        title: "Verschlüsselte Secrets, gehashte Tokens",
        body: "API-Keys von KI-Anbietern, SMTP-Passwörter, OAuth-Client-Secrets und Zugangsdaten von Integrationen werden mit AES-256-GCM verschlüsselt. API-Keys, OAuth- und Agent-Tokens, die AutoSEO ausstellt, speichert die App nur als SHA-256-Hash und zeigt sie genau einmal an.",
      },
      {
        icon: "users",
        title: "Rollen und Zugriff pro Projekt",
        body: "Die Rollen Owner, Admin, Member und Client plus eigene Rollen. Members und Clients sehen nur die Projekte, die Sie freigeben; Clients haben reinen Lesezugriff. Die Instanz-Administration wird separat vergeben.",
      },
      {
        icon: "list-checks",
        title: "Audit-Log",
        body: "Anmeldungen, Einladungen, Rollenwechsel, API-Keys, Integrationen und Projektänderungen werden mit handelnder Person und IP-Adresse protokolliert. Beim Self-Hosting sehen und exportieren Sie das Log im Admin-Bereich.",
      },
      {
        icon: "server",
        title: "Getrennte Workspaces, gehostet in Deutschland",
        body: "AutoSEO Cloud ist eine gemeinsame Instanz auf Servern in Deutschland. Der Workspace jedes Kunden ist innerhalb einer gemeinsamen Datenbank logisch getrennt, Workspace-Rollen können nie Admin-Zugriff auf die Instanz gewähren, und Budgets gelten pro Workspace.",
      },
      {
        icon: "code",
        title: "Open Source und prüfbar",
        body: "Die komplette App ist MIT-lizenziert und öffentlich auf GitHub. AutoSEO Cloud nutzt dieselbe Open-Source-App – Ihr Security-Team kann also den Code prüfen, der Ihre Daten verarbeitet.",
      },
    ],
  },
  data: {
    eyebrow: "Datenstandort",
    title: "Wo Ihre Daten liegen",
    muted: "und wer sie verarbeitet.",
    body: "AutoSEO speichert Projekte, Prompts, KI-Antworten, Reports und hinterlegte Zugangsdaten in PostgreSQL und einem Daten-Volume. Wo das läuft, hängt davon ab, wie Sie AutoSEO nutzen.",
    items: [
      {
        title: "AutoSEO Cloud",
        body: "Eine gemeinsame Instanz auf Servern in Deutschland, betrieben von der Codext GmbH auf Infrastruktur von Hetzner. Die Daten Ihres Workspaces sind innerhalb einer gemeinsamen Datenbank logisch getrennt; Zugriff haben nur Ihre Mitglieder und, wo es für den Betrieb nötig ist, unsere Administratoren. Wir handeln als Ihr Auftragsverarbeiter nach Art. 28 DSGVO.",
      },
      {
        title: "Self-Hosting",
        body: "Ihre Daten bleiben auf Ihrem Server, in Ihrer eigenen Datenbank. Die App meldet nichts an Codext, und Updates, Backups und Netzwerkzugriffe steuern Sie selbst.",
      },
      {
        title: "Drittanbieter",
        body: "Bei AutoSEO Cloud sind die von uns konfigurierten KI- und SEO-Datenanbieter unsere Unterauftragsverarbeiter; die Liste erhalten Sie auf Anfrage. Beim Self-Hosting wählen Sie die Anbieter selbst. Mit einem lokalen Agenten laufen KI-Anfragen auf Ihrem Rechner über Ihr eigenes Claude-Code- oder Codex-Konto.",
      },
    ],
  },
  controls: {
    eyebrow: "Maßnahmen",
    title: "Was heute im Code steckt,",
    muted: "in jeder Installation.",
    items: [
      "Session-Cookies mit __Host-Präfix, Secure, HttpOnly und SameSite=Lax",
      "Session-Tokens, API-Keys, OAuth- und Agent-Tokens nur als SHA-256-Hash gespeichert",
      "SMTP-Passwörter, KI-API-Keys und OAuth-Client-Secrets mit AES-256-GCM verschlüsselt",
      "Anmeldung standardmäßig nur auf Einladung, optional mit Freigabeliste für E-Mail-Domains",
      "Sessions pro Gerät, einzeln widerrufbar, plus optionales Gerätelimit",
      "SSRF-Schutz, der private, LAN- und Link-Local-Adressen bei jeder Weiterleitung blockiert",
      "API-Keys mit den Scopes read, write, spend und export",
      "Tägliche und monatliche Ausgabenlimits für kostenpflichtige KI- und Datenabrufe",
      "DSGVO-Export und -Löschung, per Self-Service oder durch einen Admin",
      "HSTS, Content Security Policy und Framing-Schutz in jeder Antwort",
    ],
  },
  disclosure: {
    title: "Responsible Disclosure",
    body: "Sie haben eine Schwachstelle gefunden? Bitte eröffnen Sie dafür kein öffentliches Issue. Melden Sie sie vertraulich über GitHub Security Advisories oder per E-Mail – mit Schritten zur Reproduktion, betroffener Version oder Commit und den möglichen Auswirkungen. Wir bestätigen den Eingang innerhalb von 2 Arbeitstagen, schicken innerhalb von 5 Arbeitstagen eine erste Einschätzung und streben bei kritischen Lücken eine Behebung innerhalb von 7 Tagen an. Auf Wunsch nennen wir Sie im Advisory.",
    advisoryLabel: "Über GitHub Security Advisories melden",
    emailLabel: "E-Mail an security@codext.de",
  },
  faq: [
    {
      q: "Wo werden meine Daten gespeichert?",
      a: "AutoSEO Cloud läuft auf Servern in Deutschland. Jeder Kunde erhält einen eigenen Workspace, dessen Daten innerhalb einer gemeinsamen Datenbank logisch von anderen Workspaces getrennt sind. Beim Self-Hosting bleibt alles auf Ihrem eigenen Server – abgesehen von den Anfragen an die KI- und Datenanbieter, die Sie selbst konfigurieren.",
    },
    {
      q: "Ist AutoSEO DSGVO-konform?",
      a: "AutoSEO bringt die Werkzeuge mit, die die DSGVO verlangt: einen Export der personenbezogenen Daten jeder Person, Löschung mit vorherigem Probelauf und ein Audit-Log. Für AutoSEO Cloud handelt die Codext GmbH mit Sitz in Deutschland als Ihr Auftragsverarbeiter nach Art. 28 DSGVO, die von uns konfigurierten KI- und SEO-Datenanbieter als unsere Unterauftragsverarbeiter. Ob Ihr Einsatz insgesamt konform ist, hängt auch davon ab, wie Sie AutoSEO nutzen und welche Drittanbieter Sie anbinden.",
    },
    {
      q: "Wie werden API-Keys und Zugangsdaten gespeichert?",
      a: "Hinterlegte Zugangsdaten – API-Keys von KI-Anbietern, SMTP-Passwörter, DataForSEO-Zugangsdaten, OAuth-Client-Secrets und Zugangsdaten von Integrationen – werden mit AES-256-GCM verschlüsselt. Der Schlüssel entsteht beim ersten Start und liegt im Daten-Volume, ein Datenbank-Dump allein verrät also nichts davon. API-Keys und Tokens, die AutoSEO ausstellt, werden nur als SHA-256-Hash gespeichert, und für die Anmeldung gibt es gar keine Passwörter.",
    },
    {
      q: "Wie sind meine Daten von anderen Kunden bei AutoSEO Cloud getrennt?",
      a: "Jeder Kunde erhält einen eigenen Workspace in einer gemeinsamen AutoSEO-Instanz, dessen Daten innerhalb einer gemeinsamen Datenbank logisch von anderen Workspaces getrennt sind. Workspace-Rollen können nie Admin-Zugriff auf die Instanz gewähren, und Budgets und Projektlimits gelten pro Workspace. Codext ist der einzige Administrator der Instanz und greift nur auf Workspace-Daten zu, wo es für den Betrieb nötig ist.",
    },
    {
      q: "Gibt es einen Auftragsverarbeitungsvertrag (AVV)?",
      a: "Ja. Für personenbezogene Daten in Ihrem Workspace bei AutoSEO Cloud handelt die Codext GmbH als Auftragsverarbeiter nach Art. 28 DSGVO. Den AVV erhalten Sie auf Anfrage per E-Mail an kontakt@codext.de. Beim Self-Hosting verarbeiten wir Ihre Daten nicht, ein AVV mit uns ist dann nicht nötig.",
    },
    {
      q: "Was passiert nach der Kündigung von AutoSEO Cloud mit meinen Daten?",
      a: "Zum Ende des Abrechnungszeitraums wird Ihr Workspace pausiert: Er lässt sich nicht mehr öffnen, seine API-Keys funktionieren nicht mehr, und geplantes Tracking stoppt. Wir bewahren die Daten 30 Tage lang auf, damit Sie das Abo reaktivieren und nahtlos weitermachen können. Danach werden Workspace und Daten endgültig gelöscht.",
    },
    {
      q: "Ist AutoSEO nach SOC 2 oder ISO 27001 zertifiziert?",
      a: "Nein, AutoSEO hat keine formalen Sicherheitszertifizierungen. Dafür liegt der komplette Quellcode offen für Ihr Security-Review, und Sie können AutoSEO in einer Infrastruktur selbst hosten, die Ihre eigenen Zertifizierungen bereits abdecken.",
    },
    {
      q: "Wie melde ich eine Sicherheitslücke?",
      a: "Melden Sie sie vertraulich über GitHub Security Advisories im Repository codextde/autoseo oder per E-Mail an security@codext.de – bitte nicht als öffentliches Issue. Wir bestätigen den Eingang innerhalb von 2 Arbeitstagen und schicken innerhalb von 5 Arbeitstagen eine erste Einschätzung.",
    },
  ],
  cta: {
    title: "Erst den Code prüfen, dann entscheiden, wo er läuft",
    subtitle:
      "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$ im Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies SecurityPage;
