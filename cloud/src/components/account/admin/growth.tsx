import Link from "next/link";
import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { conversionRate, type BreakdownRow } from "@/server/analytics/breakdown";
import type { GrowthReport } from "@/server/analytics/report";

const num = (n: number) => n.toLocaleString("en-US");
const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
const pct = (part: number, whole: number) => {
  const rate = conversionRate(part, whole);
  return rate === null ? "—" : `${rate}%`;
};
const regions = new Intl.DisplayNames(["en"], { type: "region" });
function countryName(code: string) {
  try {
    return regions.of(code) ?? code;
  } catch {
    return code;
  }
}
const intervalLabel = (interval: string) => ({ month: "Monthly", year: "Yearly" })[interval] ?? interval;
const planLabel = (plan: string) => ({ monthly: "Monthly", yearly: "Yearly" })[plan] ?? plan;
/**
 * Share of visitors for accounts / customers — only those with a known sign-up channel came from the counted
 * visitors, so accounts from before tracking (or without matching page views) are left out of the ratio.
 */
function visitorShare(tracked: number, total: number, visitors: number): string | undefined {
  if (tracked) return `${pct(tracked, visitors)} of visitors${tracked < total ? ` (${num(tracked)} with known channel)` : ""}`;
  return total ? "channel unknown (before tracking)" : undefined;
}
const shortDate = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card size="sm">
      <CardContent>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function Section({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Empty() {
  return <p className="py-4 text-center text-sm text-muted-foreground">No data in this period.</p>;
}

function Num({ children, className }: { children: ReactNode; className?: string }) {
  return <TableCell className={cn("text-right tabular-nums", className)}>{children}</TableCell>;
}

function BreakdownTable({ rows, label }: { rows: BreakdownRow[]; label: string }) {
  if (!rows.length) return <Empty />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{label}</TableHead>
          <TableHead className="text-right">Visitors</TableHead>
          <TableHead className="text-right">Accounts</TableHead>
          <TableHead className="text-right">Checkouts</TableHead>
          <TableHead className="text-right">Paid</TableHead>
          <TableHead className="text-right">Visitor → paid</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.key}>
            <TableCell className="max-w-80 truncate font-medium" title={r.key}>
              {r.key}
            </TableCell>
            <Num>{num(r.visitors)}</Num>
            <Num>{num(r.accounts)}</Num>
            <Num>{num(r.checkouts)}</Num>
            <Num className={r.paid ? "font-semibold text-brand" : undefined}>{num(r.paid)}</Num>
            <Num className="text-muted-foreground">{pct(r.paid, r.visitors)}</Num>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  if (!rows.length) return <Empty />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {head.map((h, i) => (
            <TableHead key={h} className={i ? "text-right" : undefined}>
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((cells, r) => (
          <TableRow key={r}>
            {cells.map((cell, i) =>
              i ? (
                <Num key={i}>{cell}</Num>
              ) : (
                <TableCell key={i} className="max-w-64 truncate font-medium">
                  {cell}
                </TableCell>
              ),
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const max = Math.max(1, ...steps.map((s) => s.value));
  return (
    <ol className="space-y-3">
      {steps.map((step, i) => (
        <li key={step.label} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[9rem_1fr_7rem]">
          <span className="truncate text-muted-foreground">{step.label}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-muted">
            <span className="block h-full rounded-full bg-brand" style={{ width: `${(step.value / max) * 100}%` }} />
          </span>
          <span className="text-right tabular-nums">
            <span className="font-medium">{num(step.value)}</span>
            {i > 0 && step.value <= steps[i - 1]!.value && (
              <span className="ml-2 text-xs text-muted-foreground">{pct(step.value, steps[i - 1]!.value)}</span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Daily({ days }: { days: GrowthReport["daily"] }) {
  const max = Math.max(1, ...days.map((d) => d.visitors));
  return (
    <div className="space-y-4">
      <div className="flex h-28 items-end gap-px" role="img" aria-label="Visitors per day">
        {days.map((d) => (
          <div
            key={d.day}
            className="relative flex h-full min-w-0 flex-1 items-end"
            title={`${shortDate(d.day)}: ${d.visitors} visitors · ${d.accounts} accounts · ${d.paid} paid`}
          >
            <div className="w-full rounded-t-sm bg-foreground/15" style={{ height: `${Math.max(d.visitors ? 3 : 0, (d.visitors / max) * 100)}%` }} />
            {(d.accounts > 0 || d.paid > 0) && (
              <span className={cn("absolute inset-x-0 bottom-0 mx-auto size-1.5 rounded-full", d.paid ? "bg-brand" : "bg-info")} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{shortDate(days[0]!.day)}</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-info" /> account
          </span>
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-brand" /> paid
          </span>
        </span>
        <span>{shortDate(days.at(-1)!.day)}</span>
      </div>
      <div className="max-h-72 overflow-y-auto rounded-lg border">
        <SimpleTable
          head={["Day", "Visitors", "Accounts", "Paid"]}
          rows={[...days].reverse().map((d) => [shortDate(d.day), num(d.visitors), num(d.accounts), num(d.paid)])}
        />
      </div>
    </div>
  );
}

/** /admin → Growth: cookieless visitor statistics joined with sign-ups, checkouts and payments. */
export function GrowthPanel({ report, days, periods }: { report: GrowthReport; days: number; periods: readonly number[] }) {
  const from = report.daily[0]?.day;
  const startedLate = report.trackingStartedAt && from && report.trackingStartedAt.toISOString().slice(0, 10) > from;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Last {days} days (UTC). Visitors are counted once per day — the anonymous visitor hash changes daily.
        </p>
        <nav className="inline-flex rounded-lg bg-muted p-[3px]" aria-label="Period">
          {periods.map((p) => (
            <Link
              key={p}
              href={`/admin?tab=growth&days=${p}`}
              scroll={false}
              aria-current={p === days ? "page" : undefined}
              className={cn(
                "rounded-md px-2.5 py-1 text-sm font-medium text-foreground/60 hover:text-foreground",
                p === days && "bg-background text-foreground shadow-sm",
              )}
            >
              {p} days
            </Link>
          ))}
        </nav>
      </div>

      {(!report.trackingStartedAt || startedLate) && (
        <p className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          {report.trackingStartedAt
            ? `Tracking started on ${report.trackingStartedAt.toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })} — earlier days have no visitor data, and accounts created before then have no channel ("Unknown").`
            : "No page views recorded yet. The cookieless statistics start with the first visitor after this release."}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="Visitors"
          value={num(report.visitors)}
          hint={`${num(report.pricingVisitors)} saw pricing · ${num(report.signupVisitors)} saw sign-up`}
        />
        <Kpi label="Accounts created" value={num(report.accounts)} hint={visitorShare(report.trackedAccounts, report.accounts, report.visitors)} />
        <Kpi
          label="Checkouts started"
          value={num(report.checkouts)}
          hint={report.accounts ? `${pct(report.checkouts, report.accounts)} of new accounts` : undefined}
        />
        <Kpi label="New paying customers" value={num(report.paid)} hint={visitorShare(report.trackedPaid, report.paid, report.visitors)} />
        <Kpi label="Account → paid" value={pct(report.paid, report.accounts)} />
        <Kpi label="Active subscriptions" value={num(report.activeSubscriptions)} hint={report.cancelScheduled ? `${report.cancelScheduled} set to cancel` : "right now"} />
        <Kpi
          label="MRR"
          value={usd(report.mrrUsd)}
          hint={["net, excl. tax", ...report.plans.map((p) => `${p.subscriptions} ${intervalLabel(p.interval).toLowerCase()}`)].join(" · ")}
        />
        <Kpi label="Cancellations" value={num(report.cancellations)} hint="subscriptions ended in period" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Funnel"
          description="Each step is counted on its own in this period; percentages compare with the step above (left out where earlier accounts make a step larger)."
        >
          <Funnel
            steps={[
              { label: "Visitors", value: report.visitors },
              { label: "Pricing page", value: report.pricingVisitors },
              { label: "Sign-up page", value: report.signupVisitors },
              { label: "Accounts", value: report.accounts },
              { label: "Checkouts", value: report.checkouts },
              { label: "Paid", value: report.paid },
            ]}
          />
        </Section>
        <Section title="Daily" description="Visitors per day; dots mark days with new accounts or payments.">
          {report.daily.length ? <Daily days={report.daily} /> : <Empty />}
        </Section>
      </div>

      <Section
        title="Channels"
        description="Visitors by the channel they arrived from; accounts, checkouts and payments by the account's sign-up channel."
      >
        <BreakdownTable rows={report.channels} label="Channel" />
      </Section>

      <Section title="Campaigns and ads" description="By utm_source / utm_campaign / utm_content — one row per ad.">
        <BreakdownTable rows={report.campaigns} label="Source / campaign / content" />
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Subscriptions by plan" description="Live paid subscriptions right now; yearly plans count 1/12 of the net invoice per month.">
          <SimpleTable
            head={["Plan", "Subscriptions", "MRR"]}
            rows={report.plans.map((p) => [intervalLabel(p.interval), num(p.subscriptions), usd(p.mrrUsd)])}
          />
        </Section>
        <Section title="New paying customers by plan" description="In this period, with the offer used at checkout.">
          <SimpleTable
            head={["Plan", "Offer", "Customers"]}
            rows={report.newPaidByPlan.map((p) => [planLabel(p.plan), p.offer ?? "—", num(p.customers)])}
          />
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Landing pages" description="Where visitors entered (their first page from a channel).">
          <SimpleTable head={["Page", "Visitors", "Accounts"]} rows={report.landingPages.map((p) => [p.path, num(p.visitors), num(p.accounts)])} />
        </Section>
        <Section title="Referrers" description="External sites that sent visitors.">
          <SimpleTable
            head={["Site", "Channel", "Visitors"]}
            rows={report.referrers.map((r) => [
              r.host,
              <Badge key="c" variant="outline" className="font-normal">
                {r.channel}
              </Badge>,
              num(r.visitors),
            ])}
          />
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Countries">
          <SimpleTable head={["Country", "Visitors"]} rows={report.countries.map((c) => [c.country === "Unknown" ? "Unknown" : countryName(c.country), num(c.visitors)])} />
        </Section>
        <Section title="Devices">
          <SimpleTable head={["Device", "Visitors"]} rows={report.devices.map((d) => [d.device, num(d.visitors)])} />
        </Section>
        <Section title="Interactions" description="AI checks, sign-up clicks, GitHub clicks, install-command copies.">
          <SimpleTable head={["Event", "Count", "Visitors"]} rows={report.interactions.map((e) => [e.name, num(e.total), num(e.visitors)])} />
        </Section>
      </div>
    </div>
  );
}
