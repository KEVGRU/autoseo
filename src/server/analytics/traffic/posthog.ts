import { classifyAiSource } from "../ai-platforms";
import { normalizeCountry, normalizeLandingPage, TrafficAggregator, type ChannelDayTotals } from "./normalize";

export const POSTHOG_CONFIG_KEYS = ["host", "projectId", "hostname", "timeZone", "currency", "conversionEvents", "revenueEvent", "revenueProperty"] as const;
export type PostHogConfig = Record<(typeof POSTHOG_CONFIG_KEYS)[number], string>;

export function posthogConfig(values: Record<string, unknown>): PostHogConfig {
  const c = Object.fromEntries(POSTHOG_CONFIG_KEYS.map((k) => [k, String(values[k] ?? "").trim()])) as PostHogConfig;
  const host = new URL(c.host);
  if (host.protocol !== "https:" || host.username || host.password || host.search || host.hash || host.pathname !== "/")
    throw new Error("PostHog host must be an HTTPS origin without credentials, path, query or fragment.");
  c.host = host.toString().replace(/\/+$/, "");
  if (!/^[1-9]\d*$/.test(c.projectId) || Number(c.projectId) > 2147483647) throw new Error("PostHog project ID must be a positive integer.");
  c.timeZone ||= "UTC";
  try { new Intl.DateTimeFormat("en", { timeZone: c.timeZone }); } catch { throw new Error("Enter a valid IANA time zone."); }
  c.currency = (c.currency || "EUR").toUpperCase();
  if (!/^[A-Z]{3}$/.test(c.currency)) throw new Error("Currency must be a three-letter ISO code.");
  c.hostname = c.hostname.toLowerCase();
  if (c.hostname && !/^(?=.{1,253}$)[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(c.hostname)) throw new Error("Enter a hostname without a scheme or path.");
  const events = [...new Set(c.conversionEvents.split(",").map((s) => s.trim()).filter(Boolean))];
  if (events.length > 20 || events.some((s) => s.length > 200)) throw new Error("Use at most 20 conversion events, each up to 200 characters.");
  c.conversionEvents = events.sort().join(",");
  if (!!c.revenueEvent !== !!c.revenueProperty) throw new Error("Set both the revenue event and its numeric property, or leave both blank.");
  if (c.revenueEvent.length > 200 || c.revenueProperty.length > 200) throw new Error("Revenue event and property must be at most 200 characters.");
  return c;
}

/** Escape values, never interpolate user-controlled SQL identifiers. */
export function hogqlString(value: string): string {
  return `'${value.replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;
}

/** A saved aggregate report. Date bounds are typed Endpoint variables, never SQL fragments. */
export function posthogTrafficQuery(c: PostHogConfig): string {
  const q = hogqlString;
  const start = `toDateTime({variables.autoseo_date_from}, ${q(c.timeZone)})`;
  const end = `toDateTime({variables.autoseo_date_to}, ${q(c.timeZone)})`;
  const scanEnd = `addDays(${end}, 1)`;
  const conversions = c.conversionEvents ? `countIf(event IN (${c.conversionEvents.split(",").map(q).join(", ")}))` : "0";
  const revenue = c.revenueEvent ? `sumIf(toFloatOrZero(toString(properties[${q(c.revenueProperty)}])), event = ${q(c.revenueEvent)})` : "0";
  return `SELECT date, page, country, source, referrer, channel,
    count() AS sessions, countIf(bounce = 0) AS engagedSessions,
    countIf(session_conversions > 0) AS convertedSessions, sum(session_conversions) AS conversions,
    sum(session_revenue) AS revenue, sum(duration) AS engagementSeconds,
    uniqExact(person) AS users, sum(session_pageviews) AS pageviews
  FROM (
    SELECT session.session_id AS sid,
      toString(toDate(toTimeZone(any(session.$start_timestamp), ${q(c.timeZone)}))) AS date,
      any(session.$entry_pathname) AS page,
      argMinIf(properties.$geoip_country_code, timestamp, event = '$pageview') AS country,
      any(session.$entry_utm_source) AS source,
      any(session.$entry_referring_domain) AS referrer,
      any(session.$channel_type) AS channel,
      any(session.$is_bounce) AS bounce,
      any(session.$session_duration) AS duration,
      any(session.$pageview_count) AS session_pageviews, argMax(person_id, timestamp) AS person,
      ${conversions} AS session_conversions, ${revenue} AS session_revenue
    FROM events
    WHERE timestamp >= ${start} AND timestamp < ${scanEnd}
      AND session.$start_timestamp >= ${start} AND session.$start_timestamp < ${end}
      AND session.session_id IS NOT NULL
      ${c.hostname ? `AND domain(session.$entry_current_url) = ${q(c.hostname)}` : ""}
    GROUP BY sid
    HAVING session_pageviews > 0
  ) GROUP BY date, page, country, source, referrer, channel
  ORDER BY date, page, country, source, referrer, channel
  `;
}

export const POSTHOG_COLUMNS = ["date", "page", "country", "source", "referrer", "channel", "sessions", "engagedSessions", "convertedSessions", "conversions", "revenue", "engagementSeconds", "users", "pageviews"] as const;
export type PostHogTrafficRow = Record<(typeof POSTHOG_COLUMNS)[number], unknown>;

export function normalizePosthogRows(rows: PostHogTrafficRow[], from: string, to: string) {
  const ai = new TrafficAggregator();
  const totals = new Map<string, { date: string; sessions: number; conversions: number; revenue: number }>();
  const organic = new Map<string, ChannelDayTotals>();
  for (const r of rows) {
    const date = String(r.date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < from || date > to) throw new Error("PostHog returned a date outside the requested range.");
    const n = (key: typeof POSTHOG_COLUMNS[number]) => {
      const value = Number(r[key]);
      if (r[key] == null || !Number.isFinite(value) || (key !== "revenue" && value < 0)) throw new Error(`PostHog returned invalid ${key}.`);
      return value;
    };
    const metrics = { sessions: n("sessions"), engagedSessions: n("engagedSessions"), convertedSessions: n("convertedSessions"), conversions: n("conversions"), revenue: n("revenue"), engagementSeconds: n("engagementSeconds"), users: n("users"), pageviews: n("pageviews") };
    const total = totals.get(date) ?? { date, sessions: 0, conversions: 0, revenue: 0 };
    total.sessions += metrics.sessions; total.conversions += metrics.conversions; total.revenue += metrics.revenue;
    totals.set(date, total);
    const platform = classifyAiSource(String(r.source ?? ""), String(r.referrer ?? ""));
    if (platform) ai.add({ date, platform, page: normalizeLandingPage(String(r.page ?? "")), country: normalizeCountry(String(r.country ?? "")), ...metrics });
    if (!platform && String(r.channel ?? "").toLowerCase().replace(/[_-]/g, " ") === "organic search") {
      const day = organic.get(date) ?? { date, sessions: 0, engagedSessions: 0, convertedSessions: 0, conversions: 0, revenue: 0, engagementSeconds: 0, users: 0, pageviews: 0 };
      for (const key of Object.keys(metrics) as (keyof typeof metrics)[]) day[key] = (day[key] ?? 0) + metrics[key];
      organic.set(date, day);
    }
  }
  return { rows: ai.rows(), totals: [...totals.values()], organic: [...organic.values()] };
}
