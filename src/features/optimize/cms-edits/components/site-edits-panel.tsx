import "server-only";
import { listCmsChanges, listCmsEditTargets } from "@/server/optimize/cms-edits/service";
import { SiteEditsView } from "./site-edits-view";

const FILTERS = new Set(["open", "applied", "reverted", "rejected", "all"]);

/** Server part of Content → Site edits: loads edit-capable CMS connections and the change queue. */
export async function SiteEditsPanel({
  projectId,
  searchParams,
  canEdit,
  aiAvailable,
}: {
  projectId: string;
  searchParams: Record<string, string | string[] | undefined>;
  canEdit: boolean;
  aiAvailable: boolean;
}) {
  const one = (k: string) => {
    const v = searchParams[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const status = FILTERS.has(one("edits") ?? "") ? (one("edits") as "open" | "applied" | "reverted" | "rejected" | "all") : "open";
  const provider = one("cms")?.slice(0, 40) || undefined;
  const page = Math.min(10_000, Math.max(1, Number.parseInt(one("edits_page") ?? "1", 10) || 1));
  const [targets, changes] = await Promise.all([
    listCmsEditTargets(projectId),
    listCmsChanges(projectId, { status, provider: provider === "all" ? undefined : provider, page, limit: 25 }),
  ]);
  return (
    <SiteEditsView
      projectId={projectId}
      targets={targets}
      changes={changes.items}
      counts={changes.counts}
      pagination={changes.pagination}
      canEdit={canEdit}
      aiAvailable={aiAvailable}
    />
  );
}
