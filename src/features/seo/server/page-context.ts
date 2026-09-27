import "server-only";
import { requireProject } from "@/server/auth/guards";
import { getEnrichmentStatus, type EnrichmentSource } from "@/server/enrichment";
import { seoContextFromProject } from "@/server/seo";

/** Enrichment capabilities the SEO pages depend on. */
const SEO_CAPABILITIES = ["keyword_ideas", "keyword_metrics", "serp", "domain", "backlinks", "local"] as const;
export type SeoCapability = (typeof SEO_CAPABILITIES)[number];

/** Common loader for every SEO page: project guard, SeoContext, data source per capability and permissions. */
export async function loadSeoPage(projectId: string) {
  const pctx = await requireProject(projectId);
  const ctx = seoContextFromProject(pctx);
  const status = await getEnrichmentStatus({ workspaceId: pctx.project.workspaceId });
  const sources = Object.fromEntries(SEO_CAPABILITIES.map((c) => [c, status.capabilities[c].provider])) as Record<SeoCapability, EnrichmentSource | null>;
  const reasons = Object.fromEntries(SEO_CAPABILITIES.map((c) => [c, status.capabilities[c].reason])) as Record<SeoCapability, string>;
  return {
    ctx,
    /** DataForSEO credentials are usable for this workspace (measured data; costs apply). */
    configured: status.dfsConfigured,
    /** Whose DataForSEO account serves this workspace. */
    dfsScope: status.dfsScope,
    sources,
    reasons,
    isAdmin: pctx.isInstanceAdmin,
    canRun: ctx.canRun,
    market: ctx.market,
    project: { id: pctx.project.id, name: pctx.project.name, domain: pctx.project.domain, country: pctx.project.country, language: pctx.project.language },
  };
}

export type SeoPageInfo = Awaited<ReturnType<typeof loadSeoPage>>;

/** Serializable subset passed to client views. */
export function clientPageInfo(info: SeoPageInfo) {
  return {
    projectId: info.project.id,
    projectDomain: info.project.domain,
    market: info.market,
    configured: info.configured,
    sources: info.sources,
    reasons: info.reasons,
    canRun: info.canRun,
    isAdmin: info.isAdmin,
  };
}
export type ClientPageInfo = ReturnType<typeof clientPageInfo>;
