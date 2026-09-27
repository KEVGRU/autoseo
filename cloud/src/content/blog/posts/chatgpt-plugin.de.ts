import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "chatgpt-plugin",
  title: "ChatGPT-Plugin für AutoSEO: So verbinden Sie es per MCP",
  description:
    "Die ChatGPT-Plugins von 2023 sind Geschichte, heutige laufen über MCP. So binden Sie AutoSEO in ChatGPT, Codex, Cursor und VS Code ein – mit Scopes und Prompts.",
  date: "2026-09-26",
  authorSlug: "autoseo-team",
  tags: ["mcp", "chatgpt", "how-to"],
  readingMinutes: 12,
  lead:
    "Ein ChatGPT-Plugin im Stil von 2023 gibt es nicht mehr: OpenAI hat die ursprüngliche Plugin-Beta im Frühjahr 2024 eingestellt, und die „Plugins“, die ChatGPT seit Juli 2026 anzeigt, basieren auf dem Model Context Protocol (MCP). Um AutoSEO anzubinden, fügen Sie den MCP-Server Ihrer Instanz (`<your instance URL>/api/mcp`, zu finden unter **Settings → API & MCP**) in ChatGPT im Web als App im Entwicklermodus hinzu und bestätigen den Zugriff per OAuth. Dieselbe URL funktioniert in OpenAI Codex, Cursor und VS Code, wahlweise mit OAuth oder einem eingeschränkten API-Schlüssel.",
  blocks: [
    { type: "h2", text: "Was ist aus den ChatGPT-Plugins geworden?" },
    {
      type: "p",
      text: "Die ursprünglichen Plugins, gestartet im März 2023, waren APIs mit OpenAPI-Spezifikation und Manifest-Datei ([OpenAI, 2023](https://openai.com/index/chatgpt-plugins/)). Im Frühjahr 2024 stellte OpenAI sie zugunsten von GPTs ein ([OpenAI Help Center, archiviert 2024](https://web.archive.org/web/20240223132553/https://help.openai.com/en/articles/8988022-winding-down-the-chatgpt-plugins-beta)).",
    },
    {
      type: "p",
      text: "Alles, was danach kam, läuft über MCP. Im September 2025 kündigte OpenAI den Entwicklermodus an, also volle MCP-Client-Unterstützung für lesende und schreibende Tools ([OpenAI Developer Community, 2025](https://community.openai.com/t/mcp-server-tools-now-in-chatgpt-developer-mode/1357233)), danach Apps und das Apps SDK ([OpenAI, 2025](https://openai.com/index/introducing-apps-in-chatgpt/)). Im Juli 2026 wurde aus dem App Directory das Plugin Directory ([ChatGPT Release Notes, 2026](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)). Ein Plugin kann heute Skills, einen MCP-Server und eine optionale Oberfläche bündeln, und ChatGPT und Codex teilen sich ein Verzeichnis ([OpenAI, 2026](https://developers.openai.com/plugins/concepts/plugins)). Für AutoSEO zählt der MCP-Server.",
    },
    {
      type: "table",
      head: ["Aussage", "Was die Quelle sagt", "Quelle (Jahr)"],
      rows: [
        [
          "Die ursprünglichen Plugins nutzten OpenAPI",
          "Start am 23. März 2023; ein Plugin ist eine API mit OpenAPI-Spezifikation und Manifest-Datei",
          "[OpenAI](https://openai.com/index/chatgpt-plugins/) (2023)",
        ],
        [
          "Die ursprünglichen Plugins sind eingestellt",
          "Neue Plugin-Unterhaltungen ab 19. März 2024 deaktiviert; bestehende bis 9. April 2024 nutzbar",
          "[OpenAI Help Center, archiviert](https://web.archive.org/web/20240223132553/https://help.openai.com/en/articles/8988022-winding-down-the-chatgpt-plugins-beta) (2024)",
        ],
        [
          "Apps basieren auf MCP",
          "Das Apps SDK baut auf dem Model Context Protocol auf; Start am 6. Oktober 2025",
          "[OpenAI](https://openai.com/index/introducing-apps-in-chatgpt/) (2025)",
        ],
        [
          "„Plugins“ ist der aktuelle Name",
          "App Directory am 9. Juli 2026 durch das Plugin Directory ersetzt; bestehende App-Verbindungen bleiben unberührt",
          "[ChatGPT Release Notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes) (2026)",
        ],
        [
          "Schreibaktionen werden bestätigt",
          "Der Entwicklermodus unterstützt lesende und schreibende MCP-Tools; Schreibaktionen erfordern standardmäßig eine Bestätigung, Tools ohne `readOnlyHint` gelten als schreibend",
          "[OpenAI Developer Docs](https://developers.openai.com/api/docs/guides/developer-mode) (2026)",
        ],
      ],
      caption: "Stand: 26. September 2026.",
    },

    { type: "h2", text: "Was brauchen Sie, bevor Sie AutoSEO verbinden?" },
    {
      type: "ul",
      items: [
        "**Die MCP-URL.** In AutoSEO zeigt **Settings → API & MCP** im Bereich „MCP Server“ Ihre Instanz-URL plus `/api/mcp`. Bei [AutoSEO Cloud](/pricing) kopieren Sie die URL aus Ihrem Workspace, eine [selbst gehostete](/self-hosting) Instanz nutzt Ihre eigene Domain.",
        "**Öffentliches HTTPS für ChatGPT.** ChatGPT verbindet sich nur mit entfernten MCP-Servern ([OpenAI Help Center, 2026](https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt)), und die AutoSEO-Einstellungen warnen, wenn eine Instanz auf localhost läuft. Codex, Cursor und VS Code laufen auf Ihrem Rechner und erreichen auch eine lokale Instanz.",
        "**Eine AutoSEO-Rolle, die Apps verbinden darf.** Die Freigabe einer OAuth-Verbindung erfordert die Workspace-Berechtigung **Integrations, API keys, model settings**, dieselbe wie für API-Schlüssel.",
        "**Ein ChatGPT-Tarif mit Entwicklermodus.** Die Entwicklerdokumentation von OpenAI nennt Plus, Pro, Business, Enterprise und Edu im Web ([OpenAI, 2026](https://developers.openai.com/api/docs/guides/developer-mode)). Laut Help Center ist volle MCP-Unterstützung inklusive Schreibaktionen für Business, Enterprise und Edu in der Beta, Pro-Nutzer können Server mit Lese- und Fetch-Rechten verbinden, und in Workspaces aktivieren Admins den Entwicklermodus zuerst. Die Seiten widersprechen sich teilweise; maßgeblich ist, was Ihr Konto anzeigt.",
      ],
    },

    { type: "h2", text: "Wie fügen Sie AutoSEO in ChatGPT hinzu?" },
    {
      type: "p",
      text: "Stand September 2026 beschreibt OpenAI diesen Ablauf ([OpenAI, 2026](https://developers.openai.com/api/docs/guides/developer-mode)):",
    },
    {
      type: "ol",
      items: [
        "Öffnen Sie auf chatgpt.com **Settings → Security and login** und aktivieren Sie **Developer mode**. In Business-, Enterprise- und Edu-Workspaces muss ein Admin das eventuell zuerst unter **Workspace settings → Permissions & roles** erlauben.",
        "Rufen Sie [ChatGPT Plugins](https://chatgpt.com/plugins) auf und wählen Sie das Plus-Symbol, um eine Entwicklermodus-App für einen entfernten MCP-Server anzulegen.",
        "Nennen Sie sie „AutoSEO“, ergänzen Sie eine kurze Beschreibung und fügen Sie unter **Connection** Ihre MCP-URL ein.",
        "Wählen Sie OAuth als Authentifizierung. ChatGPT liest die Metadaten von AutoSEO, registriert sich und leitet Sie auf die Zustimmungsseite von AutoSEO weiter.",
        "Wählen Sie Workspace, Projekte (oder **All my projects**) und Berechtigungen und klicken Sie auf **Allow access**. Anschließend liest ChatGPT die Tools ein.",
        "Öffnen Sie in einem neuen Chat das **+**-Menü, wählen Sie **Developer mode** und dann AutoSEO, oder erwähnen Sie die App per @.",
      ],
    },
    {
      type: "p",
      text: "Ältere Anleitungen, auch die Schritte in den AutoSEO-Einstellungen selbst, nennen noch **Settings → Apps & Connectors**. Die aktuelle OpenAI-Dokumentation verortet den Schalter unter **Security and login**, und seit Juli 2026 heißen Apps Plugins. Folgen Sie also den Bezeichnungen von OpenAI, wenn die Menüs abweichen.",
    },
    {
      type: "callout",
      tone: "info",
      title: "Warum ChatGPT keinen API-Schlüssel braucht",
      text: "AutoSEO veröffentlicht Metadaten für die geschützte Ressource und den Autorisierungsserver, akzeptiert Client ID Metadata Documents und dynamische Client-Registrierung, verlangt PKCE mit S256 und gibt den Parameter `iss` in Autorisierungsantworten zurück. ChatGPT unterstützt Client ID Metadata Documents, dynamische Registrierung und vorab angelegte Clients; AutoSEO kündigt die Unterstützung von Metadata Documents an, die ChatGPT bevorzugt, wenn ein Server sie anbietet ([OpenAI, 2026](https://developers.openai.com/plugins/build/auth); [MCP-Spezifikation, 2025](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)). Der Server arbeitet zustandslos über Streamable HTTP und handelt die MCP-Revisionen 2024-11-05 bis 2025-11-25 aus.",
    },

    { type: "h2", text: "Wie verbinden Sie Codex, Cursor und VS Code?" },
    {
      type: "p",
      text: "Diese Clients laufen lokal, daher ist ein API-Schlüssel der einfachste Weg. Legen Sie ihn unter **Settings → API & MCP → API Keys** an (Schlüssel beginnen mit `as_live_`), benennen Sie ihn nach dem Client und speichern Sie ihn in einer Umgebungsvariablen statt in einer Datei, die versehentlich im Repository landet.",
    },
    { type: "h3", text: "OpenAI Codex (CLI, IDE-Erweiterung, Desktop-App)" },
    {
      type: "p",
      text: "Codex speichert MCP-Server in `~/.codex/config.toml`; CLI, IDE-Erweiterung und ChatGPT-Desktop-App teilen sich diese Konfiguration. Ein HTTP-Server erhält eine `url` und optional `bearer_token_env_var`; OAuth läuft über `codex mcp login` ([OpenAI Codex Docs, 2026](https://learn.chatgpt.com/docs/extend/mcp)).",
    },
    {
      type: "code",
      lang: "bash",
      title: "Variante A: OAuth-Anmeldung im Browser",
      code: "codex mcp add autoseo --url https://your-autoseo.example.com/api/mcp\ncodex mcp login autoseo",
    },
    {
      type: "code",
      lang: "toml",
      title: "Variante B: API-Schlüssel aus einer Umgebungsvariablen (~/.codex/config.toml)",
      code: "# vorher im Shell-Profil: export AUTOSEO_API_KEY=\"as_live_...\"\n[mcp_servers.autoseo]\nurl = \"https://your-autoseo.example.com/api/mcp\"\nbearer_token_env_var = \"AUTOSEO_API_KEY\"\ndefault_tools_approval_mode = \"writes\"",
    },
    {
      type: "p",
      text: "Im Modus `writes` fragt Codex vor jedem Tool nach, das nicht als rein lesend markiert ist. AutoSEO markiert alle Tools, die Daten ändern oder Kosten verursachen können, entsprechend: Lesezugriffe laufen direkt, Änderungen warten auf Ihre Freigabe.",
    },
    {
      type: "p",
      text: "Zusätzlich liefert AutoSEO ein Plugin-Paket mit dem MCP-Server und 17 Skills, etwa einem Site-Audit und einem KI-Sichtbarkeitsbericht. Laden Sie `<your instance URL>/api/plugin/autoseo-marketplace.zip` herunter, entpacken Sie es, führen Sie `codex plugin marketplace add ./autoseo-marketplace` aus und installieren Sie AutoSEO über `/plugins` in der Codex CLI; in der IDE-Erweiterung sind Plugins nicht verfügbar ([OpenAI, 2026](https://learn.chatgpt.com/docs/plugins)). Was die Skills leisten, zeigt die Seite [KI-SEO-Agent](/ai-seo-agent).",
    },
    { type: "h3", text: "Cursor" },
    {
      type: "p",
      text: "Tragen Sie den Server in `~/.cursor/mcp.json` (alle Projekte) oder `.cursor/mcp.json` (ein Projekt) ein. Cursor setzt Umgebungsvariablen ein, unterstützt OAuth für entfernte Server, fragt standardmäßig vor MCP-Tool-Aufrufen nach und schaltet Server in der Seitenleiste **Customize** an und aus ([Cursor Docs, 2026](https://cursor.com/docs/mcp)).",
    },
    {
      type: "code",
      lang: "json",
      title: "~/.cursor/mcp.json",
      code: "{\n  \"mcpServers\": {\n    \"autoseo\": {\n      \"url\": \"https://your-autoseo.example.com/api/mcp\",\n      \"headers\": { \"Authorization\": \"Bearer ${env:AUTOSEO_API_KEY}\" }\n    }\n  }\n}",
    },
    { type: "h3", text: "VS Code" },
    {
      type: "p",
      text: "Für den Agent-Modus von GitHub Copilot legen Sie `.vscode/mcp.json` an oder nutzen den Befehl **MCP: Add Server**. Eine Eingabevariable mit `password: true` sorgt dafür, dass VS Code den Schlüssel abfragt, statt ihn in der Datei zu speichern ([VS Code Docs, 2026](https://code.visualstudio.com/docs/agent-customization/mcp-servers)).",
    },
    {
      type: "code",
      lang: "json",
      title: ".vscode/mcp.json",
      code: "{\n  \"servers\": {\n    \"autoseo\": {\n      \"type\": \"http\",\n      \"url\": \"https://your-autoseo.example.com/api/mcp\",\n      \"headers\": { \"Authorization\": \"Bearer ${input:autoseo-api-key}\" }\n    }\n  },\n  \"inputs\": [\n    { \"type\": \"promptString\", \"id\": \"autoseo-api-key\", \"description\": \"AutoSEO API key\", \"password\": true }\n  ]\n}",
    },

    { type: "h2", text: "Was können Sie fragen, sobald AutoSEO verbunden ist?" },
    {
      type: "p",
      text: "Zum Zeitpunkt dieses Beitrags registriert der [MCP-Server](/mcp-server) von AutoSEO mehr als 110 Tools, nach Bereichen gruppiert von KI-Sichtbarkeit und Wettbewerbern über Search Console und Site-Audits bis zu Berichten und CMS-Änderungsvorschlägen; **Settings → API & MCP** listet jedes Tool mit dem nötigen Scope. Der Server weist das Modell an, mit `list_projects` und `get_project_context` zu beginnen, sodass Sie selten eine Projekt-ID nennen müssen.",
    },
    {
      type: "table",
      head: ["Prompt", "Tool(s), die das Modell aufrufen sollte", "Scope"],
      rows: [
        ["„Wie sichtbar waren wir in den letzten 30 Tagen in ChatGPT, verglichen mit den 30 Tagen davor?“", "`get_visibility_metrics`, gefiltert nach Modell", "Read"],
        ["„Bei welchen Prompts werden Wettbewerber genannt, wir aber nicht, und welche Quellen zitieren nur sie?“", "`get_competitor_gap_analysis`", "Read"],
        ["„Welche Suchanfragen haben KI-Systeme im Hintergrund zu unseren Prompts ausgeführt? Fasse sie zu Content-Ideen zusammen.“", "`get_query_fanouts`", "Read"],
        ["„Welche Domains werden in KI-Antworten zu unserer Kategorie am häufigsten zitiert, und welche davon sind Dritte?“", "`get_top_sources`", "Read"],
        ["„Zeige die vollständige ChatGPT-Antwort auf unseren Prompt ‚bestes CRM für Agenturen‘ samt Quellen.“", "`get_answer_content`", "Read"],
        ["„Wie beschreiben KI-Antworten uns im Vergleich zu Wettbewerber X?“", "`get_sentiment_overview`, `get_competitor_h2h`", "Read"],
        ["„Liste die offenen Optimierungsaufgaben mit der größten Wirkung samt Belegen auf.“", "`list_tasks`, `get_task_details`", "Read"],
        ["„Welche Search-Console-Suchanfragen ranken auf Position 5 bis 20 mit vielen Impressionen?“", "`get_search_console_striking_distance`", "Read"],
        ["„Setze die Aufgabe zur Vergleichsseite auf ‚in Bearbeitung‘.“", "`update_task_status`", "Write"],
      ],
      caption: "Wählt das Modell das falsche Tool, nennen Sie das Tool im Prompt, wie es der Leitfaden von OpenAI zum Entwicklermodus empfiehlt.",
    },
    {
      type: "p",
      text: "Die Sichtbarkeitswerte stammen aus dem Prompt-Tracking von AutoSEO ([Sichtbarkeit in ChatGPT messen](/ai-visibility-tracking/chatgpt)); Skripte und Dashboards erhalten dieselben Daten über die [REST-API](/rest-api).",
    },

    { type: "h2", text: "Wie halten Sie die Verbindung sicher?" },
    {
      type: "p",
      text: "AutoSEO blendet aus, was ein Zugang nicht nutzen darf: `tools/list` liefert nur Tools, deren Scope die Verbindung besitzt, und jeder Aufruf wird erneut gegen Scope und Rolle geprüft.",
    },
    {
      type: "ul",
      items: [
        "**Read**: Projekte, Prompts, Sichtbarkeitskennzahlen, Wettbewerber, Quellen, Aufgaben und Berichte; immer enthalten. Ein rein lesender Zugang sieht gut die Hälfte der Tools, von denen keines Daten ändert oder Kosten verursacht.",
        "**Write**: Projekte anlegen, Prompts hinzufügen, Aufgaben aktualisieren, Berichte speichern und CMS-Änderungen vorschlagen, begrenzt durch Ihre Rolle. CMS-Vorschläge ändern nichts an der Live-Website, bis ein Projektmitglied sie übernimmt.",
        "**Spend credits**: alle Tools, die Geld kosten können, etwa DataForSEO-Recherchen, KI-Generierung, Audits und Tracking-Läufe. Sie erfordern zusätzlich die passende Rollenberechtigung.",
        "**Export**: Massenexport von Prompts, Antworten und Ergebnissen über die REST-API; derzeit setzt ihn kein MCP-Tool voraus.",
      ],
    },
    {
      type: "p",
      text: "Für Analysen in ChatGPT genügt auf der Zustimmungsseite Read, beschränkt auf die benötigten Projekte. Write ergänzen Sie, wenn der Assistent etwas ändern soll, Spend nur für Sitzungen mit geplanter kostenpflichtiger Recherche.",
    },
    {
      type: "p",
      text: "Jedes AutoSEO-Tool, das schreibt oder Kosten verursachen kann, wird ohne `readOnlyHint` veröffentlicht; ChatGPT fragt deshalb standardmäßig vor der Ausführung nach. Tool-Ergebnisse enthalten Texte Dritter, etwa KI-Antworten, und sind als Daten zu behandeln; OpenAI warnt vor Prompt Injection über verbundene Server ([OpenAI Help Center, 2026](https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt)). Ob OpenAI Inhalte aus Apps für das Training nutzen darf, hängt von Tarif und Einstellungen ab ([OpenAI Help Center, 2026](https://help.openai.com/en/articles/11487775-connected-apps-in-chatgpt)).",
    },
    {
      type: "p",
      text: "Zum Widerrufen öffnen Sie **Settings → API & MCP**: **Connected apps → Disconnect** widerruft sofort alle Tokens der App, **Revoke key** beendet einen API-Schlüssel. OAuth-Access-Tokens gelten eine Stunde, Refresh-Tokens rollierend 30 Tage, und die Wiederverwendung eines bereits rotierten Refresh-Tokens widerruft die gesamte Freigabe.",
    },

    { type: "h2", text: "Was tun, wenn die Verbindung nicht funktioniert?" },
    {
      type: "table",
      head: ["Symptom", "Wahrscheinliche Ursache", "Lösung"],
      rows: [
        [
          "ChatGPT verbindet sich nicht; die Instanz läuft auf localhost oder einer privaten Adresse",
          "ChatGPT verbindet sich nur mit entfernten Servern",
          "AutoSEO über öffentliches HTTPS bereitstellen (OpenAIs Secure MCP Tunnel für private Server behandelt die AutoSEO-Dokumentation nicht)",
        ],
        [
          "Die Zustimmungsseite meldet „You can't connect apps“",
          "Ihrer Rolle fehlt **Integrations, API keys, model settings**",
          "Workspace-Owner oder Admin fragen",
        ],
        [
          "„Authorization request rejected“ mit `invalid_client`",
          "Die Client-Registrierung hinter dieser Verbindung existiert auf der Instanz nicht mehr",
          "App in ChatGPT löschen und neu anlegen, damit sie sich neu registriert",
        ],
        [
          "401 „Missing credentials“ in Codex, Cursor oder VS Code",
          "Kein Token gesendet: Umgebungsvariable dort nicht gesetzt, wo der Client gestartet wurde, oder OAuth-Login nie ausgeführt",
          "Variable exportieren und Client neu starten oder `codex mcp login autoseo` ausführen",
        ],
        [
          "401 „The credential is invalid, expired or revoked“",
          "Schlüssel widerrufen, App getrennt oder Refresh-Token über 30 Tage ungenutzt",
          "Neuen Schlüssel anlegen oder neu verbinden",
        ],
        [
          "Tool-Fehler wegen fehlendem Scope „write“ oder „spend“",
          "Schlüssel oder Freigabe hat diesen Scope nicht",
          "Schlüssel mit dem Scope nutzen oder neu verbinden und erlauben; Spend nur für bezahlte Recherche",
        ],
        [
          "Schreibende oder kostenpflichtige Tools fehlen in ChatGPT",
          "AutoSEO listet nur freigegebene Tools, und ChatGPT behält die Liste des letzten Scans",
          "Mit dem Scope neu verbinden, dann bei der App **Refresh** wählen",
        ],
        [
          "„Rate limit exceeded (120 requests/minute)“",
          "Limit pro Zugang; 120 ist der Standard, Admins können ihn ändern",
          "Wartezeit abwarten; weniger, dafür breitere Abfragen stellen",
        ],
      ],
    },

    { type: "h2", text: "Wie sieht eine erste Sitzung aus?" },
    {
      type: "p",
      text: "**Beispiel (hypothetisch):** Die Marketingleiterin von Northwind Tools, einem fiktiven B2B-Softwareanbieter, nutzt ChatGPT Plus und eine selbst gehostete AutoSEO-Instanz, die 60 Prompts in ChatGPT, Perplexity und Google AI Overviews verfolgt. Alle Zahlen sind illustrativ, keine echten Daten.",
    },
    {
      type: "ol",
      items: [
        "Sie fügt AutoSEO im Entwicklermodus hinzu und erteilt **Read** nur für ein Projekt.",
        "„Vergleiche unsere ChatGPT-Sichtbarkeit der letzten 30 Tage mit den 30 Tagen davor.“ ChatGPT ruft `list_projects` und dann `get_visibility_metrics` auf: Die Sichtbarkeit sank von 24 % auf 19 % (illustrativ).",
        "„Wo werden Wettbewerber statt uns genannt?“ `get_competitor_gap_analysis` liefert 11 Prompts (illustrativ), in denen ein Wettbewerber vorkommt, Northwind aber nicht, dazu zwei Bewertungsportale, die nur diesen Wettbewerber zitieren.",
        "„Wonach hat ChatGPT bei diesen Prompts gesucht?“ `get_query_fanouts` zeigt Teilabfragen zu Preisen und Alternativen, ein Hinweis auf eine fehlende Vergleichsseite.",
        "`list_tasks` zeigt eine passende Content-Aufgabe. In Codex, wo ihr Schlüssel Read und Write hat, lässt sie die Aufgabe auf „in Bearbeitung“ setzen; Codex wartet auf ihre Freigabe, weil `update_task_status` ein schreibendes Tool ist.",
      ],
    },
    {
      type: "p",
      text: "Spend war in dieser Sitzung nie nötig: Alle Daten stammten aus Tracking-Läufen, die AutoSEO bereits abgeschlossen hatte.",
    },

    { type: "h2", text: "Was bedeutet das für Sie?" },
    {
      type: "ul",
      items: [
        "Alles, was ein OpenAPI-Manifest oder den Plugin-Store erwähnt, beschreibt das eingestellte System von 2023; aktuelle ChatGPT-Plugins basieren auf MCP.",
        "Verbinden Sie ChatGPT zuerst per OAuth mit einer rein lesenden, auf Projekte beschränkten Freigabe und erweitern Sie sie nur bei Bedarf.",
        "Geben Sie jedem lokalen Client einen eigenen, benannten API-Schlüssel in einer Umgebungsvariablen und widerrufen Sie Schlüssel, die Sie nicht mehr nutzen.",
        "Lassen Sie **Spend credits** standardmäßig aus und die Bestätigung von Schreibaktionen an.",
        "Prüfen Sie die Einrichtung, wenn sich die ChatGPT-Menüs ändern: In drei Jahren ging es von Plugins über GPTs, Konnektoren und Apps zurück zu Plugins.",
        "Trennen Sie zwei Fragen: Diese Verbindung lässt ChatGPT Ihre AutoSEO-Daten lesen, während [Sichtbarkeits-Tracking für ChatGPT](/ai-visibility-tracking/chatgpt) misst, wie ChatGPT über Ihre Marke spricht. Die [Anleitung zum Claude-Konnektor](/blog/claude-connector) beschreibt dieselbe Einrichtung für Claude.",
      ],
    },
    {
      type: "callout",
      tone: "info",
      title: "Methode und Grenzen",
      text: "Dieser Beitrag fasst öffentliche Dokumentation von OpenAI, Cursor, Microsoft und der MCP-Spezifikation (Abruf am 26. September 2026) sowie den Open-Source-Code von AutoSEO zusammen. AutoSEO verfügt über keine eigenen Daten zur ChatGPT-Nutzung. Entwicklerdokumentation und Help Center von OpenAI widersprechen sich bei den berechtigten Tarifen und beim Ort des Schalters für den Entwicklermodus, Menüs ändern sich häufig, und die Zahl der AutoSEO-Tools wächst mit jedem Release. AutoSEO implementiert MCP-Revisionen bis 2025-11-25, die neueste Revision der Spezifikation ist 2026-07-28; die Kompatibilität hängt also davon ab, dass Clients eine ältere Revision aushandeln.",
    },
  ],
  faq: [
    {
      q: "Brauche ich einen Eintrag im Plugin Directory, um AutoSEO in ChatGPT zu nutzen?",
      a: "Nein. Im Entwicklermodus können Sie jeden entfernten MCP-Server, dem Sie vertrauen, als eigene App verbinden. Jede AutoSEO-Instanz hat ihre eigene URL, daher ist die direkte Verbindung der Weg, den die AutoSEO-Einstellungen beschreiben, für selbst gehostete Instanzen wie für AutoSEO Cloud.",
    },
    {
      q: "Funktioniert die Verbindung in der ChatGPT-App auf dem Smartphone?",
      a: "Für Apps im Entwicklermodus nicht. Laut OpenAI Help Center sind MCP-Apps im Entwicklermodus nur im Web verfügbar; richten Sie die Verbindung daher auf chatgpt.com ein und nutzen Sie sie dort.",
    },
    {
      q: "Können Deep Research oder der Agent-Modus AutoSEO nutzen?",
      a: "Laut OpenAI Help Center kann Deep Research eigene Apps für Lese- und Fetch-Aktionen nutzen, nicht aber für Schreibaktionen; der Agent-Modus nutzt eigene Apps nicht. Für AutoSEO kommen also nur die lesenden Tools für einen Deep-Research-Bericht infrage.",
    },
    {
      q: "Brauche ich für ChatGPT einen API-Schlüssel?",
      a: "Nein. Der Entwicklermodus von ChatGPT unterstützt OAuth, keine Authentifizierung und gemischte Authentifizierung; AutoSEO nutzt OAuth, Sie bestätigen den Zugriff also auf der Zustimmungsseite von AutoSEO. API-Schlüssel sind für Codex, Cursor, VS Code, Skripte und die REST-API gedacht.",
    },
    {
      q: "Trainiert OpenAI mit Daten, die ChatGPT aus AutoSEO liest?",
      a: "Laut OpenAI Help Center werden Informationen aus Apps bei Business, Enterprise und Edu standardmäßig nicht für das Training genutzt. Bei Free, Go, Plus und Pro kann das geschehen, wenn „Improve the model for everyone“ aktiviert ist. Beschränken Sie die Freigabe daher auf die nötigen Projekte.",
    },
  ],
  sources: [
    { label: "OpenAI: ChatGPT plugins (2023)", href: "https://openai.com/index/chatgpt-plugins/" },
    {
      label: "OpenAI Help Center (archiviert): Winding down the ChatGPT plugins beta (2024)",
      href: "https://web.archive.org/web/20240223132553/https://help.openai.com/en/articles/8988022-winding-down-the-chatgpt-plugins-beta",
    },
    { label: "OpenAI Developer Community: MCP server tools now in ChatGPT, developer mode (2025)", href: "https://community.openai.com/t/mcp-server-tools-now-in-chatgpt-developer-mode/1357233" },
    { label: "OpenAI: Introducing apps in ChatGPT and the new Apps SDK (2025)", href: "https://openai.com/index/introducing-apps-in-chatgpt/" },
    { label: "OpenAI Help Center: ChatGPT release notes (2026)", href: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" },
    { label: "OpenAI: Plugin architecture (2026)", href: "https://developers.openai.com/plugins/concepts/plugins" },
    { label: "OpenAI: ChatGPT developer mode (2026)", href: "https://developers.openai.com/api/docs/guides/developer-mode" },
    { label: "OpenAI Help Center: Developer mode and MCP apps in ChatGPT (2026)", href: "https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt" },
    { label: "OpenAI Help Center: Connected apps in ChatGPT (2026)", href: "https://help.openai.com/en/articles/11487775-connected-apps-in-chatgpt" },
    { label: "OpenAI Plugins: Authentication (2026)", href: "https://developers.openai.com/plugins/build/auth" },
    { label: "OpenAI Codex: Model Context Protocol (2026)", href: "https://learn.chatgpt.com/docs/extend/mcp" },
    { label: "OpenAI Codex: Plugins (2026)", href: "https://learn.chatgpt.com/docs/plugins" },
    { label: "Cursor Docs: Model Context Protocol (2026)", href: "https://cursor.com/docs/mcp" },
    { label: "VS Code Docs: MCP servers (2026)", href: "https://code.visualstudio.com/docs/agent-customization/mcp-servers" },
    { label: "Model Context Protocol: Authorization, Revision 2025-11-25 (2025)", href: "https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization" },
  ],
};
