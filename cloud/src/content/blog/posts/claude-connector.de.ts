import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "claude-connector",
  title: "AutoSEO mit Claude und Claude Code verbinden: MCP-Anleitung",
  description:
    "So verbinden Sie AutoSEO per MCP und OAuth mit Claude, Claude Desktop oder Claude Code: Schritte, sichere Berechtigungen, Fehlerbehebung und Beispiel-Prompts.",
  date: "2026-09-26",
  authorSlug: "autoseo-team",
  tags: ["mcp", "claude", "how-to"],
  readingMinutes: 12,
  lead:
    "Kopieren Sie die MCP-Server-URL aus **Settings → API & MCP** in AutoSEO (immer `<URL Ihrer Instanz>/api/mcp`), fügen Sie sie in Claude unter **Customize → Connectors → Add custom connector** hinzu oder führen Sie in Claude Code `claude mcp add --transport http autoseo <url>` aus, und bestätigen Sie anschließend den Zugriff auf der Zustimmungsseite von AutoSEO. Den Rest erledigt OAuth, beschränkt auf den Workspace, die Projekte und die Berechtigungen, die Sie auswählen. Für claude.ai und Claude Desktop muss Ihre Instanz öffentlich per HTTPS erreichbar sein, weil diese Apps aus der Cloud von Anthropic zugreifen.",
  blocks: [
    { type: "h2", text: "Was brauchen Sie, bevor Sie verbinden?" },
    {
      type: "ul",
      items: [
        "**Die MCP-URL.** Öffnen Sie in AutoSEO **Settings → API & MCP**; das Panel „MCP Server“ zeigt die URL Ihrer Instanz plus `/api/mcp`. Bei [AutoSEO Cloud](/pricing) kopieren Sie die URL aus Ihrem Workspace, bei einer [selbst gehosteten](/self-hosting) Instanz ist es Ihre eigene Domain.",
        "**Öffentliches HTTPS.** Claude ruft eigene Konnektoren aus der Infrastruktur von Anthropic auf, in claude.ai, Claude Desktop, Cowork und den Mobil-Apps. Server hinter einem VPN oder in einem privaten Netz sind daher nicht erreichbar ([Claude Help Center](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)).",
        "**Die passende AutoSEO-Rolle.** Um eine App freizugeben, brauchen Sie im Workspace die Berechtigung **Integrations, API keys, model settings**, dieselbe wie für API-Schlüssel.",
        "**Ein Claude-Tarif mit eigenen Konnektoren.** Anthropic nennt Free (ein eigener Konnektor), Pro, Max, Team und Enterprise. In Team und Enterprise fügen Owner eigene Konnektoren hinzu, Mitglieder verbinden sich dann einzeln.",
      ],
    },

    { type: "h2", text: "Wie funktioniert die Verbindung technisch?" },
    {
      type: "p",
      text: "Der MCP-Server von AutoSEO ist ein zustandsloser Streamable-HTTP-Endpunkt: Jede JSON-RPC-Nachricht ist ein POST an `/api/mcp`, wird mit reinem JSON beantwortet und einzeln authentifiziert. Es gibt keinen SSE-Stream und keine Session-ID, was die [MCP-Transportspezifikation](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports) ausdrücklich zulässt. Unterstützt werden die Protokollversionen 2024-11-05, 2025-03-26, 2025-06-18 und 2025-11-25.",
    },
    {
      type: "p",
      text: "Eine Anfrage ohne Token erhält eine 401-Antwort, deren `WWW-Authenticate`-Header auf die Protected Resource Metadata verweist ([RFC 9728](https://www.rfc-editor.org/rfc/rfc9728)). Darüber findet Claude den Autorisierungsserver, weist sich per Client ID Metadata Document aus oder registriert sich per Dynamic Client Registration ([RFC 7591](https://www.rfc-editor.org/rfc/rfc7591)), was AutoSEO beides akzeptiert, und durchläuft einen Authorization-Code-Flow mit PKCE, bei dem AutoSEO nur S256 akzeptiert.",
    },
    {
      type: "table",
      head: ["Aussage", "Was die Quelle sagt", "Quelle (Jahr)"],
      rows: [
        [
          "Claude verbindet sich aus der Cloud von Anthropic",
          "Der Datenverkehr eigener Konnektoren geht bei allen Claude-Clients von der Infrastruktur von Anthropic aus; der Server muss öffentlich erreichbar sein",
          "[Claude Help Center](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp) (2026)",
        ],
        ["Welche IP-Adressen freigeben?", "Ausgehende Anfragen wie MCP-Tool-Aufrufe kommen aus `160.79.104.0/21`", "[Anthropic: IP addresses](https://platform.claude.com/docs/en/api/ip-addresses) (2026)"],
        [
          "Welche Scopes Claude anfragt",
          "Fehlt ein `scope` in der 401-Challenge, fragt Claude an, was `scopes_supported` in den Resource-Metadaten auflistet",
          "[Claude docs: Authentication](https://claude.com/docs/connectors/building/authentication) (2026)",
        ],
        [
          "Callback-URLs",
          "Die gehosteten Apps leiten zu `https://claude.ai/api/mcp/auth_callback` weiter; Claude Code nutzt eine Loopback-Weiterleitung",
          "[Claude docs: Authentication](https://claude.com/docs/connectors/building/authentication) (2026)",
        ],
        [
          "PKCE und Registrierung",
          "Clients müssen PKCE mit S256 verwenden; Dynamic Client Registration ist optional (MAY)",
          "[MCP-Spezifikation 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization) (2025)",
        ],
      ],
      caption: "Was die offizielle Dokumentation zu den Bausteinen dieser Einrichtung sagt (Stand: September 2026).",
    },

    { type: "h2", text: "Wie fügen Sie AutoSEO in claude.ai und Claude Desktop hinzu?" },
    {
      type: "p",
      text: "Einen eigenen Konnektor richten Sie einmal ein; danach steht er im Web, in der Desktop-App und mobil zur Verfügung. Stand September 2026 heißt die Seite bei Anthropic **Customize → Connectors**; in der Desktop-App finden Sie **Customize** in der Seitenleiste ([Claude docs](https://claude.com/docs/connectors/getting-started)). Ältere Anleitungen nennen sie Settings → Connectors.",
    },
    {
      type: "ol",
      items: [
        "Öffnen Sie in Claude **Customize → Connectors** und wählen Sie **Add custom connector**.",
        "Vergeben Sie den Namen `AutoSEO` und fügen Sie die MCP-URL ein. Lassen Sie **Advanced settings** (OAuth-Client-ID und -Secret) leer. Fragt Ihr Dialog nach einer Option unter **OAuth client**, behalten Sie **Use Claude's published identity** bei, die von Anthropic empfohlene Variante: AutoSEO akzeptiert Client ID Metadata Documents ebenso wie die dynamische Registrierung, **Register automatically** funktioniert also auch ([Claude docs](https://claude.com/docs/connectors/custom/add-unlisted)).",
        "Klicken Sie auf **Add** und dann auf **Connect**. Die Zustimmungsseite von AutoSEO öffnet sich im Browser.",
        "Prüfen Sie, dass unter **Redirects to** `claude.ai` steht, wählen Sie Workspace, Projekte (**All my projects** oder eine Auswahl) und Berechtigungen und klicken Sie auf **Allow access**.",
        "Klicken Sie in einem Chat auf **+**, öffnen Sie **Connectors** und schalten Sie AutoSEO ein.",
      ],
    },
    {
      type: "p",
      text: "In Team und Enterprise fügt ein Owner den Konnektor unter **Organization settings → Connectors** hinzu (**Add**, **Custom**, **Web**). Jedes Mitglied klickt anschließend auf **Connect** und autorisiert mit dem eigenen AutoSEO-Konto, sodass Rollen und Projektzugriffe pro Person erhalten bleiben.",
    },
    {
      type: "callout",
      tone: "tip",
      title: "Häkchen prüfen, bevor Sie den Zugriff erlauben",
      text: "Die Metadaten von AutoSEO nennen alle vier Scopes, und Claude fragt an, was dort steht. Rechnen Sie daher damit, dass **Read**, **Write**, **Spend credits** und **Export** vorausgewählt sind, und entfernen Sie, was Sie nicht brauchen.",
    },

    { type: "h2", text: "Wie verbinden Sie Claude Code?" },
    {
      type: "p",
      text: "Claude Code verbindet sich von Ihrem Rechner aus und führt OAuth mit einer Loopback-Weiterleitung aus ([Claude Code docs](https://code.claude.com/docs/en/mcp)). Ersetzen Sie die Beispieldomain durch Ihre eigene:",
    },
    { type: "code", lang: "bash", title: "Terminal", code: "claude mcp add --transport http autoseo https://seo.example.com/api/mcp" },
    {
      type: "p",
      text: "Führen Sie danach in Claude Code `/mcp` aus, wählen Sie `autoseo` und authentifizieren Sie sich, oder nutzen Sie in der Shell `claude mcp login autoseo`. Die Zustimmungsseite zeigt diesmal `localhost` als Weiterleitungsziel. `claude mcp list` bestätigt die Verbindung.",
    },
    {
      type: "p",
      text: "Standard ist der Scope **local** (nur Sie, nur dieses Projekt, gespeichert in `~/.claude.json`). Mit `--scope user` steht AutoSEO in allen Projekten bereit; `--scope project` schreibt eine `.mcp.json`, die Ihr Team eincheckt, und jede Person meldet sich mit dem eigenen Konto an. Die Tool-Suche von Claude Code lädt beim Start nur Tool-Namen und Server-Anweisungen, sodass auch ein Server mit über 100 Tools den Kontext kaum belastet.",
    },
    { type: "h3", text: "Wann ist ein API-Schlüssel die bessere Wahl?" },
    {
      type: "p",
      text: "Für CI-Jobs, Server und Läufe ohne Browser sowie als Ausweichlösung, falls OAuth gegen eine lokale Testinstanz hakt. Erstellen Sie einen Schlüssel unter **Settings → API & MCP → Create key**; AutoSEO zeigt ihn einmal an und speichert nur seinen SHA-256-Hash.",
    },
    {
      type: "code",
      lang: "bash",
      title: "Terminal",
      code: 'claude mcp add --transport http autoseo https://seo.example.com/api/mcp \\\n  --header "Authorization: Bearer <YOUR_API_KEY>"',
    },
    {
      type: "p",
      text: "In einer geteilten `.mcp.json` verweisen Sie auf eine Umgebungsvariable statt auf den Schlüssel selbst. Meiden Sie reservierte Namen wie `ANTHROPIC_API_KEY`, die Claude Code nie an einen entfernten Server sendet.",
    },
    {
      type: "code",
      lang: "json",
      title: ".mcp.json",
      code: '{\n  "mcpServers": {\n    "autoseo": {\n      "type": "http",\n      "url": "https://seo.example.com/api/mcp",\n      "headers": { "Authorization": "Bearer ${AUTOSEO_API_KEY}" }\n    }\n  }\n}',
    },
    { type: "h3", text: "Was bringt das AutoSEO-Plugin zusätzlich?" },
    {
      type: "p",
      text: "Das Plugin bündelt den MCP-Server, vorkonfiguriert für Ihre Instanz, mit 17 Skills wie `seo-audit`, `ai-visibility-report` und `competitor-gap`. Bei öffentlichem HTTPS fügen Sie die gehostete `marketplace.json` Ihrer Instanz hinzu ([Claude Code docs](https://code.claude.com/docs/en/discover-plugins)):",
    },
    {
      type: "code",
      lang: "bash",
      title: "Terminal",
      code: "claude plugin marketplace add https://seo.example.com/api/plugin/marketplace.json\nclaude plugin install autoseo@autoseo",
    },
    {
      type: "p",
      text: "Starten Sie eine neue Sitzung, authentifizieren Sie sich über `/mcp` und rufen Sie Skills mit dem Plugin-Namespace auf, etwa `/autoseo:seo-audit` ([Claude Code docs](https://code.claude.com/docs/en/skills)). Bei `localhost` oder reinem HTTP laden Sie stattdessen das Bundle im Tab **Agent setup** unter Settings → API & MCP herunter und fügen es als lokalen Marketplace hinzu. Einen bereits in claude.ai angelegten Konnektor zeigt `/mcp` ebenfalls an, wenn Claude Code dasselbe claude.ai-Konto nutzt.",
    },
    { type: "h3", text: "Kann AutoSEO umgekehrt Ihr Claude Code nutzen?" },
    {
      type: "p",
      text: "Ja, als eigene Funktion. Unter **Settings → Local Agents** installieren Sie einen kleinen Hintergrunddienst auf einem Rechner mit Claude Code oder Codex. Der [Agent-Modus](/ai-seo-agent) und weitere KI-Funktionen von AutoSEO laufen dann dort über Ihr Abonnement, API-Schlüssel dienen nur als Rückfallebene. Der Agent stellt ausschließlich ausgehende HTTPS-Verbindungen her, und Agent-Chats erreichen dieselben MCP-Tools über einen Schlüssel, der nach spätestens sechs Stunden abläuft.",
    },

    { type: "h2", text: "Welche Berechtigungen sollten Sie vergeben?" },
    {
      type: "table",
      head: ["Scope (Label)", "Was er erlaubt", "Wann vergeben"],
      rows: [
        ["`read` (Read)", "Projekte, Prompts, Sichtbarkeitskennzahlen, Wettbewerber, Quellen, Aufgaben, Reports", "Immer enthalten; genügt für Analysen"],
        ["`write` (Write)", "Änderungen wie neue Prompts oder Aufgabenstatus, begrenzt durch Ihre Rolle", "Wenn Claude handeln statt nur berichten soll"],
        ["`spend` (Spend credits)", "Kostenpflichtige Tools: DataForSEO-Recherche, KI-Generierung, Tracking-Läufe, Audits", "Pro Sitzung, wenn Sie bezahlte Recherche wollen"],
        ["`export` (Export)", "Massenexport von Prompts, Antworten und Ergebnissen", "Nicht für den Chat; derzeit braucht ihn kein MCP-Tool"],
      ],
    },
    {
      type: "p",
      text: "AutoSEO bietet über 100 MCP-Tools (die aktuelle Zahl zeigt das Panel „MCP Server“ unter Settings → API & MCP); etwa ein Drittel davon kann Kosten verursachen. AutoSEO blendet diese ohne Spend-Scope aus, und die Server-Anweisungen halten Claude an, kostenlose Tools zu bevorzugen und größere bezahlte Serien mit Ihnen abzustimmen. Tools, die Daten ändern oder bezahlte Läufe starten, prüfen zudem bei jedem Aufruf Ihre Rolle.",
    },
    {
      type: "ul",
      items: [
        "**Tokens:** Access-Tokens laufen nach einer Stunde ab und werden automatisch erneuert; Refresh-Tokens gelten rollierend 30 Tage.",
        "**Widerruf:** **Settings → API & MCP → Connected apps → Disconnect** widerruft sofort alle Tokens einer App. Prüfen Sie diese Liste auch nach dem Trennen in Claude, denn eine neue Verbindung kann als eigener Eintrag erscheinen.",
        "**Sorgfalt bei der Zustimmung:** Die Zustimmungsseite zeigt **Published by** mit der herausgebenden Domain, wenn sich der Client über ein Metadata Document ausweist, und **Unverified app**, wenn er sich selbst registriert hat. Fahren Sie nur fort, wenn Sie die Verbindung gerade gestartet haben und das Weiterleitungsziel `claude.ai` oder `localhost` lautet.",
        "**Tool-Freigaben:** Stellen Sie AutoSEO-Tools in Claude auf **Always allow**, **Needs approval** oder **Blocked** ([Claude docs](https://claude.com/docs/connectors/getting-started)); schreibende und kostenpflichtige Tools bleiben am besten auf Freigabe.",
      ],
    },

    { type: "h2", text: "Was können Sie Claude nach der Verbindung fragen?" },
    {
      type: "p",
      text: "Sie fragen in normaler Sprache, Claude wählt die Tools. Meist beginnt es mit `list_projects` und `get_project_context`, wie es die Server-Anweisungen von AutoSEO nahelegen.",
    },
    {
      type: "table",
      head: ["Frage an Claude", "Wahrscheinliche Tools", "Scopes"],
      rows: [
        ["„Wie sichtbar waren wir in KI-Antworten in den letzten 30 Tagen im Vergleich zum Vorzeitraum?“", "`get_visibility_metrics`", "read"],
        ["„Ordne uns nach Share of Voice gegenüber den getrackten Wettbewerbern ein.“", "`get_competitor_ranking`", "read"],
        ["„Bei welchen Prompts wird ein Wettbewerber genannt, wir aber nicht, und welche Quellen zitieren ihn?“", "`get_competitor_gap_analysis`, `get_top_sources`", "read"],
        ["„Welche Unterabfragen haben die Engines für unsere Prompts ausgeführt? Mach daraus Content-Ideen.“", "`get_query_fanouts`", "read"],
        ["„Was kritisieren KI-Antworten an uns?“", "`get_sentiment_overview`", "read"],
        ["„Erreichen GPTBot, ClaudeBot und PerplexityBot unsere Website? Nenne kritische Fixes.“", "`run_crawlability_check`, `get_crawlability_check`", "read, write, spend"],
        ["„Wie viele Umfrageteilnehmer haben uns dieses Quartal über ChatGPT gefunden?“", "`get_attribution_summary`", "read"],
        ["„Liste offene Optimierungsaufgaben nach Wirkung und setze die erste auf in Bearbeitung.“", "`list_tasks`, `update_task_status`", "read, write"],
      ],
      caption: "Tool-Namen Stand September 2026; die vollständige Liste mit Scopes steht unter Settings → API & MCP.",
    },
    {
      type: "p",
      text: "Die Antworten sind nur so gut wie die Daten dahinter: getrackte Prompts für das [KI-Sichtbarkeits-Tracking](/ai-visibility-tracking), der Check hinter [KI-Crawlbarkeit](/ai-crawlability), Umfrage- oder CRM-Daten für die Attribution. Die Seiten zum [MCP-Server](/mcp-server) und zur [REST-API](/rest-api) beschreiben dieselben Daten für Skripte. Zu messen, wie Claude selbst über Ihre Marke antwortet, ist eine andere Funktion: [Claude-Sichtbarkeits-Tracking](/ai-visibility-tracking/claude).",
    },

    { type: "h2", text: "Wie sieht eine erste Sitzung aus?" },
    {
      type: "p",
      text: "Beispiel: Lena, fiktive Marketingleiterin eines SaaS-Anbieters für Projektmanagement, möchte in Claude einen wöchentlichen Sichtbarkeits-Check. Alle Zahlen sind illustrativ.",
    },
    {
      type: "ol",
      items: [
        "Sie fügt AutoSEO in ihrem Pro-Tarif als eigenen Konnektor hinzu. Auf der Zustimmungsseite wählt sie nur das Produktprojekt und entfernt Write, Spend credits und Export, sodass Claude nur kostenlose Lese-Tools sieht.",
        "Sie fragt, wie sichtbar die Marke in den letzten 30 Tagen war. Claude ruft `get_visibility_metrics` auf und meldet etwa 21 % Sichtbarkeit nach 18 % im Vorzeitraum (illustrativ).",
        "„Wo tauchen Wettbewerber auf und wir nicht?“ `get_competitor_gap_analysis` liefert beispielsweise 12 solcher Prompts (illustrativ), `get_top_sources` zeigt, welche Vergleichsseiten den Wettbewerber zitieren.",
        "Aus den Fan-out-Unterabfragen dieser Prompts (`get_query_fanouts`) lässt sie Claude ein Content-Briefing entwerfen.",
        "Für einen Check der KI-Crawler braucht sie `run_crawlability_check`. Das Tool fehlt, weil Write und Spend credits nicht freigegeben sind. Sie verbindet sich für diesen einen Check mit beiden neu und danach wieder nur mit Read.",
      ],
    },
    {
      type: "p",
      text: "Das Muster: standardmäßig nur lesen, für eine konkrete Aufgabe erweitern, danach wieder einschränken. In Claude Code bündelt der Skill `ai-visibility-report` einen ähnlichen Ablauf.",
    },

    { type: "h2", text: "Warum funktioniert die Verbindung nicht?" },
    {
      type: "table",
      head: ["Symptom", "Wahrscheinliche Ursache", "Lösung"],
      rows: [
        [
          "claude.ai verbindet nicht, Claude Code schon",
          "Instanz auf `localhost`, in einem privaten Netz oder hinter einem VPN",
          "AutoSEO öffentlich per HTTPS bereitstellen; `160.79.104.0/21` in der Firewall freigeben",
        ],
        [
          "401 „The credential is invalid, expired or revoked“",
          "App oder Schlüssel in AutoSEO widerrufen, oder Refresh-Token 30 Tage ungenutzt",
          "In Claude **Reconnect** klicken oder über `/mcp` neu authentifizieren; widerrufene Schlüssel ersetzen",
        ],
        [
          "Claude Code scheitert mit API-Schlüssel",
          "Header fehlerhaft, Variable nicht gesetzt oder reservierter Name, der leer gelesen wird",
          "`claude mcp get autoseo` prüfen; `Authorization: Bearer as_live_…` verwenden",
        ],
        ["Zustimmungsseite: „You can't connect apps“", "Rolle ohne **Integrations, API keys, model settings**", "Workspace-Owner oder Admin fragen"],
        ["Kostenpflichtige Tools wie `run_site_audit` fehlen", "Kein Scope **Spend credits** freigegeben", "Trennen, neu verbinden, Spend credits (und Write) anhaken"],
        ["„Your role in this workspace does not allow …“", "Scope vorhanden, Rollenberechtigung fehlt", "Admin fragen; Rollen werden bei jedem Aufruf geprüft"],
        ["„Rate limit exceeded (120 requests/minute)“", "Standardlimit pro Zugang", "Weniger, breitere Abfragen oder Limit durch Admin erhöhen"],
        ["„Unknown client_id“ auf der Zustimmungsseite", "Veraltete Registrierung; nicht freigegebene werden nach 30 Tagen gelöscht", "Konnektor entfernen (oder `claude mcp remove autoseo`) und neu hinzufügen"],
      ],
      caption: "Meldungen im Wortlaut der AutoSEO-API und der Zustimmungsseite (Stand: September 2026).",
    },

    { type: "h2", text: "Was bedeutet das für Sie?" },
    {
      type: "ul",
      items: [
        "Verbinden Sie zunächst nur lesend; Write oder Spend credits vergeben Sie pro Aufgabe, nicht dauerhaft.",
        "Nutzen Sie OAuth für Menschen und API-Schlüssel für Maschinen, abgelegt in Umgebungsvariablen.",
        "Wählen Sie Projektzugriffe bewusst, gerade in Agentur-Workspaces.",
        "Prüfen Sie **Connected apps** regelmäßig und trennen Sie unbekannte Einträge.",
        "Im Terminal lohnt das Plugin wegen der Skills; soll AutoSEO seine eigene KI über Ihr Claude-Abonnement ausführen, richten Sie einen lokalen Agenten ein.",
      ],
    },
    {
      type: "p",
      text: "Die [ChatGPT-Anleitung](/blog/chatgpt-plugin) beschreibt denselben Server in ChatGPT. Noch ohne Instanz? [Hosten Sie AutoSEO selbst](/self-hosting) oder nutzen Sie [AutoSEO Cloud](/pricing); in beiden Fällen finden Sie die MCP-URL unter Settings → API & MCP.",
    },
    {
      type: "callout",
      tone: "info",
      title: "Methode und Grenzen",
      text: "Diese Anleitung verbindet den Quellcode von AutoSEO (MCP-Server, OAuth, Zustimmungsseite, Stand September 2026) mit der öffentlichen Dokumentation von Anthropic und der MCP-Spezifikation. AutoSEO verfügt über keinen eigenen Datensatz, auf Claude-Seite wurde nichts gemessen. Die Menüs von Claude ändern sich häufig, und laut Anthropic unterscheidet sich der Konnektor-Dialog je nach Organisation. Die Zahl der Tools ändert sich mit neuen Versionen; die aktuelle Liste steht unter Settings → API & MCP.",
    },
  ],
  faq: [
    {
      q: "Funktioniert der AutoSEO-Konnektor im Free-Tarif von Claude?",
      a: "Anthropic bietet eigene Konnektoren in Free, Pro, Max, Team und Enterprise an, im Free-Tarif ist einer möglich. Ihre Instanz muss trotzdem öffentlich per HTTPS erreichbar sein.",
    },
    {
      q: "Brauche ich einen API-Schlüssel, um Claude zu verbinden?",
      a: "Nein. claude.ai, Claude Desktop und Claude Code melden sich per OAuth an, und Sie bestätigen den Zugriff in AutoSEO. API-Schlüssel sind für Umgebungen ohne Browser gedacht, etwa CI-Jobs, und werden als Authorization-Header gesendet.",
    },
    {
      q: "Kann Claude über mein AutoSEO-Konto Geld ausgeben?",
      a: "Nur mit dem Scope Spend credits und einer Rolle, die bezahlte Recherchen erlaubt. Ohne diesen Scope werden die kostenpflichtigen Tools Claude gar nicht erst angezeigt.",
    },
    {
      q: "Funktioniert der Konnektor in der Claude-App auf dem Smartphone?",
      a: "Ja. Laut Anthropic steht ein verbundener Remote-Konnektor im Web, am Desktop und mobil zur Verfügung. Sie richten ihn einmal ein und schalten ihn pro Chat ein.",
    },
    {
      q: "Wie entziehe ich Claude den Zugriff vollständig?",
      a: "Entfernen Sie AutoSEO in Claude unter Customize → Connectors und klicken Sie in AutoSEO unter Settings → API & MCP → Connected apps auf Disconnect; damit werden alle Tokens der App sofort widerrufen. Bei Claude Code führen Sie zusätzlich claude mcp remove autoseo aus.",
    },
  ],
  sources: [
    { label: "Claude Help Center: Get started with custom connectors using remote MCP (2026)", href: "https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp" },
    { label: "Claude docs: Add a connector that isn't in the directory (2026)", href: "https://claude.com/docs/connectors/custom/add-unlisted" },
    { label: "Claude docs: Get started with connectors (2026)", href: "https://claude.com/docs/connectors/getting-started" },
    { label: "Claude docs: Authentication for connectors (2026)", href: "https://claude.com/docs/connectors/building/authentication" },
    { label: "Anthropic: IP addresses (2026)", href: "https://platform.claude.com/docs/en/api/ip-addresses" },
    { label: "Claude Code docs: Connect Claude Code to tools via MCP (2026)", href: "https://code.claude.com/docs/en/mcp" },
    { label: "Claude Code docs: Discover and install plugins (2026)", href: "https://code.claude.com/docs/en/discover-plugins" },
    { label: "Claude Code docs: Skills (2026)", href: "https://code.claude.com/docs/en/skills" },
    { label: "Model Context Protocol: Authorization, Spezifikation 2025-11-25 (2025)", href: "https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization" },
    { label: "Model Context Protocol: Transports, Spezifikation 2025-11-25 (2025)", href: "https://modelcontextprotocol.io/specification/2025-11-25/basic/transports" },
    { label: "IETF RFC 9728: OAuth 2.0 Protected Resource Metadata (2025)", href: "https://www.rfc-editor.org/rfc/rfc9728" },
    { label: "IETF RFC 7591: OAuth 2.0 Dynamic Client Registration Protocol (2015)", href: "https://www.rfc-editor.org/rfc/rfc7591" },
  ],
};
