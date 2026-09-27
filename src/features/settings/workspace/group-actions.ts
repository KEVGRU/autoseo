"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db/client";
import { roles, workspaceMembers } from "@/server/db/schema";
import { ActionError, runAction } from "@/server/auth/guards";
import { actionWorkspace, assertRoleWithinReach, hasAllProjects, type WorkspaceAccess } from "@/server/admin/access";
import { MemberError } from "@/server/admin/members";
import {
  GROUP_KINDS,
  createGroup,
  deleteGroup,
  previewUserAccess,
  removeGroupMember,
  setGroupMember,
  setProjectGroup,
  setProjectRole,
  updateGroup,
  type GroupEditor,
} from "@/server/access/groups";
import type { Permission } from "@/server/auth/permissions";

const id = z.string().min(1).max(64);
const kind = z.enum(GROUP_KINDS as [string, ...string[]]).transform((k) => k as (typeof GROUP_KINDS)[number]);

async function guarded<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof MemberError) throw new ActionError(err.message, "invalid");
    throw err;
  }
}

/**
 * Managing groups needs "members.manage" AND access to every project of the workspace (groups span projects,
 * a project-restricted manager could otherwise hand out access to projects they can't see).
 */
async function groupAccess(workspaceId: string): Promise<WorkspaceAccess> {
  const access = await actionWorkspace(workspaceId, "members.manage");
  if (!hasAllProjects(access)) {
    throw new ActionError("Managing project groups requires access to all projects of the workspace.", "forbidden");
  }
  return access;
}

function editor(access: WorkspaceAccess): GroupEditor {
  return { userId: access.ctx.user.id, isInstanceAdmin: access.ctx.isInstanceAdmin, permissions: access.membership?.permissions ?? new Set<Permission>() };
}

/** A manager may only change project-level roles of members whose workspace role they could manage. */
async function assertTargetWithinReach(access: WorkspaceAccess, userId: string) {
  const [m] = await db
    .select({ role: roles })
    .from(workspaceMembers)
    .leftJoin(roles, eq(roles.key, workspaceMembers.roleKey))
    .where(and(eq(workspaceMembers.workspaceId, access.workspace.id), eq(workspaceMembers.userId, userId)))
    .limit(1);
  if (!m) throw new ActionError("Member not found.", "not_found");
  if (m.role) assertRoleWithinReach(access, m.role);
}

export async function createGroupAction(input: { workspaceId: string; name: string; kind: string; parentId: string | null }) {
  return runAction(async () => {
    const data = z.object({ workspaceId: id, name: z.string().trim().min(1).max(80), kind, parentId: id.nullable() }).parse(input);
    const access = await groupAccess(data.workspaceId);
    const row = await guarded(() => createGroup(data.workspaceId, { name: data.name, kind: data.kind, parentId: data.parentId }, access.ctx.user));
    refresh();
    return { id: row.id };
  });
}

export async function updateGroupAction(input: { workspaceId: string; groupId: string; name?: string; kind?: string; parentId?: string | null }) {
  return runAction(async () => {
    const data = z
      .object({
        workspaceId: id,
        groupId: id,
        name: z.string().trim().min(1).max(80).optional(),
        kind: kind.optional(),
        parentId: id.nullable().optional(),
      })
      .parse(input);
    const access = await groupAccess(data.workspaceId);
    await guarded(() => updateGroup(data.workspaceId, data.groupId, { name: data.name, kind: data.kind, parentId: data.parentId }, editor(access), access.ctx.user));
    refresh();
    return true;
  });
}

export async function deleteGroupAction(input: { workspaceId: string; groupId: string }) {
  return runAction(async () => {
    const data = z.object({ workspaceId: id, groupId: id }).parse(input);
    const access = await groupAccess(data.workspaceId);
    await guarded(() => deleteGroup(data.workspaceId, data.groupId, editor(access), access.ctx.user));
    refresh();
    return true;
  });
}

export async function setProjectGroupAction(input: { workspaceId: string; projectId: string; groupId: string | null }) {
  return runAction(async () => {
    const data = z.object({ workspaceId: id, projectId: id, groupId: id.nullable() }).parse(input);
    const access = await groupAccess(data.workspaceId);
    await guarded(() => setProjectGroup(data.workspaceId, data.projectId, data.groupId, editor(access), access.ctx.user));
    refresh();
    return true;
  });
}

export async function setGroupMemberAction(input: { workspaceId: string; groupId: string; userId: string; roleKey: string }) {
  return runAction(async () => {
    const data = z.object({ workspaceId: id, groupId: id, userId: id, roleKey: z.string().min(1).max(64) }).parse(input);
    const access = await groupAccess(data.workspaceId);
    await assertTargetWithinReach(access, data.userId);
    await guarded(() => setGroupMember(data.workspaceId, data.groupId, data.userId, data.roleKey, editor(access), access.ctx.user));
    refresh();
    return true;
  });
}

export async function removeGroupMemberAction(input: { workspaceId: string; groupId: string; userId: string }) {
  return runAction(async () => {
    const data = z.object({ workspaceId: id, groupId: id, userId: id }).parse(input);
    const access = await groupAccess(data.workspaceId);
    await assertTargetWithinReach(access, data.userId);
    await guarded(() => removeGroupMember(data.workspaceId, data.groupId, data.userId, editor(access), access.ctx.user));
    refresh();
    return true;
  });
}

export async function setProjectRoleAction(input: { workspaceId: string; projectId: string; userId: string; roleKey: string | null }) {
  return runAction(async () => {
    const data = z.object({ workspaceId: id, projectId: id, userId: id, roleKey: z.string().min(1).max(64).nullable() }).parse(input);
    const access = await groupAccess(data.workspaceId);
    await assertTargetWithinReach(access, data.userId);
    await guarded(() => setProjectRole(data.workspaceId, data.projectId, data.userId, data.roleKey, editor(access), access.ctx.user));
    refresh();
    return true;
  });
}

export async function previewAccessAction(input: { workspaceId: string; userId: string }) {
  return runAction(async () => {
    const data = z.object({ workspaceId: id, userId: id }).parse(input);
    await groupAccess(data.workspaceId);
    return guarded(() => previewUserAccess(data.workspaceId, data.userId));
  });
}
