import { after } from "next/server";
import { MAX_BODY_BYTES, isBot, parseCollectPayload } from "@/server/analytics/collect";
import { recordAnalyticsEvent } from "@/server/analytics/store";
import { clientIpFromHeaders, isSameOrigin } from "@/server/http";
import { rateLimitIpKey } from "@/server/ip";
import { rateLimit } from "@/server/rate-limit";

export const dynamic = "force-dynamic";

const MINUTE = 60_000;

function noContent() {
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

/** Reads at most `max` bytes; null for larger bodies. */
async function readBody(req: Request, max: number): Promise<string | null> {
  if (Number(req.headers.get("content-length") ?? 0) > max) return null;
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/**
 * Cookieless statistics collector. The tracker (components/analytics/tracker.tsx) posts `{ n, p, r?, u?, c?, props? }`
 * as text/plain via navigator.sendBeacon. Answers 204 right away (403 for cross-site requests) and records the
 * event after the response; invalid, oversized, bot and rate-limited requests are dropped silently.
 */
export async function POST(req: Request) {
  if (req.headers.get("origin") && !isSameOrigin(req)) return new Response(null, { status: 403 });
  try {
    const body = await readBody(req, MAX_BODY_BYTES);
    if (!body) return noContent();
    const input = parseCollectPayload(JSON.parse(body));
    if (!input || isBot(req.headers.get("user-agent"))) return noContent();
    const ip = rateLimitIpKey(clientIpFromHeaders(req.headers));
    if (!rateLimit(`analytics:ip:${ip}`, 120, MINUTE) || !rateLimit("analytics:global", 1000, MINUTE)) return noContent();
    const headers = new Headers(req.headers);
    after(() => recordAnalyticsEvent(headers, input));
  } catch {
    // Malformed JSON or an aborted upload: nothing to record.
  }
  return noContent();
}
