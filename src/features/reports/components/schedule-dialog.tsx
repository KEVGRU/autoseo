"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, ExternalLink, Loader2, Mail, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmButton, StatusBadge, TimeAgo } from "@/components/app/misc";
import { cn } from "@/lib/utils";
import type { ReportDeliveryDTO, ReportScheduleDTO } from "@/server/reports/schedules";
import {
  createReportScheduleAction,
  deleteReportScheduleAction,
  listReportSchedulesAction,
  pollReportSendAction,
  revokeReportDeliveryAction,
  sendReportScheduleNowAction,
  updateReportScheduleAction,
} from "../schedule-actions";
import {
  COMMON_TIME_ZONES,
  computeNextRun,
  describeSchedule,
  FORMAT_OPTIONS,
  formatAllowed,
  formatHour,
  parseRecipients,
  RANGE_PRESET_OPTIONS,
  WEEKDAYS,
  type ScheduleCadence,
  type ScheduleFormat,
  type ScheduleRangePreset,
} from "../lib/schedule";

/** Summary shown in the reports list ("Scheduled" column). */
export type ScheduleSummary = { count: number; active: number; nextRunAt: string | null };

export function summarizeSchedules(list: ReportScheduleDTO[]): ScheduleSummary {
  const active = list.filter((s) => s.enabled);
  const next = active.map((s) => s.nextRunAt).filter((x): x is string => !!x).sort()[0] ?? null;
  return { count: list.length, active: active.length, nextRunAt: next };
}

const STATUS_LABEL: Record<string, { status: string; label: string }> = {
  sent: { status: "success", label: "Sent" },
  logged: { status: "warning", label: "Logged (no SMTP)" },
  partial: { status: "warning", label: "Partly sent" },
  failed: { status: "failed", label: "Failed" },
  sending: { status: "running", label: "Sending" },
};

export function DeliveryStatus({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-muted-foreground">Not sent yet</span>;
  const s = STATUS_LABEL[status] ?? { status, label: status };
  return <StatusBadge status={s.status} label={s.label} />;
}

function formatInZone(iso: string | null, tz: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString();
  }
}

function browserZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function ScheduleDialog(props: {
  projectId: string;
  reportId: string;
  reportTitle: string;
  reportKind: "deck" | "html";
  /** reports.share (public link formats) / data.export (PPTX attached) — the server enforces the same. */
  access: ScheduleAccess;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onChanged?: (summary: ScheduleSummary) => void;
}) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule delivery</DialogTitle>
          <DialogDescription>
            Email “{props.reportTitle}” automatically — every send refreshes the data for its period and includes an expiring link and/or the PowerPoint.
          </DialogDescription>
        </DialogHeader>
        {props.open && <ScheduleBody {...props} />}
      </DialogContent>
    </Dialog>
  );
}

export type ScheduleAccess = { share: boolean; export: boolean };

function ScheduleBody({
  projectId,
  reportId,
  reportKind,
  access,
  onChanged,
}: {
  projectId: string;
  reportId: string;
  reportKind: "deck" | "html";
  access: ScheduleAccess;
  onChanged?: (summary: ScheduleSummary) => void;
}) {
  const allowed = (s: ReportScheduleDTO) => formatAllowed(s.format, access);
  const [data, setData] = useState<{ schedules: ReportScheduleDTO[]; deliveries: ReportDeliveryDTO[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ReportScheduleDTO | "new" | null>(null);
  const [sending, setSending] = useState<string | null>(null);

  const load = async () => {
    const res = await listReportSchedulesAction(projectId, reportId);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setData(res.data);
    onChanged?.(summarizeSchedules(res.data.schedules));
  };

  useEffect(() => {
    let cancelled = false;
    listReportSchedulesAction(projectId, reportId).then((res) => {
      if (cancelled) return;
      if (!res.ok) return setError(res.error);
      setData(res.data);
      if (!res.data.schedules.length) setEditing("new");
    });
    return () => {
      cancelled = true;
    };
  }, [projectId, reportId]);

  const toggle = async (s: ReportScheduleDTO, enabled: boolean) => {
    const res = await updateReportScheduleAction(projectId, s.id, { enabled });
    if (!res.ok) return void toast.error(res.error);
    toast.success(enabled ? "Schedule resumed" : "Schedule paused");
    await load();
  };

  const remove = async (s: ReportScheduleDTO) => {
    const res = await deleteReportScheduleAction(projectId, s.id);
    if (!res.ok) return void toast.error(res.error);
    toast.success("Schedule deleted");
    await load();
  };

  const revokeLink = async (d: ReportDeliveryDTO) => {
    const res = await revokeReportDeliveryAction(projectId, d.id);
    if (!res.ok) return void toast.error(res.error);
    toast.success("Link revoked");
    await load();
  };

  const sendNow = async (s: ReportScheduleDTO) => {
    setSending(s.id);
    try {
      const res = await sendReportScheduleNowAction(projectId, s.id);
      if (!res.ok) return void toast.error(res.error);
      const started = Date.now();
      while (Date.now() - started < 5 * 60_000) {
        await new Promise((r) => setTimeout(r, 1500));
        const poll = await pollReportSendAction(projectId, res.data.jobId);
        if (!poll.ok) return void toast.error(poll.error);
        if (poll.data.status === "failed" || poll.data.status === "cancelled") return void toast.error(poll.data.error ?? "Sending failed.");
        if (poll.data.status === "succeeded") {
          const r = (poll.data.result ?? {}) as { status?: string; delivered?: number; recipients?: number; error?: string | null; skipped?: string };
          if (r.skipped) toast.info(`Nothing sent (${r.skipped.replace(/_/g, " ")}).`);
          else if (r.status === "sent") toast.success(`Report sent to ${r.delivered} recipient${r.delivered === 1 ? "" : "s"}`);
          else if (r.status === "logged") toast.warning("SMTP isn't configured — the email was written to the server log (Admin → Email).");
          else if (r.status === "partial") toast.warning(`Sent to ${r.delivered} of ${r.recipients} recipients. ${r.error ?? ""}`);
          else toast.error(r.error ?? "Sending failed.");
          break;
        }
      }
      await load();
    } finally {
      setSending(null);
    }
  };

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!data)
    return (
      <div className="space-y-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );

  if (editing)
    return (
      <ScheduleForm
        projectId={projectId}
        reportId={reportId}
        reportKind={reportKind}
        access={access}
        initial={editing === "new" ? null : editing}
        onCancel={data.schedules.length ? () => setEditing(null) : undefined}
        onSaved={async () => {
          setEditing(null);
          await load();
        }}
      />
    );

  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
        {data.schedules.map((s) => (
          <div key={s.id} className={cn("rounded-xl border p-3.5", !s.enabled && "bg-muted/40")}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <CalendarClock className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-medium">{s.description}</span>
                  {!s.enabled && <StatusBadge status="disabled" label="Paused" />}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {s.formatLabel} · {s.rangeLabel} · link valid {s.linkExpiryDays} days
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {s.recipients.slice(0, 4).map((r) => (
                    <span key={r} className="inline-flex max-w-full items-center gap-1 truncate rounded-md bg-muted px-1.5 py-0.5 text-[11px]">
                      <Mail className="size-3 shrink-0 text-muted-foreground" /> <span className="truncate">{r}</span>
                    </span>
                  ))}
                  {s.recipients.length > 4 && <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px]">+{s.recipients.length - 4} more</span>}
                </div>
                <div className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Next send: </span>
                    <span className="tabular">{s.enabled ? formatInZone(s.nextRunAt, s.timezone) : "paused"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Last sent:</span> {s.lastSentAt ? <TimeAgo date={s.lastSentAt} /> : <span>—</span>}
                    {s.lastStatus && <DeliveryStatus status={s.lastStatus} />}
                  </div>
                </div>
                {s.lastError && s.lastStatus !== "sent" && <p className="mt-1.5 text-xs text-destructive">{s.lastError}</p>}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Switch
                      checked={s.enabled}
                      disabled={!s.enabled && !allowed(s)}
                      onCheckedChange={(v) => void toggle(s, v)}
                      aria-label={s.enabled ? "Pause schedule" : "Resume schedule"}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{s.enabled ? "Pause" : allowed(s) ? "Resume" : "You can't send this format (missing share / export permission)"}</TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-end gap-1.5 border-t pt-3">
              <ConfirmButton
                title="Delete this schedule?"
                description="Future sends stop. Links that were already emailed keep working until they expire — revoke them under Recent sends."
                confirmLabel="Delete"
                destructive
                onConfirm={() => remove(s)}
              >
                <Button size="sm" variant="ghost" className="text-muted-foreground">
                  <Trash2 /> Delete
                </Button>
              </ConfirmButton>
              <Button size="sm" variant="outline" disabled={!allowed(s)} onClick={() => setEditing(s)}>
                <Pencil /> Edit
              </Button>
              <Button size="sm" variant="outline" disabled={sending !== null || !allowed(s)} onClick={() => void sendNow(s)}>
                {sending === s.id ? <Loader2 className="animate-spin" /> : <Send />} Send now
              </Button>
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full border-dashed" onClick={() => setEditing("new")}>
          <Plus /> Add schedule
        </Button>
      </div>

      {data.deliveries.length > 0 && (
        <div>
          <div className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Recent sends</div>
          <div className="divide-y rounded-xl border">
            {data.deliveries.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-xs">
                <TimeAgo date={d.createdAt} className="w-24 shrink-0 text-muted-foreground" />
                <DeliveryStatus status={d.status} />
                <span className="min-w-0 flex-1 truncate">
                  {d.periodLabel ?? "—"} · {d.recipients.length} recipient{d.recipients.length === 1 ? "" : "s"}
                  {d.trigger === "manual" ? " · sent manually" : ""}
                </span>
                {d.shareUrl && access.share && (
                  <span className="inline-flex items-center gap-2">
                    <a href={d.shareUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand hover:underline">
                      Link <ExternalLink className="size-3" />
                    </a>
                    <ConfirmButton
                      title="Revoke this link?"
                      description="The emailed link stops working immediately. Recipients keep the attached PowerPoint, if any."
                      confirmLabel="Revoke"
                      destructive
                      onConfirm={() => revokeLink(d)}
                    >
                      <button type="button" className="text-muted-foreground hover:text-destructive hover:underline">
                        Revoke
                      </button>
                    </ConfirmButton>
                  </span>
                )}
                {d.error && d.status !== "sent" && <p className="w-full text-[11px] text-muted-foreground">{d.error}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type FormState = {
  cadence: ScheduleCadence;
  weekday: number;
  monthDay: number;
  hour: number;
  timezone: string;
  recipients: string;
  format: ScheduleFormat;
  rangePreset: ScheduleRangePreset;
  subject: string;
  message: string;
  linkExpiryDays: number;
};

const EXPIRY_OPTIONS = [7, 14, 30, 60, 90, 180, 365];

function ScheduleForm({
  projectId,
  reportId,
  reportKind,
  access,
  initial,
  onCancel,
  onSaved,
}: {
  projectId: string;
  reportId: string;
  reportKind: "deck" | "html";
  access: ScheduleAccess;
  initial: ReportScheduleDTO | null;
  onCancel?: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [tzDefault] = useState(browserZone);
  const [f, setF] = useState<FormState>(() =>
    initial
      ? {
          cadence: initial.cadence,
          weekday: initial.weekday,
          monthDay: initial.monthDay,
          hour: initial.hour,
          timezone: initial.timezone,
          recipients: initial.recipients.join(", "),
          format: initial.format,
          rangePreset: initial.rangePreset,
          subject: initial.subject ?? "",
          message: initial.message ?? "",
          linkExpiryDays: initial.linkExpiryDays,
        }
      : {
          cadence: "monthly",
          weekday: 1,
          monthDay: 1,
          hour: 8,
          timezone: tzDefault,
          recipients: "",
          format: reportKind === "html" ? "link" : ((["both", "link", "pptx"] as const).find((k) => formatAllowed(k, access)) ?? "link"),
          rangePreset: "last_month",
          subject: "",
          message: "",
          linkExpiryDays: 30,
        },
  );
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<FormState>) => setF((cur) => ({ ...cur, ...patch }));
  const zones = useMemo(() => [...new Set([f.timezone, tzDefault, ...COMMON_TIME_ZONES])], [f.timezone, tzDefault]);
  const parsed = parseRecipients(f.recipients);
  const next = useMemo(() => {
    try {
      return computeNextRun(f).toISOString();
    } catch {
      return null;
    }
  }, [f]);
  const formats = FORMAT_OPTIONS.filter((o) => (reportKind === "deck" || o.key === "link") && formatAllowed(o.key, access));
  const restricted = reportKind === "deck" && formats.length < FORMAT_OPTIONS.length;

  const submit = async () => {
    if (parsed.invalid.length) return void toast.error(`Not a valid email address: ${parsed.invalid.slice(0, 3).join(", ")}`);
    if (!parsed.valid.length) return void toast.error("Add at least one recipient.");
    setSaving(true);
    const input = {
      cadence: f.cadence,
      weekday: f.weekday,
      monthDay: f.monthDay,
      hour: f.hour,
      timezone: f.timezone,
      recipients: parsed.valid,
      format: f.format,
      rangePreset: f.rangePreset,
      subject: f.subject.trim() || null,
      message: f.message.trim() || null,
      linkExpiryDays: f.linkExpiryDays,
    };
    const res = initial ? await updateReportScheduleAction(projectId, initial.id, input) : await createReportScheduleAction(projectId, reportId, { ...input, enabled: true });
    setSaving(false);
    if (!res.ok) return void toast.error(res.error);
    toast.success(initial ? "Schedule updated" : "Report scheduled");
    await onSaved();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Frequency</Label>
          <div className="flex rounded-lg bg-muted p-0.5">
            {(["weekly", "monthly"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set({ cadence: c, rangePreset: c === "weekly" && f.rangePreset === "last_month" ? "last_week" : c === "monthly" && f.rangePreset === "last_week" ? "last_month" : f.rangePreset })}
                className={cn("flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors", f.cadence === c ? "bg-background shadow-xs" : "text-muted-foreground hover:text-foreground")}
              >
                {c === "weekly" ? "Weekly" : "Monthly"}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sched-day">{f.cadence === "weekly" ? "Day of week" : "Day of month"}</Label>
          {f.cadence === "weekly" ? (
            <NativeSelect id="sched-day" className="w-full" value={f.weekday} onChange={(e) => set({ weekday: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <NativeSelectOption key={d} value={d}>
                  {WEEKDAYS[d]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          ) : (
            <NativeSelect id="sched-day" className="w-full" value={f.monthDay} onChange={(e) => set({ monthDay: Number(e.target.value) })}>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                <NativeSelectOption key={d} value={d}>
                  {d}
                  {d > 28 ? " (or last day)" : ""}
                </NativeSelectOption>
              ))}
              <NativeSelectOption value={31}>Last day of the month</NativeSelectOption>
            </NativeSelect>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sched-hour">Time</Label>
          <NativeSelect id="sched-hour" className="w-full" value={f.hour} onChange={(e) => set({ hour: Number(e.target.value) })}>
            {Array.from({ length: 24 }, (_, h) => (
              <NativeSelectOption key={h} value={h}>
                {formatHour(h)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sched-tz">Time zone</Label>
          <NativeSelect id="sched-tz" className="w-full" value={f.timezone} onChange={(e) => set({ timezone: e.target.value })}>
            {zones.map((z) => (
              <NativeSelectOption key={z} value={z}>
                {z.replace(/_/g, " ")}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>
      <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
        {describeSchedule(f)} — next send <span className="font-medium text-foreground tabular">{formatInZone(next, f.timezone)}</span>
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="sched-to">Recipients</Label>
        <Textarea
          id="sched-to"
          rows={2}
          value={f.recipients}
          onChange={(e) => set({ recipients: e.target.value })}
          placeholder="client@example.com, team@agency.com"
          aria-invalid={parsed.invalid.length > 0}
        />
        <p className={cn("text-xs", parsed.invalid.length ? "text-destructive" : "text-muted-foreground")}>
          {parsed.invalid.length
            ? `Not valid: ${parsed.invalid.slice(0, 3).join(", ")}`
            : `${parsed.valid.length} recipient${parsed.valid.length === 1 ? "" : "s"} · separate with commas or new lines (max 25). Each recipient gets their own email.`}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="sched-range">Reporting period</Label>
          <NativeSelect id="sched-range" className="w-full" value={f.rangePreset} onChange={(e) => set({ rangePreset: e.target.value as ScheduleRangePreset })}>
            {RANGE_PRESET_OPTIONS.map((o) => (
              <NativeSelectOption key={o.key} value={o.key}>
                {o.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <p className="text-xs text-muted-foreground">{RANGE_PRESET_OPTIONS.find((o) => o.key === f.rangePreset)?.hint}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sched-expiry">Link valid for</Label>
          <NativeSelect
            id="sched-expiry"
            className="w-full"
            value={f.linkExpiryDays}
            disabled={f.format === "pptx"}
            onChange={(e) => set({ linkExpiryDays: Number(e.target.value) })}
          >
            {[...new Set([...EXPIRY_OPTIONS, f.linkExpiryDays])].sort((a, b) => a - b).map((d) => (
              <NativeSelectOption key={d} value={d}>
                {d} days
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <p className="text-xs text-muted-foreground">Each email gets its own read-only link, frozen with that period’s data.</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Delivery</Label>
        <div className="grid gap-2 sm:grid-cols-3">
          {formats.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => set({ format: o.key })}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                f.format === o.key ? "border-foreground/60 bg-muted/60 ring-1 ring-foreground/20" : "hover:bg-muted/40",
              )}
            >
              <div className="text-sm font-medium">{o.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{o.hint}</div>
            </button>
          ))}
        </div>
        {reportKind === "html" && <p className="text-xs text-muted-foreground">AI reports are sent as a link — PowerPoint export needs a slide report.</p>}
        {reportKind === "html" && !access.share && <p className="text-xs text-destructive">Sending AI reports needs the permission to share report links.</p>}
        {restricted && (
          <p className="text-xs text-muted-foreground">
            {!access.share ? "Public links need the share-reports permission. " : ""}
            {!access.export ? "Attaching the PowerPoint needs the export permission." : ""}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sched-subject">
          Subject <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input id="sched-subject" value={f.subject} maxLength={200} onChange={(e) => set({ subject: e.target.value })} placeholder="{{client.name}} — AI visibility report {{report.period}}" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sched-message">
          Message <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="sched-message"
          rows={3}
          maxLength={2000}
          value={f.message}
          onChange={(e) => set({ message: e.target.value })}
          placeholder="Hi team, here is this month's AI visibility report. Visibility moved {{ai.visibility_delta}}."
        />
        <p className="text-xs text-muted-foreground">Live fields like {"{{ai.visibility}}"} or {"{{report.period}}"} are filled in for every send.</p>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
        <Button onClick={() => void submit()} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <CalendarClock />} {initial ? "Save schedule" : "Schedule report"}
        </Button>
      </div>
    </div>
  );
}
