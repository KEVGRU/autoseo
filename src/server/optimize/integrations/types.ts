/**
 * Contracts for PM-tool and CMS integrations of the optimize module.
 * Credentials live in the core `integrations` table (`secret` = encryptJson(values of secret fields),
 * `config` = non-secret field values + selected target + account label).
 */

export type ProviderField = {
  key: string;
  label: string;
  type: "text" | "password" | "url" | "email" | "select";
  placeholder?: string;
  help?: string;
  required?: boolean;
  /** Stored encrypted in `integrations.secret` (never sent to the browser). */
  secret?: boolean;
  options?: { value: string; label: string }[];
};

export type ProviderMeta = {
  key: string;
  name: string;
  kind: "pm" | "cms";
  description: string;
  /** Where to create the token / how to set it up */
  setupSteps: string[];
  docsUrl?: string;
  fields: ProviderField[];
  /** Label for the target picker (team / project / list / board / collection / blog) */
  targetLabel?: string;
  supportsStatusSync?: boolean;
  /** CMS without write API (Framer) — export only */
  exportOnly?: boolean;
};

export type ConnectedIntegration = {
  id: string;
  provider: string;
  name: string;
  kind: "pm" | "cms";
  status: "connected" | "error" | "pending" | "disconnected";
  account: string | null;
  target: { id: string; name: string } | null;
  lastError: string | null;
  lastSyncAt: string | null;
};

/** Who should own the pushed task: routing rule's PM-tool assignee and/or the AutoSEO assignee. */
export type PmAssignee = {
  /** Assignee in the PM tool from the routing rule (email, username or user id). */
  external?: string | null;
  /** Email / name of the AutoSEO user the task is assigned to. */
  email?: string | null;
  name?: string | null;
};

/** What we send to a PM tool when pushing a task. */
export type PmTaskPayload = {
  taskId: string;
  title: string;
  /** Markdown body: summary, steps, acceptance criteria, evidence, link back */
  markdown: string;
  category: string;
  impact: number;
  effort: number;
  /** 0–100 priority score */
  priority: number;
  status: "open" | "in_progress" | "done" | "dismissed";
  dueDate: string | null;
  labels: string[];
  appUrl: string;
  /** Providers assign the task when they can resolve the person, otherwise the markdown names them. */
  assignee?: PmAssignee | null;
};

export type ExternalStatus = "open" | "in_progress" | "done";

export interface PmClient {
  test(): Promise<{ account: string }>;
  listTargets?(): Promise<{ id: string; name: string }[]>;
  createIssue(task: PmTaskPayload): Promise<{ externalId: string; url: string | null; status?: string | null }>;
  getStatus?(externalId: string): Promise<ExternalStatus | null>;
}

export type CmsDocument = {
  contentId: string;
  title: string;
  slug: string;
  markdown: string;
  /** Sanitized HTML rendered from markdown (incl. FAQ section) */
  html: string;
  metaTitle: string | null;
  metaDescription: string | null;
  excerpt: string;
  jsonLd: string | null;
  faqs: { question: string; answer: string }[];
};

/* ─────────────── Editing existing CMS content (site edits) ─────────────── */

/** Editable SEO fields of existing CMS items (mirrors `CMS_CHANGE_FIELDS` in the optimize schema). */
export type CmsEditField = "title" | "meta_title" | "meta_description" | "excerpt" | "image_alt" | "json_ld" | "slug";

/** post/page = WordPress, product = Shopify, collection_item / page_seo = Webflow. */
export type CmsItemType = "post" | "page" | "product" | "collection_item" | "page_seo";

export type CmsImage = { id: string; src: string | null; alt: string | null; label?: string | null };

export type CmsItem = {
  type: CmsItemType;
  externalId: string;
  title: string;
  url: string | null;
  status: string | null;
  updatedAt: string | null;
  /** Current live values of the text fields (image alt texts live in `images`). */
  fields: Partial<Record<Exclude<CmsEditField, "image_alt">, string | null>>;
  /** Fields this provider can write for this item. */
  editable: CmsEditField[];
  images: CmsImage[];
  /** Why some fields are read-only (e.g. SEO plugin meta not exposed to the REST API). */
  notes?: string[];
};

export type CmsListQuery = { type?: CmsItemType; search?: string; cursor?: string | null };
export type CmsListResult = { items: CmsItem[]; nextCursor: string | null };
export type CmsItemPatch = { field: CmsEditField; value: string; fieldKey?: string | null };

export interface CmsClient {
  test(): Promise<{ account: string }>;
  listTargets?(): Promise<{ id: string; name: string }[]>;
  publish(
    doc: CmsDocument,
    opts: { existingId?: string | null; draft: boolean },
  ): Promise<{ externalId: string; url: string | null }>;
  /** Item types that can be browsed and edited (site edits). Absent = no edit support. */
  editTypes?: CmsItemType[];
  listItems?(query: CmsListQuery): Promise<CmsListResult>;
  getItem?(type: CmsItemType, externalId: string): Promise<CmsItem>;
  /** Writes one field. Returns an optional note (e.g. "staged — publish the site to go live"). */
  updateItem?(type: CmsItemType, externalId: string, patch: CmsItemPatch): Promise<{ note?: string | null }>;
}
