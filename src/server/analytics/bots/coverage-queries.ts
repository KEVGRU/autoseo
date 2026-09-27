import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { AI_BOTS } from "@/lib/engines";
import { addDays, type AnalyticsPeriod } from "@/server/analytics/period";
import { findCrawledNotCited, findMissingCrawlers, isContentPath, type CrawledPath, type MissingCrawler, type RobotsVerdict } from "./coverage";

type Row = Record<string, unknown>;
const rowsOf = (res: unknown) => res as unknown as Row[];
const num = (v: unknown) => Number(v ?? 0) || 0;
const iso = (v: unknown) => (v ? new Date(String(v)).toISOString() : null);

function bounds(period: AnalyticsPeriod) {
  return { start: `${period.from}T00:00:00.000Z`, end: `${addDays(period.to, 1)}T00:00:00.000Z` };
}

export type CrawlerCoverage = {
  /** Known AI crawlers (SEO tools excluded) and how many of them visited in the period. */
  known: number;
  visiting: number;
  missing: MissingCrawler[];
  /** Latest completed crawlability check the robots verdicts come from. */
  check: { id: string; completedAt: string | null } | null;
  hasAnyData: boolean;
};

/** AI crawlers that never visit (in the period), with last visit ever and the robots.txt verdict. */
export async function getCrawlerCoverage(projectId: string, period: AnalyticsPeriod): Promise<CrawlerCoverage> {
  const { start, end } = bounds(period);
  const [periodRes, everRes, checkRes] = await Promise.all([
    db.execute(sql`
      select bot, count(*) visits from analytics_bot_visits
      where project_id = ${projectId} and ts >= ${start}::timestamptz and ts < ${end}::timestamptz group by bot`),
    db.execute(sql`select bot, max(ts) last_seen from analytics_bot_visits where project_id = ${projectId} group by bot`),
    db.execute(sql`
      select id, completed_at, result->'bots' bots from crawlability_checks
      where project_id = ${projectId} and status = 'completed' order by created_at desc limit 1`),
  ]);
  const visits = new Map(rowsOf(periodRes).map((r) => [String(r.bot), num(r.visits)]));
  const lastSeen = new Map(rowsOf(everRes).map((r) => [String(r.bot), iso(r.last_seen)!]));
  const check = rowsOf(checkRes)[0];
  let robots: Map<string, { verdict: RobotsVerdict; rule: string | null }> | null = null;
  if (check) {
    robots = new Map();
    const bots = Array.isArray(check.bots) ? (check.bots as Array<{ token?: string; overall?: string; robots?: { rule?: string | null } }>) : [];
    for (const b of bots) {
      if (!b.token) continue;
      const verdict = (["allowed", "partial", "blocked"] as const).find((v) => v === b.overall) ?? "unknown";
      robots.set(b.token.toLowerCase(), { verdict, rule: b.robots?.rule ?? null });
    }
  }
  const known = AI_BOTS.filter((b) => b.purpose !== "seo");
  const missing = findMissingCrawlers(AI_BOTS, visits, lastSeen, robots);
  return {
    known: known.length,
    visiting: known.filter((b) => (visits.get(b.token) ?? 0) > 0).length,
    missing,
    check: check ? { id: String(check.id), completedAt: iso(check.completed_at) } : null,
    hasAnyData: lastSeen.size > 0,
  };
}

export type CrawledNotCited = {
  rows: CrawledPath[];
  /** Content pages crawled in the period (before removing cited ones, capped at the scan size). */
  crawledPages: number;
  /** Distinct own-site URLs cited in AI answers (ever). */
  citedPages: number;
  total: number;
};

const SCAN_LIMIT = 5000;

/**
 * Pages AI crawlers fetched successfully in the period that were never cited in a tracked AI
 * answer (own-domain sources, all time). Sorted by crawler hits.
 */
export async function getCrawledNotCited(projectId: string, period: AnalyticsPeriod, opts: { limit?: number; bots?: string[] } = {}): Promise<CrawledNotCited> {
  const { start, end } = bounds(period);
  const botCond = opts.bots?.length ? sql`and bot in (${sql.join(opts.bots.map((b) => sql`${b}`), sql`, `)})` : sql``;
  const [crawledRes, citedRes] = await Promise.all([
    db.execute(sql`
      select path, max(host) host, array_agg(distinct bot) bots, count(*) visits, max(ts) last_visited
      from analytics_bot_visits
      where project_id = ${projectId} and ts >= ${start}::timestamptz and ts < ${end}::timestamptz
        and (status is null or status < 400) ${botCond}
      group by path order by visits desc, path asc limit ${SCAN_LIMIT}`),
    db.execute(sql`select url from ai_sources where project_id = ${projectId} and ownership = 'own'`),
  ]);
  const crawled: CrawledPath[] = rowsOf(crawledRes).map((r) => ({
    path: String(r.path),
    host: r.host ? String(r.host) : null,
    bots: (r.bots as string[] | null) ?? [],
    visits: num(r.visits),
    lastVisited: iso(r.last_visited)!,
  }));
  const citedUrls = rowsOf(citedRes).map((r) => String(r.url));
  const notCited = findCrawledNotCited(crawled, citedUrls);
  return {
    rows: notCited.slice(0, Math.min(500, opts.limit ?? 100)),
    crawledPages: crawled.filter((c) => isContentPath(c.path)).length,
    citedPages: new Set(citedUrls).size,
    total: notCited.length,
  };
}
