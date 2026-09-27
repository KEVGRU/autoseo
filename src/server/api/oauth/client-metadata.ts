import "server-only";
import { z } from "zod";
import { parsePublicUrl, UnsafeUrlError } from "@/server/optimize/net";
import { isLoopbackHost, validateRedirectUri } from "./redirect-uris";

/*
 * OAuth Client ID Metadata Documents (draft-ietf-oauth-client-id-metadata-document, required by
 * the MCP authorization spec 2025-11-25): a client uses the https URL of a JSON document it hosts
 * as its `client_id`; the authorization server fetches that document instead of requiring
 * registration. Pure rules live here; fetching/caching is in client-metadata-fetch.ts.
 */

/** Upper bound for the client_id URL (it becomes the primary key of oauth_clients). */
export const MAX_CLIENT_ID_URL_LENGTH = 1024;
/** The draft recommends a small response size limit for metadata documents. */
export const MAX_METADATA_DOCUMENT_BYTES = 8 * 1024;
export const METADATA_FETCH_TIMEOUT_MS = 5_000;
/** Cache lifetime bounds (HTTP cache headers are respected within these). */
export const METADATA_MIN_TTL_MS = 5 * 60 * 1000;
export const METADATA_MAX_TTL_MS = 24 * 60 * 60 * 1000;
export const METADATA_DEFAULT_TTL_MS = 60 * 60 * 1000;
/** A stale copy may be used this long past expiry while the client's host is unreachable (5xx / network). */
export const METADATA_STALE_IF_ERROR_MS = 24 * 60 * 60 * 1000;

/** URL-formatted client ids are resolved as metadata documents; everything else is a registered id. */
export function isMetadataDocumentClientId(clientId: string | null | undefined): boolean {
  return typeof clientId === "string" && /^https:\/\//i.test(clientId);
}

/** Raw path of a URL string (before WHATWG normalisation removes dot segments). */
function rawPath(raw: string): string {
  const afterScheme = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
  const slash = afterScheme.search(/[/?#]/);
  if (slash < 0 || afterScheme[slash] !== "/") return "";
  return afterScheme.slice(slash).split(/[?#]/)[0] ?? "";
}

/**
 * client_id URL rules: https, a path component, no fragment, no userinfo, no dot segments, a public
 * host on a standard port (the server fetches it — SSRF). Returns an error message or null.
 */
export function validateClientIdUrl(raw: string): string | null {
  if (raw.length > MAX_CLIENT_ID_URL_LENGTH) return `client_id URL is longer than ${MAX_CLIENT_ID_URL_LENGTH} characters.`;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return "client_id is not a valid URL.";
  }
  if (u.protocol !== "https:") return "client_id URL must use the https scheme.";
  if (raw.includes("#")) return "client_id URL must not contain a fragment.";
  if (u.username || u.password || /^https:\/\/[^/?#]*@/i.test(raw)) return "client_id URL must not contain a username or password.";
  const path = rawPath(raw);
  if (!path || path === "/") return "client_id URL must contain a path, e.g. https://app.example.com/oauth/client.json.";
  if (path.split("/").some((seg) => /^(\.|%2e){1,2}$/i.test(seg))) return "client_id URL must not contain dot path segments.";
  try {
    parsePublicUrl(raw);
  } catch (err) {
    if (err instanceof UnsafeUrlError) return `client_id URL is not allowed: ${err.message}`;
    throw err;
  }
  return null;
}

const httpsUrl = z
  .string()
  .max(2048)
  .refine((v) => {
    try {
      return new URL(v).protocol === "https:";
    } catch {
      return false;
    }
  }, "must be an https URL");

/** Shared-secret client authentication is forbidden for metadata-document clients (draft §4). */
const SYMMETRIC_AUTH_METHODS = new Set(["client_secret_post", "client_secret_basic", "client_secret_jwt"]);

const documentSchema = z.object({
  client_id: z.string().min(1),
  client_name: z.string().trim().min(1, "client_name is required").max(200),
  redirect_uris: z.array(z.string()).min(1, "redirect_uris must list at least one URI").max(20),
  token_endpoint_auth_method: z.string().max(100).optional(),
  grant_types: z.array(z.string().max(100)).max(10).optional(),
  response_types: z.array(z.string().max(100)).max(10).optional(),
  scope: z.string().max(500).optional(),
  client_uri: httpsUrl.optional(),
  logo_uri: httpsUrl.optional(),
  software_id: z.string().max(200).optional(),
  software_version: z.string().max(100).optional(),
  contacts: z.array(z.string().max(320)).max(10).optional(),
  tos_uri: httpsUrl.optional(),
  policy_uri: httpsUrl.optional(),
});

export type ClientMetadataDocument = {
  clientId: string;
  name: string;
  redirectUris: string[];
  grantTypes: string[];
  responseTypes: string[];
  scope: string | null;
  clientUri: string | null;
  logoUri: string | null;
  softwareId: string | null;
  softwareVersion: string | null;
  /** Sanitised document as stored in oauth_clients.metadata. */
  raw: Record<string, unknown>;
};

export type ParseResult = { ok: true; doc: ClientMetadataDocument } | { ok: false; error: string };

/** Validates a fetched metadata document against the URL it was fetched from. */
export function parseClientMetadataDocument(json: unknown, clientIdUrl: string): ParseResult {
  if (!json || typeof json !== "object" || Array.isArray(json)) return { ok: false, error: "The metadata document is not a JSON object." };
  const obj = json as Record<string, unknown>;
  if (obj.client_id !== clientIdUrl) {
    return { ok: false, error: "The metadata document's client_id does not match the URL it was fetched from." };
  }
  if ("client_secret" in obj || "client_secret_expires_at" in obj) {
    return { ok: false, error: "The metadata document must not contain a client_secret." };
  }
  const parsed = documentSchema.safeParse(obj);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `Invalid metadata document: ${issue ? `${issue.path.join(".") || "document"}: ${issue.message}` : "invalid"}.` };
  }
  const d = parsed.data;
  const method = d.token_endpoint_auth_method ?? "none";
  if (SYMMETRIC_AUTH_METHODS.has(method)) {
    return { ok: false, error: `token_endpoint_auth_method "${method}" uses a shared secret, which metadata-document clients must not use.` };
  }
  if (method !== "none") {
    return { ok: false, error: `token_endpoint_auth_method "${method}" is not supported by this server — use "none" (public client with PKCE).` };
  }
  for (const uri of d.redirect_uris) {
    const err = validateRedirectUri(uri);
    if (err) return { ok: false, error: `Invalid redirect URI in the metadata document: ${err}.` };
  }
  // RFC 7591 defaults: authorization_code only when grant_types is omitted.
  const grantTypes = d.grant_types?.length ? [...new Set(d.grant_types)] : ["authorization_code"];
  const unsupported = grantTypes.find((g) => g !== "authorization_code" && g !== "refresh_token");
  if (unsupported) return { ok: false, error: `Unsupported grant_type in the metadata document: ${unsupported}.` };
  if (!grantTypes.includes("authorization_code")) return { ok: false, error: "The metadata document must allow the authorization_code grant." };
  const responseTypes = d.response_types?.length ? [...new Set(d.response_types)] : ["code"];
  if (responseTypes.some((r) => r !== "code")) return { ok: false, error: 'Only response_type "code" is supported.' };

  return {
    ok: true,
    doc: {
      clientId: clientIdUrl,
      name: d.client_name,
      redirectUris: d.redirect_uris,
      grantTypes,
      responseTypes,
      scope: d.scope ?? null,
      clientUri: d.client_uri ?? null,
      logoUri: d.logo_uri ?? null,
      softwareId: d.software_id ?? null,
      softwareVersion: d.software_version ?? null,
      raw: { ...d, token_endpoint_auth_method: method, grant_types: grantTypes, response_types: responseTypes },
    },
  };
}

type HeaderSource = Pick<Headers, "get">;

/**
 * How long a fetched document may be used: Cache-Control max-age (no-store / no-cache → minimum),
 * else Expires, else a default — always clamped to [5 min, 24 h] to bound both load and staleness.
 */
export function metadataCacheTtlMs(headers: HeaderSource, nowMs: number = Date.now()): number {
  const clamp = (ms: number) => Math.min(METADATA_MAX_TTL_MS, Math.max(METADATA_MIN_TTL_MS, ms));
  const cc = (headers.get("cache-control") ?? "").toLowerCase();
  if (cc) {
    const directives = cc.split(",").map((d) => d.trim());
    if (directives.some((d) => d === "no-store" || d === "no-cache")) return METADATA_MIN_TTL_MS;
    const maxAge = directives.map((d) => /^max-age\s*=\s*"?(\d+)"?$/.exec(d)).find(Boolean);
    if (maxAge) {
      const age = Number.parseInt(headers.get("age") ?? "0", 10);
      return clamp((Number.parseInt(maxAge[1]!, 10) - (Number.isFinite(age) ? Math.max(0, age) : 0)) * 1000);
    }
  }
  const expires = headers.get("expires");
  if (expires) {
    const at = Date.parse(expires);
    if (Number.isNaN(at)) return METADATA_MIN_TTL_MS; // invalid Expires = already expired (RFC 9111)
    const date = Date.parse(headers.get("date") ?? "");
    return clamp(at - (Number.isNaN(date) ? nowMs : date));
  }
  return METADATA_DEFAULT_TTL_MS;
}

/** Consent-screen facts for a client (metadata host, localhost-only redirect warning). */
export function consentClientInfo(client: { id: string; registration: string }, redirectUri: string) {
  const metadataHost = client.registration === "metadata_document" ? safeHost(client.id) : null;
  let loopbackRedirect = false;
  try {
    const u = new URL(redirectUri);
    loopbackRedirect = u.protocol === "http:" && isLoopbackHost(u.hostname);
  } catch {
    loopbackRedirect = false;
  }
  return { metadataHost, metadataUrl: metadataHost ? client.id : null, loopbackRedirect };
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}
