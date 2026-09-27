import "server-only";
import { z } from "zod";
import { generateSchemaForApi, listKnowledgeSourcesForApi, searchKnowledgeForApi } from "@/server/api/knowledge";
import { SCHEMA_TYPES } from "@/server/optimize/content/schema-ld";
import { defineTool } from "../types";
import { mdTable, projectIdInput, toolProject } from "../helpers";

const RO = { readOnlyHint: true, openWorldHint: false } as const;

/** Connected knowledge (Notion, Google Drive, Slack, uploads, URLs) and the JSON-LD schema generator. */
export const knowledgeTools = [
  defineTool({
    name: "search_knowledge",
    title: "Search brand knowledge",
    description:
      "Searches the passages indexed from the project's connected knowledge sources (Notion, Google Drive, Slack, uploaded documents, web pages) — the brand's own expertise. Use it to ground answers or content in first-party facts. Returns the best passages with source, title, URL and excerpt.",
    input: z.object({
      projectId: projectIdInput,
      query: z.string().trim().min(2).max(500).describe("Question or keywords."),
      limit: z.number().int().min(1).max(20).optional().describe("Max passages (default 8)."),
      sourceIds: z.array(z.string().max(64)).max(50).optional().describe("Only these sources (ids from list_knowledge_sources)."),
    }),
    scope: "read",
    annotations: RO,
    async handler(args, ctx) {
      const p = await toolProject(ctx, args.projectId);
      const hits = await searchKnowledgeForApi(p, { q: args.query, limit: args.limit ?? 8, sourceIds: args.sourceIds });
      if (!hits.length)
        return {
          text: `No matching passages. ${(await listKnowledgeSourcesForApi(p)).length ? "Try other keywords." : `No knowledge sources are connected — add them in Brand Knowledge → Sources (${ctx.baseUrl}/p/${p.id}/knowledge?tab=sources).`}`,
          data: { projectId: p.id, query: args.query, results: [] },
        };
      return {
        text: hits.map((h, i) => `### ${i + 1}. ${h.title || "Untitled"} (${h.sourceKind}: ${h.sourceName}, score ${h.score})${h.url ? `\n${h.url}` : ""}\n${h.text.slice(0, 1500)}`).join("\n\n"),
        data: { projectId: p.id, query: args.query, results: hits },
      };
    },
  }),

  defineTool({
    name: "list_knowledge_sources",
    title: "List knowledge sources",
    description: "Connected knowledge sources (Notion, Google Drive, Slack, uploads, web pages) with sync status and document counts.",
    input: z.object({ projectId: projectIdInput }),
    scope: "read",
    annotations: RO,
    async handler(args, ctx) {
      const p = await toolProject(ctx, args.projectId);
      const rows = await listKnowledgeSourcesForApi(p);
      return {
        text: rows.length
          ? mdTable(rows, [
              ["name", (r) => r.name],
              ["kind", (r) => r.kind],
              ["status", (r) => r.status],
              ["documents", (r) => r.documents],
              ["passages", (r) => r.passages],
              ["last sync", (r) => r.lastSyncAt?.slice(0, 16)],
            ])
          : `No knowledge sources yet — connect them in ${ctx.baseUrl}/p/${p.id}/knowledge?tab=sources.`,
        data: { projectId: p.id, sources: rows },
      };
    },
  }),

  defineTool({
    name: "generate_schema_markup",
    title: "Generate JSON-LD schema markup",
    description:
      "Builds ready-to-paste JSON-LD for a page of the project (Organization, WebSite, Product, LocalBusiness, FAQPage, BreadcrumbList, Article, HowTo — one cross-linked @graph) from the brand profile, product catalog and the live page, plus rich-result validation hints. Fetches the page.",
    input: z.object({
      projectId: projectIdInput,
      url: z.string().max(2000).optional().describe("Page URL (default: homepage)."),
      types: z.array(z.enum(SCHEMA_TYPES)).max(8).optional().describe("Node types (default: detected from the page)."),
      productId: z.string().max(64).optional().describe("Catalog product id for Product markup."),
      sameAs: z.array(z.string().url().max(500)).max(20).optional().describe("Official profile URLs for the Organization."),
    }),
    scope: "read",
    annotations: { readOnlyHint: true, openWorldHint: true },
    async handler(args, ctx) {
      const p = await toolProject(ctx, args.projectId);
      const r = await generateSchemaForApi(p, { url: args.url, types: args.types, productId: args.productId, sameAs: args.sameAs });
      const errors = r.hints.filter((h) => h.level === "error");
      const warnings = r.hints.filter((h) => h.level === "warning");
      return {
        text: `JSON-LD for ${r.url} (${r.types.join(", ")}):\n\n\`\`\`html\n${r.script}\n\`\`\`\n\n${errors.length ? `Errors:\n${errors.map((h) => `- ${h.type}: ${h.message}`).join("\n")}\n\n` : ""}${warnings.length ? `Warnings:\n${warnings.map((h) => `- ${h.type}: ${h.message}`).join("\n")}\n\n` : ""}${r.notes.length ? `Notes:\n${r.notes.map((n) => `- ${n}`).join("\n")}` : ""}`.trim(),
        data: { projectId: p.id, ...r },
      };
    },
  }),
];
