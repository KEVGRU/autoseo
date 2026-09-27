import { requireAdmin } from "@/server/auth/guards";
import { getAdminSettings } from "@/server/admin/settings";
import { env } from "@/server/env";
import { getEnrichmentStatus } from "@/server/enrichment";
import { AdminPage } from "@/features/admin/components/settings-kit";
import { DataSettings } from "@/features/admin/components/data-settings";

export const metadata = { title: "Data Providers · Admin" };

export default async function AdminDataPage() {
  await requireAdmin();
  const [dataforseo, google, integrations, enrichment] = await Promise.all([
    getAdminSettings("dataforseo"),
    getAdminSettings("google"),
    getAdminSettings("integrations"),
    getEnrichmentStatus(),
  ]);
  return (
    <AdminPage
      title="Data Providers"
      description="Data enrichment (your own DataForSEO account or AI estimates), Google (Search Console, Analytics, PageSpeed), Bing and Cloudflare credentials for the whole instance."
    >
      <DataSettings dataforseo={dataforseo} google={google} integrations={integrations} appUrl={env.appUrl} enrichment={enrichment} />
    </AdminPage>
  );
}
