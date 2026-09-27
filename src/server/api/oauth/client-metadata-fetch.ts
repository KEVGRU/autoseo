import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { oauthClients } from "@/server/db/schema";
import { safeFetch, UnsafeUrlError } from "@/server/optimize/net";
import { checkRateLimit } from "../rate-limit";
import {
  MAX_METADATA_DOCUMENT_BYTES,
  METADATA_FETCH_TIMEOUT_MS,
  METADATA_STALE_IF_ERROR_MS,
  metadataCacheTtlMs,
  parseClientMetadataDocument,
  validateClientIdUrl,
} from "./client-metadata";

type OAuthClientRow = typeof oauthClients.$inferSelect;

/** Why a URL client_id could not be resolved. `transient` = the host was unreachable / errored (5xx). */
export class ClientMetadataError extends Error {
  constructor(
    message: string,
    public transient = false,
    /** Our own outbound-fetch limit was hit — never cached as a failure of the client. */
    public rateLimited = false,
  ) {
    super(message);
  }
}

export type FetchedDocument = { status: number; headers: Pick<Headers, "get">; body: string };
/** Injectable for tests; the default is the SSRF-safe fetcher (public hosts only, no redirects). */
export type MetadataFetcher = (url: string) => Promise<FetchedDocument>;

const defaultFetcher: MetadataFetcher = async (url) => {
  const res = await safeFetch(url, {
    headers: { accept: "application/json" },
    maxBytes: MAX_METADATA_DOCUMENT_BYTES,
    // The client_id must be the document URL — redirects are not followed.
    maxRedirects: 0,
    timeoutMs: METADATA_FETCH_TIMEOUT_MS,
  });
  return { status: res.status, headers: res.headers, body: res.text() };
};

/** Failed resolutions are remembered briefly so a bad client_id can't make us refetch in a loop. */
const NEGATIVE_TTL_MS = 60_000;
const failures = new Map<string, { until: number; error: ClientMetadataError }>();
const inflight = new Map<string, Promise<OAuthClientRow>>();

function rememberFailure(url: string, error: ClientMetadataError) {
  if (failures.size > 1000) failures.delete(failures.keys().next().value!);
  failures.set(url, { until: Date.now() + NEGATIVE_TTL_MS, error });
}

async function fetchDocument(
  url: string,
  fetcher: MetadataFetcher,
  opts: { known: boolean },
): Promise<{ doc: ReturnType<typeof parseClientMetadataDocument>; ttlMs: number }> {
  // Outbound fetches for never-seen URLs are triggered by unauthenticated requests — bound them per
  // client host and globally. Refreshes of known clients are already bounded by the cache TTL
  // (≥ 5 min per URL + in-flight de-duplication), so junk URLs can't starve them.
  if (!opts.known) {
    const host = new URL(url).host;
    const perHost = checkRateLimit(`oauth-cimd:${host}`, 30);
    const global = perHost.allowed ? checkRateLimit("oauth-cimd:*", 300) : perHost;
    if (!perHost.allowed || !global.allowed) throw new ClientMetadataError("Too many client metadata requests — try again in a minute.", true, true);
  }

  let res: FetchedDocument;
  try {
    res = await fetcher(url);
  } catch (err) {
    if (err instanceof UnsafeUrlError) throw new ClientMetadataError(`The client metadata URL is not allowed: ${err.message}`);
    const message = err instanceof Error ? err.message : String(err);
    if (/redirect/i.test(message)) throw new ClientMetadataError("The client metadata URL redirects — the client_id must be the document's final URL.");
    if (/larger than/i.test(message)) throw new ClientMetadataError(`The client metadata document is larger than ${MAX_METADATA_DOCUMENT_BYTES / 1024} KB.`);
    throw new ClientMetadataError(`Could not fetch the client metadata document (${message.slice(0, 120)}).`, true);
  }
  if (res.status >= 500) throw new ClientMetadataError(`The client metadata document is unavailable (HTTP ${res.status}).`, true);
  if (res.status !== 200) throw new ClientMetadataError(`The client metadata document could not be loaded (HTTP ${res.status}).`);
  let json: unknown;
  try {
    json = JSON.parse(res.body);
  } catch {
    throw new ClientMetadataError("The client metadata document is not valid JSON.");
  }
  return { doc: parseClientMetadataDocument(json, url), ttlMs: metadataCacheTtlMs(res.headers) };
}

async function refresh(url: string, existing: OAuthClientRow | null, fetcher: MetadataFetcher): Promise<OAuthClientRow> {
  const now = new Date();
  let fetched: Awaited<ReturnType<typeof fetchDocument>>;
  try {
    fetched = await fetchDocument(url, fetcher, { known: !!existing });
  } catch (err) {
    const e = err instanceof ClientMetadataError ? err : new ClientMetadataError(String(err), true);
    // Serve a stale copy while the client's host is temporarily unreachable (bounded).
    if (e.transient && existing?.metadataExpiresAt && existing.metadataExpiresAt.getTime() + METADATA_STALE_IF_ERROR_MS > now.getTime()) {
      return existing;
    }
    throw e;
  }
  if (!fetched.doc.ok) throw new ClientMetadataError(fetched.doc.error);
  const d = fetched.doc.doc;
  const values = {
    name: d.name,
    redirectUris: d.redirectUris,
    grantTypes: d.grantTypes,
    responseTypes: d.responseTypes,
    tokenEndpointAuthMethod: "none" as const,
    clientSecretHash: null,
    scope: d.scope,
    clientUri: d.clientUri,
    logoUri: d.logoUri,
    softwareId: d.softwareId,
    softwareVersion: d.softwareVersion,
    metadata: d.raw,
    registration: "metadata_document" as const,
    metadataFetchedAt: now,
    metadataExpiresAt: new Date(now.getTime() + fetched.ttlMs),
  };
  const [row] = await db
    .insert(oauthClients)
    .values({ id: url, ...values })
    .onConflictDoUpdate({ target: oauthClients.id, set: values })
    .returning();
  return row!;
}

/**
 * Resolves a URL-formatted client_id: returns the cached client while fresh, otherwise fetches the
 * metadata document (SSRF-safe, ≤ 8 KB, no redirects), validates it and upserts the oauth_clients
 * row (id = URL) so grants, codes and tokens can reference it like any registered client.
 */
export async function resolveMetadataDocumentClient(url: string, opts: { fetcher?: MetadataFetcher } = {}): Promise<OAuthClientRow> {
  const urlError = validateClientIdUrl(url);
  if (urlError) throw new ClientMetadataError(urlError);

  const [existing] = await db.select().from(oauthClients).where(eq(oauthClients.id, url)).limit(1);
  if (existing && existing.registration !== "metadata_document") throw new ClientMetadataError("Unknown client_id.");
  if (existing?.metadataExpiresAt && existing.metadataExpiresAt.getTime() > Date.now()) return existing;

  const failed = failures.get(url);
  if (failed && failed.until > Date.now() && !opts.fetcher) throw failed.error;

  const pending = inflight.get(url);
  if (pending && !opts.fetcher) return pending;
  const p = refresh(url, existing ?? null, opts.fetcher ?? defaultFetcher)
    .then((row) => {
      failures.delete(url);
      return row;
    })
    .catch((err: unknown) => {
      const e = err instanceof ClientMetadataError ? err : new ClientMetadataError(err instanceof Error ? err.message : String(err), true);
      if (!e.rateLimited) rememberFailure(url, e);
      throw e;
    })
    .finally(() => inflight.delete(url));
  if (!opts.fetcher) inflight.set(url, p);
  return p;
}
