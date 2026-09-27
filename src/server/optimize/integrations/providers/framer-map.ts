/**
 * Pure helpers for the Framer Server API publisher (field mapping, project URL, page URL) — no
 * framer-api import so they can be unit tested.
 */

/** Minimal shape of a Framer CMS field (framer-api `Field`). */
export type FramerFieldLike = { id: string; name: string; type: string; required?: boolean };

export type FramerFieldValue = { type: string; value: string | null; contentType?: "html" | "markdown" };

export type FramerDocInput = {
  title: string;
  html: string;
  excerpt: string;
  metaTitle: string | null;
  metaDescription: string | null;
};

/**
 * Normalises the project URL users copy from the Framer editor
 * (`https://framer.com/projects/Website--aabbccdd1122?node=…`) to `https://framer.com/projects/<id>`.
 * A bare project id (`Website--aabbccdd1122` or `aabbccdd1122`) is accepted too.
 */
export function normalizeFramerProjectUrl(raw: string): string {
  const v = raw.trim();
  const bare = /^[A-Za-z0-9_-]{6,200}$/.test(v) ? v : null;
  if (bare) return `https://framer.com/projects/${checkProjectSegment(bare)}`;
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
  } catch {
    throw new Error("Enter the Framer project URL from the editor's address bar (https://framer.com/projects/…).");
  }
  const host = u.hostname.toLowerCase();
  const m = /^\/projects\/([^/?#]+)/.exec(u.pathname);
  if ((host !== "framer.com" && host !== "www.framer.com") || !m?.[1]) {
    throw new Error("Enter the Framer project URL from the editor's address bar (https://framer.com/projects/…), not the published site URL.");
  }
  return `https://framer.com/projects/${checkProjectSegment(decodeURIComponent(m[1]))}`;
}

/** Project ids are 20 alphanumerics, optionally prefixed with the project name (`Website--<id>`). */
function checkProjectSegment(segment: string): string {
  const id = /^.+--([A-Za-z0-9]+)$/.exec(segment)?.[1] ?? segment;
  if (!/^[A-Za-z0-9]{20}$/.test(id)) throw new Error("That doesn't look like a Framer project URL — copy it from the editor's address bar (https://framer.com/projects/…).");
  return encodeURIComponent(segment);
}

const find = (fields: FramerFieldLike[], type: string, re: RegExp, exclude?: RegExp) =>
  fields.find((f) => f.type === type && re.test(f.name) && !(exclude && exclude.test(f.name)));

/**
 * Maps an AutoSEO document onto a Framer CMS collection's fields by field name/type. The slug is
 * set separately (item `slug`). Returns field data keyed by field id plus unfillable required fields.
 */
export function mapFramerFields(
  fields: FramerFieldLike[],
  doc: FramerDocInput,
  opts: { titleFieldId?: string | null; isNew: boolean; now?: Date },
): { fieldData: Record<string, FramerFieldValue>; missing: string[]; bodyFieldName: string | null } {
  const title =
    (opts.titleFieldId ? fields.find((f) => f.id === opts.titleFieldId && f.type === "string") : undefined) ??
    find(fields, "string", /^(title|name|titel|headline|heading)$/i) ??
    find(fields, "string", /title|titel|headline/i, /seo|meta|og/i);
  const body =
    find(fields, "formattedText", /content|body|post|article|text|inhalt|artikel/i, /faq|summary|excerpt/i) ??
    fields.find((f) => f.type === "formattedText" && !/faq|summary|excerpt/i.test(f.name));
  const metaTitle = find(fields, "string", /(seo|meta|og).?(title|titel)/i);
  const metaDescription = find(fields, "string", /(seo|meta|og).?(desc|beschreibung)/i);
  const summary = find(fields, "string", /summary|excerpt|teaser|intro|description|beschreibung|zusammenfassung/i, /seo|meta|og|title/i);
  const date = find(fields, "date", /date|published|datum|veröffentlicht/i);

  const fieldData: Record<string, FramerFieldValue> = {};
  if (title) fieldData[title.id] = { type: "string", value: doc.title };
  if (body) fieldData[body.id] = { type: "formattedText", value: doc.html, contentType: "html" };
  if (metaTitle) fieldData[metaTitle.id] = { type: "string", value: doc.metaTitle ?? doc.title };
  if (metaDescription) fieldData[metaDescription.id] = { type: "string", value: doc.metaDescription ?? doc.excerpt };
  if (summary && summary.id !== metaDescription?.id) fieldData[summary.id] = { type: "string", value: doc.excerpt };
  if (date && opts.isNew) fieldData[date.id] = { type: "date", value: (opts.now ?? new Date()).toISOString() };

  // Required fields we could not fill block creating a new item (updates keep existing values).
  const missing = opts.isNew ? fields.filter((f) => f.required && !(f.id in fieldData)).map((f) => f.name) : [];
  return { fieldData, missing, bodyFieldName: body?.name ?? null };
}

/** Public URL of a CMS item: detail page path (e.g. `/blog/:slug`) on the primary published hostname. */
export function framerItemUrl(hostname: string | null | undefined, detailPath: string | null | undefined, slug: string): string | null {
  if (!hostname) return null;
  const host = hostname.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  if (!detailPath) return null;
  const path = detailPath.includes(":") ? detailPath.replace(/:[A-Za-z0-9_]+/, encodeURIComponent(slug)) : `${detailPath.replace(/\/+$/, "")}/${encodeURIComponent(slug)}`;
  return `https://${host}${path.startsWith("/") ? path : `/${path}`}`;
}
