import "server-only";
import { S, type OpenApiOperation } from "../openapi-helpers";
import { aiTrafficInput, botTrafficInput } from "../traffic";

const { str, strN, num, int, bool, arr, obj } = S;

const engagementStats = obj({
  sessions: int,
  engagementRate: num,
  avgEngagementSeconds: num,
  pagesPerSession: num,
  conversionRate: num,
  conversions: num,
  revenue: num,
  revenuePerSession: num,
});
const period = obj({ from: str, to: str, days: int, previous: obj({ from: str, to: str }) });
const pagination = { type: ["object", "null"], properties: { page: int, limit: int, total: int, totalPages: int } };

/** REST v1 operations: AI (human) traffic and AI bot traffic. */
export const trafficOperations: OpenApiOperation[] = [
  {
    method: "get",
    path: "/projects/{projectId}/ai-traffic",
    operationId: "getAiTraffic",
    summary: "AI traffic (visitors from AI assistants)",
    description:
      "Sessions, conversions and revenue of visitors referred by ChatGPT, Perplexity, Gemini, Claude, Copilot & co., synced daily from Google Analytics 4, Matomo or Piwik PRO. Rows by AI platform (default), landing page, country or day; meta carries KPIs vs the previous period and the per-platform split. The period ends on the latest complete day (yesterday). `model` filters platform/page/country rows. 409 not_connected when no analytics source is connected (connect it in Analytics → Human Traffic → Settings).",
    tag: "AI Traffic",
    scope: "read",
    query: aiTrafficInput,
    data: arr({
      type: "object",
      description:
        "platform|page|country rows: key, label, platforms, sessions, share, engagedSessions, engagementRate, conversions, conversionRate, revenue, avgEngagementSeconds. day rows: date, sessions, byPlatform.",
    }),
    meta: {
      source: obj({ provider: str, label: str, property: strN, status: str, currency: str, lastSyncAt: strN, syncedThrough: strN, lastError: strN }),
      period,
      by: str,
      kpis: obj({
        sessions: int,
        sessionsChange: num,
        conversions: num,
        conversionsChange: num,
        revenue: num,
        revenueChange: num,
        conversionRate: num,
        aiShareOfAllSessions: num,
        allSessions: int,
        previous: obj({ sessions: int, conversions: num, revenue: num }),
      }),
      platforms: arr(obj({ platform: str, name: str, engine: strN, sessions: int, share: num, conversions: num, revenue: num })),
      benchmark: obj(
        {
          organicStatus: { type: "string", enum: ["ok", "unsupported", "error", "not_synced", "no_organic"] },
          headline: strN,
          note: strN,
          ai: engagementStats,
          organic: { ...engagementStats, type: ["object", "null"] },
          metrics: arr(
            obj({
              key: str,
              label: str,
              format: { type: "string", enum: ["percent", "seconds", "decimal", "currency"] },
              ai: num,
              organic: num,
              diffPct: num,
              leader: { type: ["string", "null"], enum: ["ai", "organic", "tie", null] },
            }),
          ),
        },
        { type: ["object", "null"], description: "AI visitors vs organic-search visitors (same source + period): engagement rate, avg. engagement time, pages/session, conversion rate, revenue/session." },
      ),
      hasData: bool,
    },
  },
  {
    method: "get",
    path: "/projects/{projectId}/bot-traffic",
    operationId: "getBotTraffic",
    summary: "AI bot traffic (crawler hits)",
    description:
      "Requests of AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, OAI-SearchBot…) from Cloudflare, Akamai, the Server Logs API or uploaded access logs, verified against the operators' IP ranges. Rows per bot (default), crawled page, page status breakdown, day, `never_visited` (known AI crawlers with no visit in the period, last visit ever and the robots.txt verdict from the latest crawlability check) or `not_cited` (pages crawled successfully but never cited in a tracked AI answer). meta.totals has hits, unique URLs and status classes. 409 not_connected when no log connector is set up and no data exists (set it up in Analytics → Bot Traffic → Sync).",
    tag: "AI Traffic",
    scope: "read",
    query: botTrafficInput,
    data: arr({
      type: "object",
      description:
        "bot: bot, company, purpose, visits, pages, previousVisits, change, verified, unverified, lastSeen · page: path, host, bots, visits, lastVisited · status: path, host, bots, breakdown[{status,count}], errors, total · day: date, visits, byBot · never_visited: token, name, company, purpose, lastSeen, robots, robotsRule · not_cited: path, host, bots, visits, lastVisited",
    }),
    meta: {
      period,
      by: str,
      totals: obj({ visits: int, previousVisits: int, uniqueUrls: int, ok: int, redirects: int, clientErrors: int, serverErrors: int, verified: int, unverified: int }),
      firstSeen: strN,
      hasData: bool,
      pagination,
      statusSummary: arr(obj({ status: str, count: int })),
      coverage: { type: "object", description: "never_visited: knownCrawlers, visiting, crawlabilityCheck · not_cited: crawledContentPages, citedOwnPages, notCited" },
    },
  },
];
