import { beforeEach, describe, expect, it, vi } from "vitest";
const lookup = vi.hoisted(() => vi.fn());
vi.mock("node:dns/promises", () => ({ default: { lookup } }));
vi.mock("./store", () => ({ getIntegration: vi.fn(), readSecret: vi.fn() }));
import { resolveExportHost } from "./posthog";

beforeEach(() => lookup.mockReset());
describe("PostHog database destination protection", () => {
  it("rejects loopback and private literal addresses", async () => {
    await expect(resolveExportHost("127.0.0.1")).rejects.toThrow("public IP");
    await expect(resolveExportHost("10.0.0.2")).rejects.toThrow("public IP");
    await expect(resolveExportHost("::1")).rejects.toThrow("public IP");
  });
  it("rejects a hostname if any answer is internal", async () => {
    lookup.mockResolvedValue([{ address: "94.130.160.233" }, { address: "169.254.169.254" }]);
    await expect(resolveExportHost("exports.example.com")).rejects.toThrow("public IP");
  });
  it("returns the checked public address for a pinned connection", async () => {
    lookup.mockResolvedValue([{ address: "94.130.160.233" }]);
    expect(await resolveExportHost("exports.example.com")).toBe("94.130.160.233");
    expect(lookup).toHaveBeenCalledWith("exports.example.com", { all: true });
  });
});
