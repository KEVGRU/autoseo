/**
 * Cloudflare Worker that reports AI-crawler requests to the NDJSON ingest endpoint (pure helpers —
 * shared by the one-click deploy and safe for unit tests). The ingest token is never embedded in
 * the script: it is bound as the Worker secret `AUTOSEO_TOKEN`.
 */
import { BOT_UA_PATTERN } from "./bot-classifier";

export const WORKER_TOKEN_BINDING = "AUTOSEO_TOKEN";
export const WORKER_COMPATIBILITY_DATE = "2026-01-01";

/** ES-module Worker source (same behaviour as the downloadable script in the Sync tab). */
export function buildCloudflareWorkerScript(input: {
  projectId: string;
  endpoint: string;
  generatedAt?: Date;
  /** Add Wrangler / dashboard setup steps (downloadable script for manual deploys). */
  manualSetup?: boolean;
}): string {
  const date = (input.generatedAt ?? new Date()).toISOString().slice(0, 10);
  const setup = input.manualSetup
    ? `// Deploy with Wrangler or paste into the Cloudflare dashboard:
// 1. wrangler secret put ${WORKER_TOKEN_BINDING}     (paste the fslg_… token from AutoSEO → Bot Traffic → Sync → Cloudflare)
// 2. Add a route for your zone, e.g. example.com/*  (Workers Routes), so the Worker sees every request.
//    Set its request limit failure mode to "Fail open" so the site keeps working if the Workers Free limit is hit.
//
`
    : "";
  return `// AutoSEO — AI crawler logging Worker (project ${input.projectId})
// Generated ${date}. The ingest token is read from the Worker secret ${WORKER_TOKEN_BINDING}.
//
${setup}
// The Worker never changes responses: it forwards each request to your origin and, only for known
// AI / search crawler user agents, sends one NDJSON line in the background (ctx.waitUntil).

const ENDPOINT = ${JSON.stringify(input.endpoint)};
const BOT_RE = new RegExp(${JSON.stringify(BOT_UA_PATTERN)}, "i");

export default {
  async fetch(request, env, ctx) {
    // Any uncaught exception falls through to the origin instead of a Worker error page.
    ctx.passThroughOnException();
    const response = await fetch(request);
    try {
      const ua = request.headers.get("user-agent") || "";
      if (env.${WORKER_TOKEN_BINDING} && BOT_RE.test(ua)) {
        const url = new URL(request.url);
        const line = JSON.stringify({
          timestamp: new Date().toISOString(),
          ip: request.headers.get("cf-connecting-ip") || "",
          method: request.method,
          host: url.host,
          path: url.pathname + url.search,
          status: response.status,
          user_agent: ua,
          bytes: Number(response.headers.get("content-length")) || null,
        });
        ctx.waitUntil(
          fetch(ENDPOINT, {
            method: "POST",
            headers: { authorization: "Bearer " + env.${WORKER_TOKEN_BINDING}, "content-type": "application/x-ndjson" },
            body: line + "\\n",
          }).catch(() => {}),
        );
      }
    } catch (_) {
      // Logging must never break the site.
    }
    return response;
  },
};
`;
}

/** Worker script name for a zone, e.g. `autoseo-bots-example-com` (≤ 63 chars, [a-z0-9-]). */
export function workerNameForZone(zoneName: string): string {
  const slug = zoneName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `autoseo-bots-${slug || "site"}`.slice(0, 63).replace(/-+$/, "");
}

/** Route covering the apex and every subdomain of the zone. */
export function routePatternForZone(zoneName: string): string {
  return `*${zoneName.toLowerCase()}/*`;
}

/** The zone that serves the project domain (exact or parent zone), if any. */
export function matchZoneForDomain<Z extends { name: string }>(zones: Z[], domain: string): Z | null {
  const host = domain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[/:].*$/, "")
    .replace(/^www\./, "");
  const candidates = zones.filter((z) => host === z.name.toLowerCase() || host.endsWith(`.${z.name.toLowerCase()}`));
  return candidates.sort((a, b) => b.name.length - a.name.length)[0] ?? null;
}

export type CloudflareApiErrorInfo = { code: number; message: string };

/**
 * Maps a failed Cloudflare API call to an actionable message naming the missing token permission.
 * Never includes the token.
 */
export function explainCloudflareError(step: "zones" | "zone" | "script" | "routes", status: number, errors: CloudflareApiErrorInfo[]): string {
  const detail = errors
    .map((e) => e.message)
    .filter(Boolean)
    .join("; ")
    .slice(0, 300);
  const permission: Record<typeof step, string> = {
    zones: "Zone › Zone › Read",
    zone: "Zone › Zone › Read",
    script: "Account › Workers Scripts › Edit",
    routes: "Zone › Workers Routes › Edit",
  };
  if (status === 401 || errors.some((e) => e.code === 1000 || e.code === 6003 || e.code === 6111 || /invalid (api |access )?token|token.*expired/i.test(e.message)))
    return `Cloudflare rejected the API token (invalid or expired).${detail ? ` Cloudflare: ${detail}` : ""}`;
  if (status === 403 || errors.some((e) => e.code === 9109 || e.code === 10000))
    return `The API token lacks the permission “${permission[step]}”.${detail ? ` Cloudflare: ${detail}` : ""}`;
  if (status === 429) return "Cloudflare rate limit reached — try again in a minute.";
  return `Cloudflare API error (HTTP ${status})${detail ? `: ${detail}` : ""}.`;
}
