import "server-only";
import { z } from "zod";
import { ApiError } from "@/server/api/errors";
import { aiTrafficForApi, aiTrafficInput, botTrafficForApi, botTrafficInput } from "@/server/api/traffic";
import { defineTool, type McpToolContext, type McpToolResult } from "../types";
import { mdTable, pct, projectIdInput, signed, toolProject } from "../helpers";

const RO = { readOnlyHint: true, openWorldHint: false } as const;
const ai = aiTrafficInput.shape;
const bot = botTrafficInput.shape;

/** not_connected → soft tool error with a deep link to where the source is configured. */
function notConnected(err: unknown, ctx: McpToolContext, projectId: string, path: string): McpToolResult | null {
  if (!(err instanceof ApiError) || err.code !== "not_connected") return null;
  const url = `${ctx.baseUrl}${path}`;
  return { text: `${err.message}\n\nSet it up here: ${url}`, data: { projectId, status: "not_connected", message: err.message, actionUrl: url }, isError: true };
}

const money = (v: number | null | undefined, cur: string) => (v == null ? "—" : `${Math.round(v).toLocaleString("en-US")} ${cur}`);

export const trafficTools = [
  defineTool({
    name: "get_ai_traffic",
    title: "AI traffic (visitors from AI assistants)",
    description:
      "Human visitors that AI assistants (ChatGPT, Perplexity, Gemini, Claude, Copilot…) sent to the website, from the connected Google Analytics 4, Matomo or Piwik PRO: sessions, conversions, revenue and share of all sessions vs the previous period, with rows by AI platform (default), landing page, country or day. Free; synced daily (period ends yesterday).",
    input: z.object({
      projectId: projectIdInput,
      timeframeDays: z.number().int().min(1).max(486).optional().describe("Look-back window in days (default 30)."),
      startDate: ai.startDate,
      endDate: ai.endDate,
      source: ai.source,
      by: ai.by,
      model: ai.model,
      limit: z.number().int().min(1).max(500).optional().describe("Max rows (default 25)."),
    }),
    scope: "read",
    annotations: RO,
    async handler(args, ctx) {
      const p = await toolProject(ctx, args.projectId);
      const url = `/p/${p.id}/analytics/traffic`;
      try {
        const r = await aiTrafficForApi(p.id, aiTrafficInput.parse({ ...args, projectId: undefined, limit: args.limit ?? 25 }));
        const k = r.kpis;
        const cur = r.source.currency;
        const head = `AI traffic — ${r.source.label}${r.source.property ? ` (${r.source.property})` : ""}, ${r.period.from} → ${r.period.to}: ${k.sessions.toLocaleString("en-US")} sessions${signed(k.sessionsChange, "%")}, ${k.conversions.toLocaleString("en-US")} conversions${signed(k.conversionsChange, "%")}, revenue ${money(k.revenue, cur)}${signed(k.revenueChange, "%")}. AI share of all sessions: ${pct(k.aiShareOfAllSessions)}; conversion rate ${pct(k.conversionRate)}.`;
        const table =
          r.by === "day"
            ? mdTable(r.rows, [
                ["date", (x) => x.date],
                ["sessions", (x) => x.sessions],
              ])
            : mdTable(r.rows, [
                [r.by, (x) => x.label],
                ["sessions", (x) => x.sessions],
                ["share %", (x) => x.share],
                ["engagement %", (x) => x.engagementRate],
                ["conversions", (x) => x.conversions],
                ["conv. rate %", (x) => x.conversionRate],
                ["revenue", (x) => x.revenue],
              ]);
        return {
          text: `${head}${r.benchmark?.headline ? ` ${r.benchmark.headline}` : r.benchmark && r.benchmark.organicStatus !== "ok" ? ` (AI vs organic benchmark: ${r.benchmark.organicStatus.replace(/_/g, " ")})` : ""}${r.hasData ? "" : "\n\nNo AI-referred sessions synced for this period yet."}\n\n${table}`,
          data: { projectId: p.id, ...r, url: `${ctx.baseUrl}${url}` },
        };
      } catch (err) {
        const soft = notConnected(err, ctx, p.id, `${url}?tab=settings`);
        if (soft) return soft;
        throw err;
      }
    },
  }),

  defineTool({
    name: "get_bot_traffic",
    title: "AI bot traffic (crawler hits)",
    description:
      "AI crawler requests (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended…) from Cloudflare, Akamai, server logs or uploaded access logs: totals, status classes and verified vs spoofed hits vs the previous period. Rows per bot (default), crawled page, page status breakdown, day, never_visited (AI crawlers with no visit in the period + robots.txt verdict) or not_cited (pages crawled but never cited in tracked AI answers). Free.",
    input: z.object({
      projectId: projectIdInput,
      timeframeDays: z.number().int().min(1).max(486).optional().describe("Look-back window in days (default 30)."),
      startDate: bot.startDate,
      endDate: bot.endDate,
      by: bot.by,
      bots: bot.bots,
      status: bot.status,
      search: bot.search,
      page: z.number().int().min(1).max(10_000).optional(),
      limit: z.number().int().min(10).max(100).optional().describe("Max rows (10–100, default 25)."),
    }),
    scope: "read",
    annotations: RO,
    async handler(args, ctx) {
      const p = await toolProject(ctx, args.projectId);
      const url = `/p/${p.id}/analytics/bots`;
      try {
        const r = await botTrafficForApi(p.id, botTrafficInput.parse({ ...args, projectId: undefined, limit: args.limit ?? 25 }));
        const t = r.totals;
        const change = t.previousVisits > 0 ? ((t.visits - t.previousVisits) / t.previousVisits) * 100 : null;
        const head = `AI bot traffic ${r.period.from} → ${r.period.to}: ${t.visits.toLocaleString("en-US")} hits${signed(change, "%")} on ${t.uniqueUrls.toLocaleString("en-US")} URLs · 2xx ${t.ok} · 3xx ${t.redirects} · 4xx ${t.clientErrors} · 5xx ${t.serverErrors} · verified ${t.verified}, unverified ${t.unverified}.`;
        const rows = r.rows as Record<string, unknown>[];
        const tables: Record<typeof r.by, [string, (x: Record<string, unknown>) => unknown][]> = {
          bot: [
            ["bot", (x) => x.bot],
            ["company", (x) => x.company],
            ["purpose", (x) => x.purpose],
            ["hits", (x) => x.visits],
            ["pages", (x) => x.pages],
            ["change %", (x) => x.change],
            ["last seen", (x) => x.lastSeen],
          ],
          page: [
            ["path", (x) => x.path],
            ["bots", (x) => x.bots],
            ["hits", (x) => x.visits],
            ["last crawl", (x) => x.lastVisited],
          ],
          status: [
            ["path", (x) => x.path],
            ["hits", (x) => x.total],
            ["errors", (x) => x.errors],
            ["statuses", (x) => ((x.breakdown as { status: string; count: number }[]) ?? []).map((b) => `${b.status}×${b.count}`).join(" ")],
          ],
          day: [
            ["date", (x) => x.date],
            ["hits", (x) => x.visits],
          ],
          never_visited: [
            ["crawler", (x) => x.name],
            ["company", (x) => x.company],
            ["purpose", (x) => x.purpose],
            ["last seen ever", (x) => x.lastSeen ?? "never"],
            ["robots.txt", (x) => x.robots ?? "not checked"],
          ],
          not_cited: [
            ["path", (x) => x.path],
            ["bots", (x) => x.bots],
            ["hits", (x) => x.visits],
            ["last crawl", (x) => x.lastVisited],
          ],
        };
        const note =
          r.by === "never_visited"
            ? "\n\nCrawlers marked blocked are disallowed by robots.txt / meta robots — allow them to be read (and cited) by that assistant. Run a crawlability check for robots.txt verdicts."
            : r.by === "not_cited"
              ? "\n\nThese pages are read by AI crawlers but never cited in tracked answers — make them more quotable (clear answers, facts, structure) or align them with tracked prompts."
              : "";
        return {
          text: `${head}${r.hasData ? "" : "\n\nA log connector is set up but no crawler hits arrived yet."}\n\n${mdTable(rows, tables[r.by])}${note}`,
          data: { projectId: p.id, ...r, url: `${ctx.baseUrl}${url}` },
        };
      } catch (err) {
        const soft = notConnected(err, ctx, p.id, `${url}?tab=sync`);
        if (soft) return soft;
        throw err;
      }
    },
  }),
];
