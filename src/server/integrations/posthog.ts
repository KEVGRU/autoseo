import "server-only";
import dns from "node:dns/promises";
import net from "node:net";
import tls from "node:tls";
import postgres, { type Sql } from "postgres";
import { PROVIDERS } from "@/lib/integrations-catalog";
import { isBlockedIp } from "@/server/ai/knowledge/safe-fetch";
import { posthogConfig, posthogTrafficQuery, type PostHogConfig, type PostHogTrafficRow } from "@/server/analytics/traffic/posthog";
import { getIntegration, readSecret } from "./store";

export type PostHogCredentials = PostHogConfig & { password: string };
export class PostHogError extends Error {}

/** Resolve once, reject internal destinations, and pin the connection while validating the original TLS identity. */
export async function resolveExportHost(host: string): Promise<string> {
  const addresses = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true });
  if (!addresses.length || addresses.some((a) => isBlockedIp(a.address)))
    throw new PostHogError("The export database must resolve exclusively to public IP addresses.");
  return addresses[0]!.address;
}

async function withDatabase<T>(creds: PostHogCredentials, run: (sql: Sql) => Promise<T>): Promise<T> {
  const address = await resolveExportHost(creds.host);
  const sql = postgres({
    host: address, port: Number(creds.port), database: creds.database, username: creds.user, password: creds.password,
    ssl: { rejectUnauthorized: true, ...(net.isIP(creds.host) ? {} : { servername: creds.host }),
      checkServerIdentity: (_hostname: string, certificate: tls.PeerCertificate) => tls.checkServerIdentity(creds.host, certificate),
      ...(creds.caCertificate ? { ca: Buffer.from(creds.caCertificate, "base64").toString("utf8") } : {}) },
    max: 1, connect_timeout: 10, idle_timeout: 5, prepare: false, fetch_types: false,
    connection: { application_name: "AutoSEO PostHog exports", statement_timeout: 120_000, default_transaction_read_only: true, timezone: "UTC" },
  });
  try { return await run(sql); }
  catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "28P01" || code === "42501") throw new PostHogError("Export database credentials or table permissions were rejected.");
    if (code === "42P01" || code === "42703") throw new PostHogError("The PostHog events export table is missing or has an incompatible schema.");
    throw error;
  } finally { await sql.end({ timeout: 5 }); }
}

/** Validate standard Events export columns before accepting a connection. No website data is returned. */
export async function testPostHogConnection(creds: PostHogCredentials): Promise<string> {
  return withDatabase(creds, async (sql) => {
    await sql`SELECT uuid, event, properties, distinct_id, team_id, timestamp FROM ${sql(creds.schema)}.${sql(creds.table)} LIMIT 0`;
    const columns = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = ${creds.schema} AND table_name = ${creds.table}`;
    const types = new Map(columns.map((c) => [c.column_name, c.data_type]));
    if (types.get("properties") !== "jsonb" || !["timestamp with time zone", "timestamp without time zone"].includes(types.get("timestamp")))
      throw new PostHogError("Use a standard PostHog Events export with JSONB properties and a timestamp column (UTC for timestamps without a time zone).");
    return `Connected to ${creds.schema}.${creds.table}. Ensure scheduled exports and historical backfill have completed before syncing.`;
  });
}

export async function getPostHogCredentials(projectId: string): Promise<PostHogCredentials | null> {
  const row = await getIntegration(projectId, PROVIDERS.posthog);
  const secret = row && readSecret<{ password?: string }>(row);
  if (!row || !secret?.password) return null;
  return { ...posthogConfig(row.config), password: secret.password };
}

export async function queryPostHogTraffic(sql: Sql, creds: PostHogConfig, from: string, to: string): Promise<PostHogTrafficRow[]> {
  const { query, parameters } = posthogTrafficQuery(creds, from, to);
  const rows = await sql.unsafe(query, parameters as postgres.ParameterOrJSON<never>[]);
  if (rows.length > 50_000) throw new PostHogError("Too many aggregated rows in one import window. Restrict the website hostname.");
  return rows as unknown as PostHogTrafficRow[];
}

export async function fetchPostHogTraffic(creds: PostHogCredentials, from: string, to: string, checkCancelled?: () => Promise<void>) {
  await checkCancelled?.();
  return withDatabase(creds, (sql) => queryPostHogTraffic(sql, creds, from, to));
}
