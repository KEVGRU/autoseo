import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { promptTagLinks, prompts, promptTags } from "@/server/db/schema";

export type PromptInfo = {
  id: string;
  text: string;
  country: string;
  topic: string | null;
  funnelStage: string | null;
  intent: string | null;
  persona: string | null;
  markets: string[];
  status: string;
  tags: { id: string; name: string; color: string | null }[];
};

/** All prompts of a project with their tags (small table; loaded whole). */
export async function getPromptMap(projectId: string): Promise<Map<string, PromptInfo>> {
  const [ps, links] = await Promise.all([
    db
      .select({
        id: prompts.id,
        text: prompts.text,
        country: prompts.country,
        topic: prompts.topic,
        funnelStage: prompts.funnelStage,
        intent: prompts.intent,
        persona: prompts.persona,
        markets: prompts.markets,
        status: prompts.status,
      })
      .from(prompts)
      .where(eq(prompts.projectId, projectId)),
    db
      .select({ promptId: promptTagLinks.promptId, id: promptTags.id, name: promptTags.name, color: promptTags.color })
      .from(promptTagLinks)
      .innerJoin(promptTags, eq(promptTags.id, promptTagLinks.tagId))
      .where(eq(promptTags.projectId, projectId)),
  ]);
  const map = new Map<string, PromptInfo>(ps.map((p) => [p.id, { ...p, markets: p.markets?.length ? p.markets : [p.country], tags: [] }]));
  for (const l of links) map.get(l.promptId)?.tags.push({ id: l.id, name: l.name, color: l.color });
  return map;
}

/** tag id → active prompt ids (for tag slicing). */
export async function getTagGroups(projectId: string): Promise<{ tags: { id: string; name: string; color: string | null }[]; groups: Map<string, string[]> }> {
  const rowsT = await db
    .select({ tagId: promptTags.id, name: promptTags.name, color: promptTags.color, promptId: prompts.id })
    .from(promptTags)
    .leftJoin(promptTagLinks, eq(promptTagLinks.tagId, promptTags.id))
    .leftJoin(prompts, and(eq(prompts.id, promptTagLinks.promptId), eq(prompts.status, "active")))
    .where(eq(promptTags.projectId, projectId));
  const groups = new Map<string, string[]>();
  const tags = new Map<string, { id: string; name: string; color: string | null }>();
  for (const r of rowsT) {
    tags.set(r.tagId, { id: r.tagId, name: r.name, color: r.color });
    if (!groups.has(r.tagId)) groups.set(r.tagId, []);
    if (r.promptId) groups.get(r.tagId)!.push(r.promptId);
  }
  return { tags: [...tags.values()].sort((a, b) => a.name.localeCompare(b.name)), groups };
}

export const FUNNEL_LABELS: Record<string, string> = { tofu: "Awareness (TOFU)", mofu: "Consideration (MOFU)", bofu: "Decision (BOFU)" };

/**
 * Active prompts grouped by funnel stage / intent / persona (for competitor slicing). Prompts
 * without a value are grouped under "Unassigned" so the slices add up to the whole prompt set.
 */
export function getPromptSlices(
  promptMap: Map<string, PromptInfo>,
): Record<"funnel" | "intent" | "persona", { keys: { id: string; name: string }[]; groups: Map<string, string[]> }> {
  const build = (value: (p: PromptInfo) => string | null, label: (v: string) => string, order: string[] = []) => {
    const groups = new Map<string, string[]>();
    for (const p of promptMap.values()) {
      if (p.status !== "active") continue;
      const v = value(p)?.trim() || "";
      const key = v || "__none";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p.id);
    }
    const keys = [...groups.keys()]
      .sort((a, b) => (a === "__none" ? 1 : b === "__none" ? -1 : (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99) || a.localeCompare(b)))
      .map((k) => ({ id: k, name: k === "__none" ? "Unassigned" : label(k) }));
    // Only one group (e.g. everything unassigned) is not a useful slice.
    return keys.length > 1 || (keys.length === 1 && keys[0]!.id !== "__none") ? { keys, groups } : { keys: [], groups: new Map<string, string[]>() };
  };
  return {
    funnel: build((p) => p.funnelStage, (v) => FUNNEL_LABELS[v] ?? v, ["tofu", "mofu", "bofu"]),
    intent: build((p) => p.intent, (v) => v),
    persona: build((p) => p.persona, (v) => v),
  };
}
