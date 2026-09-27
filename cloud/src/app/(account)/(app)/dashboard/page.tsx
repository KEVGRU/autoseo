import {
  BookOpen,
  Check,
  CircleAlert,
  CreditCard,
  ExternalLink,
  Gift,
  LifeBuoy,
  Play,
  RefreshCw,
  RotateCcw,
  Rocket,
  X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionButton } from "@/components/account/action-button";
import { AccountCard } from "@/components/account/dashboard/account-card";
import { NewInstanceForm } from "@/components/account/dashboard/new-instance-form";
import { ProvisioningProgress } from "@/components/account/dashboard/provisioning-progress";
import { GitHubIcon } from "@/components/account/icons";
import { requireUser } from "@/server/auth/guards";
import { countActiveSessions } from "@/server/auth/session";
import { getUserInstance } from "@/server/instances";
import { toInstanceView, type InstanceView } from "@/server/instance-view";
import { getSetting, isStripeConnected } from "@/server/settings";
import { env, isSharedBackendConfigured } from "@/server/env";
import { getPlanLimits, tenantUsage } from "@/server/shared-app";
import type { PlanLimits, UsageSummary } from "@/server/tenant-rules";
import { isSubscriptionLive } from "@/server/billing-rules";
import { instanceOptions, type InstanceOptions, type StoppedAction } from "@/server/instance-options";
import { CreateWithoutPaymentButton } from "@/components/account/dashboard/create-without-payment-button";
import { getLaunchOfferStatus, processCheckoutRedirect } from "@/server/stripe";
import { cookies } from "next/headers";
import { XPurchaseConversion } from "@/components/analytics/consent";
import { PURCHASE_COOKIE, cookieName } from "@/lib/consent";
import { formatUsd, launchOffer, parseBillingPlan } from "@/lib/launch-offer";
import {
  cancelPendingAction,
  manageBillingAction,
  openInstanceAction,
  restartMyInstanceAction,
  resumeCheckoutAction,
  retryMyInstanceAction,
  startMyInstanceAction,
} from "@/server/actions/instance";

export const metadata = { title: "Dashboard" };

const GITHUB = "https://github.com/codextde/autoseo";
const DOCS = "https://github.com/codextde/autoseo#readme";
const SUPPORT = "info@codext.de";

function includedItems(shared: boolean, plan: PlanLimits): string[] {
  if (shared) {
    return [
      "Your own private workspace on AutoSEO Cloud",
      "Every feature — AI visibility, rankings, audits, content",
      `AI and data usage included (up to $${plan.monthlyBudgetUsd} per month)`,
      `Up to ${plan.maxProjects} projects, unlimited team members`,
      "No setup: AI providers and data sources are ready to go",
      "Automatic updates and email delivery",
      "Export your data anytime · cancel anytime",
    ];
  }
  return [
    "Your own private instance with its own database",
    "Every feature — AI visibility, rankings, audits, content",
    "Unlimited users, workspaces and projects",
    "Automatic updates, SSL and email delivery set up",
    "Bring your own AI keys, or connect a local Claude Code / Codex agent",
    "DataForSEO optional for keyword & SERP data",
    "Export your data anytime · cancel anytime",
  ];
}

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

function UsageBar({ usage }: { usage: UsageSummary }) {
  return (
    <span className="block">
      {usd(usage.spendUsd)} <span className="font-normal text-muted-foreground">of {usd(usage.budgetUsd)}</span>
      <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        <span
          className={`block h-full rounded-full ${usage.percent >= 90 ? "bg-warning" : "bg-brand"}`}
          style={{ width: `${usage.percent}%` }}
        />
      </span>
    </span>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(iso));
}

function subscriptionLabel(view: InstanceView): { label: string; tone: "ok" | "warn" | "bad" | "muted" } {
  switch (view.subscriptionStatus) {
    case "active":
      return view.cancelAtPeriodEnd ? { label: "Cancels at period end", tone: "warn" } : { label: "Active", tone: "ok" };
    case "trialing":
      return { label: "Trial", tone: "ok" };
    case "past_due":
      return { label: "Payment overdue", tone: "warn" };
    case "unpaid":
      return { label: "Unpaid", tone: "bad" };
    case "canceled":
      return { label: "Canceled", tone: "muted" };
    case null:
      return { label: "—", tone: "muted" };
    default:
      return { label: view.subscriptionStatus.replace(/_/g, " "), tone: "muted" };
  }
}

const toneClass = {
  ok: "bg-brand-soft text-brand dark:bg-brand/15",
  warn: "bg-warning/15 text-[oklch(0.5_0.12_70)] dark:text-warning",
  bad: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

function ComplimentaryBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand dark:bg-brand/15">
      <Gift className="size-3" /> Complimentary
    </span>
  );
}

function StatusDot({ tone }: { tone: keyof typeof toneClass }) {
  const color = { ok: "bg-brand", warn: "bg-warning", bad: "bg-destructive", muted: "bg-muted-foreground" }[tone];
  return (
    <span className="relative flex size-2.5">
      {tone === "ok" && <span className={`absolute inline-flex size-full animate-ping rounded-full ${color} opacity-50`} />}
      <span className={`relative inline-flex size-2.5 rounded-full ${color}`} />
    </span>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border bg-background/60 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate text-sm font-medium">{children}</dd>
    </div>
  );
}

function HelpLinks() {
  const link = "inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground";
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      <a href={DOCS} target="_blank" rel="noopener" className={link}>
        <BookOpen className="size-4" /> Documentation
      </a>
      <a href={GITHUB} target="_blank" rel="noopener" className={link}>
        <GitHubIcon className="size-4" /> GitHub
      </a>
      <a href={`mailto:${SUPPORT}`} className={link}>
        <LifeBuoy className="size-4" /> {SUPPORT}
      </a>
    </div>
  );
}

function IncludedCard({ items, offerOpen }: { items: string[]; offerOpen: boolean }) {
  return (
    <Card className="bg-[#141413] text-white ring-white/10 dark:bg-card dark:text-card-foreground">
      <CardHeader>
        <CardTitle className="text-base">Everything included</CardTitle>
        <CardDescription className="text-white/60 dark:text-muted-foreground">
          {offerOpen ? (
            <>
              <span className="text-2xl font-semibold text-white dark:text-foreground">{formatUsd(launchOffer.monthlyEquivalentUsd)}</span> / month
              in your first year with the launch offer, or $50 / month billed monthly
            </>
          ) : (
            <>
              <span className="text-2xl font-semibold text-white dark:text-foreground">$50</span> / month
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-white/80 dark:text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-[#22c55e]" />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function RunningView({ view, options, usage }: { view: InstanceView; options: InstanceOptions; usage: UsageSummary | null }) {
  const sub = subscriptionLabel(view);
  const complimentary = options.plan === "complimentary";
  const shared = view.backend === "shared";
  const healthy = view.healthy !== false;
  const details: { label: string; value: React.ReactNode }[] = [
    ...(complimentary
      ? [{ label: "Plan", value: <ComplimentaryBadge /> }]
      : [
          { label: "Subscription", value: <span className={`rounded-full px-2 py-0.5 text-xs ${toneClass[sub.tone]}`}>{sub.label}</span> },
          { label: view.cancelAtPeriodEnd ? "Access until" : "Renews on", value: formatDate(view.currentPeriodEnd) },
        ]),
    ...(shared
      ? [
          ...(usage ? [{ label: "Included usage this month", value: <UsageBar usage={usage} /> }] : []),
          ...(usage ? [{ label: "Projects", value: `${usage.projects} of ${usage.maxProjects}` }] : []),
        ]
      : [
          {
            label: "Last health check",
            value: view.lastHealthAt
              ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(view.lastHealthAt))
              : "—",
          },
        ]),
    { label: "Created", value: formatDate(view.createdAt) },
  ].slice(0, 4);
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden pt-0">
        <div className="relative border-b bg-gradient-to-br from-brand-soft/70 via-card to-card p-6 sm:p-8 dark:from-brand/10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <StatusDot tone={healthy ? "ok" : "warn"} />
                {healthy ? (shared ? "Active" : "Running") : "Not responding"}
              </div>
              <h2 className="mt-2 truncate text-2xl font-semibold tracking-tight sm:text-3xl">{view.workspaceName}</h2>
              <a
                href={view.url}
                target="_blank"
                rel="noopener"
                className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate text-sm text-muted-foreground hover:text-foreground"
              >
                {view.host} <ExternalLink className="size-3.5 shrink-0" />
              </a>
            </div>
            <ActionButton action={openInstanceAction} size="lg" className="h-12 px-6 text-base" icon={<Rocket />}>
              Open AutoSEO
            </ActionButton>
          </div>
        </div>
        <CardContent className="pt-2">
          <dl className={`grid grid-cols-2 gap-3 ${details.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
            {details.map((d) => (
              <Detail key={d.label} label={d.label}>
                {d.value}
              </Detail>
            ))}
          </dl>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3 border-t py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {options.showBilling && (
              <ActionButton variant="outline" action={manageBillingAction} icon={<CreditCard />}>
                Manage billing
              </ActionButton>
            )}
            {!shared && (
              <ActionButton
                variant="outline"
                action={restartMyInstanceAction}
                icon={<RotateCcw />}
                confirm="Restart your instance? It will be unavailable for about a minute."
              >
                Restart instance
              </ActionButton>
            )}
          </div>
          <HelpLinks />
        </CardFooter>
      </Card>
      {view.subscriptionStatus === "past_due" && (
        <Alert>
          <CircleAlert />
          <AlertTitle>Your last payment failed</AlertTitle>
          <AlertDescription>
            Update your payment method under “Manage billing” to keep your {shared ? "workspace" : "instance"} running.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
          <CardDescription>
            {shared
              ? "Your workspace is ready — sign in with one click and add your first website."
              : "Your instance is yours — sign in with one click and set it up in a few minutes."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-3 text-sm sm:grid-cols-3">
            {(shared
              ? [
                  ["Open AutoSEO", "You're signed in automatically as the owner of your workspace."],
                  ["Add your website", "Create a project for your site — AI providers and data sources are already set up."],
                  ["Invite your team", "Add colleagues and clients to your workspace."],
                ]
              : [
                  ["Open AutoSEO", "You're signed in automatically as the owner of your workspace."],
                  ["Connect AI", "Add your OpenAI / Anthropic / Gemini keys, or connect a local Claude Code or Codex agent."],
                  ["Invite your team", "Add colleagues and clients — unlimited users and projects."],
                ]
            ).map(([title, body], i) => (
              <li key={title} className="rounded-xl border p-4">
                <span className="text-xs font-semibold text-brand">Step {i + 1}</span>
                <p className="mt-1 font-medium">{title}</p>
                <p className="mt-1 text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function stoppedCopy(action: StoppedAction, complimentary: boolean, shared: boolean): string {
  const noun = shared ? "workspace" : "instance";
  const stopped = shared ? "paused" : "stopped";
  const kept = shared ? "Your data is kept for 30 days" : "Your data is kept";
  if (complimentary) {
    return action === "start"
      ? `Your complimentary ${noun} is ${stopped}. ${kept} — start it again whenever you like.`
      : `Your ${noun} was ${stopped} by an administrator. ${kept} — contact us to get it running again.`;
  }
  switch (action) {
    case "update_payment":
      return `Your ${noun} was paused because the subscription is unpaid. Update your payment method and it comes back automatically — ${kept.toLowerCase()}.`;
    case "resubscribe":
      return `Your subscription has ended, so the ${noun} was ${stopped}. ${kept} — resubscribe and everything is back in place.`;
    default:
      return `Your ${noun} is currently ${stopped}. Contact us if you didn't expect this.`;
  }
}

function StoppedView({ view, options, offerOpen }: { view: InstanceView; options: InstanceOptions; offerOpen: boolean }) {
  const action = options.stoppedAction;
  const shared = view.backend === "shared";
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-muted-foreground">
          <StatusDot tone="muted" /> {shared ? "Paused" : "Stopped"}
          {options.plan === "complimentary" && <ComplimentaryBadge />}
        </div>
        <CardTitle className="text-2xl">{shared ? view.workspaceName : view.host}</CardTitle>
        <CardDescription className="max-w-2xl text-sm">{stoppedCopy(action, options.plan === "complimentary", shared)}</CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col items-stretch gap-3 border-t py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {action === "start" ? (
            <ActionButton action={startMyInstanceAction} icon={<Play />}>
              Start again
            </ActionButton>
          ) : action === "update_payment" ? (
            <ActionButton action={manageBillingAction} icon={<CreditCard />}>
              Update payment method
            </ActionButton>
          ) : action === "resubscribe" && offerOpen ? (
            <>
              <ActionButton data-x-add-to-cart action={resumeCheckoutAction.bind(null, "yearly")} icon={<Play />}>
                Resubscribe — {formatUsd(launchOffer.firstYearUsd)} for the first year
              </ActionButton>
              <ActionButton variant="outline" data-x-add-to-cart action={resumeCheckoutAction.bind(null, "monthly")}>
                Monthly — $50/month
              </ActionButton>
            </>
          ) : action === "resubscribe" ? (
            <ActionButton data-x-add-to-cart action={resumeCheckoutAction} icon={<Play />}>
              Resubscribe — $50/month
            </ActionButton>
          ) : null}
          {options.showBilling && (
            <ActionButton variant="outline" action={manageBillingAction} icon={<CreditCard />}>
              Billing & invoices
            </ActionButton>
          )}
        </div>
        <HelpLinks />
      </CardFooter>
    </Card>
  );
}

function FailedView({ view, options }: { view: InstanceView; options: InstanceOptions }) {
  const canRetry = options.canRetryFailed;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-sm font-medium text-destructive">
          <StatusDot tone="bad" /> Setup failed
        </div>
        <CardTitle className="text-2xl">{view.backend === "shared" ? view.workspaceName : view.host}</CardTitle>
        <CardDescription className="max-w-2xl text-sm">
          Something went wrong while setting up your {view.backend === "shared" ? "workspace" : "instance"}. We&apos;ve been
          notified and are looking into it. You can try again, or write to {SUPPORT} and we&apos;ll sort it out.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col items-stretch gap-3 border-t py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {canRetry && (
            <ActionButton action={retryMyInstanceAction} icon={<RefreshCw />}>
              Try again
            </ActionButton>
          )}
          {options.showBilling && (
            <ActionButton variant="outline" action={manageBillingAction} icon={<CreditCard />}>
              Manage billing
            </ActionButton>
          )}
        </div>
        <HelpLinks />
      </CardFooter>
    </Card>
  );
}

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const { user } = await requireUser("/dashboard");
  const sp = await searchParams;
  const checkout = typeof sp.checkout === "string" ? sp.checkout : null;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : null;
  // Checkouts return through /api/billing/return (which processes them); links of older in-flight checkouts still
  // carry the session id: process those here too (idempotent). The webhook may be slower than either.
  if (checkout === "success" && sessionId) await processCheckoutRedirect(sessionId, user.id);
  // A paid checkout waiting to be reported to X (only set with consent; a server action claims it once).
  const pendingPurchase = checkout === "success" && (await cookies()).has(cookieName(PURCHASE_COOKIE, !env.isLocal));

  const [instance, coolify, stripe, sessions, plan, offer] = await Promise.all([
    getUserInstance(user.id),
    getSetting("coolify"),
    getSetting("stripe"),
    countActiveSessions(user.id),
    getPlanLimits(),
    getLaunchOfferStatus(),
  ]);
  // "Claim 50% off" links come in with ?plan=yearly, "monthly" ones with ?plan=monthly (via /signup).
  const defaultPlan = parseBillingPlan(sp.plan) ?? undefined;
  const view = instance ? toInstanceView(instance, { sharedAppUrl: env.sharedApp.publicUrl }) : null;
  // New customers get a shared workspace when the shared app is configured.
  const shared = view ? view.backend === "shared" : isSharedBackendConfigured();
  const noun = shared ? "workspace" : "instance";
  const usage = instance?.status === "running" ? await tenantUsage(instance) : null;
  const options = instance ? instanceOptions({ ...instance, hasBillingAccount: !!user.stripeCustomerId }) : null;
  const canDelete = !instance || !isSubscriptionLive(instance.subscriptionStatus);

  return (
    <div className="space-y-8">
      {pendingPurchase && <XPurchaseConversion />}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {view?.status === "running" ? `Your AutoSEO ${noun}` : view ? `Your ${noun}` : "Get your own AutoSEO"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {view
            ? shared
              ? `${view.workspaceName} · ${view.host}`
              : view.host
            : shared
              ? "Your own private AutoSEO workspace — ready in seconds, nothing to set up."
              : "A private, fully managed AutoSEO instance — ready in a few minutes."}
        </p>
      </div>

      {sp.error === "forbidden" && (
        <Alert variant="destructive">
          <X />
          <AlertDescription>That page is only available to administrators.</AlertDescription>
        </Alert>
      )}
      {sp.error === "billing" && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>We couldn&apos;t open the billing portal. Please try again or contact {SUPPORT}.</AlertDescription>
        </Alert>
      )}
      {checkout === "canceled" && view?.status === "pending_payment" && (
        <Alert>
          <CircleAlert />
          <AlertDescription>
            {shared
              ? "Checkout was canceled. Your order is kept for 48 hours — resume whenever you're ready."
              : "Checkout was canceled. Your address stays reserved for 48 hours from when you picked it — resume whenever you're ready."}
          </AlertDescription>
        </Alert>
      )}

      {!view && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Create your {noun}</CardTitle>
              <CardDescription>
                {shared
                  ? "Name your workspace — usually your company or client. You can invite your team right after."
                  : "Pick a name and address. You can invite your team once it's running."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NewInstanceForm
                baseDomain={coolify.baseDomain}
                billingReady={isStripeConnected(stripe)}
                shared={shared}
                isAdmin={user.isAdmin}
                offer={offer}
                defaultPlan={defaultPlan}
              />
            </CardContent>
          </Card>
          <IncludedCard items={includedItems(shared, plan)} offerOpen={offer.open} />
        </div>
      )}

      {view?.status === "pending_payment" &&
        (checkout === "success" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Confirming your payment…</CardTitle>
              <CardDescription>This usually takes a few seconds.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProvisioningProgress initial={view} waitWhile={["pending_payment"]} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <Card>
              <CardHeader>
                <Badge variant="outline" className="mb-1">
                  Awaiting payment
                </Badge>
                <CardTitle className="text-xl">Finish your order</CardTitle>
                <CardDescription>
                  {shared ? (
                    <>
                      Your workspace <span className="font-medium text-foreground">{view.workspaceName}</span> is almost ready.
                      Complete the checkout to create it.
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-foreground">{view.host}</span> is reserved for you. Complete the checkout
                      to start your instance.
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-wrap gap-2 border-t py-4">
                {offer.open ? (
                  <>
                    <ActionButton data-x-add-to-cart action={resumeCheckoutAction.bind(null, "yearly")} icon={<CreditCard />}>
                      Pay {formatUsd(launchOffer.firstYearUsd)} for the first year ({launchOffer.percentOff}% off)
                    </ActionButton>
                    <ActionButton variant="outline" data-x-add-to-cart action={resumeCheckoutAction.bind(null, "monthly")}>
                      Pay monthly — $50/month
                    </ActionButton>
                  </>
                ) : (
                  <ActionButton data-x-add-to-cart action={resumeCheckoutAction} icon={<CreditCard />}>
                    Resume checkout
                  </ActionButton>
                )}
                <ActionButton
                  variant="ghost"
                  action={cancelPendingAction}
                  icon={<X />}
                  confirm={shared ? "Cancel this order?" : "Cancel this order and release the address?"}
                >
                  Cancel order
                </ActionButton>
                {user.isAdmin && <CreateWithoutPaymentButton slug={view.slug} workspaceName={view.workspaceName} />}
              </CardFooter>
            </Card>
            <IncludedCard items={includedItems(shared, plan)} offerOpen={offer.open} />
          </div>
        ))}

      {view?.status === "provisioning" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{shared ? `Setting up ${view.workspaceName}` : `Setting up ${view.host}`}</CardTitle>
            <CardDescription>
              {shared ? "Thanks for subscribing! Your workspace is being created." : "Thanks for subscribing! Your private instance is being created."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProvisioningProgress initial={view} />
          </CardContent>
        </Card>
      )}

      {view && options && view.status === "running" && <RunningView view={view} options={options} usage={usage} />}
      {view && options && view.status === "stopped" && <StoppedView view={view} options={options} offerOpen={offer.open} />}
      {view && options && view.status === "failed" && <FailedView view={view} options={options} />}

      <AccountCard email={user.email} sessions={sessions} canDelete={canDelete} />
    </div>
  );
}
