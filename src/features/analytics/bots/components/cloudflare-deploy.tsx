"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, KeyRound, Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeAgo } from "@/components/app/misc";
import type { CloudflareDeployment, CloudflareZone } from "@/server/analytics/bots/cloudflare-deploy";
import { deployCloudflareWorkerAction, listCloudflareZonesAction } from "../actions";

const TOKEN_URL = "https://dash.cloudflare.com/profile/api-tokens";
const PERMISSIONS = ["Account › Workers Scripts › Edit", "Zone › Workers Routes › Edit", "Zone › Zone › Read"];

/**
 * One-click Worker deploy: the Cloudflare API token lives only in this component's state and the
 * two server actions it is sent to — it is never stored.
 */
export function CloudflareDeployCard({
  projectId,
  domain,
  deployment,
  canManage,
}: {
  projectId: string;
  domain: string;
  deployment: CloudflareDeployment | null;
  canManage: boolean;
}) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [zones, setZones] = useState<CloudflareZone[] | null>(null);
  const [zoneId, setZoneId] = useState("");
  const [result, setResult] = useState<CloudflareDeployment | null>(null);
  const [loading, startLoad] = useTransition();
  const [deploying, startDeploy] = useTransition();

  const byAccount = useMemo(() => {
    const groups = new Map<string, CloudflareZone[]>();
    for (const z of zones ?? []) groups.set(z.accountName, [...(groups.get(z.accountName) ?? []), z]);
    return [...groups];
  }, [zones]);

  const loadZones = () =>
    startLoad(async () => {
      const res = await listCloudflareZonesAction(projectId, token);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setZones(res.data.zones);
      setZoneId(res.data.suggestedZoneId ?? (res.data.zones.length === 1 ? res.data.zones[0]!.id : ""));
    });

  const deploy = () =>
    startDeploy(async () => {
      const res = await deployCloudflareWorkerAction(projectId, { token, zoneId });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setToken("");
      setZones(null);
      setZoneId("");
      setResult(res.data);
      toast.success(`Worker deployed to ${res.data.zoneName}.`);
      router.refresh();
    });

  const current = result ?? deployment;

  return (
    <div className="space-y-3 rounded-xl border bg-background p-3 sm:p-4">
      <div className="flex items-start gap-2.5">
        <Rocket className="mt-0.5 size-4 shrink-0 text-brand" />
        <div className="min-w-0">
          <p className="text-sm font-medium">One-click deploy</p>
          <p className="text-xs text-muted-foreground">
            Paste a Cloudflare API token — we upload the Worker, store a fresh ingest token as its secret and route {domain} through it. The API token is
            used once and never stored.
          </p>
        </div>
      </div>

      {current && (
        <div className="flex items-start gap-2 rounded-lg bg-success/10 p-2.5 text-xs">
          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
          <div className="min-w-0 space-y-0.5">
            <p className="font-medium">
              Worker <code>{current.workerName}</code> live on <code>{current.routePattern}</code>
            </p>
            <p className="text-muted-foreground">
              Zone {current.zoneName} · deployed <TimeAgo date={current.deployedAt} />
              {result && !result.routeCreated ? " · existing route kept" : ""}. Crawler visits appear within minutes of the next bot request.
            </p>
          </div>
        </div>
      )}

      {canManage ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="cf-token" className="text-xs">
              Cloudflare API token
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="cf-token"
                type="password"
                autoComplete="off"
                spellCheck={false}
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setZones(null);
                }}
                placeholder="Paste token"
                className="font-mono text-xs"
              />
              <Button variant="outline" onClick={loadZones} disabled={loading || token.trim().length < 20} className="shrink-0">
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : <KeyRound className="size-3.5" />}
                Load zones
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Create a custom token with{" "}
              {PERMISSIONS.map((p, i) => (
                <span key={p}>
                  <span className="font-medium text-foreground/80">{p}</span>
                  {i < PERMISSIONS.length - 1 ? ", " : " "}
                </span>
              ))}
              for the zone of {domain}.{" "}
              <a href={TOKEN_URL} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-0.5 underline underline-offset-2">
                Open API tokens <ExternalLink className="size-3" />
              </a>
            </p>
          </div>

          {zones && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-1.5">
                <Label className="text-xs">Zone</Label>
                <Select value={zoneId} onValueChange={setZoneId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose the zone of your site" />
                  </SelectTrigger>
                  <SelectContent>
                    {byAccount.map(([account, list]) => (
                      <SelectGroup key={account}>
                        <SelectLabel>{account}</SelectLabel>
                        {list.map((z) => (
                          <SelectItem key={z.id} value={z.id} disabled={z.status !== "active"}>
                            {z.name}
                            {z.status !== "active" ? ` (${z.status})` : ""}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={deploy} disabled={deploying || !zoneId} className="shrink-0">
                {deploying ? <Loader2 className="size-3.5 animate-spin" /> : <Rocket className="size-3.5" />}
                {current ? "Redeploy Worker" : "Deploy Worker"}
              </Button>
            </div>
          )}
          {zones && (
            <p className="text-[11px] text-muted-foreground">
              Deploying issues a new Cloudflare ingest token for this project (the previous one stops working) and adds the route{" "}
              <code>*zone/*</code> unless another Worker already owns it. Responses of your site are passed through unchanged.
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Ask a project admin (Settings permission) to deploy the Worker.</p>
      )}
    </div>
  );
}
