import "server-only";
import type { z } from "zod";
import { env } from "@/server/env";
import { sha256, timingSafeEqualStr } from "@/server/crypto";
import { clientIpSync } from "@/server/http/request";
import { rateLimit } from "@/server/rate-limit";

const MAX_BODY_BYTES = 64 * 1024;

export function cloudJson(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Authenticates a tenant API call (`Authorization: Bearer <AUTOSEO_CLOUD_API_SECRET>`). Returns an error
 * response, or null for the cloud. Without the variable the API does not exist (404).
 */
export function authorizeCloud(req: Request): Response | null {
  const secret = env.cloudApiSecret;
  if (!secret) return cloudJson({ error: "not_found" }, 404);
  const token = /^Bearer\s+(\S+)$/i.exec(req.headers.get("authorization")?.trim() ?? "")?.[1] ?? "";
  // Digests keep the comparison constant-time regardless of the guess's length.
  if (token && timingSafeEqualStr(sha256(token), sha256(secret))) return null;
  if (!rateLimit(`cloud-api-auth:${clientIpSync(req.headers) ?? "unknown"}`, 30, 60_000)) {
    return cloudJson({ error: "rate_limited" }, 429);
  }
  return cloudJson({ error: "unauthorized" }, 401);
}

/** Parses and validates a JSON body (max 64 KB); returns a 400 response when it doesn't fit the schema. */
export async function readCloudBody<S extends z.ZodType>(req: Request, schema: S): Promise<z.infer<S> | Response> {
  const text = await req.text().catch(() => null);
  if (text === null || text.length > MAX_BODY_BYTES) return cloudJson({ error: "invalid_body" }, 400);
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    return cloudJson({ error: "invalid_json" }, 400);
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return cloudJson(
      { error: "validation_error", issues: parsed.error.issues.map((i) => ({ path: i.path.join(".") || "body", message: i.message })) },
      400,
    );
  }
  return parsed.data;
}
