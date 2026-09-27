import { describe, expect, it } from "vitest";
import { SIGNATURE_HEADER, TIMESTAMP_HEADER, EVENT_HEADER, verifyWebhookSignature } from "../optimize/integrations/signature";
import {
  DELIVERY_HEADER,
  DISABLE_AFTER_HOURS,
  EVENT_ID_HEADER,
  MAX_CONSECUTIVE_FAILURES,
  buildEnvelope,
  classifyResponse,
  deliveryHeaders,
  secretPrefix,
  shouldAutoDisable,
} from "./payload";
import { ALL_EVENTS, WEBHOOK_EVENTS, endpointWantsEvent, normalizeEventList, sampleEventData } from "./events";

const project = { id: "prj_test", name: "Test", domain: "example.com", url: "https://app.example/p/prj_test" };

describe("webhook envelope + signing", () => {
  it("builds the documented envelope", () => {
    const env = buildEnvelope({ event: "alert.triggered", project, data: { a: 1 }, now: new Date("2026-01-01T00:00:00Z") });
    expect(env).toMatchObject({ event: "alert.triggered", createdAt: "2026-01-01T00:00:00.000Z", test: false, project, data: { a: 1 } });
    expect(env.id).toMatch(/^evt_[A-Za-z0-9_-]{16}$/);
    expect(buildEnvelope({ event: "x", project, data: {}, eventId: "evt_fixed" }).id).toBe("evt_fixed");
  });

  it("signs deliveries so receivers can verify them (and rejects tampering)", () => {
    const secret = "whsec_test_secret";
    const body = JSON.stringify(buildEnvelope({ event: "task.created", project, data: { tasks: [] } }));
    const now = Date.UTC(2026, 0, 1);
    const h = deliveryHeaders(secret, { event: "task.created", body, deliveryId: "whd_1", eventId: "evt_1", now });
    expect(h[EVENT_HEADER]).toBe("task.created");
    expect(h[DELIVERY_HEADER]).toBe("whd_1");
    expect(h[EVENT_ID_HEADER]).toBe("evt_1");
    expect(h["content-type"]).toBe("application/json");
    expect(h[SIGNATURE_HEADER]).toMatch(/^sha256=[0-9a-f]{64}$/);
    expect(verifyWebhookSignature(secret, h[TIMESTAMP_HEADER]!, body, h[SIGNATURE_HEADER]!, { now })).toBe(true);
    expect(verifyWebhookSignature(secret, h[TIMESTAMP_HEADER]!, body.replace("task.created", "task.updated"), h[SIGNATURE_HEADER]!, { now })).toBe(false);
    expect(verifyWebhookSignature("whsec_other", h[TIMESTAMP_HEADER]!, body, h[SIGNATURE_HEADER]!, { now })).toBe(false);
    expect(verifyWebhookSignature(secret, h[TIMESTAMP_HEADER]!, body, h[SIGNATURE_HEADER]!, { now: now + 10 * 60_000 })).toBe(false);
  });

  it("masks secrets for display", () => {
    expect(secretPrefix("whsec_AbCdEfGhIjKl")).toBe("whsec_AbCd…");
  });
});

describe("auto-disable rule", () => {
  const now = new Date("2026-09-26T12:00:00Z");
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000);

  it("needs both enough failed deliveries and a long enough failure streak", () => {
    expect(shouldAutoDisable({ failureCount: MAX_CONSECUTIVE_FAILURES, failingSince: hoursAgo(DISABLE_AFTER_HOURS), now })).toBe(true);
    // A burst of failures during a short outage doesn't switch the endpoint off …
    expect(shouldAutoDisable({ failureCount: 50, failingSince: hoursAgo(1), now })).toBe(false);
    // … and neither does a single old failure.
    expect(shouldAutoDisable({ failureCount: MAX_CONSECUTIVE_FAILURES - 1, failingSince: hoursAgo(72), now })).toBe(false);
    expect(shouldAutoDisable({ failureCount: 10, failingSince: null, now })).toBe(false);
  });

  it("classifies receiver responses (410 unsubscribes)", () => {
    expect(classifyResponse(204)).toBe("succeeded");
    expect(classifyResponse(410)).toBe("gone");
    expect(classifyResponse(500)).toBe("retry");
    expect(classifyResponse(404)).toBe("retry");
  });
});

describe("event catalogue", () => {
  it("matches subscriptions incl. the wildcard", () => {
    expect(endpointWantsEvent(["alert.triggered"], "alert.triggered")).toBe(true);
    expect(endpointWantsEvent(["alert.triggered"], "task.created")).toBe(false);
    expect(endpointWantsEvent([ALL_EVENTS], "task.created")).toBe(true);
  });

  it("normalizes subscription lists", () => {
    expect(normalizeEventList(["task.created", "bogus", "alert.triggered", "task.created"])).toEqual(["alert.triggered", "task.created"]);
    expect(normalizeEventList(["task.created", ALL_EVENTS])).toEqual([ALL_EVENTS]);
  });

  it("has a sample payload for every event", () => {
    for (const e of WEBHOOK_EVENTS) expect(Object.keys(sampleEventData(e)).length).toBeGreaterThan(0);
  });
});
