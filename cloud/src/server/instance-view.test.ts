import { describe, expect, it } from "vitest";
import { provisionStep, provisionSteps, PROVISION_STEPS, SHARED_PROVISION_STEPS } from "./instance-view";

describe("provisionStep", () => {
  it("walks Payment received → Creating instance → Starting → Ready", () => {
    expect(PROVISION_STEPS).toEqual(["Payment received", "Creating instance", "Starting", "Ready"]);
    expect(provisionStep({ status: "pending_payment", coolifyServiceUuid: null, startRequestedAt: null })).toBe(0);
    expect(provisionStep({ status: "provisioning", coolifyServiceUuid: null, startRequestedAt: null })).toBe(1);
    expect(provisionStep({ status: "provisioning", coolifyServiceUuid: "svc", startRequestedAt: null })).toBe(1);
    expect(provisionStep({ status: "provisioning", coolifyServiceUuid: "svc", startRequestedAt: new Date() })).toBe(2);
    expect(provisionStep({ status: "running", coolifyServiceUuid: "svc", startRequestedAt: null })).toBe(4);
  });
});

describe("shared workspaces", () => {
  it("walk Payment received → Creating workspace → Ready", () => {
    expect(provisionSteps("shared")).toEqual(SHARED_PROVISION_STEPS);
    expect(provisionSteps("coolify")).toEqual(PROVISION_STEPS);
    const base = { coolifyServiceUuid: null, startRequestedAt: null, backend: "shared" as const };
    expect(provisionStep({ ...base, status: "pending_payment" })).toBe(0);
    expect(provisionStep({ ...base, status: "provisioning" })).toBe(1);
    expect(provisionStep({ ...base, status: "running" })).toBe(3);
  });
});
