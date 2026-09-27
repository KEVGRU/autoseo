import "server-only";
import { env } from "@/server/env";
import { PROVIDERS } from "@/lib/integrations-catalog";
import { generateIngestToken, getIntegration, issueIngestToken } from "@/server/integrations/store";
import {
  WORKER_COMPATIBILITY_DATE,
  WORKER_TOKEN_BINDING,
  buildCloudflareWorkerScript,
  explainCloudflareError,
  routePatternForZone,
  workerNameForZone,
  type CloudflareApiErrorInfo,
} from "./cloudflare-worker";

/**
 * One-click Cloudflare Worker deploy for bot logging. The user's Cloudflare API token is used for
 * the duration of a single server action and is never stored, logged or returned.
 */

const CF_API = "https://api.cloudflare.com/client/v4";
const TIMEOUT_MS = 20_000;

export class CloudflareDeployError extends Error {}

type CfEnvelope<T> = { success: boolean; errors?: CloudflareApiErrorInfo[]; result: T; result_info?: { page: number; total_pages: number } };

async function cf<T>(token: string, step: Parameters<typeof explainCloudflareError>[0], path: string, init: RequestInit = {}): Promise<CfEnvelope<T>> {
  let res: Response;
  try {
    res = await fetch(`${CF_API}${path}`, {
      ...init,
      headers: { ...(init.headers ?? {}), authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    throw new CloudflareDeployError("Could not reach the Cloudflare API — try again.");
  }
  let body: CfEnvelope<T> | null = null;
  try {
    body = (await res.json()) as CfEnvelope<T>;
  } catch {
    body = null;
  }
  if (!res.ok || !body?.success) throw new CloudflareDeployError(explainCloudflareError(step, res.status, body?.errors ?? []));
  return body;
}

export type CloudflareZone = { id: string; name: string; status: string; accountId: string; accountName: string };

type RawZone = { id: string; name: string; status: string; account: { id: string; name: string } };

/** Active zones the token can read (each carries its account — the Worker is uploaded there). */
export async function listCloudflareZones(token: string): Promise<CloudflareZone[]> {
  const zones: CloudflareZone[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await cf<RawZone[]>(token, "zones", `/zones?per_page=50&page=${page}`);
    for (const z of res.result) zones.push({ id: z.id, name: z.name, status: z.status, accountId: z.account.id, accountName: z.account.name });
    if (!res.result_info || page >= res.result_info.total_pages) break;
  }
  if (!zones.length) throw new CloudflareDeployError("The API token cannot see any zone — add the permission “Zone › Zone › Read” for your site's zone.");
  return zones.sort((a, b) => a.accountName.localeCompare(b.accountName) || a.name.localeCompare(b.name));
}

export type CloudflareDeployment = {
  workerName: string;
  accountId: string;
  zoneId: string;
  zoneName: string;
  routePattern: string;
  routeCreated: boolean;
  deployedAt: string;
};

type RawRoute = { id: string; pattern: string; script: string | null; request_limit_fail_open?: boolean };

/**
 * Uploads the logging Worker (ingest token as secret binding) to the zone's account and routes
 * `*zone/*` through it. The ingest token is only activated after Cloudflare accepted the Worker,
 * so a failed deploy leaves the current token (and any manually deployed Worker) working.
 */
export async function deployCloudflareWorker(input: {
  token: string;
  zoneId: string;
  projectId: string;
  userId: string | null;
}): Promise<CloudflareDeployment> {
  const zone = await cf<RawZone>(input.token, "zone", `/zones/${encodeURIComponent(input.zoneId)}`);
  const { account, name: zoneName } = zone.result;
  const workerName = workerNameForZone(zoneName);
  const routePattern = routePatternForZone(zoneName);

  const routes = await cf<RawRoute[]>(input.token, "routes", `/zones/${encodeURIComponent(input.zoneId)}/workers/routes`);
  const existing = routes.result.find((r) => r.pattern.toLowerCase() === routePattern);
  if (existing && existing.script && existing.script !== workerName) {
    throw new CloudflareDeployError(
      `The route ${routePattern} already runs the Worker “${existing.script}”. Remove or change that route in Cloudflare (Workers Routes) first — we don't replace other Workers.`,
    );
  }

  const ingestToken = generateIngestToken();
  const script = buildCloudflareWorkerScript({ projectId: input.projectId, endpoint: `${env.appUrl}/api/webhooks/server-logs` });
  const form = new FormData();
  form.append(
    "metadata",
    new Blob(
      [
        JSON.stringify({
          main_module: "worker.js",
          compatibility_date: WORKER_COMPATIBILITY_DATE,
          bindings: [{ type: "secret_text", name: WORKER_TOKEN_BINDING, text: ingestToken }],
        }),
      ],
      { type: "application/json" },
    ),
  );
  form.append("worker.js", new Blob([script], { type: "application/javascript+module" }), "worker.js");
  await cf(input.token, "script", `/accounts/${encodeURIComponent(account.id)}/workers/scripts/${workerName}`, { method: "PUT", body: form });

  // The route covers every request of the zone: it must "fail open" (bypass the Worker) when the
  // Workers Free daily request limit is hit — Cloudflare defaults new routes to fail closed (error 1027).
  const routeBody = JSON.stringify({ pattern: routePattern, script: workerName, request_limit_fail_open: true });
  const routePath = (id?: string) => `/zones/${encodeURIComponent(input.zoneId)}/workers/routes${id ? `/${encodeURIComponent(id)}` : ""}`;
  let routeCreated = false;
  if (!existing) {
    const created = await cf<RawRoute>(input.token, "routes", routePath(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: routeBody,
    });
    if (created.result?.id && created.result.request_limit_fail_open !== true) {
      await cf(input.token, "routes", routePath(created.result.id), { method: "PUT", headers: { "content-type": "application/json" }, body: routeBody });
    }
    routeCreated = true;
  } else if (!existing.script) {
    await cf(input.token, "routes", routePath(existing.id), { method: "PUT", headers: { "content-type": "application/json" }, body: routeBody });
    routeCreated = true;
  }

  const deployment: CloudflareDeployment = {
    workerName,
    accountId: account.id,
    zoneId: input.zoneId,
    zoneName,
    routePattern,
    routeCreated,
    deployedAt: new Date().toISOString(),
  };
  await issueIngestToken({
    projectId: input.projectId,
    provider: PROVIDERS.cloudflare,
    connectedBy: input.userId,
    token: ingestToken,
    config: { workerDeployment: deployment },
  });
  return deployment;
}

/** Last one-click deployment of the project (non-secret metadata kept in the integration config). */
export async function getCloudflareDeployment(projectId: string): Promise<CloudflareDeployment | null> {
  const row = await getIntegration(projectId, PROVIDERS.cloudflare);
  const d = row?.config?.workerDeployment as CloudflareDeployment | undefined;
  return row?.tokenHash && d && typeof d.workerName === "string" ? d : null;
}
