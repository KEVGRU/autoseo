"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ChevronRight,
  FolderInput,
  FolderPlus,
  FolderTree,
  Loader2,
  MoreHorizontal,
  Network,
  Pencil,
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Panel } from "@/components/app/page";
import { EmptyState } from "@/components/app/empty-state";
import { Favicon } from "@/components/app/favicon";
import { ConfirmButton } from "@/components/app/misc";
import { initials } from "@/components/app/user-menu";
import { cn } from "@/lib/utils";
import { deleteGroupAction, removeGroupMemberAction, setGroupMemberAction, setProjectGroupAction, setProjectRoleAction } from "./group-actions";
import {
  AddGroupMemberDialog,
  AddProjectsDialog,
  GroupFormDialog,
  ProjectRoleDialog,
  personLabel,
  type GroupRow,
  type Person,
} from "./group-dialogs";
import { AccessPreview } from "./access-preview";
import { GROUP_KIND_META, MAX_GROUP_DEPTH, depthOf, groupPath } from "./groups-shared";
import type { PickerProject } from "./project-picker";
import type { RoleInfo } from "./queries";

export type GroupsPanelData = {
  workspaceId: string;
  groups: GroupRow[];
  overrides: { projectId: string; userId: string; roleKey: string | null }[];
  people: Person[];
  /** Projects the viewer can see (all projects for editors). */
  projects: PickerProject[];
  roles: RoleInfo[];
  /** Role keys the viewer may grant at group / project level. */
  grantable: string[];
  canEdit: boolean;
};

type DialogState =
  | { kind: "create"; parentId: string | null }
  | { kind: "edit"; group: GroupRow }
  | { kind: "projects"; group: GroupRow }
  | { kind: "member"; group: GroupRow }
  | { kind: "projectRole" }
  | null;

export function GroupsPanel({ data }: { data: GroupsPanelData }) {
  const { workspaceId, groups, people, projects, roles, grantable, canEdit } = data;
  const [dialog, setDialog] = useState<DialogState>(null);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(groups.filter((g) => !g.parentId).map((g) => g.id)));

  const byId = useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups]);
  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  const personById = useMemo(() => new Map(people.map((p) => [p.userId, p])), [people]);
  const projectGroupId = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of groups) for (const id of g.projectIds) m.set(id, g.id);
    return m;
  }, [groups]);
  const children = useMemo(() => {
    const m = new Map<string | null, GroupRow[]>();
    for (const g of groups) {
      // Orphans (parent missing) are shown at the top level.
      const parent = g.parentId && byId.has(g.parentId) ? g.parentId : null;
      m.set(parent, [...(m.get(parent) ?? []), g]);
    }
    return m;
  }, [groups, byId]);
  const ungrouped = projects.filter((p) => !projectGroupId.has(p.id));
  const groupName = (id: string) => byId.get(id)?.name ?? "Deleted group";
  const roleName = (key: string | null) => (key ? (roles.find((r) => r.key === key)?.name ?? key) : "Inherited");
  const overrides = data.overrides.filter((o) => o.roleKey && projectById.has(o.projectId) && personById.has(o.userId));

  const toggle = (id: string) =>
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const ctx: NodeCtx = {
    workspaceId,
    canEdit,
    roles,
    grantable,
    byId,
    children,
    projectById,
    personById,
    expanded,
    toggle,
    open: setDialog,
    roleName,
  };

  return (
    <div className="space-y-4">
      <Panel
        title="Project groups"
        icon={<FolderTree className="size-4 text-muted-foreground" />}
        description={`Organise projects by brand, subsidiary, region, team or client and give people a role per group. Up to ${MAX_GROUP_DEPTH} levels.`}
        actions={
          canEdit &&
          groups.length > 0 && (
            <Button size="sm" className="gap-1.5" onClick={() => setDialog({ kind: "create", parentId: null })}>
              <FolderPlus className="size-3.5" /> New group
            </Button>
          )
        }
      >
        {groups.length === 0 ? (
          <EmptyState
            icon={Network}
            title="No groups yet"
            description="Groups mirror your organisation — subsidiaries, regions, teams or clients. Members of a group get a role in every project inside it (and its sub-groups), e.g. a regional admin or a team lead."
            action={canEdit ? { label: "Create first group", onClick: () => setDialog({ kind: "create", parentId: null }) } : undefined}
          />
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Members get the group role in all projects of the group and its sub-groups; a sub-group or project role
              overrides it. Workspace settings, API keys and billing always follow the workspace role.
            </p>
            <ul className="space-y-2">
              {(children.get(null) ?? []).map((g) => (
                <GroupNode key={g.id} group={g} depth={1} ctx={ctx} />
              ))}
            </ul>
            <UngroupedBucket projects={ungrouped} />
          </div>
        )}
      </Panel>

      <Panel
        title="Project roles"
        icon={<FolderInput className="size-4 text-muted-foreground" />}
        description="Per-project role for one member — overrides group and workspace roles for that project."
        actions={
          canEdit && (
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setDialog({ kind: "projectRole" })} disabled={!projects.length}>
              <Plus className="size-3.5" /> Add project role
            </Button>
          )
        }
      >
        {overrides.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No project-specific roles. Members use their group role, or their workspace role outside of groups.
          </p>
        ) : (
          <ul className="divide-y overflow-hidden rounded-xl border">
            {overrides.map((o) => (
              <OverrideRow key={`${o.projectId}:${o.userId}`} o={o} ctx={ctx} />
            ))}
          </ul>
        )}
      </Panel>

      {canEdit && <AccessPreview workspaceId={workspaceId} people={people} roles={roles} groupName={groupName} />}

      {dialog?.kind === "create" && (
        <GroupFormDialog
          key={`create:${dialog.parentId ?? ""}`}
          open
          onOpenChange={(v) => !v && setDialog(null)}
          workspaceId={workspaceId}
          groups={groups}
          defaultParentId={dialog.parentId}
        />
      )}
      {dialog?.kind === "edit" && (
        <GroupFormDialog
          key={`edit:${dialog.group.id}`}
          open
          onOpenChange={(v) => !v && setDialog(null)}
          workspaceId={workspaceId}
          groups={groups}
          group={dialog.group}
        />
      )}
      {dialog?.kind === "projects" && (
        <AddProjectsDialog
          key={`projects:${dialog.group.id}`}
          open
          onOpenChange={(v) => !v && setDialog(null)}
          workspaceId={workspaceId}
          group={dialog.group}
          projects={projects}
          projectGroupId={projectGroupId}
          groupName={groupName}
        />
      )}
      {dialog?.kind === "member" && (
        <AddGroupMemberDialog
          key={`member:${dialog.group.id}`}
          open
          onOpenChange={(v) => !v && setDialog(null)}
          workspaceId={workspaceId}
          group={dialog.group}
          people={people}
          roles={roles}
          grantable={grantable}
        />
      )}
      {dialog?.kind === "projectRole" && (
        <ProjectRoleDialog
          open
          onOpenChange={(v) => !v && setDialog(null)}
          workspaceId={workspaceId}
          projects={projects}
          people={people}
          roles={roles}
          grantable={grantable}
        />
      )}
    </div>
  );
}

type NodeCtx = {
  workspaceId: string;
  canEdit: boolean;
  roles: RoleInfo[];
  grantable: string[];
  byId: Map<string, GroupRow>;
  children: Map<string | null, GroupRow[]>;
  projectById: Map<string, PickerProject>;
  personById: Map<string, Person>;
  expanded: Set<string>;
  toggle: (id: string) => void;
  open: (d: DialogState) => void;
  roleName: (key: string | null) => string;
};

function KindBadge({ kind }: { kind: GroupRow["kind"] }) {
  const meta = GROUP_KIND_META[kind];
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex h-5 shrink-0 items-center gap-1 rounded-full px-1.5 text-[11px] font-medium", meta.className)}>
      <Icon className="size-3" />
      <span className="hidden sm:inline">{meta.label}</span>
    </span>
  );
}

function GroupNode({ group, depth, ctx }: { group: GroupRow; depth: number; ctx: NodeCtx }) {
  const kids = ctx.children.get(group.id) ?? [];
  const isOpen = ctx.expanded.has(group.id);
  const projects = group.projectIds.map((id) => ctx.projectById.get(id)).filter((p): p is PickerProject => Boolean(p));
  const hidden = group.projectIds.length - projects.length;
  const members = group.members.filter((m) => ctx.personById.has(m.userId));
  const canAddSub = depthOf(ctx.byId, group.id) < MAX_GROUP_DEPTH;
  const [pending, start] = useTransition();

  function remove() {
    return new Promise<void>((resolve) =>
      start(async () => {
        const res = await deleteGroupAction({ workspaceId: ctx.workspaceId, groupId: group.id });
        if (!res.ok) toast.error(res.error);
        else toast.success(`Group “${group.name}” deleted`);
        resolve();
      }),
    );
  }

  const parentName = group.parentId ? ctx.byId.get(group.parentId)?.name : null;

  return (
    <li className={cn("rounded-xl border bg-background/60", depth > 1 && "bg-card")}>
      <div className="flex items-center gap-1.5 px-2 py-2 sm:gap-2 sm:px-3">
        <button
          type="button"
          onClick={() => ctx.toggle(group.id)}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left sm:gap-2"
          aria-expanded={isOpen}
        >
          <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
          <KindBadge kind={group.kind} />
          <span className="min-w-0 truncate text-sm font-medium">{group.name}</span>
        </button>
        <span className="hidden shrink-0 text-xs text-muted-foreground tabular-nums sm:inline">
          {group.projectIds.length} {group.projectIds.length === 1 ? "project" : "projects"} · {members.length}{" "}
          {members.length === 1 ? "member" : "members"}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums sm:hidden">
          {group.projectIds.length}/{members.length}
        </span>
        {pending && <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />}
        {ctx.canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 shrink-0" aria-label={`Actions for ${group.name}`}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onSelect={() => ctx.open({ kind: "projects", group })}>
                <FolderInput /> Add projects
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => ctx.open({ kind: "member", group })}>
                <UserPlus /> Add member
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!canAddSub} onSelect={() => ctx.open({ kind: "create", parentId: group.id })}>
                <FolderPlus /> Add sub-group
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => ctx.open({ kind: "edit", group })}>
                <Pencil /> Rename, type or move
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {ctx.canEdit && (
          <ConfirmButton
            title={`Delete “${group.name}”?`}
            description={
              <>
                Its {kids.length ? "sub-groups and " : ""}projects move up to {parentName ? `“${parentName}”` : "the top level"}.
                Everyone&apos;s role in this group is removed — people who only had access through it lose access to its projects.
              </>
            }
            confirmLabel="Delete group"
            destructive
            onConfirm={remove}
          >
            <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground hover:text-destructive" aria-label={`Delete ${group.name}`}>
              <Trash2 className="size-4" />
            </Button>
          </ConfirmButton>
        )}
      </div>

      {isOpen && (
        <div className="space-y-3 border-t px-2 py-3 sm:px-3">
          <div className="grid gap-3 md:grid-cols-2">
            <section className="min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Projects</h4>
                {ctx.canEdit && (
                  <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => ctx.open({ kind: "projects", group })}>
                    <Plus className="size-3.5" /> Add
                  </Button>
                )}
              </div>
              {projects.length === 0 && hidden === 0 ? (
                <p className="text-xs text-muted-foreground">No projects in this group.</p>
              ) : (
                <ul className="flex flex-wrap gap-1.5">
                  {projects.map((p) => (
                    <ProjectChip key={p.id} project={p} group={group} ctx={ctx} />
                  ))}
                  {hidden > 0 && <li className="self-center text-xs text-muted-foreground">+{hidden} not visible to you</li>}
                </ul>
              )}
            </section>
            <section className="min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Members</h4>
                {ctx.canEdit && (
                  <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => ctx.open({ kind: "member", group })}>
                    <Plus className="size-3.5" /> Add
                  </Button>
                )}
              </div>
              {members.length === 0 ? (
                <p className="text-xs text-muted-foreground">No members — access follows the workspace or parent group roles.</p>
              ) : (
                <ul className="space-y-1">
                  {members.map((m) => (
                    <MemberRow key={m.userId} member={m} group={group} ctx={ctx} />
                  ))}
                </ul>
              )}
            </section>
          </div>
          {kids.length > 0 && (
            <ul className="space-y-2 border-l-2 border-dashed pl-2 sm:pl-3">
              {kids.map((k) => (
                <GroupNode key={k.id} group={k} depth={depth + 1} ctx={ctx} />
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

function ProjectChip({ project, group, ctx }: { project: PickerProject; group: GroupRow; ctx: NodeCtx }) {
  const [pending, start] = useTransition();
  return (
    <li className="flex max-w-full min-w-0 items-center gap-1.5 rounded-lg border bg-background py-1 pr-1 pl-2 text-xs">
      <Favicon domain={project.domain} src={project.logoUrl} fallback={project.name} className="size-3.5" />
      <span className="min-w-0 truncate">{project.name}</span>
      {ctx.canEdit && (
        <button
          type="button"
          disabled={pending}
          aria-label={`Remove ${project.name} from ${group.name}`}
          className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={() =>
            start(async () => {
              const res = await setProjectGroupAction({ workspaceId: ctx.workspaceId, projectId: project.id, groupId: null });
              if (!res.ok) toast.error(res.error);
              else toast.success(`${project.name} removed from ${group.name}`);
            })
          }
        >
          {pending ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />}
        </button>
      )}
    </li>
  );
}

function PersonAvatar({ person }: { person: Person }) {
  return (
    <Avatar className="size-6">
      {person.avatarUrl && <AvatarImage src={person.avatarUrl} alt="" className="object-cover" />}
      <AvatarFallback className="bg-brand-soft text-[10px] font-semibold text-brand">{initials(person.name, person.email)}</AvatarFallback>
    </Avatar>
  );
}

function MemberRow({ member, group, ctx }: { member: GroupRow["members"][number]; group: GroupRow; ctx: NodeCtx }) {
  const person = ctx.personById.get(member.userId)!;
  const [pending, start] = useTransition();
  return (
    <li className="flex min-w-0 items-center gap-2">
      <PersonAvatar person={person} />
      <span className="min-w-0 flex-1 truncate text-sm" title={person.email}>
        {person.name || person.email}
      </span>
      {ctx.canEdit ? (
        <>
          <Select
            value={member.roleKey}
            disabled={pending}
            onValueChange={(roleKey) =>
              start(async () => {
                const res = await setGroupMemberAction({ workspaceId: ctx.workspaceId, groupId: group.id, userId: member.userId, roleKey });
                if (!res.ok) toast.error(res.error);
                else toast.success(`${person.name || person.email} is now ${ctx.roleName(roleKey)} in ${group.name}`);
              })
            }
          >
            <SelectTrigger size="sm" className="h-7 w-28 shrink-0 text-xs sm:w-32">
              {pending ? <Loader2 className="size-3.5 animate-spin" /> : <SelectValue />}
            </SelectTrigger>
            <SelectContent>
              {ctx.roles.map((r) => (
                <SelectItem key={r.key} value={r.key} disabled={!ctx.grantable.includes(r.key)}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
            aria-label={`Remove ${person.email} from ${group.name}`}
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await removeGroupMemberAction({ workspaceId: ctx.workspaceId, groupId: group.id, userId: member.userId });
                if (!res.ok) toast.error(res.error);
                else toast.success(`${person.name || person.email} removed from ${group.name}`);
              })
            }
          >
            <UserMinus className="size-3.5" />
          </Button>
        </>
      ) : (
        <Badge variant="secondary" className="shrink-0">
          {ctx.roleName(member.roleKey)}
        </Badge>
      )}
    </li>
  );
}

function OverrideRow({ o, ctx }: { o: GroupsPanelData["overrides"][number]; ctx: NodeCtx }) {
  const project = ctx.projectById.get(o.projectId)!;
  const person = ctx.personById.get(o.userId)!;
  const [pending, start] = useTransition();
  const set = (roleKey: string | null) =>
    start(async () => {
      const res = await setProjectRoleAction({ workspaceId: ctx.workspaceId, projectId: o.projectId, userId: o.userId, roleKey });
      if (!res.ok) toast.error(res.error);
      else toast.success(roleKey ? "Project role updated" : "Project role removed — group / workspace role applies again");
    });
  return (
    <li className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Favicon domain={project.domain} src={project.logoUrl} fallback={project.name} className="size-4" />
        <span className="min-w-0 truncate text-sm font-medium">{project.name}</span>
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <PersonAvatar person={person} />
        <span className="min-w-0 truncate text-sm" title={person.email}>
          {personLabel(person)}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {ctx.canEdit ? (
          <>
            <Select value={o.roleKey ?? ""} disabled={pending} onValueChange={(v) => set(v)}>
              <SelectTrigger size="sm" className="h-7 w-32 text-xs">
                {pending ? <Loader2 className="size-3.5 animate-spin" /> : <SelectValue />}
              </SelectTrigger>
              <SelectContent>
                {ctx.roles.map((r) => (
                  <SelectItem key={r.key} value={r.key} disabled={!ctx.grantable.includes(r.key)}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-destructive"
              aria-label="Remove project role"
              disabled={pending}
              onClick={() => set(null)}
            >
              <X className="size-3.5" />
            </Button>
          </>
        ) : (
          <Badge variant="secondary">{ctx.roleName(o.roleKey)}</Badge>
        )}
      </div>
    </li>
  );
}

function UngroupedBucket({ projects }: { projects: PickerProject[] }) {
  const [open, setOpen] = useState(false);
  if (!projects.length) return null;
  return (
    <div className="rounded-xl border border-dashed">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2 px-3 py-2 text-left" aria-expanded={open}>
        <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")} />
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">Ungrouped projects</span>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{projects.length}</span>
      </button>
      {open && (
        <ul className="flex flex-wrap gap-1.5 border-t px-3 py-3">
          {projects.map((p) => (
            <li key={p.id} className="flex max-w-full min-w-0 items-center gap-1.5 rounded-lg border bg-background px-2 py-1 text-xs">
              <Favicon domain={p.domain} src={p.logoUrl} fallback={p.name} className="size-3.5" />
              <span className="min-w-0 truncate">{p.name}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="px-3 pb-2 text-[11px] text-muted-foreground">
        Only people with all-project access, an explicit project assignment or a project role can open these.
      </p>
    </div>
  );
}

/** Breadcrumb path of a group ("EU › DACH › Berlin"). */
export function groupPathLabel(groups: { id: string; parentId: string | null; name: string }[], groupId: string | null) {
  const byId = new Map(groups.map((g) => [g.id, g]));
  return groupPath(byId, groupId)
    .map((g) => g.name)
    .join(" › ");
}
