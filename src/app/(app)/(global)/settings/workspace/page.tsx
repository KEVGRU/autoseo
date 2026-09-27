import { forbidden } from "next/navigation";
import { Building2 } from "lucide-react";
import { PageContainer, PageHeader, Panel, TabNav } from "@/components/app/page";
import { EmptyState } from "@/components/app/empty-state";
import { requireUser } from "@/server/auth/guards";
import { hasAllProjects, reachableProjectIds, workspaceAccess } from "@/server/admin/access";
import { isProjectScopedPermission, type Permission } from "@/server/auth/permissions";
import { listGroupTree, listProjectRoleOverrides, listWorkspacePeople } from "@/server/access/groups";
import { loadWorkspaceView } from "@/features/settings/workspace/queries";
import { MembersPanel } from "@/features/settings/workspace/members-panel";
import { InvitationsPanel } from "@/features/settings/workspace/invitations-panel";
import { SharingPanel } from "@/features/settings/workspace/sharing-panel";
import { RolesMatrix } from "@/features/settings/workspace/roles-matrix";
import { WorkspaceSwitcher } from "@/features/settings/workspace/workspace-switcher";
import { ProvidersPanel } from "@/features/settings/workspace/providers-panel";
import { GroupsPanel } from "@/features/settings/workspace/groups-panel";
import { SsoPanel } from "@/features/settings/workspace/sso-panel";
import { getWorkspaceSsoView } from "@/server/auth/oidc/workspace-sso";
import { getSetting } from "@/server/settings";
import { env } from "@/server/env";
import { getWorkspaceDfsView } from "@/server/dataforseo/credentials";
import { getEnrichmentStatus } from "@/server/enrichment";

export const metadata = { title: "Workspace" };

export default async function WorkspaceSettingsPage({ searchParams }: PageProps<"/settings/workspace">) {
  const ctx = await requireUser();
  const sp = await searchParams;
  const wsParam = typeof sp.ws === "string" ? sp.ws : null;

  if (ctx.memberships.length === 0) {
    return (
      <PageContainer className="max-w-5xl">
        <PageHeader title="Workspace" />
        <Panel>
          <EmptyState
            icon={Building2}
            title="You're not a member of any workspace"
            description={
              ctx.isInstanceAdmin
                ? "Create or join a workspace in Admin → Workspaces & Projects."
                : "Ask your administrator to invite you to a workspace."
            }
            action={ctx.isInstanceAdmin ? { label: "Open admin", href: "/admin/workspaces" } : undefined}
          />
        </Panel>
      </PageContainer>
    );
  }

  const membership = ctx.memberships.find((m) => m.workspace.id === wsParam) ?? ctx.memberships[0]!;
  const can = (p: Permission) => ctx.isInstanceAdmin || membership.permissions.has(p);
  if (!can("team.view")) forbidden();

  const access = (await workspaceAccess(ctx, membership.workspace.id))!;
  const canManage = can("members.manage");
  const allProjects = hasAllProjects(access);
  const view = await loadWorkspaceView(membership.workspace.id, { reach: await reachableProjectIds(access), canManage });
  const assignable = view.roles
    .filter(
      (r) =>
        ctx.isInstanceAdmin ||
        (r.permissions.every((p) => membership.permissions.has(p as Permission)) &&
          (allProjects || !(r.allProjects || r.permissions.includes("projects.all")))),
    )
    .map((r) => r.key);
  const pendingCount = view.invitations.filter((i) => i.status === "pending").length;

  // Single sign-on: visible to instance admins and the workspace owner; owners edit it only when the instance
  // allows workspace SSO (mirrors the guard in sso-actions.ts).
  const showSso = ctx.isInstanceAdmin || membership.permissions.has("workspace.manage");

  // Groups reveal the whole project tree and everyone's group roles — only for members who see all projects.
  const showGroups = ctx.isInstanceAdmin || allProjects;

  // Tabs (`?tab=`, keeps `?ws=`). Further tabs are appended here.
  const tabs: { key: string; label: string }[] = [
    { key: "members", label: "Members" },
    ...(showGroups ? [{ key: "groups", label: "Groups" }] : []),
    ...(showSso ? [{ key: "sso", label: "Single sign-on" }] : []),
  ];
  const tab = tabs.some((t) => t.key === sp.tab) ? (sp.tab as string) : "members";
  const tabHref = (key: string) => {
    const q = new URLSearchParams();
    if (wsParam) q.set("ws", wsParam);
    if (key !== "members") q.set("tab", key);
    const qs = q.toString();
    return `/settings/workspace${qs ? `?${qs}` : ""}`;
  };

  const canProviders = can("workspace.providers");
  const [providersView, enrichment] =
    tab === "members" && canProviders
      ? await Promise.all([getWorkspaceDfsView(membership.workspace.id), getEnrichmentStatus({ workspaceId: membership.workspace.id })])
      : [null, null];

  // Groups: editable with members.manage + all-project access (mirrors the guard in group-actions.ts).
  const canEditGroups = canManage && allProjects;
  const groupsData =
    tab === "groups"
      ? await (async () => {
          const [tree, overrides, people] = await Promise.all([
            listGroupTree(membership.workspace.id),
            listProjectRoleOverrides(membership.workspace.id),
            listWorkspacePeople(membership.workspace.id),
          ]);
          // Group / project roles only carry project permissions — grantable when the viewer holds all of them.
          const grantable = view.roles
            .filter(
              (r) =>
                ctx.isInstanceAdmin ||
                r.permissions.filter((p) => isProjectScopedPermission(p)).every((p) => membership.permissions.has(p as Permission)),
            )
            .map((r) => r.key);
          return {
            workspaceId: membership.workspace.id,
            groups: tree,
            overrides,
            people,
            projects: view.projects,
            roles: view.roles,
            grantable,
            canEdit: canEditGroups,
          };
        })()
      : null;

  const ssoData =
    tab === "sso"
      ? await (async () => {
          const [ssoView, auth] = await Promise.all([getWorkspaceSsoView(membership.workspace.id), getSetting("auth")]);
          const canEdit = ctx.isInstanceAdmin || (membership.permissions.has("workspace.manage") && auth.allowWorkspaceSso);
          // SSO never hands out instance administration; owners only roles within their own permissions.
          const ssoRoles = view.roles
            .filter(
              (r) =>
                !r.permissions.includes("admin.access") &&
                (ctx.isInstanceAdmin || r.permissions.every((p) => membership.permissions.has(p as Permission))),
            )
            .map((r) => ({ key: r.key, name: r.name }));
          return {
            view: ssoView,
            canEdit,
            roles: ssoRoles,
            readOnlyReason: canEdit
              ? null
              : env.managed
                ? "Your instance administrator hasn't enabled workspace single sign-on."
                : "Workspace single sign-on isn't enabled. An instance admin can turn it on in Admin → Authentication → “Let workspaces configure their own SSO”.",
          };
        })()
      : null;

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        title="Workspace"
        description={
          <>
            Manage who can access <span className="font-medium text-foreground">{membership.workspace.name}</span>, what they
            can do and which projects they see.
          </>
        }
        actions={
          <WorkspaceSwitcher
            current={membership.workspace.id}
            workspaces={ctx.memberships.map((m) => ({ id: m.workspace.id, name: m.workspace.name, roleName: m.roleName }))}
          />
        }
      />
      <TabNav active={tab} tabs={tabs.map((t) => ({ key: t.key, label: t.label, href: tabHref(t.key) }))} />
      {tab === "members" && (
        <>
          <MembersPanel
            view={view}
            workspace={{ id: membership.workspace.id, name: membership.workspace.name }}
            canManage={canManage}
            currentUserId={ctx.user.id}
            assignable={assignable}
            pendingCount={pendingCount}
          />
          {(canManage || view.invitations.length > 0) && (
            <InvitationsPanel view={view} workspaceId={membership.workspace.id} canManage={canManage} canCopyLinks={ctx.isInstanceAdmin} />
          )}
          <SharingPanel view={view} workspaceId={membership.workspace.id} canManage={canManage} />
          {providersView && enrichment && (
            <ProvidersPanel workspaceId={membership.workspace.id} view={providersView} status={enrichment} canManage={canProviders} />
          )}
          <RolesMatrix roles={view.roles} currentRoleKey={membership.roleKey} isAdmin={ctx.isInstanceAdmin} />
        </>
      )}
      {groupsData && <GroupsPanel data={groupsData} />}
      {ssoData && (
        <SsoPanel
          workspaceId={membership.workspace.id}
          view={ssoData.view}
          canEdit={ssoData.canEdit}
          isInstanceAdmin={ctx.isInstanceAdmin}
          readOnlyReason={ssoData.readOnlyReason}
          redirectUri={`${env.appUrl}/api/auth/oidc/callback`}
          roles={ssoData.roles}
        />
      )}
    </PageContainer>
  );
}
