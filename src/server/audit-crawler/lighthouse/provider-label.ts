/**
 * Which Lighthouse provider actually produced a report, and how to label it. A check queued for DataForSEO is answered
 * by PageSpeed Insights when the DataForSEO account is missing, rejected or out of funds, so the stored row and the UI
 * follow the report's `source`, not the provider the audit was started with. Pure module (unit tested).
 */

export type LighthouseProviderId = "psi" | "dataforseo";
export type LighthouseReportSource = "dataforseo-lighthouse" | "pagespeed-insights";

export const LIGHTHOUSE_PROVIDER_LABEL: Record<LighthouseProviderId, string> = {
  psi: "PageSpeed Insights",
  dataforseo: "DataForSEO Lighthouse",
};

/** Provider behind a stored report's `source`. */
export function providerOfSource(source: LighthouseReportSource): LighthouseProviderId {
  return source === "dataforseo-lighthouse" ? "dataforseo" : "psi";
}

/**
 * Providers that produced an audit's finished checks (preference order: PSI, DataForSEO). Before any check finished,
 * the provider the audit was started with.
 */
export function auditLighthouseProviders(doneProviders: Iterable<string>, configured: LighthouseProviderId): LighthouseProviderId[] {
  const used = new Set<string>(doneProviders);
  const out = (["psi", "dataforseo"] as const).filter((p) => used.has(p));
  return out.length ? out : [configured];
}

export function lighthouseProvidersLabel(providers: LighthouseProviderId[]): string {
  return providers.map((p) => LIGHTHOUSE_PROVIDER_LABEL[p]).join(" + ");
}
