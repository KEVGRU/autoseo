import { describe, expect, it } from "vitest";
import {
  evaluateRule,
  evaluateRules,
  extractNumericMentions,
  numbersNearTerms,
  parseLocaleNumber,
  validateRule,
  type EvalRule,
} from "./rules";

function rule(p: Partial<EvalRule>): EvalRule {
  return {
    id: "fcr_1",
    name: "Rule",
    kind: "numeric_range",
    assetId: null,
    terms: [],
    triggerTerms: [],
    min: null,
    max: null,
    unit: null,
    currency: null,
    market: null,
    severity: "major",
    active: true,
    ...p,
  };
}

const st = (claim: string, extra: Partial<{ market: string; assetId: string; quote: string; answerText: string }> = {}) => ({
  assetId: extra.assetId ?? "fca_1",
  market: extra.market ?? "DE",
  claim,
  quote: extra.quote ?? null,
  answerText: extra.answerText ?? null,
});

describe("parseLocaleNumber", () => {
  it("handles English and German separators", () => {
    expect(parseLocaleNumber("3,9")).toBe(3.9);
    expect(parseLocaleNumber("12.9")).toBe(12.9);
    expect(parseLocaleNumber("1.234,56")).toBe(1234.56);
    expect(parseLocaleNumber("1,234.56")).toBe(1234.56);
    expect(parseLocaleNumber("10.000")).toBe(10000);
    expect(parseLocaleNumber("0,125")).toBe(0.125);
    expect(parseLocaleNumber("1.000.000")).toBe(1000000);
    expect(parseLocaleNumber("abc")).toBeNull();
  });
});

describe("extractNumericMentions", () => {
  it("reads units, currencies and ranges", () => {
    const m = extractNumericMentions("Der Zinssatz liegt bei 3,9–12,9 % p.a., die Gebühr beträgt 5 € und max. 200 mg.");
    expect(m.map((x) => [x.value, x.unit, x.currency])).toEqual([
      [3.9, "%", null],
      [12.9, "%", null],
      [5, null, "EUR"],
      [200, "mg", null],
    ]);
  });
  it("supports currency prefixes and word ranges", () => {
    const m = extractNumericMentions("Plans cost $19.99 per month; APR from 4.5 to 9.5 percent.");
    expect(m.map((x) => [x.value, x.unit, x.currency])).toEqual([
      [19.99, null, "USD"],
      [4.5, "%", null],
      [9.5, "%", null],
    ]);
  });
  it("ignores dates and identifiers", () => {
    const m = extractNumericMentions("Updated on 2024-05-01 and 01.05.2024, model X5 costs 300 EUR.");
    expect(m.map((x) => x.value)).toEqual([300]);
  });
});

describe("numbersNearTerms", () => {
  it("only returns numbers in the same sentence close to a term", () => {
    const text = "The APR is 19.9%. Shipping takes 3 days. Rates start at 2%.";
    expect(numbersNearTerms(text, ["APR"]).map((n) => n.value)).toEqual([19.9]);
    expect(numbersNearTerms(text, ["rates"]).map((n) => n.value)).toEqual([2]);
  });
});

describe("evaluateRule — numeric_range", () => {
  const apr = rule({ name: "APR range", terms: ["APR", "Zinssatz", "effektiver Jahreszins"], min: 3.9, max: 12.9, unit: "%" });
  it("flags values outside the range", () => {
    const v = evaluateRule(apr, st("The loan has an APR of 19.9% for all customers."));
    expect(v?.found).toBe("19.9%");
    expect(v?.explanation).toContain("APR range");
    expect(v?.expected).toBe("3.9–12.9 %");
  });
  it("accepts values inside the range, incl. German ranges", () => {
    expect(evaluateRule(apr, st("Der effektive Jahreszins liegt zwischen 3,9 und 12,9 % p.a."))).toBeNull();
    expect(evaluateRule(apr, st("Der Zinssatz beträgt 3,9–12,9 %."))).toBeNull();
  });
  it("checks both ends of a range", () => {
    const v = evaluateRule(apr, st("Der Zinssatz beträgt 2,9–12,9 %."));
    expect(v?.found).toBe("2,9");
  });
  it("ignores numbers with another unit or far from the term", () => {
    expect(evaluateRule(apr, st("APR applies; the fee is 49 € and approval takes 20 days."))).toBeNull();
    expect(evaluateRule(apr, st("Customers love it. 45% of them recommend the loan."))).toBeNull();
  });
  it("keeps abbreviations inside the sentence", () => {
    const price = rule({ name: "Price", terms: ["ab ca"], min: 899, max: 1299, currency: "EUR" });
    expect(evaluateRule(price, st("Der Speicher kostet ab ca. 799 € inkl. Versand."))?.found).toBe("799 €");
  });
  it("respects currency rules", () => {
    const price = rule({ name: "Price", terms: ["price", "costs"], min: 99, max: 149, currency: "EUR" });
    expect(evaluateRule(price, st("The price is 89 €."))?.found).toBe("89 €");
    expect(evaluateRule(price, st("The price is $89."))).toBeNull();
    expect(evaluateRule(price, st("It costs EUR 120."))).toBeNull();
  });
  it("skips bare years without a unit", () => {
    const r = rule({ name: "Dose", terms: ["dose"], min: 1, max: 4 });
    expect(evaluateRule(r, st("The dose recommendation changed in 2019."))).toBeNull();
    expect(evaluateRule(r, st("The dose is 6 tablets a day."))?.found).toBe("6");
  });
});

describe("evaluateRule — forbidden / required", () => {
  it("flags forbidden wording as whole words, case-insensitive", () => {
    const r = rule({ kind: "forbidden", name: "No guarantees", terms: ["guaranteed", "risk-free"] });
    expect(evaluateRule(r, st("Approval is Guaranteed for everyone."))?.found).toBe("Guaranteed");
    expect(evaluateRule(r, st("It is a risk-free investment."))?.found).toBe("risk-free");
    expect(evaluateRule(r, st("There is no guarantee."))).toBeNull();
  });
  it("applies forbidden rules only in trigger context when set", () => {
    const r = rule({ kind: "forbidden", name: "Kids", terms: ["safe"], triggerTerms: ["children"] });
    expect(evaluateRule(r, st("It is safe for adults."))).toBeNull();
    expect(evaluateRule(r, st("It is safe for children."))?.found).toBe("safe");
  });
  it("requires wording in the answer when the statement is in scope", () => {
    const r = rule({ kind: "required", name: "Rx notice", terms: ["prescription", "verschreibungspflichtig"], triggerTerms: ["dose", "Dosis"] });
    expect(evaluateRule(r, st("The dose is 2 tablets daily."))?.explanation).toContain("Rx notice");
    expect(evaluateRule(r, st("The dose is 2 tablets daily.", { answerText: "Only available on prescription. The dose is 2 tablets daily." }))).toBeNull();
    expect(evaluateRule(r, st("It comes in a blue box."))).toBeNull();
  });
});

describe("rule scope", () => {
  it("filters by market (GB ≙ UK), asset and active flag", () => {
    const r = rule({ kind: "forbidden", terms: ["cure"], market: "GB" });
    expect(evaluateRule(r, st("It is a cure.", { market: "UK" }))).not.toBeNull();
    expect(evaluateRule(r, st("It is a cure.", { market: "DE" }))).toBeNull();
    expect(evaluateRule({ ...r, market: null, assetId: "fca_2" }, st("It is a cure."))).toBeNull();
    expect(evaluateRule({ ...r, market: null, active: false }, st("It is a cure."))).toBeNull();
  });
  it("sorts multiple violations by severity", () => {
    const list = evaluateRules(
      [rule({ id: "a", kind: "forbidden", terms: ["cure"], severity: "minor" }), rule({ id: "b", kind: "forbidden", terms: ["miracle"], severity: "critical" })],
      st("A miracle cure."),
    );
    expect(list.map((v) => v.ruleId)).toEqual(["b", "a"]);
  });
});

describe("validateRule", () => {
  it("rejects incomplete rules", () => {
    expect(validateRule({ kind: "numeric_range", terms: ["APR"], min: null, max: null })).toMatch(/minimum/);
    expect(validateRule({ kind: "numeric_range", terms: ["APR"], min: 5, max: 1 })).toMatch(/greater/);
    expect(validateRule({ kind: "forbidden", terms: [" "], min: null, max: null })).toMatch(/forbidden/);
    expect(validateRule({ kind: "required", terms: ["Rx"], min: null, max: null })).toBeNull();
  });
});
