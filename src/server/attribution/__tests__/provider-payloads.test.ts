import { describe, expect, it } from "vitest";
import { applyMapping, closeAmountDivisor, detectProvider, preprocessPayload, withDecimalAmountPaths } from "../mapping";
import { mappedToInput } from "../payloads";
import { MAPPING_PRESETS, getProvider } from "../providers";
import type { FieldMapping } from "../types";

/** Runs a payload through the same steps as a mapped webhook delivery. */
function ingest(payload: unknown, mapping: FieldMapping) {
  const processed = preprocessPayload(payload);
  return mappedToInput(applyMapping(processed, withDecimalAmountPaths(processed, mapping)), "auto");
}

// https://developer.close.com/resources/webhook-subscriptions/ (envelope) +
// https://developer.close.com/api/resources/opportunities/get.md (value 50000 ↔ value_formatted "$500")
const closeOpportunityEvent = {
  event: {
    date_created: "2019-01-15T12:48:23.395000",
    meta: { request_method: "PUT", request_path: "/api/v1/opportunity/oppo_7H4sjNso7FyBFaeR3RXi5PMJbilfo0c6UPCxsJtEhCO/" },
    id: "ev_2sYKRjcrA79yKxi3S4Crd7",
    action: "updated",
    date_updated: "2019-01-15T12:48:23.395000",
    changed_fields: ["confidence", "date_updated", "status_id", "status_label", "status_type"],
    previous_data: { status_type: "active" },
    data: {
      id: "oppo_7H4sjNso7FyBFaeR3RXi5PMJbilfo0c6UPCxsJtEhCO",
      value: 50000,
      value_currency: "USD",
      value_formatted: "$500",
      value_period: "one_time",
      annualized_value: 50000,
      expected_value: 37500,
      status_type: "won",
    },
    request_id: "req_4S2L8JTBAA1OUS74SVmfbN",
    object_id: "oppo_7H4sjNso7FyBFaeR3RXi5PMJbilfo0c6UPCxsJtEhCO",
    object_type: "opportunity",
    user_id: "user_N6KhMpzHRCYQHdn4gRNIFNN5JExnsrprKA6ekxM63XA",
    lead_id: "lead_zwqYhEFwzPyfCErS8uQ77is2wFLvr9BgVi6cTfbFM68",
    organization_id: "orga_XbVPx5fFbKlYTz9PW5Ih1XDhViV10YihIaEgMEb6fVW",
  },
  subscription_id: "whsub_8AmjKCZYT3zI8eZoi4HhFC",
};

// https://pipedrive.readme.io/docs/webhooks-v2-migration-guide (create / update deal examples)
const pipedriveV2Deal = {
  data: {
    add_time: "2022-11-24T13:18:55Z",
    currency: "EUR",
    custom_fields: {
      "3d0fa3429dfa2d3dec265b4fc5dc8258ab66cdf3": { type: "address", formatted_address: "Tallinn, Estonia", value: "Tallinn, Estonia" },
    },
    id: 8,
    org_id: 1,
    person_id: 8,
    status: "open",
    title: "Sample Org deal",
    value: 100,
  },
  previous: null,
  meta: {
    action: "create",
    company_id: "8087566",
    entity_id: "8",
    entity: "deal",
    id: "71825ee0-0054-4267-b5fd-d28b7a414212",
    is_bulk_edit: false,
    timestamp: "2022-11-24T13:18:56.089Z",
    type: "general",
    user_id: "12415231",
    version: "2.0",
    webhook_id: "4710827",
    change_source: "app",
    attempt: 1,
    host: "pd-us.pipedrive.com",
  },
};

// https://pipedrive.readme.io/docs/guide-for-webhooks (legacy v1 envelope)
const pipedriveV1Deal = {
  v: 1,
  matches_filters: { current: [], previous: [] },
  meta: { v: 1, action: "added", object: "deal", change_source: "app", id: 8, company_id: 8087566, user_id: 12415231, host: "company.pipedrive.com", timestamp: 1523440213, webhook_id: 4710827 },
  retry: 0,
  current: { id: 8, title: "Sample Org deal", value: 100, currency: "EUR", status: "open", person_id: 8, "3d0fa3429dfa2d3dec265b4fc5dc8258ab66cdf3": "ChatGPT" },
  previous: null,
  event: "added.deal",
};

// Stripe Checkout Session event (amounts in the currency's minor unit; JPY is zero-decimal)
const stripeCheckout = (amount: number, currency: string) => ({
  id: "evt_1",
  object: "event",
  type: "checkout.session.completed",
  data: { object: { id: "cs_test_1", object: "checkout.session", amount_total: amount, amount_subtotal: amount, currency, customer_details: { email: "buyer@example.com" } } },
});

describe("Close webhooks (opportunity values in cents)", () => {
  it("detects the documented envelope and converts value to major units", () => {
    expect(detectProvider(closeOpportunityEvent)).toBe("close");
    const data = (preprocessPayload(closeOpportunityEvent) as { event: { data: Record<string, unknown> } }).event.data;
    expect(data.value).toBe(50000);
    expect(data.value_decimal).toBe(500);
    expect(data.expected_value_decimal).toBe(375);
  });
  it("maps deal value + currency with the preset", () => {
    const r = ingest(closeOpportunityEvent, getProvider("close")!.presetMapping!);
    expect(r).toMatchObject({ type: "conversion", conversion: { value: 500, currency: "USD" } });
  });
  it("upgrades workflows saved with the old raw-cents preset without double-converting", () => {
    const legacy: FieldMapping = { externalId: { path: "event.object_id" }, dealValue: { path: "event.data.value" }, dealCurrency: { path: "event.data.value_currency" } };
    expect(ingest(closeOpportunityEvent, legacy)).toMatchObject({ type: "conversion", conversion: { value: 500 } });
    // Same path in a custom (non-Close) payload is already in major units → untouched.
    expect(ingest({ event: { data: { value: 1200 } } }, { dealValue: { path: "event.data.value" } })).toMatchObject({ conversion: { value: 1200 } });
  });
  it("uses value_formatted to recognise amounts that are already in major units", () => {
    expect(closeAmountDivisor(50000, "$500")).toBe(100);
    expect(closeAmountDivisor(123456, "$1,234.56")).toBe(100);
    expect(closeAmountDivisor(500, "¥500")).toBe(1);
    expect(closeAmountDivisor(50000, undefined)).toBe(100);
  });
  it("is idempotent when payloads are pre-processed again", () => {
    const once = preprocessPayload(closeOpportunityEvent);
    const twice = preprocessPayload(once) as { event: { data: Record<string, unknown> } };
    expect(twice.event.data.value_decimal).toBe(500);
  });
});

describe("Pipedrive webhooks v1 + v2", () => {
  const preset = getProvider("pipedrive")!.presetMapping!;
  it("detects both envelope versions", () => {
    expect(detectProvider(pipedriveV2Deal)).toBe("pipedrive");
    expect(detectProvider(pipedriveV1Deal)).toBe("pipedrive");
  });
  it("maps id, value and currency from v2 `data` and v1 `current` alike", () => {
    for (const payload of [pipedriveV2Deal, pipedriveV1Deal]) {
      expect(applyMapping(preprocessPayload(payload), preset)).toMatchObject({ externalId: "8", dealValue: "100", dealCurrency: "EUR", formName: "Pipedrive deal" });
    }
  });
  it("reads v2 custom fields ({ type, value }) and v1 flat custom fields", () => {
    const v2 = applyMapping(preprocessPayload(pipedriveV2Deal), { channel: { path: "current.custom_fields.3d0fa3429dfa2d3dec265b4fc5dc8258ab66cdf3" } });
    expect(v2.channel).toBe("Tallinn, Estonia");
    const v1 = applyMapping(preprocessPayload(pipedriveV1Deal), { channel: { path: "current.3d0fa3429dfa2d3dec265b4fc5dc8258ab66cdf3" } });
    expect(v1.channel).toBe("ChatGPT");
  });
  it("exposes the primary person email for v2 `emails` and v1 `email`", () => {
    const v2Person = { data: { id: 5, name: "Ada", emails: [{ label: "work", value: "ada@example.com", primary: true }] }, previous: null, meta: { action: "create", entity: "person", version: "2.0" } };
    const v1Person = { meta: { v: 1, action: "added", object: "person", id: 5 }, current: { id: 5, email: [{ value: "old@example.com", primary: false }, { value: "ada@example.com", primary: true }] }, previous: null };
    expect(applyMapping(preprocessPayload(v2Person), preset).email).toBe("ada@example.com");
    expect(applyMapping(preprocessPayload(v1Person), preset).email).toBe("ada@example.com");
  });
});

describe("Stripe event JSON via a generic webhook (minor units)", () => {
  const preset = MAPPING_PRESETS.find((p) => p.key === "stripe")!.mapping;
  it("converts cents and leaves zero-decimal currencies as-is", () => {
    expect(ingest(stripeCheckout(4990, "eur"), preset)).toMatchObject({ type: "conversion", conversion: { value: 49.9, currency: "EUR", transactionId: "cs_test_1" } });
    expect(ingest(stripeCheckout(5000, "jpy"), preset)).toMatchObject({ conversion: { value: 5000, currency: "JPY" } });
  });
  it("upgrades mappings that point at the raw amount", () => {
    expect(ingest(stripeCheckout(4990, "usd"), { dealValue: { path: "data.object.amount_total" } })).toMatchObject({ conversion: { value: 49.9 } });
  });
});
