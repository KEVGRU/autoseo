import { emailDomainOf, emailInDomains } from "./domain";

/**
 * Validation of ID token claims after openid-client verified signature, `iss`, `aud`, `exp` and `nonce`
 * (pure — unit tested in oidc.test.ts).
 */

export type SsoIdentityClaims = { issuer: string; subject: string; email: string; name: string | null; groups: string[] };

export type ClaimCheck = { ok: true; identity: SsoIdentityClaims } | { ok: false; reason: "missing_subject" | "missing_email" | "email_not_verified" | "domain_not_allowed"; detail?: string };

/**
 * The email must be verified by the IdP: `email_verified: true` (OIDC standard; Okta, Google, Keycloak, Auth0), or
 * Microsoft Entra ID's `xms_edov: true` (email domain owner verified — Entra doesn't send email_verified). An
 * unverified email claim would let anyone who can create an account at the IdP take over the matching user.
 */
export function isEmailVerified(claims: Record<string, unknown>): boolean {
  const v = claims.email_verified;
  if (v === true || v === "true") return true;
  const edov = claims.xms_edov;
  return edov === true || edov === "true" || edov === 1;
}

/** Group values from a claim (array of strings, or a single string); other types are ignored. */
export function groupsFromClaim(claims: Record<string, unknown>, claimName: string): string[] {
  if (!claimName) return [];
  const raw = claims[claimName];
  if (typeof raw === "string") return [raw];
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string").slice(0, 500);
  return [];
}

/**
 * Checks the claims of a verified ID token: subject present, email present + verified by the IdP, and the email's
 * domain one of the provider's domains (a workspace's IdP can only sign in addresses of its verified domains).
 */
export function checkIdClaims(claims: Record<string, unknown>, opts: { domains: readonly string[]; groupClaim: string }): ClaimCheck {
  const subject = typeof claims.sub === "string" ? claims.sub : "";
  const issuer = typeof claims.iss === "string" ? claims.iss : "";
  if (!subject || !issuer) return { ok: false, reason: "missing_subject" };
  const email = typeof claims.email === "string" ? claims.email.trim().toLowerCase() : "";
  // Exactly one "@", no whitespace / control characters — so every domain parser in the app sees the same domain.
  if (!email || email.length > 320 || !/^[^\s@\x00-\x1f\x7f]+@[^\s@\x00-\x1f\x7f]+\.[^\s@\x00-\x1f\x7f]{2,}$/.test(email)) {
    return { ok: false, reason: "missing_email" };
  }
  if (!isEmailVerified(claims)) return { ok: false, reason: "email_not_verified", detail: email };
  if (!emailInDomains(email, opts.domains)) return { ok: false, reason: "domain_not_allowed", detail: emailDomainOf(email) };
  const name = typeof claims.name === "string" && claims.name.trim() ? claims.name.trim().slice(0, 120) : null;
  return { ok: true, identity: { issuer, subject, email, name, groups: groupsFromClaim(claims, opts.groupClaim) } };
}

/**
 * Role for a person joining via SSO: the first mapped IdP group (in map order) whose role is allowed, else the
 * default role. `isAllowedRole` rejects unknown roles and roles that would grant instance administration.
 */
export function roleForGroups(
  groups: readonly string[],
  map: Readonly<Record<string, string>>,
  defaultRoleKey: string,
  isAllowedRole: (roleKey: string) => boolean,
): string | null {
  const have = new Set(groups);
  for (const [group, roleKey] of Object.entries(map)) {
    if (have.has(group) && isAllowedRole(roleKey)) return roleKey;
  }
  return isAllowedRole(defaultRoleKey) ? defaultRoleKey : null;
}
