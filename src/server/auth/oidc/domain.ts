/**
 * Email-domain helpers for SSO (pure — unit tested in oidc.test.ts).
 *
 * Domain verification: the workspace adds a DNS TXT record `autoseo-verification=<token>` on the domain itself
 * (apex, e.g. `example.com`). The record is checked server-side (see dns.ts); only verified domains route
 * sign-ins to a workspace's identity provider.
 */

export const VERIFICATION_PREFIX = "autoseo-verification=";

const DOMAIN_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{0,61}[a-z0-9]$/;

/**
 * Consumer mailbox providers: nobody can prove ownership of these for a whole organisation, so they can't be
 * claimed for SSO (DNS verification would fail anyway — this gives a clear error early).
 */
const PUBLIC_MAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "ymail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "gmx.de",
  "gmx.net",
  "gmx.com",
  "web.de",
  "t-online.de",
  "mail.com",
  "yandex.com",
  "zoho.com",
]);

/** Normalizes user input ("@Example.com", "https://example.com/x") to a bare lowercase domain, or null if invalid. */
export function normalizeDomainInput(raw: string): string | null {
  const d = raw
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/^[a-z]+:\/\//, "")
    .replace(/[/?#].*$/, "")
    .replace(/\.$/, "");
  return DOMAIN_RE.test(d) ? d : null;
}

export function isPublicMailDomain(domain: string): boolean {
  return PUBLIC_MAIL_DOMAINS.has(domain);
}

/** Domain part of an email address (lowercase), or "" when there is none. */
export function emailDomainOf(email: string): string {
  const at = email.trim().toLowerCase().lastIndexOf("@");
  return at > 0 ? email.trim().toLowerCase().slice(at + 1) : "";
}

/** Exact domain match — SSO domains never implicitly cover sub-domains (each domain is verified on its own). */
export function emailInDomains(email: string, domains: readonly string[]): boolean {
  const domain = emailDomainOf(email);
  return Boolean(domain) && domains.includes(domain);
}

export function verificationRecord(token: string): string {
  return `${VERIFICATION_PREFIX}${token}`;
}

/**
 * True when one of the TXT records (as returned by `dns.resolveTxt`: each record is an array of ≤255-byte
 * chunks) is exactly `autoseo-verification=<token>`. Chunks are joined, surrounding whitespace and quotes are
 * ignored, the comparison is otherwise exact.
 */
export function txtRecordsContainToken(records: readonly (readonly string[])[], token: string): boolean {
  if (!token) return false;
  const expected = verificationRecord(token);
  return records.some((chunks) => {
    const value = chunks.join("").trim().replace(/^"(.*)"$/, "$1").trim();
    return value === expected;
  });
}
