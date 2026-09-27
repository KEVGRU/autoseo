"use client";

import { useState, useTransition } from "react";
import { Check, Eye, Loader2, Minus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Panel } from "@/components/app/page";
import { EmptyState } from "@/components/app/empty-state";
import { PERMISSIONS, type Permission } from "@/server/auth/permissions";
import type { AccessPreviewRow } from "@/server/access/groups";
import { cn } from "@/lib/utils";
import { previewAccessAction } from "./group-actions";
import { personLabel, type Person } from "./group-dialogs";
import type { RoleInfo } from "./queries";

/** Short labels for project permissions in the preview chips. */
const SHORT: Partial<Record<Permission, string>> = {
  "project.view": "View",
  "prompts.manage": "Edit",
  "seo.run": "Paid SEO",
  "reports.manage": "Reports",
  "reports.share": "Share",
  "data.export": "Export",
  "attribution.manage": "Attribution",
  "alerts.manage": "Alerts",
  "projects.manage": "Configure",
};

/** "Effective access" preview: what one member can do in every project and where it comes from. */
export function AccessPreview({
  workspaceId,
  people,
  roles,
  groupName,
}: {
  workspaceId: string;
  people: Person[];
  roles: RoleInfo[];
  groupName: (id: string) => string;
}) {
  const [userId, setUserId] = useState("");
  const [rows, setRows] = useState<AccessPreviewRow[] | null>(null);
  const [pending, start] = useTransition();
  const roleName = (key: string | null) => (key ? (roles.find((r) => r.key === key)?.name ?? key) : "—");
  const active = people.filter((p) => p.status === "active");

  function load(id: string) {
    setUserId(id);
    start(async () => {
      const res = await previewAccessAction({ workspaceId, userId: id });
      if (!res.ok) {
        setRows(null);
        return void toast.error(res.error);
      }
      setRows(res.data);
    });
  }

  const sourceLabel = (r: AccessPreviewRow) =>
    r.source === "project" ? "Project role" : r.source === "group" && r.sourceGroupId ? `Group: ${groupName(r.sourceGroupId)}` : "Workspace role";
  const viaLabel = (r: AccessPreviewRow) =>
    r.via === "all_projects" ? "all projects" : r.via === "group" ? "via group" : r.via === "project" ? "assigned" : "";
  const granted = rows?.filter((r) => r.access).length ?? 0;

  return (
    <Panel
      title="Effective access"
      icon={<Eye className="size-4 text-muted-foreground" />}
      description="Preview what a member can see and do in each project after workspace, group and project roles are combined."
    >
      <div className="space-y-4">
        <div className="max-w-sm space-y-1.5">
          <Label>Member</Label>
          <Select value={userId} onValueChange={load}>
            <SelectTrigger className="w-full min-w-0">
              <SelectValue placeholder="Choose a member" />
            </SelectTrigger>
            <SelectContent>
              {active.map((p) => (
                <SelectItem key={p.userId} value={p.userId}>
                  <span className="truncate">{personLabel(p)}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {pending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Resolving access…
          </div>
        )}

        {!pending && rows && rows.length === 0 && (
          <EmptyState compact icon={Eye} title="No projects yet" description="Create a project to see how access resolves." />
        )}

        {!pending && rows && rows.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Access to {granted} of {rows.length} {rows.length === 1 ? "project" : "projects"}.
            </p>
            <ul className="divide-y overflow-hidden rounded-xl border">
              {rows.map((r) => (
                <li key={r.projectId} className={cn("flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-4", !r.access && "bg-muted/30")}>
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full",
                        r.access ? "bg-brand-soft text-brand" : "bg-muted text-muted-foreground",
                      )}
                      aria-label={r.access ? "Has access" : "No access"}
                    >
                      {r.access ? <Check className="size-3.5" /> : <Minus className="size-3.5" />}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{r.projectName}</div>
                      <div className="truncate text-xs text-muted-foreground">{r.projectDomain}</div>
                    </div>
                  </div>
                  {r.access ? (
                    <div className="flex min-w-0 flex-col gap-1.5 sm:max-w-[60%] sm:items-end">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <Badge variant="secondary">{roleName(r.roleKey)}</Badge>
                        <span className="text-muted-foreground">
                          {sourceLabel(r)}
                          {viaLabel(r) ? ` · ${viaLabel(r)}` : ""}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 sm:justify-end">
                        {r.permissions.length ? (
                          r.permissions.map((p) => (
                            <span
                              key={p}
                              title={PERMISSIONS[p]?.label ?? p}
                              className="rounded-md border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground"
                            >
                              {SHORT[p] ?? PERMISSIONS[p]?.label ?? p}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-muted-foreground">No project permissions</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No access</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Panel>
  );
}
