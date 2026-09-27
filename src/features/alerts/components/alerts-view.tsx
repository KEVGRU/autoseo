"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Bell,
  BellOff,
  Bot,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Info,
  Link2Off,
  Mail,
  Megaphone,
  MessageSquareWarning,
  OctagonAlert,
  Pencil,
  Play,
  Plus,
  ServerCrash,
  ShieldAlert,
  Swords,
  TrendingDown,
  TriangleAlert,
  Trash2,
  UserPlus,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KpiStrip } from "@/components/app/metrics";
import { Panel, TabNav } from "@/components/app/page";
import { EmptyState } from "@/components/app/empty-state";
import { ConfirmButton, TimeAgo } from "@/components/app/misc";
import type { Option } from "@/components/app/filters";
import { useUrlPatch } from "@/hooks/use-url-state";
import { cn } from "@/lib/utils";
import type { AlertKind, AlertSeverity } from "@/server/db/schema/alerts";
import type { PublicAlertEvent, PublicAlertRule } from "@/server/alerts/rules";
import { ALERT_KIND_GROUPS, ALERT_KIND_LIST, ALERT_KIND_META, SEVERITY_LABEL } from "../kinds";
import { ackAlertsAction, deleteAlertRuleAction, evaluateAlertsAction, updateAlertRuleAction } from "../actions";
import { RuleDialog, SlackGlyph } from "./rule-dialog";

const KIND_ICON: Record<AlertKind, LucideIcon> = {
  visibility_drop: TrendingDown,
  sov_drop: TrendingDown,
  position_drop: TrendingDown,
  sentiment_drop: TrendingDown,
  competitor_overtake: Swords,
  new_competitor: UserPlus,
  criticism_spike: MessageSquareWarning,
  new_ad: Megaphone,
  citation_lost: Link2Off,
  fact_check_deviation: ShieldAlert,
  crawler_missing: Bot,
  bot_error_spike: ServerCrash,
  ai_traffic_drop: TrendingDown,
  run_failed: CircleX,
};

const SEVERITY_STYLE: Record<AlertSeverity, { icon: LucideIcon; tone: string; ring: string }> = {
  critical: { icon: OctagonAlert, tone: "bg-destructive/10 text-destructive", ring: "ring-destructive/25" },
  warning: { icon: TriangleAlert, tone: "bg-warning/15 text-warning", ring: "ring-warning/30" },
  info: { icon: Info, tone: "bg-info/12 text-info", ring: "ring-info/25" },
};

export type AlertsViewProps = {
  projectId: string;
  canManage: boolean;
  tab: "alerts" | "rules";
  status: "all" | "open" | "acknowledged";
  kind: AlertKind | null;
  events: PublicAlertEvent[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  counts: { total: number; open: number; critical: number; last7d: number };
  rules: PublicAlertRule[];
  engines: Option[];
  tags: Option[];
  webhookEndpoints: number;
  focusEventId: string | null;
};

export function AlertsView(props: AlertsViewProps) {
  const { projectId, canManage, tab, rules, counts } = props;
  const [dialog, setDialog] = useState<{ open: boolean; rule: PublicAlertRule | null }>({ open: false, rule: null });
  const base = `/p/${projectId}/alerts`;
  const activeRules = rules.filter((r) => r.active).length;

  return (
    <div className="space-y-4 sm:space-y-5">
      <KpiStrip
        items={[
          { key: "open", label: "Open alerts", value: counts.open, hint: "Fired and not acknowledged yet." },
          { key: "critical", label: "Critical open", value: counts.critical },
          { key: "week", label: "Fired · 7 days", value: counts.last7d },
          { key: "rules", label: "Active rules", value: `${activeRules}/${rules.length}` },
        ]}
      />
      <TabNav
        active={tab}
        tabs={[
          {
            key: "alerts",
            label: "Alerts",
            href: base,
            badge: counts.open ? <span className="ml-1.5 rounded-full bg-foreground px-1.5 py-px text-[10px] font-semibold text-background tabular">{counts.open}</span> : null,
          },
          { key: "rules", label: "Rules", href: `${base}?tab=rules`, badge: <span className="ml-1.5 text-xs text-muted-foreground tabular">{rules.length}</span> },
        ]}
      />
      {tab === "alerts" ? <EventsFeed {...props} /> : <RulesList {...props} onEdit={(rule) => setDialog({ open: true, rule })} onNew={() => setDialog({ open: true, rule: null })} />}
      {canManage && (
        <RuleDialog
          projectId={projectId}
          open={dialog.open}
          onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
          rule={dialog.rule}
          engines={props.engines}
          tags={props.tags}
          webhookEndpoints={props.webhookEndpoints}
        />
      )}
    </div>
  );
}

export function EvaluateButton({ projectId, ruleIds, label = "Evaluate now", variant = "outline" }: { projectId: string; ruleIds?: string[]; label?: string; variant?: "outline" | "ghost" }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant={variant}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await evaluateAlertsAction(projectId, ruleIds);
          if (!res.ok) return void toast.error(res.error);
          const { evaluated, fired, deferred, errors } = res.data;
          if (errors.length) toast.error(`Evaluation error: ${errors[0]}`);
          if (fired.length) toast.success(`${fired.length} new alert${fired.length === 1 ? "" : "s"}`, { description: fired.map((f) => f.title).join(" · ").slice(0, 200) });
          else toast.message(`${evaluated} rule${evaluated === 1 ? "" : "s"} checked — nothing new${deferred ? ` (${deferred} held back by cooldown)` : ""}`);
          router.refresh();
        })
      }
    >
      <Play className={cn("size-3.5", pending && "animate-pulse")} /> {pending ? "Evaluating…" : label}
    </Button>
  );
}

/* ─────────────────────────── Events feed ─────────────────────────── */

function EventsFeed({ projectId, canManage, status, kind, events, pagination, counts, focusEventId, rules }: AlertsViewProps) {
  const [patch, pending] = useUrlPatch();
  const router = useRouter();
  const [acking, startAck] = useTransition();
  const ack = (ids: string[] | "all") =>
    startAck(async () => {
      const res = await ackAlertsAction(projectId, ids);
      if (!res.ok) return void toast.error(res.error);
      toast.success(ids === "all" ? `${res.data} alert${res.data === 1 ? "" : "s"} acknowledged` : "Acknowledged");
      router.refresh();
    });

  useEffect(() => {
    if (!focusEventId) return;
    document.getElementById(`alert-${focusEventId}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focusEventId]);

  const filtered = status !== "all" || kind;

  return (
    <div className={cn("space-y-3", pending && "opacity-70 transition-opacity")}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg bg-muted p-0.5">
          {(
            [
              ["all", "All"],
              ["open", `Open${counts.open ? ` · ${counts.open}` : ""}`],
              ["acknowledged", "Acknowledged"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => patch({ status: key === "all" ? null : key, page: null, event: null })}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors",
                status === key ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <Select value={kind ?? "all"} onValueChange={(v) => patch({ kind: v === "all" ? null : v, page: null, event: null })}>
          <SelectTrigger size="sm" className="h-8 w-auto min-w-40 bg-card text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All kinds</SelectItem>
            {ALERT_KIND_LIST.map((k) => (
              <SelectItem key={k} value={k}>
                {ALERT_KIND_META[k].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canManage && counts.open > 0 && (
          <Button size="sm" variant="ghost" className="ml-auto h-8" disabled={acking} onClick={() => ack("all")}>
            <CheckCheck className="size-3.5" /> Acknowledge all
          </Button>
        )}
      </div>

      {events.length === 0 ? (
        <Panel>
          <EmptyState
            icon={filtered ? BellOff : Bell}
            title={filtered ? "No alerts match this filter" : "No alerts yet"}
            description={
              filtered
                ? "Try another status or kind."
                : rules.some((r) => r.active)
                  ? `${rules.filter((r) => r.active).length} active rules are checked every hour and after each tracking run. You'll see alerts here, in the bell menu and on the channels you chose.`
                  : "All rules are paused. Enable or create a rule to start monitoring."
            }
            action={
              filtered ? (
                <Button size="sm" variant="outline" onClick={() => patch({ status: null, kind: null, page: null })}>
                  Clear filters
                </Button>
              ) : (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/p/${projectId}/alerts?tab=rules`}>Manage rules</Link>
                </Button>
              )
            }
          />
        </Panel>
      ) : (
        <div className="space-y-2.5">
          {events.map((e, i) => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: Math.min(i, 10) * 0.02 }}>
              <EventCard event={e} canManage={canManage} focused={e.id === focusEventId} busy={acking} onAck={() => ack([e.id])} />
            </motion.div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="tabular">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} alerts
          </span>
          <div className="flex gap-1">
            <Button size="icon" variant="outline" className="size-8" disabled={pagination.page <= 1} onClick={() => patch({ page: pagination.page - 1 > 1 ? String(pagination.page - 1) : null })} aria-label="Previous page">
              <ChevronLeft className="size-4" />
            </Button>
            <Button size="icon" variant="outline" className="size-8" disabled={pagination.page >= pagination.totalPages} onClick={() => patch({ page: String(pagination.page + 1) })} aria-label="Next page">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ event, canManage, focused, busy, onAck }: { event: PublicAlertEvent; canManage: boolean; focused: boolean; busy: boolean; onAck: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY_STYLE[event.severity];
  const SevIcon = sev.icon;
  const KindIcon = KIND_ICON[event.kind];
  const items = event.payload.items ?? [];
  const shown = expanded ? items : items.slice(0, 3);
  const acked = Boolean(event.ackAt);
  const d = event.delivery;
  return (
    <article
      id={`alert-${event.id}`}
      className={cn(
        "rounded-2xl border bg-card p-4 shadow-soft transition-shadow",
        acked && "bg-card/60",
        focused && "ring-2 ring-foreground/20",
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset", sev.tone, sev.ring, acked && "opacity-60")}>
          <SevIcon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 font-medium text-foreground/80">
              <KindIcon className="size-3" /> {event.kindLabel}
            </span>
            <span className={cn("font-medium", event.severity === "critical" ? "text-destructive" : event.severity === "warning" ? "text-warning" : "text-info")}>
              {SEVERITY_LABEL[event.severity]}
            </span>
            {event.ruleName && <span className="truncate">· {event.ruleName}</span>}
            <span>·</span>
            <TimeAgo date={event.firedAt} />
          </div>
          <h3 className={cn("mt-1.5 text-sm font-semibold text-balance", acked && "text-foreground/70")}>{event.title}</h3>
          {event.body && <p className="mt-1 text-sm text-muted-foreground">{event.body}</p>}
          {items.length > 0 && (
            <ul className="mt-2.5 space-y-1.5">
              {shown.map((it) => (
                <li key={it.key} className="rounded-lg bg-muted/50 px-3 py-2 text-xs">
                  <div className="font-medium break-words text-foreground">{it.label}</div>
                  {it.detail && <div className="mt-0.5 break-words text-muted-foreground">{it.detail}</div>}
                </li>
              ))}
              {items.length > 3 && (
                <li>
                  <button type="button" className="text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => setExpanded((v) => !v)}>
                    {expanded ? "Show less" : `Show ${items.length - 3} more`}
                  </button>
                </li>
              )}
            </ul>
          )}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-muted-foreground">
              {d.inApp ? <DeliveryChip icon={<Bell className="size-3" />} label={`${d.inApp} notified in-app`} /> : null}
              {d.emails ? <DeliveryChip icon={<Mail className="size-3" />} label={`${d.emails.sent} email${d.emails.sent === 1 ? "" : "s"} sent${d.emails.failed ? `, ${d.emails.failed} not sent` : ""}`} bad={d.emails.failed > 0} /> : null}
              {d.slack ? <DeliveryChip icon={<SlackGlyph className="size-3" />} label={d.slack === "sent" ? "Slack" : "Slack failed"} bad={d.slack === "failed"} /> : null}
              {d.webhook ? <DeliveryChip icon={<Webhook className="size-3" />} label="Webhook" /> : null}
              {d.error ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-warning underline decoration-dotted underline-offset-2">Delivery note</span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-72">{d.error}</TooltipContent>
                </Tooltip>
              ) : null}
            </div>
            <div className="flex items-center gap-1.5">
              {event.href && (
                <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                  <Link href={event.href}>
                    Investigate <ArrowUpRight className="size-3" />
                  </Link>
                </Button>
              )}
              {acked ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Check className="size-3" /> Acknowledged
                </span>
              ) : canManage ? (
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={busy} onClick={onAck}>
                  <Check className="size-3" /> Acknowledge
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function DeliveryChip({ icon, label, bad }: { icon: React.ReactNode; label: string; bad?: boolean }) {
  return <span className={cn("inline-flex items-center gap-1", bad && "text-destructive")}>{icon}{label}</span>;
}

/* ─────────────────────────── Rules ─────────────────────────── */

function RulesList({ projectId, canManage, rules, onEdit, onNew }: AlertsViewProps & { onEdit: (r: PublicAlertRule) => void; onNew: () => void }) {
  const grouped = useMemo(
    () => ALERT_KIND_GROUPS.map((g) => ({ group: g, rules: rules.filter((r) => ALERT_KIND_META[r.kind].group === g) })).filter((g) => g.rules.length),
    [rules],
  );
  if (!rules.length) {
    return (
      <Panel>
        <EmptyState
          icon={BellOff}
          title="No alert rules"
          description="Create a rule to get notified about visibility drops, new competitors, lost citations, missing AI crawlers and more."
          action={canManage ? { label: "New rule", onClick: onNew } : undefined}
        />
      </Panel>
    );
  }
  return (
    <div className="space-y-5">
      {canManage && (
        <div className="flex justify-end">
          <Button size="sm" onClick={onNew}>
            <Plus className="size-3.5" /> New rule
          </Button>
        </div>
      )}
      {grouped.map(({ group, rules: list }) => (
        <section key={group} className="space-y-2">
          <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{group}</h2>
          <div className="grid gap-2.5 lg:grid-cols-2">
            {list.map((r) => (
              <RuleCard key={r.id} projectId={projectId} rule={r} canManage={canManage} onEdit={() => onEdit(r)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function RuleCard({ projectId, rule, canManage, onEdit }: { projectId: string; rule: PublicAlertRule; canManage: boolean; onEdit: () => void }) {
  const router = useRouter();
  const [active, setActive] = useState(rule.active);
  const [pending, start] = useTransition();
  const [synced, setSynced] = useState(rule.active);
  if (rule.active !== synced) {
    setSynced(rule.active);
    setActive(rule.active);
  }
  const KindIcon = KIND_ICON[rule.kind];
  const toggle = (v: boolean) => {
    setActive(v);
    start(async () => {
      const res = await updateAlertRuleAction(projectId, rule.id, { active: v });
      if (!res.ok) {
        setActive(!v);
        return void toast.error(res.error);
      }
      router.refresh();
    });
  };
  const remove = async () => {
    const res = await deleteAlertRuleAction(projectId, rule.id);
    if (!res.ok) return void toast.error(res.error);
    toast.success("Rule deleted");
    router.refresh();
  };
  const ch = rule.channels;
  return (
    <article className={cn("flex h-full flex-col rounded-2xl border bg-card p-4 shadow-soft", !active && "bg-card/60")}>
      <div className="flex items-start gap-3">
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl border bg-background", !active && "opacity-50")}>
          <KindIcon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className={cn("truncate text-sm font-semibold", !active && "text-foreground/60")}>{rule.name}</h3>
            {rule.isDefault && <span className="shrink-0 rounded-full bg-muted px-1.5 py-px text-[10px] text-muted-foreground">Default</span>}
          </div>
          <p className="text-xs text-muted-foreground">
            {rule.kindLabel} · {rule.summary}
          </p>
        </div>
        <Switch checked={active} onCheckedChange={toggle} disabled={!canManage || pending} aria-label={active ? "Pause rule" : "Enable rule"} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {ch.inApp && <ChannelBadge icon={<Bell className="size-3" />} label="In-app" />}
        {ch.emails.length > 0 && <ChannelBadge icon={<Mail className="size-3" />} label={`${ch.emails.length} email${ch.emails.length === 1 ? "" : "s"}`} title={ch.emails.join(", ")} />}
        {ch.slack && <ChannelBadge icon={<SlackGlyph className="size-3" />} label="Slack" title={ch.slackHint ?? undefined} />}
        {ch.webhook && <ChannelBadge icon={<Webhook className="size-3" />} label="Webhook" />}
        {!ch.inApp && !ch.emails.length && !ch.slack && !ch.webhook && <span className="text-[11px] text-warning">No channel — alerts only show on this page</span>}
        <span className="text-[11px] text-muted-foreground">· cooldown {rule.cooldownHours ? `${rule.cooldownHours}h` : "off"}</span>
      </div>
      {(rule.lastError || rule.note) && (
        <p className={cn("mt-2 rounded-lg px-2.5 py-1.5 text-[11px]", rule.lastError ? "bg-destructive/10 text-destructive" : "bg-muted/60 text-muted-foreground")}>
          {rule.lastError ? `Last evaluation failed: ${rule.lastError}` : rule.note}
        </p>
      )}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3 text-[11px] text-muted-foreground">
        <span>
          {rule.lastFiredAt ? (
            <>
              Last fired <TimeAgo date={rule.lastFiredAt} />
            </>
          ) : (
            "Never fired"
          )}
          {rule.lastEvaluatedAt && (
            <>
              {" "}· checked <TimeAgo date={rule.lastEvaluatedAt} />
            </>
          )}
        </span>
        {canManage && (
          <div className="flex items-center gap-1">
            {active && <EvaluateButton projectId={projectId} ruleIds={[rule.id]} label="Run" variant="ghost" />}
            <Button size="sm" variant="ghost" className="h-8" onClick={onEdit}>
              <Pencil className="size-3.5" /> Edit
            </Button>
            <ConfirmButton title={`Delete “${rule.name}”?`} description="Alerts it already fired stay in the history." confirmLabel="Delete" destructive onConfirm={remove}>
              <Button size="icon" variant="ghost" className="size-8 text-muted-foreground hover:text-destructive" aria-label="Delete rule">
                <Trash2 className="size-3.5" />
              </Button>
            </ConfirmButton>
          </div>
        )}
      </div>
    </article>
  );
}

function ChannelBadge({ icon, label, title }: { icon: React.ReactNode; label: string; title?: string }) {
  return (
    <span title={title} className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-[11px] text-foreground/80">
      {icon}
      {label}
    </span>
  );
}
