/**
 * Pure normalization helpers for the traffic sync (GA4 / Matomo / Piwik PRO rows → normalized rows).
 * No server-only / alias imports (unit-tested with vitest).
 */
import { classifyAiSource } from "../ai-platforms";
import { addDays } from "../period";

export type NormalizedTrafficRow = {
  date: string;
  platform: string;
  page: string;
  country: string;
  sessions: number;
  engagedSessions: number;
  convertedSessions: number;
  conversions: number;
  revenue: number;
  engagementSeconds: number;
  users: number;
  /** Page views of these sessions (0 when the provider doesn't report them). */
  pageviews?: number;
};

/** Normalizes a landing page to its path ("(not set)" → ""). */
export function normalizeLandingPage(value: string | null | undefined): string {
  const v = (value ?? "").trim();
  if (!v || v === "(not set)" || v === "(other)") return "";
  let path = v;
  if (/^https?:\/\//i.test(v)) {
    try {
      path = new URL(v).pathname;
    } catch {
      path = v;
    }
  }
  path = path.split(/[?#]/)[0] ?? "";
  if (!path.startsWith("/")) path = `/${path}`;
  return path.length > 1 ? path.replace(/\/{2,}/g, "/") : "/";
}

/** ISO alpha-2 upper case, "" for unknown ("(not set)", "XX", "ZZ"). */
export function normalizeCountry(value: string | null | undefined): string {
  const v = (value ?? "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(v) && v !== "XX" && v !== "ZZ" ? v : "";
}

/** YYYY-MM-DD "today" in an IANA time zone (falls back to UTC). */
export function todayInTimeZone(tz: string | null | undefined, now: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz || "UTC", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

/** Splits [from, to] into windows of at most `days` days. */
export function dateWindows(from: string, to: string, days: number): { from: string; to: string }[] {
  const out: { from: string; to: string }[] = [];
  for (let start = from; start <= to; start = addDays(start, days)) {
    const end = addDays(start, days - 1);
    out.push({ from: start, to: end < to ? end : to });
  }
  return out;
}

/** GA4 `date` dimension (YYYYMMDD) → YYYY-MM-DD. */
export function ga4Date(v: unknown): string {
  const s = String(v ?? "");
  return /^\d{8}$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : s;
}

/** Maps one GA4 row (date, sessionSource, landingPage, countryId + metrics) to a normalized row. */
export function ga4RowToTraffic(r: Record<string, string | number | null>): NormalizedTrafficRow | null {
  const platform = classifyAiSource(String(r.sessionSource ?? ""));
  if (!platform) return null;
  const sessions = Number(r.sessions ?? 0) || 0;
  const rate = Math.max(0, Math.min(1, Number(r.sessionKeyEventRate ?? 0) || 0));
  return {
    date: ga4Date(r.date),
    platform,
    page: normalizeLandingPage(String(r.landingPage ?? "")),
    country: normalizeCountry(String(r.countryId ?? "")),
    sessions,
    engagedSessions: Number(r.engagedSessions ?? 0) || 0,
    convertedSessions: sessions * rate,
    conversions: Number(r.keyEvents ?? 0) || 0,
    revenue: Number(r.totalRevenue ?? 0) || 0,
    engagementSeconds: Number(r.userEngagementDuration ?? 0) || 0,
    users: Number(r.totalUsers ?? 0) || 0,
    pageviews: Number(r.screenPageViews ?? 0) || 0,
  };
}

/** Subset of a Matomo Live.getLastVisitsDetails visit. */
export type MatomoVisitLike = {
  serverDate?: string;
  firstActionTimestamp?: number;
  referrerName?: string;
  referrerUrl?: string;
  visitDuration?: number | string;
  actions?: number | string;
  countryCode?: string;
  visitConverted?: number | string;
  goalConversions?: number | string;
  actionDetails?: { type?: string; url?: string; revenue?: number | string }[];
};

function urlPath(url: string | undefined): string {
  if (!url) return "";
  try {
    return normalizeLandingPage(new URL(url).pathname);
  } catch {
    return normalizeLandingPage(url);
  }
}

/** Maps one Matomo visit to a normalized AI row (or null for non-AI visits). */
export function matomoVisitToRow(v: MatomoVisitLike): NormalizedTrafficRow | null {
  const platform = classifyAiSource(v.referrerName ?? "", v.referrerUrl ?? null);
  if (!platform) return null;
  const date = v.serverDate ?? (v.firstActionTimestamp ? new Date(v.firstActionTimestamp * 1000).toISOString().slice(0, 10) : null);
  if (!date) return null;
  const actions = v.actionDetails ?? [];
  const entry = actions.find((a) => a.type === "action" && a.url);
  const duration = Number(v.visitDuration ?? 0) || 0;
  const nActions = Number(v.actions ?? actions.length) || 0;
  const goalActions = actions.filter((a) => a.type === "goal").length;
  const goals = goalActions || Number(v.goalConversions ?? 0) || 0;
  const orders = actions.filter((a) => a.type === "ecommerceOrder").length;
  const revenue = actions
    .filter((a) => a.type === "goal" || a.type === "ecommerceOrder")
    .reduce((sum, a) => sum + (Number(a.revenue ?? 0) || 0), 0);
  const converted = Number(v.visitConverted ?? 0) > 0 || goals > 0 || orders > 0;
  return {
    date,
    platform,
    page: urlPath(entry?.url),
    country: normalizeCountry(v.countryCode),
    sessions: 1,
    // Non-bounce (more than one action) — Matomo's own bounce definition, so AI visits and the organic
    // benchmark (VisitsSummary visits − bounces) are measured the same way.
    engagedSessions: nActions > 1 ? 1 : 0,
    convertedSessions: converted ? 1 : 0,
    conversions: goals + orders,
    revenue,
    engagementSeconds: duration,
    users: 1,
    pageviews: actions.length ? actions.filter((a) => a.type === "action").length : nActions,
  };
}

/** Accumulates rows keyed by date × platform × page × country. */
export class TrafficAggregator {
  private map = new Map<string, NormalizedTrafficRow>();
  add(r: NormalizedTrafficRow) {
    const page = (r.page || "").slice(0, 1000);
    const key = `${r.date}|${r.platform}|${page}|${r.country}`;
    const cur = this.map.get(key);
    if (!cur) {
      this.map.set(key, { ...r, page });
      return;
    }
    cur.sessions += r.sessions;
    cur.engagedSessions += r.engagedSessions;
    cur.convertedSessions += r.convertedSessions;
    cur.conversions += r.conversions;
    cur.revenue += r.revenue;
    cur.engagementSeconds += r.engagementSeconds;
    cur.users += r.users;
    cur.pageviews = (cur.pageviews ?? 0) + (r.pageviews ?? 0);
  }
  rows(): NormalizedTrafficRow[] {
    return [...this.map.values()].filter((r) => r.sessions > 0 || r.conversions > 0);
  }
  get size() {
    return this.map.size;
  }
}

/* ───────────────────────────── Organic search channel (benchmark) ───────────────────────────── */

/** Daily totals of the organic-search channel (AI vs organic engagement benchmark). */
export type ChannelDayTotals = {
  date: string;
  sessions: number;
  engagedSessions: number;
  engagementSeconds: number;
  /** null = the provider doesn't report page views for the channel */
  pageviews: number | null;
  convertedSessions: number;
  conversions: number;
  revenue: number;
  users: number;
};

/** GA4 `sessionDefaultChannelGroup` value of organic search sessions. */
export const GA4_ORGANIC_CHANNEL = "Organic Search";

/** Maps a GA4 row (date + metrics, filtered to Organic Search) to channel totals. */
export function ga4OrganicRow(r: Record<string, string | number | null>): ChannelDayTotals {
  const sessions = Number(r.sessions ?? 0) || 0;
  const rate = Math.max(0, Math.min(1, Number(r.sessionKeyEventRate ?? 0) || 0));
  return {
    date: ga4Date(r.date),
    sessions,
    engagedSessions: Number(r.engagedSessions ?? 0) || 0,
    engagementSeconds: Number(r.userEngagementDuration ?? 0) || 0,
    pageviews: Number(r.screenPageViews ?? 0) || 0,
    convertedSessions: sessions * rate,
    conversions: Number(r.keyEvents ?? 0) || 0,
    revenue: Number(r.totalRevenue ?? 0) || 0,
    users: Number(r.totalUsers ?? 0) || 0,
  };
}

type MatomoSummary = { nb_visits?: number; sum_visit_length?: number; bounce_count?: number; nb_uniq_visitors?: number; nb_users?: number };
type MatomoGoals = { nb_conversions?: number; nb_visits_converted?: number; revenue?: number };
type MatomoActions = { nb_pageviews?: number };

const dayObject = <T,>(map: Record<string, unknown> | null | undefined, date: string): T | null => {
  const v = map?.[date];
  return v && !Array.isArray(v) && typeof v === "object" ? (v as T) : null;
};

/**
 * Matomo `VisitsSummary.get` + `Goals.get` + `Actions.get` (period=day, segment `referrerType==search`)
 * → channel totals. Engaged = visits − bounces (same non-bounce rule as the AI visits); page views come
 * from `Actions.get` (null when that call failed).
 */
export function matomoOrganicDays(
  summary: Record<string, unknown> | null | undefined,
  goals: Record<string, unknown> | null | undefined,
  actions?: Record<string, unknown> | null,
): ChannelDayTotals[] {
  const out: ChannelDayTotals[] = [];
  for (const [date, raw] of Object.entries(summary ?? {})) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const v = raw && !Array.isArray(raw) && typeof raw === "object" ? (raw as MatomoSummary) : {};
    const g = dayObject<MatomoGoals>(goals, date) ?? {};
    const a = actions ? (dayObject<MatomoActions>(actions, date) ?? {}) : null;
    const sessions = Number(v.nb_visits ?? 0) || 0;
    const bounces = Number(v.bounce_count ?? 0) || 0;
    const conversions = Number(g.nb_conversions ?? 0) || 0;
    out.push({
      date,
      sessions,
      engagedSessions: Math.max(0, sessions - bounces),
      engagementSeconds: Number(v.sum_visit_length ?? 0) || 0,
      pageviews: a ? Number(a.nb_pageviews ?? 0) || 0 : null,
      convertedSessions: Math.min(sessions, Number(g.nb_visits_converted ?? conversions) || 0),
      conversions,
      revenue: Number(g.revenue ?? 0) || 0,
      users: Number(v.nb_uniq_visitors ?? 0) || Number(v.nb_users ?? 0) || 0,
    });
  }
  return out;
}
