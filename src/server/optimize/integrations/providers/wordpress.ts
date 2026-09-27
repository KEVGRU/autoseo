import "server-only";
import { HttpError, fetchJson } from "../../net";
import type { CmsClient, CmsDocument, CmsEditField, CmsItem, CmsItemType } from "../types";
import { extractJsonLd, replaceJsonLd } from "../../cms-edits/jsonld-block";
import { WP_SEO_META_KEYS, decodeEntities, detectWpSeoMeta, stripTags, wpMetaString } from "../../cms-edits/provider-maps";
import { normalizeSiteUrl, requireField, type Creds } from "./common";

type WpPost = {
  id: number;
  title?: { raw?: string; rendered?: string };
  link?: string;
  status?: string;
  modified_gmt?: string;
  slug?: string;
  excerpt?: { raw?: string; rendered?: string };
  meta?: Record<string, unknown> | unknown[];
  featured_media?: number;
  yoast_head_json?: { title?: string; description?: string } | null;
  content?: { raw?: string };
};
type WpMedia = { id: number; source_url?: string; alt_text?: string; title?: { raw?: string; rendered?: string } };

const WP_FIELDS = "id,title,link,status,modified_gmt,slug,excerpt,meta,featured_media,yoast_head_json";

const JSON_LD_CAP_NOTE =
  "JSON-LD is read-only: this WordPress user lacks the unfiltered_html capability, so WordPress would strip the <script> tag (connect with an Administrator, or an Editor on single sites).";
const SEO_META_NOTE = `SEO title and meta description are read-only: your SEO plugin's meta isn't exposed to the WordPress REST API. Register it with register_post_meta() and 'show_in_rest' => true — Yoast: ${WP_SEO_META_KEYS.yoast.title} / ${WP_SEO_META_KEYS.yoast.description}, Rank Math: ${WP_SEO_META_KEYS.rankmath.title} / ${WP_SEO_META_KEYS.rankmath.description}.`;

function wpCollection(type: CmsItemType): "posts" | "pages" {
  if (type === "post") return "posts";
  if (type === "page") return "pages";
  throw new Error(`WordPress has no "${type}" items.`);
}

function jsonLdScript(jsonLd: string | null): string {
  if (!jsonLd?.trim()) return "";
  // Prevent "</script>" inside JSON from closing the tag.
  return `\n<script type="application/ld+json">${jsonLd.replace(/<\//g, "<\\/")}</script>`;
}

export function createWordPressClient(creds: Creds): CmsClient {
  const site = normalizeSiteUrl(requireField(creds, "siteUrl", "Site URL"), true);
  const user = requireField(creds, "username", "Username");
  const password = requireField(creds, "appPassword", "Application password").replace(/\s+/g, " ");
  const auth = `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;
  let restBase: string | null = null;

  /** Pretty permalinks use /wp-json, plain permalinks need ?rest_route=. */
  const endpoint = async (route: string) => {
    if (!restBase) {
      try {
        await fetchJson(`${site}/wp-json/`, { headers: { authorization: auth }, maxBytes: 2 * 1024 * 1024 });
        restBase = `${site}/wp-json`;
      } catch (err) {
        if (err instanceof HttpError && err.status === 404) restBase = `${site}/?rest_route=`;
        else throw err;
      }
    }
    if (restBase.endsWith("rest_route=")) {
      const [path, qs] = route.split("?");
      return `${restBase}${path}${qs ? `&${qs}` : ""}`;
    }
    return `${restBase}${route}`;
  };
  const api = async <T>(route: string, init: { method?: string; json?: unknown } = {}) =>
    fetchJson<T>(await endpoint(route), { ...init, headers: { authorization: auth }, maxBytes: 4 * 1024 * 1024 });

  let namespaces: string[] | null = null;
  const loadNamespaces = async () => {
    if (!namespaces) namespaces = (await api<{ namespaces?: string[] }>("/").catch(() => null))?.namespaces ?? [];
    return namespaces;
  };

  /** false when the user lacks `unfiltered_html` — WordPress would strip the JSON-LD <script> tag and leave the JSON as visible text. */
  let canScript: boolean | null = null;
  const loadCanScript = async () => {
    if (canScript === null) {
      const me = await api<{ capabilities?: Record<string, boolean> }>("/wp/v2/users/me?context=edit&_fields=capabilities").catch(() => null);
      canScript = me?.capabilities ? me.capabilities.unfiltered_html === true : true;
    }
    return canScript;
  };

  const loadMedia = async (ids: number[]): Promise<Map<number, WpMedia>> => {
    const uniq = [...new Set(ids.filter((i) => i > 0))];
    if (!uniq.length) return new Map();
    const qs = new URLSearchParams({ include: uniq.join(","), per_page: "100", context: "edit", _fields: "id,source_url,alt_text,title" });
    const list = await api<WpMedia[]>(`/wp/v2/media?${qs}`).catch(() => [] as WpMedia[]);
    return new Map(list.map((m) => [m.id, m]));
  };

  const toItem = (type: CmsItemType, post: WpPost, media: Map<number, WpMedia>, ns: string[], scripts: boolean): CmsItem => {
    const meta = post.meta && !Array.isArray(post.meta) ? post.meta : null;
    const seo = detectWpSeoMeta(meta, ns);
    const title = post.title?.raw ?? decodeEntities(post.title?.rendered ?? "");
    const fields: CmsItem["fields"] = { title, slug: post.slug ?? "" };
    const editable: CmsEditField[] = ["title", "slug"];
    const notes: string[] = [];
    if (post.excerpt) {
      fields.excerpt = post.excerpt.raw ?? stripTags(post.excerpt.rendered ?? "");
      editable.push("excerpt");
    }
    if (seo && meta) {
      fields.meta_title = wpMetaString(meta[seo.titleKey]);
      fields.meta_description = wpMetaString(meta[seo.descriptionKey]);
      editable.push("meta_title", "meta_description");
    } else {
      if (post.yoast_head_json) {
        fields.meta_title = post.yoast_head_json.title ?? null;
        fields.meta_description = post.yoast_head_json.description ?? null;
      }
      notes.push(SEO_META_NOTE);
    }
    if (typeof post.content?.raw === "string") {
      fields.json_ld = extractJsonLd(post.content.raw);
      if (scripts) editable.push("json_ld");
      else notes.push(JSON_LD_CAP_NOTE);
    }
    const featured = post.featured_media ? media.get(post.featured_media) : undefined;
    const images = featured
      ? [{ id: String(featured.id), src: featured.source_url ?? null, alt: featured.alt_text ?? "", label: "Featured image" }]
      : [];
    if (images.length) editable.push("image_alt");
    return {
      type,
      externalId: String(post.id),
      title: title || `(no title) #${post.id}`,
      url: post.link ?? null,
      status: post.status ?? null,
      updatedAt: post.modified_gmt ? `${post.modified_gmt}Z` : null,
      fields,
      editable,
      images,
      notes,
    };
  };

  const loadPost = async (type: CmsItemType, id: string, fields = `${WP_FIELDS},content`) => {
    if (!/^\d+$/.test(id)) throw new Error("Invalid WordPress item id.");
    return api<WpPost>(`/wp/v2/${wpCollection(type)}/${id}?${new URLSearchParams({ context: "edit", _fields: fields })}`);
  };

  return {
    editTypes: ["post", "page"],
    async listItems(query) {
      const type = query.type ?? "post";
      const page = Math.max(1, Number.parseInt(query.cursor ?? "1", 10) || 1);
      const qs = new URLSearchParams({
        context: "edit",
        per_page: "20",
        page: String(page),
        status: "publish,future,draft,pending,private",
        orderby: "modified",
        order: "desc",
        _fields: WP_FIELDS,
      });
      if (query.search?.trim()) qs.set("search", query.search.trim());
      let posts: WpPost[];
      try {
        posts = await api<WpPost[]>(`/wp/v2/${wpCollection(type)}?${qs}`);
      } catch (err) {
        // Asking for the page after the last one is a 400 in WordPress — that's just "no more items".
        if (err instanceof HttpError && err.status === 400 && page > 1) return { items: [], nextCursor: null };
        throw err;
      }
      const [media, ns, scripts] = await Promise.all([loadMedia(posts.map((p) => p.featured_media ?? 0)), loadNamespaces(), loadCanScript()]);
      return { items: posts.map((p) => toItem(type, p, media, ns, scripts)), nextCursor: posts.length === 20 ? String(page + 1) : null };
    },
    async getItem(type, externalId) {
      const post = await loadPost(type, externalId);
      const [media, ns, scripts] = await Promise.all([loadMedia([post.featured_media ?? 0]), loadNamespaces(), loadCanScript()]);
      return toItem(type, post, media, ns, scripts);
    },
    async updateItem(type, externalId, patch) {
      const route = `/wp/v2/${wpCollection(type)}/${externalId}`;
      if (!/^\d+$/.test(externalId)) throw new Error("Invalid WordPress item id.");
      switch (patch.field) {
        case "title":
        case "excerpt":
        case "slug":
          await api(route, { method: "POST", json: { [patch.field]: patch.value } });
          return {};
        case "meta_title":
        case "meta_description": {
          const post = await loadPost(type, externalId, "id,meta");
          const seo = detectWpSeoMeta(post.meta && !Array.isArray(post.meta) ? post.meta : null, await loadNamespaces());
          if (!seo) throw new Error(SEO_META_NOTE);
          const key = patch.field === "meta_title" ? seo.titleKey : seo.descriptionKey;
          await api(route, { method: "POST", json: { meta: { [key]: patch.value } } });
          return {};
        }
        case "json_ld": {
          if (!(await loadCanScript())) throw new Error(JSON_LD_CAP_NOTE);
          const post = await loadPost(type, externalId, "id,content");
          if (typeof post.content?.raw !== "string") throw new Error("WordPress didn't return the raw post content (the user needs edit rights).");
          await api(route, { method: "POST", json: { content: replaceJsonLd(post.content.raw, patch.value) } });
          return {};
        }
        case "image_alt": {
          if (!patch.fieldKey || !/^\d+$/.test(patch.fieldKey)) throw new Error("Choose the image to update.");
          await api(`/wp/v2/media/${patch.fieldKey}`, { method: "POST", json: { alt_text: patch.value } });
          return {};
        }
      }
    },
    async test() {
      const me = await api<{ name: string; slug: string; capabilities?: Record<string, boolean> }>("/wp/v2/users/me?context=edit");
      if (me.capabilities && me.capabilities.publish_posts === false)
        throw new Error("This WordPress user cannot publish posts (needs the Author, Editor or Administrator role).");
      return { account: `${new URL(site).host} · ${me.name}` };
    },
    async publish(doc: CmsDocument, opts) {
      const body: Record<string, unknown> = {
        title: doc.title,
        content: doc.html + jsonLdScript(doc.jsonLd),
        excerpt: doc.excerpt,
        slug: doc.slug,
        status: opts.draft ? "draft" : "publish",
      };
      const meta = {
        // Yoast SEO / Rank Math fields — only applied when the plugin registers them for the REST API.
        _yoast_wpseo_title: doc.metaTitle ?? doc.title,
        _yoast_wpseo_metadesc: doc.metaDescription ?? doc.excerpt,
        rank_math_title: doc.metaTitle ?? doc.title,
        rank_math_description: doc.metaDescription ?? doc.excerpt,
      };
      const route = opts.existingId ? `/wp/v2/posts/${encodeURIComponent(opts.existingId)}` : "/wp/v2/posts";
      let post: { id: number; link: string; status: string };
      try {
        post = await api(route, { method: "POST", json: { ...body, meta } });
      } catch (err) {
        // Some installs reject unknown meta keys — retry without SEO meta.
        if (err instanceof HttpError && err.status === 400 && /meta/i.test(err.message)) post = await api(route, { method: "POST", json: body });
        else throw err;
      }
      return { externalId: String(post.id), url: post.status === "publish" ? post.link : null };
    },
  };
}
