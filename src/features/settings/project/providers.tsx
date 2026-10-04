import { Panel } from "@/components/app/page";
import { PROVIDERS } from "@/lib/integrations-catalog";
import { getIntegration, toPublicIntegration } from "@/server/integrations/store";
import { getAdminSettings } from "@/server/admin/settings";
import { getSetting } from "@/server/settings";
import { magicLinkEmail } from "@/server/email/templates";
import { appUrl } from "@/server/email";
import { TokenIntegrationCard } from "@/features/integrations/components/token-connect";
import { EmailSettings } from "@/features/admin/components/email-settings";

export async function ProjectProviderSettings({ projectId, canManage, isAdmin, adminEmail }: {
  projectId: string; canManage: boolean; isAdmin: boolean; adminEmail: string;
}) {
  const posthog = await getIntegration(projectId, PROVIDERS.posthog);
  const email = isAdmin ? await getAdminSettings("smtp") : null;
  const auth = email ? await getSetting("auth") : null;
  const preview = auth ? await magicLinkEmail({
    url: appUrl("/auth/verify?token=preview"), code: "428913", minutes: auth.magicLinkMinutes,
    ip: "203.0.113.7", userAgent: "Chrome on macOS",
  }) : null;
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Website analytics</h2>
        <p className="text-sm text-muted-foreground">Connect PostHog for this project. Reports sync daily into your traffic dashboard.</p>
      </div>
      <TokenIntegrationCard projectId={projectId} provider={PROVIDERS.posthog} integration={posthog ? toPublicIntegration(posthog) : null} canManage={canManage} />
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Email provider</h2>
        <p className="text-sm text-muted-foreground">Configure Resend, Amazon SES or custom SMTP for sign-in links, invitations and notifications across this instance.</p>
      </div>
      {email && preview ? <EmailSettings smtp={email} adminEmail={adminEmail} previewHtml={preview.html} /> : (
        <Panel title="Email delivery">
          <p className="text-sm text-muted-foreground">An instance administrator can configure the email provider here or in Admin → Email.</p>
        </Panel>
      )}
    </div>
  );
}
