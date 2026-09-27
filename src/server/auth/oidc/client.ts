import "server-only";
import crypto from "node:crypto";
import * as oidc from "openid-client";
import { privateAllowlist, safeFetch } from "@/server/optimize/net";
import { isSharedCloud } from "@/server/env";

/**
 * openid-client configuration for a provider. All IdP traffic (discovery, JWKS, token endpoint) goes through the
 * SSRF-safe fetch: public addresses only, except hosts an admin allowlisted for the private network on a
 * self-hosted instance (e.g. an internal Keycloak) — never on AutoSEO Cloud. HTTPS is required unless the issuer
 * host is allowlisted.
 */

export type OidcClientSettings = { issuerUrl: string; clientId: string; clientSecret: string };

const DISCOVERY_TIMEOUT_SECONDS = 10;
const CACHE_MS = 10 * 60 * 1000;
const cache = new Map<string, { config: Promise<oidc.Configuration>; at: number }>();

function toBody(body: unknown): string | Uint8Array | null {
  if (body == null) return null;
  if (typeof body === "string") return body;
  if (body instanceof URLSearchParams) return body.toString();
  if (body instanceof Uint8Array) return body;
  if (body instanceof ArrayBuffer) return new Uint8Array(body);
  throw new Error("Unsupported request body for the identity provider.");
}

export const ssrfSafeFetch: oidc.CustomFetch = async (url, options) => {
  const res = await safeFetch(url, {
    method: options.method,
    headers: options.headers,
    body: toBody(options.body),
    purpose: "integration",
    maxRedirects: 0,
    timeoutMs: DISCOVERY_TIMEOUT_SECONDS * 1000,
    maxBytes: 1024 * 1024,
  });
  const nullBody = [101, 204, 205, 304].includes(res.status);
  return new Response(nullBody ? null : new Uint8Array(res.body), { status: res.status, headers: res.headers });
};

/** Validates an issuer URL for use as an OIDC issuer (https, no credentials / query / fragment). */
export async function parseIssuerUrl(raw: string): Promise<{ url: URL; insecure: boolean }> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("The issuer URL is not a valid URL.");
  }
  if (url.username || url.password || url.search || url.hash) throw new Error("The issuer URL must not contain credentials, a query or a fragment.");
  if (url.protocol === "https:") return { url, insecure: false };
  if (url.protocol === "http:" && !isSharedCloud() && (await privateAllowlist()).includes(url.hostname.toLowerCase())) {
    return { url, insecure: true };
  }
  throw new Error("The issuer URL must use https://.");
}

function cacheKey(s: OidcClientSettings) {
  return `${s.issuerUrl}\u0000${s.clientId}\u0000${crypto.createHash("sha256").update(s.clientSecret).digest("hex")}`;
}

async function build(s: OidcClientSettings): Promise<oidc.Configuration> {
  const { url, insecure } = await parseIssuerUrl(s.issuerUrl);
  const execute = insecure ? [oidc.allowInsecureRequests] : [];
  const discovered = await oidc.discovery(url, s.clientId, undefined, oidc.None(), {
    [oidc.customFetch]: ssrfSafeFetch,
    timeout: DISCOVERY_TIMEOUT_SECONDS,
    execute,
  });
  const meta = discovered.serverMetadata();
  // The sign-in redirect goes to this URL — never to a non-https (e.g. javascript:, http:) target.
  for (const [label, endpoint] of [["authorization", meta.authorization_endpoint], ["token", meta.token_endpoint]] as const) {
    let u: URL;
    try {
      u = new URL(endpoint ?? "");
    } catch {
      throw new Error(`The identity provider has no valid ${label} endpoint.`);
    }
    if (u.protocol !== "https:" && !(insecure && u.protocol === "http:")) throw new Error(`The identity provider's ${label} endpoint must use https://.`);
  }
  // Default auth method per spec is client_secret_basic; fall back to _post when the IdP only supports that.
  const methods = meta.token_endpoint_auth_methods_supported;
  const auth = !s.clientSecret
    ? oidc.None()
    : !methods || methods.includes("client_secret_basic")
      ? oidc.ClientSecretBasic(s.clientSecret)
      : oidc.ClientSecretPost(s.clientSecret);
  const config = new oidc.Configuration(meta, s.clientId, s.clientSecret ? { client_secret: s.clientSecret } : undefined, auth);
  config[oidc.customFetch] = ssrfSafeFetch;
  config.timeout = DISCOVERY_TIMEOUT_SECONDS;
  for (const fn of execute) fn(config);
  return config;
}

/** Discovered + cached (10 min) client configuration. Failed discoveries are not cached. */
export function getOidcConfig(s: OidcClientSettings): Promise<oidc.Configuration> {
  const key = cacheKey(s);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.config;
  const config = build(s);
  cache.set(key, { config, at: Date.now() });
  config.catch(() => cache.delete(key));
  return config;
}

/** Drops cached configurations of an issuer (after a config change). */
export function forgetOidcConfig(issuerUrl: string) {
  for (const k of cache.keys()) if (k.startsWith(`${issuerUrl}\u0000`)) cache.delete(k);
}

/** Discovery test for the settings UI: returns the issuer's metadata summary or throws a readable error. */
export async function testOidcDiscovery(s: OidcClientSettings) {
  forgetOidcConfig(s.issuerUrl);
  const config = await getOidcConfig(s);
  const meta = config.serverMetadata();
  return {
    issuer: meta.issuer,
    authorizationEndpoint: meta.authorization_endpoint ?? null,
    tokenEndpoint: meta.token_endpoint ?? null,
    supportsPkce: meta.supportsPKCE(),
    scopes: meta.scopes_supported ?? null,
  };
}
