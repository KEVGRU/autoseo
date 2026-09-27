/**
 * Pure helpers for CMS site edits (isomorphic, unit-tested): field labels and limits, value
 * normalization/validation and a word-level diff for the before/after view.
 */
import type { CmsEditField, CmsItem, CmsItemType } from "../integrations/types";

export const CMS_EDIT_FIELDS: CmsEditField[] = ["title", "meta_title", "meta_description", "excerpt", "slug", "image_alt", "json_ld"];

export const FIELD_META: Record<CmsEditField, { label: string; hint: string; recommendedMax?: number; max: number; multiline?: boolean }> = {
  title: { label: "Title", hint: "Visible H1 / product or item name.", max: 300 },
  meta_title: { label: "Meta title", hint: "SEO title shown in search results and AI citations (≈ 50–60 characters).", recommendedMax: 60, max: 300 },
  meta_description: {
    label: "Meta description",
    hint: "Summary shown in search results (≈ 120–160 characters).",
    recommendedMax: 160,
    max: 1000,
    multiline: true,
  },
  excerpt: { label: "Excerpt / summary", hint: "Short summary used by themes, feeds and AI engines.", max: 2000, multiline: true },
  slug: { label: "URL slug", hint: "Changing a slug changes the URL — add a redirect for the old one.", max: 200 },
  image_alt: { label: "Image alt text", hint: "Describes the image for screen readers and AI engines (≈ 125 characters).", recommendedMax: 125, max: 500 },
  json_ld: { label: "JSON-LD", hint: "Structured data (schema.org) embedded in the page.", max: 50_000, multiline: true },
};

export const ITEM_TYPE_LABEL: Record<CmsItemType, string> = {
  post: "Post",
  page: "Page",
  product: "Product",
  collection_item: "CMS item",
  page_seo: "Static page",
};

export function isCmsEditField(v: string): v is CmsEditField {
  return (CMS_EDIT_FIELDS as string[]).includes(v);
}

/** Canonical form stored and compared: trimmed; single-line fields collapse whitespace; JSON-LD pretty-printed. */
export function normalizeFieldValue(field: CmsEditField, value: string | null | undefined): string {
  const v = (value ?? "").replace(/\r\n?/g, "\n");
  if (field === "json_ld") {
    const t = v.trim();
    if (!t) return "";
    try {
      return JSON.stringify(JSON.parse(t), null, 2);
    } catch {
      return t;
    }
  }
  if (FIELD_META[field].multiline) return v.trim();
  return v.replace(/\s+/g, " ").trim();
}

/** Returns an error message when the value can't be written, else null. */
export function validateFieldValue(field: CmsEditField, value: string): string | null {
  const meta = FIELD_META[field];
  if (value.length > meta.max) return `${meta.label} is too long (max ${meta.max.toLocaleString("en-US")} characters).`;
  if (field === "title" && !value.trim()) return "The title can't be empty.";
  if (field === "slug") {
    if (!value) return "The slug can't be empty.";
    if (!/^[\p{Ll}\p{Lo}\p{N}]+(?:-[\p{Ll}\p{Lo}\p{N}]+)*$/u.test(value)) return "Use lowercase letters, numbers and single hyphens for the slug.";
  }
  if (field === "json_ld" && value) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (!parsed || typeof parsed !== "object") return "JSON-LD must be a JSON object or array.";
    } catch (err) {
      return `JSON-LD is not valid JSON (${err instanceof Error ? err.message : "parse error"}).`;
    }
  }
  return null;
}

/** Soft warnings (length recommendations) shown next to a proposal. */
export function fieldWarnings(field: CmsEditField, value: string): string[] {
  const meta = FIELD_META[field];
  const out: string[] = [];
  if (meta.recommendedMax && value.length > meta.recommendedMax)
    out.push(`${value.length} characters — longer than the recommended ${meta.recommendedMax}; engines may truncate it.`);
  if ((field === "meta_title" || field === "meta_description" || field === "image_alt") && !value) out.push("Empty — the CMS falls back to its default.");
  return out;
}

export function sameValue(field: CmsEditField, a: string | null | undefined, b: string | null | undefined): boolean {
  return normalizeFieldValue(field, a) === normalizeFieldValue(field, b);
}

/** Current live value of a field on an item (image alt texts are addressed by image id). */
export function itemFieldValue(item: Pick<CmsItem, "fields" | "images">, field: CmsEditField, fieldKey?: string | null): string | null {
  if (field === "image_alt") {
    const img = item.images.find((i) => i.id === fieldKey);
    return img ? (img.alt ?? "") : null;
  }
  const v = item.fields[field];
  return v === undefined ? null : (v ?? "");
}

/* ───────────────────────────── Word diff ───────────────────────────── */

export type DiffPart = { kind: "same" | "add" | "del"; text: string };

function tokenize(s: string): string[] {
  return s.match(/\s+|[\p{L}\p{N}_'’-]+|[^\s\p{L}\p{N}]/gu) ?? [];
}

/**
 * Word-level diff (LCS over tokens incl. whitespace) → merged same/add/del runs. Falls back to a
 * whole-value replacement for very long inputs to bound the O(n·m) table.
 */
export function wordDiff(before: string, after: string): DiffPart[] {
  if (before === after) return before ? [{ kind: "same", text: before }] : [];
  const a = tokenize(before);
  const b = tokenize(after);
  if (a.length * b.length > 4_000_000) {
    return [...(before ? [{ kind: "del" as const, text: before }] : []), ...(after ? [{ kind: "add" as const, text: after }] : [])];
  }
  const n = a.length;
  const m = b.length;
  const dp: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] = a[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }
  const parts: DiffPart[] = [];
  const push = (kind: DiffPart["kind"], text: string) => {
    const last = parts[parts.length - 1];
    if (last && last.kind === kind) last.text += text;
    else parts.push({ kind, text });
  };
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      push("same", a[i]!);
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      push("del", a[i]!);
      i++;
    } else {
      push("add", b[j]!);
      j++;
    }
  }
  while (i < n) push("del", a[i++]!);
  while (j < m) push("add", b[j++]!);
  return parts;
}

/** Share of changed characters (0–1) — used to label proposals as "minor" vs "rewrite". */
export function changeRatio(parts: DiffPart[]): number {
  let changed = 0;
  let total = 0;
  for (const p of parts) {
    total += p.text.length;
    if (p.kind !== "same") changed += p.text.length;
  }
  return total ? changed / total : 0;
}
