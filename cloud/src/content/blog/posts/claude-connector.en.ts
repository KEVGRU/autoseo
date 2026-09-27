import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "claude-connector",
  title: "How to connect AutoSEO to Claude and Claude Code via MCP",
  description:
    "Connect AutoSEO to Claude, Claude Desktop or Claude Code over MCP with OAuth: setup steps, safe scopes, fixes for common errors and prompts to try.",
  date: "2026-09-26",
  authorSlug: "autoseo-team",
  tags: ["mcp", "claude", "how-to"],
  readingMinutes: 11,
  lead:
    "Copy the MCP server URL from **Settings → API & MCP** in AutoSEO (always `<your instance URL>/api/mcp`), add it in Claude under **Customize → Connectors → Add custom connector** or run `claude mcp add --transport http autoseo <url>` in Claude Code, then approve access on AutoSEO's consent page. OAuth does the rest, limited to the workspace, projects and permissions you choose. For claude.ai and Claude Desktop, your instance must be reachable over public HTTPS, because those apps connect from Anthropic's cloud.",
  blocks: [
    { type: "h2", text: "What do you need before you connect?" },
    {
      type: "ul",
      items: [
        "**The MCP URL.** In AutoSEO, open **Settings → API & MCP**; the MCP Server panel shows your instance URL plus `/api/mcp`. On [AutoSEO Cloud](/pricing) you copy the URL shown in your workspace, on a [self-hosted](/self-hosting) instance it is your own domain.",
        "**Public HTTPS.** Claude calls custom connectors from Anthropic's infrastructure in claude.ai, Claude Desktop, Cowork and the mobile apps, so servers behind a VPN or on a private network won't connect ([Claude Help Center](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)).",
        "**The right AutoSEO role.** Approving an app requires the workspace permission **Integrations, API keys, model settings**, the same one needed for API keys.",
        "**A Claude plan with custom connectors.** Anthropic lists Free (one custom connector), Pro, Max, Team and Enterprise. On Team and Enterprise, Owners add custom connectors and members connect individually.",
      ],
    },

    { type: "h2", text: "How does the connection work under the hood?" },
    {
      type: "p",
      text: "AutoSEO's MCP server is a stateless Streamable HTTP endpoint: every JSON-RPC message is a POST to `/api/mcp`, answered with plain JSON and authenticated on its own. It uses no SSE stream and no session ID, which the [MCP transport spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports) allows. It negotiates the protocol revisions 2024-11-05, 2025-03-26, 2025-06-18 and 2025-11-25.",
    },
    {
      type: "p",
      text: "A request without a token gets a 401 whose `WWW-Authenticate` header points to the protected resource metadata ([RFC 9728](https://www.rfc-editor.org/rfc/rfc9728)). Claude then finds the authorization server, identifies itself with a Client ID Metadata Document or registers via dynamic client registration ([RFC 7591](https://www.rfc-editor.org/rfc/rfc7591)), both of which AutoSEO accepts, and runs an authorization-code flow with PKCE, where AutoSEO accepts only S256.",
    },
    {
      type: "table",
      head: ["Claim", "What the source says", "Source (year)"],
      rows: [
        [
          "Claude connects from Anthropic's cloud",
          "Custom connector traffic originates from Anthropic's infrastructure for every Claude client; the server must be publicly reachable",
          "[Claude Help Center](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp) (2026)",
        ],
        ["Which IPs to allow", "Outbound requests such as MCP tool calls come from `160.79.104.0/21`", "[Anthropic: IP addresses](https://platform.claude.com/docs/en/api/ip-addresses) (2026)"],
        [
          "Which scopes Claude requests",
          "Without a `scope` in the 401 challenge, Claude requests what `scopes_supported` in the resource metadata lists",
          "[Claude docs: Authentication](https://claude.com/docs/connectors/building/authentication) (2026)",
        ],
        [
          "Callback URLs",
          "Hosted apps redirect to `https://claude.ai/api/mcp/auth_callback`; Claude Code uses a loopback redirect",
          "[Claude docs: Authentication](https://claude.com/docs/connectors/building/authentication) (2026)",
        ],
        [
          "PKCE and registration",
          "Clients must use PKCE with S256; dynamic client registration is optional (MAY)",
          "[MCP spec 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization) (2025)",
        ],
      ],
      caption: "What official documentation says about the parts this setup relies on (checked September 2026).",
    },

    { type: "h2", text: "How do you add AutoSEO to claude.ai and Claude Desktop?" },
    {
      type: "p",
      text: "You configure a custom connector once; it then works on the web, in the desktop app and on mobile. As of September 2026 Anthropic calls the page **Customize → Connectors**; in the desktop app, **Customize** sits in the sidebar ([Claude docs](https://claude.com/docs/connectors/getting-started)). Older guides call it Settings → Connectors.",
    },
    {
      type: "ol",
      items: [
        "In Claude, open **Customize → Connectors** and choose **Add custom connector**.",
        "Name it `AutoSEO` and paste the MCP URL. Leave **Advanced settings** (OAuth client ID and secret) empty. If your dialog asks for an **OAuth client** option, keep **Use Claude's published identity**, the option Anthropic recommends: AutoSEO accepts Client ID Metadata Documents as well as dynamic registration, so **Register automatically** also works ([Claude docs](https://claude.com/docs/connectors/custom/add-unlisted)).",
        "Click **Add**, then **Connect**. AutoSEO's consent page opens in your browser.",
        "Check that **Redirects to** shows `claude.ai`, pick the workspace, the projects (**All my projects** or a selection) and the permissions, then click **Allow access**.",
        "In a chat, click **+**, open **Connectors** and switch AutoSEO on.",
      ],
    },
    {
      type: "p",
      text: "On Team and Enterprise, an Owner adds the connector under **Organization settings → Connectors** (**Add**, **Custom**, **Web**), and each member clicks **Connect** to authorize with their own AutoSEO account, so per-user roles stay intact.",
    },
    {
      type: "callout",
      tone: "tip",
      title: "Check the permission boxes before you allow access",
      text: "AutoSEO's metadata lists all four scopes and Claude requests what the metadata advertises, so expect **Read**, **Write**, **Spend credits** and **Export** to be pre-ticked. Untick what you don't need.",
    },

    { type: "h2", text: "How do you connect Claude Code?" },
    {
      type: "p",
      text: "Claude Code connects from your machine and runs OAuth with a loopback redirect ([Claude Code docs](https://code.claude.com/docs/en/mcp)). Replace the example domain with yours:",
    },
    { type: "code", lang: "bash", title: "Terminal", code: "claude mcp add --transport http autoseo https://seo.example.com/api/mcp" },
    {
      type: "p",
      text: "Then run `/mcp` inside Claude Code, select `autoseo` and authenticate, or run `claude mcp login autoseo` from a shell. The consent page now shows a `localhost` redirect host. `claude mcp list` confirms the connection.",
    },
    {
      type: "p",
      text: "The default is **local** scope (you, this project, stored in `~/.claude.json`). `--scope user` adds AutoSEO to every project; `--scope project` writes a `.mcp.json` your team commits, and each teammate signs in with their own account. Claude Code's tool search loads only tool names and server instructions at startup, which keeps a server with over 100 tools cheap on context.",
    },
    { type: "h3", text: "When is an API key the better choice?" },
    {
      type: "p",
      text: "For CI jobs, servers and headless runs without a browser, and as a fallback if OAuth against a local test instance gives you trouble. Create a key under **Settings → API & MCP → Create key**; AutoSEO shows it once and stores only its SHA-256 hash.",
    },
    {
      type: "code",
      lang: "bash",
      title: "Terminal",
      code: 'claude mcp add --transport http autoseo https://seo.example.com/api/mcp \\\n  --header "Authorization: Bearer <YOUR_API_KEY>"',
    },
    {
      type: "p",
      text: "In a shared `.mcp.json`, reference a variable instead of the key. Avoid reserved names such as `ANTHROPIC_API_KEY`, which Claude Code never sends to a remote server.",
    },
    {
      type: "code",
      lang: "json",
      title: ".mcp.json",
      code: '{\n  "mcpServers": {\n    "autoseo": {\n      "type": "http",\n      "url": "https://seo.example.com/api/mcp",\n      "headers": { "Authorization": "Bearer ${AUTOSEO_API_KEY}" }\n    }\n  }\n}',
    },
    { type: "h3", text: "What does the AutoSEO plugin add?" },
    {
      type: "p",
      text: "The plugin bundles the MCP server, preconfigured for your instance, with 17 skills such as `seo-audit`, `ai-visibility-report` and `competitor-gap`. On public HTTPS, add your instance's hosted `marketplace.json` ([Claude Code docs](https://code.claude.com/docs/en/discover-plugins)):",
    },
    {
      type: "code",
      lang: "bash",
      title: "Terminal",
      code: "claude plugin marketplace add https://seo.example.com/api/plugin/marketplace.json\nclaude plugin install autoseo@autoseo",
    },
    {
      type: "p",
      text: "Start a new session, authenticate via `/mcp` and call skills with the plugin namespace, for example `/autoseo:seo-audit` ([Claude Code docs](https://code.claude.com/docs/en/skills)). On `localhost` or plain HTTP, download the bundle from the **Agent setup** tab under Settings → API & MCP and add it as a local marketplace. A connector you already added in claude.ai also appears in `/mcp` when Claude Code uses the same claude.ai login.",
    },
    { type: "h3", text: "Can AutoSEO use your Claude Code the other way round?" },
    {
      type: "p",
      text: "Yes, as a separate feature. Under **Settings → Local Agents** you install a small background service on a machine with Claude Code or Codex. AutoSEO's [agent mode](/ai-seo-agent) and other AI features then run there on your subscription, with API keys as a fallback. The agent only makes outbound HTTPS requests, and agent chats reach the same MCP tools through a key that expires within six hours.",
    },

    { type: "h2", text: "Which permissions should you grant?" },
    {
      type: "table",
      head: ["Scope (label)", "What it allows", "When to grant it"],
      rows: [
        ["`read` (Read)", "Projects, prompts, visibility metrics, competitors, sources, tasks, reports", "Always included; enough for analysis"],
        ["`write` (Write)", "Changes such as adding prompts or updating tasks, bounded by your role", "When Claude should act, not only report"],
        ["`spend` (Spend credits)", "Tools that can cost money: DataForSEO research, AI generation, tracking runs, audits", "Per session, when you want paid research"],
        ["`export` (Export)", "Bulk export of prompts, answers and results", "Not for chat; no MCP tool requires it today"],
      ],
    },
    {
      type: "p",
      text: "AutoSEO offers over 100 MCP tools (the MCP Server panel in Settings → API & MCP shows the current count); roughly a third of them can incur cost. AutoSEO hides those unless the connection has the spend scope, and its server instructions tell Claude to prefer free tools and confirm large paid batches. Tools that change data or start paid runs also check your role on every call.",
    },
    {
      type: "ul",
      items: [
        "**Tokens:** access tokens expire after one hour and refresh automatically; refresh tokens roll over 30 days.",
        "**Revoking:** **Settings → API & MCP → Connected apps → Disconnect** revokes all tokens of an app immediately. Check this list after disconnecting in Claude, since a fresh connection can appear as its own entry.",
        "**Consent hygiene:** the consent page shows **Published by** and the publishing domain when the client identified itself with a metadata document, or **Unverified app** when it registered itself. Continue only if you just started the connection and the redirect host is `claude.ai` or `localhost`.",
        "**Tool approvals:** in Claude, set AutoSEO tools to **Always allow**, **Needs approval** or **Blocked** ([Claude docs](https://claude.com/docs/connectors/getting-started)); keep write and paid tools on approval.",
      ],
    },

    { type: "h2", text: "What can you ask Claude once AutoSEO is connected?" },
    {
      type: "p",
      text: "Ask in plain language; Claude picks the tools, usually starting with `list_projects` and `get_project_context` as AutoSEO's server instructions suggest.",
    },
    {
      type: "table",
      head: ["Ask Claude", "Tools it will likely call", "Scopes"],
      rows: [
        ["“How visible were we in AI answers over the last 30 days versus the period before?”", "`get_visibility_metrics`", "read"],
        ["“Rank us against tracked competitors by share of voice.”", "`get_competitor_ranking`", "read"],
        ["“Which prompts name a competitor but not us, and which sources cite them?”", "`get_competitor_gap_analysis`, `get_top_sources`", "read"],
        ["“Which sub-queries did the engines run for our prompts? Turn them into content ideas.”", "`get_query_fanouts`", "read"],
        ["“What do AI answers criticise about us?”", "`get_sentiment_overview`", "read"],
        ["“Can GPTBot, ClaudeBot and PerplexityBot reach our site? List critical fixes.”", "`run_crawlability_check`, `get_crawlability_check`", "read, write, spend"],
        ["“How many survey respondents found us via ChatGPT this quarter?”", "`get_attribution_summary`", "read"],
        ["“List open optimization tasks by impact and mark the first as in progress.”", "`list_tasks`, `update_task_status`", "read, write"],
      ],
      caption: "Tool names as of September 2026; the full list with scopes is in Settings → API & MCP.",
    },
    {
      type: "p",
      text: "Answers depend on the data behind them: tracked prompts for [AI visibility tracking](/ai-visibility-tracking), the check behind [AI crawlability](/ai-crawlability), survey or CRM data for attribution. The [MCP server](/mcp-server) and [REST API](/rest-api) pages list the same data for scripts. Measuring how Claude itself answers about your brand is a different feature: [Claude visibility tracking](/ai-visibility-tracking/claude).",
    },

    { type: "h2", text: "What does a first session look like?" },
    {
      type: "p",
      text: "Example: Lena, a hypothetical marketing lead at a project-management SaaS company, wants a weekly AI visibility check in Claude. All numbers are illustrative.",
    },
    {
      type: "ol",
      items: [
        "She adds AutoSEO as a custom connector on her Pro plan. On the consent page she selects only the product project and unticks Write, Spend credits and Export, so Claude sees only free read tools.",
        "She asks how visible the brand was over the last 30 days. Claude calls `get_visibility_metrics` and reports, say, 21% visibility, up from 18% (illustrative).",
        "“Where do competitors appear and we don't?” `get_competitor_gap_analysis` returns, for example, 12 such prompts (illustrative), and `get_top_sources` shows which comparison pages cite the rival.",
        "She has Claude turn the fan-out sub-queries behind those prompts (`get_query_fanouts`) into a content brief.",
        "For an AI crawler check she needs `run_crawlability_check`, which is missing because the connection lacks Write and Spend credits. She reconnects with both for this check, then reconnects with Read only.",
      ],
    },
    {
      type: "p",
      text: "The pattern: read-only by default, wider scopes for a specific task, then narrow again. In Claude Code, the `ai-visibility-report` skill packages a similar sequence.",
    },

    { type: "h2", text: "Why doesn't the connection work?" },
    {
      type: "table",
      head: ["Symptom", "Likely cause", "Fix"],
      rows: [
        [
          "claude.ai can't connect, Claude Code can",
          "Instance on `localhost`, a private network or behind a VPN",
          "Serve AutoSEO over public HTTPS; allow `160.79.104.0/21` in your firewall",
        ],
        [
          "401 “The credential is invalid, expired or revoked”",
          "App or key revoked in AutoSEO, or refresh token unused for 30 days",
          "Click **Reconnect** in Claude, or re-authenticate via `/mcp`; replace revoked keys",
        ],
        [
          "Claude Code fails with an API-key setup",
          "Header malformed, variable unset, or a reserved name read as empty",
          "Check `claude mcp get autoseo`; use `Authorization: Bearer as_live_…`",
        ],
        ["Consent page: “You can't connect apps”", "Role lacks **Integrations, API keys, model settings**", "Ask a workspace owner or admin"],
        ["Paid tools like `run_site_audit` are missing", "Grant has no **Spend credits** scope", "Disconnect, connect again, tick Spend credits (and Write)"],
        ["“Your role in this workspace does not allow …”", "Scope granted, role permission missing", "Ask an admin; roles are checked on every call"],
        ["“Rate limit exceeded (120 requests/minute)”", "Per-credential default limit", "Fewer, broader calls, or an admin raises the limit"],
        ["“Unknown client_id” on the consent page", "Stale registration; unapproved ones are removed after 30 days", "Remove the connector (or `claude mcp remove autoseo`) and add it again"],
      ],
      caption: "Messages as returned by AutoSEO's API and consent page (September 2026).",
    },

    { type: "h2", text: "What does this mean for you?" },
    {
      type: "ul",
      items: [
        "Connect read-only first; add Write or Spend credits per task, not permanently.",
        "Use OAuth for people and API keys for machines, kept in environment variables.",
        "Choose project access deliberately, especially in agency workspaces.",
        "Review **Connected apps** regularly and disconnect entries you don't recognise.",
        "In the terminal, install the plugin for the skills; to run AutoSEO's own AI on your Claude subscription, add a local agent.",
      ],
    },
    {
      type: "p",
      text: "The [ChatGPT guide](/blog/chatgpt-plugin) covers the same server in ChatGPT. Without an instance yet, [self-host AutoSEO](/self-hosting) or use [AutoSEO Cloud](/pricing); either way the MCP URL waits in Settings → API & MCP.",
    },
    {
      type: "callout",
      tone: "info",
      title: "Method and limitations",
      text: "This guide combines AutoSEO's source code (MCP server, OAuth, consent screen as of September 2026) with Anthropic's public documentation and the MCP specification. AutoSEO has no proprietary dataset and nothing was measured on Claude's side. Claude's menus change often, and Anthropic notes the connector dialog varies by organization. Tool counts change with releases; the live list is in Settings → API & MCP.",
    },
  ],
  faq: [
    {
      q: "Does the AutoSEO connector work on Claude's Free plan?",
      a: "Anthropic lists custom connectors on Free, Pro, Max, Team and Enterprise, with Free limited to one custom connector. Your instance still has to be reachable over public HTTPS.",
    },
    {
      q: "Do I need an API key to connect Claude?",
      a: "No. claude.ai, Claude Desktop and Claude Code sign in with OAuth and you approve access in AutoSEO. API keys are for headless setups such as CI jobs and are sent as an Authorization header.",
    },
    {
      q: "Can Claude spend money through my AutoSEO account?",
      a: "Only with the Spend credits scope and a role that allows paid research. Without that scope, the cost-incurring tools are not even listed to Claude.",
    },
    {
      q: "Does the connector work in the Claude mobile app?",
      a: "Yes. Per Anthropic's docs, a connected remote connector is available on web, desktop and mobile. Set it up once, then switch it on per chat.",
    },
    {
      q: "How do I remove Claude's access completely?",
      a: "Remove AutoSEO in Claude under Customize → Connectors, then click Disconnect under Settings → API & MCP → Connected apps in AutoSEO, which revokes all its tokens immediately. For Claude Code, also run claude mcp remove autoseo.",
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
    { label: "Model Context Protocol: Authorization, specification 2025-11-25 (2025)", href: "https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization" },
    { label: "Model Context Protocol: Transports, specification 2025-11-25 (2025)", href: "https://modelcontextprotocol.io/specification/2025-11-25/basic/transports" },
    { label: "IETF RFC 9728: OAuth 2.0 Protected Resource Metadata (2025)", href: "https://www.rfc-editor.org/rfc/rfc9728" },
    { label: "IETF RFC 7591: OAuth 2.0 Dynamic Client Registration Protocol (2015)", href: "https://www.rfc-editor.org/rfc/rfc7591" },
  ],
};
