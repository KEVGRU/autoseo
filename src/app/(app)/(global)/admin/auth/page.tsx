import { asc } from "drizzle-orm";
import { requireAdmin } from "@/server/auth/guards";
import { db } from "@/server/db/client";
import { roles, workspaces } from "@/server/db/schema";
import { listWorkspaceSsoOverview } from "@/server/auth/oidc/workspace-sso";
import { getAdminSettings } from "@/server/admin/settings";
import { emailDomain } from "@/server/auth/domains";
import { env } from "@/server/env";
import { AdminPage } from "@/features/admin/components/settings-kit";
import { AuthSettings } from "@/features/admin/components/auth-settings";
import { SsoSettings, WorkspaceSsoOverview } from "@/features/admin/components/sso-settings";

export const metadata = { title: "Authentication · Admin" };

export default async function AdminAuthPage() {
  const ctx = await requireAdmin();
  const [auth, security, sso, roleRows, workspaceRows, ssoOverview] = await Promise.all([
    getAdminSettings("auth"),
    getAdminSettings("security"),
    getAdminSettings("sso"),
    db
      .select({ key: roles.key, name: roles.name, permissions: roles.permissions })
      .from(roles)
      .orderBy(asc(roles.sortOrder), asc(roles.name)),
    db.select({ id: workspaces.id, name: workspaces.name }).from(workspaces).orderBy(asc(workspaces.createdAt)),
    listWorkspaceSsoOverview(),
  ]);
  const roleOptions = roleRows.map((r) => ({ key: r.key, name: r.name }));
  // SSO never assigns roles that grant instance administration (enforced server-side too).
  const ssoRoles = roleRows.filter((r) => !r.permissions.includes("admin.access")).map((r) => ({ key: r.key, name: r.name }));
  return (
    <AdminPage
      title="Authentication"
      description="Magic-link sign-in, single sign-on (OpenID Connect), invitation policy, domain allow-list and session lifetime."
    >
      <AuthSettings auth={auth} security={security} roles={roleOptions} ownDomain={emailDomain(ctx.user.email)} managed={env.managed} />
      <SsoSettings sso={sso} workspaces={workspaceRows} roles={ssoRoles} redirectUri={`${env.appUrl}/api/auth/oidc/callback`} />
      <WorkspaceSsoOverview
        rows={ssoOverview}
        memberWorkspaceIds={ctx.memberships.map((m) => m.workspace.id)}
        allowWorkspaceSso={auth.values.allowWorkspaceSso}
      />
    </AdminPage>
  );
}
