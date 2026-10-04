import { addDays } from "../period";
import { classifyAiSource } from "../ai-platforms";
import { normalizeCountry, normalizeLandingPage, TrafficAggregator, type ChannelDayTotals } from "./normalize";

export const POSTHOG_CONFIG_KEYS = ["projectId", "host", "port", "database", "user", "schema", "table", "caCertificate", "hostname", "timeZone", "currency", "conversionEvents", "revenueEvent", "revenueProperty"] as const;
export type PostHogConfig = Record<(typeof POSTHOG_CONFIG_KEYS)[number], string>;

export function posthogConfig(values: Record<string, unknown>): PostHogConfig {
  const c = Object.fromEntries(POSTHOG_CONFIG_KEYS.map((k) => [k, String(values[k] ?? "").trim()])) as PostHogConfig;
  if (!/^[1-9]\d*$/.test(c.projectId) || Number(c.projectId) > 2147483647) throw new Error("PostHog project ID must be a positive integer.");
  if (!c.host || /[\s/@?#]/.test(c.host)) throw new Error("Enter a database hostname or IP without a URL scheme or port.");
  c.host = c.host.toLowerCase();
  c.port ||= "5432";
  if (!/^\d+$/.test(c.port) || Number(c.port) < 1024 || Number(c.port) > 65535) throw new Error("Database port must be between 1024 and 65535.");
  if (!c.database || !c.user) throw new Error("Database name and read-only username are required.");
  c.schema ||= "posthog_exports";
  c.table ||= "events";
  for (const name of [c.schema, c.table]) if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/.test(name)) throw new Error("Schema and table names must use letters, digits and underscores.");
  if (c.caCertificate) {
    try { if (!atob(c.caCertificate).includes("-----BEGIN CERTIFICATE-----")) throw new Error(); } catch { throw new Error("CA certificate must be a base64-encoded PEM certificate."); }
  }
  c.timeZone ||= "UTC";
  try { new Intl.DateTimeFormat("en", { timeZone: c.timeZone }); } catch { throw new Error("Enter a valid IANA time zone."); }
  c.currency = (c.currency || "EUR").toUpperCase();
  if (!/^[A-Z]{3}$/.test(c.currency)) throw new Error("Currency must be a three-letter ISO code.");
  c.hostname = c.hostname.toLowerCase();
  if (c.hostname && !/^(?=.{1,253}$)[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(c.hostname)) throw new Error("Enter a hostname without a scheme or path.");
  const events = [...new Set(c.conversionEvents.split(",").map((v) => v.trim()).filter(Boolean))];
  if (events.length > 20 || events.some((v) => v.length > 200)) throw new Error("Use at most 20 conversion events, each up to 200 characters.");
  c.conversionEvents = events.sort().join(",");
  if (!!c.revenueEvent !== !!c.revenueProperty) throw new Error("Set both the revenue event and its numeric property, or leave both blank.");
  if (c.revenueEvent.length > 200 || c.revenueProperty.length > 200) throw new Error("Revenue event and property must be at most 200 characters.");
  return c;
}

/** Values are bound parameters; validated schema/table names are quoted identifiers. */
export function posthogTrafficQuery(c: PostHogConfig, from: string, to: string) {
  if (![from, to].every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)) || from > to) throw new Error("Invalid PostHog import range.");
  for (const name of [c.schema, c.table]) if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/.test(name)) throw new Error("Invalid export table.");
  const parameters = [from, addDays(to, 1), c.timeZone, c.hostname, c.conversionEvents ? c.conversionEvents.split(",") : [], c.revenueEvent, c.revenueProperty, c.projectId];
  const query = `WITH events AS (
    SELECT DISTINCT ON (uuid) uuid, event, properties, distinct_id, timestamp::timestamptz AS ts
    FROM "${c.schema}"."${c.table}"
    WHERE team_id = $8::integer AND timestamp >= (($1::date - INTERVAL '1 day')::timestamp AT TIME ZONE $3)
      AND timestamp < (($2::date + INTERVAL '1 day')::timestamp AT TIME ZONE $3)
    ORDER BY uuid, timestamp DESC
  ), sessions AS (
    SELECT properties->>'$session_id' AS sid, min(ts) AS started,
      EXTRACT(EPOCH FROM max(ts) - min(ts)) AS duration,
      (array_agg(properties ORDER BY ts, uuid) FILTER (WHERE event = '$pageview'))[1] AS entry,
      (array_agg(distinct_id ORDER BY ts DESC, uuid))[1] AS visitor,
      count(*) FILTER (WHERE event = '$pageview') AS pageviews,
      count(*) FILTER (WHERE event = '$autocapture') AS interactions,
      count(*) FILTER (WHERE event = ANY($5::text[])) AS conversions,
      sum(CASE WHEN event = $6 AND properties->>$7 ~ '^-?[0-9]+([.][0-9]+)?([eE][+-]?[0-9]+)?$'
        THEN (properties->>$7)::numeric ELSE 0 END) AS revenue
    FROM events WHERE nullif(properties->>'$session_id', '') IS NOT NULL
    GROUP BY properties->>'$session_id'
  ), visits AS (
    SELECT to_char(started AT TIME ZONE $3, 'YYYY-MM-DD') AS date,
      coalesce(entry->>'$pathname', entry->>'$current_url', '') AS page,
      coalesce(entry->>'$geoip_country_code', '') AS country,
      coalesce(entry->>'utm_source', entry->>'$utm_source', '') AS source,
      coalesce(entry->>'$referring_domain', entry->>'$referrer', '') AS referrer,
      coalesce(entry->>'utm_medium', entry->>'$utm_medium', '') AS medium,
      duration, pageviews, interactions, conversions, revenue, visitor
    FROM sessions WHERE pageviews > 0
      AND started >= ($1::date::timestamp AT TIME ZONE $3)
      AND started < ($2::date::timestamp AT TIME ZONE $3)
      AND ($4 = '' OR lower(substring(entry->>'$current_url' from '^https?://([^/:?#]+)')) = $4)
  ) SELECT date, page, country, source, referrer, medium,
    count(*) AS sessions,
    count(*) FILTER (WHERE duration >= 10 OR pageviews > 1 OR interactions > 0) AS "engagedSessions",
    count(*) FILTER (WHERE conversions > 0) AS "convertedSessions",
    sum(conversions) AS conversions, sum(revenue) AS revenue,
    sum(duration) AS "engagementSeconds", count(DISTINCT visitor) AS users, sum(pageviews) AS pageviews
  FROM visits GROUP BY date, page, country, source, referrer, medium
  ORDER BY date, page, country, source, referrer, medium LIMIT 50001`;
  return { query, parameters };
}

export const POSTHOG_COLUMNS = ["date", "page", "country", "source", "referrer", "medium", "sessions", "engagedSessions", "convertedSessions", "conversions", "revenue", "engagementSeconds", "users", "pageviews"] as const;
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
    if (!platform && isOrganicSource(String(r.medium ?? ""), String(r.referrer ?? ""))) {
      const day = organic.get(date) ?? { date, sessions: 0, engagedSessions: 0, convertedSessions: 0, conversions: 0, revenue: 0, engagementSeconds: 0, users: 0, pageviews: 0 };
      for (const key of Object.keys(metrics) as (keyof typeof metrics)[]) day[key] = (day[key] ?? 0) + metrics[key];
      organic.set(date, day);
    }
  }
  return { rows: ai.rows(), totals: [...totals.values()], organic: [...organic.values()] };
}

/** An export-only benchmark: infer organic acquisition from UTM medium or search referrer. */
export function isOrganicSource(medium: string, referrer: string): boolean {
  if (medium.toLowerCase() === "organic") return true;
  if (medium.trim()) return false;
  let host: string;
  try { host = new URL(referrer.includes("://") ? referrer : `https://${referrer}`).hostname.toLowerCase(); } catch { return false; }
  return /(^|\.)(google\.(?:com|[a-z]{2}|(?:co|com)\.[a-z]{2})|bing\.com|duckduckgo\.com|search\.yahoo\.com|baidu\.com|yandex\.(?:com|ru|[a-z]{2}))$/.test(host);
}
