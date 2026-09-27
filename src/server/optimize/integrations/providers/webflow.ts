import "server-only";
import { fetchJson } from "../../net";
import type { CmsClient, CmsDocument, CmsEditField, CmsItem, CmsItemType } from "../types";
import { mapWebflowFields, webflowImage } from "../../cms-edits/provider-maps";
import { requireField, requireTarget, truncate, type Creds, type Target } from "./common";

const BASE = "https://api.webflow.com/v2";

type WfField = { id: string; slug: string; displayName: string; type: string; isRequired?: boolean };
type WfCollection = { id: string; slug: string; displayName: string; fields: WfField[] };
type WfSite = { id: string; displayName: string; shortName: string; customDomains?: { url: string }[] };
type WfItem = {
  id: string;
  isDraft?: boolean;
  isArchived?: boolean;
  lastPublished?: string | null;
  lastUpdated?: string | null;
  fieldData: Record<string, unknown> & { name?: string; slug?: string };
};
type WfPage = {
  id: string;
  title?: string | null;
  slug?: string | null;
  collectionId?: string | null;
  archived?: boolean;
  draft?: boolean;
  lastUpdated?: string | null;
  publishedPath?: string | null;
  seo?: { title?: string | null; description?: string | null } | null;
  openGraph?: { title?: string | null; description?: string | null; titleCopied?: boolean; descriptionCopied?: boolean } | null;
};
type WfPagination = { limit: number; offset: number; total: number };

const PAGE_SIZE = 100;

function siteHost(site: WfSite): string {
  return (site.customDomains?.[0]?.url ?? `${site.shortName}.webflow.io`).replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function matches(search: string | undefined, ...values: (string | null | undefined)[]): boolean {
  const q = search?.trim().toLowerCase();
  return !q || values.some((v) => v?.toLowerCase().includes(q));
}

/** Target id format: `<siteId>:<collectionId>` */
export function createWebflowClient(creds: Creds, target: Target): CmsClient {
  const token = requireField(creds, "token", "API token");
  const api = <T>(path: string, init: { method?: string; json?: unknown } = {}) =>
    fetchJson<T>(`${BASE}${path}`, { ...init, headers: { authorization: `Bearer ${token}` } });

  const pickFields = (fields: WfField[]) => {
    const rich = fields.filter((f) => f.type === "RichText");
    const plain = fields.filter((f) => f.type === "PlainText" && f.slug !== "name" && f.slug !== "slug");
    return {
      body: rich.find((f) => /body|content|post|article/i.test(f.slug)) ?? rich[0],
      summary: plain.find((f) => /summary|excerpt|description|meta-desc|intro/i.test(f.slug) && !/title/i.test(f.slug)),
      seoTitle: plain.find((f) => /seo.?title|meta.?title/i.test(f.slug)),
    };
  };

  const [targetSiteId, targetCollectionId] = (target?.id ?? "").split(":");
  const siteId = async () => {
    if (targetSiteId) return targetSiteId;
    const { sites } = await api<{ sites: WfSite[] }>("/sites");
    if (!sites[0]) throw new Error("The token has no access to any Webflow site.");
    return sites[0].id;
  };
  const collectionId = () => {
    if (!targetCollectionId) throw new Error("Choose a CMS collection in the Webflow integration settings first.");
    return targetCollectionId;
  };

  const itemToCms = (item: WfItem, collection: WfCollection, site: WfSite): CmsItem => {
    const map = mapWebflowFields(collection.fields);
    const fd = item.fieldData;
    const str = (slug: string | undefined) => (slug && typeof fd[slug] === "string" ? (fd[slug] as string) : "");
    const fields: CmsItem["fields"] = { title: fd.name ?? "", slug: fd.slug ?? "" };
    const editable: CmsEditField[] = ["title", "slug"];
    if (map.metaTitle) {
      fields.meta_title = str(map.metaTitle.slug);
      editable.push("meta_title");
    }
    if (map.metaDescription) {
      fields.meta_description = str(map.metaDescription.slug);
      editable.push("meta_description");
    }
    if (map.excerpt) {
      fields.excerpt = str(map.excerpt.slug);
      editable.push("excerpt");
    }
    const images = map.images.flatMap((f) => {
      const img = webflowImage(fd[f.slug]);
      return img ? [{ id: f.slug, src: img.url, alt: img.alt ?? "", label: f.displayName }] : [];
    });
    if (images.length) editable.push("image_alt");
    const notes: string[] = [];
    if (!map.metaTitle || !map.metaDescription)
      notes.push(`Add Plain Text fields named “SEO title” / “Meta description” to the “${collection.displayName}” collection and bind them in the template's SEO settings to edit them here.`);
    const live = !item.isDraft && !!item.lastPublished;
    return {
      type: "collection_item",
      externalId: item.id,
      title: fd.name ?? item.id,
      url: live && fd.slug ? `https://${siteHost(site)}/${collection.slug}/${fd.slug}` : null,
      status: item.isArchived ? "archived" : item.isDraft ? "draft" : live ? "published" : "staged",
      updatedAt: item.lastUpdated ?? null,
      fields,
      editable,
      images,
      notes,
    };
  };

  const pageToCms = (page: WfPage, site: WfSite): CmsItem => ({
    type: "page_seo",
    externalId: page.id,
    title: page.title || page.slug || page.id,
    url: page.draft ? null : `https://${siteHost(site)}${page.publishedPath ?? (page.slug ? `/${page.slug}` : "/")}`,
    status: page.archived ? "archived" : page.draft ? "draft" : "published",
    updatedAt: page.lastUpdated ?? null,
    fields: { title: page.title ?? "", meta_title: page.seo?.title ?? "", meta_description: page.seo?.description ?? "" },
    editable: ["meta_title", "meta_description"],
    images: [],
    notes: ["Page SEO changes are staged in Webflow — publish the site to make them live."],
  });

  const loadCollection = () => api<WfCollection>(`/collections/${collectionId()}`);

  return {
    editTypes: (targetCollectionId ? ["collection_item", "page_seo"] : ["page_seo"]) as CmsItemType[],
    async listItems(query) {
      const type = query.type ?? (targetCollectionId ? "collection_item" : "page_seo");
      let offset = Math.max(0, Number.parseInt(query.cursor ?? "0", 10) || 0);
      const out: CmsItem[] = [];
      // Webflow has no text search — scan up to 5 pages when searching.
      for (let pageNo = 0; pageNo < (query.search?.trim() ? 5 : 1); pageNo++) {
        let pagination: WfPagination;
        if (type === "page_seo") {
          const sid = await siteId();
          const [res, site] = await Promise.all([
            api<{ pages: WfPage[]; pagination: WfPagination }>(`/sites/${sid}/pages?limit=${PAGE_SIZE}&offset=${offset}`),
            api<WfSite>(`/sites/${sid}`),
          ]);
          pagination = res.pagination ?? { limit: PAGE_SIZE, offset, total: offset + res.pages.length };
          for (const p of res.pages) {
            if (p.collectionId || p.archived) continue; // CMS template pages take their SEO from item fields
            if (matches(query.search, p.title, p.slug, p.seo?.title)) out.push(pageToCms(p, site));
          }
        } else if (type === "collection_item") {
          const [collection, res, site] = await Promise.all([
            loadCollection(),
            api<{ items: WfItem[]; pagination: WfPagination }>(`/collections/${collectionId()}/items?limit=${PAGE_SIZE}&offset=${offset}`),
            siteId().then((sid) => api<WfSite>(`/sites/${sid}`)),
          ]);
          pagination = res.pagination ?? { limit: PAGE_SIZE, offset, total: offset + res.items.length };
          for (const item of res.items) {
            if (matches(query.search, item.fieldData.name, item.fieldData.slug)) out.push(itemToCms(item, collection, site));
          }
        } else throw new Error(`Webflow has no "${type}" items.`);
        offset = pagination.offset + pagination.limit;
        if (offset >= pagination.total) return { items: out, nextCursor: null };
        if (out.length >= 50) break;
      }
      return { items: out, nextCursor: String(offset) };
    },
    async getItem(type, externalId) {
      if (!/^[a-f0-9]{24}$/i.test(externalId)) throw new Error("Invalid Webflow id.");
      const site = await api<WfSite>(`/sites/${await siteId()}`);
      if (type === "page_seo") return pageToCms(await api<WfPage>(`/pages/${externalId}`), site);
      if (type !== "collection_item") throw new Error(`Webflow has no "${type}" items.`);
      const [collection, item] = await Promise.all([loadCollection(), api<WfItem>(`/collections/${collectionId()}/items/${externalId}`)]);
      return itemToCms(item, collection, site);
    },
    async updateItem(type, externalId, patch) {
      if (!/^[a-f0-9]{24}$/i.test(externalId)) throw new Error("Invalid Webflow id.");
      if (type === "page_seo") {
        if (patch.field !== "meta_title" && patch.field !== "meta_description") throw new Error("Only the SEO title and description of static pages can be edited.");
        const page = await api<WfPage>(`/pages/${externalId}`);
        // Send both values so the untouched one keeps its current value.
        const seo = {
          title: patch.field === "meta_title" ? patch.value : (page.seo?.title ?? ""),
          description: patch.field === "meta_description" ? patch.value : (page.seo?.description ?? ""),
        };
        await api(`/pages/${externalId}`, { method: "PUT", json: { seo } });
        return { note: "Staged in Webflow — publish the site to make it live." };
      }
      if (type !== "collection_item") throw new Error(`Webflow has no "${type}" items.`);
      const cid = collectionId();
      const [collection, item] = await Promise.all([loadCollection(), api<WfItem>(`/collections/${cid}/items/${externalId}`)]);
      const map = mapWebflowFields(collection.fields);
      const slugFor: Partial<Record<CmsEditField, string | undefined>> = {
        title: "name",
        slug: "slug",
        meta_title: map.metaTitle?.slug,
        meta_description: map.metaDescription?.slug,
        excerpt: map.excerpt?.slug,
      };
      const fieldData: Record<string, unknown> = {};
      if (patch.field === "image_alt") {
        const f = map.images.find((x) => x.slug === patch.fieldKey);
        const img = f ? webflowImage(item.fieldData[f.slug]) : null;
        if (!f || !img) throw new Error("Choose the image field to update.");
        fieldData[f.slug] = { ...(item.fieldData[f.slug] as Record<string, unknown>), alt: patch.value };
      } else {
        const slug = slugFor[patch.field];
        if (!slug) throw new Error(`The collection “${collection.displayName}” has no field for ${patch.field.replace("_", " ")}.`);
        fieldData[slug] = patch.value;
      }
      await api(`/collections/${cid}/items/${externalId}`, { method: "PATCH", json: { fieldData } });
      if (item.isDraft || !item.lastPublished) return { note: "Saved to the staged item (not published yet)." };
      try {
        await api(`/collections/${cid}/items/publish`, { method: "POST", json: { itemIds: [externalId] } });
        return {};
      } catch (err) {
        return { note: `Saved in Webflow but publishing the item failed (${err instanceof Error ? err.message : String(err)}) — publish it in Webflow.` };
      }
    },
    async test() {
      const { sites } = await api<{ sites: WfSite[] }>("/sites");
      if (!sites.length) throw new Error("The token has no access to any Webflow site (needs sites:read + cms:write scopes).");
      return { account: sites.map((s) => s.displayName).slice(0, 3).join(", ") };
    },
    async listTargets() {
      const { sites } = await api<{ sites: WfSite[] }>("/sites");
      const out: { id: string; name: string }[] = [];
      for (const site of sites.slice(0, 20)) {
        const { collections } = await api<{ collections: { id: string; displayName: string }[] }>(`/sites/${site.id}/collections`);
        for (const c of collections) out.push({ id: `${site.id}:${c.id}`, name: `${site.displayName} / ${c.displayName}` });
      }
      return out;
    },
    async publish(doc: CmsDocument, opts) {
      const t = requireTarget(target, "Collection");
      const [siteId, collectionId] = t.id.split(":");
      if (!siteId || !collectionId) throw new Error("Invalid Webflow collection — choose it again in the integration settings.");
      const [collection, site] = await Promise.all([api<WfCollection>(`/collections/${collectionId}`), api<WfSite>(`/sites/${siteId}`)]);
      const map = pickFields(collection.fields);
      if (!map.body) throw new Error(`The collection "${collection.displayName}" has no Rich Text field for the article body.`);
      const fieldData: Record<string, unknown> = { name: truncate(doc.title, 256), slug: doc.slug, [map.body.slug]: doc.html };
      if (map.summary) fieldData[map.summary.slug] = truncate(doc.metaDescription ?? doc.excerpt, 256);
      if (map.seoTitle) fieldData[map.seoTitle.slug] = truncate(doc.metaTitle ?? doc.title, 256);
      const missing = collection.fields.filter((f) => f.isRequired && !(f.slug in fieldData));
      if (missing.length)
        throw new Error(`Webflow collection requires fields we can't fill automatically: ${missing.map((f) => f.displayName).join(", ")}.`);

      let item: { id: string; fieldData?: { slug?: string } };
      if (opts.existingId) {
        item = await api(`/collections/${collectionId}/items/${encodeURIComponent(opts.existingId)}`, {
          method: "PATCH",
          json: { isArchived: false, isDraft: opts.draft, fieldData },
        });
      } else {
        item = await api(`/collections/${collectionId}/items`, { method: "POST", json: { isArchived: false, isDraft: opts.draft, fieldData } });
      }
      if (!opts.draft) await api(`/collections/${collectionId}/items/publish`, { method: "POST", json: { itemIds: [item.id] } });
      const host = site.customDomains?.[0]?.url ?? `${site.shortName}.webflow.io`;
      const url = opts.draft ? null : `https://${host.replace(/^https?:\/\//, "")}/${collection.slug}/${item.fieldData?.slug ?? doc.slug}`;
      return { externalId: item.id, url };
    },
  };
}
