import type { FeaturePage } from "../../types";

export default {
  slug: "ai-seo-agent",
  nav: "KI-SEO-Agent",
  summary: "Chatten Sie mit Ihren SEO- und AI-Visibility-Daten – über Ihr Claude Code oder Codex.",
  meta: {
    title: "KI-SEO-Agent mit Ihrem Claude Code oder Codex",
    description:
      "Chatten Sie mit Ihren SEO- und AI-Visibility-Daten: Der KI-SEO-Agent von AutoSEO läuft über Ihr Claude-Code- oder Codex-Abo mit allen AutoSEO-Tools.",
  },
  hero: {
    eyebrow: "KI-SEO-Agent",
    title: "Ein KI-SEO-Agent, der Ihre Daten kennt.",
    muted: "Mit Ihrem eigenen Claude Code oder Codex.",
    subtitle:
      "Stellen Sie Fragen in normaler Sprache, und der Agent-Modus antwortet mit Ihren echten Zahlen – Visibility, Wettbewerber, Keywords, Rankings, Audits und Traffic. Er läuft über einen lokalen Agenten mit dem Claude-Code- oder Codex-Abo, das Sie ohnehin bezahlen; API-Keys dienen als Fallback.",
  },
  visual: "agent",
  screenshot: {
    src: "/screenshots/agent.png",
    alt: "AutoSEO im Agent-Modus: Startbildschirm mit Beispielfragen zu AI-Visibility- und SEO-Daten",
    url: "agent",
  },
  stats: [
    { value: 100, suffix: "+", label: "AutoSEO-Tools", note: "In jedem Chat verfügbar" },
    { value: 2, label: "Lokale Runtimes", note: "Claude Code und Codex CLI" },
    { value: 3, label: "API-Fallbacks", note: "Anthropic, OpenAI, OpenRouter" },
    { value: 0, prefix: "$", label: "Self-Hosting", note: "MIT-Lizenz, alle Funktionen" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "Dashboards zeigen, was passiert ist.",
    muted: "Ein Agent erklärt, warum – und was jetzt zu tun ist.",
    body: "AutoSEO sammelt viele Daten: KI-Antworten, Zitate, Wettbewerber, Rankings, Audits und Traffic. Im Agent-Modus kann jede Person im Team eine Frage stellen und bekommt eine Antwort aus genau diesen Daten – mit sichtbaren Tool-Aufrufen, statt sich durch zehn Reports zu klicken.",
    points: [
      {
        title: "Fragen gehen über Datensätze hinweg",
        body: "Warum ist die Visibility gesunken? Welche Prompts gewinnt ein Wettbewerber? Die Antwort braucht meist Tracking, Quellen und Rankings gleichzeitig.",
      },
      {
        title: "Ihr Abo statt einer weiteren Rechnung",
        body: "Wenn Sie bereits für Claude Code oder Codex bezahlen, nutzt der Agent dieses Abo über einen lokalen Agenten. API-Keys sind nur der Fallback.",
      },
      {
        title: "Auf echten Zahlen aufgebaut",
        body: "Der Agent ruft für jede Zahl AutoSEO-Tools auf – die Antworten stammen aus Ihren getrackten Daten, nicht aus dem Gedächtnis des Modells.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was der Agent kann",
    title: "Ein SEO-Analyst im Chatfenster,",
    muted: "mit allen AutoSEO-Tools.",
    items: [
      {
        icon: "message-square",
        title: "Mit allen Daten chatten",
        body: "Fragen Sie nach Visibility, Wettbewerbern, Sentiment, Quellen, Keywords, Rankings, Audits, Search Console und GA4 – jeder Tool-Aufruf wird angezeigt.",
      },
      {
        icon: "terminal",
        title: "Läuft auf Claude Code oder Codex",
        body: "Ein schlanker lokaler Agent führt jeden Chat als frische CLI-Sitzung auf Ihrem Rechner aus – verbunden ausschließlich ausgehend per HTTPS, ohne offene Ports.",
      },
      {
        icon: "key",
        title: "API-Fallback",
        body: "Kein lokaler Agent online? Dann weicht der Chat auf ein Modell von Anthropic, OpenAI oder OpenRouter aus, das für Ihr AutoSEO eingerichtet ist.",
      },
      {
        icon: "file-text",
        title: "Reports und Briefings auf Zuruf",
        body: "Bitten Sie um einen Monatsreport, ein Content-Briefing oder eine Pitch-Gliederung – der Agent erstellt sie aus Ihren Daten und speichert sie in AutoSEO.",
      },
      {
        icon: "layers",
        title: "Dateien und Spracheingabe",
        body: "Hängen Sie bis zu sechs Bilder, PDFs, CSVs oder Textdateien pro Nachricht an oder diktieren Sie Ihre Frage, statt sie zu tippen.",
      },
      {
        icon: "shield-check",
        title: "Auf Projekt und Rolle beschränkt",
        body: "Jeder Chat erhält ein kurzlebiges Token, das auf das aktive Projekt beschränkt ist, und Ihre Rolle entscheidet, welche Tools laufen oder Kosten verursachen dürfen.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Von der Frage zur Antwort",
    muted: "in drei Schritten.",
    items: [
      {
        title: "Lokalen Agenten installieren",
        body: "Öffnen Sie Settings → Local Agents, kopieren Sie den Einzeiler für macOS, Linux oder Windows und führen Sie ihn auf einem Rechner mit Claude Code oder Codex aus.",
      },
      {
        title: "Projekt wählen und fragen",
        body: "Starten Sie mit einer Beispielfrage oder stellen Sie Ihre eigene. Der Agent ruft AutoSEO-Tools auf und zeigt jeden Schritt, während er arbeitet.",
      },
      {
        title: "Mit der Antwort arbeiten",
        body: "Machen Sie aus Erkenntnissen Reports und Content-Briefings oder führen Sie das Gespräch fort. Chats werden je Projekt gespeichert und sind durchsuchbar.",
      },
    ],
  },
  faq: [
    {
      q: "Was ist ein KI-SEO-Agent?",
      a: "Ein KI-SEO-Agent ist ein KI-Assistent, der SEO-Daten selbst abruft und damit arbeitet, statt nur aus seinem Training zu antworten. Der Agent-Modus von AutoSEO verbindet Claude Code, Codex oder ein API-Modell mit allen AutoSEO-Tools – so analysiert er Ihre AI Visibility, Rankings, Audits und Ihren Traffic und erstellt daraus Reports.",
    },
    {
      q: "Brauche ich einen API-Key für den Agent-Modus?",
      a: "Nein. Der Agent-Modus kann über den lokalen Agenten von AutoSEO mit Ihrem eigenen Claude Code oder Codex CLI laufen – auch in AutoSEO Cloud – und nutzt so Ihr bestehendes Abo. Ohne lokalen Agenten weicht er auf eine KI-API aus: In AutoSEO Cloud nutzt er die Anbieter, die das Codext-Team angebunden hat, und die Nutzung zählt auf die monatlich enthaltenen 10\u00a0$; beim Self-Hosting hinterlegen Sie Keys von Anthropic, OpenAI oder OpenRouter.",
    },
    {
      q: "Wie funktioniert der lokale Agent?",
      a: "Der lokale Agent ist ein kleines Node.js-Programm, das Sie mit einem Befehl unter macOS, Linux oder Windows installieren. Er verbindet sich ausschließlich ausgehend per HTTPS mit AutoSEO, führt jeden Job in einer frischen CLI-Sitzung in einem eigenen Ordner aus und aktualisiert sich selbst über signierte Releases.",
    },
    {
      q: "Ist es sicher, den Agenten auf meinem Rechner auszuführen?",
      a: "Der Agent öffnet keine Ports, und sein Token wird auf dem Server nur als Hash gespeichert. Standardmäßig startet er die CLI im Lean-Modus – ohne Ihre persönlichen Einstellungen, MCP-Server oder Shell. Der Full-Modus mit Ihren eigenen MCP-Servern läuft nur für Jobs, die Sie selbst gestartet haben, und nur, wenn Sie ihn lokal erlaubt haben.",
    },
    {
      q: "Können Teammitglieder mein Claude-Code-Abo nutzen?",
      a: "Nicht für Chats. Gespräche im Agent-Modus laufen nur auf dem lokalen Agenten der Person, die fragt. Jedes Teammitglied verbindet sein eigenes Claude Code oder Codex oder nutzt den API-Fallback.",
    },
    {
      q: "Auf welche Daten kann der Agent zugreifen?",
      a: "Der Agent arbeitet im aktiven Projekt und hat dieselben Rechte wie Sie. Er kann AI Visibility, Wettbewerber, Quellen, Keywords, Rankings, Audits sowie Search-Console- und GA4-Daten lesen und kostenpflichtige Tools nur ausführen, wenn Ihre Rolle das erlaubt.",
    },
    {
      q: "Kann ich AutoSEO auch aus meinem eigenen Claude Code oder Cursor nutzen?",
      a: "Ja. Neben dem integrierten Agent-Modus bietet AutoSEO einen MCP-Server mit über 100 Tools sowie Plugins für Claude Code, Codex und Cursor. Verbinden Sie Ihren Agenten mit AutoSEO und arbeiten Sie mit denselben Daten direkt aus Editor oder Terminal.",
    },
    {
      q: "Was kostet der Agent-Modus?",
      a: "Der Agent-Modus ist Teil der kostenlosen Open-Source-App AutoSEO. Mit lokalem Agenten nutzt er Ihr bestehendes Claude-Code- oder Codex-Abo. Die Nutzung des API-Fallbacks rechnet beim Self-Hosting der Anbieter ab; in AutoSEO Cloud zählt sie zur KI- und Datennutzung im Wert von 10\u00a0$, die im Workspace für 50\u00a0$ pro Monat inklusive ist.",
    },
  ],
  related: ["mcp-server", "report-builder", "ai-visibility-tracking", "ai-seo-tasks"],
  cta: {
    title: "Fragen Sie Ihre SEO-Daten, was Sie wissen wollen",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat und verbinden Sie Ihr eigenes Claude Code oder Codex – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
