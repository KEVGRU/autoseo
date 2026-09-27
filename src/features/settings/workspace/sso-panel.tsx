"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, BadgeCheck, Globe, Info, KeyRound, Loader2, Lock, Plus, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Panel } from "@/components/app/page";
import { ConfirmButton, CopyButton, TimeAgo } from "@/components/app/misc";
import { Rows, SecretInput, SettingRow, TestResultView, ToggleRow, type TestOutcome } from "@/features/admin/components/settings-kit";
import { cn } from "@/lib/utils";
import type { WorkspaceSsoView } from "@/server/auth/oidc/workspace-sso";
import {
  addSsoDomainAction,
  adminVerifySsoDomainAction,
  deleteSsoProviderAction,
  removeSsoDomainAction,
  saveSsoProviderAction,
  testSsoProviderAction,
  verifySsoDomainAction,
} from "./sso-actions";
import { SsoRoleMapEditor, type SsoRoleOption } from "./sso-role-map";

const ISSUER_HINT =
  "e.g. https://login.microsoftonline.com/<tenant-id>/v2.0 · https://<org>.okta.com · https://accounts.google.com · https://<keycloak>/realms/<realm>";

type Domain = WorkspaceSsoView["domains"][number];

/** Settings → Workspace → Single sign-on: verified email domains + the workspace's own OpenID Connect provider. */
export function SsoPanel({
  workspaceId,
  view,
  canEdit,
  isInstanceAdmin,
  readOnlyReason,
  redirectUri,
  roles,
}: {
  workspaceId: string;
  view: WorkspaceSsoView;
  canEdit: boolean;
  isInstanceAdmin: boolean;
  /** Shown when the viewer can't edit (e.g. workspace SSO not enabled on the instance). */
  readOnlyReason: string | null;
  redirectUri: string;
  /** Roles the viewer may hand out through SSO (never roles granting instance administration). */
  roles: SsoRoleOption[];
}) {
  const verifiedCount = view.domains.filter((d) => d.active).length;
  return (
    <div className="space-y-4">
      {readOnlyReason && (
        <Alert>
          <Lock className="size-4" />
          <AlertDescription>{readOnlyReason}</AlertDescription>
        </Alert>
      )}
      <DomainsCard workspaceId={workspaceId} domains={view.domains} canEdit={canEdit} isInstanceAdmin={isInstanceAdmin} />
      <ProviderCard
        workspaceId={workspaceId}
        provider={view.provider}
        verifiedCount={verifiedCount}
        canEdit={canEdit}
        redirectUri={redirectUri}
        roles={roles}
      />
      <p className="flex items-start gap-1.5 px-1 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-px size-3.5 shrink-0" />
        SAML isn&apos;t supported — use OpenID Connect (Entra ID, Okta, Google Workspace, Keycloak, Auth0 … all support it).
      </p>
    </div>
  );
}

/* ───────────────────────────── Domains ───────────────────────────── */

function DomainStatus({ d }: { d: Domain }) {
  if (d.verified && !d.active) {
    return (
      <Badge className="h-5 bg-warning/15 text-[10px] text-amber-700 dark:text-amber-300" title="The DNS record couldn't be re-confirmed recently — sign-ins for this domain are paused until “Check DNS” succeeds.">
        Re-check needed
      </Badge>
    );
  }
  if (d.verified) {
    return (
      <Badge className="h-5 gap-1 bg-success/12 text-[10px] text-success">
        <BadgeCheck className="size-3" /> {d.verifiedVia === "admin" ? "Verified by admin" : "Verified via DNS"}
      </Badge>
    );
  }
  if (d.takenElsewhere) {
    return (
      <Badge variant="outline" className="h-5 text-[10px] text-destructive">
        Taken by another workspace
      </Badge>
    );
  }
  return <Badge className="h-5 bg-warning/15 text-[10px] text-amber-700 dark:text-amber-300">Pending</Badge>;
}

function DomainsCard({ workspaceId, domains, canEdit, isInstanceAdmin }: { workspaceId: string; domains: Domain[]; canEdit: boolean; isInstanceAdmin: boolean }) {
  const [draft, setDraft] = useState("");
  const [pending, start] = useTransition();
  const add = () =>
    start(async () => {
      const res = await addSsoDomainAction({ workspaceId, domain: draft });
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("Domain added — now add the DNS record to verify it");
        setDraft("");
      }
    });

  return (
    <Panel
      title="Email domains"
      icon={<Globe className="size-4 text-muted-foreground" />}
      description="A domain can belong to one workspace only. People with these email addresses sign in through your provider."
      contentClassName="p-0 sm:p-0"
    >
      {canEdit && (
        <form
          className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:px-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) add();
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="example.com"
            aria-label="Domain"
            className="min-w-0 font-mono text-[13px] sm:flex-1"
            maxLength={260}
          />
          <Button type="submit" size="sm" className="h-9 sm:h-8" disabled={pending || !draft.trim()}>
            {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />} Add domain
          </Button>
        </form>
      )}
      {domains.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground sm:px-5">
          No domains yet. Add your company&apos;s email domain and prove you own it with a DNS TXT record.
        </p>
      ) : (
        <ul className="divide-y">
          {domains.map((d) => (
            <DomainRow key={d.id} workspaceId={workspaceId} d={d} canEdit={canEdit} isInstanceAdmin={isInstanceAdmin} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

function DomainRow({ workspaceId, d, canEdit, isInstanceAdmin }: { workspaceId: string; d: Domain; canEdit: boolean; isInstanceAdmin: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const check = () =>
    start(async () => {
      setError(null);
      const res = await verifySsoDomainAction({ workspaceId, domainId: d.id });
      if (!res.ok) toast.error(res.error);
      else if (res.data.verified) toast.success(`${d.domain} verified`);
      else setError(res.data.error);
    });
  const shownError = error ?? (!d.active ? d.lastError : null);
  // DNS proofs are re-confirmed daily; a stale one (or a claim held by another workspace whose record may be gone)
  // can be checked again.
  const needsDns = !d.active;

  return (
    <li className="space-y-3 px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-0 font-mono text-sm font-medium break-all">{d.domain}</span>
        <DomainStatus d={d} />
        <div className="ml-auto flex items-center gap-1">
          {canEdit && needsDns && (
            <Button type="button" variant="outline" size="sm" className="h-8" onClick={check} disabled={pending}>
              {pending ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />} Check DNS
            </Button>
          )}
          {isInstanceAdmin && !d.verified && !d.takenElsewhere && (
            <ConfirmButton
              title={`Verify ${d.domain} without DNS?`}
              description="Only do this when you know the workspace controls this domain (e.g. your own company on a self-hosted instance). Everyone with an address on this domain will sign in through this workspace's provider."
              confirmLabel="Verify domain"
              onConfirm={async () => {
                const res = await adminVerifySsoDomainAction({ workspaceId, domainId: d.id });
                if (!res.ok) toast.error(res.error);
                else toast.success(`${d.domain} verified`);
              }}
            >
              <Button type="button" variant="ghost" size="sm" className="h-8">
                <ShieldCheck className="size-3.5" /> <span className="hidden sm:inline">Verify without DNS</span>
                <span className="sm:hidden">Verify</span>
              </Button>
            </ConfirmButton>
          )}
          {canEdit && (
            <ConfirmButton
              title={`Remove ${d.domain}?`}
              description={
                d.verified
                  ? "People with this domain will no longer sign in through this workspace's provider. You'd have to verify it again to re-add it."
                  : "The pending claim is removed."
              }
              confirmLabel="Remove"
              destructive
              onConfirm={async () => {
                const res = await removeSsoDomainAction({ workspaceId, domainId: d.id });
                if (!res.ok) toast.error(res.error);
                else toast.success(`${d.domain} removed`);
              }}
            >
              <Button type="button" variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" aria-label={`Remove ${d.domain}`}>
                <Trash2 className="size-3.5" />
              </Button>
            </ConfirmButton>
          )}
        </div>
      </div>
      {needsDns && (
        <div className="space-y-2 rounded-xl border border-dashed bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            {d.takenElsewhere
              ? "Another workspace verified this domain. If you control it: publish this TXT record and remove the other workspace's record, then click “Check DNS” to take it over."
              : "Add this TXT record at your DNS provider (keep it in place — it's re-checked daily), then click “Check DNS”:"}
          </p>
          <dl className="grid gap-2 text-xs sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-x-4">
            <dt className="text-muted-foreground">Type</dt>
            <dd className="font-mono">TXT</dd>
            <dt className="text-muted-foreground">Host / name</dt>
            <dd className="font-mono break-all">
              @ <span className="text-muted-foreground">({d.domain})</span>
            </dd>
            <dt className="text-muted-foreground">Value</dt>
            <dd className="flex min-w-0 items-center gap-1.5">
              <code className="min-w-0 flex-1 truncate rounded-md bg-background px-2 py-1 font-mono text-[12px]" title={d.record}>
                {d.record}
              </code>
              <CopyButton value={d.record} size="icon" />
            </dd>
          </dl>
          {d.lastCheckedAt && (
            <p className="text-[11px] text-muted-foreground">
              Last checked <TimeAgo date={d.lastCheckedAt} />
            </p>
          )}
        </div>
      )}
      {d.takenElsewhere && (
        <p className="text-xs text-muted-foreground">Another workspace already verified this domain, so it can&apos;t be claimed here.</p>
      )}
      {shownError && (
        <p className="flex items-start gap-1.5 text-xs text-destructive">
          <AlertTriangle className="mt-px size-3 shrink-0" /> <span className="break-words">{shownError}</span>
        </p>
      )}
    </li>
  );
}

/* ───────────────────────────── Provider ───────────────────────────── */

type Provider = NonNullable<WorkspaceSsoView["provider"]>;

function initialForm(p: Provider | null, roles: SsoRoleOption[]) {
  return {
    name: p?.name ?? "Single sign-on",
    enabled: p?.enabled ?? true,
    issuerUrl: p?.issuerUrl ?? "",
    clientId: p?.clientId ?? "",
    scopes: p?.scopes ?? "openid email profile",
    jitProvisioning: p?.jitProvisioning ?? true,
    defaultRoleKey: p?.defaultRoleKey ?? roles.find((r) => r.key === "member")?.key ?? roles[0]?.key ?? "member",
    groupClaim: p?.groupClaim ?? "groups",
    groupRoleMap: p?.groupRoleMap ?? {},
    enforceSso: p?.enforceSso ?? false,
  };
}

function ProviderCard({
  workspaceId,
  provider,
  verifiedCount,
  canEdit,
  redirectUri,
  roles,
}: {
  workspaceId: string;
  provider: Provider | null;
  verifiedCount: number;
  canEdit: boolean;
  redirectUri: string;
  roles: SsoRoleOption[];
}) {
  const [form, setForm] = useState(() => initialForm(provider, roles));
  const [secret, setSecret] = useState<string | undefined>(undefined);
  // Offered when this save turns "Require SSO" on (on by default): existing email-link sessions end.
  const [signOutExisting, setSignOutExisting] = useState(true);
  const turningOnEnforcement = form.enabled && form.enforceSso && !(provider?.enabled && provider.enforceSso);
  const [saving, startSave] = useTransition();
  const [testing, startTest] = useTransition();
  const [test, setTest] = useState<TestOutcome | null>(null);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  // The current default role may not be grantable by this viewer — keep it visible in the select.
  const roleOptions = roles.some((r) => r.key === form.defaultRoleKey) ? roles : [...roles, { key: form.defaultRoleKey, name: form.defaultRoleKey }];

  const save = () =>
    startSave(async () => {
      const res = await saveSsoProviderAction({
        workspaceId,
        ...form,
        clientSecret: secret === undefined ? "__keep__" : secret,
        signOutExisting: turningOnEnforcement && signOutExisting,
      });
      if (!res.ok) toast.error(res.error);
      else {
        const out = res.data.signedOut;
        toast.success(provider ? "SSO provider saved" : "SSO provider created", {
          description: out ? `Signed out ${out.sessions} session${out.sessions === 1 ? "" : "s"} of ${out.users} ${out.users === 1 ? "person" : "people"}.` : undefined,
        });
        setSecret(undefined);
      }
    });

  const runTest = () =>
    startTest(async () => {
      setTest(null);
      const res = await testSsoProviderAction({ workspaceId });
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

  const disabled = !canEdit;
  return (
    <Panel
      title="Identity provider (OpenID Connect)"
      icon={<KeyRound className="size-4 text-muted-foreground" />}
      description={
        provider?.lastLoginAt ? (
          <>
            Last SSO sign-in <TimeAgo date={provider.lastLoginAt} />
          </>
        ) : (
          "Register AutoSEO as a web application at your identity provider, then enter its details here."
        )
      }
      actions={
        provider ? (
          <Badge variant="outline" className={cn("h-5 text-[10px]", provider.enabled ? "text-success" : "text-muted-foreground")}>
            {provider.enabled ? "Enabled" : "Disabled"}
          </Badge>
        ) : null
      }
    >
      {provider?.enabled && verifiedCount === 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="size-4" />
          <AlertDescription>No verified domain yet — nobody can sign in through this provider.</AlertDescription>
        </Alert>
      )}
      <Rows>
        <SettingRow label="Redirect URI" description="Register exactly this URL at your identity provider (web platform).">
          <div className="flex min-w-0 items-center gap-1.5">
            <code className="min-w-0 flex-1 truncate rounded-md border bg-muted/40 px-2 py-1.5 font-mono text-[12px]" title={redirectUri}>
              {redirectUri}
            </code>
            <CopyButton value={redirectUri} size="icon" />
          </div>
        </SettingRow>
        <ToggleRow label="Enabled" description="Offer “Continue with SSO” to people from your verified domains." checked={form.enabled} onCheckedChange={(v) => set("enabled", v)} disabled={disabled} />
        <SettingRow label="Button label" htmlFor="sso-name" description="Shown on the sign-in page, e.g. “Acme SSO”.">
          <Input id="sso-name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={60} disabled={disabled} />
        </SettingRow>
        <SettingRow label="Issuer URL" htmlFor="sso-issuer" description={ISSUER_HINT}>
          <Input
            id="sso-issuer"
            value={form.issuerUrl}
            onChange={(e) => set("issuerUrl", e.target.value)}
            placeholder="https://login.microsoftonline.com/…/v2.0"
            className="font-mono text-[13px]"
            maxLength={500}
            disabled={disabled}
          />
        </SettingRow>
        <SettingRow label="Client ID" htmlFor="sso-client">
          <Input id="sso-client" value={form.clientId} onChange={(e) => set("clientId", e.target.value)} className="font-mono text-[13px]" maxLength={256} disabled={disabled} />
        </SettingRow>
        <SettingRow label="Client secret" htmlFor="sso-secret" description="Stored encrypted, never shown again.">
          {disabled ? (
            <p className="text-sm text-muted-foreground">{provider?.secretSet ? "•••••• (saved)" : "Not set"}</p>
          ) : (
            <SecretInput id="sso-secret" isSet={Boolean(provider?.secretSet)} value={secret} onChange={setSecret} placeholder="Paste the client secret…" />
          )}
        </SettingRow>
        <SettingRow label="Scopes" htmlFor="sso-scopes" description="openid and email are always requested.">
          <Input id="sso-scopes" value={form.scopes} onChange={(e) => set("scopes", e.target.value)} className="font-mono text-[13px]" maxLength={500} disabled={disabled} />
        </SettingRow>
        <ToggleRow
          label="Create accounts on first sign-in (JIT)"
          description="People from your verified domains get an account and join this workspace with the mapped role. Off: only invited people and existing members can sign in."
          checked={form.jitProvisioning}
          onCheckedChange={(v) => set("jitProvisioning", v)}
          disabled={disabled}
        />
        <SettingRow label="Default role" description="For people who join via SSO and match no group mapping.">
          <Select value={form.defaultRoleKey} onValueChange={(v) => set("defaultRoleKey", v)} disabled={disabled}>
            <SelectTrigger className="w-full sm:max-w-64">
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
        <SettingRow label="Group claim" htmlFor="sso-claim" description="ID token claim with the person's IdP groups (e.g. groups, roles).">
          <Input id="sso-claim" value={form.groupClaim} onChange={(e) => set("groupClaim", e.target.value)} className="font-mono text-[13px] sm:max-w-64" maxLength={100} disabled={disabled} />
        </SettingRow>
        <SettingRow label="Group → role mapping" description="Applied when a person joins this workspace via SSO. Existing members keep their role.">
          <SsoRoleMapEditor value={form.groupRoleMap} onChange={(m) => set("groupRoleMap", m)} roles={roles} disabled={disabled} />
        </SettingRow>
        <ToggleRow
          label="Require SSO for these domains"
          description="Disables magic links and invitation links for your verified domains — members must sign in through this provider."
          checked={form.enforceSso}
          onCheckedChange={(v) => set("enforceSso", v)}
          disabled={disabled}
        />
      </Rows>
      {form.enforceSso && (
        <Alert className="mt-4">
          <AlertTriangle className="size-4" />
          <AlertDescription>
            Test the sign-in first. With SSO required, people from your domains can&apos;t use email links anymore — if the provider breaks,
            only an instance administrator can help.
          </AlertDescription>
        </Alert>
      )}
      {turningOnEnforcement && canEdit && (
        <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-xl border bg-muted/30 p-3 text-sm">
          <Checkbox checked={signOutExisting} onCheckedChange={(v) => setSignOutExisting(v === true)} className="mt-0.5" />
          <span>
            Sign out existing sessions of users on these domains
            <span className="block text-xs text-muted-foreground">
              When you save, people from your verified domains are signed out on all devices and sign in again through SSO. You stay signed in.
            </span>
          </span>
        </label>
      )}
      <p className="mt-4 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-px size-3.5 shrink-0" />
        <span>
          Entra ID doesn&apos;t send <code className="font-mono">email_verified</code> — add the optional claims <code className="font-mono">xms_edov</code>{" "}
          and <code className="font-mono">email</code> in Token configuration.
        </span>
      </p>
      {test && <TestResultView result={test} className="mt-3" />}
      {canEdit && (
        <div className="mt-4 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center">
          {provider && (
            <ConfirmButton
              title="Delete the SSO provider?"
              description="People from your domains sign in with email links again (verified domains stay claimed)."
              confirmLabel="Delete provider"
              destructive
              onConfirm={async () => {
                const res = await deleteSsoProviderAction({ workspaceId });
                if (!res.ok) toast.error(res.error);
                else {
                  toast.success("SSO provider deleted");
                  setForm(initialForm(null, roles));
                  setSecret(undefined);
                  setTest(null);
                }
              }}
            >
              <Button type="button" variant="ghost" size="sm" className="h-9 text-destructive hover:text-destructive sm:h-8">
                <Trash2 className="size-3.5" /> Delete
              </Button>
            </ConfirmButton>
          )}
          <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row">
            {provider && (
              <Button type="button" variant="outline" size="sm" className="h-9 sm:h-8" onClick={runTest} disabled={testing}>
                {testing && <Loader2 className="size-3.5 animate-spin" />} Test discovery
              </Button>
            )}
            <Button type="button" size="sm" className="h-9 sm:h-8" onClick={save} disabled={saving || !form.issuerUrl.trim() || !form.clientId.trim()}>
              {saving && <Loader2 className="size-3.5 animate-spin" />} {provider ? "Save provider" : "Create provider"}
            </Button>
          </div>
        </div>
      )}
    </Panel>
  );
}
