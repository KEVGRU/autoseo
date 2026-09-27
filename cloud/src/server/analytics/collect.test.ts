import { describe, expect, it } from "vitest";
import {
  deviceFromUserAgent,
  isBot,
  normalizeCountry,
  normalizePath,
  normalizeUtm,
  parseCollectPayload,
  refererPath,
  utcDay,
  visitorHash,
} from "./collect";

const CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const IPAD = "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const ANDROID_PHONE = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36";
const ANDROID_TABLET = "Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

describe("parseCollectPayload", () => {
  it("normalizes a landing page view from an X ad", () => {
    const input = parseCollectPayload({
      n: "pageview",
      p: "/pricing",
      r: "t.co",
      u: { source: " X ", medium: "Paid_Social", campaign: "launch_sep26", content: "ad1_chatgpt_image", term: "<b>" },
      c: "x",
    });
    expect(input).toEqual({
      name: "pageview",
      path: "/pricing",
      referrerHost: "t.co",
      utm: { source: "x", medium: "paid_social", campaign: "launch_sep26", content: "ad1_chatgpt_image", term: null },
      clickSource: "x",
      props: null,
    });
  });

  it("strips queries and fragments from the path", () => {
    expect(parseCollectPayload({ n: "pageview", p: "/auth-like?token=secret#x" })?.path).toBe("/auth-like");
  });

  it("drops untracked areas, server-only events and invalid names", () => {
    expect(parseCollectPayload({ n: "pageview", p: "/admin" })).toBeNull();
    expect(parseCollectPayload({ n: "pageview", p: "/dashboard/billing" })).toBeNull();
    expect(parseCollectPayload({ n: "pageview", p: "/auth/verify?token=abc" })).toBeNull();
    expect(parseCollectPayload({ n: "pageview", p: "/api/e" })).toBeNull();
    expect(parseCollectPayload({ n: "ai_check", p: "/ai-visibility-check" })).toBeNull();
    expect(parseCollectPayload({ n: "Page View", p: "/" })).toBeNull();
    expect(parseCollectPayload({ n: "my_custom_event", p: "/" })).toBeNull();
    expect(parseCollectPayload({ n: "launch_offer_click", p: "/" })?.name).toBe("launch_offer_click");
    expect(parseCollectPayload({ n: "consent_x_granted", p: "/pricing" })?.name).toBe("consent_x_granted");
    expect(parseCollectPayload({ n: "pageview", p: "https://evil.example/" })).toBeNull();
    expect(parseCollectPayload({ n: "pageview", p: "//evil.example/" })).toBeNull();
    expect(parseCollectPayload("nope")).toBeNull();
  });

  it("keeps small props on interactions and ignores referrer/utm there", () => {
    const input = parseCollectPayload({
      n: "cta_signup",
      p: "/pricing",
      r: "t.co",
      u: { source: "x" },
      c: "x",
      props: { href: "/signup", label: "  Start for $50/month  ", from: "/pricing" },
    });
    expect(input?.props).toEqual({ href: "/signup", label: "Start for $50/month", from: "/pricing" });
    expect(input?.referrerHost).toBeNull();
    expect(input?.utm.source).toBeNull();
    expect(input?.clickSource).toBeNull();
  });

  it("rejects oversized or unexpected props and unknown click sources", () => {
    const many = Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`k${"abcdefghi"[i]}`, "v"]));
    expect(parseCollectPayload({ n: "cta_signup", p: "/", props: many })).toBeNull();
    expect(parseCollectPayload({ n: "cta_signup", p: "/", props: { nested: { a: 1 } } })).toBeNull();
    expect(parseCollectPayload({ n: "pageview", p: "/", c: "tiktok" })).toBeNull();
  });
});

describe("normalizePath", () => {
  it("removes trailing slashes but keeps the root", () => {
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("/pricing/")).toBe("/pricing");
    expect(normalizePath(`/${"a".repeat(400)}`)).toHaveLength(300);
  });
});

describe("refererPath", () => {
  const own = ["autoseo.codext.de", "localhost:3200"];
  it("returns the path of our own pages only", () => {
    expect(refererPath("https://autoseo.codext.de/de/ai-visibility-check?x=1", own)).toBe("/de/ai-visibility-check");
    expect(refererPath("http://localhost:3200/", own)).toBe("/");
    expect(refererPath("https://evil.example/ai-visibility-check", own)).toBeNull();
    expect(refererPath("https://autoseo.codext.de/dashboard", own)).toBeNull();
    expect(refererPath(null, own)).toBeNull();
  });
});

describe("normalizeUtm", () => {
  it("trims, lowercases, collapses whitespace and caps the length", () => {
    expect(normalizeUtm("  Launch   Sep26 ")).toBe("launch sep26");
    expect(normalizeUtm("   ")).toBeNull();
    expect(normalizeUtm("x".repeat(150))).toHaveLength(100);
    expect(normalizeUtm("a\u0000b")).toBeNull();
  });

  it("drops values with unexpected characters", () => {
    expect(normalizeUtm("ad1_chatgpt-image+v2.0")).toBe("ad1_chatgpt-image+v2.0");
    expect(normalizeUtm("<script>")).toBeNull();
    expect(normalizeUtm("ümlaut")).toBeNull();
    expect(normalizeUtm("a/b?c=d")).toBeNull();
  });
});

describe("isBot", () => {
  it("flags crawlers, headless browsers, previews and scripts", () => {
    for (const ua of [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/140.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36 Chrome-Lighthouse",
      "facebookexternalhit/1.1",
      "curl/8.7.1",
      "python-requests/2.32.3",
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
      "",
    ]) {
      expect(isBot(ua)).toBe(true);
    }
  });

  it("lets real browsers through", () => {
    for (const ua of [CHROME, IPHONE, IPAD, ANDROID_PHONE, "Mozilla/5.0 (Linux; Android 12; CUBOT P40) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36"]) {
      expect(isBot(ua)).toBe(false);
    }
  });
});

describe("deviceFromUserAgent", () => {
  it("tells phones, tablets and desktops apart", () => {
    expect(deviceFromUserAgent(CHROME)).toBe("desktop");
    expect(deviceFromUserAgent(IPHONE)).toBe("mobile");
    expect(deviceFromUserAgent(ANDROID_PHONE)).toBe("mobile");
    expect(deviceFromUserAgent(IPAD)).toBe("tablet");
    expect(deviceFromUserAgent(ANDROID_TABLET)).toBe("tablet");
    expect(deviceFromUserAgent(null)).toBe("desktop");
  });
});

describe("normalizeCountry", () => {
  it("accepts ISO codes and drops unknown and Tor", () => {
    expect(normalizeCountry("de")).toBe("DE");
    expect(normalizeCountry("XX")).toBeNull();
    expect(normalizeCountry("T1")).toBeNull();
    expect(normalizeCountry("DEU")).toBeNull();
    expect(normalizeCountry(null)).toBeNull();
  });
});

describe("visitorHash", () => {
  it("is stable for one salt and changes with the salt, IP or browser", () => {
    const a = visitorHash("salt-1", "203.0.113.7", CHROME, "autoseo.codext.de");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(visitorHash("salt-1", "203.0.113.7", CHROME, "autoseo.codext.de")).toBe(a);
    expect(visitorHash("salt-2", "203.0.113.7", CHROME, "autoseo.codext.de")).not.toBe(a);
    expect(visitorHash("salt-1", "203.0.113.8", CHROME, "autoseo.codext.de")).not.toBe(a);
    expect(visitorHash("salt-1", "203.0.113.7", IPHONE, "autoseo.codext.de")).not.toBe(a);
  });

  it("formats UTC days", () => {
    expect(utcDay(new Date("2026-09-27T23:59:59.000Z"))).toBe("2026-09-27");
    expect(utcDay(new Date("2026-09-28T00:00:00.000Z"))).toBe("2026-09-28");
  });
});
