"use client";

import { useActionState, useState } from "react";
import { Gift, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { grantFreeInstanceAction, type GrantState } from "@/server/actions/admin";
import { SlugField, useInstanceNaming, useSlugAvailability, WorkspaceNameField } from "@/components/account/slug-field";
import { Switch } from "@/components/ui/switch";
import { FormResult, useResultToast } from "./form-bits";

/**
 * Admin → Customers: give someone a complimentary workspace in the shared app — or, optionally (or when the shared
 * app isn't configured), a dedicated Coolify instance at an address. The account is created by email if needed.
 */
export function GrantForm({ baseDomain, shared }: { baseDomain: string; shared: boolean }) {
  const [state, action, pending] = useActionState<GrantState, FormData>(grantFreeInstanceAction, {});
  useResultToast(state);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="size-4" /> {shared ? "Grant free workspace" : "Grant free instance"}
        </CardTitle>
        <CardDescription>
          {shared
            ? "Creates a complimentary workspace in the shared app without payment. "
            : "Creates a complimentary instance without payment and starts it right away. "}
          The account is created for the email if it doesn&apos;t exist yet; the owner gets the usual &ldquo;ready&rdquo; email
          with a sign-in button.
        </CardDescription>
      </CardHeader>
      <form action={action}>
        {/* A new key after each grant clears the fields. */}
        <GrantFields key={state.resetKey ?? 0} baseDomain={baseDomain} shared={shared} pending={pending} state={state} />
      </form>
    </Card>
  );
}

function GrantFields({ baseDomain, shared, pending, state }: { baseDomain: string; shared: boolean; pending: boolean; state: GrantState }) {
  const naming = useInstanceNaming();
  const [dedicated, setDedicated] = useState(!shared);
  const availability = useSlugAvailability(dedicated ? naming.slug : "");
  const ready = !!naming.workspaceName.trim() && (!dedicated || availability.state === "ok");
  return (
    <>
      <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-3 [&>*]:min-w-0">
        <div className="space-y-2">
          <Label htmlFor="grant-email">Owner email</Label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="grant-email" name="email" type="email" required autoComplete="off" placeholder="owner@company.com" className="h-11 pl-9 text-base" />
          </div>
        </div>
        <WorkspaceNameField id="grant-workspaceName" value={naming.workspaceName} onChange={naming.setWorkspaceName} />
        {dedicated ? (
          <SlugField id="grant-slug" label="Address" slug={naming.slug} onChange={naming.setSlug} baseDomain={baseDomain} availability={availability} />
        ) : (
          <div className="hidden lg:block" />
        )}
        {shared && (
          <div className="lg:col-span-3">
            <DedicatedSwitch checked={dedicated} onChange={setDedicated} />
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-4 flex flex-col items-stretch gap-3 border-t py-4 sm:flex-row sm:items-center sm:justify-between">
        <FormResult state={state} />
        <Button type="submit" disabled={pending || !ready}>
          {pending ? <Spinner /> : <Gift />} {dedicated ? "Grant free instance" : "Grant free workspace"}
        </Button>
      </CardFooter>
    </>
  );
}

function DedicatedSwitch({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label htmlFor="grant-dedicated" className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-3">
      <span className="space-y-0.5">
        <span className="block text-sm font-medium">Dedicated instance (Coolify)</span>
        <span className="block text-xs text-muted-foreground">
          Its own server at an address of its own instead of a workspace in the shared app. Needs Coolify (Hosting tab).
        </span>
      </span>
      <Switch id="grant-dedicated" name="dedicated" checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
