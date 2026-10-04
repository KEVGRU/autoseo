import "server-only";
import { createHash } from "node:crypto";
import { PROVIDERS } from "@/lib/integrations-catalog";
import { addDays } from "@/server/analytics/period";
import { todayInTimeZone } from "@/server/analytics/traffic/normalize";
import { posthogConfig, POSTHOG_COLUMNS, posthogTrafficQuery, type PostHogConfig, type PostHogTrafficRow } from "@/server/analytics/traffic/posthog";
import { getIntegration, readSecret } from "./store";
import { httpJson, IntegrationHttpError } from "./http";

export type PostHogCredentials = PostHogConfig & { apiKey: string };
export class PostHogError extends Error {}

type Endpoint = { name: string; is_active: boolean; current_version: number; query: { kind: string; query: string; variables?: Record<string, { code_name: string; variableId: string }> } };
type Variable = { id: string; code_name: string; type: string };
type Report = { name: string; endpoint_version: number; columns: string[]; results: unknown[][]; hasMore: boolean; error?: string; query_status?: { complete?: boolean; error?: string } };
const ROW_LIMIT = 2000;

export function posthogEndpointName(config: PostHogConfig): string {
  return `autoseo_website_traffic_${createHash("sha256").update(posthogTrafficQuery(config)).digest("hex").slice(0, 16)}`;
}

async function posthogCall<T>(creds: PostHogCredentials, path: string, body?: unknown): Promise<T> {
  try {
    return await httpJson<T>(`${creds.host}/api/projects/${creds.projectId}/${path}`, {
      untrusted: true, timeoutMs: 120_000, maxBytes: 5 * 1024 * 1024,
      headers: { Authorization: `Bearer ${creds.apiKey}` }, ...(body === undefined ? {} : { method: "POST", body }),
    });
  } catch (error) {
    if (error instanceof IntegrationHttpError && [401, 403].includes(error.status))
      throw new PostHogError("PostHog rejected the API key or its permissions. Use a personal API key with Endpoint read access; automatic setup also needs Endpoint and SQL variable write access.");
    throw error;
  }
}

function validateEndpoint(endpoint: Endpoint, creds: PostHogConfig): Endpoint {
  const codes = Object.values(endpoint?.query?.variables ?? {}).map((v) => v.code_name).sort();
  if (!endpoint?.is_active || endpoint.current_version !== 1 || endpoint.name !== posthogEndpointName(creds) ||
      endpoint.query?.kind !== "HogQLQuery" || endpoint.query.query !== posthogTrafficQuery(creds) ||
      JSON.stringify(codes) !== JSON.stringify(["autoseo_date_from", "autoseo_date_to"]))
    throw new PostHogError("The AutoSEO reporting endpoint was changed or disabled. Restore its original query and version, or reconnect with a different reporting configuration.");
  return endpoint;
}

/** Setup is idempotent. Existing reports need only read access; new configurations create a saved aggregate report. */
export async function ensurePostHogEndpoint(creds: PostHogCredentials): Promise<Endpoint> {
  const name = posthogEndpointName(creds);
  try { return validateEndpoint(await posthogCall<Endpoint>(creds, `endpoints/${name}/?version=1`), creds); }
  catch (error) { if (!(error instanceof IntegrationHttpError && error.status === 404)) throw error; }
  const variables: Variable[] = [];
  // SQL-variable metadata only. Do not follow upstream URLs with credentials.
  for (let offset = 0; offset < 10_000; offset += 100) {
    const page = await posthogCall<{ results: Variable[]; next: string | null }>(creds, `insight_variables/?limit=100&offset=${offset}`);
    if (!Array.isArray(page.results)) throw new PostHogError("PostHog returned unexpected SQL variable metadata.");
    variables.push(...page.results);
    if (!page.next) break;
    if (offset === 9900) throw new PostHogError("Too many SQL variables to configure the reporting endpoint.");
  }
  const today = todayInTimeZone(creds.timeZone);
  const definitions: Record<string, { variableId: string; code_name: string; value: string }> = {};
  for (const [code, label, value] of [["autoseo_date_from", "AutoSEO date from", addDays(today, -1)], ["autoseo_date_to", "AutoSEO date to", today]]) {
    const variable = variables.find((v) => v.code_name === code) ??
      await posthogCall<Variable>(creds, "insight_variables/", { name: label, type: "String", default_value: value });
    if (variable.code_name !== code || variable.type !== "String" || !/^[0-9a-f-]{36}$/i.test(variable.id))
      throw new PostHogError("AutoSEO date variables must be String variables with their original names.");
    definitions[variable.id] = { variableId: variable.id, code_name: code!, value: value! };
  }
  try {
    return validateEndpoint(await posthogCall<Endpoint>(creds, "endpoints/", {
      name, description: "Aggregated website traffic for AutoSEO. No individual events or identities are returned.",
      query: { kind: "HogQLQuery", query: posthogTrafficQuery(creds), variables: definitions },
      data_freshness_seconds: 86400, is_materialized: false,
    }), creds);
  } catch (error) {
    // A concurrent connection test may have created the same report.
    if (error instanceof IntegrationHttpError && [400, 409].includes(error.status))
      return validateEndpoint(await posthogCall<Endpoint>(creds, `endpoints/${name}/?version=1`), creds);
    throw error;
  }
}

export async function testPostHogConnection(creds: PostHogCredentials): Promise<string> {
  await ensurePostHogEndpoint(creds);
  const yesterday = addDays(todayInTimeZone(creds.timeZone), -1);
  await fetchPostHogTraffic(creds, yesterday, yesterday);
  return `Connected to PostHog project ${creds.projectId}. Website reporting is ready.`;
}

export async function getPostHogCredentials(projectId: string): Promise<PostHogCredentials | null> {
  const row = await getIntegration(projectId, PROVIDERS.posthog);
  const secret = row && readSecret<{ apiKey?: string }>(row);
  if (!row || !secret?.apiKey) return null;
  return { ...posthogConfig(row.config), apiKey: secret.apiKey };
}

/** Import aggregate reports only. Split busy windows by date, and reject truncated single-day reports. */
export async function fetchPostHogTraffic(creds: PostHogCredentials, from: string, to: string, checkCancelled?: () => Promise<void>): Promise<PostHogTrafficRow[]> {
  if (![from, to].every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && Number.isFinite(Date.parse(d)) && new Date(d).toISOString().slice(0, 10) === d) || from > to ||
      (Date.parse(to) - Date.parse(from)) / 86400000 > 6) throw new PostHogError("PostHog report windows must contain one to seven valid days.");
  await checkCancelled?.();
  const result = await posthogCall<Report>(creds, `endpoints/${posthogEndpointName(creds)}/run?version=1`, {
    variables: { autoseo_date_from: from, autoseo_date_to: addDays(to, 1) }, limit: ROW_LIMIT + 1, refresh: "cache",
  });
  if (!result || result.error || result.query_status?.complete === false || result.query_status?.error ||
      result.name !== posthogEndpointName(creds) || result.endpoint_version !== 1 || typeof result.hasMore !== "boolean" ||
      !Array.isArray(result.columns) || !result.columns.every((c) => typeof c === "string") ||
      !Array.isArray(result.results) || !result.results.every((r) => Array.isArray(r) && r.length === result.columns.length))
    throw new PostHogError("PostHog returned an incomplete or unexpected report. No data was replaced.");
  const indices = POSTHOG_COLUMNS.map((c) => result.columns.indexOf(c));
  if (indices.some((i) => i < 0) || new Set(result.columns).size !== result.columns.length)
    throw new PostHogError("PostHog returned unexpected traffic columns.");
  if (result.hasMore || result.results.length > ROW_LIMIT) {
    if (from === to) throw new PostHogError("This website exceeds 2,000 reporting groups in one day. Restrict the website hostname before syncing.");
    const middle = addDays(from, Math.floor((Date.parse(to) - Date.parse(from)) / 86400000 / 2));
    const first = await fetchPostHogTraffic(creds, from, middle, checkCancelled);
    const second = await fetchPostHogTraffic(creds, addDays(middle, 1), to, checkCancelled);
    return [...first, ...second];
  }
  return result.results.map((r) => Object.fromEntries(POSTHOG_COLUMNS.map((c, i) => [c, r[indices[i]!]])) as PostHogTrafficRow);
}
