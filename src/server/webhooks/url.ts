import "server-only";
import dns from "node:dns";
import net from "node:net";
import { isPrivateIp, parsePublicUrl, privateAllowlist, UnsafeUrlError } from "../optimize/net";

export { UnsafeUrlError };

const MAX_URL_LENGTH = 2000;

/**
 * Validates a user-supplied webhook receiver URL (SSRF guard at save time; `safeFetch` checks again
 * at connect time for every delivery). Public http(s) URLs on ports 80/443/8080/8443 only — hosts in
 * the admin allowlist (Admin → Authentication → “Internal hosts allowed for integrations”)
 * may be private (e.g. a self-hosted n8n) and use any port.
 */
export function validateWebhookUrl(raw: string, allowlist: readonly string[] = []): string {
  const value = raw.trim();
  if (!value) throw new UnsafeUrlError("Enter the receiver URL.");
  if (value.length > MAX_URL_LENGTH) throw new UnsafeUrlError("The URL is too long.");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new UnsafeUrlError("Invalid URL.");
  }
  // Same host comparison as safeFetch, so what can be saved is exactly what can be delivered.
  if (allowlist.map((h) => h.toLowerCase()).includes(url.hostname.toLowerCase())) {
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new UnsafeUrlError("Only http(s) URLs are allowed.");
    if (url.username || url.password) throw new UnsafeUrlError("URLs with credentials are not allowed.");
    url.hash = "";
    return url.toString();
  }
  const parsed = parsePublicUrl(value);
  parsed.hash = "";
  return parsed.toString();
}

/** Resolves the host and rejects private/loopback targets (unless allowlisted) — early feedback when saving. */
export async function assertPublicResolution(rawUrl: string, allowlist: readonly string[] = []): Promise<void> {
  const url = new URL(rawUrl);
  if (allowlist.map((h) => h.toLowerCase()).includes(url.hostname.toLowerCase())) return;
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new UnsafeUrlError("Private network addresses are not allowed.");
    return;
  }
  let addresses: dns.LookupAddress[];
  try {
    addresses = await dns.promises.lookup(host, { all: true });
  } catch {
    throw new UnsafeUrlError(`Could not resolve ${host}. Check the URL.`);
  }
  if (!addresses.length || addresses.some((a) => isPrivateIp(a.address))) {
    throw new UnsafeUrlError(`${host} resolves to a private network address. Ask an instance admin to allow it under Admin → Authentication → “Internal hosts allowed for integrations”.`);
  }
}

/** Hosts an admin allowed to resolve to private addresses — the list safeFetch applies at delivery time. */
export async function webhookAllowlist(): Promise<string[]> {
  return privateAllowlist();
}
