import { afterAll, describe, expect, it } from "vitest";
import { eq, like } from "drizzle-orm";
import { db } from "@/server/db/client";
import { oauthClients } from "@/server/db/schema";
import {
  METADATA_DEFAULT_TTL_MS,
  METADATA_MAX_TTL_MS,
  METADATA_MIN_TTL_MS,
  consentClientInfo,
  isMetadataDocumentClientId,
  metadataCacheTtlMs,
  parseClientMetadataDocument,
  validateClientIdUrl,
} from "./client-metadata";
import { ClientMetadataError, resolveMetadataDocumentClient, type FetchedDocument } from "./client-metadata-fetch";

const URL_ID = "https://app.example.com/oauth/client-metadata.json";
const doc = (extra: Record<string, unknown> = {}) => ({
  client_id: URL_ID,
  client_name: "Example MCP Client",
  client_uri: "https://app.example.com",
  redirect_uris: ["http://127.0.0.1:3000/callback", "https://app.example.com/cb"],
  grant_types: ["authorization_code", "refresh_token"],
  response_types: ["code"],
  token_endpoint_auth_method: "none",
  ...extra,
});
const headers = (h: Record<string, string>) => new Headers(h);

describe("client_id URL rules", () => {
  it("detects URL-formatted client ids", () => {
    expect(isMetadataDocumentClientId(URL_ID)).toBe(true);
    expect(isMetadataDocumentClientId("ocl_abc123")).toBe(false);
    expect(isMetadataDocumentClientId(null)).toBe(false);
  });
  it("accepts https URLs with a path", () => {
    expect(validateClientIdUrl(URL_ID)).toBeNull();
    expect(validateClientIdUrl("https://app.example.com/client?v=2")).toBeNull();
  });
  it("rejects non-https, missing path, fragments, userinfo and dot segments", () => {
    expect(validateClientIdUrl("http://app.example.com/client.json")).toMatch(/https/);
    expect(validateClientIdUrl("https://app.example.com")).toMatch(/path/);
    expect(validateClientIdUrl("https://app.example.com/")).toMatch(/path/);
    expect(validateClientIdUrl("https://app.example.com/c.json#x")).toMatch(/fragment/);
    expect(validateClientIdUrl("https://u:p@app.example.com/c.json")).toMatch(/username/);
    expect(validateClientIdUrl("https://app.example.com/a/../c.json")).toMatch(/dot/);
    expect(validateClientIdUrl("https://app.example.com/./c.json")).toMatch(/dot/);
    expect(validateClientIdUrl("https://app.example.com/%2E%2E/c.json")).toMatch(/dot/);
  });
  it("rejects hosts the server must not fetch", () => {
    expect(validateClientIdUrl("https://localhost/c.json")).toMatch(/not allowed/);
    expect(validateClientIdUrl("https://10.0.0.5/c.json")).toMatch(/not allowed/);
    expect(validateClientIdUrl("https://app.example.com:9999/c.json")).toMatch(/not allowed/);
    expect(validateClientIdUrl(`https://app.example.com/${"a".repeat(1100)}`)).toMatch(/longer/);
  });
});

describe("metadata document validation", () => {
  it("accepts a valid public-client document", () => {
    const r = parseClientMetadataDocument(doc(), URL_ID);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.doc.name).toBe("Example MCP Client");
      expect(r.doc.grantTypes).toEqual(["authorization_code", "refresh_token"]);
      expect(r.doc.clientUri).toBe("https://app.example.com");
    }
  });
  it("requires client_id to match the URL exactly", () => {
    expect(parseClientMetadataDocument(doc({ client_id: `${URL_ID}?x` }), URL_ID)).toMatchObject({ ok: false, error: /does not match/ });
    expect(parseClientMetadataDocument(doc(), URL_ID.toUpperCase())).toMatchObject({ ok: false });
  });
  it("requires client_name and redirect_uris", () => {
    expect(parseClientMetadataDocument(doc({ client_name: "" }), URL_ID)).toMatchObject({ ok: false, error: /client_name/ });
    expect(parseClientMetadataDocument(doc({ redirect_uris: [] }), URL_ID)).toMatchObject({ ok: false, error: /redirect_uris/ });
    expect(parseClientMetadataDocument([], URL_ID)).toMatchObject({ ok: false, error: /JSON object/ });
  });
  it("rejects shared secrets and unsupported auth methods", () => {
    expect(parseClientMetadataDocument(doc({ client_secret: "s" }), URL_ID)).toMatchObject({ ok: false, error: /client_secret/ });
    expect(parseClientMetadataDocument(doc({ token_endpoint_auth_method: "client_secret_basic" }), URL_ID)).toMatchObject({ ok: false, error: /shared secret/ });
    expect(parseClientMetadataDocument(doc({ token_endpoint_auth_method: "client_secret_jwt" }), URL_ID)).toMatchObject({ ok: false, error: /shared secret/ });
    expect(parseClientMetadataDocument(doc({ token_endpoint_auth_method: "private_key_jwt" }), URL_ID)).toMatchObject({ ok: false, error: /not supported/ });
  });
  it("applies the redirect URI policy and grant/response type rules", () => {
    expect(parseClientMetadataDocument(doc({ redirect_uris: ["http://evil.example/cb"] }), URL_ID)).toMatchObject({ ok: false, error: /loopback/ });
    expect(parseClientMetadataDocument(doc({ grant_types: ["client_credentials"] }), URL_ID)).toMatchObject({ ok: false, error: /grant_type/ });
    expect(parseClientMetadataDocument(doc({ grant_types: ["refresh_token"] }), URL_ID)).toMatchObject({ ok: false, error: /authorization_code/ });
    expect(parseClientMetadataDocument(doc({ response_types: ["token"] }), URL_ID)).toMatchObject({ ok: false });
    const defaults = parseClientMetadataDocument(doc({ grant_types: undefined, response_types: undefined }), URL_ID);
    expect(defaults.ok && defaults.doc.grantTypes).toEqual(["authorization_code"]);
  });
});

describe("metadata cache lifetime", () => {
  const now = Date.parse("2026-09-26T12:00:00Z");
  it("uses max-age (minus Age) within bounds", () => {
    expect(metadataCacheTtlMs(headers({ "cache-control": "public, max-age=3600" }), now)).toBe(3_600_000);
    expect(metadataCacheTtlMs(headers({ "cache-control": "max-age=3600", age: "600" }), now)).toBe(3_000_000);
    expect(metadataCacheTtlMs(headers({ "cache-control": "max-age=10" }), now)).toBe(METADATA_MIN_TTL_MS);
    expect(metadataCacheTtlMs(headers({ "cache-control": "max-age=31536000" }), now)).toBe(METADATA_MAX_TTL_MS);
  });
  it("treats no-store / no-cache as the minimum and falls back to Expires or the default", () => {
    expect(metadataCacheTtlMs(headers({ "cache-control": "no-store" }), now)).toBe(METADATA_MIN_TTL_MS);
    expect(metadataCacheTtlMs(headers({ "cache-control": "private, no-cache" }), now)).toBe(METADATA_MIN_TTL_MS);
    expect(metadataCacheTtlMs(headers({ expires: new Date(now + 2 * 3_600_000).toUTCString() }), now)).toBe(7_200_000);
    expect(metadataCacheTtlMs(headers({ expires: "0" }), now)).toBe(METADATA_MIN_TTL_MS);
    expect(metadataCacheTtlMs(headers({}), now)).toBe(METADATA_DEFAULT_TTL_MS);
  });
});

describe("consent info", () => {
  it("shows the metadata host and flags loopback redirects", () => {
    expect(consentClientInfo({ id: URL_ID, registration: "metadata_document" }, "http://127.0.0.1:3000/callback")).toEqual({
      metadataHost: "app.example.com",
      metadataUrl: URL_ID,
      loopbackRedirect: true,
    });
    expect(consentClientInfo({ id: "ocl_x", registration: "dynamic" }, "https://claude.ai/cb")).toEqual({
      metadataHost: null,
      metadataUrl: null,
      loopbackRedirect: false,
    });
  });
});

describe("metadata document resolution (injected fetcher, dev DB)", () => {
  const base = `https://cimd-test-${Date.now()}.example.com`;
  afterAll(async () => {
    await db.delete(oauthClients).where(like(oauthClients.id, `${base}%`));
  });
  const serve =
    (body: unknown, status = 200, h: Record<string, string> = { "cache-control": "max-age=600" }) =>
    async (): Promise<FetchedDocument> => ({ status, headers: headers(h), body: typeof body === "string" ? body : JSON.stringify(body) });

  it("fetches, validates and stores the client with id = URL", async () => {
    const url = `${base}/a/client.json`;
    const client = await resolveMetadataDocumentClient(url, { fetcher: serve(doc({ client_id: url })) });
    expect(client.id).toBe(url);
    expect(client.registration).toBe("metadata_document");
    expect(client.tokenEndpointAuthMethod).toBe("none");
    expect(client.redirectUris).toContain("http://127.0.0.1:3000/callback");
    const ttl = client.metadataExpiresAt!.getTime() - client.metadataFetchedAt!.getTime();
    expect(ttl).toBe(METADATA_MIN_TTL_MS * 2);
    // Fresh copy is served from the database without fetching again.
    const again = await resolveMetadataDocumentClient(url, {
      fetcher: async () => {
        throw new Error("must not fetch");
      },
    });
    expect(again.name).toBe("Example MCP Client");
  });

  it("re-fetches expired documents and serves a stale copy only on transient errors", async () => {
    const url = `${base}/b/client.json`;
    await resolveMetadataDocumentClient(url, { fetcher: serve(doc({ client_id: url })) });
    await db.update(oauthClients).set({ metadataExpiresAt: new Date(Date.now() - 1000) }).where(eq(oauthClients.id, url));
    const stale = await resolveMetadataDocumentClient(url, { fetcher: serve("oops", 503) });
    expect(stale.id).toBe(url);
    await expect(resolveMetadataDocumentClient(url, { fetcher: serve("gone", 404) })).rejects.toThrow(/HTTP 404/);
    const renamed = await resolveMetadataDocumentClient(url, { fetcher: serve(doc({ client_id: url, client_name: "Renamed" })) });
    expect(renamed.name).toBe("Renamed");
  });

  it("rejects mismatching, oversized-secret and malformed documents", async () => {
    const url = `${base}/c/client.json`;
    await expect(resolveMetadataDocumentClient(url, { fetcher: serve(doc()) })).rejects.toBeInstanceOf(ClientMetadataError);
    await expect(resolveMetadataDocumentClient(url, { fetcher: serve("{not json") })).rejects.toThrow(/not valid JSON/);
    await expect(resolveMetadataDocumentClient(url, { fetcher: serve(doc({ client_id: url, client_secret: "x" })) })).rejects.toThrow(/client_secret/);
    await expect(
      resolveMetadataDocumentClient(url, {
        fetcher: async () => {
          throw new Error("The URL redirects (HTTP 302) — use the final URL.");
        },
      }),
    ).rejects.toThrow(/redirects/);
    await expect(resolveMetadataDocumentClient("https://localhost/client.json")).rejects.toThrow(/not allowed/);
  });
});
