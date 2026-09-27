import "server-only";
import { fetchJson } from "../../net";
import type { CmsClient, CmsDocument, CmsItem } from "../types";
import { requireField, requireTarget, truncate, type Creds, type Target } from "./common";

const API_VERSION = "2026-07";

type GqlResponse<T> = { data?: T; errors?: { message: string }[] | string };
type UserError = { field?: string[] | null; message: string };

type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  status: string;
  onlineStoreUrl: string | null;
  updatedAt: string;
  seo: { title: string | null; description: string | null };
  media: { nodes: { id: string; alt: string | null; mediaContentType: string; preview: { image: { url: string } | null } | null }[] };
};

const PRODUCT_FIELDS = `id title handle status onlineStoreUrl updatedAt seo { title description }
  media(first: 20) { nodes { id alt mediaContentType preview { image { url } } } }`;

function productItem(p: ShopifyProduct, storeUrl: string): CmsItem {
  const images = p.media.nodes
    .filter((m) => m.mediaContentType === "IMAGE")
    .map((m, i) => ({ id: m.id, src: m.preview?.image?.url ?? null, alt: m.alt ?? "", label: i === 0 ? "Featured image" : `Image ${i + 1}` }));
  return {
    type: "product",
    externalId: p.id,
    title: p.title,
    url: p.onlineStoreUrl ?? (p.status === "ACTIVE" ? `${storeUrl}/products/${p.handle}` : null),
    status: p.status.toLowerCase(),
    updatedAt: p.updatedAt,
    fields: { title: p.title, slug: p.handle, meta_title: p.seo.title ?? "", meta_description: p.seo.description ?? "" },
    editable: ["title", "slug", "meta_title", "meta_description", ...(images.length ? (["image_alt"] as const) : [])],
    images,
    notes: ["Empty SEO title / description fall back to the product title / description in your theme."],
  };
}

export function normalizeShopDomain(raw: string): string {
  const v = raw.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const host = v.includes(".") ? v : `${v}.myshopify.com`;
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(host)) throw new Error("Enter your shop's *.myshopify.com domain.");
  return host;
}

export function createShopifyClient(creds: Creds, target: Target): CmsClient {
  const shop = normalizeShopDomain(requireField(creds, "shopDomain", "Shop domain"));
  const token = requireField(creds, "accessToken", "Admin API access token");
  const gql = async <T>(query: string, variables: Record<string, unknown> = {}): Promise<T> => {
    const res = await fetchJson<GqlResponse<T>>(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: { "X-Shopify-Access-Token": token },
      json: { query, variables },
    });
    if (res.errors) throw new Error(`Shopify: ${typeof res.errors === "string" ? res.errors : res.errors.map((e) => e.message).join("; ")}`);
    if (!res.data) throw new Error("Shopify returned no data.");
    return res.data;
  };
  const info = () =>
    gql<{ shop: { name: string; primaryDomain: { url: string } }; blogs: { nodes: { id: string; title: string; handle: string }[] } }>(
      `query ShopInfo { shop { name primaryDomain { url host } myshopifyDomain } blogs(first: 50) { nodes { id title handle } } }`,
    );
  const loadProduct = async (id: string) => {
    if (!/^gid:\/\/shopify\/Product\/\d+$/.test(id)) throw new Error("Invalid Shopify product id.");
    const d = await gql<{ product: ShopifyProduct | null; shop: { primaryDomain: { url: string } } }>(
      `query Product($id: ID!) { product(id: $id) { ${PRODUCT_FIELDS} } shop { primaryDomain { url } } }`,
      { id },
    );
    if (!d.product) throw new Error("Product not found in Shopify.");
    return productItem(d.product, d.shop.primaryDomain.url.replace(/\/+$/, ""));
  };
  const check = (errors: { message: string }[] | undefined) => {
    if (errors?.length) throw new Error(`Shopify: ${errors.map((e) => e.message).join("; ")}`);
  };

  return {
    editTypes: ["product"],
    async listItems(query) {
      const d = await gql<{
        products: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: ShopifyProduct[] };
        shop: { primaryDomain: { url: string } };
      }>(
        `query Products($after: String, $query: String) {
          products(first: 25, after: $after, query: $query, sortKey: UPDATED_AT, reverse: true) {
            pageInfo { hasNextPage endCursor }
            nodes { ${PRODUCT_FIELDS} }
          }
          shop { primaryDomain { url } }
        }`,
        { after: query.cursor || null, query: query.search?.trim() ? query.search.trim().slice(0, 200) : null },
      );
      const base = d.shop.primaryDomain.url.replace(/\/+$/, "");
      return {
        items: d.products.nodes.map((p) => productItem(p, base)),
        nextCursor: d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null,
      };
    },
    async getItem(_type, externalId) {
      return loadProduct(externalId);
    },
    async updateItem(_type, externalId, patch) {
      if (patch.field === "image_alt") {
        if (!patch.fieldKey || !/^gid:\/\/shopify\/MediaImage\/\d+$/.test(patch.fieldKey)) throw new Error("Choose the product image to update.");
        const d = await gql<{ fileUpdate: { userErrors: UserError[] } }>(
          `mutation FileUpdate($files: [FileUpdateInput!]!) { fileUpdate(files: $files) { files { id alt } userErrors { field message code } } }`,
          { files: [{ id: patch.fieldKey, alt: patch.value }] },
        );
        check(d.fileUpdate.userErrors);
        return {};
      }
      const current = await loadProduct(externalId);
      const product: Record<string, unknown> = { id: externalId };
      if (patch.field === "title") product.title = patch.value;
      else if (patch.field === "slug") product.handle = patch.value;
      else if (patch.field === "meta_title" || patch.field === "meta_description") {
        // Send both SEO values so the untouched one keeps its current value.
        product.seo = {
          title: patch.field === "meta_title" ? patch.value : (current.fields.meta_title ?? ""),
          description: patch.field === "meta_description" ? patch.value : (current.fields.meta_description ?? ""),
        };
      } else throw new Error(`Shopify products have no editable "${patch.field}" field.`);
      const d = await gql<{ productUpdate: { userErrors: UserError[] } }>(
        `mutation ProductUpdate($product: ProductUpdateInput!) { productUpdate(product: $product) { product { id } userErrors { field message } } }`,
        { product },
      );
      check(d.productUpdate.userErrors);
      return {};
    },
    async test() {
      const d = await info();
      return { account: `${d.shop.name} (${shop})` };
    },
    async listTargets() {
      const d = await info();
      return d.blogs.nodes.map((b) => ({ id: b.id, name: b.title }));
    },
    async publish(doc: CmsDocument, opts) {
      const blog = requireTarget(target, "Blog");
      const shopInfo = await info();
      const metafields = [
        { namespace: "global", key: "title_tag", type: "single_line_text_field", value: truncate(doc.metaTitle ?? doc.title, 255) },
        { namespace: "global", key: "description_tag", type: "multi_line_text_field", value: truncate(doc.metaDescription ?? doc.excerpt, 320) },
      ];
      const article = {
        title: doc.title,
        body: doc.html,
        handle: doc.slug,
        summary: doc.excerpt ? `<p>${doc.excerpt.replace(/</g, "&lt;")}</p>` : undefined,
        isPublished: !opts.draft,
        metafields,
      };
      const selection = `article { id handle isPublished blog { handle } } userErrors { field message code }`;
      let result: { article: { id: string; handle: string; blog: { handle: string } } | null; userErrors: UserError[] };
      if (opts.existingId) {
        const d = await gql<{ articleUpdate: typeof result }>(
          `mutation ArticleUpdate($id: ID!, $article: ArticleUpdateInput!) { articleUpdate(id: $id, article: $article) { ${selection} } }`,
          { id: opts.existingId, article },
        );
        result = d.articleUpdate;
      } else {
        const d = await gql<{ articleCreate: typeof result }>(
          `mutation ArticleCreate($article: ArticleCreateInput!) { articleCreate(article: $article) { ${selection} } }`,
          { article: { ...article, blogId: blog.id, author: { name: (creds.authorName ?? "").trim() || shopInfo.shop.name } } },
        );
        result = d.articleCreate;
      }
      if (result.userErrors?.length) throw new Error(`Shopify: ${result.userErrors.map((e) => e.message).join("; ")}`);
      if (!result.article) throw new Error("Shopify did not return the article.");
      const base = shopInfo.shop.primaryDomain.url.replace(/\/+$/, "");
      return {
        externalId: result.article.id,
        url: opts.draft ? null : `${base}/blogs/${result.article.blog.handle}/${result.article.handle}`,
      };
    },
  };
}
