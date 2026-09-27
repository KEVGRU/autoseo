import "server-only";
import { S, type OpenApiOperation } from "../openapi-helpers";
import { knowledgeSearchQuery, schemaMarkupInput } from "../knowledge";

const { str, strN, num, int, arr, obj, bool } = S;

const kind = { type: "string", enum: ["notion", "gdrive", "slack", "upload", "url"] };

/** REST v1 operations: connected knowledge (Notion, Drive, Slack, uploads, URLs) and the JSON-LD generator. */
export const knowledgeOperations: OpenApiOperation[] = [
  {
    method: "get",
    path: "/projects/{projectId}/knowledge/search",
    operationId: "searchKnowledge",
    summary: "Search connected knowledge",
    description: "Full-text search (stemmed, prefix-aware) over the passages indexed from the project's knowledge sources — the same retrieval that grounds content generation. At most two passages per document.",
    tag: "Knowledge",
    scope: "read",
    query: knowledgeSearchQuery,
    data: arr(
      obj({
        chunkId: str,
        sourceId: str,
        sourceName: str,
        sourceKind: kind,
        docId: str,
        title: str,
        url: strN,
        excerpt: str,
        text: str,
        score: { ...num, description: "0–1: full-text rank + query term coverage" },
        matchedTerms: arr(str),
      }),
    ),
    meta: { count: int },
  },
  {
    method: "get",
    path: "/projects/{projectId}/knowledge/sources",
    operationId: "listKnowledgeSources",
    summary: "List knowledge sources",
    description: "Connected knowledge sources with sync status, document and passage counts. Tokens are never returned.",
    tag: "Knowledge",
    scope: "read",
    data: arr(
      obj({
        id: str,
        kind,
        name: str,
        status: { type: "string", enum: ["pending", "syncing", "ready", "error"] },
        error: strN,
        documents: int,
        passages: int,
        autoSync: bool,
        lastSyncAt: strN,
        createdAt: str,
      }),
    ),
  },
  {
    method: "post",
    path: "/projects/{projectId}/content/schema-markup",
    operationId: "generateSchemaMarkup",
    summary: "Generate JSON-LD",
    description:
      "Ready-to-paste JSON-LD (@graph of Organization, WebSite, Product, LocalBusiness, FAQPage, BreadcrumbList, Article, HowTo) for a page, built from the brand profile, product catalog and the live page, with rich-result validation hints.",
    tag: "Content",
    scope: "read",
    spend: true,
    body: schemaMarkupInput,
    data: obj({
      url: str,
      types: arr(str),
      suggestedTypes: arr(str),
      jsonLd: { type: "object" },
      script: str,
      hints: arr(obj({ level: { type: "string", enum: ["error", "warning", "info"] }, type: str, message: str })),
      notes: arr(str),
      facts: { type: "object" },
    }),
  },
];
