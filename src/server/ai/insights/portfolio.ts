import "server-only";
import { sql, type SQL } from "drizzle-orm";
import { db } from "@/server/db/client";
import { getAccessibleProjects, getUserContext } from "@/server/auth/context";
import type { projects } from "@/server/db/schema";
import { shareOfVoice } from "@/features/ai-insights/lib/metrics";
import type { PeriodRange } from "@/features/ai-tracking/period";
import {
  HIGH_IMPACT,
  delta,
  pct,
  portfolioTotals,
  sortPortfolioRows,
  type PortfolioOverview,
  type PortfolioPeriod,
  type PortfolioRow,
} from "@/features/portfolio/lib";

/**
 * Agency portfolio: one row per accessible project with the tracker KPIs (same definitions as
 * `src/server/ai/metrics.ts` — status "ok" answers of active prompts, brand scope "tracked"):
 * visibility = answers naming OR citing the brand ÷ answers, SoV = own mentions ÷ mentions of own
 * brand + tracked competitors, position = mean coalesce(tracked, all-brands) position where named,
 * sentiment = mean answer sentiment, citations = answers citing an own-domain page.
 * All figures are computed with grouped queries over every project at once (no per-project loop).
 */

type Project = Pick<
  typeof projects.$inferSelect,
  "id" | "name" | "domain" | "logoUrl" | "country" | "workspaceId" | "isPitch" | "pitchExpiresAt" | "trackingFrequency"
>;

type Row = Record<string, unknown>;

const n = (v: unknown): number => (v == null ? 0 : Number(v));
const nn = (v: unknown): number | null => (v == null ? null : Number(v));
const r1 = (v: number | null) => (v == null ? null : Math.round(v * 10) / 10);

async function rows(query: SQL): Promise<Row[]> {
  return (await db.execute(query)) as unknown as Row[];
}

function idList(ids: string[]): SQL {
  return sql.join(
    ids.map((id) => sql`${id}`),
    sql`, `,
  );
}

/** Tracker KPIs for current + previous period, grouped by project (one statement). */
function kpiSql(ids: SQL, period: PeriodRange): SQL {
  return sql`
    with ans as (
      select a.id, a.project_id, a.prompt_id, a.brand_mentioned, a.brand_cited, a.sentiment,
        coalesce(a.brand_position_tracked, a.brand_position) pos,
        a.answer_date >= ${period.from}::date cur
      from ai_answers a
      where a.project_id in (${ids})
        and a.status = 'ok'
        and a.answer_date between ${period.prev.from}::date and ${period.to}::date
        and exists (select 1 from prompts p where p.id = a.prompt_id and p.status = 'active')
    ),
    men as (
      select m.answer_id, count(*) filter (where m.is_own)::int own, count(*)::int total
      from ai_mentions m join ans on ans.id = m.answer_id
      where m.is_own or m.competitor_id is not null
      group by 1
    )
    select ans.project_id, ans.cur,
      count(*)::int answers,
      count(distinct ans.prompt_id)::int prompts,
      count(*) filter (where ans.brand_mentioned or ans.brand_cited)::int visible,
      count(*) filter (where ans.brand_mentioned)::int mentioned,
      count(*) filter (where ans.brand_cited)::int cited,
      avg(ans.pos) filter (where ans.brand_mentioned)::float8 position,
      avg(ans.sentiment)::float8 sentiment,
      coalesce(sum(men.own), 0)::int sov_own,
      coalesce(sum(men.total), 0)::int sov_total
    from ans left join men on men.answer_id = ans.id
    group by 1, 2`;
}

/** Daily visibility per project (sparkline), current period only. */
function seriesSql(ids: SQL, period: PeriodRange): SQL {
  return sql`
    select a.project_id, a.answer_date::text d, count(*)::int answers,
      count(*) filter (where a.brand_mentioned or a.brand_cited)::int visible
    from ai_answers a
    where a.project_id in (${ids})
      and a.status = 'ok'
      and a.answer_date between ${period.from}::date and ${period.to}::date
      and exists (select 1 from prompts p where p.id = a.prompt_id and p.status = 'active')
    group by 1, 2
    order by 1, 2`;
}

function tasksSql(ids: SQL): SQL {
  return sql`
    select t.project_id, count(*)::int open, count(*) filter (where t.impact >= ${HIGH_IMPACT})::int high
    from optimize_tasks t
    where t.project_id in (${ids}) and t.status in ('open', 'in_progress')
    group by 1`;
}

/** Survey-attributed AI search revenue (attribution service definition: active responses, reporting currency or none). */
function revenueSql(ids: SQL, fromIso: string, prevFromIso: string, toIso: string): SQL {
  const from = sql`${fromIso}::timestamptz`;
  const prevFrom = sql`${prevFromIso}::timestamptz`;
  const to = sql`${toIso}::timestamptz`;
  return sql`
    select r.project_id, coalesce(s.reporting_currency, 'EUR') currency,
      count(*) filter (where r.responded_at >= ${from})::int responses,
      coalesce(sum(r.deal_value) filter (where r.responded_at >= ${from}
        and (r.deal_currency = coalesce(s.reporting_currency, 'EUR') or r.deal_currency is null)), 0)::float8 cur,
      coalesce(sum(r.deal_value) filter (where r.responded_at < ${from}
        and (r.deal_currency = coalesce(s.reporting_currency, 'EUR') or r.deal_currency is null)), 0)::float8 prev
    from attribution_responses r
    left join attribution_settings s on s.project_id = r.project_id
    where r.project_id in (${ids})
      and r.status = 'active'
      and r.channel = 'ai_search'
      and r.responded_at >= ${prevFrom} and r.responded_at <= ${to}
    group by 1, 2`;
}

function currencySql(ids: SQL): SQL {
  return sql`select s.project_id, s.reporting_currency currency from attribution_settings s where s.project_id in (${ids})`;
}

function lastRunSql(ids: SQL): SQL {
  return sql`
    select distinct on (r.project_id) r.project_id, r.status, coalesce(r.finished_at, r.started_at, r.created_at) at
    from ai_runs r
    where r.project_id in (${ids})
    order by r.project_id, r.created_at desc`;
}

type Kpis = {
  answers: number;
  prompts: number;
  visibility: number | null;
  mentionRate: number | null;
  citationRate: number | null;
  cited: number;
  position: number | null;
  sentiment: number | null;
  shareOfVoice: number | null;
};

function toKpis(r: Row | undefined): Kpis {
  const answers = n(r?.answers);
  return {
    answers,
    prompts: n(r?.prompts),
    visibility: pct(n(r?.visible), answers),
    mentionRate: pct(n(r?.mentioned), answers),
    citationRate: pct(n(r?.cited), answers),
    cited: n(r?.cited),
    position: answers ? r1(nn(r?.position)) : null,
    sentiment: answers ? r1(nn(r?.sentiment)) : null,
    shareOfVoice: answers ? r1(shareOfVoice(n(r?.sov_own), n(r?.sov_total))) : null,
  };
}

/**
 * Projects of the signed-in user for the portfolio: the project switcher's list (workspace role with
 * all projects, or explicit project membership), limited to workspaces where the role may view
 * project data — the same rule the REST API applies (`project.view`).
 */
export async function getUserPortfolioProjects(): Promise<Project[]> {
  const ctx = await getUserContext();
  if (!ctx) return [];
  const viewable = new Set(ctx.memberships.filter((m) => m.permissions.has("project.view")).map((m) => m.workspace.id));
  return (await getAccessibleProjects()).filter((p) => viewable.has(p.workspaceId));
}

export function portfolioPeriod(period: PeriodRange): PortfolioPeriod {
  return { from: period.from, to: period.to, days: period.days, previous: { from: period.prev.from, to: period.prev.to } };
}

/** Portfolio overview for the given (already access-checked) projects. */
export async function getPortfolioOverview({ projects: list, period }: { projects: Project[]; period: PeriodRange }): Promise<PortfolioOverview> {
  const info = portfolioPeriod(period);
  if (!list.length) return { period: info, rows: [], totals: portfolioTotals([]) };
  const ids = idList(list.map((p) => p.id));
  const from = `${period.from}T00:00:00.000Z`;
  const prevFrom = `${period.prev.from}T00:00:00.000Z`;
  const to = `${period.to}T23:59:59.999Z`;

  const [kpis, series, tasks, revenue, currencies, runs] = await Promise.all([
    rows(kpiSql(ids, period)),
    rows(seriesSql(ids, period)),
    rows(tasksSql(ids)),
    rows(revenueSql(ids, from, prevFrom, to)),
    rows(currencySql(ids)),
    rows(lastRunSql(ids)),
  ]);

  const kpiBy = new Map<string, { cur?: Row; prev?: Row }>();
  for (const r of kpis) {
    const key = String(r.project_id);
    const entry = kpiBy.get(key) ?? {};
    if (r.cur === true || r.cur === "t") entry.cur = r;
    else entry.prev = r;
    kpiBy.set(key, entry);
  }
  const seriesBy = new Map<string, PortfolioRow["series"]>();
  for (const r of series) {
    const key = String(r.project_id);
    const points = seriesBy.get(key) ?? [];
    points.push({ date: String(r.d), visibility: pct(n(r.visible), n(r.answers)) });
    seriesBy.set(key, points);
  }
  const taskBy = new Map(tasks.map((r) => [String(r.project_id), r]));
  const revenueBy = new Map(revenue.map((r) => [String(r.project_id), r]));
  const currencyBy = new Map(currencies.map((r) => [String(r.project_id), String(r.currency)]));
  const runBy = new Map(runs.map((r) => [String(r.project_id), r]));

  const out: PortfolioRow[] = list.map((p) => {
    const k = kpiBy.get(p.id);
    const cur = toKpis(k?.cur);
    const prev = toKpis(k?.prev);
    const t = taskBy.get(p.id);
    const rev = revenueBy.get(p.id);
    const run = runBy.get(p.id);
    const aiRevenue = n(rev?.cur);
    const aiRevenuePrev = n(rev?.prev);
    const runAt = run?.at ? new Date(run.at as string | Date) : null;
    return {
      projectId: p.id,
      name: p.name,
      domain: p.domain,
      logoUrl: p.logoUrl,
      country: p.country,
      workspaceId: p.workspaceId,
      isPitch: p.isPitch,
      pitchExpiresAt: p.pitchExpiresAt ? p.pitchExpiresAt.toISOString() : null,
      paused: p.trackingFrequency === "paused",
      trackingFrequency: p.trackingFrequency,
      answers: cur.answers,
      prompts: cur.prompts,
      visibility: cur.visibility,
      visibilityDelta: delta(cur.visibility, prev.visibility),
      mentionRate: cur.mentionRate,
      shareOfVoice: cur.shareOfVoice,
      shareOfVoiceDelta: delta(cur.shareOfVoice, prev.shareOfVoice),
      position: cur.position,
      positionDelta: delta(cur.position, prev.position),
      sentiment: cur.sentiment,
      sentimentDelta: delta(cur.sentiment, prev.sentiment),
      citations: cur.cited,
      citationsDelta: prev.answers ? cur.cited - prev.cited : null,
      citationRate: cur.citationRate,
      openTasks: n(t?.open),
      openHighImpactTasks: n(t?.high),
      aiRevenue,
      aiRevenuePrev,
      aiRevenueDelta: rev ? Math.round((aiRevenue - aiRevenuePrev) * 100) / 100 : null,
      aiResponses: n(rev?.responses),
      currency: rev ? String(rev.currency) : (currencyBy.get(p.id) ?? "EUR"),
      lastRunAt: runAt && !Number.isNaN(runAt.getTime()) ? runAt.toISOString() : null,
      lastRunStatus: run ? String(run.status) : null,
      series: seriesBy.get(p.id) ?? [],
    };
  });

  const sorted = sortPortfolioRows(out);
  return { period: info, rows: sorted, totals: portfolioTotals(sorted) };
}
