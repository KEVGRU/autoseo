import { getProjectContext } from "@/server/auth/context";
import { csvResponse, toCsv } from "@/server/optimize/csv";
import { exportFindings, parseFindingsFilters } from "@/features/optimize/fact-check/queries";
import { getEngine } from "@/lib/engines";

/** CSV export of fact-check findings (same filters as the findings page). */
export async function GET(req: Request, ctx: RouteContext<"/p/[projectId]/fact-check/findings/export">) {
  const { projectId } = await ctx.params;
  const project = await getProjectContext(projectId);
  if (!project) return new Response("Not found", { status: 404 });
  if (!project.permissions.has("data.export")) return new Response("Forbidden", { status: 403 });
  const url = new URL(req.url);
  const filters = parseFindingsFilters(Object.fromEntries(url.searchParams.entries()));
  const rows = await exportFindings(projectId, filters);
  const csv = toCsv(
    [
      "Severity",
      "Asset",
      "Type",
      "Market",
      "Model",
      "Label section",
      "Claim",
      "AI answer quote",
      "Label quote",
      "Explanation",
      "Judged by",
      "Status",
      "Times seen",
      "First seen",
      "Last seen",
      "Resolved at",
      "Prompt",
      "Rule",
      "Cited sources",
      "Task",
    ],
    rows.map((r) => [
      r.severity ?? "",
      r.assetName,
      r.verdict,
      r.market,
      getEngine(r.engine)?.name ?? r.engine,
      r.labelSection ?? "",
      r.claim,
      r.answerQuote ?? "",
      r.labelQuote ?? "",
      r.explanation ?? "",
      r.judgedBy ?? "",
      r.status,
      r.seenCount,
      r.firstSeenAt,
      r.lastSeenAt,
      r.resolvedAt ?? "",
      r.promptText ?? "",
      r.ruleName ?? "",
      r.sources.map((x) => x.url).join(" "),
      r.taskId ? `${r.taskTitle ?? r.taskId} (${r.taskStatus ?? "open"})` : "",
    ]),
  );
  const date = new Date().toISOString().slice(0, 10);
  return csvResponse(`fact-check-findings-${project.project.domain}-${date}.csv`, csv);
}
