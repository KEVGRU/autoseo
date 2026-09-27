"use client";

import { useState } from "react";
import { Database, ExternalLink, Loader2, PlugZap, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Panel } from "@/components/app/page";
import { ConfirmButton, TimeAgo } from "@/components/app/misc";
import { SecretInput } from "@/features/admin/components/settings-kit";
import { CAPABILITY_INFO, ENRICHMENT_CAPABILITIES, type EnrichmentMode, type EnrichmentStatus } from "@/server/enrichment/policy";
import type { WorkspaceDfsView } from "@/server/dataforseo/credentials";
import { removeWorkspaceProvidersAction, saveWorkspaceProvidersAction, testWorkspaceProvidersAction } from "./provider-actions";

const MODES: { value: EnrichmentMode; label: string; description: string }[] = [
  {
    value: "auto",
    label: "Auto (recommended)",
    description: "Your DataForSEO account when connected, AI estimates otherwise (and when DataForSEO rejects the key or runs out of funds).",
  },
  { value: "dataforseo", label: "DataForSEO only", description: "Measured data only — features without a DataForSEO account stay disabled." },
  { value: "ai", label: "AI only", description: "Never call DataForSEO; an AI model with web search estimates all SEO data." },
];

type TestOutcome = { ok: boolean; message: string; balance?: number | null; latencyMs?: number };

function SourcePill({ provider }: { provider: "dataforseo" | "ai" | null }) {
  if (provider === "dataforseo") return <Badge className="h-5 bg-success/12 text-[10px] text-success">DataForSEO</Badge>;
  if (provider === "ai") return <Badge className="h-5 bg-warning/15 text-[10px] text-amber-700 dark:text-amber-300">AI estimate</Badge>;
  return (
    <Badge variant="outline" className="h-5 text-[10px] text-muted-foreground">
      Unavailable
    </Badge>
  );
}

/**
 * Settings → Workspace → Data providers. The workspace owner connects their own DataForSEO account (billed by
 * DataForSEO directly) and chooses how SEO data is enriched. The API password is stored encrypted, never shown again.
 */
export function ProvidersPanel({
  workspaceId,
  view,
  status,
  canManage,
}: {
  workspaceId: string;
  view: WorkspaceDfsView;
  status: EnrichmentStatus;
  canManage: boolean;
}) {
  const [login, setLogin] = useState(view.login);
  const [password, setPassword] = useState<string | undefined>(undefined);
  const [sandbox, setSandbox] = useState(view.sandbox);
  const [mode, setMode] = useState<EnrichmentMode>(view.mode ?? status.mode);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [test, setTest] = useState<TestOutcome | null>(null);

  const dirty = login.trim() !== view.login || password !== undefined || sandbox !== view.sandbox || mode !== (view.mode ?? status.mode);
  const connected = Boolean(view.login) && view.hasPassword;

  const save = async () => {
    setSaving(true);
    try {
      const res = await saveWorkspaceProvidersAction(workspaceId, { login: login.trim(), password, sandbox, mode });
      if (!res.ok) throw new Error(res.error);
      setPassword(undefined);
      setTest(null);
      toast.success("Data providers saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const runTest = async () => {
    setTesting(true);
    try {
      const res = await testWorkspaceProvidersAction(workspaceId, { login: login.trim() || undefined, password: password || undefined, sandbox });
      if (!res.ok) throw new Error(res.error);
      setTest(res.data);
    } catch (err) {
      setTest({ ok: false, message: err instanceof Error ? err.message : "Test failed" });
    } finally {
      setTesting(false);
    }
  };

  const remove = async () => {
    const res = await removeWorkspaceProvidersAction(workspaceId);
    if (!res.ok) return void toast.error(res.error);
    setLogin("");
    setPassword(undefined);
    setSandbox(false);
    setTest(null);
    toast.success("DataForSEO credentials removed");
  };

  const canTest = Boolean(login.trim()) && (Boolean(password) || (view.hasPassword && login.trim() === view.login));

  return (
    <Panel
      title={
        <span className="flex flex-wrap items-center gap-2">
          Data providers
          {connected ? (
            <Badge className="h-5 bg-success/12 text-[10px] text-success">Own DataForSEO connected</Badge>
          ) : (
            <Badge variant="outline" className="h-5 text-[10px] text-muted-foreground">
              No own DataForSEO account
            </Badge>
          )}
        </span>
      }
      description="Where keyword, SERP, domain, backlink and local SEO data for this workspace comes from."
      icon={<Database className="size-4" />}
      actions={
        <a
          href="https://dataforseo.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          dataforseo.com <ExternalLink className="size-3" />
        </a>
      }
    >
      <div className="space-y-5">
        <div className="space-y-2 rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed">
          <p>
            <span className="font-medium">Measured data with your own account:</span> sign up at{" "}
            <a href="https://dataforseo.com" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
              dataforseo.com
            </a>{" "}
            (pay-as-you-go, billed by DataForSEO directly), then paste the API login and API password from DataForSEO → API Access below.
          </p>
          <p className="text-muted-foreground">
            Without an account, an AI model with web search estimates the data — volumes, traffic and positions are estimates, every URL is verified, and
            estimates are always labelled “AI estimate”.
          </p>
          {!status.aiAllowed && (
            <p className="text-xs text-muted-foreground">AI estimates are disabled on this instance — connect DataForSEO to use the SEO tools.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-[13px]">Mode</Label>
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as EnrichmentMode)} className="grid gap-2 md:grid-cols-3" disabled={!canManage}>
            {MODES.map((m) => (
              <Label
                key={m.value}
                htmlFor={`ws-mode-${m.value}`}
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal has-[[data-state=checked]]:border-foreground/40 has-[[data-state=checked]]:bg-muted/50"
              >
                <RadioGroupItem id={`ws-mode-${m.value}`} value={m.value} className="mt-0.5" disabled={!canManage || (m.value === "ai" && !status.aiAllowed)} />
                <span className="min-w-0 space-y-0.5">
                  <span className="block text-[13px] font-medium">{m.label}</span>
                  <span className="block text-xs text-muted-foreground">{m.description}</span>
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ws-dfs-login" className="text-[13px]">
              DataForSEO API login
            </Label>
            <Input
              id="ws-dfs-login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="you@company.com"
              autoComplete="off"
              disabled={!canManage}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ws-dfs-password" className="text-[13px]">
              API password
            </Label>
            {canManage ? (
              <SecretInput
                id="ws-dfs-password"
                isSet={view.hasPassword}
                value={password}
                onChange={setPassword}
                placeholder="Generated API password (not your account password)"
              />
            ) : (
              <Input disabled value={view.hasPassword ? "••••••••••••" : ""} placeholder="Not set" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="ws-dfs-sandbox" checked={sandbox} onCheckedChange={setSandbox} disabled={!canManage} />
          <Label htmlFor="ws-dfs-sandbox" className="text-xs font-normal text-muted-foreground">
            Sandbox mode (free sample data from sandbox.dataforseo.com)
          </Label>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          {canManage && (
            <Button onClick={save} disabled={!dirty || saving}>
              {saving && <Loader2 className="animate-spin" />}
              Save
            </Button>
          )}
          {canManage && (
            <Button variant="outline" onClick={runTest} disabled={!canTest || testing}>
              {testing ? <Loader2 className="animate-spin" /> : <Wallet className="size-3.5" />}
              Test connection
            </Button>
          )}
          {canManage && connected && (
            <ConfirmButton
              title="Remove your DataForSEO credentials?"
              description="This workspace falls back to the instance account or AI estimates, depending on the mode."
              confirmLabel="Remove"
              destructive
              onConfirm={remove}
            >
              <Button variant="ghost" className="text-destructive">
                <Trash2 className="size-3.5" /> Remove credentials
              </Button>
            </ConfirmButton>
          )}
          <span className="text-xs text-muted-foreground">
            {view.lastTestedAt ? (
              <>
                Last test {view.status === "ok" ? "succeeded" : "failed"} <TimeAgo date={view.lastTestedAt} />
                {view.status === "error" && view.lastError ? ` — ${view.lastError}` : ""}
              </>
            ) : connected ? (
              "Not tested yet"
            ) : null}
          </span>
        </div>
        {test && (
          <p className={test.ok ? "text-sm text-success" : "text-sm text-destructive"}>
            {test.message}
            {test.ok && test.balance != null ? ` · balance $${test.balance.toFixed(2)}` : ""}
            {test.latencyMs != null ? <span className="text-muted-foreground"> · {test.latencyMs} ms</span> : null}
          </p>
        )}

        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <PlugZap className="size-3.5" /> Current data source {dirty && <span className="normal-case">(after saving)</span>}
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {ENRICHMENT_CAPABILITIES.map((cap) => (
              <div key={cap} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/50">
                <span className="min-w-0 truncate">{CAPABILITY_INFO[cap].label}</span>
                <SourcePill provider={status.capabilities[cap].provider} />
              </div>
            ))}
          </div>
          {status.dfsScope === "instance" && <p className="text-xs text-muted-foreground">DataForSEO data currently comes from the instance account.</p>}
        </div>
      </div>
    </Panel>
  );
}
