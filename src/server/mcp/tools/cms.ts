import "server-only";
import { z } from "zod";
import {
  cmsChangesForApi,
  cmsItemForApi,
  cmsItemsForApi,
  cmsProposeBody,
  proposeCmsChangesForApi,
} from "@/server/optimize/cms-edits/api";
import { defineTool } from "../types";
import { mdTable, projectIdInput, toolProject } from "../helpers";

const RO_LIVE = { readOnlyHint: true, openWorldHint: true } as const;
const ITEM_TYPES = ["post", "page", "product", "collection_item", "page_seo"] as const;
const len = (v: string | null | undefined) => (v ? `${v.length} ch` : "—");

/** CMS site edits: browse existing CMS content and propose edits (humans approve & apply in the app). */
export const cmsTools = [
  defineTool({
    name: "list_cms_items",
    title: "List CMS items",
    description:
      "Lists existing content of the project's connected CMS (WordPress posts/pages, Shopify products, Webflow CMS items / static pages) with the current SEO title, meta description and editable fields. Use it to find pages to improve, then propose_cms_change.",
    input: z.object({
      projectId: projectIdInput,
      provider: z.string().max(40).optional().describe("wordpress, shopify_cms or webflow. Default: first connected CMS with edit support."),
      type: z.enum(ITEM_TYPES).optional().describe("post/page (WordPress), product (Shopify), collection_item/page_seo (Webflow)."),
      search: z.string().max(200).optional(),
      cursor: z.string().max(500).optional().describe("nextCursor from a previous call."),
    }),
    scope: "read",
    permission: "prompts.manage",
    annotations: RO_LIVE,
    async handler(args, ctx) {
      const p = await toolProject(ctx, args.projectId);
      const r = await cmsItemsForApi(p, { provider: args.provider, type: args.type, search: args.search, cursor: args.cursor });
      const other = r.targets.filter((t) => t.provider !== r.provider);
      return {
        text: `${r.providerName}: ${r.items.length} item(s)${r.nextCursor ? ` (more: cursor "${r.nextCursor}")` : ""}${
          other.length ? ` · also connected: ${other.map((t) => t.provider).join(", ")}` : ""
        }\n\n${mdTable(r.items, [
          ["externalId", (i) => i.externalId],
          ["type", (i) => i.type],
          ["title", (i) => i.title],
          ["status", (i) => i.status],
          ["meta title", (i) => i.fields.meta_title ?? "—"],
          ["meta desc", (i) => len(i.fields.meta_description)],
          ["images w/o alt", (i) => i.images.filter((img) => !img.alt).length],
          ["editable", (i) => i.editable.join(", ")],
        ])}`,
        data: { projectId: p.id, ...r, url: `${ctx.baseUrl}/p/${p.id}/content?tab=site-edits` },
      };
    },
  }),
  defineTool({
    name: "get_cms_item",
    title: "CMS item details",
    description:
      "One CMS item with all live SEO values (title, SEO title, meta description, excerpt, slug, JSON-LD where supported), its images with alt texts (image ids for image_alt edits), editable fields and notes on read-only fields.",
    input: z.object({
      projectId: projectIdInput,
      provider: z.string().max(40).describe("wordpress, shopify_cms or webflow"),
      type: z.enum(ITEM_TYPES),
      externalId: z.string().min(1).max(200),
    }),
    scope: "read",
    permission: "prompts.manage",
    annotations: RO_LIVE,
    async handler(args, ctx) {
      const p = await toolProject(ctx, args.projectId);
      const item = await cmsItemForApi(p, { provider: args.provider, type: args.type, externalId: args.externalId });
      const lines = Object.entries(item.fields).map(([k, v]) => `- **${k}**${item.editable.includes(k as never) ? "" : " (read-only)"}: ${v ? v.slice(0, 600) : "—"}`);
      const imgs = item.images.map((i) => `- image \`${i.id}\` ${i.label ?? ""}: alt ${i.alt ? `“${i.alt}”` : "missing"}`);
      return {
        text: `**${item.title}** (${item.type}, ${item.status ?? "—"})${item.url ? ` — ${item.url}` : ""}\n\n${[...lines, ...imgs].join("\n")}${
          item.notes?.length ? `\n\nNotes: ${item.notes.join(" ")}` : ""
        }`,
        data: { projectId: p.id, item },
      };
    },
  }),
  defineTool({
    name: "list_cms_changes",
    title: "List site edits",
    description: "Site edit proposals and their status (proposed, applied, reverted, rejected, failed). status=open returns proposals awaiting approval.",
    input: z.object({
      projectId: projectIdInput,
      status: z.enum(["proposed", "applied", "reverted", "rejected", "failed", "open", "all"]).optional().describe("Default all."),
      taskId: z.string().max(64).optional(),
      limit: z.number().int().min(1).max(200).optional(),
    }),
    scope: "read",
    annotations: { readOnlyHint: true, openWorldHint: false },
    async handler(args, ctx) {
      const p = await toolProject(ctx, args.projectId);
      const r = await cmsChangesForApi(p, { status: args.status, taskId: args.taskId, limit: args.limit ?? 50 });
      return {
        text: `${r.pagination.total} change(s) — proposed ${r.counts.proposed}, applied ${r.counts.applied}, reverted ${r.counts.reverted}, failed ${r.counts.failed}\n\n${mdTable(r.items, [
          ["id", (c) => c.id],
          ["item", (c) => c.itemTitle],
          ["field", (c) => c.fieldLabel],
          ["after", (c) => c.after],
          ["status", (c) => c.status],
          ["source", (c) => c.source],
        ])}`,
        data: { projectId: p.id, ...r, url: `${ctx.baseUrl}/p/${p.id}/content?tab=site-edits` },
      };
    },
  }),
  defineTool({
    name: "propose_cms_change",
    title: "Propose site edits",
    description:
      "Proposes edits to ONE existing CMS item (SEO title, meta description, title, excerpt, slug, image alt text, JSON-LD). Creates proposals only — nothing changes on the live site until a project member approves and applies them under Content → Site edits (with backup and one-click undo). Get field names, image ids and editable fields from get_cms_item first. Include a short reason per change.",
    input: z.object({
      projectId: projectIdInput,
      provider: cmsProposeBody.shape.provider.describe("wordpress, shopify_cms or webflow"),
      itemType: cmsProposeBody.shape.itemType,
      externalId: cmsProposeBody.shape.externalId,
      changes: cmsProposeBody.shape.changes,
      taskId: cmsProposeBody.shape.taskId.describe("Optimization task this edit belongs to (optional)."),
    }),
    scope: "write",
    permission: "prompts.manage",
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    async handler(args, ctx) {
      const p = await toolProject(ctx, args.projectId);
      const r = await proposeCmsChangesForApi(
        p,
        ctx.principal,
        { provider: args.provider, itemType: args.itemType, externalId: args.externalId, changes: args.changes, taskId: args.taskId },
        "mcp",
      );
      const review = `${ctx.baseUrl}/p/${p.id}/content?tab=site-edits`;
      const skipped = r.skipped.map((s) => `- ${s.field}${s.fieldKey ? ` (${s.fieldKey})` : ""}: ${s.reason}`).join("\n");
      return {
        text: `${r.changes.length ? `Proposed ${r.changes.length} change(s) — nothing is live yet. A project member must approve them under Content → Site edits: ${review}` : "No proposals were created."}${
          r.changes.length ? `\n\n${mdTable(r.changes, [["id", (c) => c.id], ["field", (c) => c.fieldLabel], ["before", (c) => c.before], ["after", (c) => c.after]])}` : ""
        }${skipped ? `\n\nSkipped:\n${skipped}` : ""}`,
        data: { projectId: p.id, changes: r.changes, skipped: r.skipped, reviewUrl: review },
        isError: !r.changes.length && r.skipped.length > 0,
      };
    },
  }),
];
