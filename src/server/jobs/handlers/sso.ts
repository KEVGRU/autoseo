import "server-only";
import { defineJob, defineSchedule } from "../define";
import { enqueueJob } from "../queue";
import { recheckAllDnsDomains } from "@/server/auth/oidc/workspace-sso";

/**
 * SSO domain proofs: every DNS-verified domain is re-confirmed daily. Proofs older than a week stop routing
 * sign-ins (providers.ts), three failed checks in a row drop the verification and free the domain.
 */
defineJob({
  type: "sso.domains.recheck",
  concurrency: 1,
  timeoutMs: 10 * 60_000,
  async run() {
    return recheckAllDnsDomains();
  },
});

defineSchedule({
  name: "sso.domains.recheck.daily",
  cron: "25 4 * * *",
  tick: async () => {
    await enqueueJob("sso.domains.recheck", {}, { dedupeKey: "sso.domains.recheck:daily", priority: 200, maxAttempts: 2 });
  },
});
