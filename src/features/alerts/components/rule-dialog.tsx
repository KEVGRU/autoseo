"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowUpRight, Bell, Mail, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect, type Option } from "@/components/app/filters";
import type { AlertKind, AlertParams } from "@/server/db/schema/alerts";
import type { PublicAlertRule } from "@/server/alerts/rules";
import { ALERT_KIND_GROUPS, ALERT_KIND_LIST, ALERT_KIND_META, WINDOW_OPTIONS } from "../kinds";
import { createAlertRuleAction, updateAlertRuleAction } from "../actions";

const COOLDOWN_OPTIONS = [0, 1, 3, 6, 12, 24, 48, 72, 168];

function cooldownLabel(h: number) {
  if (h === 0) return "No cooldown";
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"}`;
  return h === 168 ? "1 week" : `${h / 24} day${h === 24 ? "" : "s"}`;
}

export function RuleDialog({
  projectId,
  open,
  onOpenChange,
  rule,
  engines,
  tags,
  webhookEndpoints,
  onSaved,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Rule to edit (null = create). */
  rule: PublicAlertRule | null;
  engines: Option[];
  tags: Option[];
  /** Active endpoints subscribed to alert.triggered. */
  webhookEndpoints: number;
  onSaved?: (rule: PublicAlertRule) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        {open && (
          <RuleForm
            key={rule?.id ?? "new"}
            projectId={projectId}
            rule={rule}
            engines={engines}
            tags={tags}
            webhookEndpoints={webhookEndpoints}
            onDone={(r) => {
              onOpenChange(false);
              onSaved?.(r);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function RuleForm({
  projectId,
  rule,
  engines,
  tags,
  webhookEndpoints,
  onDone,
  onCancel,
}: {
  projectId: string;
  rule: PublicAlertRule | null;
  engines: Option[];
  tags: Option[];
  webhookEndpoints: number;
  onDone: (r: PublicAlertRule) => void;
  onCancel: () => void;
}) {
  const [pending, start] = useTransition();
  const [kind, setKind] = useState<AlertKind>(rule?.kind ?? "visibility_drop");
  const meta = ALERT_KIND_META[kind];
  const [name, setName] = useState(rule?.name ?? meta.label);
  const [nameTouched, setNameTouched] = useState(Boolean(rule));
  const [threshold, setThreshold] = useState<string>(String(rule?.params.threshold ?? meta.defaults.threshold ?? ""));
  const [windowDays, setWindowDays] = useState<number>(rule?.params.windowDays ?? meta.defaults.windowDays);
  const [selEngines, setSelEngines] = useState<string[]>(rule?.params.engines ?? []);
  const [selTags, setSelTags] = useState<string[]>(rule?.params.tags ?? []);
  const [minSeverity, setMinSeverity] = useState<string>(rule?.params.minSeverity ?? "minor");
  const [cooldown, setCooldown] = useState<number>(rule?.cooldownHours ?? meta.defaults.cooldownHours);
  const [inApp, setInApp] = useState(rule?.channels.inApp ?? true);
  const [webhook, setWebhook] = useState(rule?.channels.webhook ?? true);
  const [emails, setEmails] = useState((rule?.channels.emails ?? []).join(", "));
  const [slack, setSlack] = useState(rule?.channels.slack ?? false);
  const [slackUrl, setSlackUrl] = useState("");
  const [replaceSlack, setReplaceSlack] = useState(!rule?.hasSlackWebhook);
  const [active, setActive] = useState(rule?.active ?? true);

  const changeKind = (k: AlertKind) => {
    const m = ALERT_KIND_META[k];
    setKind(k);
    setThreshold(String(m.defaults.threshold ?? ""));
    setWindowDays(m.defaults.windowDays);
    setCooldown(m.defaults.cooldownHours);
    if (!nameTouched) setName(m.label);
  };

  const emailList = emails
    .split(/[\s,;]+/)
    .map((e) => e.trim())
    .filter(Boolean);
  const badEmail = emailList.find((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  const slackReady = !slack || (!replaceSlack && rule?.hasSlackWebhook) || /^https:\/\/hooks\.slack(-gov)?\.com\//.test(slackUrl.trim());
  const thresholdNum = threshold === "" ? undefined : Number(threshold);
  const thresholdBad = meta.threshold ? thresholdNum == null || Number.isNaN(thresholdNum) || thresholdNum < meta.threshold.min || thresholdNum > meta.threshold.max : false;

  const submit = () =>
    start(async () => {
      const params: AlertParams = { windowDays };
      if (meta.threshold && thresholdNum != null) params.threshold = thresholdNum;
      if (meta.fields.includes("engines") && selEngines.length) params.engines = selEngines;
      if (meta.fields.includes("tags") && selTags.length) params.tags = selTags;
      if (meta.fields.includes("minSeverity") && minSeverity !== "minor") params.minSeverity = minSeverity as AlertParams["minSeverity"];
      const channels = { inApp, webhook, emails: emailList, slack };
      const slackWebhookUrl = slack ? (replaceSlack ? slackUrl.trim() : undefined) : rule?.hasSlackWebhook ? null : undefined;
      const payload = { name: name.trim(), kind, params, channels, cooldownHours: cooldown, active, ...(slackWebhookUrl !== undefined ? { slackWebhookUrl } : {}) };
      const res = rule ? await updateAlertRuleAction(projectId, rule.id, payload) : await createAlertRuleAction(projectId, payload);
      if (!res.ok) return void toast.error(res.error);
      toast.success(rule ? "Alert rule saved" : "Alert rule created");
      onDone(res.data);
    });

  const fieldIs = (f: (typeof meta.fields)[number]) => meta.fields.includes(f);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{rule ? "Edit alert rule" : "New alert rule"}</DialogTitle>
        <DialogDescription>Rules are checked every hour and after each tracking run. Each finding alerts once until it clears.</DialogDescription>
      </DialogHeader>

      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>What to watch</Label>
            <Select value={kind} onValueChange={(v) => changeKind(v as AlertKind)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALERT_KIND_GROUPS.map((g) => (
                  <SelectGroup key={g}>
                    <SelectLabel>{g}</SelectLabel>
                    {ALERT_KIND_LIST.filter((k) => ALERT_KIND_META[k].group === g).map((k) => (
                      <SelectItem key={k} value={k}>
                        {ALERT_KIND_META[k].label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ar-name">Name</Label>
            <Input
              id="ar-name"
              value={name}
              maxLength={120}
              onChange={(e) => {
                setName(e.target.value);
                setNameTouched(true);
              }}
            />
          </div>
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">
          {meta.description} <span className="text-foreground/70">Data: {meta.source}.</span>
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {meta.threshold && (
            <div className="space-y-1.5">
              <Label htmlFor="ar-threshold">{meta.threshold.label}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="ar-threshold"
                  type="number"
                  inputMode="decimal"
                  min={meta.threshold.min}
                  max={meta.threshold.max}
                  step={meta.threshold.step}
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  aria-invalid={thresholdBad || undefined}
                  className="tabular"
                />
                <span className="shrink-0 text-sm text-muted-foreground">{meta.threshold.unit}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{meta.threshold.help}</p>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>{kind === "run_failed" || kind === "fact_check_deviation" ? "Look back" : "Compare windows of"}</Label>
            <Select value={String(windowDays)} onValueChange={(v) => setWindowDays(Number(v))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...new Set([...WINDOW_OPTIONS, windowDays])]
                  .sort((a, b) => a - b)
                  .map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d === 1 ? "1 day" : `${d} days`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              {kind === "run_failed" || kind === "fact_check_deviation" || kind === "new_ad" || kind === "new_competitor"
                ? "How far back new items are considered."
                : "Last N days vs the N days before."}
            </p>
          </div>
          {fieldIs("engines") && (
            <div className="space-y-1.5">
              <Label>AI engines</Label>
              <MultiSelect options={engines} value={selEngines} onChange={setSelEngines} placeholder="All engines" label="Engines" className="w-full" />
            </div>
          )}
          {fieldIs("tags") && (
            <div className="space-y-1.5">
              <Label>Prompt tags</Label>
              <MultiSelect options={tags} value={selTags} onChange={setSelTags} placeholder={tags.length ? "All prompts" : "No tags yet"} label="Tags" className="w-full" />
            </div>
          )}
          {fieldIs("minSeverity") && (
            <div className="space-y-1.5">
              <Label>Minimum severity</Label>
              <Select value={minSeverity} onValueChange={setMinSeverity}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">Any deviation</SelectItem>
                  <SelectItem value="major">Major and critical</SelectItem>
                  <SelectItem value="critical">Critical only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Cooldown</Label>
            <Select value={String(cooldown)} onValueChange={(v) => setCooldown(Number(v))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...new Set([...COOLDOWN_OPTIONS, cooldown])]
                  .sort((a, b) => a - b)
                  .map((h) => (
                    <SelectItem key={h} value={String(h)}>
                      {cooldownLabel(h)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">Minimum time between two alerts of this rule.</p>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border bg-muted/30 p-3 sm:p-4">
          <div className="text-sm font-medium">Notify via</div>
          <ChannelRow icon={<Bell className="size-4" />} title="In-app" description="Bell notifications for everyone with access to this project.">
            <Switch checked={inApp} onCheckedChange={setInApp} aria-label="In-app notifications" />
          </ChannelRow>
          <ChannelRow
            icon={<Webhook className="size-4" />}
            title="Webhooks"
            description={
              <>
                Sends <code className="rounded bg-muted px-1 text-[11px]">alert.triggered</code> to{" "}
                {webhookEndpoints ? `${webhookEndpoints} subscribed endpoint${webhookEndpoints === 1 ? "" : "s"}` : "no endpoint yet"} (Zapier, Make, n8n…).{" "}
                <Link href={`/p/${projectId}/integrations#webhooks`} className="inline-flex items-center gap-0.5 font-medium text-foreground underline-offset-2 hover:underline">
                  Manage <ArrowUpRight className="size-3" />
                </Link>
              </>
            }
          >
            <Switch checked={webhook} onCheckedChange={setWebhook} aria-label="Webhook event" />
          </ChannelRow>
          <div className="space-y-1.5">
            <Label htmlFor="ar-emails" className="flex items-center gap-2 font-normal">
              <Mail className="size-4 text-muted-foreground" /> Email recipients
            </Label>
            <Textarea
              id="ar-emails"
              rows={2}
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="seo@example.com, team@example.com"
              aria-invalid={Boolean(badEmail) || undefined}
            />
            {badEmail ? <p className="text-[11px] text-destructive">“{badEmail}” is not a valid email address.</p> : <p className="text-[11px] text-muted-foreground">Optional. Up to 20 addresses (uses Admin → Email).</p>}
          </div>
          <ChannelRow icon={<SlackGlyph />} title="Slack" description="Posts to a channel through a Slack incoming webhook.">
            <Switch checked={slack} onCheckedChange={setSlack} aria-label="Slack" />
          </ChannelRow>
          {slack &&
            (rule?.hasSlackWebhook && !replaceSlack ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2 text-xs">
                <span className="text-muted-foreground">
                  Saved: <span className="font-mono text-foreground">{rule.channels.slackHint ?? "Slack webhook"}</span>
                </span>
                <Button size="sm" variant="ghost" className="h-7" onClick={() => setReplaceSlack(true)}>
                  Replace
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                <Input
                  type="password"
                  autoComplete="off"
                  value={slackUrl}
                  onChange={(e) => setSlackUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/T000/B000/XXXX"
                  aria-label="Slack incoming webhook URL"
                />
                <p className="text-[11px] text-muted-foreground">Stored encrypted; never shown again. Slack → Apps → Incoming Webhooks → Add to channel.</p>
              </div>
            ))}
        </div>

        <label className="flex items-center justify-between gap-3 text-sm">
          <span>
            <span className="font-medium">Active</span>
            <span className="block text-xs text-muted-foreground">Paused rules are not evaluated.</span>
          </span>
          <Switch checked={active} onCheckedChange={setActive} />
        </label>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={pending || !name.trim() || thresholdBad || Boolean(badEmail) || !slackReady}>
          {rule ? "Save rule" : "Create rule"}
        </Button>
      </DialogFooter>
    </>
  );
}

function ChannelRow({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 gap-2">
        <span className="mt-0.5 text-muted-foreground">{icon}</span>
        <div className="min-w-0">
          <div className="text-sm">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <div className="pt-0.5">{children}</div>
    </div>
  );
}

export function SlackGlyph({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M5.04 15.16a2.52 2.52 0 1 1-2.52-2.52h2.52v2.52Zm1.27 0a2.52 2.52 0 0 1 5.04 0v6.32a2.52 2.52 0 1 1-5.04 0v-6.32ZM8.84 5.04a2.52 2.52 0 1 1 2.52-2.52v2.52H8.84Zm0 1.27a2.52 2.52 0 0 1 0 5.04H2.52a2.52 2.52 0 1 1 0-5.04h6.32Zm10.12 2.53a2.52 2.52 0 1 1 2.52 2.52h-2.52V8.84Zm-1.27 0a2.52 2.52 0 0 1-5.04 0V2.52a2.52 2.52 0 1 1 5.04 0v6.32ZM15.16 18.96a2.52 2.52 0 1 1-2.52 2.52v-2.52h2.52Zm0-1.27a2.52 2.52 0 0 1 0-5.04h6.32a2.52 2.52 0 1 1 0 5.04h-6.32Z" />
    </svg>
  );
}
