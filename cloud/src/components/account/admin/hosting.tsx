"use client";

import { useActionState } from "react";
import { Cable, ExternalLink, Layers, Save, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ActionButton } from "@/components/account/action-button";
import { savePlanAction, testSharedAppAction, type AdminActionState } from "@/server/actions/admin";
import { Field, FormResult, StatusRow, useResultToast } from "./form-bits";

export type SharedAppView = {
  configured: boolean;
  ok: boolean;
  commit?: string;
  error?: string;
  publicUrl: string;
  internalUrl: string;
  hasSsoSecret: boolean;
  workspaces: number;
};

/** Status of the shared AutoSEO instance every Cloud workspace lives in (docs/CLOUD.md). */
export function SharedAppCard({ app }: { app: SharedAppView }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Layers className="size-4" /> Shared app
          </CardTitle>
          {!app.configured ? (
            <Badge variant="outline" className="text-muted-foreground">
              Not configured
            </Badge>
          ) : app.ok ? (
            <Badge className="bg-brand-soft text-brand dark:bg-brand/15">Healthy</Badge>
          ) : (
            <Badge className="bg-destructive/10 text-destructive">Unreachable</Badge>
          )}
        </div>
        <CardDescription>
          New customers get a workspace in this AutoSEO instance. It runs in the same Coolify resource as this app and is
          configured through <span className="font-mono">CLOUD_APP_INTERNAL_URL</span>, <span className="font-mono">CLOUD_APP_URL</span>
          , <span className="font-mono">CLOUD_API_SECRET</span> and <span className="font-mono">CLOUD_SSO_SECRET</span>. Without it,
          new customers get dedicated Coolify instances.
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y">
        <StatusRow label="Public URL" value={app.publicUrl} />
        <StatusRow label="Internal URL" value={app.internalUrl || "missing"} ok={!!app.internalUrl} />
        <StatusRow label="SSO secret" value={app.hasSsoSecret ? "•••• set" : "missing"} ok={app.hasSsoSecret} />
        <StatusRow label="Version" value={app.commit ? app.commit.slice(0, 12) : "—"} ok={!!app.commit} />
        <StatusRow label="Workspaces" value={String(app.workspaces)} />
        {app.error && <p className="pt-2 text-xs text-destructive">{app.error}</p>}
        <p className="pt-2 text-xs text-muted-foreground">
          The operator (instance admin) signs in to the shared app with their own email — one-click SSO from the cloud is
          only for customers.
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 border-t py-3">
        <ActionButton variant="outline" size="sm" action={testSharedAppAction} disabled={!app.configured} icon={<Cable />}>
          Test & push mail settings
        </ActionButton>
        {app.configured && (
          <Button asChild variant="outline" size="sm">
            <a href={`${app.publicUrl}/login`} target="_blank" rel="noopener">
              <ExternalLink /> Open app (sign in as operator)
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

/** What every shared workspace includes; saving pushes it to all existing workspaces. */
export function PlanForm({ plan }: { plan: { monthlyBudgetUsd: number; maxProjects: number } }) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(savePlanAction, {});
  useResultToast(state);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WalletCards className="size-4" /> Plan
        </CardTitle>
        <CardDescription>
          Limits of every shared workspace. The included usage is the monthly AI / data provider cost a workspace may spend
          (customers see usage against it, not raw costs). Saving applies the limits to all existing workspaces.
        </CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Included monthly usage (USD)"
            htmlFor="monthlyBudgetUsd"
            hint="Provider cost per workspace and month. 0 means nothing is included — paid AI / data usage is blocked."
          >
            <Input id="monthlyBudgetUsd" name="monthlyBudgetUsd" type="number" required min={0} max={10000} step="0.01" defaultValue={plan.monthlyBudgetUsd} />
          </Field>
          <Field label="Max projects" htmlFor="maxProjects" hint="Per workspace.">
            <Input id="maxProjects" name="maxProjects" type="number" required min={1} max={1000} step={1} defaultValue={plan.maxProjects} />
          </Field>
        </CardContent>
        <CardFooter className="mt-4 flex flex-col items-stretch gap-3 border-t py-4 sm:flex-row sm:items-center sm:justify-between">
          <FormResult state={state} />
          <Button type="submit" disabled={pending}>
            {pending ? <Spinner /> : <Save />} Save & apply
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
