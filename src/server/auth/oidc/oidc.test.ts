import crypto from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import * as oidc from "openid-client";
import { SignJWT, exportJWK, generateKeyPair, type JWK } from "jose";
import { emailInDomains, isPublicMailDomain, normalizeDomainInput, txtRecordsContainToken } from "./domain";
import { checkDomainTxt } from "./dns";
import { checkIdClaims, groupsFromClaim, isEmailVerified, roleForGroups } from "./claims";
import { openFlowState, sealFlowState, stateMatches, STATE_TTL_SECONDS, type OidcFlowState } from "./state";
import { buildAuthorizationRequest, exchangeAuthorizationCode, OidcFlowError } from "./protocol";

describe("SSO domains", () => {
  it("normalizes domain input", () => {
    expect(normalizeDomainInput(" @Example.COM ")).toBe("example.com");
    expect(normalizeDomainInput("https://sub.example.co.uk/path?x=1")).toBe("sub.example.co.uk");
    expect(normalizeDomainInput("example.com.")).toBe("example.com");
    for (const bad of ["", "localhost", "127.0.0.1", "exa mple.com", "-a.com", "a..com", "example", "x@y.com"]) expect(normalizeDomainInput(bad)).toBeNull();
  });

  it("flags consumer mail domains", () => {
    expect(isPublicMailDomain("gmail.com")).toBe(true);
    expect(isPublicMailDomain("solakon.de")).toBe(false);
  });

  it("matches email domains exactly (no implicit sub-domains)", () => {
    expect(emailInDomains("A@Example.com", ["example.com"])).toBe(true);
    expect(emailInDomains("a@eu.example.com", ["example.com"])).toBe(false);
    expect(emailInDomains("a@example.com.evil.io", ["example.com"])).toBe(false);
    expect(emailInDomains("not-an-email", ["example.com"])).toBe(false);
  });

  it("parses TXT verification records", () => {
    const token = "abc123XYZ";
    expect(txtRecordsContainToken([["v=spf1 -all"], ["autoseo-verification=abc123XYZ"]], token)).toBe(true);
    // Long records arrive split into ≤255-byte chunks.
    expect(txtRecordsContainToken([["autoseo-verification=", "abc123XYZ"]], token)).toBe(true);
    expect(txtRecordsContainToken([['"autoseo-verification=abc123XYZ"']], token)).toBe(true);
    expect(txtRecordsContainToken([["autoseo-verification=abc123XYZ-extra"]], token)).toBe(false);
    expect(txtRecordsContainToken([["autoseo-verification=abc123xyz"]], token)).toBe(false);
    expect(txtRecordsContainToken([["google-site-verification=abc123XYZ"]], token)).toBe(false);
    expect(txtRecordsContainToken([["autoseo-verification="]], "")).toBe(false);
  });

  it("checks DNS with an injected resolver and maps failures", async () => {
    expect(await checkDomainTxt("example.com", "t0k", async () => [["autoseo-verification=t0k"]])).toEqual({ verified: true });
    const missing = await checkDomainTxt("example.com", "t0k", async () => [["other"]]);
    expect(missing.verified).toBe(false);
    const nodata = await checkDomainTxt("example.com", "t0k", async () => {
      throw Object.assign(new Error("no data"), { code: "ENODATA" });
    });
    expect(nodata).toMatchObject({ verified: false, error: expect.stringContaining("No TXT record") });
    const timeout = await checkDomainTxt("example.com", "t0k", async () => {
      throw Object.assign(new Error("timeout"), { code: "ETIMEOUT" });
    });
    expect(timeout).toMatchObject({ verified: false, error: expect.stringContaining("timed out") });
  });
});

describe("ID token claims", () => {
  const base = { iss: "https://idp.example.com", sub: "u-1", email: "Jane@Example.com", email_verified: true };

  it("requires a verified email", () => {
    expect(isEmailVerified({ email_verified: true })).toBe(true);
    expect(isEmailVerified({ email_verified: "true" })).toBe(true);
    expect(isEmailVerified({ xms_edov: true })).toBe(true);
    expect(isEmailVerified({ email_verified: false })).toBe(false);
    expect(isEmailVerified({})).toBe(false);
    expect(checkIdClaims({ ...base, email_verified: false }, { domains: ["example.com"], groupClaim: "groups" })).toMatchObject({
      ok: false,
      reason: "email_not_verified",
    });
  });

  it("only accepts emails from the provider's domains", () => {
    const ok = checkIdClaims(base, { domains: ["example.com"], groupClaim: "groups" });
    expect(ok).toMatchObject({ ok: true, identity: { email: "jane@example.com", subject: "u-1", issuer: "https://idp.example.com" } });
    expect(checkIdClaims({ ...base, email: "ceo@victim.com" }, { domains: ["example.com"], groupClaim: "groups" })).toMatchObject({
      ok: false,
      reason: "domain_not_allowed",
    });
  });

  it("rejects malformed emails (several @, control characters)", () => {
    for (const email of ["x@example.com@evil.io", "a b@example.com", "x\u0000@example.com", "@example.com", "x@example"]) {
      expect(checkIdClaims({ ...base, email }, { domains: ["example.com", "evil.io"], groupClaim: "groups" })).toMatchObject({ ok: false, reason: "missing_email" });
    }
  });

  it("rejects missing subject or email", () => {
    expect(checkIdClaims({ ...base, sub: "" }, { domains: ["example.com"], groupClaim: "groups" })).toMatchObject({ ok: false, reason: "missing_subject" });
    expect(checkIdClaims({ ...base, email: undefined }, { domains: ["example.com"], groupClaim: "groups" })).toMatchObject({ ok: false, reason: "missing_email" });
  });

  it("reads groups and maps them to allowed roles only", () => {
    expect(groupsFromClaim({ groups: ["a", 1, "b"] }, "groups")).toEqual(["a", "b"]);
    expect(groupsFromClaim({ roles: "admins" }, "roles")).toEqual(["admins"]);
    expect(groupsFromClaim({ groups: { a: 1 } }, "groups")).toEqual([]);
    const allowed = (k: string) => ["member", "client", "admin"].includes(k);
    const map = { "seo-admins": "admin", "instance-admins": "superadmin", agency: "client" };
    expect(roleForGroups(["agency", "seo-admins"], map, "member", allowed)).toBe("admin");
    // A role that isn't allowed (e.g. one granting instance administration) is skipped, never granted.
    expect(roleForGroups(["instance-admins"], map, "member", allowed)).toBe("member");
    expect(roleForGroups([], map, "nope", allowed)).toBeNull();
  });
});

describe("sealed flow state", () => {
  const key = crypto.randomBytes(32);
  const now = 1_800_000_000;
  const state: OidcFlowState = {
    providerKey: "instance",
    issuer: "https://idp.example.com",
    clientId: "c",
    state: "s",
    nonce: "n",
    codeVerifier: "v",
    next: "/p/x",
    exp: now + 60,
  };

  it("round-trips and hides its content", () => {
    const sealed = sealFlowState(key, state);
    expect(sealed).not.toContain("codeVerifier");
    expect(openFlowState(key, sealed, now)).toEqual(state);
  });

  it("rejects tampering, other keys, expiry and overlong lifetimes", () => {
    const sealed = sealFlowState(key, state);
    const [iv, tag, body] = sealed.split(".");
    const flipped = Buffer.from(body!, "base64url");
    flipped[0] = flipped[0]! ^ 1;
    expect(openFlowState(key, `${iv}.${tag}.${flipped.toString("base64url")}`, now)).toBeNull();
    expect(openFlowState(crypto.randomBytes(32), sealed, now)).toBeNull();
    expect(openFlowState(key, sealed, now + 61)).toBeNull();
    expect(openFlowState(key, sealFlowState(key, { ...state, exp: now + STATE_TTL_SECONDS + 5 }), now)).toBeNull();
    expect(openFlowState(key, "garbage", now)).toBeNull();
    expect(openFlowState(key, undefined, now)).toBeNull();
  });

  it("compares state values exactly", () => {
    expect(stateMatches("abc", "abc")).toBe(true);
    expect(stateMatches("abc", "abd")).toBe(false);
    expect(stateMatches("abc", null)).toBe(false);
  });
});

describe("authorization code flow against a mocked IdP", () => {
  const ISSUER = "https://idp.example.test";
  const CLIENT_ID = "autoseo-client";
  const REDIRECT = "https://app.example.test/api/auth/oidc/callback";
  let privateKey: CryptoKey;
  let jwk: JWK;
  /** What the mocked token endpoint puts into the next ID token. */
  let idTokenClaims: (nonce: string) => Record<string, unknown>;
  let lastTokenRequest: URLSearchParams | null;
  let expectedChallenge = "";

  beforeAll(async () => {
    const pair = await generateKeyPair("RS256");
    privateKey = pair.privateKey;
    jwk = { ...(await exportJWK(pair.publicKey)), kid: "k1", alg: "RS256", use: "sig" };
  });

  function makeConfig() {
    const config = new oidc.Configuration(
      {
        issuer: ISSUER,
        authorization_endpoint: `${ISSUER}/authorize`,
        token_endpoint: `${ISSUER}/token`,
        jwks_uri: `${ISSUER}/jwks`,
        id_token_signing_alg_values_supported: ["RS256"],
        code_challenge_methods_supported: ["S256"],
      },
      CLIENT_ID,
      "s3cret",
    );
    let pendingNonce = "";
    config[oidc.customFetch] = async (url, options) => {
      if (url === `${ISSUER}/jwks`) return Response.json({ keys: [jwk] });
      if (url === `${ISSUER}/token`) {
        const body = new URLSearchParams(String(options.body));
        lastTokenRequest = body;
        const verifier = body.get("code_verifier") ?? "";
        const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
        if (body.get("code") !== "good-code" || challenge !== expectedChallenge || body.get("redirect_uri") !== REDIRECT) {
          return Response.json({ error: "invalid_grant" }, { status: 400 });
        }
        const claims = idTokenClaims(pendingNonce);
        const idToken = await new SignJWT(claims)
          .setProtectedHeader({ alg: "RS256", kid: "k1" })
          .setIssuedAt()
          .setExpirationTime("5m")
          .sign(privateKey);
        return Response.json({ access_token: "at", token_type: "Bearer", expires_in: 300, id_token: idToken });
      }
      return new Response("not found", { status: 404 });
    };
    return { config, setNonce: (n: string) => (pendingNonce = n) };
  }

  async function start() {
    const { config, setNonce } = makeConfig();
    const req = await buildAuthorizationRequest(config, {
      providerKey: "instance",
      clientId: CLIENT_ID,
      redirectUri: REDIRECT,
      scopes: "openid email profile",
      loginHint: "jane@example.com",
      next: "/",
    });
    expectedChallenge = req.url.searchParams.get("code_challenge") ?? "";
    setNonce(req.flow.nonce);
    return { config, ...req };
  }

  const good = (nonce: string) => ({ iss: ISSUER, aud: CLIENT_ID, sub: "u-1", email: "jane@example.com", email_verified: true, nonce });

  it("builds an authorization URL with PKCE S256, state, nonce and login hint", async () => {
    idTokenClaims = good;
    const { url, flow } = await start();
    expect(url.origin + url.pathname).toBe(`${ISSUER}/authorize`);
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("code_challenge")).toBe(crypto.createHash("sha256").update(flow.codeVerifier).digest("base64url"));
    expect(url.searchParams.get("state")).toBe(flow.state);
    expect(url.searchParams.get("nonce")).toBe(flow.nonce);
    expect(url.searchParams.get("redirect_uri")).toBe(REDIRECT);
    expect(url.searchParams.get("login_hint")).toBe("jane@example.com");
    expect(flow.issuer).toBe(ISSUER);
  });

  it("redeems the code and returns verified claims", async () => {
    idTokenClaims = good;
    const { config, flow } = await start();
    const claims = await exchangeAuthorizationCode(config, new URL(`${REDIRECT}?code=good-code&state=${flow.state}`), flow);
    expect(claims).toMatchObject({ sub: "u-1", email: "jane@example.com", iss: ISSUER });
    expect(lastTokenRequest?.get("code_verifier")).toBe(flow.codeVerifier);
  });

  it("rejects a callback whose state doesn't match (login CSRF)", async () => {
    idTokenClaims = good;
    const { config, flow } = await start();
    await expect(exchangeAuthorizationCode(config, new URL(`${REDIRECT}?code=good-code&state=forged`), flow)).rejects.toMatchObject({
      reason: "state_mismatch",
    });
    await expect(exchangeAuthorizationCode(config, new URL(`${REDIRECT}?code=good-code`), flow)).rejects.toBeInstanceOf(OidcFlowError);
  });

  it("rejects an ID token with a different nonce (replay)", async () => {
    idTokenClaims = (n) => ({ ...good(n), nonce: "other-nonce" });
    const { config, flow } = await start();
    await expect(exchangeAuthorizationCode(config, new URL(`${REDIRECT}?code=good-code&state=${flow.state}`), flow)).rejects.toMatchObject({
      reason: "token_exchange_failed",
    });
  });

  it("rejects ID tokens from another issuer or for another client (mix-up)", async () => {
    idTokenClaims = (n) => ({ ...good(n), iss: "https://evil.example.test" });
    let s = await start();
    await expect(exchangeAuthorizationCode(s.config, new URL(`${REDIRECT}?code=good-code&state=${s.flow.state}`), s.flow)).rejects.toMatchObject({
      reason: "token_exchange_failed",
    });
    idTokenClaims = (n) => ({ ...good(n), aud: "someone-else" });
    s = await start();
    await expect(exchangeAuthorizationCode(s.config, new URL(`${REDIRECT}?code=good-code&state=${s.flow.state}`), s.flow)).rejects.toMatchObject({
      reason: "token_exchange_failed",
    });
  });

  it("fails when the PKCE verifier doesn't match the challenge", async () => {
    idTokenClaims = good;
    const { config, flow } = await start();
    await expect(
      exchangeAuthorizationCode(config, new URL(`${REDIRECT}?code=good-code&state=${flow.state}`), { ...flow, codeVerifier: "x".repeat(43) }),
    ).rejects.toMatchObject({ reason: "token_exchange_failed" });
  });

  it("surfaces IdP errors", async () => {
    idTokenClaims = good;
    const { config, flow } = await start();
    await expect(
      exchangeAuthorizationCode(config, new URL(`${REDIRECT}?error=access_denied&error_description=User%20cancelled&state=${flow.state}`), flow),
    ).rejects.toMatchObject({ reason: "idp_error", message: "User cancelled" });
  });
});
