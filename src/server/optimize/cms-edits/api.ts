import "server-only";
import { z } from "zod";
import type { ApiPrincipal, ApiProject } from "@/server/api/auth";
import { ApiError } from "@/server/api/errors";
import { getProviderMeta } from "../integrations/registry";
import {
  changeListQuery,
  getCmsItem,
  listCmsChanges,
  listCmsEditTargets,
  listCmsItems,
  proposeCmsChanges,
  proposeInput,
  type CmsChangeSource,
  type CmsEditActor,
} from "./service";

/** Shared REST + MCP layer for CMS site edits (list items, list changes, propose). */

const ITEM_TYPES = ["post", "page", "product", "collection_item", "page_seo"] as const;

export const cmsItemsQuery = z.object({
  provider: z
    .string()
    .max(40)
    .optional()
    .describe("CMS integration: wordpress, shopify_cms or webflow. Default: the first connected CMS with edit support."),
  type: z.enum(ITEM_TYPES).optional().describe("Item type: post/page (WordPress), product (Shopify), collection_item/page_seo (Webflow)."),
  search: z.string().max(200).optional().describe("Search in titles / slugs."),
  cursor: z.string().max(500).optional().describe("Pagination cursor from meta.nextCursor."),
});

export const cmsItemQuery = z.object({
  provider: z.string().max(40).describe("CMS integration key (wordpress, shopify_cms, webflow)."),
  type: z.enum(ITEM_TYPES),
  externalId: z.string().min(1).max(200).describe("Item id in the CMS (from the items list)."),
});

export { changeListQuery as cmsChangesQuery, proposeInput as cmsProposeBody };

export function principalActor(p: ApiPrincipal): CmsEditActor {
  return { id: p.user.id, email: p.user.email, workspaceId: p.workspace.id };
}

/** Proposals from the in-app agent chat run with a `chat:` credential. */
export function principalSource(p: ApiPrincipal, fallback: CmsChangeSource): CmsChangeSource {
  return p.credentialId.startsWith("chat:") ? "agent" : fallback;
}

const NOT_CONNECTED =
  "No CMS with edit support is connected to this project. Connect WordPress, Shopify or Webflow under Content → Connect CMS (Integrations).";

async function resolveProvider(projectId: string, provider: string | undefined) {
  const targets = await listCmsEditTargets(projectId);
  if (!targets.length) throw new ApiError("not_connected", NOT_CONNECTED);
  const key = provider ? (getProviderMeta(provider)?.key ?? provider) : targets[0]!.provider;
  if (!targets.some((t) => t.provider === key))
    throw new ApiError("not_connected", `${getProviderMeta(key)?.name ?? key} is not connected with edit support. Connected: ${targets.map((t) => t.provider).join(", ")}.`);
  return { key, targets };
}

export async function cmsItemsForApi(project: ApiProject, q: z.infer<typeof cmsItemsQuery>) {
  const { key, targets } = await resolveProvider(project.id, q.provider);
  const res = await listCmsItems(project.id, key, { type: q.type, search: q.search, cursor: q.cursor ?? null });
  return { ...res, targets };
}

export async function cmsItemForApi(project: ApiProject, q: z.infer<typeof cmsItemQuery>) {
  const { key } = await resolveProvider(project.id, q.provider);
  return getCmsItem(project.id, key, q.type, q.externalId);
}

export async function cmsChangesForApi(project: ApiProject, q: z.input<typeof changeListQuery>) {
  return listCmsChanges(project.id, q);
}

export async function proposeCmsChangesForApi(project: ApiProject, principal: ApiPrincipal, body: z.infer<typeof proposeInput>, source: CmsChangeSource) {
  const { key } = await resolveProvider(project.id, body.provider);
  return proposeCmsChanges(project.id, { ...body, provider: key }, principalActor(principal), principalSource(principal, source));
}
