import { ArrowUpRight, FolderKanban, Gauge, MailPlus, Users } from "lucide-react";
import { Panel } from "@/components/app/page";
import { Meter, formatNumber } from "@/components/app/metrics";
import { Button } from "@/components/ui/button";
import { featureLabel } from "../usage/labels";

export type CloudUsageData = {
  workspaceName: string;
  monthLabel: string;
  daysLeft: number;
  /** Share of the included monthly budget used / forecast by month end (null = no budget set). */
  usedPct: number | null;
  forecastPct: number | null;
  calls: number;
  byFeature: { key: string; events: number }[];
  projects: number;
  projectLimit: number;
  members: number;
  pendingInvites: number;
  cloudUrl: string | null;
};

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 rounded-xl bg-muted/50 p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="text-base font-semibold tracking-tight tabular">{value}</div>
      </div>
    </div>
  );
}

/**
 * Plan & usage for AutoSEO Cloud customers: usage against the workspace's included monthly budget, in percent —
 * provider prices and the platform's costs are never shown.
 */
export function CloudUsage({ data }: { data: CloudUsageData }) {
  const used = data.usedPct ?? 0;
  const tone = used >= 100 ? "destructive" : used >= 80 || (data.forecastPct ?? 0) > 100 ? "warning" : "brand";
  return (
    <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
      <Panel
        title={
          <span className="flex items-center gap-2">
            <Gauge className="size-4 text-muted-foreground" /> Included usage · {data.monthLabel}
          </span>
        }
        description="AI answers, rank checks, keyword and backlink data of this workspace"
      >
        {data.usedPct === null ? (
          <p className="text-sm text-muted-foreground">
            {formatNumber(data.calls)} AI & data calls this month. Your plan has no monthly usage limit.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-semibold tracking-tight tabular">{Math.min(999, Math.round(used))}%</span>
              <span className="text-xs text-muted-foreground">of the included monthly usage</span>
            </div>
            <Meter value={Math.min(100, used)} tone={tone} />
            <p className="text-xs text-muted-foreground">
              {used >= 100
                ? "The included usage is used up — paid features pause until the 1st of next month."
                : `Forecast to month end: ${Math.round(data.forecastPct ?? 0)}% · resets in ${data.daysLeft + 1} day${data.daysLeft ? "s" : ""}.`}
            </p>
          </div>
        )}
        {data.byFeature.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm">
            {data.byFeature.slice(0, 8).map((f) => (
              <li key={f.key} className="flex items-center justify-between gap-3">
                <span className="truncate text-muted-foreground">{featureLabel(f.key)}</span>
                <span className="tabular">{formatNumber(f.events)} calls</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title={data.workspaceName} description="Your AutoSEO Cloud workspace">
        <div className="grid grid-cols-2 gap-2">
          <Stat icon={FolderKanban} label="Projects" value={`${data.projects} / ${data.projectLimit}`} />
          <Stat icon={Users} label="Members" value={data.members} />
          <Stat icon={MailPlus} label="Pending invites" value={data.pendingInvites} />
        </div>
        {data.cloudUrl && (
          <Button asChild variant="outline" className="mt-4">
            <a href={`${data.cloudUrl}/dashboard`}>
              Manage subscription <ArrowUpRight className="size-4" />
            </a>
          </Button>
        )}
      </Panel>
    </div>
  );
}
