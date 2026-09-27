import type { Instance } from "@/server/db/schema";

/** Progress shown while a dedicated instance is set up: Payment received → Creating → Starting → Ready. */
export const PROVISION_STEPS = ["Payment received", "Creating instance", "Starting", "Ready"] as const;
/** Shared workspaces are created in one call: Payment received → Creating workspace → Ready. */
export const SHARED_PROVISION_STEPS = ["Payment received", "Creating workspace", "Ready"] as const;

export function provisionSteps(backend: Instance["backend"]): readonly string[] {
  return backend === "shared" ? SHARED_PROVISION_STEPS : PROVISION_STEPS;
}

export type InstanceView = {
  id: string;
  slug: string;
  host: string;
  url: string;
  status: Instance["status"];
  /** "shared": a workspace in the shared app; "coolify": a dedicated instance. */
  backend: Instance["backend"];
  /** Setup steps for this backend. */
  steps: readonly string[];
  /** Index into `steps` of the step currently in progress (steps.length = done). */
  step: number;
  workspaceName: string;
  subscriptionStatus: string | null;
  /** Granted without payment by an admin (see instances.complimentary). */
  complimentary: boolean;
  stoppedByAdmin: boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  lastHealthAt: string | null;
  healthy: boolean | null;
  /** Retry scheduled after a transient provisioning error. */
  retrying: boolean;
  /** Raw error details are for admins only; customers just learn that something went wrong. */
  hasError: boolean;
  error: string | null;
  createdAt: string;
};

export function provisionStep(
  i: Pick<Instance, "status" | "coolifyServiceUuid" | "startRequestedAt"> & { backend?: Instance["backend"] },
): number {
  const steps = provisionSteps(i.backend ?? "coolify");
  if (i.status === "running") return steps.length;
  if (i.status === "pending_payment") return 0;
  if (i.backend === "shared") return 1;
  if (!i.coolifyServiceUuid) return 1;
  return i.startRequestedAt ? 2 : 1;
}

/** Client-safe projection (no secrets, no Coolify ids). `sharedAppUrl` is the public URL of the shared app. */
export function toInstanceView(i: Instance, opts: { includeError?: boolean; sharedAppUrl?: string } = {}): InstanceView {
  return {
    id: i.id,
    slug: i.slug,
    host: i.host,
    url: i.backend === "shared" && opts.sharedAppUrl ? opts.sharedAppUrl : `https://${i.host}`,
    status: i.status,
    backend: i.backend,
    steps: provisionSteps(i.backend),
    step: provisionStep(i),
    workspaceName: i.workspaceName,
    subscriptionStatus: i.subscriptionStatus,
    complimentary: i.complimentary,
    stoppedByAdmin: i.stoppedByAdmin,
    currentPeriodEnd: i.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: i.cancelAtPeriodEnd,
    lastHealthAt: i.lastHealthAt?.toISOString() ?? null,
    healthy: i.lastHealthOk,
    retrying: i.status === "provisioning" && !!i.error && !!i.nextProvisionAt,
    hasError: !!i.error,
    error: opts.includeError ? i.error : null,
    createdAt: i.createdAt.toISOString(),
  };
}
