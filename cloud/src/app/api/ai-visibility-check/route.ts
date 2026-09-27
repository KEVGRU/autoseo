import { after } from "next/server";
import { z } from "zod";
import { CheckBusyError, CheckInputError, normalizeTarget, runCheck } from "@/components/site/check/analyze";
import type { CheckEvent } from "@/components/site/check/types";
import { clientIpFromHeaders, isSameOrigin } from "@/server/http";
import { rateLimitIpKey } from "@/server/ip";
import { rateLimit } from "@/server/rate-limit";
import { recordServerEvent } from "@/server/analytics/store";

export const dynamic = "force-dynamic";

const Body = z.object({ url: z.string().trim().min(1).max(500) });

const HOUR = 60 * 60_000;

function error(status: number, code: string, message: string, headers?: HeadersInit) {
  return Response.json({ error: message, code }, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/**
 * Free AI visibility check (public, anonymous). POST `{ "url": "example.com" }` → CheckResult JSON, or NDJSON
 * progress events ending in `{ type: "result" }` when the request accepts `application/x-ndjson`.
 * Limits: per client IP (6 per 10 minutes, 30 per day), per checked host (30 per hour) and overall (600 per hour);
 * results are cached for 10 minutes per URL.
 */
export async function POST(req: Request) {
  // Browsers always send Origin on POST: only our own pages may call this from a browser.
  if (req.headers.get("origin") && !isSameOrigin(req)) return error(403, "forbidden", "Cross-site requests are not allowed.");

  const text = await req.text();
  if (text.length > 2048) return error(413, "too_large", "Request body too large.");
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return error(400, "invalid_json", 'Send JSON like {"url": "example.com"}.');
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return error(400, "invalid_input", "Enter a domain, e.g. example.com.");

  // Validate before rate limiting, so typos don't use up the quota.
  let host: string;
  try {
    host = normalizeTarget(parsed.data.url).hostname;
  } catch (err) {
    return failure(err);
  }

  const ip = rateLimitIpKey(clientIpFromHeaders(req.headers));
  const retry = { "Retry-After": "600" };
  if (!rateLimit(`ai-check:ip:${ip}`, 6, 10 * 60_000) || !rateLimit(`ai-check:ip-day:${ip}`, 30, 24 * HOUR)) {
    return error(429, "rate_limited", "Too many checks from your network. Please wait a few minutes.", retry);
  }
  if (!rateLimit("ai-check:global", 600, HOUR)) return error(429, "rate_limited", "The check is very busy right now. Please try again later.", retry);
  if (!rateLimit(`ai-check:host:${host.replace(/^www\./, "")}`, 30, HOUR)) {
    return error(429, "rate_limited", "This site was checked very often in the last hour. Please try again later.", retry);
  }

  // Cookieless statistics: count the run after the response (recording never throws or delays the check).
  try {
    const headers = new Headers(req.headers);
    after(() => recordServerEvent(headers, "ai_check", "/ai-visibility-check"));
  } catch (err) {
    console.error("[ai-visibility-check] could not schedule the statistics event", err);
  }

  const wantsStream = (req.headers.get("accept") ?? "").includes("application/x-ndjson");
  if (!wantsStream) {
    try {
      const result = await runCheck(parsed.data.url);
      return Response.json(result, { headers: { "Cache-Control": "no-store" } });
    } catch (err) {
      return failure(err);
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: CheckEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        const result = await runCheck(parsed.data.url, send);
        send({ type: "result", result });
      } catch (err) {
        const { code, message } = describe(err);
        send({ type: "error", code, error: message });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}

function describe(err: unknown): { code: string; message: string; status: number } {
  if (err instanceof CheckInputError) return { code: "invalid_input", message: err.message, status: 400 };
  if (err instanceof CheckBusyError) return { code: "busy", message: err.message, status: 503 };
  console.error("[ai-visibility-check]", err);
  return { code: "internal", message: "The check failed unexpectedly. Please try again.", status: 500 };
}

function failure(err: unknown) {
  const { code, message, status } = describe(err);
  return error(status, code, message);
}
