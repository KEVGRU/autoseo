import "server-only";

/* Redirect URI policy shared by dynamic registration and Client ID Metadata Documents. */

const BLOCKED_SCHEMES = new Set(["javascript:", "data:", "file:", "vbscript:", "about:", "blob:", "ftp:", "ws:", "wss:", "chrome:", "view-source:"]);
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function isLoopbackHost(hostname: string) {
  return LOOPBACK_HOSTS.has(hostname) || /^127\.\d+\.\d+\.\d+$/.test(hostname);
}

/**
 * Redirect URI policy (OAuth 2.1 + RFC 8252): https anywhere, http only on loopback, or a
 * private-use custom scheme for native apps (cursor://, vscode://…). No fragments, no userinfo.
 */
export function validateRedirectUri(uri: string): string | null {
  if (typeof uri !== "string" || !uri || uri.length > 2048) return "redirect_uri is missing or too long";
  let u: URL;
  try {
    u = new URL(uri);
  } catch {
    return `redirect_uri is not an absolute URI: ${uri.slice(0, 100)}`;
  }
  if (u.hash || uri.includes("#")) return "redirect_uri must not contain a fragment";
  if (u.username || u.password) return "redirect_uri must not contain credentials";
  const scheme = u.protocol.toLowerCase();
  if (BLOCKED_SCHEMES.has(scheme)) return `redirect_uri scheme ${scheme} is not allowed`;
  if (scheme === "https:") return u.hostname ? null : "redirect_uri must have a host";
  if (scheme === "http:") {
    return isLoopbackHost(u.hostname) ? null : "http redirect URIs are only allowed for loopback hosts (use https)";
  }
  if (!/^[a-z][a-z0-9+.-]*:$/.test(scheme)) return "redirect_uri has an invalid scheme";
  return null;
}

/** Exact match, except loopback http URIs where the port may vary (RFC 8252 §7.3). */
export function redirectUriMatches(registered: string, requested: string): boolean {
  if (registered === requested) return true;
  try {
    const a = new URL(registered);
    const b = new URL(requested);
    return (
      a.protocol === "http:" &&
      b.protocol === "http:" &&
      isLoopbackHost(a.hostname) &&
      a.hostname === b.hostname &&
      a.pathname === b.pathname &&
      a.search === b.search
    );
  } catch {
    return false;
  }
}
