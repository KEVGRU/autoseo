import { describe, expect, it } from "vitest";
import { assertFetchableUrl, isAllowedHostname, isBlockedAddress, parseIPv6 } from "./safe-fetch";

describe("isBlockedAddress (IPv4)", () => {
  it.each([
    "0.0.0.0",
    "10.1.2.3",
    "100.64.0.1",
    "100.100.100.200", // Alibaba Cloud metadata
    "127.0.0.1",
    "127.255.255.254",
    "169.254.169.254", // AWS/GCP/Azure metadata
    "172.16.0.1",
    "172.31.255.255",
    "192.0.0.170",
    "192.0.2.1",
    "192.168.1.1",
    "198.18.0.1",
    "198.51.100.7",
    "203.0.113.9",
    "224.0.0.251",
    "239.255.255.250",
    "240.0.0.1",
    "255.255.255.255",
  ])("blocks %s", (ip) => expect(isBlockedAddress(ip)).toBe(true));

  it.each(["1.1.1.1", "8.8.8.8", "93.184.215.14", "172.15.255.255", "172.32.0.1", "100.63.255.255", "100.128.0.1", "192.169.0.1"])(
    "allows %s",
    (ip) => expect(isBlockedAddress(ip)).toBe(false),
  );
});

describe("isBlockedAddress (IPv6)", () => {
  it.each([
    "::",
    "::1",
    "[::1]",
    "fe80::1",
    "fe80::1%eth0",
    "fc00::1",
    "fd00:ec2::254", // AWS IPv6 metadata
    "ff02::1",
    "::ffff:127.0.0.1", // IPv4-mapped loopback
    "::ffff:7f00:1", // same, hex form
    "::ffff:169.254.169.254",
    "::ffff:10.0.0.1",
    "::127.0.0.1", // IPv4-compatible (deprecated)
    "64:ff9b::a9fe:a9fe", // NAT64 of 169.254.169.254
    "64:ff9b::127.0.0.1",
    "2002:7f00:1::", // 6to4 of 127.0.0.1
    "2001::1", // Teredo
    "2001:db8::1", // documentation
    "3fff::1", // documentation
    "100::1", // discard
    "not-an-ip",
    "",
  ])("blocks %s", (ip) => expect(isBlockedAddress(ip)).toBe(true));

  it.each(["2606:4700:4700::1111", "2a00:1450:4001:82b::200e", "::ffff:8.8.8.8", "2001:4860:4860::8888"])("allows %s", (ip) =>
    expect(isBlockedAddress(ip)).toBe(false),
  );

  it("expands addresses", () => {
    expect(parseIPv6("::1")).toEqual([0, 0, 0, 0, 0, 0, 0, 1]);
    expect(parseIPv6("::ffff:1.2.3.4")).toEqual([0, 0, 0, 0, 0, 0xffff, 0x0102, 0x0304]);
    expect(parseIPv6("2001:db8::")).toEqual([0x2001, 0xdb8, 0, 0, 0, 0, 0, 0]);
    expect(parseIPv6("1:2:3:4:5:6:7:8")).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(parseIPv6("1::2::3")).toBeNull();
    expect(parseIPv6("12345::")).toBeNull();
  });
});

describe("host names and URLs", () => {
  it.each(["localhost", "foo.localhost", "printer.local", "db.internal", "intranet", "router.home.arpa", "1.0.0.127.in-addr.arpa", "127.0.0.1", "[::1]", "a..b.com"])(
    "rejects %s",
    (host) => expect(isAllowedHostname(host)).toBe(false),
  );

  it.each(["example.com", "www.solakon.de", "xn--mnchen-3ya.de", "8.8.8.8"])("accepts %s", (host) => expect(isAllowedHostname(host)).toBe(true));

  it("only allows http(s) on default ports without credentials", () => {
    expect(() => assertFetchableUrl("ftp://example.com/")).toThrow();
    expect(() => assertFetchableUrl("file:///etc/passwd")).toThrow();
    expect(() => assertFetchableUrl("http://user:pass@example.com/")).toThrow();
    expect(() => assertFetchableUrl("http://example.com:8080/")).toThrow();
    expect(() => assertFetchableUrl("http://169.254.169.254/latest/meta-data/")).toThrow();
    expect(() => assertFetchableUrl("http://[::ffff:127.0.0.1]/")).toThrow();
    expect(() => assertFetchableUrl("http://0x7f000001/")).toThrow(); // WHATWG URL parses this to 127.0.0.1
    expect(() => assertFetchableUrl("http://2130706433/")).toThrow();
    expect(assertFetchableUrl("https://example.com:443/path").hostname).toBe("example.com");
  });
});
