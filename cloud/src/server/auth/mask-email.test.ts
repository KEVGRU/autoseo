import { describe, expect, it } from "vitest";
import { maskEmail } from "./mask-email";

describe("maskEmail", () => {
  it("keeps the first character and the domain", () => {
    expect(maskEmail("daniel.ehrhardt@codext.de")).toBe("d***@codext.de");
    expect(maskEmail("a@x.io")).toBe("a***@x.io");
  });
  it("never echoes something that isn't an address", () => {
    expect(maskEmail("no-at-sign")).toBe("***");
    expect(maskEmail("@codext.de")).toBe("***");
  });
});
