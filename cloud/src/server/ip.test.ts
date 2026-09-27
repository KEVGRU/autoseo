import { describe, expect, it } from "vitest";
import { rateLimitIpKey } from "./ip";

describe("rateLimitIpKey", () => {
  it("keeps IPv4 addresses as they are", () => {
    expect(rateLimitIpKey("203.0.113.7")).toBe("203.0.113.7");
    expect(rateLimitIpKey(" 203.0.113.7 ")).toBe("203.0.113.7");
    expect(rateLimitIpKey("203.0.113.7:51234")).toBe("203.0.113.7");
  });

  it("buckets IPv6 addresses by /64", () => {
    const a = rateLimitIpKey("2001:db8:1234:5678:aaaa:bbbb:cccc:dddd");
    expect(a).toBe("2001:db8:1234:5678::/64");
    expect(rateLimitIpKey("2001:db8:1234:5678::1")).toBe(a);
    expect(rateLimitIpKey("2001:0DB8:1234:5678:ffff::")).toBe(a);
    expect(rateLimitIpKey("[2001:db8:1234:5678::42]:443")).toBe(a);
    expect(rateLimitIpKey("2001:db8:1234:5679::1")).not.toBe(a);
    expect(rateLimitIpKey("::1")).toBe("0:0:0:0::/64");
    expect(rateLimitIpKey("fe80::1%eth0")).toBe("fe80:0:0:0::/64");
  });

  it("treats IPv4-mapped IPv6 as the IPv4 address", () => {
    expect(rateLimitIpKey("::ffff:203.0.113.7")).toBe("203.0.113.7");
    expect(rateLimitIpKey("::FFFF:cb00:7107")).toBe("203.0.113.7");
    expect(rateLimitIpKey("0:0:0:0:0:ffff:203.0.113.7")).toBe("203.0.113.7");
    // Other embedded-IPv4 forms (NAT64) are ordinary IPv6 addresses.
    expect(rateLimitIpKey("64:ff9b::203.0.113.7")).toBe("64:ff9b:0:0::/64");
  });

  it("handles missing or garbage values", () => {
    expect(rateLimitIpKey(null)).toBe("unknown");
    expect(rateLimitIpKey("")).toBe("unknown");
    expect(rateLimitIpKey("not-an-ip")).toBe("other:not-an-ip");
  });
});
