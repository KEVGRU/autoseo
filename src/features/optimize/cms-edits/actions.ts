"use server";

import { z } from "zod";
import { actionProject, runAction } from "@/server/auth/guards";
import {
  applyCmsChange,
  getCmsItem,
  listCmsItems,
  proposeCmsChanges,
  proposeInput,
  rejectCmsChanges,
  revertCmsChange,
  suggestCmsValue,
  updateProposedValue,
} from "@/server/optimize/cms-edits/service";

const pid = z.string().min(1).max(64);
const changeId = z.string().min(1).max(64);
const itemType = z.enum(["post", "page", "product", "collection_item", "page_seo"]);
const field = z.enum(["title", "meta_title", "meta_description", "excerpt", "image_alt", "json_ld", "slug"]);

const listInput = z.object({
  provider: z.string().min(1).max(40),
  type: itemType.optional(),
  search: z.string().max(200).optional(),
  cursor: z.string().max(500).nullish(),
});

function actor(ctx: { user: { id: string; email: string }; project: { workspaceId: string } }) {
  return { id: ctx.user.id, email: ctx.user.email, workspaceId: ctx.project.workspaceId };
}

export async function listCmsItemsAction(projectId: string, input: z.input<typeof listInput>) {
  return runAction(async () => {
    await actionProject(pid.parse(projectId), "prompts.manage");
    const q = listInput.parse(input);
    return listCmsItems(projectId, q.provider, { type: q.type, search: q.search, cursor: q.cursor ?? null });
  });
}

export async function getCmsItemAction(projectId: string, provider: string, type: z.input<typeof itemType>, externalId: string) {
  return runAction(async () => {
    await actionProject(pid.parse(projectId), "prompts.manage");
    return getCmsItem(projectId, z.string().min(1).max(40).parse(provider), itemType.parse(type), z.string().min(1).max(200).parse(externalId));
  });
}

export async function proposeCmsChangesAction(projectId: string, input: z.input<typeof proposeInput>) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    return proposeCmsChanges(ctx.project.id, proposeInput.parse(input), actor(ctx), "user");
  });
}

export async function applyCmsChangeAction(projectId: string, id: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    const r = await applyCmsChange(ctx.project.id, changeId.parse(id), actor(ctx));
    return { note: r.note };
  });
}

export async function revertCmsChangeAction(projectId: string, id: string, force = false) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    const r = await revertCmsChange(ctx.project.id, changeId.parse(id), actor(ctx), { force: z.boolean().parse(force) });
    return { note: r.note };
  });
}

export async function rejectCmsChangesAction(projectId: string, ids: string[]) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    return rejectCmsChanges(ctx.project.id, z.array(changeId).max(200).parse(ids), actor(ctx));
  });
}

export async function updateProposedValueAction(projectId: string, id: string, value: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    await updateProposedValue(ctx.project.id, changeId.parse(id), z.string().max(50_000).parse(value));
  });
}

const suggestInput = z.object({
  provider: z.string().min(1).max(40),
  itemType,
  externalId: z.string().min(1).max(200),
  field,
  fieldKey: z.string().max(200).nullish(),
});

export async function suggestCmsValueAction(projectId: string, input: z.input<typeof suggestInput>) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    return suggestCmsValue(ctx.project.id, suggestInput.parse(input), { workspaceId: ctx.project.workspaceId, userId: ctx.user.id });
  });
}
