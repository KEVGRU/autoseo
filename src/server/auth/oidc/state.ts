import crypto from "node:crypto";

/**
 * Sealed OIDC flow state kept in a short-lived httpOnly cookie between /api/auth/oidc/start and the callback
 * (pure — unit tested in oidc.test.ts). AES-256-GCM: the browser can neither read (PKCE verifier, nonce) nor
 * forge it. The callback compares `state` from the IdP with the sealed one (CSRF / login-CSRF protection) and
 * passes the sealed nonce + verifier to openid-client.
 */

export type OidcFlowState = {
  /** "instance" or a workspace_sso_providers id. */
  providerKey: string;
  /** Issuer + client id at start — the callback refuses when the provider was reconfigured meanwhile (mix-up). */
  issuer: string;
  clientId: string;
  state: string;
  nonce: string;
  codeVerifier: string;
  /** Relative path to open after sign-in (already passed through safeNext). */
  next: string | null;
  /** Unix seconds. */
  exp: number;
};

export const STATE_TTL_SECONDS = 10 * 60;

export function sealFlowState(key: Buffer, state: OidcFlowState): string {
  if (key.length !== 32) throw new Error("state key must be 32 bytes");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(state), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), body].map((b) => b.toString("base64url")).join(".");
}

/** Returns the state when the cookie is authentic and not expired, otherwise null. */
export function openFlowState(key: Buffer, sealed: string | undefined | null, nowSeconds = Math.floor(Date.now() / 1000)): OidcFlowState | null {
  if (!sealed || sealed.length > 4096 || key.length !== 32) return null;
  const parts = sealed.split(".");
  if (parts.length !== 3) return null;
  try {
    const [iv, tag, body] = parts.map((p) => Buffer.from(p, "base64url"));
    if (iv!.length !== 12 || tag!.length !== 16) return null;
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv!);
    decipher.setAuthTag(tag!);
    const json = Buffer.concat([decipher.update(body!), decipher.final()]).toString("utf8");
    const s = JSON.parse(json) as OidcFlowState;
    const strings = [s.providerKey, s.issuer, s.clientId, s.state, s.nonce, s.codeVerifier];
    if (strings.some((v) => typeof v !== "string" || !v)) return null;
    if (s.next !== null && typeof s.next !== "string") return null;
    if (typeof s.exp !== "number" || s.exp < nowSeconds || s.exp > nowSeconds + STATE_TTL_SECONDS) return null;
    return s;
  } catch {
    return null;
  }
}

/** Constant-time comparison of the `state` returned by the IdP with the sealed one. */
export function stateMatches(expected: string, received: string | null): boolean {
  if (!received) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
