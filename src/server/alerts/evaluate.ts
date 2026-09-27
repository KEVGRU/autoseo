import "server-only";
/**
 * Alert evaluators: each kind computes its findings for the current window vs the window right
 * before (from existing tracking, sentiment, citation, fact-check, bot and traffic data). The engine
 * (`evaluateRule`) dedupes findings against the rule's open keys, applies the cooldown, stores an
 * `alert_events` row and hands it to delivery.
 */
import { and, desc, eq, gte, inArray, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/server/db/client";
import {
  aiRuns,
  alertEvents,
  alertRules,
  FC_DEVIATIONS,
  fcAssets,
  fcRules,
  fcStatements,
  projects,
  type AlertEventPayload,
  type AlertItem,
  type AlertKind,
  type AlertParams,
  type AlertSeverity,
} from "@/server/db/schema";
import { getTrackerKpis } from "@/server/ai/metrics";
import { addDays, dayString, resolveRange, type DayRange, type PeriodRange } from "@/features/ai-tracking/period";
import { ALERT_KIND_META, resolveParams } from "@/features/alerts/kinds";
import { ENGINE_MAP } from "@/lib/engines";
import { MIN_ANSWERS, dedupeHash, dropBy, isErrorSpike, isSpike, magnitudeSeverity, planFiring, relativeChange } from "./plan";
import type { AlertEventRow, AlertRuleRow } from "./rules";

type Row = Record<string, unknown>;
type Params = ReturnType<typeof resolveParams>;

type EvalCtx = {
  projectId: string;
  projectName: string;
  kind: AlertKind;
  params: Params;
  now: Date;
  today: string;
  href: string;
};

export type EvalResult = {
  findings: AlertItem[];
  /** Headline metric (for metric-drop kinds). */
  metric?: { name: string; current: number | null; previous: number | null; change: number | null; unit: string } | null;
  window?: AlertEventPayload["window"];
  /** Why nothing could be evaluated (not enough data / not configured). */
  skipped?: string | null;
  summarize: (fresh: AlertItem[]) => { title: string; body: string; severity: AlertSeverity };
};

const n = (v: unknown): number => (v == null ? 0 : Number(v));
const fmt = (v: number | null | undefined, unit = "") => (v == null ? "—" : `${Math.round(v * 10) / 10}${unit}`);
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

async function rows(query: SQL): Promise<Row[]> {
  return (await db.execute(query)) as unknown as Row[];
}

function list(values: string[]): SQL {
  return sql.join(
    values.map((v) => sql`${v}`),
    sql`, `,
  );
}

/** Current window of `days` ending `endOffset` days before today, plus the equally long previous window. */
function windowRange(days: number, today: string, endOffset = 0): PeriodRange {
  const to = addDays(today, -endOffset);
  return resolveRange("custom", addDays(to, -(days - 1)), to, to);
}

function windowInfo(p: PeriodRange): AlertEventPayload["window"] {
  return { from: p.from, to: p.to, previousFrom: p.prev.from, previousTo: p.prev.to };
}

const between = (col: SQL, r: DayRange) => sql`${col} between ${r.from}::date and ${r.to}::date`;

/**
 * Filter over a per-answer table aliased `alias` (ai_answers / ai_mentions / ai_statements / ai_citations —
 * all carry project_id, prompt_id, engine, answer_date): project, date range, engines, prompt tags, active prompts.
 */
function answerRowsWhere(alias: string, ctx: EvalCtx, range: DayRange): SQL {
  const a = sql.raw(alias);
  const parts: SQL[] = [sql`${a}.project_id = ${ctx.projectId}`, between(sql`${a}.answer_date`, range)];
  if (alias === "a") parts.push(sql`a.status = 'ok'`);
  if (ctx.params.engines?.length) parts.push(sql`${a}.engine in (${list(ctx.params.engines)})`);
  parts.push(sql`${a}.prompt_id in (select p.id from prompts p where p.project_id = ${ctx.projectId} and p.status = 'active')`);
  if (ctx.params.tags?.length) parts.push(sql`${a}.prompt_id in (select l.prompt_id from prompt_tag_links l where l.tag_id in (${list(ctx.params.tags)}))`);
  return sql.join(parts, sql` and `);
}

const fullRange = (p: PeriodRange): DayRange => ({ from: p.prev.from, to: p.to, days: p.days * 2 });

/* ─────────────────────────── Metric drops (tracker KPIs) ─────────────────────────── */

type KpiMetric = "visibility" | "shareOfVoice" | "position" | "sentiment";

async function kpiDrop(ctx: EvalCtx, metric: KpiMetric, label: string, unit: string, lowerIsBetter = false): Promise<EvalResult> {
  const period = windowRange(ctx.params.windowDays, ctx.today);
  const threshold = ctx.params.threshold ?? 0;
  const k = await getTrackerKpis({ projectId: ctx.projectId, engines: ctx.params.engines, tagIds: ctx.params.tags }, period);
  const cur = k.current[metric] as number | null;
  const prev = k.previous[metric] as number | null;
  const base = {
    window: windowInfo(period),
    metric: { name: metric, current: cur, previous: prev, change: cur != null && prev != null ? Math.round((cur - prev) * 10) / 10 : null, unit },
  };
  const valueUnit = unit === "pp" ? "%" : "";
  const summarize = () => {
    const change = Math.abs(base.metric.change ?? 0);
    return {
      title: lowerIsBetter
        ? `${label} worsened by ${fmt(change)} to ${fmt(cur)}`
        : `${label} dropped ${fmt(change)} ${unit} to ${fmt(cur, valueUnit)}`,
      body: `${label} over the last ${plural(period.days, "day")} is ${fmt(cur, valueUnit)} (previous ${plural(period.days, "day")}: ${fmt(prev, valueUnit)}), based on ${k.current.answers} AI answers.`,
      severity: magnitudeSeverity(change, threshold),
    };
  };
  if (k.current.answers < MIN_ANSWERS || k.previous.answers < MIN_ANSWERS) {
    return { ...base, findings: [], skipped: `Needs at least ${MIN_ANSWERS} tracked answers in both ${period.days}-day windows.`, summarize };
  }
  const change = dropBy({ current: cur, previous: prev, threshold, lowerIsBetter });
  if (change == null) return { ...base, findings: [], summarize };
  return {
    ...base,
    findings: [{ key: ctx.kind, label: `${label} ${fmt(prev, valueUnit)} → ${fmt(cur, valueUnit)}`, value: cur, previous: prev, href: ctx.href }],
    summarize,
  };
}

/* ─────────────────────────── Competitors ─────────────────────────── */

async function competitorOvertake(ctx: EvalCtx): Promise<EvalResult> {
  const period = windowRange(ctx.params.windowDays, ctx.today);
  const lead = ctx.params.threshold ?? 0;
  const cur = sql`a.answer_date between ${period.from}::date and ${period.to}::date`;
  const prev = sql`a.answer_date between ${period.prev.from}::date and ${period.prev.to}::date`;
  const [own] = await rows(sql`
    select count(*) filter (where ${cur})::int cur_total, count(*) filter (where ${prev})::int prev_total,
      count(*) filter (where ${cur} and a.brand_mentioned)::int cur_own, count(*) filter (where ${prev} and a.brand_mentioned)::int prev_own
    from ai_answers a where ${answerRowsWhere("a", ctx, fullRange(period))}`);
  const curTotal = n(own?.cur_total);
  const prevTotal = n(own?.prev_total);
  const summarize = (fresh: AlertItem[]) => ({
    title: fresh.length === 1 ? `${fresh[0]!.label.split(" · ")[0]} overtook you in AI answers` : `${fresh.length} competitors overtook you in AI answers`,
    body: `Named in more AI answers than your brand over the last ${plural(period.days, "day")} (mention rate) — they were behind you in the ${plural(period.days, "day")} before.`,
    severity: "warning" as const,
  });
  if (curTotal < MIN_ANSWERS || prevTotal < MIN_ANSWERS) {
    return { findings: [], window: windowInfo(period), skipped: `Needs at least ${MIN_ANSWERS} tracked answers in both windows.`, summarize };
  }
  const curOwn = (n(own?.cur_own) / curTotal) * 100;
  const prevOwn = (n(own?.prev_own) / prevTotal) * 100;
  const mCur = sql`m.answer_date between ${period.from}::date and ${period.to}::date`;
  const mPrev = sql`m.answer_date between ${period.prev.from}::date and ${period.prev.to}::date`;
  const comps = await rows(sql`
    select m.competitor_id id, c.name,
      count(distinct m.answer_id) filter (where ${mCur})::int cur_n,
      count(distinct m.answer_id) filter (where ${mPrev})::int prev_n
    from ai_mentions m join competitors c on c.id = m.competitor_id
    where ${answerRowsWhere("m", ctx, fullRange(period))} and c.tracked
    group by 1, 2`);
  const findings: AlertItem[] = [];
  for (const c of comps) {
    const cr = (n(c.cur_n) / curTotal) * 100;
    const pr = (n(c.prev_n) / prevTotal) * 100;
    if (pr <= prevOwn && cr > curOwn + lead) {
      findings.push({
        key: `overtake:${c.id}`,
        label: `${c.name} · ${fmt(cr, "%")} vs you ${fmt(curOwn, "%")} (before ${fmt(pr, "%")} vs ${fmt(prevOwn, "%")})`,
        value: Math.round(cr * 10) / 10,
        previous: Math.round(pr * 10) / 10,
        href: ctx.href,
      });
    }
  }
  return { findings, window: windowInfo(period), summarize };
}

async function newCompetitor(ctx: EvalCtx): Promise<EvalResult> {
  const period = windowRange(ctx.params.windowDays, ctx.today);
  const minAnswers = Math.max(1, Math.round(ctx.params.threshold ?? 2));
  const lookbackFrom = addDays(period.from, -180);
  const discovered = await rows(sql`
    select lower(m.brand_name) k, min(m.brand_name) name, count(distinct m.answer_id)::int n
    from ai_mentions m
    where ${answerRowsWhere("m", ctx, period)} and m.competitor_id is null and not m.is_own
      and not exists (
        select 1 from ai_mentions o
        where o.project_id = ${ctx.projectId} and o.competitor_id is null and not o.is_own
          and lower(o.brand_name) = lower(m.brand_name)
          and o.answer_date >= ${lookbackFrom}::date and o.answer_date < ${period.from}::date)
    group by 1 having count(distinct m.answer_id) >= ${minAnswers}
    order by 3 desc limit 50`);
  const auto = await rows(sql`
    select c.id, c.name from competitors c
    where c.project_id = ${ctx.projectId} and c.source = 'auto' and c.created_at >= ${`${period.from}T00:00:00Z`}::timestamptz`);
  const byKey = new Map<string, AlertItem>();
  for (const d of discovered) {
    const key = `new_competitor:${String(d.k)}`;
    byKey.set(key, { key, label: String(d.name), detail: `Named in ${plural(n(d.n), "answer")} — not tracked yet`, value: n(d.n), href: ctx.href });
  }
  for (const c of auto) {
    const key = `new_competitor:${String(c.name).toLowerCase()}`;
    if (!byKey.has(key)) byKey.set(key, { key, label: String(c.name), detail: "Added automatically as a competitor", href: ctx.href });
  }
  return {
    findings: [...byKey.values()],
    window: windowInfo(period),
    summarize: (fresh) => ({
      title: fresh.length === 1 ? `New competitor in AI answers: ${fresh[0]!.label}` : `${fresh.length} new competitors in AI answers`,
      body: `${fresh.length === 1 ? "A brand you don't track" : `${fresh.length} brands you don't track`} appeared in AI answers in the last ${plural(period.days, "day")}. Review them under AI Visibility → Competitors and add the relevant ones to your list.`,
      severity: "info",
    }),
  };
}

/* ─────────────────────────── Sentiment ─────────────────────────── */

async function criticismSpike(ctx: EvalCtx): Promise<EvalResult> {
  const period = windowRange(ctx.params.windowDays, ctx.today);
  const thresholdPct = ctx.params.threshold ?? 50;
  const cur = sql`s.answer_date between ${period.from}::date and ${period.to}::date`;
  const prev = sql`s.answer_date between ${period.prev.from}::date and ${period.prev.to}::date`;
  const [c] = await rows(sql`
    select count(*) filter (where ${cur})::int cur_n, count(*) filter (where ${prev})::int prev_n
    from ai_statements s where ${answerRowsWhere("s", ctx, fullRange(period))} and s.is_own and s.polarity = 'criticism'`);
  const curN = n(c?.cur_n);
  const prevN = n(c?.prev_n);
  const change = relativeChange(curN, prevN);
  const base = { window: windowInfo(period), metric: { name: "criticism", current: curN, previous: prevN, change, unit: "%" } };
  const summarize = () => ({
    title: `Criticism of your brand up ${change == null ? "" : `${fmt(change)}% `}to ${plural(curN, "statement")}`,
    body: `AI answers made ${plural(curN, "critical statement")} about your brand in the last ${plural(period.days, "day")} (previous window: ${prevN}). Top themes are listed below.`,
    severity: (change != null && change >= thresholdPct * 2) || (prevN === 0 && curN >= 6) ? ("critical" as const) : ("warning" as const),
  });
  if (!isSpike({ current: curN, previous: prevN, thresholdPct })) return { ...base, findings: [], summarize };
  const themes = await rows(sql`
    select coalesce(s.attribute, s.theme, 'General') label, count(*)::int n, min(s.quote) quote
    from ai_statements s where ${answerRowsWhere("s", ctx, period)} and s.is_own and s.polarity = 'criticism'
    group by 1 order by 2 desc limit 5`);
  return {
    ...base,
    findings: [
      {
        key: "criticism_spike",
        label: `${prevN} → ${curN} critical statements`,
        value: curN,
        previous: prevN,
        detail: themes.map((t) => `${t.label} (${n(t.n)}): “${String(t.quote ?? "").slice(0, 140)}”`).join(" · ") || null,
        href: ctx.href,
      },
    ],
    summarize,
  };
}

/* ─────────────────────────── Ads ─────────────────────────── */

async function newAd(ctx: EvalCtx): Promise<EvalResult> {
  const period = windowRange(ctx.params.windowDays, ctx.today);
  const engines = ctx.params.engines?.length
    ? sql`and exists (select 1 from ai_ad_appearances ap where ap.ad_id = ad.id and ap.engine in (${list(ctx.params.engines)}))`
    : sql``;
  const ads = await rows(sql`
    select ad.id, ad.advertiser, ad.headline, ad.landing_url, ad.first_seen_at
    from ai_ads ad
    where ad.project_id = ${ctx.projectId} and not ad.is_own and ad.first_seen_at >= ${`${period.from}T00:00:00Z`}::timestamptz ${engines}
    order by ad.first_seen_at desc limit 50`);
  return {
    findings: ads.map((a) => ({ key: `new_ad:${a.id}`, label: `${a.advertiser}: ${a.headline}`, detail: a.landing_url ? String(a.landing_url) : null, href: ctx.href })),
    window: windowInfo(period),
    summarize: (fresh) => ({
      title: fresh.length === 1 ? `New ad next to AI answers: ${fresh[0]!.label.split(":")[0]}` : `${fresh.length} new ads next to AI answers`,
      body: `${fresh.length === 1 ? "A new ad" : `${fresh.length} new ads`} appeared next to AI answers in the last ${plural(period.days, "day")}.`,
      severity: "info",
    }),
  };
}

/* ─────────────────────────── Citations ─────────────────────────── */

async function citationLost(ctx: EvalCtx): Promise<EvalResult> {
  const period = windowRange(ctx.params.windowDays, ctx.today);
  const minPrev = Math.max(1, Math.round(ctx.params.threshold ?? 2));
  const summarize = (fresh: AlertItem[]) => ({
    title: fresh.length === 1 ? `Your page is no longer cited: ${fresh[0]!.label}` : `${fresh.length} of your pages are no longer cited by AI engines`,
    body: `${fresh.length === 1 ? "This page was" : `These ${fresh.length} pages were`} cited by AI engines in the previous ${plural(period.days, "day")} but not in the last ${plural(period.days, "day")}.`,
    severity: fresh.length >= 5 ? ("critical" as const) : ("warning" as const),
  });
  const [cur] = await rows(sql`select count(*)::int n from ai_answers a where ${answerRowsWhere("a", ctx, period)}`);
  if (n(cur?.n) < MIN_ANSWERS) return { findings: [], window: windowInfo(period), skipped: `Needs at least ${MIN_ANSWERS} tracked answers in the current window.`, summarize };
  const cPrev = sql`c.answer_date between ${period.prev.from}::date and ${period.prev.to}::date`;
  const cCur = sql`c.answer_date between ${period.from}::date and ${period.to}::date`;
  const lost = await rows(sql`
    select s.id, s.url, s.title, count(*) filter (where ${cPrev})::int prev_n
    from ai_citations c join ai_sources s on s.id = c.source_id
    where ${answerRowsWhere("c", ctx, fullRange(period))} and s.ownership = 'own'
    group by s.id, s.url, s.title
    having count(*) filter (where ${cPrev}) >= ${minPrev} and count(*) filter (where ${cCur}) = 0
    order by 4 desc limit 50`);
  return {
    findings: lost.map((s) => ({
      key: `citation_lost:${s.id}`,
      label: String(s.title || s.url),
      detail: `${s.url} · cited ${n(s.prev_n)}× before`,
      href: ctx.href,
      value: 0,
      previous: n(s.prev_n),
    })),
    window: windowInfo(period),
    summarize,
  };
}

/* ─────────────────────────── Fact check ─────────────────────────── */

const SEVERITY_RANK = { minor: 1, major: 2, critical: 3 } as const;

const FC_VERDICT_LABEL: Record<string, string> = {
  contradicted: "contradicts the label",
  unsupported: "unsupported by the label",
  outdated: "outdated",
  off_label: "off-label",
  rule_violation: "breaks a fact-check rule",
};

async function factCheckDeviation(ctx: EvalCtx): Promise<EvalResult> {
  const since = new Date(ctx.now.getTime() - ctx.params.windowDays * 86_400_000);
  const minRank = SEVERITY_RANK[ctx.params.minSeverity ?? "minor"];
  const severities = (Object.keys(SEVERITY_RANK) as (keyof typeof SEVERITY_RANK)[]).filter((s) => SEVERITY_RANK[s] >= minRank);
  const found = await db
    .select({
      id: fcStatements.id,
      claim: fcStatements.claim,
      verdict: fcStatements.verdict,
      severity: fcStatements.severity,
      engine: fcStatements.engine,
      market: fcStatements.market,
      asset: fcAssets.name,
      ruleId: fcStatements.ruleId,
      ruleName: fcRules.name,
      ruleKind: fcRules.kind,
    })
    .from(fcStatements)
    .innerJoin(fcAssets, eq(fcAssets.id, fcStatements.assetId))
    .leftJoin(fcRules, and(eq(fcRules.id, fcStatements.ruleId), eq(fcRules.projectId, fcStatements.projectId)))
    .where(
      and(
        eq(fcStatements.projectId, ctx.projectId),
        eq(fcStatements.status, "open"),
        inArray(fcStatements.verdict, [...FC_DEVIATIONS]),
        gte(fcStatements.checkedAt, since),
        minRank > 1 ? inArray(fcStatements.severity, severities) : undefined,
        ctx.params.engines?.length ? inArray(fcStatements.engine, ctx.params.engines) : undefined,
      ),
    )
    .orderBy(desc(fcStatements.checkedAt))
    .limit(100);
  return {
    findings: found.map((s) => {
      const rule = s.verdict === "rule_violation" ? (s.ruleName ?? "deleted rule") : null;
      const what = rule ? `breaks rule “${rule}”` : (FC_VERDICT_LABEL[s.verdict] ?? s.verdict);
      return {
        key: `fc:${s.id}`,
        label: `${s.asset}: “${s.claim.slice(0, 160)}”`,
        detail: `${what}${s.severity ? ` · ${s.severity}` : ""} · ${ENGINE_MAP.get(s.engine as never)?.name ?? s.engine} · ${s.market}`,
        href: ctx.href,
        meta: {
          statementId: s.id,
          asset: s.asset,
          verdict: s.verdict,
          severity: s.severity,
          engine: s.engine,
          market: s.market,
          ruleId: s.verdict === "rule_violation" ? s.ruleId : null,
          ruleName: rule,
          ruleKind: s.verdict === "rule_violation" ? (s.ruleKind ?? null) : null,
        },
      };
    }),
    summarize: (fresh) => {
      const critical = fresh.filter((f) => f.meta?.severity === "critical").length;
      const rules = [...new Set(fresh.map((f) => f.meta?.ruleName).filter((r): r is string => typeof r === "string"))];
      const onlyRules = rules.length > 0 && fresh.every((f) => f.meta?.verdict === "rule_violation");
      const title =
        fresh.length === 1
          ? onlyRules
            ? `Fact-check rule “${rules[0]}” violated: ${String(fresh[0]!.meta?.asset ?? "")}`
            : `Fact-check deviation: ${String(fresh[0]!.meta?.asset ?? "")}`
          : onlyRules && rules.length === 1
            ? `Fact-check rule “${rules[0]}” violated ${fresh.length}×`
            : `${fresh.length} new fact-check deviations`;
      const ruleNote = rules.length ? ` Rules broken: ${rules.map((r) => `“${r}”`).join(", ")}.` : "";
      return {
        title,
        body: `AI engines made ${plural(fresh.length, "statement")} that deviate from your reference documents or fact-check rules${critical ? ` (${critical} critical)` : ""}.${ruleNote} Review and resolve them in Fact Check → Findings.`,
        severity: critical ? "critical" : "warning",
      };
    },
  };
}

/* ─────────────────────────── Bots & traffic ─────────────────────────── */

function tsBounds(period: PeriodRange) {
  return {
    prevFrom: `${period.prev.from}T00:00:00Z`,
    curFrom: `${period.from}T00:00:00Z`,
    curEnd: `${addDays(period.to, 1)}T00:00:00Z`,
  };
}

async function crawlerMissing(ctx: EvalCtx): Promise<EvalResult> {
  // Windows end yesterday: today's logs are incomplete.
  const period = windowRange(ctx.params.windowDays, ctx.today, 1);
  const minPrev = Math.max(1, Math.round(ctx.params.threshold ?? 5));
  const b = tsBounds(period);
  const bots = await rows(sql`
    select v.bot, count(*) filter (where v.ts < ${b.curFrom}::timestamptz)::int prev_n, count(*) filter (where v.ts >= ${b.curFrom}::timestamptz)::int cur_n
    from analytics_bot_visits v
    where v.project_id = ${ctx.projectId} and v.ts >= ${b.prevFrom}::timestamptz and v.ts < ${b.curEnd}::timestamptz
    group by 1`);
  const summarize = (fresh: AlertItem[]) => ({
    title: fresh.some((f) => f.key === "crawler_missing:*")
      ? "No AI crawler visits recorded anymore"
      : fresh.length === 1
        ? `${fresh[0]!.label} stopped crawling your site`
        : `${fresh.length} AI crawlers stopped crawling your site`,
    body: fresh.some((f) => f.key === "crawler_missing:*")
      ? `No AI crawler requests arrived in the last ${plural(period.days, "day")} (previous window: ${fresh[0]?.previous ?? 0}). Check your log/CDN integration under Integrations → Bot Traffic, and robots.txt / firewall rules.`
      : `Visited your site in the previous ${plural(period.days, "day")} but not in the last ${plural(period.days, "day")}. Check robots.txt, firewall/WAF and CDN bot rules.`,
    severity: "warning" as const,
  });
  if (!bots.length) return { findings: [], window: windowInfo(period), skipped: "No bot traffic data — connect server logs or a CDN under Integrations → Bot Traffic.", summarize };
  const curTotal = bots.reduce((s, r) => s + n(r.cur_n), 0);
  const prevTotal = bots.reduce((s, r) => s + n(r.prev_n), 0);
  if (curTotal === 0) {
    return prevTotal > 0
      ? { findings: [{ key: "crawler_missing:*", label: "All AI crawlers", value: 0, previous: prevTotal, href: ctx.href }], window: windowInfo(period), summarize }
      : { findings: [], window: windowInfo(period), summarize };
  }
  return {
    findings: bots
      .filter((r) => n(r.prev_n) >= minPrev && n(r.cur_n) === 0)
      .map((r) => ({ key: `crawler_missing:${r.bot}`, label: String(r.bot), detail: `${n(r.prev_n)} visits before, none since`, value: 0, previous: n(r.prev_n), href: ctx.href })),
    window: windowInfo(period),
    summarize,
  };
}

async function botErrorSpike(ctx: EvalCtx): Promise<EvalResult> {
  const period = windowRange(ctx.params.windowDays, ctx.today, 1);
  const b = tsBounds(period);
  const [r] = await rows(sql`
    select count(*) filter (where v.ts >= ${b.curFrom}::timestamptz)::int total,
      count(*) filter (where v.ts >= ${b.curFrom}::timestamptz and v.status >= 400)::int errors,
      count(*) filter (where v.ts < ${b.curFrom}::timestamptz)::int prev_total,
      count(*) filter (where v.ts < ${b.curFrom}::timestamptz and v.status >= 400)::int prev_errors
    from analytics_bot_visits v
    where v.project_id = ${ctx.projectId} and v.ts >= ${b.prevFrom}::timestamptz and v.ts < ${b.curEnd}::timestamptz and v.status is not null`);
  const threshold = ctx.params.threshold ?? 10;
  const s = isErrorSpike({ errors: n(r?.errors), total: n(r?.total), prevErrors: n(r?.prev_errors), prevTotal: n(r?.prev_total), thresholdPct: threshold });
  const base = {
    window: windowInfo(period),
    metric: { name: "botErrorRate", current: s.rate, previous: s.prevRate, change: s.rate != null && s.prevRate != null ? Math.round((s.rate - s.prevRate) * 10) / 10 : null, unit: "%" },
  };
  const summarize = () => ({
    title: `AI crawlers hit errors on ${fmt(s.rate, "%")} of requests`,
    body: `${n(r?.errors)} of ${n(r?.total)} AI crawler requests in the last ${plural(period.days, "day")} got HTTP 4xx/5xx (previous window: ${fmt(s.prevRate, "%")}). Blocked or broken pages can't be cited.`,
    severity: magnitudeSeverity(s.rate ?? 0, threshold),
  });
  if (n(r?.total) + n(r?.prev_total) === 0) return { ...base, findings: [], skipped: "No bot traffic data — connect server logs or a CDN under Integrations → Bot Traffic.", summarize };
  if (!s.spike) return { ...base, findings: [], summarize };
  const paths = await rows(sql`
    select v.path, v.status, count(*)::int n from analytics_bot_visits v
    where v.project_id = ${ctx.projectId} and v.ts >= ${b.curFrom}::timestamptz and v.ts < ${b.curEnd}::timestamptz and v.status >= 400
    group by 1, 2 order by 3 desc limit 5`);
  return {
    ...base,
    findings: [
      {
        key: "bot_error_spike",
        label: `Error rate ${fmt(s.prevRate, "%")} → ${fmt(s.rate, "%")}`,
        value: s.rate,
        previous: s.prevRate,
        detail: paths.map((p) => `${p.path} → ${p.status} (${n(p.n)}×)`).join(" · ") || null,
        href: ctx.href,
      },
    ],
    summarize,
  };
}

async function aiTrafficDrop(ctx: EvalCtx): Promise<EvalResult> {
  const period = windowRange(ctx.params.windowDays, ctx.today, 1);
  const thresholdPct = ctx.params.threshold ?? 30;
  const cur = sql`t.date between ${period.from}::date and ${period.to}::date`;
  const prev = sql`t.date between ${period.prev.from}::date and ${period.prev.to}::date`;
  const platforms = await rows(sql`
    select t.platform, coalesce(sum(t.sessions) filter (where ${cur}), 0)::int cur_n, coalesce(sum(t.sessions) filter (where ${prev}), 0)::int prev_n
    from analytics_traffic_rows t
    where t.project_id = ${ctx.projectId} and t.date between ${period.prev.from}::date and ${period.to}::date
    group by 1`);
  const curN = platforms.reduce((s, r) => s + n(r.cur_n), 0);
  const prevN = platforms.reduce((s, r) => s + n(r.prev_n), 0);
  const change = relativeChange(curN, prevN);
  const base = { window: windowInfo(period), metric: { name: "aiSessions", current: curN, previous: prevN, change, unit: "%" } };
  const summarize = () => ({
    title: `AI-referred traffic down ${fmt(Math.abs(change ?? 0))}% to ${curN} sessions`,
    body: `Sessions from AI platforms in the last ${plural(period.days, "day")}: ${curN} (previous: ${prevN}). Biggest drops are listed below.`,
    severity: magnitudeSeverity(Math.abs(change ?? 0), thresholdPct),
  });
  if (!platforms.length) return { ...base, findings: [], skipped: "No AI traffic data — connect Google Analytics, Matomo or Piwik PRO under Integrations.", summarize };
  if (prevN < 20 || change == null || -change < thresholdPct) return { ...base, findings: [], summarize };
  const drops = [...platforms].sort((a, b) => n(b.prev_n) - n(b.cur_n) - (n(a.prev_n) - n(a.cur_n))).slice(0, 5);
  return {
    ...base,
    findings: [
      {
        key: "ai_traffic_drop",
        label: `${prevN} → ${curN} AI sessions (${fmt(change)}%)`,
        value: curN,
        previous: prevN,
        detail: drops.map((p) => `${p.platform}: ${n(p.prev_n)} → ${n(p.cur_n)}`).join(" · "),
        href: ctx.href,
      },
    ],
    summarize,
  };
}

/* ─────────────────────────── Tracking runs ─────────────────────────── */

async function runFailed(ctx: EvalCtx): Promise<EvalResult> {
  const since = new Date(ctx.now.getTime() - ctx.params.windowDays * 86_400_000);
  const pct = ctx.params.threshold ?? 50;
  const runs = await db
    .select()
    .from(aiRuns)
    .where(
      and(
        eq(aiRuns.projectId, ctx.projectId),
        gte(aiRuns.finishedAt, since),
        or(eq(aiRuns.status, "failed"), and(eq(aiRuns.status, "partial"), sql`${aiRuns.failedTasks} * 100 >= ${pct} * greatest(${aiRuns.totalTasks}, 1)`)),
      ),
    )
    .orderBy(desc(aiRuns.finishedAt))
    .limit(20);
  return {
    findings: runs.map((r) => ({
      key: `run_failed:${r.id}`,
      label: `${r.status === "failed" ? "Failed" : "Partial"} ${r.trigger} run · ${r.totalTasks ? `${r.failedTasks}/${r.totalTasks} tasks failed` : "no engine could run"}`,
      detail: r.error?.slice(0, 300) ?? null,
      href: ctx.href,
      value: r.failedTasks,
    })),
    summarize: (fresh) => {
      const failed = fresh.filter((f) => f.label.startsWith("Failed")).length;
      return {
        title: fresh.length === 1 ? `AI tracking run ${failed ? "failed" : "partly failed"}` : `${fresh.length} AI tracking runs failed`,
        body: `${fresh.length === 1 ? "A tracking run" : `${fresh.length} tracking runs`} in the last ${plural(ctx.params.windowDays, "day")} failed or only partly completed. Check engine availability and provider keys under AI Visibility → Model Settings and Admin → AI Providers / Data Providers.`,
        severity: failed ? "critical" : "warning",
      };
    },
  };
}

const EVALUATORS: Record<AlertKind, (ctx: EvalCtx) => Promise<EvalResult>> = {
  visibility_drop: (ctx) => kpiDrop(ctx, "visibility", "Visibility", "pp"),
  sov_drop: (ctx) => kpiDrop(ctx, "shareOfVoice", "Share of voice", "pp"),
  position_drop: (ctx) => kpiDrop(ctx, "position", "Average position", "positions", true),
  sentiment_drop: (ctx) => kpiDrop(ctx, "sentiment", "Sentiment", "points"),
  competitor_overtake: competitorOvertake,
  new_competitor: newCompetitor,
  criticism_spike: criticismSpike,
  new_ad: newAd,
  citation_lost: citationLost,
  fact_check_deviation: factCheckDeviation,
  crawler_missing: crawlerMissing,
  bot_error_spike: botErrorSpike,
  ai_traffic_drop: aiTrafficDrop,
  run_failed: runFailed,
};

/* ─────────────────────────── Engine ─────────────────────────── */

export type RuleEvaluation = {
  ruleId: string;
  ruleName: string;
  kind: AlertKind;
  findings: number;
  fired: AlertEventRow | null;
  deferred: boolean;
  skipped: string | null;
  error: string | null;
};

/** Runs one rule's evaluator; stores the new open keys and (when something new fired) an alert event. */
export async function evaluateRule(rule: AlertRuleRow, opts: { now?: Date; projectName?: string } = {}): Promise<RuleEvaluation> {
  const now = opts.now ?? new Date();
  const params = resolveParams(rule.kind, rule.params as AlertParams);
  const projectName =
    opts.projectName ?? (await db.select({ name: projects.name }).from(projects).where(eq(projects.id, rule.projectId)).limit(1))[0]?.name ?? "";
  const ctx: EvalCtx = {
    projectId: rule.projectId,
    projectName,
    kind: rule.kind,
    params,
    now,
    today: dayString(now),
    href: `/p/${rule.projectId}${ALERT_KIND_META[rule.kind].path}`,
  };
  const result: RuleEvaluation = { ruleId: rule.id, ruleName: rule.name, kind: rule.kind, findings: 0, fired: null, deferred: false, skipped: null, error: null };
  let evaluation: EvalResult;
  try {
    evaluation = await EVALUATORS[rule.kind](ctx);
  } catch (err) {
    result.error = (err instanceof Error ? err.message : String(err)).slice(0, 500);
    await db
      .update(alertRules)
      .set({ lastError: result.error, lastEvaluatedAt: now, evaluations: sql`${alertRules.evaluations} + 1` })
      .where(eq(alertRules.id, rule.id));
    return result;
  }
  result.findings = evaluation.findings.length;
  result.skipped = evaluation.skipped ?? null;
  const open = rule.state?.open ?? [];
  // No data to compare (e.g. tracking paused): keep the open findings, so they don't fire again once data returns.
  const plan = evaluation.skipped
    ? { fire: [] as string[], nextOpen: open, deferred: false }
    : planFiring({ keys: evaluation.findings.map((f) => f.key), open, lastFiredAt: rule.lastFiredAt, cooldownHours: rule.cooldownHours, now });
  result.deferred = plan.deferred;
  const fireSet = new Set(plan.fire);
  const fresh = evaluation.findings.filter((f) => fireSet.has(f.key));
  const summary = fresh.length ? evaluation.summarize(fresh) : null;

  // Optimistic concurrency: only the evaluation that saw the current version stores state and fires;
  // state and event are written together so a crash can't mark findings as alerted without an event.
  const event = await db.transaction(async (tx) => {
    const claimed = await tx
      .update(alertRules)
      .set({
        state: { open: plan.nextOpen, note: evaluation.skipped ?? null },
        evaluations: rule.evaluations + 1,
        lastEvaluatedAt: now,
        lastError: null,
        ...(summary ? { lastFiredAt: now } : {}),
      })
      .where(and(eq(alertRules.id, rule.id), eq(alertRules.evaluations, rule.evaluations)))
      .returning({ id: alertRules.id });
    if (!claimed.length || !summary) return null;
    const [row] = await tx
      .insert(alertEvents)
      .values({
        projectId: rule.projectId,
        ruleId: rule.id,
        kind: rule.kind,
        severity: summary.severity,
        title: summary.title.slice(0, 300),
        body: summary.body.slice(0, 4000),
        href: ctx.href,
        dedupeKey: dedupeHash(plan.fire),
        payload: {
          items: fresh.slice(0, 50),
          metric: evaluation.metric?.name ?? null,
          current: evaluation.metric?.current ?? null,
          previous: evaluation.metric?.previous ?? null,
          change: evaluation.metric?.change ?? null,
          unit: evaluation.metric?.unit ?? null,
          window: evaluation.window ?? null,
        },
        firedAt: now,
      })
      .returning();
    return row!;
  });
  if (!event) return result;
  result.fired = event;
  const { deliverAlertEvent } = await import("./deliver");
  try {
    result.fired = { ...event, delivery: await deliverAlertEvent(event, rule, projectName) };
  } catch (err) {
    console.error(`[alerts] delivery of ${event.id} failed`, err);
  }
  return result;
}

/** Evaluates every active rule of a project (or the given rule ids). */
export async function evaluateProject(projectId: string, opts: { ruleIds?: string[]; now?: Date } = {}): Promise<RuleEvaluation[]> {
  const [project] = await db.select({ name: projects.name }).from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) return [];
  const rules = await db
    .select()
    .from(alertRules)
    .where(and(eq(alertRules.projectId, projectId), eq(alertRules.active, true), opts.ruleIds?.length ? inArray(alertRules.id, opts.ruleIds) : undefined));
  const out: RuleEvaluation[] = [];
  for (const rule of rules) out.push(await evaluateRule(rule, { now: opts.now, projectName: project.name }));
  return out;
}
