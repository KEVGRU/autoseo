import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { logAudit } from "@/server/audit";
import type { UserContext } from "@/server/auth/context";
import { listAccessibleProjects, loadAccessInputs } from "@/server/auth/project-access";
import { deleteUploadByUrl, saveImageUpload } from "./uploads";

type Actor = { id: string; email: string };

export async function updateProfile(userId: string, patch: { name?: string }, actor: Actor) {
  const set: Partial<typeof users.$inferInsert> = {};
  if (patch.name !== undefined) set.name = patch.name.trim() || null;
  if (!Object.keys(set).length) return;
  await db.update(users).set(set).where(eq(users.id, userId));
  void logAudit("account.profile_updated", { actor, targetType: "user", targetId: userId, meta: { fields: Object.keys(set) } });
}

export async function updateLocale(userId: string, locale: "en" | "de", actor: Actor) {
  await db.update(users).set({ locale }).where(eq(users.id, userId));
  void logAudit("account.locale_changed", { actor, targetType: "user", targetId: userId, meta: { locale } });
}

/** Stores a new avatar (validated image ≤ 5 MB) and deletes the previous upload. */
export async function replaceAvatar(userId: string, file: File, actor: Actor) {
  const [user] = await db.select({ avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, userId)).limit(1);
  const res = await saveImageUpload("avatars", file, { maxBytes: 5 * 1024 * 1024 });
  await db.update(users).set({ avatarUrl: res.url }).where(eq(users.id, userId));
  await deleteUploadByUrl(user?.avatarUrl, "avatars");
  void logAudit("account.avatar_updated", { actor, targetType: "user", targetId: userId, meta: { size: res.size, ext: res.ext } });
  return res.url;
}

export async function removeAvatar(userId: string, actor: Actor) {
  const [user] = await db.select({ avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, userId)).limit(1);
  await db.update(users).set({ avatarUrl: null }).where(eq(users.id, userId));
  await deleteUploadByUrl(user?.avatarUrl, "avatars");
  void logAudit("account.avatar_removed", { actor, targetType: "user", targetId: userId });
}

export type VisibleProject = {
  id: string;
  name: string;
  domain: string;
  logoUrl: string | null;
  country: string;
  archived: boolean;
  isPitch: boolean;
  pitchExpiresAt: Date | null;
  createdAt: Date;
  workspaceId: string;
  workspaceName: string;
  /** User may rename / archive / delete this project. */
  canManage: boolean;
};

/**
 * Every project the user can see (incl. archived ones) across their workspaces, with a flag
 * whether they may manage it (effective projects.manage for that project).
 */
export async function listVisibleProjects(ctx: UserContext): Promise<VisibleProject[]> {
  const inputs = await loadAccessInputs({
    userId: ctx.user.id,
    isInstanceAdmin: ctx.isInstanceAdmin,
    memberships: ctx.memberships.map((m) => ({ workspaceId: m.workspace.id, roleKey: m.roleKey, status: m.workspace.status })),
  });
  const rows = await listAccessibleProjects(inputs, { includeArchived: true });
  const names = new Map(ctx.memberships.map((m) => [m.workspace.id, m.workspace.name]));
  return rows
    .map(({ project: p, access }) => ({
      id: p.id,
      name: p.name,
      domain: p.domain,
      logoUrl: p.logoUrl,
      country: p.country,
      archived: p.archived,
      isPitch: p.isPitch,
      pitchExpiresAt: p.pitchExpiresAt,
      createdAt: p.createdAt,
      workspaceId: p.workspaceId,
      workspaceName: names.get(p.workspaceId) ?? "",
      canManage: ctx.isInstanceAdmin || access.permissions.has("projects.manage"),
    }))
    .sort((a, b) => Number(a.archived) - Number(b.archived) || a.name.localeCompare(b.name));
}
