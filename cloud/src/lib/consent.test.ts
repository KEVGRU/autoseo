import { describe, expect, it } from "vitest";
import { readAdParams } from "./ad-params";
import {
  consentCookieString,
  cookieDomains,
  cookieName,
  deleteCookieEverywhere,
  deleteCookieString,
  isRepoUrl,
  isXAdVisit,
  mustReloadToUnload,
  parseConsent,
  readConsentCookie,
  readCookie,
  referrerOrigin,
  serializeConsent,
  shouldPromptForX,
  thirdPartyAllowedOn,
  thirdPartyPageLocation,
  thirdPartySafeSearch,
  xCookieNames,
} from "./consent";

describe("consent cookie", () => {
  it("reads one cookie out of a cookie string", () => {
    expect(readCookie("theme=dark; autoseo_consent=x=1; _twclid=abc", "autoseo_consent")).toBe("x=1");
    expect(readCookie("autoseo_consent_old=x=1", "autoseo_consent")).toBeNull();
    expect(readCookie("", "autoseo_consent")).toBeNull();
    expect(readCookie(null, "autoseo_consent")).toBeNull();
  });

  it("parses and serializes choices, ignoring garbage", () => {
    expect(parseConsent("x=1")).toEqual({ x: true });
    expect(parseConsent("x=0")).toEqual({ x: false });
    expect(parseConsent(null)).toEqual({ x: null });
    expect(parseConsent("x=yes&meta=1")).toEqual({ x: null });
    expect(serializeConsent({ x: true })).toBe("x=1");
    expect(serializeConsent({ x: null })).toBe("");
  });

  it("builds a 180-day __Host- cookie on https and a plain one on http://localhost", () => {
    expect(consentCookieString({ x: false }, true)).toBe("__Host-autoseo_consent=x=0; Path=/; Max-Age=15552000; SameSite=Lax; Secure");
    expect(consentCookieString({ x: true }, false)).toBe("autoseo_consent=x=1; Path=/; Max-Age=15552000; SameSite=Lax");
  });

  it("deletes a cookie host-only and for each parent domain", () => {
    expect(deleteCookieEverywhere("autoseo_consent", "autoseo.codext.de")).toEqual([
      "autoseo_consent=; Path=/; Max-Age=0",
      "autoseo_consent=; Path=/; Max-Age=0; Domain=autoseo.codext.de",
      "autoseo_consent=; Path=/; Max-Age=0; Domain=codext.de",
    ]);
  });

  it("names and deletes __Host- cookies correctly", () => {
    expect(cookieName("__Host-autoseo_cv", true)).toBe("__Host-autoseo_cv");
    expect(cookieName("__Host-autoseo_cv", false)).toBe("autoseo_cv");
    expect(deleteCookieString("__Host-autoseo_cv")).toBe("__Host-autoseo_cv=; Path=/; Max-Age=0; Secure");
    expect(deleteCookieString("autoseo_cv")).toBe("autoseo_cv=; Path=/; Max-Age=0");
  });

  const jar = (cookies: Record<string, string>) => (name: string) => cookies[name];

  it("over https only the __Host- cookie can grant consent", () => {
    expect(readConsentCookie(jar({ "__Host-autoseo_consent": "x=1" }), true)).toEqual({ x: true });
    expect(readConsentCookie(jar({ "__Host-autoseo_consent": "x=0", autoseo_consent: "x=1" }), true)).toEqual({ x: false });
    expect(readConsentCookie(jar({}), true)).toEqual({ x: null });
  });

  it("never treats the unprefixed name as consent over https (another subdomain could plant it), only as a no", () => {
    expect(readConsentCookie(jar({ autoseo_consent: "x=1" }), true)).toEqual({ x: null });
    expect(readConsentCookie(jar({ autoseo_consent: "x=0" }), true)).toEqual({ x: false });
  });

  it("uses the plain name on http://localhost", () => {
    expect(readConsentCookie(jar({ autoseo_consent: "x=1" }), false)).toEqual({ x: true });
    expect(readConsentCookie(jar({ "__Host-autoseo_consent": "x=1" }), false)).toEqual({ x: null });
  });

  it("defaults to https outside the browser (the server passes !env.isLocal explicitly)", () => {
    expect(readConsentCookie(jar({ autoseo_consent: "x=1" }))).toEqual({ x: null });
  });
});

describe("isXAdVisit", () => {
  it("is true for X click ids and paid X campaigns", () => {
    expect(isXAdVisit(readAdParams("?twclid=TEST"))).toBe(true);
    expect(isXAdVisit(readAdParams("?utm_source=x&utm_medium=paid_social"))).toBe(true);
    expect(isXAdVisit(readAdParams("?utm_source=Twitter&utm_medium=cpc"))).toBe(true);
  });

  it("is false for other ads and organic X links", () => {
    expect(isXAdVisit(readAdParams("?gclid=1"))).toBe(false);
    expect(isXAdVisit(readAdParams("?utm_source=x&utm_medium=social"))).toBe(false);
    expect(isXAdVisit(readAdParams("?utm_source=google&utm_medium=cpc"))).toBe(false);
    expect(isXAdVisit(readAdParams(""))).toBe(false);
  });
});

describe("shouldPromptForX", () => {
  it("only asks undecided X-ad visitors outside sign-in links, admin and API paths", () => {
    expect(shouldPromptForX({ path: "/pricing", xAdLanding: true, choice: null })).toBe(true);
    expect(shouldPromptForX({ path: "/pricing", xAdLanding: false, choice: null })).toBe(false);
    expect(shouldPromptForX({ path: "/pricing", xAdLanding: true, choice: false })).toBe(false);
    expect(shouldPromptForX({ path: "/pricing", xAdLanding: true, choice: true })).toBe(false);
    expect(shouldPromptForX({ path: "/auth/verify", xAdLanding: true, choice: null })).toBe(false);
    expect(shouldPromptForX({ path: "/admin", xAdLanding: true, choice: null })).toBe(false);
    expect(shouldPromptForX({ path: "/signup", xAdLanding: true, choice: null })).toBe(true);
  });

  it("never allows third parties on sign-in, admin or API paths", () => {
    for (const path of ["/auth", "/auth/verify", "/api/e", "/admin", "/login", "/signup"]) expect(thirdPartyAllowedOn(path)).toBe(false);
    for (const path of ["/", "/pricing", "/de/pricing", "/dashboard", "/authors", "/signups-guide"]) expect(thirdPartyAllowedOn(path)).toBe(true);
  });

  it("reloads only when a loaded pixel reaches an excluded path", () => {
    expect(mustReloadToUnload(true, "/signup")).toBe(true);
    expect(mustReloadToUnload(true, "/admin")).toBe(true);
    expect(mustReloadToUnload(true, "/pricing")).toBe(false);
    // After the reload the pixel isn't loaded, so there is no second reload.
    expect(mustReloadToUnload(false, "/signup")).toBe(false);
  });
});

describe("thirdPartySafeSearch", () => {
  it("removes tokens, codes and Stripe session ids but keeps everything else", () => {
    expect(thirdPartySafeSearch("?checkout=success&session_id=cs_test_123")).toBe("?checkout=success");
    expect(thirdPartySafeSearch("?checkout=success")).toBe("?checkout=success");
    expect(thirdPartySafeSearch("?twclid=TEST&utm_source=x")).toBe("?twclid=TEST&utm_source=x");
    expect(thirdPartySafeSearch("?plan=yearly&token=abc&session_id=cs_1")).toBe("?plan=yearly");
    expect(thirdPartySafeSearch("?token=abc")).toBe("");
    expect(thirdPartySafeSearch("")).toBe("");
  });
});

describe("thirdPartyPageLocation", () => {
  const origin = "https://autoseo.codext.de";
  it("keeps only campaign values and X's click id on marketing pages", () => {
    expect(thirdPartyPageLocation(origin, "/pricing", "?utm_source=x&utm_medium=paid_social&twclid=T&plan=yearly&token=abc")).toBe(
      `${origin}/pricing?utm_source=x&utm_medium=paid_social&twclid=T`,
    );
    expect(thirdPartyPageLocation(origin, "/", "")).toBe(`${origin}/`);
  });

  it("gives only origin and path in the signed-in area", () => {
    expect(thirdPartyPageLocation(origin, "/dashboard", "?checkout=success&session_id=cs_live_1&utm_source=x")).toBe(`${origin}/dashboard`);
  });
});

describe("referrerOrigin", () => {
  it("keeps only the origin", () => {
    expect(referrerOrigin("https://autoseo.codext.de/auth/verify?token=abc")).toBe("https://autoseo.codext.de/");
    expect(referrerOrigin("https://checkout.stripe.com/c/pay/cs_live_123#fid")).toBe("https://checkout.stripe.com/");
    expect(referrerOrigin("")).toBe("");
    expect(referrerOrigin("not a url")).toBe("");
  });
});

describe("X cookies", () => {
  it("lists the host and parent domains", () => {
    expect(cookieDomains("autoseo.codext.de")).toEqual(["autoseo.codext.de", "codext.de"]);
    expect(cookieDomains("localhost")).toEqual(["localhost"]);
    expect(cookieDomains("127.0.0.1")).toEqual(["127.0.0.1"]);
  });

  it("finds X's first-party cookies", () => {
    expect(xCookieNames("autoseo_consent=x=1; _twclid=abc; _twpid=tw.1; theme=dark")).toEqual(["_twclid", "_twpid"]);
  });
});

describe("isRepoUrl", () => {
  const repo = "https://github.com/codextde/autoseo";
  it("matches links into our repository only", () => {
    for (const href of [repo, `${repo}/`, `${repo}#readme`, `${repo}/releases`, `${repo}.git`, "https://github.com/CodextDE/AutoSEO/blob/main/README.md"]) {
      expect(isRepoUrl(new URL(href), repo)).toBe(true);
    }
    for (const href of ["https://github.com/codextde", "https://github.com/codextde/autoseo-other", "https://github.com/someone/autoseo", "https://gist.github.com/codextde/autoseo"]) {
      expect(isRepoUrl(new URL(href), repo)).toBe(false);
    }
  });
});
