"use client";

import Link from "next/link";
import { Cloud, ExternalLink, Gauge, Globe, Search, Sparkles, Wallet } from "lucide-react";
import { Panel } from "@/components/app/page";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CAPABILITY_INFO, ENRICHMENT_CAPABILITIES, type EnrichmentCapability, type EnrichmentMode, type EnrichmentStatus } from "@/server/enrichment/policy";
import { MultiSelect } from "@/components/app/filters";
import { CopyButton } from "@/components/app/misc";
import { COUNTRIES, flagEmoji, getCountryByLocationCode, LANGUAGES } from "@/lib/countries";
import type { Settings } from "@/server/settings/registry";
import { Rows, SaveBar, SecretInput, SettingRow, TestButton, ToggleRow, useSettingsForm } from "./settings-kit";
import { testDataForSeoAction, testIntegrationAction } from "../actions/tests";

type S<K extends "dataforseo" | "google" | "integrations"> = { values: Settings<K>; secrets: Record<string, boolean> };

function Connected({ on }: { on: boolean }) {
  return on ? (
    <Badge variant="secondary" className="h-5 bg-success/12 text-[10px] text-success">
      Connected
    </Badge>
  ) : (
    <Badge variant="outline" className="h-5 text-[10px] text-muted-foreground">
      Not connected
    </Badge>
  );
}

const MODES: { value: EnrichmentMode; label: string; description: string }[] = [
  {
    value: "auto",
    label: "Auto (recommended)",
    description: "Measured DataForSEO data when your account is connected; AI estimates otherwise.",
  },
  { value: "dataforseo", label: "DataForSEO only", description: "Never use AI estimates. Features without DataForSEO stay disabled." },
  { value: "ai", label: "AI only", description: "Never call DataForSEO — every enabled data type is estimated by AI with web search." },
];

function SourcePill({ provider }: { provider: "dataforseo" | "ai" | null }) {
  if (provider === "dataforseo")
    return (
      <Badge variant="secondary" className="h-5 bg-success/12 text-[10px] text-success">
        DataForSEO
      </Badge>
    );
  if (provider === "ai")
    return (
      <Badge variant="secondary" className="h-5 bg-warning/15 text-[10px] text-amber-700 dark:text-amber-300">
        AI estimate
      </Badge>
    );
  return (
    <Badge variant="outline" className="h-5 text-[10px] text-muted-foreground">
      Unavailable
    </Badge>
  );
}

/** Where keyword / SERP / domain / backlink / local data comes from: the customer's DataForSEO account or AI estimates. */
function EnrichmentPanel({ form, status }: { form: ReturnType<typeof useSettingsForm<Settings<"dataforseo">>>; status: EnrichmentStatus }) {
  const v = form.values;
  const enabled = new Set<EnrichmentCapability>(v.aiCapabilities);
  const toggleCapability = (cap: EnrichmentCapability, on: boolean) => {
    const next = new Set(enabled);
    if (on) next.add(cap);
    else next.delete(cap);
    form.set(
      "aiCapabilities",
      ENRICHMENT_CAPABILITIES.filter((c) => next.has(c)),
    );
  };
  return (
    <Panel
      title="Data enrichment"
      description="Where keyword, SERP, domain, backlink and local SEO data comes from."
      icon={<Sparkles className="size-4" />}
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
      <div className="mb-4 space-y-2 rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed">
        <p>
          <span className="font-medium">Measured data:</span> create your own account at{" "}
          <a href="https://dataforseo.com" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
            dataforseo.com
          </a>{" "}
          (pay-as-you-go, you are billed by DataForSEO directly) and enter its API login and API password in the DataForSEO section below. Costs are
          tracked under Usage.
        </p>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">Without DataForSEO:</span> an AI model with web search enriches the data instead — search volumes,
          traffic and positions become estimates, every URL is verified, and all AI data is labelled “AI estimate” in the app, API and MCP. It uses your{" "}
          <Link href="/admin/ai" className="underline underline-offset-4">
            AI providers
          </Link>{" "}
          (local agent first, then API keys).
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-muted-foreground">Status:</span>
          <Badge variant="outline" className="h-5 text-[10px]">
            DataForSEO {status.dfsConfigured ? "connected" : "not connected"}
          </Badge>
          <Badge variant="outline" className="h-5 text-[10px]">
            AI provider {status.aiAvailable ? "available" : "not available"}
          </Badge>
          {form.dirty && <span className="text-muted-foreground">Save to apply the changes below.</span>}
        </div>
      </div>
      <Rows>
        <SettingRow label="Mode" description="How the data source is chosen for every SEO feature.">
          <RadioGroup value={v.mode} onValueChange={(x) => form.set("mode", x as EnrichmentMode)} className="gap-2">
            {MODES.map((m) => (
              <Label
                key={m.value}
                htmlFor={`enrich-mode-${m.value}`}
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal has-[[data-state=checked]]:border-foreground/40 has-[[data-state=checked]]:bg-muted/50"
              >
                <RadioGroupItem id={`enrich-mode-${m.value}`} value={m.value} className="mt-0.5" />
                <span className="min-w-0 space-y-0.5">
                  <span className="block text-[13px] font-medium">{m.label}</span>
                  <span className="block text-xs text-muted-foreground">{m.description}</span>
                </span>
              </Label>
            ))}
          </RadioGroup>
        </SettingRow>
        <ToggleRow
          label="Fall back to AI when DataForSEO fails"
          description="Auto mode only: if DataForSEO rejects the credentials (401) or the balance is empty (402), answer with AI estimates instead of an error."
          checked={v.fallbackOnError}
          disabled={v.mode !== "auto"}
          onCheckedChange={(x) => form.set("fallbackOnError", x)}
        />
        <SettingRow label="AI may estimate" description="Data types AI enrichment is allowed to serve. The badge shows the current source (after saving).">
          <div className="space-y-1.5">
            {ENRICHMENT_CAPABILITIES.map((cap) => {
              const info = CAPABILITY_INFO[cap];
              return (
                <label key={cap} className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/50">
                  <Checkbox checked={enabled.has(cap)} onCheckedChange={(x) => toggleCapability(cap, x === true)} disabled={v.mode === "dataforseo"} className="mt-0.5" />
                  <span className="min-w-0 flex-1 space-y-0.5">
                    <span className="flex flex-wrap items-center gap-2 text-[13px] font-medium">
                      {info.label} <SourcePill provider={status.capabilities[cap].provider} />
                    </span>
                    <span className="block text-xs text-muted-foreground">{info.ai}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </SettingRow>
      </Rows>
    </Panel>
  );
}

function CopyField({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Input readOnly value={value} className="h-8 font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
      <CopyButton value={value} size="icon" className="size-8 shrink-0 border" />
    </div>
  );
}

export function DataSettings({
  dataforseo,
  google,
  integrations,
  appUrl,
  enrichment,
}: {
  dataforseo: S<"dataforseo">;
  google: S<"google">;
  integrations: S<"integrations">;
  appUrl: string;
  enrichment: EnrichmentStatus;
}) {
  const d = useSettingsForm("dataforseo", dataforseo);
  const g = useSettingsForm("google", google);
  const i = useSettingsForm("integrations", integrations);
  const forms = [d, g, i];
  const dirty = forms.some((f) => f.dirty);
  const market = getCountryByLocationCode(d.values.defaultLocationCode);
  const dfsConnected = Boolean(d.values.login) && Boolean(d.secrets.password);
  const redirectUri = `${appUrl}/api/oauth/google/callback`;

  return (
    <div className="space-y-4">
      <EnrichmentPanel form={d} status={enrichment} />

      <Panel
        title={
          <span className="flex items-center gap-2">
            DataForSEO <Connected on={dfsConnected} />
          </span>
        }
        description="Your own DataForSEO account: measured keyword, SERP, backlink, local, on-page and AI-engine data. Pay-as-you-go; costs are tracked under Usage."
        icon={<Globe className="size-4" />}
        actions={
          <a
            href="https://app.dataforseo.com/api-access"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            API credentials <ExternalLink className="size-3" />
          </a>
        }
      >
        <Rows>
          <SettingRow
            label="API login"
            htmlFor="dfs-login"
            description={
              <>
                No account yet?{" "}
                <a href="https://dataforseo.com" target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  Sign up at dataforseo.com
                </a>
                , then copy the API login (email) from DataForSEO → API Access.
              </>
            }
          >
            <Input id="dfs-login" value={d.values.login} onChange={(e) => d.set("login", e.target.value)} autoComplete="off" placeholder="you@company.com" />
          </SettingRow>
          <SettingRow label="API password" htmlFor="dfs-password" description="Not your account password — the generated API password.">
            <SecretInput id="dfs-password" isSet={d.secrets.password ?? false} value={d.secretEdits.password} onChange={(x) => d.setSecret("password", x)} placeholder="API password" />
          </SettingRow>
          <ToggleRow
            label="Sandbox mode"
            description="Uses sandbox.dataforseo.com — free, but returns sample data. Turn off for real results."
            checked={d.values.sandbox}
            onCheckedChange={(x) => d.set("sandbox", x)}
          />
          <SettingRow label="Default market" description="Pre-selected location and language for research tools.">
            <div className="flex flex-wrap gap-2">
              <MultiSelect
                single
                options={COUNTRIES.map((c) => ({ value: String(c.locationCode), label: `${flagEmoji(c.iso)} ${c.name}` }))}
                value={[String(d.values.defaultLocationCode)]}
                onChange={(vals) => {
                  const code = Number(vals[0]);
                  if (!code) return;
                  d.set("defaultLocationCode", code);
                  const c = getCountryByLocationCode(code);
                  if (c && !c.languages.includes(d.values.defaultLanguageCode)) d.set("defaultLanguageCode", c.language);
                }}
                label="Market"
                className="h-9 min-w-48"
              />
              <MultiSelect
                single
                options={(market?.languages ?? LANGUAGES.map((l) => l.code)).map((code) => ({
                  value: code,
                  label: LANGUAGES.find((l) => l.code === code)?.name ?? code,
                }))}
                value={[d.values.defaultLanguageCode]}
                onChange={(vals) => vals[0] && d.set("defaultLanguageCode", vals[0])}
                label="Language"
                className="h-9 min-w-36"
              />
            </div>
          </SettingRow>
          <SettingRow label="Connection" description={d.dirty ? "Save first — the test uses the saved credentials." : "Checks the credentials and shows your balance."}>
            <TestButton
              run={async () => {
                const res = await testDataForSeoAction();
                if (!res.ok) return res;
                const r = res.data;
                return {
                  ok: true as const,
                  data: {
                    ok: r.ok,
                    message: r.ok && r.balance != null ? `${r.message} · balance $${r.balance.toFixed(2)}` : r.message,
                    detail: r.detail,
                    latencyMs: r.latencyMs,
                  },
                };
              }}
              label={
                <>
                  <Wallet className="size-3.5" /> Test connection
                </>
              }
              disabled={d.dirty || !dfsConnected}
              disabledReason="Save login and password first"
            />
          </SettingRow>
        </Rows>
      </Panel>

      <Panel
        title={
          <span className="flex items-center gap-2">
            Google <Connected on={Boolean(g.values.oauthClientId) && Boolean(g.secrets.oauthClientSecret)} />
          </span>
        }
        description="OAuth app for Search Console and Google Analytics 4 connections, plus PageSpeed Insights."
        icon={<Search className="size-4" />}
        actions={
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Google Cloud console <ExternalLink className="size-3" />
          </a>
        }
      >
        <Rows>
          <SettingRow
            label="Authorized redirect URI"
            description="Create an OAuth client (type “Web application”) and register exactly this redirect URI. Enable the Search Console API and Google Analytics Data/Admin APIs."
          >
            <CopyField value={redirectUri} />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Authorized JavaScript origin: <span className="font-mono">{appUrl}</span>
            </p>
          </SettingRow>
          <SettingRow label="OAuth client ID" htmlFor="g-client">
            <Input
              id="g-client"
              value={g.values.oauthClientId}
              onChange={(e) => g.set("oauthClientId", e.target.value.trim())}
              placeholder="1234567890-abc.apps.googleusercontent.com"
              className="font-mono text-[13px]"
            />
          </SettingRow>
          <SettingRow label="OAuth client secret" htmlFor="g-secret">
            <SecretInput
              id="g-secret"
              isSet={g.secrets.oauthClientSecret ?? false}
              value={g.secretEdits.oauthClientSecret}
              onChange={(x) => g.setSecret("oauthClientSecret", x)}
              placeholder="GOCSPX-…"
            />
          </SettingRow>
          <SettingRow
            label={
              <span className="flex items-center gap-1.5">
                <Gauge className="size-3.5" /> PageSpeed Insights API key
              </span>
            }
            htmlFor="g-psi"
            description="Optional — raises the Lighthouse/Core Web Vitals quota for site audits."
          >
            <div className="space-y-2">
              <SecretInput id="g-psi" isSet={g.secrets.pagespeedApiKey ?? false} value={g.secretEdits.pagespeedApiKey} onChange={(x) => g.setSecret("pagespeedApiKey", x)} />
              <TestButton run={() => testIntegrationAction("pagespeed")} disabled={g.dirty || !g.secrets.pagespeedApiKey} disabledReason="Save a key first" />
            </div>
          </SettingRow>
        </Rows>
      </Panel>

      <Panel title="Other integrations" description="Instance-wide credentials used by analytics and bot-traffic features." icon={<Cloud className="size-4" />}>
        <Rows>
          <SettingRow
            label="Bing Webmaster Tools API key"
            description={
              <>
                Bing search performance data.{" "}
                <a href="https://www.bing.com/webmasters/" target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  Get key
                </a>
              </>
            }
          >
            <div className="space-y-2">
              <SecretInput
                isSet={i.secrets.bingWebmasterApiKey ?? false}
                value={i.secretEdits.bingWebmasterApiKey}
                onChange={(x) => i.setSecret("bingWebmasterApiKey", x)}
              />
              <TestButton run={() => testIntegrationAction("bing")} disabled={i.dirty || !i.secrets.bingWebmasterApiKey} disabledReason="Save a key first" />
            </div>
          </SettingRow>
          <SettingRow
            label="Cloudflare API token"
            description={
              <>
                Read-only token (Zone Analytics + Logs) for AI bot traffic.{" "}
                <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  Create token
                </a>
              </>
            }
          >
            <div className="space-y-2">
              <SecretInput
                isSet={i.secrets.cloudflareApiToken ?? false}
                value={i.secretEdits.cloudflareApiToken}
                onChange={(x) => i.setSecret("cloudflareApiToken", x)}
              />
              <TestButton
                run={() => testIntegrationAction("cloudflare")}
                disabled={i.dirty || !i.secrets.cloudflareApiToken}
                disabledReason="Save a token first"
              />
            </div>
          </SettingRow>
        </Rows>
      </Panel>

      <SaveBar
        dirty={dirty}
        saving={forms.some((f) => f.saving)}
        count={forms.reduce((n, f) => n + f.changedCount, 0)}
        onReset={() => forms.forEach((f) => f.reset())}
        onSave={async () => {
          for (const f of forms) {
            if (f.dirty && !(await f.save())) return;
          }
        }}
      />
    </div>
  );
}
