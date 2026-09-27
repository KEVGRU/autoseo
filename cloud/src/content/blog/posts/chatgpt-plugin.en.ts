import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "chatgpt-plugin",
  title: "ChatGPT plugin for AutoSEO: how to connect it via MCP",
  description:
    "ChatGPT's 2023 plugins are gone; today's plugins run on MCP. Connect AutoSEO to ChatGPT, Codex, Cursor and VS Code, with safe scopes and example prompts.",
  date: "2026-09-26",
  authorSlug: "autoseo-team",
  tags: ["mcp", "chatgpt", "how-to"],
  readingMinutes: 11,
  lead:
    "There is no 2023-style ChatGPT plugin to install: OpenAI wound down the original plugin beta in spring 2024, and the “plugins” ChatGPT shows since July 2026 are built on the Model Context Protocol (MCP). To connect AutoSEO, add its MCP server (`<your instance URL>/api/mcp`, shown under **Settings → API & MCP**) as a developer-mode app in ChatGPT on the web and approve access with OAuth. The same URL works in OpenAI Codex, Cursor and VS Code, with OAuth or a scoped API key.",
  blocks: [
    { type: "h2", text: "What happened to ChatGPT plugins?" },
    {
      type: "p",
      text: "The original plugins, launched in March 2023, were APIs described by an OpenAPI spec and a manifest file ([OpenAI, 2023](https://openai.com/index/chatgpt-plugins/)). OpenAI retired them in spring 2024 in favor of GPTs ([OpenAI Help Center, archived 2024](https://web.archive.org/web/20240223132553/https://help.openai.com/en/articles/8988022-winding-down-the-chatgpt-plugins-beta)).",
    },
    {
      type: "p",
      text: "What followed runs on MCP. In September 2025 OpenAI announced developer mode, full MCP client support for read and write tools ([OpenAI Developer Community, 2025](https://community.openai.com/t/mcp-server-tools-now-in-chatgpt-developer-mode/1357233)), then apps and the Apps SDK ([OpenAI, 2025](https://openai.com/index/introducing-apps-in-chatgpt/)). In July 2026 the App Directory became the Plugin Directory ([ChatGPT release notes, 2026](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)). A plugin today can bundle skills, an MCP server and optional UI, and ChatGPT and Codex share one directory ([OpenAI, 2026](https://developers.openai.com/plugins/concepts/plugins)). For AutoSEO, the part that matters is the MCP server.",
    },
    {
      type: "table",
      head: ["Claim", "What the source says", "Source (year)"],
      rows: [
        [
          "The original plugins used OpenAPI",
          "Launched 23 March 2023; a plugin is an API with an OpenAPI spec and a manifest file",
          "[OpenAI](https://openai.com/index/chatgpt-plugins/) (2023)",
        ],
        [
          "The original plugins are retired",
          "New plugin conversations disabled on 19 March 2024; existing ones available until 9 April 2024",
          "[OpenAI Help Center, archived](https://web.archive.org/web/20240223132553/https://help.openai.com/en/articles/8988022-winding-down-the-chatgpt-plugins-beta) (2024)",
        ],
        [
          "Apps are built on MCP",
          "The Apps SDK builds on the Model Context Protocol; launched 6 October 2025",
          "[OpenAI](https://openai.com/index/introducing-apps-in-chatgpt/) (2025)",
        ],
        [
          "“Plugins” is the current name",
          "App Directory replaced by the Plugin Directory on 9 July 2026; existing app connections unaffected",
          "[ChatGPT release notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes) (2026)",
        ],
        [
          "Write actions are confirmed",
          "Developer mode supports read and write MCP tools; writes need confirmation by default, and tools without `readOnlyHint` count as writes",
          "[OpenAI developer docs](https://developers.openai.com/api/docs/guides/developer-mode) (2026)",
        ],
      ],
      caption: "Status as of 26 September 2026.",
    },

    { type: "h2", text: "What do you need before you connect AutoSEO?" },
    {
      type: "ul",
      items: [
        "**The MCP URL.** In AutoSEO, **Settings → API & MCP** shows your instance URL plus `/api/mcp` in the MCP Server panel. On [AutoSEO Cloud](/pricing) you copy it from your workspace; a [self-hosted](/self-hosting) instance uses your own domain.",
        "**Public HTTPS for ChatGPT.** ChatGPT only connects to remote MCP servers ([OpenAI Help Center, 2026](https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt)), and AutoSEO's settings page warns when an instance runs on localhost. Codex, Cursor and VS Code run on your machine and can reach a local instance.",
        "**An AutoSEO role that may connect apps.** Approving an OAuth connection requires the workspace permission **Integrations, API keys, model settings**, the same one needed for API keys.",
        "**A ChatGPT plan with developer mode.** OpenAI's developer docs list Plus, Pro, Business, Enterprise and Edu on the web ([OpenAI, 2026](https://developers.openai.com/api/docs/guides/developer-mode)). The Help Center says full MCP support including writes is in beta for Business, Enterprise and Edu, that Pro users can connect servers with read/fetch permissions, and that workspace admins enable developer mode first. The pages don't fully agree, so check what your account shows.",
      ],
    },

    { type: "h2", text: "How do you add AutoSEO to ChatGPT?" },
    {
      type: "p",
      text: "As of September 2026, OpenAI documents this flow ([OpenAI, 2026](https://developers.openai.com/api/docs/guides/developer-mode)):",
    },
    {
      type: "ol",
      items: [
        "On chatgpt.com, open **Settings → Security and login** and turn on **Developer mode**. In Business, Enterprise and Edu workspaces an admin may have to allow it first under **Workspace settings → Permissions & roles**.",
        "Go to [ChatGPT Plugins](https://chatgpt.com/plugins) and select the plus button to create a developer-mode app for a remote MCP server.",
        "Name it “AutoSEO”, add a short description and paste your MCP URL under **Connection**.",
        "Choose OAuth as the authentication. ChatGPT reads AutoSEO's metadata, registers itself and sends you to AutoSEO's consent page.",
        "Pick the workspace, the projects (or **All my projects**) and the permissions, then click **Allow access**. ChatGPT then scans the tools.",
        "In a new chat, open the **+** menu, choose **Developer mode** and select AutoSEO, or @-mention it.",
      ],
    },
    {
      type: "p",
      text: "Older guides, including the steps in AutoSEO's own settings page, still say **Settings → Apps & Connectors**. OpenAI's current docs place the toggle under **Security and login**, and apps became plugins in July 2026, so follow OpenAI's wording if menus don't match.",
    },
    {
      type: "callout",
      tone: "info",
      title: "Why no API key is needed in ChatGPT",
      text: "AutoSEO publishes protected resource and authorization server metadata, accepts Client ID Metadata Documents and dynamic client registration, requires PKCE with S256 and returns the `iss` parameter in authorization responses. ChatGPT supports Client ID Metadata Documents, dynamic registration and predefined clients; AutoSEO advertises support for metadata documents, which ChatGPT prefers when a server offers them ([OpenAI, 2026](https://developers.openai.com/plugins/build/auth); [MCP spec, 2025](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)). The server is stateless Streamable HTTP and negotiates MCP revisions 2024-11-05 through 2025-11-25.",
    },

    { type: "h2", text: "How do you connect Codex, Cursor and VS Code?" },
    {
      type: "p",
      text: "These clients run locally, so an API key is the simplest route. Create one under **Settings → API & MCP → API Keys** (keys start with `as_live_`), name it after the client and keep it in an environment variable, not in a file you might commit.",
    },
    { type: "h3", text: "OpenAI Codex (CLI, IDE extension, desktop app)" },
    {
      type: "p",
      text: "Codex stores MCP servers in `~/.codex/config.toml`, shared by the CLI, the IDE extension and the ChatGPT desktop app. An HTTP server takes a `url` and an optional `bearer_token_env_var`; OAuth runs through `codex mcp login` ([OpenAI Codex docs, 2026](https://learn.chatgpt.com/docs/extend/mcp)).",
    },
    {
      type: "code",
      lang: "bash",
      title: "Option A: OAuth sign-in in the browser",
      code: "codex mcp add autoseo --url https://your-autoseo.example.com/api/mcp\ncodex mcp login autoseo",
    },
    {
      type: "code",
      lang: "toml",
      title: "Option B: API key from an environment variable (~/.codex/config.toml)",
      code: "# export AUTOSEO_API_KEY=\"as_live_...\" in your shell profile first\n[mcp_servers.autoseo]\nurl = \"https://your-autoseo.example.com/api/mcp\"\nbearer_token_env_var = \"AUTOSEO_API_KEY\"\ndefault_tools_approval_mode = \"writes\"",
    },
    {
      type: "p",
      text: "In `writes` mode Codex asks before any tool not marked read-only. AutoSEO marks every tool that changes data or can cost money that way, so reads run freely and changes wait for you.",
    },
    {
      type: "p",
      text: "AutoSEO also serves a plugin bundle with the MCP server and 17 skills, such as a site audit and an AI visibility report. Download `<your instance URL>/api/plugin/autoseo-marketplace.zip`, unzip it, run `codex plugin marketplace add ./autoseo-marketplace` and install AutoSEO from `/plugins` in the Codex CLI; plugins aren't available in the IDE extension ([OpenAI, 2026](https://learn.chatgpt.com/docs/plugins)). See [AI SEO agent](/ai-seo-agent) for what the skills do.",
    },
    { type: "h3", text: "Cursor" },
    {
      type: "p",
      text: "Add the server to `~/.cursor/mcp.json` (all projects) or `.cursor/mcp.json` (one project). Cursor interpolates environment variables, supports OAuth for remote servers, asks before running MCP tools by default and toggles servers in the **Customize** sidebar ([Cursor docs, 2026](https://cursor.com/docs/mcp)).",
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
      text: "For GitHub Copilot's agent mode, add `.vscode/mcp.json` or run **MCP: Add Server**. An input with `password: true` makes VS Code prompt for the key instead of storing it in the file ([VS Code docs, 2026](https://code.visualstudio.com/docs/agent-customization/mcp-servers)).",
    },
    {
      type: "code",
      lang: "json",
      title: ".vscode/mcp.json",
      code: "{\n  \"servers\": {\n    \"autoseo\": {\n      \"type\": \"http\",\n      \"url\": \"https://your-autoseo.example.com/api/mcp\",\n      \"headers\": { \"Authorization\": \"Bearer ${input:autoseo-api-key}\" }\n    }\n  },\n  \"inputs\": [\n    { \"type\": \"promptString\", \"id\": \"autoseo-api-key\", \"description\": \"AutoSEO API key\", \"password\": true }\n  ]\n}",
    },

    { type: "h2", text: "What can you ask once AutoSEO is connected?" },
    {
      type: "p",
      text: "At the time of writing, AutoSEO's [MCP server](/mcp-server) registers more than 110 tools, grouped by area from AI visibility and competitors to Search Console, site audits, reports and CMS edit proposals; **Settings → API & MCP** lists each with its scope. The server tells the model to start with `list_projects` and `get_project_context`, so you rarely need a project ID.",
    },
    {
      type: "table",
      head: ["Prompt", "Tool(s) the model should call", "Scope"],
      rows: [
        ["“How visible were we in ChatGPT in the last 30 days compared with the 30 before?”", "`get_visibility_metrics`, filtered by model", "Read"],
        ["“Which prompts name competitors but not us, and which sources cite them but never us?”", "`get_competitor_gap_analysis`", "Read"],
        ["“Which searches did AI engines run in the background for our prompts? Group them into content ideas.”", "`get_query_fanouts`", "Read"],
        ["“Which domains are cited most in AI answers about our category, and which are third-party?”", "`get_top_sources`", "Read"],
        ["“Show the full ChatGPT answer to our ‘best CRM for agencies’ prompt and its sources.”", "`get_answer_content`", "Read"],
        ["“How do AI answers describe us compared with Competitor X?”", "`get_sentiment_overview`, `get_competitor_h2h`", "Read"],
        ["“List the highest-impact open optimization tasks with their evidence.”", "`list_tasks`, `get_task_details`", "Read"],
        ["“Which Search Console queries rank at positions 5 to 20 with many impressions?”", "`get_search_console_striking_distance`", "Read"],
        ["“Set the comparison-page task to in progress.”", "`update_task_status`", "Write"],
      ],
      caption: "If the model picks the wrong tool, name the tool in your prompt, as OpenAI's developer mode guide recommends.",
    },
    {
      type: "p",
      text: "Visibility numbers come from AutoSEO's own prompt tracking ([ChatGPT visibility tracking](/ai-visibility-tracking/chatgpt)); scripts and dashboards get the same data from the [REST API](/rest-api).",
    },

    { type: "h2", text: "How do you keep the connection safe?" },
    {
      type: "p",
      text: "AutoSEO hides what a credential can't use: `tools/list` returns only tools whose scope the connection holds, and every call is checked again against scope and role.",
    },
    {
      type: "ul",
      items: [
        "**Read**: projects, prompts, visibility metrics, competitors, sources, tasks and reports; always included. A read-only credential sees just over half of the tools, none of which change data or spend money.",
        "**Write**: create projects, add prompts, update tasks, save reports and propose CMS edits, bounded by your role. CMS proposals change nothing on the live site until a project member applies them.",
        "**Spend credits**: every tool that can cost money, such as DataForSEO research, AI generation, audits and tracking runs. They also need the matching role permission.",
        "**Export**: bulk export of prompts, answers and results through the REST API; no MCP tool requires it today.",
      ],
    },
    {
      type: "p",
      text: "For analysis in ChatGPT, approve only Read on the consent screen and limit the grant to the projects you need. Add Write when the assistant should change things, and Spend only for sessions with planned paid research.",
    },
    {
      type: "p",
      text: "Every AutoSEO tool that writes or can incur cost is published without `readOnlyHint`, so ChatGPT asks before running it by default. Tool results contain third-party text such as AI answers, so treat them as data; OpenAI warns about prompt injection through connected servers ([OpenAI Help Center, 2026](https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt)). Whether OpenAI may train on what ChatGPT reads from apps depends on your plan and settings ([OpenAI Help Center, 2026](https://help.openai.com/en/articles/11487775-connected-apps-in-chatgpt)).",
    },
    {
      type: "p",
      text: "To revoke access, open **Settings → API & MCP**: **Connected apps → Disconnect** immediately revokes all tokens of that app, and **Revoke key** ends an API key. OAuth access tokens last one hour, refresh tokens roll over 30 days, and reusing a rotated refresh token revokes the whole grant.",
    },

    { type: "h2", text: "What if the connection doesn't work?" },
    {
      type: "table",
      head: ["Symptom", "Likely cause", "Fix"],
      rows: [
        [
          "ChatGPT can't connect; the instance runs on localhost or a private address",
          "ChatGPT only connects to remote servers",
          "Serve AutoSEO over public HTTPS (OpenAI's Secure MCP Tunnel for private servers isn't covered by AutoSEO's docs)",
        ],
        [
          "Consent page says “You can't connect apps”",
          "Your role lacks **Integrations, API keys, model settings**",
          "Ask a workspace owner or admin",
        ],
        [
          "“Authorization request rejected” with `invalid_client`",
          "The client registration behind this connection no longer exists on the instance",
          "Delete and recreate the app in ChatGPT so it registers again",
        ],
        [
          "401 “Missing credentials” in Codex, Cursor or VS Code",
          "No token sent: the environment variable isn't set where the client started, or OAuth login never ran",
          "Export the variable and restart the client, or run `codex mcp login autoseo`",
        ],
        [
          "401 “The credential is invalid, expired or revoked”",
          "Key revoked, app disconnected, or refresh token unused for over 30 days",
          "Create a new key or reconnect",
        ],
        [
          "Tool error about a missing “write” or “spend” scope",
          "The key or grant lacks that scope",
          "Use a key with the scope or reconnect and allow it; add Spend only for paid research",
        ],
        [
          "Write or paid tools don't appear in ChatGPT",
          "AutoSEO lists only tools the grant allows, and ChatGPT keeps the list from its last scan",
          "Reconnect with the scope, then select **Refresh** on the app",
        ],
        [
          "“Rate limit exceeded (120 requests/minute)”",
          "Per-credential limit; 120 is the default, admins can change it",
          "Wait for the retry time; ask for fewer, broader lookups",
        ],
      ],
    },

    { type: "h2", text: "What does a first session look like?" },
    {
      type: "p",
      text: "**Example (hypothetical):** a marketing lead at Northwind Tools, a fictional B2B software company, uses ChatGPT Plus and a self-hosted AutoSEO that tracks 60 prompts across ChatGPT, Perplexity and Google AI Overviews. All numbers are illustrative, not real data.",
    },
    {
      type: "ol",
      items: [
        "She adds AutoSEO in developer mode and grants **Read** for one project only.",
        "“Compare our ChatGPT visibility for the last 30 days with the 30 before.” ChatGPT calls `list_projects`, then `get_visibility_metrics`: visibility fell from 24% to 19% (illustrative).",
        "“Where are competitors named instead of us?” `get_competitor_gap_analysis` returns 11 prompts (illustrative) naming one competitor but not Northwind, plus two review sites that cite only that competitor.",
        "“What did ChatGPT search for on those prompts?” `get_query_fanouts` shows sub-queries about pricing and alternatives, pointing to a missing comparison page.",
        "`list_tasks` surfaces a matching content task. In Codex, where her key has Read and Write, she asks to set it to in progress; Codex pauses for approval because `update_task_status` is a write tool.",
      ],
    },
    {
      type: "p",
      text: "The session never needed Spend: all data came from tracking runs AutoSEO had already completed.",
    },

    { type: "h2", text: "What does this mean for you?" },
    {
      type: "ul",
      items: [
        "Treat anything mentioning an OpenAPI manifest or the plugin store as the retired 2023 system; current ChatGPT plugins are MCP-based.",
        "Connect ChatGPT with OAuth and a read-only, project-limited grant first; widen it only when a task needs it.",
        "Give each local client its own named API key in an environment variable, and revoke keys you no longer use.",
        "Leave **Spend credits** off by default and keep write confirmations on.",
        "Recheck the setup when ChatGPT's menus change: in three years the names went from plugins to GPTs, connectors, apps and back to plugins.",
        "Keep two questions apart: this connection lets ChatGPT read your AutoSEO data, while [ChatGPT visibility tracking](/ai-visibility-tracking/chatgpt) measures how ChatGPT talks about your brand. The [Claude connector guide](/blog/claude-connector) covers the same setup for Claude.",
      ],
    },
    {
      type: "callout",
      tone: "info",
      title: "Method and limitations",
      text: "This guide summarizes public documentation from OpenAI, Cursor, Microsoft and the MCP specification as retrieved on 26 September 2026, plus AutoSEO's open-source code. AutoSEO has no proprietary data on ChatGPT usage. OpenAI's developer docs and Help Center disagree on plan eligibility and the location of the developer mode toggle, menus change often, and AutoSEO's tool count grows with releases. AutoSEO implements MCP revisions up to 2025-11-25, while the newest specification revision is 2026-07-28, so compatibility relies on clients negotiating an older revision.",
    },
  ],
  faq: [
    {
      q: "Do I need a Plugin Directory listing to use AutoSEO in ChatGPT?",
      a: "No. Developer mode lets you connect any remote MCP server you trust as your own app. Every AutoSEO instance has its own URL, so connecting your instance directly is the route AutoSEO's settings page documents, for self-hosted instances and AutoSEO Cloud alike.",
    },
    {
      q: "Does the connection work in the ChatGPT mobile app?",
      a: "Not for developer-mode apps. OpenAI's Help Center states that MCP apps in developer mode are web only, so set up and use the connection on chatgpt.com.",
    },
    {
      q: "Can deep research or agent mode use AutoSEO?",
      a: "OpenAI's Help Center says deep research can use custom apps for read and fetch actions but not for writes, and agent mode does not use custom apps. For AutoSEO, only the read tools are candidates for a deep research report.",
    },
    {
      q: "Do I need an API key to connect ChatGPT?",
      a: "No. ChatGPT's developer mode supports OAuth, no authentication and mixed authentication, and AutoSEO uses OAuth, so you approve access on AutoSEO's consent page. API keys are for Codex, Cursor, VS Code, scripts and the REST API.",
    },
    {
      q: "Does OpenAI train on data that ChatGPT reads from AutoSEO?",
      a: "According to OpenAI's Help Center, information accessed from apps is not used for training by default on Business, Enterprise and Edu. On Free, Go, Plus and Pro it may be used if “Improve the model for everyone” is on. Limit the grant to the projects you need.",
    },
  ],
  sources: [
    { label: "OpenAI: ChatGPT plugins (2023)", href: "https://openai.com/index/chatgpt-plugins/" },
    {
      label: "OpenAI Help Center (archived): Winding down the ChatGPT plugins beta (2024)",
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
    { label: "Model Context Protocol: Authorization, revision 2025-11-25 (2025)", href: "https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization" },
  ],
};
