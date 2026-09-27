import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Home, LogOut, Mail, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBranding } from "@/server/branding";
import { getUserContext } from "@/server/auth/context";
import { env } from "@/server/env";
import { ADMIN_SUSPENSION_REASON, suspensionReasons } from "@/server/cloud/tenancy";
import { logoutAction } from "@/features/shell/actions";
import { StatusScreen } from "@/features/admin/components/system-status-screen";

export const metadata = { title: "Workspace paused" };

/** Shared AutoSEO Cloud: shown to members of suspended workspaces (subscription ended / unpaid, or paused by the team). */
export default async function PausedPage() {
  const ctx = await getUserContext();
  if (!ctx) redirect("/login");
  if (!ctx.pausedWorkspaces.length) redirect("/");
  const [brand, reasons] = await Promise.all([getBranding(), suspensionReasons(ctx.pausedWorkspaces.map((w) => w.id))]);
  const names = ctx.pausedWorkspaces.map((w) => w.name);
  const cloudUrl = env.bootstrap.cloudUrl;
  // Paused by the operator (not a billing problem): no subscription hint, point to support instead.
  const byTeam = reasons.length > 0 && reasons.every((r) => r === ADMIN_SUSPENSION_REASON);
  return (
    <StatusScreen
      tone="warning"
      icon={<PauseCircle className="size-5" />}
      brand={{ appName: brand.appName, logoUrl: brand.logoUrl }}
      title={names.length === 1 ? "This workspace is paused" : "Your workspaces are paused"}
      description={
        byTeam ? (
          <>
            <span className="font-medium text-foreground">{names.join(", ")}</span> {names.length === 1 ? "was" : "were"} paused
            by the {brand.appName} team. Your data is kept —{" "}
            {brand.supportEmail ? (
              <>
                contact <span className="font-medium text-foreground">{brand.supportEmail}</span>
              </>
            ) : (
              "contact support"
            )}{" "}
            to reactivate it.
          </>
        ) : (
          <>
            <span className="font-medium text-foreground">{names.join(", ")}</span>{" "}
            {names.length === 1 ? "is" : "are"} paused because the subscription is no longer active. Your data is kept —
            reactivate the subscription to continue where you left off.
          </>
        )
      }
      actions={
        <>
          {byTeam && brand.supportEmail && (
            <Button asChild size="lg" className="h-10 px-4">
              <a href={`mailto:${brand.supportEmail}?subject=${encodeURIComponent(`Paused workspace: ${names.join(", ")}`)}`}>
                <Mail className="size-4" /> Contact support
              </a>
            </Button>
          )}
          {!byTeam && cloudUrl && (
            <Button asChild size="lg" className="h-10 px-4">
              <a href={`${cloudUrl}/dashboard`}>
                Manage subscription <ArrowUpRight className="size-4" />
              </a>
            </Button>
          )}
          {ctx.memberships.length > 0 && (
            <Button asChild size="lg" variant="outline" className="h-10 px-4">
              <Link href="/">
                <Home className="size-4" /> Other workspaces
              </Link>
            </Button>
          )}
        </>
      }
      footer={
        <form action={logoutAction}>
          <button type="submit" className="inline-flex items-center gap-1.5 hover:text-foreground">
            <LogOut className="size-3.5" /> Sign out ({ctx.user.email})
          </button>
        </form>
      }
    />
  );
}
