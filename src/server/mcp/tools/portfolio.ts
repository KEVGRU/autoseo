import "server-only";
import { z } from "zod";
import { portfolioForApi, portfolioQuery } from "@/server/api/portfolio";
import { defineTool } from "../types";
import { mdTable, pct, signed } from "../helpers";

const RO = { readOnlyHint: true, openWorldHint: false } as const;
const q = portfolioQuery.shape;

const money = (v: number, cur: string) => `${Math.round(v).toLocaleString("en-US")} ${cur}`;

export const portfolioTools = [
  defineTool({
    name: "get_portfolio_overview",
    title: "Portfolio overview (all projects)",
    description:
      "Agency view across every project this credential can access: AI visibility, share of voice, average position, sentiment and own-domain citations with changes vs the previous period, open high-impact tasks (impact ≥ 7), survey-attributed AI revenue, last tracking run and pitch / paused flags — one row per project, best visibility first. Use it to find which client needs attention; drill into a project with get_visibility_metrics. Free.",
    input: z.object({
      timeframeDays: z.number().int().min(1).max(730).optional().describe("Look-back window in days (default 30)."),
      startDate: q.startDate,
      endDate: q.endDate,
      filter: q.filter,
      search: q.search,
    }),
    scope: "read",
    annotations: RO,
    async handler(args, ctx) {
      const r = await portfolioForApi(ctx.principal, portfolioQuery.parse(args), ctx.baseUrl);
      const t = r.totals;
      const revenue = t.revenue.length ? t.revenue.map((x) => money(x.value, x.currency)).join(" + ") : "none recorded";
      const head = `Portfolio ${r.period.from} → ${r.period.to} (vs ${r.period.previous.from} → ${r.period.previous.to}): ${t.projects} project${t.projects === 1 ? "" : "s"}, ${t.tracked} with AI answers · avg visibility ${pct(t.avgVisibility)}${signed(t.avgVisibilityDelta, " pp")} · ${t.openHighImpactTasks} open high-impact tasks · AI revenue ${revenue}.`;
      const table = mdTable(r.rows, [
        ["project", (x) => `[${x.name}](${x.url})`],
        ["status", (x) => [x.isPitch ? "pitch" : null, x.paused ? "paused" : null].filter(Boolean).join(", ") || "active"],
        ["visibility %", (x) => x.visibility],
        ["Δ pp", (x) => x.visibilityChange],
        ["SoV %", (x) => x.shareOfVoice],
        ["avg pos", (x) => x.avgPosition],
        ["sentiment", (x) => x.sentiment],
        ["citations", (x) => x.citations],
        ["high-impact tasks", (x) => x.openHighImpactTasks],
        ["AI revenue", (x) => (x.aiRevenue || x.aiResponses ? money(x.aiRevenue, x.currency) : null)],
        ["last run", (x) => x.lastRunAt?.slice(0, 10) ?? "never"],
      ]);
      return {
        text: `${head}\n\n${table}\n\nOpen the portfolio: ${ctx.baseUrl}/portfolio`,
        data: { period: r.period, totals: t, projects: r.rows, url: `${ctx.baseUrl}/portfolio` },
      };
    },
  }),
];
