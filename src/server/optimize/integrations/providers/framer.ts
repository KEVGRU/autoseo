import "server-only";
import type { CollectionItemInput, FieldDataInput, Framer } from "framer-api";
import type { CmsClient, CmsDocument } from "../types";
import { IntegrationConfigError, requireField, requireTarget, type Creds, type Target } from "./common";
import { framerItemUrl, mapFramerFields, normalizeFramerProjectUrl } from "./framer-map";

/*
 * Framer Server API (npm `framer-api`, WebSocket session to Framer's API with a per-project API
 * key from Site settings → API Keys). Items are written into a user-managed CMS collection; "publish
 * live" publishes a deployment of the whole site and promotes it to the production domains.
 * The Markdown / HTML / CSV export stays available for projects without an API key.
 */

const SESSION_TIMEOUT_MS = 90_000;

function withTimeout<T>(p: Promise<T>, what: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Framer did not respond in time (${what}).`)), SESSION_TIMEOUT_MS);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

function friendly(err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err);
  const code = (err as { code?: unknown } | null)?.code;
  if (code === "UNAUTHORIZED" || /unauthori[sz]ed|does not have access|invalid.*(key|token)|forbidden|401|403/i.test(msg)) {
    return new Error("Framer rejected the API key — create a key in the project's Site settings → API Keys and paste it again.");
  }
  if (/not found|404|no such project|invalid project url/i.test(msg)) return new Error("Framer project not found — check the project URL.");
  return err instanceof Error ? err : new Error(msg);
}

export function createFramerClient(creds: Creds, target: Target): CmsClient {
  const projectUrl = () => {
    if (!creds.projectUrl?.trim() || !creds.apiKey?.trim()) {
      // Connections made before Server API support only stored the site URL (export only).
      throw new IntegrationConfigError("Reconnect Framer with the project URL and an API key to publish (Publish → Framer → Manage).");
    }
    return normalizeFramerProjectUrl(creds.projectUrl);
  };
  const apiKey = () => requireField(creds, "apiKey", "Framer API key");

  async function session<T>(what: string, fn: (framer: Framer) => Promise<T>): Promise<T> {
    const { connect } = await import("framer-api");
    let framer: Framer | null = null;
    try {
      framer = await withTimeout(connect(projectUrl(), apiKey()), "connect");
      return await withTimeout(fn(framer), what);
    } catch (err) {
      throw friendly(err);
    } finally {
      if (framer) await framer.disconnect().catch(() => {});
    }
  }

  return {
    async test() {
      return session("project info", async (framer) => {
        const info = await framer.getProjectInfo();
        return { account: info.name || "Framer project" };
      });
    },
    async listTargets() {
      return session("collections", async (framer) => {
        const collections = await framer.getCollections();
        return collections.filter((c) => c.managedBy === "user").map((c) => ({ id: c.id, name: c.name }));
      });
    },
    async publish(doc: CmsDocument, opts) {
      const t = requireTarget(target, "Collection");
      return session("publish", async (framer) => {
        const collection = await framer.getCollection(t.id);
        if (!collection) throw new Error("The Framer CMS collection no longer exists — choose it again in the integration settings.");
        if (collection.managedBy !== "user") throw new Error(`"${collection.name}" is managed by a plugin and cannot be edited — pick one of your own CMS collections.`);
        const [fields, items] = await Promise.all([collection.getFields(), collection.getItems()]);
        const existing = (opts.existingId && items.find((i) => i.id === opts.existingId)) || items.find((i) => i.slug === doc.slug) || null;
        const mapped = mapFramerFields(
          fields.map((f) => ({ id: f.id, name: f.name, type: f.type, required: "required" in f ? Boolean(f.required) : false })),
          doc,
          { titleFieldId: collection.slugFieldBasedOn, isNew: !existing },
        );
        if (!mapped.bodyFieldName) throw new Error(`The collection "${collection.name}" has no Formatted Text field for the article body.`);
        if (mapped.missing.length) {
          throw new Error(`The Framer collection requires fields we can't fill automatically: ${mapped.missing.join(", ")}.`);
        }
        const fieldData = mapped.fieldData as FieldDataInput;
        const input: CollectionItemInput = existing
          ? { id: existing.id, slug: doc.slug, draft: opts.draft, fieldData }
          : { slug: doc.slug, draft: opts.draft, fieldData };
        await collection.addItems([input]);
        const saved = existing ?? (await collection.getItems()).find((i) => i.slug === doc.slug);
        if (!saved) throw new Error("Framer did not return the saved CMS item.");
        if (opts.draft) return { externalId: saved.id, url: null };

        const published = await framer.publish();
        const hostnames = await framer.deploy(published.deployment.id);
        const primary = hostnames.find((h) => h.isPrimary) ?? hostnames.find((h) => h.type === "custom") ?? hostnames[0] ?? null;
        const pages = await framer.getNodesWithType("WebPageNode");
        const detail = pages.find((p) => p.collectionId === collection.id && !p.draft);
        return { externalId: saved.id, url: framerItemUrl(primary?.hostname ?? creds.siteUrl ?? null, detail?.path ?? null, doc.slug) };
      });
    },
  };
}
