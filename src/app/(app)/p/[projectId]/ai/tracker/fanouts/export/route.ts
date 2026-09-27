import { getProjectContext } from "@/server/auth/context";
import { getFanoutRows, getFollowupRows, type FanoutFilter } from "@/server/ai/insights/fanouts";
import { parseInsightFilter } from "@/server/ai/insights/filters";
import { toCsv } from "@/features/ai-tracking/csv";
import { FANOUT_INTENTS, fanoutIntentInfo } from "@/features/ai-insights/lib/fanout-intents";
import { getEngine } from "@/lib/engines";

const list = (v: string | null) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const round = (v: number | null) => (v == null ? "" : Math.round(v));

/** CSV download of the fan-out queries or follow-up questions (same filters as the page). Session-authenticated. */
export async function GET(req: Request, ctx: RouteContext<"/p/[projectId]/ai/tracker/fanouts/export">) {
  const { projectId } = await ctx.params;
  const project = await getProjectContext(projectId);
  if (!project) return new Response("Not found", { status: 404 });
  if (!project.permissions.has("project.view") || !project.permissions.has("data.export")) return new Response("Forbidden", { status: 403 });
  const url = new URL(req.url);
  const period = parseInsightFilter(projectId, Object.fromEntries(url.searchParams), { defaultPeriod: "90d" });
  const filter: FanoutFilter = {
    projectId,
    from: period.from,
    to: period.to,
    scope: period,
    q: (url.searchParams.get("q") ?? "").slice(0, 200),
    intents: list(url.searchParams.get("searchIntent")).filter((i) => i === "unclassified" || (FANOUT_INTENTS as readonly string[]).includes(i)),
  };
  const coverage = ["covered", "partial", "gap", "unknown"].find((c) => c === url.searchParams.get("coverage"));
  const models = (ids: string[]) => ids.map((e) => getEngine(e)?.name ?? e).join(" | ");
  const followups = url.searchParams.get("tab") === "followups";
  const csv = followups
    ? toCsv([
        ["Question", "Type", "Frequency", "Models", "Prompts", "Prompt texts", "First seen", "Last seen"],
        ...(await getFollowupRows(filter)).map((r) => [r.question, r.kind, r.frequency, models(r.engines), r.prompts.length, r.prompts.map((p) => p.text).join(" | "), r.firstSeen, r.lastSeen]),
      ])
    : toCsv([
        ["Query", "Intent", "Words", "Frequency", "Answers", "Brand named %", "Own page cited %", "Top cited domains", "Coverage", "Covering page", "Models", "Prompts", "Prompt texts", "First seen", "Last seen"],
        ...(await getFanoutRows(filter))
          .filter((r) => !coverage || (coverage === "unknown" ? !r.coverage : r.coverage === coverage))
          .map((r) => [
          r.query,
          fanoutIntentInfo(r.intent).label,
          r.wordCount,
          r.frequency,
          r.answers,
          round(r.brandMentionedPct),
          round(r.ownCitedPct),
          r.topDomains.map((d) => `${d.domain} (${d.answers})`).join(" | "),
          r.coverage ?? "",
          r.coverageUrl ?? "",
          models(r.engines),
          r.prompts.length,
          r.prompts.map((p) => p.text).join(" | "),
          r.firstSeen,
          r.lastSeen,
        ]),
      ]);
  const name = `${project.project.domain.replace(/[^a-z0-9.-]/gi, "")}-${followups ? "followups" : "fanouts"}-${period.to}.csv`;
  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
