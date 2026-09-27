"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  KeyRound,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Webhook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Panel } from "@/components/app/page";
import { EmptyState } from "@/components/app/empty-state";
import { ConfirmButton, CopyButton, StatusBadge, TimeAgo } from "@/components/app/misc";
import { cn } from "@/lib/utils";
import { ALL_EVENTS, WEBHOOK_EVENT_GROUPS, WEBHOOK_EVENT_META, WEBHOOK_EVENTS, type WebhookEventName } from "@/server/webhooks/events";
import type { PublicWebhookDelivery, PublicWebhookEndpoint } from "@/server/webhooks/endpoints";
import {
  createWebhookAction,
  deleteWebhookAction,
  listWebhookDeliveriesAction,
  replayWebhookDeliveryAction,
  rotateWebhookSecretAction,
  sendWebhookTestEventAction,
  updateWebhookAction,
} from "../webhook-actions";

const VERIFY_SNIPPET = `// Node.js — verify an AutoSEO webhook
import crypto from "node:crypto";

function verify(req, rawBody, secret) {
  const ts = req.headers["x-autoseo-timestamp"];
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(\`\${ts}.\${rawBody}\`).digest("hex");
  const given = req.headers["x-autoseo-signature"] ?? "";
  const fresh = Math.abs(Date.now() / 1000 - Number(ts)) < 300;
  return fresh && given.length === expected.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}`;

function hostOf(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function eventSummary(events: string[]) {
  if (events.includes(ALL_EVENTS)) return "All events";
  if (events.length === 1) return WEBHOOK_EVENT_META[events[0] as WebhookEventName]?.label ?? events[0];
  return `${events.length} events`;
}

export function WebhooksPanel({ projectId, endpoints, canManage }: { projectId: string; endpoints: PublicWebhookEndpoint[]; canManage: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<{ open: boolean; endpoint: PublicWebhookEndpoint | null }>({ open: false, endpoint: null });
  const [secret, setSecret] = useState<{ secret: string; label: string } | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <section id="webhooks" className="scroll-mt-24">
      <Panel
        title="Webhooks"
        icon={<Webhook className="size-4 text-muted-foreground" />}
        description="Send AutoSEO events to Zapier, Make, n8n or your own endpoint — signed, retried and logged."
        actions={
          canManage ? (
            <Button size="sm" onClick={() => setEditing({ open: true, endpoint: null })}>
              <Plus className="size-3.5" /> Add endpoint
            </Button>
          ) : null
        }
        contentClassName="p-0 sm:p-0"
      >
        {!canManage ? (
          <p className="px-4 py-4 text-sm text-muted-foreground sm:px-5">Only members who can manage integrations see and edit webhook endpoints.</p>
        ) : endpoints.length === 0 ? (
          <EmptyState
            compact
            icon={Webhook}
            title="No webhook endpoints yet"
            description="Add a receiver URL and choose events — tracking runs, alerts, published content, fact-check deviations, attribution answers, audits and tasks."
            action={{ label: "Add endpoint", onClick: () => setEditing({ open: true, endpoint: null }) }}
          />
        ) : (
          <ul className="divide-y">
            {endpoints.map((e) => (
              <EndpointRow
                key={e.id}
                projectId={projectId}
                endpoint={e}
                onEdit={() => setEditing({ open: true, endpoint: e })}
                onSecret={(s) => setSecret({ secret: s, label: e.name || hostOf(e.url) })}
                onChanged={() => router.refresh()}
              />
            ))}
          </ul>
        )}
        {canManage && (
          <div className="border-t px-4 py-3 sm:px-5">
            <button type="button" className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => setShowHelp((v) => !v)}>
              {showHelp ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />} Using Zapier, Make or n8n · verifying signatures
            </button>
            {showHelp && <UsageNote />}
          </div>
        )}
      </Panel>

      {canManage && (
        <EndpointDialog
          projectId={projectId}
          open={editing.open}
          endpoint={editing.endpoint}
          onOpenChange={(open) => setEditing((s) => ({ ...s, open }))}
          onCreated={(ep, s) => setSecret({ secret: s, label: ep.name || hostOf(ep.url) })}
          onSaved={() => router.refresh()}
        />
      )}
      <Dialog open={!!secret} onOpenChange={(v) => !v && setSecret(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-4" /> Signing secret
            </DialogTitle>
            <DialogDescription>
              For <b>{secret?.label}</b>. Copy it now — it is stored encrypted and <b>won&apos;t be shown again</b>. Use it to verify the{" "}
              <code className="text-xs">X-AutoSEO-Signature</code> header.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-2">
            <code className="min-w-0 flex-1 truncate font-mono text-xs select-all">{secret?.secret}</code>
            {secret && <CopyButton value={secret.secret} />}
          </div>
          <DialogFooter>
            <Button onClick={() => setSecret(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function UsageNote() {
  return (
    <div className="mt-3 space-y-3 text-xs text-muted-foreground">
      <ul className="grid gap-2 sm:grid-cols-3">
        <li className="rounded-lg border bg-background p-3">
          <div className="font-medium text-foreground">Zapier</div>
          Trigger <b>Webhooks by Zapier → Catch Hook</b>, paste its URL here, then “Send test event” so Zapier can map the fields.
        </li>
        <li className="rounded-lg border bg-background p-3">
          <div className="font-medium text-foreground">Make</div>
          Add a <b>Webhooks → Custom webhook</b> module, copy the address here and use “Send test event” to determine the data structure.
        </li>
        <li className="rounded-lg border bg-background p-3">
          <div className="font-medium text-foreground">n8n</div>
          Use a <b>Webhook</b> trigger node (HTTP method POST, production URL). Self-hosted on your LAN? An instance admin must allow the host under Admin → Authentication.
        </li>
      </ul>
      <p>
        Every POST is JSON <code>{"{ id, event, createdAt, test, project, data }"}</code> with headers <code>X-AutoSEO-Event</code>, <code>X-AutoSEO-Event-Id</code> (dedupe on it),{" "}
        <code>X-AutoSEO-Delivery</code>, <code>X-AutoSEO-Timestamp</code> and <code>X-AutoSEO-Signature</code>. Answer with any 2xx within 15 s; other responses are retried for about
        1.5 hours with exponential backoff. HTTP 410 unsubscribes; an endpoint that keeps failing for a day (5+ failed deliveries) is switched off. Manage endpoints via REST too: <code>/api/v1/projects/{"{projectId}"}/webhooks</code>.
      </p>
      <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-[11px] leading-relaxed text-foreground">{VERIFY_SNIPPET}</pre>
    </div>
  );
}

function EndpointRow({
  projectId,
  endpoint,
  onEdit,
  onSecret,
  onChanged,
}: {
  projectId: string;
  endpoint: PublicWebhookEndpoint;
  onEdit: () => void;
  onSecret: (secret: string) => void;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [deliveries, setDeliveries] = useState<PublicWebhookDelivery[] | null>(null);
  const [loading, startLoad] = useTransition();
  const [busy, startBusy] = useTransition();
  const [testEvent, setTestEvent] = useState<WebhookEventName>(
    (endpoint.events.find((e) => e !== ALL_EVENTS) as WebhookEventName | undefined) ?? "alert.triggered",
  );

  const load = () =>
    startLoad(async () => {
      const res = await listWebhookDeliveriesAction(projectId, endpoint.id);
      if (!res.ok) return void toast.error(res.error);
      setDeliveries(res.data);
    });

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && !deliveries) load();
  };

  const sendTest = () =>
    startBusy(async () => {
      const res = await sendWebhookTestEventAction(projectId, endpoint.id, testEvent);
      if (!res.ok) return void toast.error(res.error);
      const d = res.data;
      if (d.status === "succeeded") toast.success(`Test event delivered (HTTP ${d.responseCode}, ${d.durationMs} ms)`);
      else toast.error(`Test event failed: ${d.error ?? `HTTP ${d.responseCode}`}`);
      if (open) load();
      onChanged();
    });

  const toggleActive = (active: boolean) =>
    startBusy(async () => {
      const res = await updateWebhookAction(projectId, endpoint.id, { active });
      if (!res.ok) return void toast.error(res.error);
      toast.success(active ? "Endpoint enabled" : "Endpoint paused");
      onChanged();
    });

  const rotate = async () => {
    const res = await rotateWebhookSecretAction(projectId, endpoint.id);
    if (!res.ok) return void toast.error(res.error);
    onSecret(res.data);
    onChanged();
  };

  const remove = async () => {
    const res = await deleteWebhookAction(projectId, endpoint.id);
    if (!res.ok) return void toast.error(res.error);
    toast.success("Endpoint deleted");
    onChanged();
  };

  const status = endpoint.active ? "active" : endpoint.disabledReason ? "error" : "disabled";

  return (
    <li className="px-4 py-3.5 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold">{endpoint.name || hostOf(endpoint.url)}</span>
            <StatusBadge status={status} label={endpoint.active ? "Active" : endpoint.disabledReason ? "Switched off" : "Paused"} />
            <span className="rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground" title={endpoint.events.join(", ")}>
              {eventSummary(endpoint.events)}
            </span>
          </div>
          <div className="mt-0.5 truncate font-mono text-xs text-muted-foreground" title={endpoint.url}>
            {endpoint.url}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            <span>
              Secret <span className="font-mono">{endpoint.secretPrefix}</span>
            </span>
            <span>
              Last delivery {endpoint.lastDeliveredAt ? <TimeAgo date={endpoint.lastDeliveredAt} /> : "—"}
            </span>
            {endpoint.failureCount > 0 && <span className="text-warning">{endpoint.failureCount} failed in a row</span>}
          </div>
          {(endpoint.disabledReason || (endpoint.lastError && endpoint.failureCount > 0)) && (
            <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-destructive">
              <TriangleAlert className="mt-px size-3 shrink-0" /> {endpoint.disabledReason ?? endpoint.lastError}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Switch checked={endpoint.active} onCheckedChange={toggleActive} disabled={busy} aria-label={endpoint.active ? "Pause endpoint" : "Enable endpoint"} />
          <Select value={testEvent} onValueChange={(v) => setTestEvent(v as WebhookEventName)}>
            <SelectTrigger size="sm" className="h-8 w-[150px] text-xs" aria-label="Test event type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WEBHOOK_EVENT_GROUPS.map((g) => (
                <SelectGroup key={g}>
                  <SelectLabel>{g}</SelectLabel>
                  {WEBHOOK_EVENTS.filter((e) => WEBHOOK_EVENT_META[e].group === g).map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-8" disabled={busy} onClick={sendTest}>
            <Send className="size-3.5" /> Send test
          </Button>
          <Button size="icon" variant="ghost" className="size-8" onClick={onEdit} aria-label="Edit endpoint">
            <Pencil className="size-3.5" />
          </Button>
          <ConfirmButton
            title="Rotate signing secret?"
            description="A new secret is generated and shown once. Deliveries signed with the old secret stop verifying immediately."
            confirmLabel="Rotate"
            onConfirm={rotate}
          >
            <Button size="icon" variant="ghost" className="size-8" aria-label="Rotate secret">
              <KeyRound className="size-3.5" />
            </Button>
          </ConfirmButton>
          <ConfirmButton title="Delete this endpoint?" description="Its delivery log is deleted too." confirmLabel="Delete" destructive onConfirm={remove}>
            <Button size="icon" variant="ghost" className="size-8 text-muted-foreground hover:text-destructive" aria-label="Delete endpoint">
              <Trash2 className="size-3.5" />
            </Button>
          </ConfirmButton>
        </div>
      </div>
      <button type="button" onClick={toggleOpen} className="mt-2 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />} Delivery log
      </button>
      {open && <DeliveryLog projectId={projectId} deliveries={deliveries} loading={loading} onReload={load} />}
    </li>
  );
}

function DeliveryLog({
  projectId,
  deliveries,
  loading,
  onReload,
}: {
  projectId: string;
  deliveries: PublicWebhookDelivery[] | null;
  loading: boolean;
  onReload: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replaying, startReplay] = useTransition();
  const replay = (id: string) =>
    startReplay(async () => {
      const res = await replayWebhookDeliveryAction(projectId, id);
      if (!res.ok) return void toast.error(res.error);
      toast.success("Replay queued");
      setTimeout(onReload, 1500);
    });

  return (
    <div className="mt-2 rounded-xl border bg-muted/20">
      <div className="flex items-center justify-between border-b px-3 py-2 text-[11px] text-muted-foreground">
        <span>Last 50 deliveries · kept 30 days</span>
        <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" disabled={loading} onClick={onReload}>
          <RefreshCw className={cn("size-3", loading && "animate-spin")} /> Refresh
        </Button>
      </div>
      {!deliveries ? (
        <p className="px-3 py-4 text-xs text-muted-foreground">Loading…</p>
      ) : deliveries.length === 0 ? (
        <p className="px-3 py-4 text-xs text-muted-foreground">No deliveries yet. Send a test event or wait for the next subscribed event.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-xs">
            <thead className="text-left text-[11px] text-muted-foreground">
              <tr className="border-b">
                <th className="px-3 py-1.5 font-medium">When</th>
                <th className="px-3 py-1.5 font-medium">Event</th>
                <th className="px-3 py-1.5 font-medium">Status</th>
                <th className="px-3 py-1.5 text-right font-medium">HTTP</th>
                <th className="px-3 py-1.5 text-right font-medium">Tries</th>
                <th className="px-3 py-1.5 text-right font-medium">Time</th>
                <th className="px-3 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <Fragment key={d.id}>
                  <tr className="cursor-pointer border-b last:border-0 hover:bg-muted/40" onClick={() => setExpanded((x) => (x === d.id ? null : d.id))}>
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      <TimeAgo date={d.createdAt} />
                    </td>
                    <td className="px-3 py-1.5 font-mono whitespace-nowrap">
                      {d.event}
                      {d.test && <span className="ml-1.5 rounded bg-muted px-1 text-[10px] text-muted-foreground">test</span>}
                      {d.replayOf && <span className="ml-1.5 rounded bg-muted px-1 text-[10px] text-muted-foreground">replay</span>}
                    </td>
                    <td className="px-3 py-1.5">
                      <StatusBadge status={d.status === "succeeded" ? "success" : d.status === "failed" ? "failed" : d.status === "retrying" ? "warning" : "pending"} label={d.status} />
                    </td>
                    <td className="px-3 py-1.5 text-right tabular">{d.responseCode ?? "—"}</td>
                    <td className="px-3 py-1.5 text-right tabular">{d.attempt}</td>
                    <td className="px-3 py-1.5 text-right tabular">{d.durationMs != null ? `${d.durationMs} ms` : "—"}</td>
                    <td className="px-3 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" disabled={replaying} onClick={() => replay(d.id)}>
                        <RotateCcw className="size-3" /> Replay
                      </Button>
                    </td>
                  </tr>
                  {expanded === d.id && (
                    <tr className="border-b bg-background">
                      <td colSpan={7} className="space-y-2 px-3 py-2">
                        {d.error && <p className="text-destructive">{d.error}</p>}
                        {d.responseBody && (
                          <div>
                            <div className="mb-0.5 text-[11px] text-muted-foreground">Response</div>
                            <pre className="max-h-32 overflow-auto rounded bg-muted p-2 font-mono text-[11px] whitespace-pre-wrap">{d.responseBody}</pre>
                          </div>
                        )}
                        <div>
                          <div className="mb-0.5 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Payload · event id {d.eventId}</span>
                            <CopyButton value={JSON.stringify(d.payload ?? {}, null, 2)} size="icon" />
                          </div>
                          <pre className="max-h-72 overflow-auto rounded bg-muted p-2 font-mono text-[11px]">{JSON.stringify(d.payload ?? {}, null, 2)}</pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EndpointDialog({
  projectId,
  open,
  endpoint,
  onOpenChange,
  onCreated,
  onSaved,
}: {
  projectId: string;
  open: boolean;
  endpoint: PublicWebhookEndpoint | null;
  onOpenChange: (v: boolean) => void;
  onCreated: (endpoint: PublicWebhookEndpoint, secret: string) => void;
  onSaved: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        {open && (
          <EndpointForm
            key={endpoint?.id ?? "new"}
            projectId={projectId}
            endpoint={endpoint}
            onDone={(ep, secret) => {
              onOpenChange(false);
              if (secret) onCreated(ep, secret);
              onSaved();
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EndpointForm({
  projectId,
  endpoint,
  onDone,
  onCancel,
}: {
  projectId: string;
  endpoint: PublicWebhookEndpoint | null;
  onDone: (endpoint: PublicWebhookEndpoint, secret?: string) => void;
  onCancel: () => void;
}) {
  const [pending, start] = useTransition();
  const [url, setUrl] = useState(endpoint?.url ?? "");
  const [name, setName] = useState(endpoint?.name ?? "");
  const [all, setAll] = useState(endpoint ? endpoint.events.includes(ALL_EVENTS) : false);
  const [events, setEvents] = useState<WebhookEventName[]>(
    endpoint ? (endpoint.events.filter((e) => e !== ALL_EVENTS) as WebhookEventName[]) : ["alert.triggered", "tracking.run_completed"],
  );

  const toggle = (e: WebhookEventName, on: boolean) => setEvents((cur) => (on ? [...new Set([...cur, e])] : cur.filter((x) => x !== e)));
  const selected: (WebhookEventName | typeof ALL_EVENTS)[] = all ? [ALL_EVENTS] : events;
  const urlOk = /^https?:\/\/\S+$/i.test(url.trim());

  const submit = () =>
    start(async () => {
      if (endpoint) {
        const res = await updateWebhookAction(projectId, endpoint.id, { url: url.trim(), name: name.trim(), events: selected });
        if (!res.ok) return void toast.error(res.error);
        toast.success("Endpoint saved");
        onDone(res.data);
      } else {
        const res = await createWebhookAction(projectId, { url: url.trim(), name: name.trim(), events: selected });
        if (!res.ok) return void toast.error(res.error);
        toast.success("Endpoint added");
        onDone(res.data.endpoint, res.data.secret);
      }
    });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{endpoint ? "Edit webhook endpoint" : "Add webhook endpoint"}</DialogTitle>
        <DialogDescription>AutoSEO POSTs signed JSON to this URL whenever a selected event happens.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="wh-url">Endpoint URL</Label>
          <Input id="wh-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://hooks.zapier.com/hooks/catch/…" autoComplete="off" inputMode="url" />
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3" /> Public http(s) addresses only; private networks are blocked unless an admin allowed the host.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wh-name">Name (optional)</Label>
          <Input id="wh-name" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} placeholder="Zapier → #seo-alerts" />
        </div>
        <div className="space-y-2">
          <Label>Events</Label>
          <label className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
            <Checkbox checked={all} onCheckedChange={(v) => setAll(v === true)} />
            <span>
              All events <span className="text-xs text-muted-foreground">(including ones added later)</span>
            </span>
          </label>
          {!all && (
            <div className="space-y-3">
              {WEBHOOK_EVENT_GROUPS.map((g) => (
                <div key={g}>
                  <div className="mb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{g}</div>
                  <div className="grid gap-1.5">
                    {WEBHOOK_EVENTS.filter((e) => WEBHOOK_EVENT_META[e].group === g).map((e) => (
                      <label key={e} className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50">
                        <Checkbox className="mt-0.5" checked={events.includes(e)} onCheckedChange={(v) => toggle(e, v === true)} />
                        <span className="min-w-0">
                          <span className="text-sm">{WEBHOOK_EVENT_META[e].label}</span> <code className="text-[11px] text-muted-foreground">{e}</code>
                          <span className="block text-[11px] text-muted-foreground">{WEBHOOK_EVENT_META[e].description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={pending || !urlOk || (!all && events.length === 0)}>
          {endpoint ? "Save" : "Add endpoint"}
        </Button>
      </DialogFooter>
    </>
  );
}
