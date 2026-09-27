"use client";

import Link from "next/link";
import { Activity, EyeOff, Info, MessageSquareText } from "lucide-react";
import { Panel } from "@/components/app/page";
import { Meter } from "@/components/app/metrics";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { AttributionInsights } from "@/server/attribution/insights";
import { money } from "./shared";

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="text-muted-foreground hover:text-foreground" aria-label="How is this calculated?">
          <Info className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-72 text-xs leading-relaxed">{children}</TooltipContent>
    </Tooltip>
  );
}

function Block({ icon, label, hint, children }: { icon: React.ReactNode; label: string; hint: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col rounded-xl bg-muted/40 p-3.5 sm:p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <Hint>{hint}</Hint>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[11px]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular">{value}</dd>
    </div>
  );
}

const STRENGTH_LABEL = { strong: "Strong", moderate: "Moderate", weak: "Weak", none: "No" } as const;

function signed(r: number) {
  return `${r > 0 ? "+" : r < 0 ? "−" : ""}${Math.abs(r).toFixed(2)}`;
}

/** Hidden AI revenue, survey response rate and AI-visibility correlation for the period. */
export function AttributionInsightsCard({ projectId, insights }: { projectId: string; insights: AttributionInsights }) {
  const h = insights.hiddenAiRevenue;
  const rr = insights.responseRate;
  const vc = insights.visibilityCorrelation;
  const cur = h.currency;
  const r = vc.responses ?? vc.revenue;

  return (
    <Panel
      title="AI revenue insights"
      description="What analytics misses, how representative the survey is and whether AI visibility moves your pipeline."
      contentClassName="grid gap-3 p-3 sm:p-4 md:grid-cols-3"
    >
      <Block
        icon={<EyeOff className="size-3.5 text-brand" />}
        label="Hidden AI revenue"
        hint={
          <>
            Survey AI share × orders × average order value, minus the revenue your analytics tool already attributes to AI referrals. It is the
            AI-influenced revenue that shows up as direct / organic in analytics. Floored at 0.
          </>
        }
      >
        <div className="mt-2 text-2xl font-semibold tracking-tight tabular">{h.value == null ? "—" : money(h.value, cur)}</div>
        {h.reason && <p className={cn("mt-1 text-[11px]", h.value == null ? "text-muted-foreground" : "text-muted-foreground/80")}>{h.reason}</p>}
        <dl className="mt-3 space-y-1">
          <Row label="Survey AI share" value={h.surveyAiShare == null ? "—" : `${h.surveyAiShare.toFixed(1)}%`} />
          <Row label="Orders" value={h.orders.toLocaleString("en-US")} />
          <Row label="Avg. order value" value={money(h.aov, cur, 2)} />
          <Row label="Estimated AI revenue" value={money(h.estimatedAiRevenue, cur)} />
          <Row
            label={h.analyticsSource ? `− AI revenue in ${h.analyticsSource}` : "− AI revenue in analytics"}
            value={h.analyticsAiRevenue == null ? "not connected" : money(h.analyticsAiRevenue, h.analyticsCurrency ?? cur)}
          />
        </dl>
        {h.analyticsAiRevenue == null && (
          <Link href={`/p/${projectId}/analytics/traffic?tab=settings`} className="mt-auto pt-3 text-xs font-medium text-foreground/80 hover:underline">
            Connect GA4, Matomo or Piwik PRO →
          </Link>
        )}
      </Block>

      <Block
        icon={<MessageSquareText className="size-3.5 text-chart-1" />}
        label="Survey response rate"
        hint={
          <>
            Orders and leads (renewals excluded) that were merged with a “How did you hear about us?” answer, divided by all of them. The higher
            it is, the more reliable the AI share above.
          </>
        }
      >
        <div className="mt-2 text-2xl font-semibold tracking-tight tabular">{rr.value == null ? "—" : `${rr.value.toFixed(1)}%`}</div>
        {rr.value != null ? (
          <>
            <Meter className="mt-3" value={rr.value} tone="info" />
            <dl className="mt-3 space-y-1">
              <Row label="Orders with an answer" value={rr.answeredOrders.toLocaleString("en-US")} />
              <Row label="Orders & leads" value={rr.orders.toLocaleString("en-US")} />
              <Row label="Survey responses" value={rr.responses.toLocaleString("en-US")} />
            </dl>
          </>
        ) : (
          <p className="mt-1 text-[11px] text-muted-foreground">
            No orders or leads tracked in this period. Connect a shop, Stripe or send conversions so answers can be merged with orders.
          </p>
        )}
      </Block>

      <Block
        icon={<Activity className="size-3.5 text-chart-3" />}
        label="Visibility ↔ AI leads"
        hint={
          <>
            Pearson correlation between your daily AI visibility (tracker) and the AI-search answers (and their revenue) received on the same
            day. Needs at least {vc.minPairedDays} days with tracking data in the period. Correlation is not causation.
          </>
        }
      >
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight tabular">{r == null ? "—" : signed(r)}</span>
          {vc.strength && r != null && (
            <span className="text-xs text-muted-foreground">
              {STRENGTH_LABEL[vc.strength]} {r >= 0 ? "positive" : "negative"} correlation
            </span>
          )}
        </div>
        {r == null ? (
          <p className="mt-1 text-[11px] text-muted-foreground">
            {vc.pairedDays < vc.minPairedDays
              ? `Only ${vc.pairedDays} day${vc.pairedDays === 1 ? "" : "s"} with tracking data in this period — needs ${vc.minPairedDays}. Pick a longer period or track more often.`
              : "No variation in visibility or AI answers yet."}
          </p>
        ) : (
          <dl className="mt-3 space-y-1">
            <Row label="r · AI answers" value={vc.responses == null ? "—" : signed(vc.responses)} />
            <Row label="r · AI revenue" value={vc.revenue == null ? "—" : signed(vc.revenue)} />
            <Row label="Paired days" value={vc.pairedDays} />
          </dl>
        )}
        <Link href={`/p/${projectId}/ai/tracker`} className="mt-auto pt-3 text-xs font-medium text-foreground/80 hover:underline">
          Open AI visibility tracker →
        </Link>
      </Block>
    </Panel>
  );
}
