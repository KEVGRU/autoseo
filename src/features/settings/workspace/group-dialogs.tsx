"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createGroupAction, setGroupMemberAction, setProjectGroupAction, setProjectRoleAction, updateGroupAction } from "./group-actions";
import { GROUP_KIND_KEYS, GROUP_KIND_META, MAX_GROUP_DEPTH, depthOf, descendantIds, groupPath, heightOf, type GroupKindKey } from "./groups-shared";
import { ProjectPicker, type PickerProject } from "./project-picker";
import type { RoleInfo } from "./queries";

export type GroupRow = {
  id: string;
  parentId: string | null;
  name: string;
  kind: GroupKindKey;
  projectIds: string[];
  members: { userId: string; roleKey: string }[];
};

export type Person = { userId: string; email: string; name: string | null; avatarUrl: string | null; roleKey: string; status: "active" | "disabled" };

const TOP = "__top__";

export function personLabel(p: Pick<Person, "name" | "email">) {
  return p.name ? `${p.name} (${p.email})` : p.email;
}

/** Create a group or edit name / kind / parent of an existing one. */
export function GroupFormDialog({
  open,
  onOpenChange,
  workspaceId,
  groups,
  group,
  defaultParentId = null,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workspaceId: string;
  groups: GroupRow[];
  /** Edit this group; omit to create. */
  group?: GroupRow | null;
  defaultParentId?: string | null;
}) {
  const byId = useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups]);
  const [name, setName] = useState(group?.name ?? "");
  const [kind, setKind] = useState<GroupKindKey>(group?.kind ?? "other");
  const [parentId, setParentId] = useState<string>(group ? (group.parentId ?? TOP) : (defaultParentId ?? TOP));
  const [pending, start] = useTransition();

  // A group can't move into itself or its sub-groups, and the whole subtree must stay within the depth limit.
  const excluded = useMemo(() => (group ? descendantIds(groups, group.id) : new Set<string>()), [groups, group]);
  const height = group ? heightOf(groups, group.id) : 0;
  const parentOptions = groups
    .filter((g) => !excluded.has(g.id))
    .map((g) => ({ g, path: groupPath(byId, g.id), fits: depthOf(byId, g.id) + 1 + height <= MAX_GROUP_DEPTH }))
    .sort((a, b) => a.path.map((x) => x.name).join(" › ").localeCompare(b.path.map((x) => x.name).join(" › ")));

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return void toast.error("Enter a group name.");
    const parent = parentId === TOP ? null : parentId;
    start(async () => {
      const res = group
        ? await updateGroupAction({ workspaceId, groupId: group.id, name: trimmed, kind, parentId: parent })
        : await createGroupAction({ workspaceId, name: trimmed, kind, parentId: parent });
      if (!res.ok) return void toast.error(res.error);
      toast.success(group ? "Group updated" : `Group “${trimmed}” created`);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{group ? "Edit group" : "New group"}</DialogTitle>
          <DialogDescription>
            Groups mirror your organisation — brands, subsidiaries, regions, teams or clients. They can be nested up to{" "}
            {MAX_GROUP_DEPTH} levels.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="group-name">Name</Label>
            <Input id="group-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="e.g. DACH, Team Berlin, Acme Corp" autoFocus />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as GroupKindKey)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_KIND_KEYS.map((k) => {
                    const Icon = GROUP_KIND_META[k].icon;
                    return (
                      <SelectItem key={k} value={k}>
                        <Icon className="size-3.5" /> {GROUP_KIND_META[k].label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 space-y-1.5">
              <Label>Parent group</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TOP}>Top level</SelectItem>
                  {parentOptions.map(({ g, path, fits }) => (
                    <SelectItem key={g.id} value={g.id} disabled={!fits}>
                      <span className="truncate">{path.map((x) => x.name).join(" › ")}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : group ? "Save" : "Create group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Moves the selected projects into a group (a project belongs to at most one group). */
export function AddProjectsDialog({
  open,
  onOpenChange,
  workspaceId,
  group,
  projects,
  projectGroupId,
  groupName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workspaceId: string;
  group: GroupRow;
  projects: PickerProject[];
  /** Current group of each project. */
  projectGroupId: ReadonlyMap<string, string>;
  groupName: (id: string) => string;
}) {
  const candidates = projects.filter((p) => projectGroupId.get(p.id) !== group.id);
  const [ids, setIds] = useState<string[]>([]);
  const [pending, start] = useTransition();
  const moving = ids.filter((id) => projectGroupId.has(id));

  function submit() {
    if (!ids.length) return void toast.error("Select at least one project.");
    start(async () => {
      let failed = 0;
      for (const projectId of ids) {
        const res = await setProjectGroupAction({ workspaceId, projectId, groupId: group.id });
        if (!res.ok) {
          failed++;
          toast.error(res.error);
        }
      }
      if (failed < ids.length) toast.success(`${ids.length - failed} ${ids.length - failed === 1 ? "project" : "projects"} added to ${group.name}`);
      setIds([]);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add projects to {group.name}</DialogTitle>
          <DialogDescription>A project belongs to one group. Projects that are already in another group move here.</DialogDescription>
        </DialogHeader>
        {candidates.length ? (
          <ProjectPicker projects={candidates} value={ids} onChange={setIds} />
        ) : (
          <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">All projects are already in this group.</p>
        )}
        {moving.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Moves {moving.length} from {[...new Set(moving.map((id) => groupName(projectGroupId.get(id)!)))].join(", ")}.
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending || !ids.length}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : `Add ${ids.length || ""}`.trim()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoleSelect({ roles, grantable, value, onChange }: { roles: RoleInfo[]; grantable: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Choose a role" />
      </SelectTrigger>
      <SelectContent>
        {roles.map((r) => (
          <SelectItem key={r.key} value={r.key} disabled={!grantable.includes(r.key)}>
            {r.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function PersonSelect({ people, value, onChange }: { people: Person[]; value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full min-w-0">
        <SelectValue placeholder="Choose a member" />
      </SelectTrigger>
      <SelectContent>
        {people.map((p) => (
          <SelectItem key={p.userId} value={p.userId}>
            <span className="truncate">{personLabel(p)}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function defaultRole(grantable: string[]) {
  return grantable.includes("member") ? "member" : (grantable[0] ?? "");
}

/** Adds a workspace member to a group with a role. */
export function AddGroupMemberDialog({
  open,
  onOpenChange,
  workspaceId,
  group,
  people,
  roles,
  grantable,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workspaceId: string;
  group: GroupRow;
  people: Person[];
  roles: RoleInfo[];
  grantable: string[];
}) {
  const candidates = people.filter((p) => !group.members.some((m) => m.userId === p.userId));
  const [userId, setUserId] = useState("");
  const [roleKey, setRoleKey] = useState(defaultRole(grantable));
  const [pending, start] = useTransition();

  function submit() {
    if (!userId || !roleKey) return void toast.error("Choose a member and a role.");
    start(async () => {
      const res = await setGroupMemberAction({ workspaceId, groupId: group.id, userId, roleKey });
      if (!res.ok) return void toast.error(res.error);
      toast.success(`Added to ${group.name}`);
      setUserId("");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add member to {group.name}</DialogTitle>
          <DialogDescription>
            They get this role in every project of {group.name} and its sub-groups. A sub-group or project role overrides it.
          </DialogDescription>
        </DialogHeader>
        {candidates.length ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Member</Label>
              <PersonSelect people={candidates} value={userId} onChange={setUserId} />
            </div>
            <div className="space-y-1.5">
              <Label>Role in this group</Label>
              <RoleSelect roles={roles} grantable={grantable} value={roleKey} onChange={setRoleKey} />
              <p className="text-xs text-muted-foreground">Only project permissions of the role apply here (view, edit, export, share …).</p>
            </div>
          </div>
        ) : (
          <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">Every workspace member is already in this group.</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending || !userId || !roleKey}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Add member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Sets a member's role for a single project (overrides group and workspace roles). */
export function ProjectRoleDialog({
  open,
  onOpenChange,
  workspaceId,
  projects,
  people,
  roles,
  grantable,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workspaceId: string;
  projects: PickerProject[];
  people: Person[];
  roles: RoleInfo[];
  grantable: string[];
}) {
  const [projectId, setProjectId] = useState("");
  const [userId, setUserId] = useState("");
  const [roleKey, setRoleKey] = useState(defaultRole(grantable));
  const [pending, start] = useTransition();

  function submit() {
    if (!projectId || !userId || !roleKey) return void toast.error("Choose a project, a member and a role.");
    start(async () => {
      const res = await setProjectRoleAction({ workspaceId, projectId, userId, roleKey });
      if (!res.ok) return void toast.error(res.error);
      toast.success("Project role saved");
      setProjectId("");
      setUserId("");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Project role</DialogTitle>
          <DialogDescription>
            The most specific assignment wins: a project role overrides group and workspace roles for that project — it can
            grant more or less. It also gives access to the project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Choose a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="truncate">{p.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Member</Label>
            <PersonSelect people={people} value={userId} onChange={setUserId} />
          </div>
          <div className="space-y-1.5">
            <Label>Role in this project</Label>
            <RoleSelect roles={roles} grantable={grantable} value={roleKey} onChange={setRoleKey} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending || !projectId || !userId || !roleKey}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Save role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
