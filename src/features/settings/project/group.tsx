"use client";

import { useMemo, useTransition } from "react";
import Link from "next/link";
import { FolderTree, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/app/page";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setProjectGroupAction } from "@/features/settings/workspace/group-actions";
import { GROUP_KIND_META, groupPath, type GroupKindKey } from "@/features/settings/workspace/groups-shared";

const NONE = "__none__";

export type ProjectGroupOption = { id: string; parentId: string | null; name: string; kind: GroupKindKey };

/** Project group (breadcrumb + picker) and the viewer's effective role in this project. */
export function ProjectGroupSettings({
  projectId,
  workspaceId,
  groupId,
  groups,
  canChange,
  access,
}: {
  projectId: string;
  workspaceId: string;
  groupId: string | null;
  groups: ProjectGroupOption[];
  /** members.manage with all-project access (same rule as Settings → Workspace → Groups). */
  canChange: boolean;
  access: { roleName: string; source: "project" | "group" | "workspace"; sourceGroupName: string | null };
}) {
  const byId = useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups]);
  const path = groupPath(byId, groupId);
  const options = useMemo(
    () =>
      groups
        .map((g) => ({ g, label: groupPath(byId, g.id).map((x) => x.name).join(" › ") }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [groups, byId],
  );
  const [pending, start] = useTransition();
  const groupsHref = `/settings/workspace?ws=${encodeURIComponent(workspaceId)}&tab=groups`;

  const sourceText =
    access.source === "project"
      ? "a role set for this project"
      : access.source === "group"
        ? `the group “${access.sourceGroupName ?? "—"}”`
        : "your workspace role";

  return (
    <Panel
      title="Group & access"
      icon={<FolderTree className="size-4 text-muted-foreground" />}
      description={
        <>
          Members of the project&apos;s group (and its parent groups) get their group role here.{" "}
          <Link href={groupsHref} className="underline underline-offset-2">
            Manage groups
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Group</div>
            {path.length ? (
              <div className="flex min-w-0 flex-wrap items-center gap-1 text-sm font-medium">
                {path.map((g, i) => {
                  const Icon = GROUP_KIND_META[g.kind].icon;
                  return (
                    <span key={g.id} className="flex min-w-0 items-center gap-1">
                      {i > 0 && <span className="text-muted-foreground">›</span>}
                      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{g.name}</span>
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Not in a group</div>
            )}
          </div>
          {canChange && (
            <Select
              value={groupId ?? NONE}
              disabled={pending}
              onValueChange={(v) =>
                start(async () => {
                  const res = await setProjectGroupAction({ workspaceId, projectId, groupId: v === NONE ? null : v });
                  if (!res.ok) toast.error(res.error);
                  else toast.success(v === NONE ? "Removed from its group" : "Group changed");
                })
              }
            >
              <SelectTrigger className="w-full min-w-0 sm:w-72">
                {pending ? <Loader2 className="size-4 animate-spin" /> : <SelectValue />}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No group</SelectItem>
                {options.map(({ g, label }) => (
                  <SelectItem key={g.id} value={g.id}>
                    <span className="truncate">{label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {canChange && groups.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No groups yet — create brands, regions, teams or clients in{" "}
            <Link href={groupsHref} className="underline underline-offset-2">
              Settings → Workspace → Groups
            </Link>
            .
          </p>
        )}
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 shrink-0" />
          Your role in this project:
          <Badge variant="secondary">{access.roleName}</Badge>
          <span>from {sourceText}</span>
        </div>
      </div>
    </Panel>
  );
}
