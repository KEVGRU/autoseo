import { requireAdmin } from "@/server/auth/guards";
import { getAdminSettings } from "@/server/admin/settings";
import { getFreeToolsUsageToday, type FreeToolsUsageToday } from "@/server/free-tools/budget";
import { env } from "@/server/env";
import { AdminPage } from "@/features/admin/components/settings-kit";
import { FreeToolsForm } from "@/features/admin/components/free-tools-form";
import { FreeToolsUsageCard } from "@/features/admin/components/free-tools-usage";
import { getVisibilityCheckStats, type VisibilityCheckStats } from "@/server/free-tools/visibility-check";
import { AiCheckUsageCard } from "@/features/visibility-check/components/admin-usage";

export const metadata = { title: "Free SEO Tools · Admin" };

export default async function AdminFreeToolsPage() {
  await requireAdmin();
  const settings = await getAdminSettings("freeTools");
  let usage: FreeToolsUsageToday | null = null;
  let usageError: string | null = null;
  try {
    usage = await getFreeToolsUsageToday();
  } catch (err) {
    console.error("[admin/free-tools] usage", err);
    usageError = "the usage counters are not available yet";
  }
  let aiCheck: VisibilityCheckStats | null = null;
  try {
    aiCheck = await getVisibilityCheckStats();
  } catch (err) {
    console.error("[admin/free-tools] ai check stats", err);
  }
  return (
    <AdminPage
      title="Free SEO Tools"
      description="Backlink checker, keyword generator, traffic checker and more — for your team, and optionally public as a lead magnet with strict budget and bot protection."
    >
      <FreeToolsUsageCard usage={usage} error={usageError} />
      <AiCheckUsageCard stats={aiCheck} error={aiCheck ? null : "the check history is not available yet"} />
      <FreeToolsForm initial={settings} appUrl={env.appUrl} aiCheckEstimateUsd={aiCheck?.estimatePerCheckUsd ?? 0} />
    </AdminPage>
  );
}
