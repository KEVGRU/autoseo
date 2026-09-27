import "server-only";
import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import zlib from "node:zlib";
import type { Readable } from "node:stream";

/**
 * SSRF-safe HTTP GET for the public AI visibility check (URLs come from anonymous visitors):
 *
 * - http(s) only, default ports only (80/443), no credentials in the URL, no IP literals outside public space,
 *   no single-label or reserved host names (localhost, *.local, *.internal, …)
 * - every DNS answer is checked; one private, loopback, link-local, CGNAT, metadata, multicast or otherwise
 *   reserved address (IPv4, IPv6, IPv4-mapped/NAT64/6to4/Teredo) blocks the request
 * - the socket connects to exactly the addresses that were checked (custom `lookup`), so DNS rebinding between
 *   check and connect is impossible
 * - redirects are followed manually and every hop is validated again
 * - response size (after decompression) and time are capped
 */

export type SafeFetchErrorCode = "invalid_url" | "blocked" | "dns" | "timeout" | "tls" | "connection" | "too_many_redirects" | "decode";

export class SafeFetchError extends Error {
  constructor(
    public code: SafeFetchErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SafeFetchError";
  }
}

/* ─────────────────────────── Address policy ─────────────────────────── */

type Cidr4 = [number, number];

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, part) => acc * 256 + Number(part), 0);
}

const V4_BLOCKED: Cidr4[] = (
  [
    ["0.0.0.0", 8], // "this" network
    ["10.0.0.0", 8], // private
    ["100.64.0.0", 10], // carrier-grade NAT (also Alibaba Cloud metadata 100.100.100.200)
    ["127.0.0.0", 8], // loopback
    ["169.254.0.0", 16], // link-local (cloud metadata 169.254.169.254)
    ["172.16.0.0", 12], // private
    ["192.0.0.0", 24], // IETF protocol assignments
    ["192.0.2.0", 24], // TEST-NET-1
    ["192.31.196.0", 24], // AS112
    ["192.52.193.0", 24], // AMT
    ["192.88.99.0", 24], // 6to4 relay anycast
    ["192.168.0.0", 16], // private
    ["192.175.48.0", 24], // AS112
    ["198.18.0.0", 15], // benchmarking
    ["198.51.100.0", 24], // TEST-NET-2
    ["203.0.113.0", 24], // TEST-NET-3
    ["224.0.0.0", 4], // multicast
    ["240.0.0.0", 4], // reserved + broadcast
  ] as const
).map(([base, bits]) => [ipv4ToInt(base), bits]);

function isBlockedV4(ip: string): boolean {
  const v = ipv4ToInt(ip);
  return V4_BLOCKED.some(([base, bits]) => {
    const size = 2 ** (32 - bits);
    return v >= base && v < base + size;
  });
}

/** Expands an IPv6 address into 8 hextets (embedded IPv4 tails supported); null when malformed. */
export function parseIPv6(input: string): number[] | null {
  let text = input.toLowerCase().replace(/%.*$/, "");
  const tail: number[] = [];
  const v4 = text.match(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const octets = v4.slice(1).map(Number);
    if (octets.some((o) => o > 255)) return null;
    tail.push((octets[0]! << 8) | octets[1]!, (octets[2]! << 8) | octets[3]!);
    text = text.slice(0, -v4[0].length);
    if (text.endsWith(":") && !text.endsWith("::")) text = text.slice(0, -1);
  }
  const halves = text.split("::");
  if (halves.length > 2) return null;
  const parse = (s: string) => (s ? s.split(":") : []);
  const head = parse(halves[0]!);
  const rest = halves.length === 2 ? parse(halves[1]!) : null;
  const hex = (h: string) => (/^[0-9a-f]{1,4}$/.test(h) ? parseInt(h, 16) : NaN);
  const left = head.map(hex);
  const right = [...(rest ?? []).map(hex), ...tail];
  if ([...left, ...right].some(Number.isNaN)) return null;
  if (rest === null) {
    const all = [...left, ...tail];
    return all.length === 8 ? all : null;
  }
  const fill = 8 - left.length - right.length;
  if (fill < 1) return null;
  return [...left, ...Array<number>(fill).fill(0), ...right];
}

/**
 * True when an address must never be fetched. IPv6 is allow-listed to global unicast (2000::/3) minus
 * documentation, IETF-assignment (incl. Teredo), 6to4 and new documentation space; IPv4-mapped addresses are
 * judged by the IPv4 address they carry. Anything unparsable is blocked.
 */
export function isBlockedAddress(address: string): boolean {
  const ip = address.trim().replace(/^\[|\]$/g, "");
  const family = net.isIP(ip.replace(/%.*$/, ""));
  if (family === 4) return isBlockedV4(ip);
  if (family !== 6) return true;
  const h = parseIPv6(ip);
  if (!h) return true;
  // ::ffff:a.b.c.d (IPv4-mapped) → the IPv4 rules decide.
  if (h.slice(0, 5).every((x) => x === 0) && h[5] === 0xffff) {
    return isBlockedV4([h[6]! >> 8, h[6]! & 0xff, h[7]! >> 8, h[7]! & 0xff].join("."));
  }
  if ((h[0]! & 0xe000) !== 0x2000) return true; // outside 2000::/3: ::, ::1, fc00::/7, fe80::/10, ff00::/8, 64:ff9b::/96, 100::/64, …
  if (h[0] === 0x2001 && h[1]! < 0x0200) return true; // 2001::/23 IETF assignments (Teredo 2001::/32, benchmarking, ORCHID)
  if (h[0] === 0x2001 && h[1] === 0x0db8) return true; // 2001:db8::/32 documentation
  if (h[0] === 0x2002) return true; // 2002::/16 6to4 (embeds arbitrary IPv4)
  if ((h[0]! & 0xfff0) === 0x3ff0) return true; // 3fff::/20 documentation
  return false;
}

/** Host names that can only resolve inside a private network (checked before DNS). */
const RESERVED_SUFFIXES = [".localhost", ".local", ".internal", ".intranet", ".lan", ".home", ".corp", ".home.arpa", ".arpa", ".test", ".invalid", ".example", ".onion"];

export function isAllowedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (!host || host.length > 253) return false;
  if (net.isIP(host.replace(/^\[|\]$/g, ""))) return !isBlockedAddress(host);
  if (!host.includes(".")) return false; // single-label names resolve via search domains to internal hosts
  if (host === "localhost" || RESERVED_SUFFIXES.some((s) => host.endsWith(s))) return false;
  return /^[a-z0-9.-]+$/.test(host) && host.split(".").every((label) => label.length > 0 && label.length <= 63);
}

/** Validates a URL for fetching; throws SafeFetchError("invalid_url" | "blocked"). */
export function assertFetchableUrl(raw: string | URL): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new SafeFetchError("invalid_url", "Invalid URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new SafeFetchError("invalid_url", "Only http and https URLs are allowed.");
  if (url.username || url.password) throw new SafeFetchError("invalid_url", "URLs with credentials are not allowed.");
  if (url.port && url.port !== "80" && url.port !== "443") throw new SafeFetchError("blocked", "Only the default ports 80 and 443 are allowed.");
  if (!isAllowedHostname(url.hostname)) throw new SafeFetchError("blocked", "This host name or address is not publicly reachable.");
  return url;
}

type LookupCallback = (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void;

/** DNS lookup for the socket: resolves every address, refuses the whole host if any of them is not public. */
function safeLookup(hostname: string, options: dns.LookupOptions, callback: LookupCallback): void {
  dns.lookup(hostname, { all: true, verbatim: true }, (err, addresses) => {
    if (err) return callback(err, "", 4);
    if (!addresses.length || addresses.some((a) => isBlockedAddress(a.address))) {
      const blocked = new Error(`${hostname} resolves to a non-public address.`) as NodeJS.ErrnoException;
      blocked.code = "EBLOCKED";
      return callback(blocked, "", 4);
    }
    const family = options.family === 4 || options.family === 6 ? options.family : 0;
    const usable = family ? addresses.filter((a) => a.family === family) : addresses;
    if (!usable.length) return callback(Object.assign(new Error(`No IPv${family} address for ${hostname}.`), { code: "ENOTFOUND" }), "", 4);
    if (options.all) return callback(null, usable);
    callback(null, usable[0]!.address, usable[0]!.family);
  });
}

/* ─────────────────────────── Fetching ─────────────────────────── */

export type FetchHop = { url: string; status: number };

export type SafeResponse = {
  /** URL that was requested first. */
  url: string;
  /** URL of the response that was returned (after redirects). */
  finalUrl: string;
  status: number;
  headers: Record<string, string>;
  body: string;
  /** Bytes of the (decompressed) body that were read. */
  bytes: number;
  truncated: boolean;
  /** Time to the response headers of the final hop. */
  ttfbMs: number;
  /** Total time including redirects and body download. */
  timeMs: number;
  /** Redirect hops before the final response. */
  redirects: FetchHop[];
};

export type SafeFetchOptions = {
  maxBytes: number;
  /** Per-request budget (connect, headers and body of one hop). */
  timeoutMs: number;
  /** Abort everything (overall deadline of the check). */
  signal?: AbortSignal;
  maxRedirects?: number;
  accept?: string;
  userAgent: string;
};

const REDIRECT = new Set([301, 302, 303, 307, 308]);

type Hop = { status: number; headers: Record<string, string>; body: string; bytes: number; truncated: boolean; ttfbMs: number };

function flatHeaders(raw: http.IncomingHttpHeaders): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    out[key] = Array.isArray(value) ? value.join(", ") : value;
  }
  return out;
}

function decodeBody(buf: Buffer, contentType: string): string {
  const charset = contentType.match(/charset\s*=\s*"?([\w-]+)/i)?.[1]?.toLowerCase();
  try {
    return new TextDecoder(charset && charset !== "utf8" ? charset : "utf-8").decode(buf);
  } catch {
    return new TextDecoder("utf-8").decode(buf);
  }
}

function classify(err: unknown): SafeFetchError {
  if (err instanceof SafeFetchError) return err;
  const e = err as NodeJS.ErrnoException & { name?: string };
  const code = e?.code ?? "";
  if (code === "EBLOCKED") return new SafeFetchError("blocked", e.message);
  if (code === "ENOTFOUND" || code === "EAI_AGAIN" || code === "ENODATA") return new SafeFetchError("dns", "The domain could not be resolved.");
  if (e?.name === "AbortError" || code === "ABORT_ERR" || code === "ETIMEDOUT" || code === "ESOCKETTIMEDOUT") return new SafeFetchError("timeout", "The server did not respond in time.");
  if (/CERT|SSL|TLS|SELF_SIGNED|UNABLE_TO_VERIFY/i.test(code) || /certificate|SSL|TLS/i.test(e?.message ?? "")) {
    return new SafeFetchError("tls", "The TLS certificate could not be verified.");
  }
  if (code.startsWith("Z_") || code.startsWith("ERR__ERROR")) return new SafeFetchError("decode", "The response could not be decompressed.");
  return new SafeFetchError("connection", "The server could not be reached.");
}

function requestOnce(url: URL, opts: SafeFetchOptions): Promise<Hop> {
  const client = url.protocol === "https:" ? https : http;
  const started = performance.now();
  const signal = opts.signal ? AbortSignal.any([opts.signal, AbortSignal.timeout(opts.timeoutMs)]) : AbortSignal.timeout(opts.timeoutMs);
  return new Promise<Hop>((resolve, reject) => {
    let settled = false;
    const fail = (err: unknown) => {
      if (settled) return;
      settled = true;
      reject(classify(err));
    };
    const req = client.request(
      url,
      {
        method: "GET",
        agent: false,
        lookup: safeLookup as unknown as net.LookupFunction,
        signal,
        headers: {
          "User-Agent": opts.userAgent,
          Accept: opts.accept ?? "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
          "Accept-Language": "en;q=0.9,de;q=0.8,*;q=0.5",
          "Accept-Encoding": "gzip, deflate, br",
        },
      },
      (res) => {
        const ttfbMs = performance.now() - started;
        const headers = flatHeaders(res.headers);
        const status = res.statusCode ?? 0;
        if (REDIRECT.has(status)) {
          res.resume();
          settled = true;
          resolve({ status, headers, body: "", bytes: 0, truncated: false, ttfbMs });
          return;
        }
        const encoding = (headers["content-encoding"] ?? "").trim().toLowerCase();
        let stream: Readable = res;
        if (encoding === "gzip" || encoding === "x-gzip") stream = res.pipe(zlib.createGunzip());
        else if (encoding === "deflate") stream = res.pipe(zlib.createInflate());
        else if (encoding === "br") stream = res.pipe(zlib.createBrotliDecompress());
        const chunks: Buffer[] = [];
        let bytes = 0;
        let truncated = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          const buf = Buffer.concat(chunks);
          resolve({ status, headers, body: decodeBody(buf, headers["content-type"] ?? ""), bytes, truncated, ttfbMs });
        };
        stream.on("data", (chunk: Buffer) => {
          if (truncated) return;
          const room = opts.maxBytes - bytes;
          if (chunk.length >= room) {
            chunks.push(chunk.subarray(0, room));
            bytes += room;
            truncated = true;
            finish();
            res.destroy();
            if (stream !== res) stream.destroy();
            return;
          }
          chunks.push(chunk);
          bytes += chunk.length;
        });
        stream.on("end", finish);
        stream.on("error", (err) => (truncated ? undefined : fail(err)));
        res.on("error", (err) => (truncated ? undefined : fail(err)));
      },
    );
    req.on("error", fail);
    req.end();
  });
}

/** GET with manual, re-validated redirects. Throws SafeFetchError; HTTP error statuses are returned, not thrown. */
export async function safeFetch(rawUrl: string, opts: SafeFetchOptions): Promise<SafeResponse> {
  const started = performance.now();
  const first = assertFetchableUrl(rawUrl);
  let url = first;
  const redirects: FetchHop[] = [];
  const maxRedirects = opts.maxRedirects ?? 5;
  for (;;) {
    const hop = await requestOnce(url, opts);
    const location = hop.headers.location;
    if (REDIRECT.has(hop.status) && location && redirects.length < maxRedirects) {
      redirects.push({ url: url.toString(), status: hop.status });
      url = assertFetchableUrl(new URL(location, url));
      continue;
    }
    if (REDIRECT.has(hop.status) && location && maxRedirects > 0) {
      throw new SafeFetchError("too_many_redirects", "Too many redirects.");
    }
    return {
      url: first.toString(),
      finalUrl: url.toString(),
      status: hop.status,
      headers: hop.headers,
      body: hop.body,
      bytes: hop.bytes,
      truncated: hop.truncated,
      ttfbMs: Math.round(hop.ttfbMs),
      timeMs: Math.round(performance.now() - started),
      redirects,
    };
  }
}
