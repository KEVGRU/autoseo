import { Briefcase, Folder, Globe2, Tag, Users, type LucideIcon } from "lucide-react";
import { MAX_GROUP_DEPTH } from "@/server/auth/effective-access";

/** Client-safe helpers for the project group tree (the server enforces the same limits). */

export type GroupKindKey = "brand" | "region" | "team" | "client" | "other";

export const GROUP_KIND_META: Record<GroupKindKey, { label: string; icon: LucideIcon; className: string }> = {
  brand: { label: "Brand", icon: Tag, className: "bg-brand-soft text-brand" },
  region: { label: "Region", icon: Globe2, className: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  team: { label: "Team", icon: Users, className: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  client: { label: "Client", icon: Briefcase, className: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  other: { label: "Other", icon: Folder, className: "bg-muted text-muted-foreground" },
};

export const GROUP_KIND_KEYS = Object.keys(GROUP_KIND_META) as GroupKindKey[];

export { MAX_GROUP_DEPTH };

type Node = { id: string; parentId: string | null; name: string };

/** Ancestor names of a group (root first), cycle- and depth-safe. */
export function groupPath<N extends Node>(byId: ReadonlyMap<string, N>, groupId: string | null): N[] {
  const out: N[] = [];
  const seen = new Set<string>();
  let current = groupId ? byId.get(groupId) : undefined;
  while (current && !seen.has(current.id) && out.length < MAX_GROUP_DEPTH * 2) {
    out.unshift(current);
    seen.add(current.id);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return out;
}

/** Ids of a group and all of its descendants. */
export function descendantIds(nodes: readonly Node[], groupId: string): Set<string> {
  const out = new Set<string>([groupId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const n of nodes) {
      if (n.parentId && out.has(n.parentId) && !out.has(n.id)) {
        out.add(n.id);
        grew = true;
      }
    }
  }
  return out;
}

/** Depth of a group (1 = top level). */
export function depthOf(byId: ReadonlyMap<string, Node>, groupId: string): number {
  return groupPath(byId, groupId).length;
}

/** Height of the subtree below a group (0 = leaf). */
export function heightOf(nodes: readonly Node[], groupId: string): number {
  const children = nodes.filter((n) => n.parentId === groupId);
  let max = 0;
  const seen = new Set<string>([groupId]);
  const walk = (id: string, h: number) => {
    max = Math.max(max, h);
    for (const c of nodes) if (c.parentId === id && !seen.has(c.id)) {
      seen.add(c.id);
      walk(c.id, h + 1);
    }
  };
  for (const c of children) {
    seen.add(c.id);
    walk(c.id, 1);
  }
  return max;
}
