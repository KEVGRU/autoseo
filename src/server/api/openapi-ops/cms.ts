import "server-only";
import { S, type OpenApiOperation } from "../openapi-helpers";
import { cmsChangesQuery, cmsItemQuery, cmsItemsQuery, cmsProposeBody } from "@/server/optimize/cms-edits/api";

const { str, strN, int, arr, obj } = S;

const fieldEnum = { type: "string", enum: ["title", "meta_title", "meta_description", "excerpt", "image_alt", "json_ld", "slug"] };
const itemTypeEnum = { type: "string", enum: ["post", "page", "product", "collection_item", "page_seo"] };

const cmsItem = obj({
  type: itemTypeEnum,
  externalId: str,
  title: str,
  url: strN,
  status: strN,
  updatedAt: strN,
  fields: obj(
    { title: strN, meta_title: strN, meta_description: strN, excerpt: strN, slug: strN, json_ld: strN },
    { description: "Current live values (json_ld only in item details)." },
  ),
  editable: arr(fieldEnum),
  images: arr(obj({ id: str, src: strN, alt: strN, label: strN })),
  notes: arr(str),
});

const cmsChange = obj({
  id: str,
  provider: str,
  providerName: str,
  externalId: str,
  itemType: str,
  itemTypeLabel: str,
  itemTitle: strN,
  itemUrl: strN,
  field: fieldEnum,
  fieldLabel: str,
  fieldKey: strN,
  before: { ...strN, description: "Live value when proposed; replaced by the backup read right before applying." },
  after: str,
  reason: strN,
  status: { type: "string", enum: ["proposed", "applied", "reverted", "rejected", "failed"] },
  error: strN,
  source: { type: "string", enum: ["user", "agent", "mcp", "api"] },
  taskId: strN,
  taskTitle: strN,
  proposedBy: strN,
  appliedBy: strN,
  appliedAt: strN,
  revertedBy: strN,
  revertedAt: strN,
  createdAt: str,
  updatedAt: str,
  warnings: arr(str),
});

const targets = arr(obj({ provider: str, name: str, account: strN, status: str, lastError: strN, itemTypes: arr(obj({ type: itemTypeEnum, label: str })) }));

/** REST v1 operations: CMS site edits (list items, proposals). Applying / reverting happens in the app after human approval. */
export const cmsOperations: OpenApiOperation[] = [
  {
    method: "get",
    path: "/projects/{projectId}/cms/items",
    operationId: "listCmsItems",
    summary: "List CMS items",
    description:
      "Existing content of a connected CMS (WordPress posts/pages, Shopify products, Webflow CMS items and static pages) with the current SEO title, meta description, excerpt, slug and image alt texts, plus which fields can be edited. Uses the project's stored CMS credentials (drafts and private items included), so it requires the prompts.manage permission. 409 not_connected when no CMS with edit support is connected.",
    tag: "CMS",
    scope: "read",
    permission: "prompts.manage",
    query: cmsItemsQuery,
    data: arr(cmsItem),
    meta: { provider: str, providerName: str, nextCursor: strN, targets },
  },
  {
    method: "get",
    path: "/projects/{projectId}/cms/items/detail",
    operationId: "getCmsItem",
    summary: "CMS item details",
    description: "One CMS item with its live field values (incl. JSON-LD for WordPress), images and editable fields.",
    tag: "CMS",
    scope: "read",
    permission: "prompts.manage",
    query: cmsItemQuery,
    data: cmsItem,
  },
  {
    method: "get",
    path: "/projects/{projectId}/cms/changes",
    operationId: "listCmsChanges",
    summary: "List site edits",
    description: "Proposed, applied, reverted, rejected and failed edits to existing CMS content (newest first). status=open = proposed + failed.",
    tag: "CMS",
    scope: "read",
    query: cmsChangesQuery,
    data: arr(cmsChange),
    meta: { pagination: obj({ page: int, limit: int, total: int, totalPages: int }), counts: obj({ proposed: int, applied: int, reverted: int, rejected: int, failed: int }) },
  },
  {
    method: "post",
    path: "/projects/{projectId}/cms/changes",
    operationId: "proposeCmsChanges",
    summary: "Propose site edits",
    description:
      "Creates proposals for one CMS item (up to 20 fields). The current live value is stored as `before`; an open proposal for the same field is updated. Proposals are NEVER applied automatically — a project member approves them under Content → Site edits (the live value is backed up again right before writing, and every applied edit can be reverted). Unchanged or non-editable fields are returned in meta.skipped. Requires the prompts.manage permission.",
    tag: "CMS",
    scope: "write",
    permission: "prompts.manage",
    body: cmsProposeBody,
    status: 201,
    data: arr(cmsChange),
    meta: { skipped: arr(obj({ field: fieldEnum, fieldKey: strN, reason: str })) },
  },
];
