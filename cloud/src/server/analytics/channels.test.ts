import { describe, expect, it } from "vitest";
import { classifyChannel, isInternalHost, normalizeReferrerHost } from "./channels";

describe("normalizeReferrerHost", () => {
  it("keeps only the host, without www. and port", () => {
    expect(normalizeReferrerHost("https://www.Google.com/search?q=autoseo")).toBe("google.com");
    expect(normalizeReferrerHost("news.ycombinator.com")).toBe("news.ycombinator.com");
    expect(normalizeReferrerHost("http://localhost:3200/pricing")).toBe("localhost");
    expect(normalizeReferrerHost("android-app://com.google.android.gm/")).toBe("com.google.android.gm");
  });

  it("rejects garbage", () => {
    expect(normalizeReferrerHost("")).toBeNull();
    expect(normalizeReferrerHost(null)).toBeNull();
    expect(normalizeReferrerHost("not a host")).toBeNull();
    expect(normalizeReferrerHost("<script>")).toBeNull();
    expect(normalizeReferrerHost(`${"a".repeat(120)}.com`)).toBeNull();
  });
});

describe("isInternalHost", () => {
  const own = ["autoseo.codext.de", "app.autoseo.codext.de"];
  it("treats our hosts, customer subdomains and Stripe returns as internal", () => {
    expect(isInternalHost("autoseo.codext.de", own)).toBe(true);
    expect(isInternalHost("acme.autoseo.codext.de", own)).toBe(true);
    expect(isInternalHost("checkout.stripe.com", own)).toBe(true);
    expect(isInternalHost("localhost", ["localhost:3200"])).toBe(true);
  });

  it("does not treat look-alikes as internal", () => {
    expect(isInternalHost("codext.de", own)).toBe(false);
    expect(isInternalHost("evilautoseo.codext.de.example.com", own)).toBe(false);
    expect(isInternalHost("stripe.com", own)).toBe(false);
  });
});

describe("classifyChannel", () => {
  it("classifies the X launch ads as paid social", () => {
    expect(classifyChannel({ utmSource: "x", utmMedium: "paid_social", clickSource: "x" })).toBe("Paid social");
    expect(classifyChannel({ utmSource: "x", utmMedium: "cpc" })).toBe("Paid social");
    expect(classifyChannel({ clickSource: "x" })).toBe("Paid social");
    expect(classifyChannel({ clickSource: "meta", referrerHost: "facebook.com" })).toBe("Paid social");
  });

  it("classifies paid search", () => {
    expect(classifyChannel({ utmSource: "google", utmMedium: "cpc" })).toBe("Paid search");
    expect(classifyChannel({ utmMedium: "ppc" })).toBe("Paid search");
    expect(classifyChannel({ clickSource: "google", referrerHost: "google.com" })).toBe("Paid search");
    expect(classifyChannel({ clickSource: "microsoft" })).toBe("Paid search");
  });

  it("lets UTM win over the referrer", () => {
    expect(classifyChannel({ utmSource: "newsletter", utmMedium: "email", referrerHost: "google.com" })).toBe("Email");
    expect(classifyChannel({ utmSource: "x", utmMedium: "paid_social", referrerHost: "t.co" })).toBe("Paid social");
  });

  it("recognizes AI assistants by referrer and by ChatGPT's utm_source", () => {
    expect(classifyChannel({ referrerHost: "chatgpt.com" })).toBe("AI assistants");
    expect(classifyChannel({ referrerHost: "perplexity.ai" })).toBe("AI assistants");
    expect(classifyChannel({ referrerHost: "gemini.google.com" })).toBe("AI assistants");
    expect(classifyChannel({ referrerHost: "claude.ai" })).toBe("AI assistants");
    expect(classifyChannel({ referrerHost: "copilot.microsoft.com" })).toBe("AI assistants");
    expect(classifyChannel({ utmSource: "chatgpt.com" })).toBe("AI assistants");
  });

  it("recognizes organic search engines", () => {
    for (const host of ["google.com", "google.de", "google.co.uk", "google.com.br", "bing.com", "duckduckgo.com", "ecosia.org", "search.brave.com", "yandex.ru", "kagi.com"]) {
      expect(classifyChannel({ referrerHost: host })).toBe("Organic search");
    }
    expect(classifyChannel({ referrerHost: "docs.google.com" })).toBe("Referral");
  });

  it("recognizes social networks and communities", () => {
    for (const host of ["t.co", "x.com", "linkedin.com", "lnkd.in", "m.facebook.com", "old.reddit.com", "youtube.com", "bsky.app", "threads.net"]) {
      expect(classifyChannel({ referrerHost: host })).toBe("Social");
    }
    for (const host of ["news.ycombinator.com", "github.com", "producthunt.com", "dev.to", "indiehackers.com", "lobste.rs", "selfh.st"]) {
      expect(classifyChannel({ referrerHost: host })).toBe("Community");
    }
    expect(classifyChannel({ utmSource: "producthunt" })).toBe("Community");
  });

  it("treats webmail referrers as email", () => {
    expect(classifyChannel({ referrerHost: "mail.google.com" })).toBe("Email");
    expect(classifyChannel({ referrerHost: "com.google.android.gm" })).toBe("Email");
  });

  it("falls back to referral and direct", () => {
    expect(classifyChannel({ referrerHost: "some-blog.example" })).toBe("Referral");
    expect(classifyChannel({ utmSource: "partner-site" })).toBe("Referral");
    expect(classifyChannel({ utmMedium: "weird", utmSource: "someone" })).toBe("Referral");
    expect(classifyChannel({})).toBe("Direct");
  });
});
