import { Resolver } from "node:dns/promises";
import { txtRecordsContainToken, verificationRecord } from "./domain";

/** DNS TXT verification of SSO domains (server-side resolver with a hard timeout). */

export type TxtLookup = (domain: string) => Promise<string[][]>;

const DEFAULT_TIMEOUT_MS = 5_000;

/** Resolves TXT records with a per-query timeout and an overall deadline (the resolver is cancelled on timeout). */
export async function lookupTxt(domain: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<string[][]> {
  const resolver = new Resolver({ timeout: Math.min(timeoutMs, 3_000), tries: 2 });
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      resolver.resolveTxt(domain),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          resolver.cancel();
          reject(Object.assign(new Error("DNS lookup timed out."), { code: "ETIMEOUT" }));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export type DomainCheck = { verified: true } | { verified: false; error: string };

/** Checks that `domain` has the TXT record `autoseo-verification=<token>`. The lookup is injectable for tests. */
export async function checkDomainTxt(domain: string, token: string, lookup: TxtLookup = lookupTxt): Promise<DomainCheck> {
  let records: string[][];
  try {
    records = await lookup(domain);
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === "ENODATA" || code === "ENOTFOUND" || code === "NXDOMAIN") {
      return { verified: false, error: `No TXT record found on ${domain}. Add ${verificationRecord(token)} and try again (DNS changes can take a while).` };
    }
    if (code === "ETIMEOUT" || code === "ECANCELLED") return { verified: false, error: "The DNS lookup timed out. Try again in a moment." };
    return { verified: false, error: "The DNS lookup failed. Try again in a moment." };
  }
  if (txtRecordsContainToken(records, token)) return { verified: true };
  return { verified: false, error: `The TXT record ${verificationRecord(token)} was not found on ${domain} yet.` };
}
