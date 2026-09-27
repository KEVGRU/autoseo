import "server-only";
import { z } from "zod";
import { listKnowledgeSources, searchKnowledge } from "@/server/ai/knowledge/sources/service";
import { generateSchemaMarkup } from "@/server/optimize/content/schema-generator";
import { SCHEMA_TYPES } from "@/server/optimize/content/schema-ld";
import type { ApiProject } from "./auth";

/** REST v1 + MCP services for connected knowledge (search) and the JSON-LD schema generator. */

export const knowledgeSearchQuery = z.object({
  q: z.string().trim().min(2).max(500).describe("Question or keywords to search the project's connected knowledge for."),
  limit: z.coerce.number().int().min(1).max(50).optional().describe("Max passages (default 8)."),
  sourceIds: z.array(z.string().max(64)).max(50).optional().describe("Only search these knowledge sources (ids from GET /knowledge/sources)."),
});

export async function searchKnowledgeForApi(project: ApiProject, raw: z.input<typeof knowledgeSearchQuery>) {
  const q = knowledgeSearchQuery.parse(raw);
  const hits = await searchKnowledge(project.id, q.q, q.limit ?? 8, q.sourceIds?.length ? { sourceIds: q.sourceIds } : {});
  return hits.map((h) => ({
    chunkId: h.chunkId,
    sourceId: h.sourceId,
    sourceName: h.sourceName,
    sourceKind: h.sourceKind,
    docId: h.docId,
    title: h.title,
    url: h.url,
    excerpt: h.excerpt,
    text: h.text,
    score: h.score,
    matchedTerms: h.matched,
  }));
}

export async function listKnowledgeSourcesForApi(project: ApiProject) {
  const rows = await listKnowledgeSources(project.id);
  return rows.map((s) => ({
    id: s.id,
    kind: s.kind,
    name: s.name,
    status: s.status,
    error: s.error,
    documents: s.docCount,
    passages: s.chunkCount,
    autoSync: s.autoSync,
    lastSyncAt: s.lastSyncAt,
    createdAt: s.createdAt,
  }));
}

export const schemaMarkupInput = z.object({
  url: z.string().trim().max(2000).optional().describe("Page to generate JSON-LD for (default: the project homepage)."),
  types: z.array(z.enum(SCHEMA_TYPES)).max(8).optional().describe("Node types to include (default: detected from the page)."),
  productId: z.string().max(64).optional().describe("Catalog product id for Product markup (default: the product whose URL is the page)."),
  sameAs: z.array(z.string().url().max(500)).max(20).optional().describe("Official profile URLs for the Organization node."),
  telephone: z.string().max(40).optional(),
  email: z.string().email().max(200).optional(),
});

export async function generateSchemaForApi(project: ApiProject, raw: z.input<typeof schemaMarkupInput>) {
  const input = schemaMarkupInput.parse(raw);
  // Invalid / private URLs raise UnsafeUrlError → 400 validation_error (see error-map).
  const r = await generateSchemaMarkup(project.id, {
    url: input.url || null,
    types: input.types,
    productId: input.productId || null,
    overrides: input.sameAs || input.telephone || input.email ? { sameAs: input.sameAs, telephone: input.telephone ?? null, email: input.email ?? null } : undefined,
  });
  return { url: r.url, types: r.types, suggestedTypes: r.suggested, jsonLd: r.jsonLd, script: r.script, hints: r.hints, notes: r.notes, facts: r.facts };
}
