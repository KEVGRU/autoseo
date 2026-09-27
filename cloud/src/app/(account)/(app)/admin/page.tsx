import { Activity, CircleAlert, CreditCard, Mail, Server, TrendingUp, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoolifyForm, SmtpForm, StripeForm } from "@/components/account/admin/settings-forms";
import { CustomersTable, type CustomerRow } from "@/components/account/admin/customers-table";
import { EventsList } from "@/components/account/admin/events-list";
import { GrantForm } from "@/components/account/admin/grant-form";
import { PlanForm, SharedAppCard } from "@/components/account/admin/hosting";
import { GrowthPanel } from "@/components/account/admin/growth";
import { GrowthLoader } from "@/components/account/admin/growth-loader";
import { env, isSharedBackendConfigured } from "@/server/env";
import { sharedAppHealth } from "@/server/shared-app";
import { requireAdmin } from "@/server/auth/guards";
import { getSetting, isCoolifyConfigured, isSmtpConfigured, isStripeConnected } from "@/server/settings";
import { listInstancesWithUsers, listUsersWithoutInstances } from "@/server/instances";
import { instanceCounts } from "@/server/provisioning";
import { latestEvents } from "@/server/events";
import { webhookUrl } from "@/server/stripe";
import { growthReport } from "@/server/analytics/report";
import { periodRange } from "@/server/analytics/periods";

export const metadata = { title: "Admin" };

const TABS = ["customers", "growth", "email", "stripe", "hosting", "events"] as const;
const GROWTH_PERIODS = [7, 30, 90] as const;

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const { user } = await requireAdmin();
  const sp = await searchParams;
  // "coolify" is the tab's old name (kept for bookmarks).
  const requested = sp.tab === "coolify" ? "hosting" : sp.tab;
  const tab = TABS.includes(requested as (typeof TABS)[number]) ? (requested as string) : "customers";
  const days = GROWTH_PERIODS.find((p) => String(p) === sp.days) ?? 30;

  const [smtp, instanceSmtp, stripe, coolify, plan, health, withInstances, withoutInstances, counts, events] = await Promise.all([
    getSetting("smtp"),
    getSetting("instanceSmtp"),
    getSetting("stripe"),
    getSetting("coolify"),
    getSetting("plan"),
    sharedAppHealth(),
    listInstancesWithUsers(),
    listUsersWithoutInstances(),
    instanceCounts(),
    latestEvents(200),
  ]);
  // Only queried while the Growth tab is open (GrowthLoader switches the URL when the tab is picked).
  const growth = tab === "growth" ? await growthReport(periodRange(days)) : null;
  const shared = isSharedBackendConfigured();

  // Only non-secret fields leave the server; secrets are reported as "saved" flags.
  const rows: CustomerRow[] = [
    ...withInstances.map(({ instance, user: owner }) => ({
      instanceId: instance.id,
      email: owner?.email ?? null,
      slug: instance.slug,
      host: instance.host,
      backend: instance.backend,
      workspaceName: instance.workspaceName,
      status: instance.status,
      subscriptionStatus: instance.subscriptionStatus,
      complimentary: instance.complimentary,
      grantedBy: instance.grantedBy,
      currentPeriodEnd: instance.currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: instance.cancelAtPeriodEnd,
      hasService: !!instance.coolifyServiceUuid,
      error: instance.error,
      createdAt: instance.createdAt.toISOString(),
    })),
    ...withoutInstances.map((u) => ({
      instanceId: null,
      email: u.email,
      slug: null,
      host: null,
      backend: null,
      workspaceName: null,
      status: null,
      subscriptionStatus: null,
      complimentary: false,
      grantedBy: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      hasService: false,
      error: null,
      createdAt: u.createdAt.toISOString(),
    })),
  ];

  const setup = [
    { ok: isSmtpConfigured(smtp), label: "Email (SMTP)", impact: "sign-in links are only written to the server log" },
    { ok: isStripeConnected(stripe), label: "Stripe", impact: "customers can't subscribe" },
    // With the shared app, Coolify is only needed for (optional) dedicated instances.
    shared
      ? { ok: health.ok, label: "Shared app", impact: `it isn't reachable, so workspaces can't be created or changed (${health.error ?? "unhealthy"})` }
      : { ok: isCoolifyConfigured(coolify), label: "Coolify", impact: "instances can't be created" },
  ];
  const workspaces = withInstances.filter(({ instance }) => instance.backend === "shared" && instance.status !== "deleted").length;
  const missing = setup.filter((s) => !s.ok);
  const stats = [
    { label: "Running", value: counts.running ?? 0 },
    { label: "Provisioning", value: counts.provisioning ?? 0 },
    { label: "Awaiting payment", value: counts.pending_payment ?? 0 },
    { label: "Stopped / failed", value: (counts.stopped ?? 0) + (counts.failed ?? 0) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-1 text-muted-foreground">Integrations, customers and the audit log.</p>
      </div>

      {missing.length > 0 && (
        <Alert>
          <CircleAlert />
          <AlertTitle>Setup incomplete</AlertTitle>
          <AlertDescription>
            <ul className="list-inside list-disc">
              {missing.map((m) => (
                <li key={m.label}>
                  <span className="font-medium text-foreground">{m.label}</span> is not configured — {m.impact}.
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} size="sm">
            <CardContent>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue={tab} className="gap-6">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList>
            <TabsTrigger value="customers">
              <Users /> Customers
            </TabsTrigger>
            <TabsTrigger value="growth">
              <TrendingUp /> Growth
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail /> Email
            </TabsTrigger>
            <TabsTrigger value="stripe">
              <CreditCard /> Stripe
            </TabsTrigger>
            <TabsTrigger value="hosting">
              <Server /> Hosting
            </TabsTrigger>
            <TabsTrigger value="events">
              <Activity /> Events
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="customers" className="space-y-6">
          <GrantForm baseDomain={coolify.baseDomain} shared={shared} />
          <CustomersTable rows={rows} sharedAppUrl={shared ? env.sharedApp.publicUrl : undefined} />
        </TabsContent>
        <TabsContent value="growth">
          {growth ? <GrowthPanel report={growth} days={days} periods={GROWTH_PERIODS} /> : <GrowthLoader href={`/admin?tab=growth&days=${days}`} />}
        </TabsContent>
        <TabsContent value="email">
          <SmtpForm
            adminEmail={user.email}
            smtp={{
              host: smtp.host,
              port: smtp.port,
              secure: smtp.secure,
              user: smtp.user,
              hasPassword: !!smtp.password,
              fromName: smtp.fromName,
              fromEmail: smtp.fromEmail,
              replyTo: smtp.replyTo,
              shareWithInstances: smtp.shareWithInstances,
            }}
            instanceSmtp={{
              host: instanceSmtp.host,
              port: instanceSmtp.port,
              secure: instanceSmtp.secure,
              user: instanceSmtp.user,
              hasPassword: !!instanceSmtp.password,
              fromName: instanceSmtp.fromName,
              fromEmail: instanceSmtp.fromEmail,
            }}
          />
        </TabsContent>
        <TabsContent value="stripe">
          <StripeForm
            stripe={{
              hasKey: !!stripe.secretKey,
              mode: stripe.mode,
              accountName: stripe.accountName,
              productId: stripe.productId,
              priceId: stripe.priceId,
              webhookEndpointId: stripe.webhookEndpointId,
              hasWebhookSecret: !!stripe.webhookSecret,
              portalConfigurationId: stripe.portalConfigurationId,
              connectedAt: stripe.connectedAt,
              lastError: stripe.lastError,
              trialDays: stripe.trialDays,
              automaticTax: stripe.automaticTax,
              allowPromotionCodes: stripe.allowPromotionCodes,
              webhookUrl: webhookUrl(),
            }}
          />
        </TabsContent>
        <TabsContent value="hosting" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <SharedAppCard
              app={{
                configured: health.configured,
                ok: health.ok,
                commit: health.commit,
                error: health.error,
                publicUrl: env.sharedApp.publicUrl,
                internalUrl: env.sharedApp.internalUrl,
                hasSsoSecret: !!env.sharedApp.ssoSecret,
                workspaces,
              }}
            />
            <PlanForm plan={{ monthlyBudgetUsd: plan.monthlyBudgetUsd, maxProjects: plan.maxProjects }} />
          </div>
          <CoolifyForm
            dedicatedOnly={shared}
            coolify={{
              baseUrl: coolify.baseUrl,
              hasToken: !!coolify.apiToken,
              serverUuid: coolify.serverUuid,
              serverName: coolify.serverName,
              projectName: coolify.projectName,
              projectUuid: coolify.projectUuid,
              baseDomain: coolify.baseDomain,
              image: coolify.image,
              memoryLimit: coolify.memoryLimit,
            }}
          />
        </TabsContent>
        <TabsContent value="events">
          <EventsList
            events={events.map((e) => ({
              id: e.id,
              type: e.type,
              userId: e.userId,
              instanceId: e.instanceId,
              data: e.data,
              createdAt: e.createdAt.toISOString(),
            }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
