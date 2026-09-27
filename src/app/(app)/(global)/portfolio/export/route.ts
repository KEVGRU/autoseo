import { getProjectContext, getUserContext } from "@/server/auth/context";
import { getPortfolioOverview, getUserPortfolioProjects } from "@/server/ai/insights/portfolio";
import { resolveRange } from "@/features/ai-tracking/period";
import { filterPortfolioRows, isPortfolioFilter, portfolioCsvRows, toPortfolioCsv } from "@/features/portfolio/lib";

/** CSV export of the portfolio table (same period / search / status filter as the page). Session-authenticated. */
export async function GET(req: Request) {
  const ctx = await getUserContext();
  if (!ctx) return new Response("Unauthorized", { status: 401 });
  const url = new URL(req.url);
  const p = (k: string) => url.searchParams.get(k) ?? "";
  const period = resolveRange(p("period") || "30d", p("from") || null, p("to") || null);
  const rawFilter = p("filter");
  const filter = isPortfolioFilter(rawFilter) ? rawFilter : "all";
  // Only projects the user may export from (effective project permissions incl. group / project roles).
  const candidates = await getUserPortfolioProjects();
  const allowed = await Promise.all(candidates.map(async (pr) => Boolean((await getProjectContext(pr.id))?.permissions.has("data.export"))));
  const projects = candidates.filter((_, i) => allowed[i]);
  if (candidates.length && !projects.length) return new Response("Forbidden", { status: 403 });
  const data = await getPortfolioOverview({ projects, period });
  const rows = filterPortfolioRows(data.rows, { q: p("q").slice(0, 200), filter });
  const csv = `﻿${toPortfolioCsv(portfolioCsvRows(rows, data.period))}`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="portfolio-${data.period.from}-${data.period.to}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
