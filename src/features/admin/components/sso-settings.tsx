"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AlertTriangle, BadgeCheck, Building2, ExternalLink, Info, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Panel } from "@/components/app/page";
import { CopyButton, TimeAgo } from "@/components/app/misc";
import { cn } from "@/lib/utils";
import type { Settings } from "@/server/settings/registry";
import { SsoRoleMapEditor } from "@/features/settings/workspace/sso-role-map";
import { setWorkspaceSsoEnabledAction, signOutInstanceSsoDomainsAction, testInstanceSsoAction } from "../actions/sso";
import { ChipsInput, Rows, SecretInput, SettingRow, TestResultView, ToggleRow, useSettingsForm, type TestOutcome } from "./settings-kit";

const DOMAIN_RE = /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const DEFAULT_WORKSPACE = "__default__";

function normalizeDomain(s: string) {
  return s.trim().toLowerCase().replace(/^@/, "").replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

const domainError = (d: string) => (DOMAIN_RE.test(d) ? null : `“${d}” is not a valid domain — use e.g. example.com`);

export type WorkspaceSsoRow = {
  workspaceId: string;
  workspaceName: string;
  domains: { id: string; domain: string; verified: boolean; verifiedVia: "dns" | "admin" | null }[];
  provider: { id: string; name: string; enabled: boolean; issuerUrl: string; enforceSso: boolean; jit: boolean; updatedByEmail: string | null; lastLoginAt: string | null } | null;
};

/** Admin → Authentication → Single sign-on: the instance-wide OpenID Connect provider. */
export function SsoSettings({
  sso,
  workspaces,
  roles,
  redirectUri,
}: {
  sso: { values: Settings<"sso">; secrets: Record<string, boolean> };
  workspaces: { id: string; name: string }[];
  /** Roles SSO may assign (never roles granting instance administration). */
  roles: { key: string; name: string }[];
  redirectUri: string;
}) {
  const f = useSettingsForm("sso", sso);
  const v = f.values;
  const [testing, startTest] = useTransition();
  const [test, setTest] = useState<TestOutcome | null>(null);
  const roleOptions = roles.some((r) => r.key === v.defaultRoleKey) ? roles : [...roles, { key: v.defaultRoleKey, name: v.defaultRoleKey }];
  const enforcedOutside = v.enforceForDomains.filter((d) => !v.allowedDomains.includes(d));
  // Domains this save makes SSO-mandatory — offer to end their existing (email-link) sessions, on by default.
  const [saved, setSaved] = useState(() => ({ enabled: sso.values.enabled, enforce: sso.values.enforceForDomains }));
  const [signOutExisting, setSignOutExisting] = useState(true);
  const newlyEnforced = v.enabled ? v.enforceForDomains.filter((d) => v.allowedDomains.includes(d) && !(saved.enabled && saved.enforce.includes(d))) : [];

  const save = async () => {
    const domains = newlyEnforced;
    const next = { enabled: v.enabled, enforce: v.enforceForDomains };
    if (!(await f.save())) return;
    setSaved(next);
    if (domains.length && signOutExisting) {
      const res = await signOutInstanceSsoDomainsAction({ domains });
      if (!res.ok) toast.error(res.error);
      else toast.success(`Signed out ${res.data.sessions} session${res.data.sessions === 1 ? "" : "s"} of ${res.data.users} ${res.data.users === 1 ? "person" : "people"}.`);
    }
  };

  const runTest = () =>
    startTest(async () => {
      setTest(null);
      const res = await testInstanceSsoAction();
      if (!res.ok) setTest({ ok: false, message: res.error });
      else
        setTest({
          ok: true,
          message: `Discovered ${res.data.issuer}`,
          detail: [
            res.data.authorizationEndpoint && `Authorize: ${res.data.authorizationEndpoint}`,
            res.data.tokenEndpoint && `Token: ${res.data.tokenEndpoint}`,
            `PKCE (S256): ${res.data.supportsPkce ? "supported" : "not advertised — sent anyway"}`,
          ]
            .filter(Boolean)
            .join(" · "),
        });
    });

  return (
    <Panel
      title="Single sign-on (OpenID Connect)"
      icon={<KeyRound className="size-4" />}
      description="One identity provider for the whole instance — Entra ID, Okta, Google Workspace, Keycloak, Auth0 …"
      actions={
        <Badge variant="outline" className={cn("h-5 text-[10px]", sso.values.enabled ? "text-success" : "text-muted-foreground")}>
          {sso.values.enabled ? "Enabled" : "Disabled"}
        </Badge>
      }
    >
      <Rows>
        <SettingRow label="Redirect URI" description="Register exactly this URL at your identity provider (web application).">
          <div className="flex min-w-0 items-center gap-1.5">
            <code className="min-w-0 flex-1 truncate rounded-md border bg-muted/40 px-2 py-1.5 font-mono text-[12px]" title={redirectUri}>
              {redirectUri}
            </code>
            <CopyButton value={redirectUri} size="icon" />
          </div>
        </SettingRow>
        <ToggleRow
          label="Enabled"
          description="Shows “Continue with …” on the sign-in page and routes the SSO domains below to this provider."
          checked={v.enabled}
          onCheckedChange={(x) => f.set("enabled", x)}
        />
        <SettingRow label="Button label" htmlFor="isso-name">
          <Input id="isso-name" value={v.name} onChange={(e) => f.set("name", e.target.value)} maxLength={60} className="sm:max-w-72" />
        </SettingRow>
        <SettingRow
          label="Issuer URL"
          htmlFor="isso-issuer"
          description="e.g. https://login.microsoftonline.com/<tenant-id>/v2.0 · https://<org>.okta.com · https://accounts.google.com · https://<keycloak>/realms/<realm>"
        >
          <Input id="isso-issuer" value={v.issuerUrl} onChange={(e) => f.set("issuerUrl", e.target.value)} className="font-mono text-[13px]" maxLength={500} />
        </SettingRow>
        <SettingRow label="Client ID" htmlFor="isso-client">
          <Input id="isso-client" value={v.clientId} onChange={(e) => f.set("clientId", e.target.value)} className="font-mono text-[13px]" maxLength={256} />
        </SettingRow>
        <SettingRow label="Client secret" htmlFor="isso-secret" description="Stored encrypted. Changing the issuer or client ID requires entering it again.">
          <SecretInput
            id="isso-secret"
            isSet={Boolean(f.secrets.clientSecret)}
            value={f.secretEdits.clientSecret}
            onChange={(x) => f.setSecret("clientSecret", x)}
            placeholder="Paste the client secret…"
          />
        </SettingRow>
        <SettingRow label="Scopes" htmlFor="isso-scopes" description="openid and email are always requested.">
          <Input id="isso-scopes" value={v.scopes} onChange={(e) => f.set("scopes", e.target.value)} className="font-mono text-[13px]" maxLength={500} />
        </SettingRow>
        <SettingRow
          label="SSO email domains"
          htmlFor="isso-domains"
          description="The provider may only sign in addresses from these domains (exact match). Required to enable SSO. A workspace's own verified domain takes precedence."
        >
          <ChipsInput
            id="isso-domains"
            value={v.allowedDomains}
            onChange={(list) => f.set("allowedDomains", list)}
            placeholder="example.com"
            normalize={normalizeDomain}
            validate={domainError}
            renderChip={(d) => <span className="font-mono">@{d}</span>}
          />
        </SettingRow>
        <SettingRow
          label="Require SSO for"
          htmlFor="isso-enforce"
          description="Magic links and invitation links stop working for these domains (a subset of the SSO domains). Instance admins keep an emergency email link."
        >
          <ChipsInput
            id="isso-enforce"
            value={v.enforceForDomains}
            onChange={(list) => f.set("enforceForDomains", list)}
            placeholder="example.com"
            normalize={normalizeDomain}
            validate={(d) => domainError(d) ?? (v.allowedDomains.includes(d) ? null : `Add ${d} to the SSO email domains first.`)}
            renderChip={(d) => <span className="font-mono">@{d}</span>}
          />
          {enforcedOutside.length > 0 && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
              <AlertTriangle className="size-3" /> Not an SSO domain: {enforcedOutside.join(", ")}
            </p>
          )}
          {newlyEnforced.length > 0 && (
            <label className="mt-2 flex cursor-pointer items-start gap-2.5 rounded-xl border bg-muted/30 p-3 text-sm">
              <Checkbox checked={signOutExisting} onCheckedChange={(x) => setSignOutExisting(x === true)} className="mt-0.5" />
              <span>
                Sign out existing sessions of users on these domains
                <span className="block text-xs text-muted-foreground">
                  On save, people from {newlyEnforced.map((d) => `@${d}`).join(", ")} are signed out on all devices and sign in again
                  through SSO. You and other instance admins stay signed in.
                </span>
              </span>
            </label>
          )}
        </SettingRow>
        <ToggleRow
          label="Create accounts on first sign-in (JIT)"
          description="People from the SSO domains get an account on their first sign-in. Off: only invited people and existing users."
          checked={v.jitProvisioning}
          onCheckedChange={(x) => f.set("jitProvisioning", x)}
        />
        <SettingRow label="Workspace for new users" description="New SSO users join this workspace.">
          <Select value={v.jitWorkspaceId || DEFAULT_WORKSPACE} onValueChange={(x) => f.set("jitWorkspaceId", x === DEFAULT_WORKSPACE ? "" : x)}>
            <SelectTrigger className="w-full sm:max-w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DEFAULT_WORKSPACE}>Default workspace</SelectItem>
              {workspaces.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Default role" description="For new SSO users who match no group mapping.">
          <Select value={v.defaultRoleKey} onValueChange={(x) => f.set("defaultRoleKey", x)}>
            <SelectTrigger className="w-full sm:max-w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((r) => (
                <SelectItem key={r.key} value={r.key}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Group claim" htmlFor="isso-claim" description="ID token claim with the person's IdP groups (e.g. groups, roles).">
          <Input id="isso-claim" value={v.groupClaim} onChange={(e) => f.set("groupClaim", e.target.value)} className="font-mono text-[13px] sm:max-w-72" maxLength={100} />
        </SettingRow>
        <SettingRow label="Group → role mapping" description="Applied when a person joins the workspace via SSO. Roles granting instance administration can't be mapped.">
          <SsoRoleMapEditor value={v.groupRoleMap} onChange={(m) => f.set("groupRoleMap", m)} roles={roles} />
        </SettingRow>
      </Rows>
      <div className="mt-4 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
        <p className="flex items-start gap-1.5">
          <Info className="mt-px size-3.5 shrink-0" />
          <span>
            Entra ID doesn&apos;t send <code className="font-mono">email_verified</code> — add the optional claims{" "}
            <code className="font-mono">xms_edov</code> and <code className="font-mono">email</code> in Token configuration.
          </span>
        </p>
        <p className="flex items-start gap-1.5">
          <Info className="mt-px size-3.5 shrink-0" />
          SAML isn&apos;t supported — use OpenID Connect (Entra ID, Okta, Google Workspace, Keycloak, Auth0 … all support it).
        </p>
      </div>
      {test && <TestResultView result={test} className="mt-3" />}
      <div className="mt-4 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
        {f.dirty && <span className="text-xs text-muted-foreground sm:mr-auto">Unsaved changes · {f.changedCount}</span>}
        <Button type="button" variant="outline" size="sm" className="h-9 sm:h-8" onClick={runTest} disabled={testing || f.dirty || !sso.values.issuerUrl}>
          {testing && <Loader2 className="size-3.5 animate-spin" />} Test discovery
        </Button>
        {f.dirty && (
          <Button type="button" variant="ghost" size="sm" className="h-9 sm:h-8" onClick={f.reset} disabled={f.saving}>
            Discard
          </Button>
        )}
        <Button type="button" size="sm" className="h-9 sm:h-8" onClick={() => void save()} disabled={!f.dirty || f.saving}>
          {f.saving && <Loader2 className="size-3.5 animate-spin" />} Save SSO settings
        </Button>
      </div>
    </Panel>
  );
}

/** Admin → Authentication → Workspace SSO: every workspace's own domains + provider, with an off switch. */
export function WorkspaceSsoOverview({
  rows,
  memberWorkspaceIds,
  allowWorkspaceSso,
}: {
  rows: WorkspaceSsoRow[];
  /** Workspaces the admin belongs to — their SSO tab can be opened directly. */
  memberWorkspaceIds: string[];
  allowWorkspaceSso: boolean;
}) {
  return (
    <Panel
      title="Workspace SSO"
      icon={<Building2 className="size-4" />}
      description={
        allowWorkspaceSso
          ? "Workspace owners configure their own OpenID Connect provider for DNS-verified domains."
          : "Workspace owners can't configure SSO right now (see “Let workspaces configure their own SSO” above). Existing providers keep working."
      }
      contentClassName="p-0 sm:p-0"
    >
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground sm:px-5">No workspace has claimed a domain or configured SSO yet.</p>
      ) : (
        <ul className="divide-y">
          {rows.map((r) => (
            <OverviewRow key={r.workspaceId} row={r} canOpen={memberWorkspaceIds.includes(r.workspaceId)} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

function OverviewRow({ row, canOpen }: { row: WorkspaceSsoRow; canOpen: boolean }) {
  const [pending, start] = useTransition();
  const p = row.provider;
  const verified = row.domains.filter((d) => d.verified).length;
  return (
    <li className="space-y-2 px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-0 truncate text-sm font-medium">{row.workspaceName}</span>
        {p?.enforceSso && <Badge className="h-5 bg-warning/15 text-[10px] text-amber-700 dark:text-amber-300">SSO required</Badge>}
        {p?.jit && (
          <Badge variant="outline" className="h-5 text-[10px]">
            JIT
          </Badge>
        )}
        <div className="ml-auto flex items-center gap-2">
          {p && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              {p.enabled ? "Enabled" : "Disabled"}
              <Switch
                checked={p.enabled}
                disabled={pending}
                aria-label={`SSO for ${row.workspaceName}`}
                onCheckedChange={(enabled) =>
                  start(async () => {
                    const res = await setWorkspaceSsoEnabledAction({ workspaceId: row.workspaceId, enabled });
                    if (!res.ok) toast.error(res.error);
                    else toast.success(`SSO for ${row.workspaceName} ${enabled ? "enabled" : "disabled"}`);
                  })
                }
              />
            </label>
          )}
          {canOpen && (
            <Button asChild variant="ghost" size="sm" className="h-8">
              <Link href={`/settings/workspace?ws=${encodeURIComponent(row.workspaceId)}&tab=sso`}>
                Open <ExternalLink className="size-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {row.domains.map((d) => (
          <Badge
            key={d.id}
            variant="outline"
            className={cn("h-5 gap-1 font-mono text-[10px]", d.verified ? "text-success" : "text-muted-foreground")}
            title={d.verified ? `Verified ${d.verifiedVia === "admin" ? "by an admin" : "via DNS"}` : "Pending verification"}
          >
            {d.verified && <BadgeCheck className="size-3" />}
            {d.domain}
          </Badge>
        ))}
        {row.domains.length === 0 && <span className="text-xs text-muted-foreground">No domains</span>}
      </div>
      {p ? (
        <p className="text-xs break-all text-muted-foreground">
          <span className="font-mono">{p.issuerUrl}</span>
          {p.updatedByEmail && <> · by {p.updatedByEmail}</>}
          {" · "}
          {p.lastLoginAt ? (
            <>
              last SSO sign-in <TimeAgo date={p.lastLoginAt} />
            </>
          ) : (
            "no SSO sign-in yet"
          )}
          {p.enabled && verified === 0 && <span className="text-destructive"> · no verified domain</span>}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">No provider configured.</p>
      )}
    </li>
  );
}

