function hostOf(url: string): string | null {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * API token to store when the Coolify settings are saved. A newly entered token always wins; if the base URL
 * now points at a different host, the saved token is dropped so it is never sent to that host.
 */
export function resolveCoolifyToken(opts: {
  previousUrl: string;
  nextUrl: string;
  savedToken: string;
  enteredToken: string;
}): { token: string; cleared: boolean } {
  if (opts.enteredToken) return { token: opts.enteredToken, cleared: false };
  if (hostOf(opts.previousUrl) !== hostOf(opts.nextUrl)) return { token: "", cleared: !!opts.savedToken };
  return { token: opts.savedToken, cleared: false };
}
