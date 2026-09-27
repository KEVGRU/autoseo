import { isIP } from "node:net";

function parseIPv6(ip: string): number[] | null {
  let text = ip;
  const tail: number[] = [];
  // Embedded IPv4 in the last 32 bits (::ffff:1.2.3.4, 64:ff9b::1.2.3.4).
  const v4 = text.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (v4) {
    const [a, b, c, d] = v4[1]!.split(".").map(Number) as [number, number, number, number];
    tail.push((a << 8) | b, (c << 8) | d);
    text = text.slice(0, -v4[1]!.length); // "::ffff:", "64:ff9b::", "0:0:0:0:0:ffff:"
    if (text.endsWith(":") && !text.endsWith("::")) text = text.slice(0, -1);
  }
  const [head, rest] = text.split("::") as [string, string | undefined];
  const toParts = (s: string | undefined) => (s ? s.split(":").filter(Boolean).map((h) => parseInt(h, 16)) : []);
  const left = toParts(head);
  const right = [...toParts(rest), ...tail];
  if (rest === undefined && left.length + tail.length !== 8) return null;
  const fill = 8 - left.length - right.length;
  if (fill < 0 || left.concat(right).some((n) => Number.isNaN(n) || n < 0 || n > 0xffff)) return null;
  return [...left, ...Array(rest === undefined ? 0 : fill).fill(0), ...right];
}

/**
 * Rate-limit bucket for a client IP. IPv4 addresses are used as-is; IPv6 clients are grouped by their /64
 * (one customer usually controls a whole /64, so per-address limits would be trivial to rotate around), and
 * IPv4-mapped IPv6 addresses count as the IPv4 address they carry.
 */
export function rateLimitIpKey(raw: string | null | undefined): string {
  if (!raw) return "unknown";
  let ip = raw.trim();
  const bracketed = ip.match(/^\[([^\]]+)\](?::\d+)?$/);
  if (bracketed) ip = bracketed[1]!;
  else if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(ip)) ip = ip.split(":")[0]!;
  ip = ip.replace(/%.*$/, "").toLowerCase(); // zone id (fe80::1%eth0)
  if (isIP(ip) === 4) return ip;
  if (isIP(ip) !== 6) return `other:${ip.slice(0, 64)}`;
  const h = parseIPv6(ip);
  if (!h) return `other:${ip.slice(0, 64)}`;
  if (h.slice(0, 5).every((n) => n === 0) && h[5] === 0xffff) {
    return [h[6]! >> 8, h[6]! & 0xff, h[7]! >> 8, h[7]! & 0xff].join(".");
  }
  return `${h.slice(0, 4).map((n) => n.toString(16)).join(":")}::/64`;
}
