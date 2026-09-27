import "server-only";
import { and, eq, gte, inArray, lt, ne, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { events, instances, users, type Attribution } from "@/server/db/schema";
import { site } from "@/lib/site";
import { buildBreakdown, campaignKey, type BreakdownRow } from "./breakdown";
import { daysIn, type Range } from "./periods";

const PRICING_PATHS = ["/pricing", "/de/pricing"];
const SIGNUP_PATHS = ["/signup"];
const TOP = 15;

export type GrowthReport = {
  /** First recorded page view ever (null: no statistics yet). */
  trackingStartedAt: Date | null;
  /** Unique visitors per day, summed (the visitor hash changes daily). */
  visitors: number;
  pricingVisitors: number;
  signupVisitors: number;
  accounts: number;
  /** Accounts with a known sign-up channel (created after tracking started, with matching page views). */
  trackedAccounts: number;
  checkouts: number;
  /** New paying customers: accounts whose first subscription became active in the period. */
  paid: number;
  /** New paying customers whose account has a known sign-up channel. */
  trackedPaid: number;
  /** Right now: live paid subscriptions (active / past_due), their MRR and how many are set to cancel. */
  activeSubscriptions: number;
  mrrUsd: number;
  cancelScheduled: number;
  /** Live subscriptions and MRR per billing interval ("month" / "year"). */
  plans: { interval: string; subscriptions: number; mrrUsd: number }[];
  /** New paying customers of the period by plan and offer (from their first `billing.checkout_paid`). */
  newPaidByPlan: { plan: string; offer: string | null; customers: number }[];
  cancellations: number;
  channels: BreakdownRow[];
  campaigns: BreakdownRow[];
  landingPages: { path: string; visitors: number; accounts: number }[];
  referrers: { host: string; channel: string; visitors: number }[];
  countries: { country: string; visitors: number }[];
  devices: { device: string; visitors: number }[];
  interactions: { name: string; total: number; visitors: number }[];
  daily: { day: string; visitors: number; accounts: number; paid: number }[];
};

type Counted = { key: string | null; n: number };

/** Raw `sql` parameters aren't mapped by column type: timestamps go to postgres-js as ISO strings. */
const iso = (d: Date) => d.toISOString();

/**
 * One row per visitor and UTC day: its first page view with a real channel (the ad or link it came from), or its
 * first page view when it only came directly. Its path is the landing page.
 */
function visitorDays(r: Range) {
  return sql`
    select distinct on (day, visitor_hash) day, visitor_hash, channel, path, referrer_host, utm_source, utm_campaign, utm_content, country, device
    from (
      select to_char(created_at at time zone 'UTC', 'YYYY-MM-DD') as day, *
      from analytics_events
      where name = 'pageview' and created_at >= ${iso(r.from)} and created_at < ${iso(r.to)}
    ) pv
    order by day, visitor_hash, (channel = 'Direct'), created_at`;
}

/** Visitor-days grouped by one column of `visitorDays`. */
async function visitorsBy(r: Range, column: "channel" | "path" | "country" | "device" | "day"): Promise<Counted[]> {
  const rows = await db.execute<Counted>(
    sql`select ${sql.identifier(column)} as key, count(*)::int as n from (${visitorDays(r)}) vd group by 1 order by n desc`,
  );
  return [...rows];
}

async function visitorTotals(r: Range) {
  const visitorDay = sql`to_char(created_at at time zone 'UTC', 'YYYY-MM-DD') || visitor_hash`;
  const [row] = await db.execute<{ visitors: number; pricing: number; signup: number }>(sql`
    select count(distinct ${visitorDay})::int as visitors,
      count(distinct ${visitorDay}) filter (where path in ${PRICING_PATHS})::int as pricing,
      count(distinct ${visitorDay}) filter (where path in ${SIGNUP_PATHS})::int as signup
    from analytics_events
    where name = 'pageview' and created_at >= ${iso(r.from)} and created_at < ${iso(r.to)}`);
  return row ?? { visitors: 0, pricing: 0, signup: 0 };
}

async function campaignVisitors(r: Range) {
  const rows = await db.execute<{ source: string | null; campaign: string | null; content: string | null; n: number }>(sql`
    select utm_source as source, utm_campaign as campaign, utm_content as content, count(*)::int as n
    from (${visitorDays(r)}) vd
    where coalesce(utm_source, utm_campaign, utm_content) is not null
    group by 1, 2, 3`);
  return [...rows];
}

async function referrerVisitors(r: Range) {
  const rows = await db.execute<{ host: string; channel: string; n: number }>(sql`
    select referrer_host as host, max(channel) as channel, count(*)::int as n
    from (${visitorDays(r)}) vd
    where referrer_host is not null
    group by 1 order by n desc limit ${TOP}`);
  return [...rows];
}

async function interactions(r: Range) {
  const rows = await db.execute<{ name: string; total: number; visitors: number }>(sql`
    select name, count(*)::int as total, count(distinct to_char(created_at at time zone 'UTC', 'YYYY-MM-DD') || visitor_hash)::int as visitors
    from analytics_events
    where name <> 'pageview' and created_at >= ${iso(r.from)} and created_at < ${iso(r.to)}
    group by name order by total desc`);
  return [...rows];
}

async function trackingStartedAt(): Promise<Date | null> {
  const [row] = await db.execute<{ first: Date | string | null }>(sql`select min(created_at) as first from analytics_events`);
  return row?.first ? new Date(row.first) : null;
}

/** Accounts created in the period — excluding admins and accounts an admin created for a free workspace grant. */
function newAccounts(r: Range) {
  return db
    .select({ createdAt: users.createdAt, attribution: users.attribution })
    .from(users)
    .where(
      and(
        gte(users.createdAt, r.from),
        lt(users.createdAt, r.to),
        eq(users.isAdmin, false),
        sql`not exists (select 1 from ${events} e where e.type = 'auth.user_created_by_admin' and e.user_id = ${users.id})`,
      ),
    );
}

/** Accounts that started a checkout in the period (admins excluded). */
function checkoutAccounts(r: Range) {
  return db
    .selectDistinctOn([events.userId], { userId: events.userId, attribution: users.attribution })
    .from(events)
    .innerJoin(users, eq(users.id, events.userId))
    .where(and(eq(events.type, "billing.checkout_created"), gte(events.createdAt, r.from), lt(events.createdAt, r.to), eq(users.isAdmin, false)));
}

/** Accounts whose first subscription became active in the period (admins excluded; resubscribes aren't new). */
async function newPayingAccounts(r: Range) {
  const rows = await db.execute<{ first_paid: Date | string; plan: string | null; offer: string | null; attribution: Attribution | null }>(sql`
    select p.first_paid, p.plan, p.offer, u.attribution
    from (
      select distinct on (user_id) user_id, created_at as first_paid, data ->> 'plan' as plan, data ->> 'offer' as offer
      from events
      where type = 'billing.checkout_paid' and user_id is not null
      order by user_id, created_at
    ) p
    join users u on u.id = p.user_id
    where p.first_paid >= ${iso(r.from)} and p.first_paid < ${iso(r.to)} and not u.is_admin`);
  return [...rows].map((row) => ({ paidAt: new Date(row.first_paid), plan: row.plan ?? "monthly", offer: row.offer, attribution: row.attribution }));
}

/** MRR of a subscription synced before `instances.mrr_cents` existed (all of those were monthly plans). */
const FALLBACK_MRR_CENTS = site.priceMonthlyUsd * 100;

/**
 * Live paid subscriptions right now (complimentary instances and admins excluded), per billing interval: count, MRR
 * (from `mrr_cents`, see src/server/mrr.ts) and how many are set to cancel.
 */
async function subscriptions() {
  const rows = await db
    .select({
      interval: sql<string>`coalesce(${instances.planInterval}, 'month')`,
      active: sql<number>`count(*)::int`,
      mrrCents: sql<number>`coalesce(sum(coalesce(${instances.mrrCents}, ${FALLBACK_MRR_CENTS})), 0)::int`,
      cancelScheduled: sql<number>`(count(*) filter (where ${instances.cancelAtPeriodEnd}))::int`,
    })
    .from(instances)
    .innerJoin(users, eq(users.id, instances.userId))
    .where(
      and(
        inArray(instances.subscriptionStatus, ["active", "past_due"]),
        eq(instances.complimentary, false),
        ne(instances.status, "deleted"),
        eq(users.isAdmin, false),
      ),
    )
    .groupBy(sql`1`);
  return {
    active: rows.reduce((n, r) => n + r.active, 0),
    mrrCents: rows.reduce((n, r) => n + r.mrrCents, 0),
    cancelScheduled: rows.reduce((n, r) => n + r.cancelScheduled, 0),
    plans: rows
      .map((r) => ({ interval: r.interval, subscriptions: r.active, mrrUsd: r.mrrCents / 100 }))
      .sort((a, b) => b.subscriptions - a.subscriptions),
  };
}

/** Subscriptions that ended (canceled) in the period. */
async function cancellations(r: Range): Promise<number> {
  const [row] = await db.execute<{ n: number }>(sql`
    select count(distinct e.instance_id)::int as n
    from events e
    join instances i on i.id = e.instance_id
    left join users u on u.id = i.user_id
    where e.type = 'billing.subscription_synced' and e.data ->> 'status' = 'canceled'
      and e.created_at >= ${iso(r.from)} and e.created_at < ${iso(r.to)}
      and not i.complimentary and not coalesce(u.is_admin, false)`);
  return row?.n ?? 0;
}

const channelOf = (a: Attribution | null) => a?.channel ?? "Unknown";
const campaignOf = (a: Attribution | null) => (a ? campaignKey(a.source, a.campaign, a.content) : null);
const dayOf = (d: Date) => d.toISOString().slice(0, 10);

function tally<T>(items: T[], keyOf: (item: T) => string | null): Map<string, number> {
  const out = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    if (key) out.set(key, (out.get(key) ?? 0) + 1);
  }
  return out;
}

/** Everything on the /admin → Growth tab for one period. */
export async function growthReport(r: Range): Promise<GrowthReport> {
  const [started, totals, byChannel, byCampaign, byPath, byCountry, byDevice, byDay, referrers, clicks, accounts, checkouts, paid, subs, canceled] =
    await Promise.all([
      trackingStartedAt(),
      visitorTotals(r),
      visitorsBy(r, "channel"),
      campaignVisitors(r),
      visitorsBy(r, "path"),
      visitorsBy(r, "country"),
      visitorsBy(r, "device"),
      visitorsBy(r, "day"),
      referrerVisitors(r),
      interactions(r),
      newAccounts(r),
      checkoutAccounts(r),
      newPayingAccounts(r),
      subscriptions(),
      cancellations(r),
    ]);

  const campaignVisitorCounts = new Map<string, number>();
  for (const row of byCampaign) {
    const key = campaignKey(row.source, row.campaign, row.content);
    if (key) campaignVisitorCounts.set(key, (campaignVisitorCounts.get(key) ?? 0) + row.n);
  }

  const accountsByPath = tally(accounts, (a) => a.attribution?.landingPath ?? null);
  const visitorsByPath = new Map(byPath.map((row) => [row.key ?? "", row.n]));
  const landingPaths = [...new Set([...byPath.slice(0, TOP).map((row) => row.key ?? ""), ...accountsByPath.keys()])].filter(Boolean);

  const visitorsByDay = new Map(byDay.map((row) => [row.key ?? "", row.n]));
  const accountsByDay = tally(accounts, (a) => dayOf(a.createdAt));
  const paidByDay = tally(paid, (p) => dayOf(p.paidAt));

  return {
    trackingStartedAt: started,
    visitors: totals.visitors,
    pricingVisitors: totals.pricing,
    signupVisitors: totals.signup,
    accounts: accounts.length,
    trackedAccounts: accounts.filter((a) => a.attribution).length,
    checkouts: checkouts.length,
    paid: paid.length,
    trackedPaid: paid.filter((p) => p.attribution).length,
    activeSubscriptions: subs.active,
    mrrUsd: subs.mrrCents / 100,
    cancelScheduled: subs.cancelScheduled,
    plans: subs.plans,
    newPaidByPlan: [...tally(paid, (p) => `${p.plan}\n${p.offer ?? ""}`)]
      .map(([key, customers]) => {
        const [plan, offer] = key.split("\n");
        return { plan: plan!, offer: offer || null, customers };
      })
      .sort((a, b) => b.customers - a.customers),
    cancellations: canceled,
    channels: buildBreakdown({
      visitors: byChannel.map((row) => [row.key ?? "Direct", row.n]),
      accounts: accounts.map((a) => channelOf(a.attribution)),
      checkouts: checkouts.map((c) => channelOf(c.attribution)),
      paid: paid.map((p) => channelOf(p.attribution)),
    }),
    campaigns: buildBreakdown({
      visitors: campaignVisitorCounts,
      accounts: accounts.map((a) => campaignOf(a.attribution)),
      checkouts: checkouts.map((c) => campaignOf(c.attribution)),
      paid: paid.map((p) => campaignOf(p.attribution)),
    }),
    landingPages: landingPaths
      .map((path) => ({ path, visitors: visitorsByPath.get(path) ?? 0, accounts: accountsByPath.get(path) ?? 0 }))
      .sort((a, b) => b.visitors - a.visitors || b.accounts - a.accounts)
      .slice(0, TOP),
    referrers: referrers.map((row) => ({ host: row.host, channel: row.channel, visitors: row.n })),
    countries: byCountry.slice(0, TOP).map((row) => ({ country: row.key ?? "Unknown", visitors: row.n })),
    devices: byDevice.map((row) => ({ device: row.key ?? "Unknown", visitors: row.n })),
    interactions: clicks,
    daily: daysIn(r).map((day) => ({
      day,
      visitors: visitorsByDay.get(day) ?? 0,
      accounts: accountsByDay.get(day) ?? 0,
      paid: paidByDay.get(day) ?? 0,
    })),
  };
}
