/**
 * Pure field mapping for CMS site edits (unit-tested): which WordPress SEO-plugin meta keys are
 * exposed to the REST API, and which Webflow collection fields hold the SEO title, meta
 * description, summary and images.
 */

export type WpSeoPlugin = "yoast" | "rankmath" | "seopress";

export const WP_SEO_META_KEYS: Record<WpSeoPlugin, { title: string; description: string; label: string }> = {
  yoast: { title: "_yoast_wpseo_title", description: "_yoast_wpseo_metadesc", label: "Yoast SEO" },
  rankmath: { title: "rank_math_title", description: "rank_math_description", label: "Rank Math" },
  seopress: { title: "_seopress_titles_title", description: "_seopress_titles_desc", label: "SEOPress" },
};

/**
 * Picks the SEO plugin whose meta keys the REST API returns (`meta` object of a post in edit
 * context). Keys only appear when the plugin (or a snippet) registers them with `show_in_rest`.
 * `namespaces` (from the /wp-json index) breaks ties when several plugins' keys are exposed.
 */
export function detectWpSeoMeta(
  meta: Record<string, unknown> | null | undefined,
  namespaces: string[] = [],
): { plugin: WpSeoPlugin; titleKey: string; descriptionKey: string } | null {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const exposed = (Object.keys(WP_SEO_META_KEYS) as WpSeoPlugin[]).filter((p) => {
    const k = WP_SEO_META_KEYS[p];
    return k.title in meta && k.description in meta;
  });
  if (!exposed.length) return null;
  const ns = (p: WpSeoPlugin) => (p === "yoast" ? "yoast/v1" : p === "rankmath" ? "rankmath/v1" : "seopress/v1");
  const plugin = exposed.find((p) => namespaces.includes(ns(p))) ?? exposed[0]!;
  return { plugin, titleKey: WP_SEO_META_KEYS[plugin].title, descriptionKey: WP_SEO_META_KEYS[plugin].description };
}

/** String value of a meta entry (WordPress returns single meta as string, multi as array). */
export function wpMetaString(v: unknown): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return "";
}

/** Decodes the HTML entities WordPress puts into `rendered` strings. */
export function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp|hellip|ndash|mdash|lsquo|rsquo|ldquo|rdquo);/g, (_, n: string) =>
      ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”" })[n] ?? _,
    );
}

/** Strips tags from a rendered excerpt (WordPress wraps it in <p>). */
export function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

export type WebflowField = { id?: string; slug: string; displayName: string; type: string; isRequired?: boolean };

export type WebflowFieldMap = {
  metaTitle: WebflowField | null;
  metaDescription: WebflowField | null;
  excerpt: WebflowField | null;
  images: WebflowField[];
};

/** Finds the SEO-relevant fields of a Webflow collection by type + slug conventions. */
export function mapWebflowFields(fields: WebflowField[]): WebflowFieldMap {
  const plain = fields.filter((f) => f.type === "PlainText" && f.slug !== "name" && f.slug !== "slug");
  const metaTitle = plain.find((f) => /(seo|meta)[-_ ]?title/i.test(f.slug)) ?? null;
  const metaDescription =
    plain.find((f) => f !== metaTitle && /(seo|meta)[-_ ]?desc/i.test(f.slug)) ??
    plain.find((f) => f !== metaTitle && /^(description|desc)$/i.test(f.slug)) ??
    null;
  const excerpt =
    plain.find((f) => f !== metaTitle && f !== metaDescription && /summary|excerpt|intro|teaser|subtitle/i.test(f.slug)) ?? null;
  const images = fields.filter((f) => f.type === "Image");
  return { metaTitle, metaDescription, excerpt, images };
}

/** Webflow image field value (`{ fileId, url, alt }`). */
export function webflowImage(v: unknown): { fileId: string | null; url: string | null; alt: string | null; hasAlt: boolean } | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  const url = typeof o.url === "string" ? o.url : null;
  if (!url && typeof o.fileId !== "string") return null;
  return {
    fileId: typeof o.fileId === "string" ? o.fileId : null,
    url,
    alt: typeof o.alt === "string" ? o.alt : null,
    hasAlt: "alt" in o,
  };
}
