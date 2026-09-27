import { Activity, CircleCheck, FolderPlus, Globe, Wallet } from "lucide-react";
import { Panel } from "@/components/app/page";
import { Meter } from "@/components/app/metrics";
import { formatUsd } from "@/features/settings/usage/labels";
import type { VisibilityCheckStats } from "@/server/free-tools/visibility-check";

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  pct,
}: {
  icon: typeof Activity;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  pct?: number | null;
}) {
  const tone = pct == null ? "brand" : pct >= 100 ? "destructive" : pct >= 80 ? "warning" : "brand";
  return (
    <div className="min-w-0 rounded-xl bg-muted/50 p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className="mt-1 text-lg font-semibold tracking-tight tabular">{value}</div>
      {pct != null && <Meter value={pct} tone={tone} className="mt-1.5" />}
      {sub && <div className="mt-1 truncate text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

/** Admin → Free tools: today's AI Visibility Check usage (server-compatible). */
export function AiCheckUsageCard({ stats, error }: { stats: VisibilityCheckStats | null; error?: string | null }) {
  if (!stats) {
    return (
      <Panel title="AI Visibility Check today" icon={<Activity className="size-4 text-muted-foreground" />}>
        <p className="text-sm text-muted-foreground">Usage couldn&apos;t be loaded{error ? `: ${error}` : "."}</p>
      </Panel>
    );
  }
  const l = stats.limits;
  return (
    <Panel
      title="AI Visibility Check today"
      icon={<Activity className="size-4 text-muted-foreground" />}
      description={`UTC day ${stats.day} · ${l.publicEnabled && l.enabled ? "public page on" : "public page off"} · signed-in users always have it`}
    >
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Kpi
          icon={Globe}
          label="Public checks"
          value={`${stats.publicChecks} / ${l.maxPerDay}`}
          pct={l.maxPerDay > 0 ? (stats.publicChecks / l.maxPerDay) * 100 : null}
          sub={`${l.perVisitorPerDay} per visitor`}
        />
        <Kpi
          icon={CircleCheck}
          label="Completed"
          value={stats.completed}
          sub={`${stats.running} running · ${stats.failed} failed · ${stats.appChecks} in-app`}
        />
        <Kpi
          icon={Wallet}
          label="Engine spend"
          value={formatUsd(stats.costUsd)}
          sub={`${formatUsd(stats.reservedUsd)} on the public budget · ≈${formatUsd(stats.estimatePerCheckUsd)}/check`}
        />
        <Kpi icon={FolderPlus} label="Turned into projects" value={stats.converted} sub="“Track this daily”" />
      </div>
    </Panel>
  );
}
