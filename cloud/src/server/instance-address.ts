import "server-only";
import type { InstanceBackend } from "@/server/db/schema";
import { env } from "@/server/env";
import { checkSlugAvailability } from "@/server/instances";
import { instanceHost } from "@/server/compose";
import { getSetting } from "@/server/settings";
import { hostOfUrl, internalSlug } from "@/server/tenant-rules";

export type AddressResult = { ok: true; slug: string; host: string } | { ok: false; error: string };

/**
 * Slug + host for a new instance. Dedicated: the customer's address (format, reserved names, availability incl.
 * pending reservations). Shared: an internal unique slug (customers never see it) on the shared app's host.
 */
export async function resolveInstanceAddress(opts: {
  backend: InstanceBackend;
  slug?: string;
  exceptInstanceId?: string;
}): Promise<AddressResult> {
  if (opts.backend === "shared") {
    for (let attempt = 0; attempt < 5; attempt++) {
      const slug = internalSlug();
      if ((await checkSlugAvailability(slug)).available) return { ok: true, slug, host: hostOfUrl(env.sharedApp.publicUrl) };
    }
    return { ok: false, error: "Please try again." };
  }
  if (!opts.slug) return { ok: false, error: "Choose an address." };
  const availability = await checkSlugAvailability(opts.slug, opts.exceptInstanceId);
  if (!availability.available) return { ok: false, error: availability.error };
  return { ok: true, slug: availability.slug, host: instanceHost(availability.slug, (await getSetting("coolify")).baseDomain) };
}
