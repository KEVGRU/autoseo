import { describe, expect, it } from "vitest";
import { resolveCoolifyToken } from "./coolify-rules";

const base = { previousUrl: "https://coolify-v4.codext.de", savedToken: "1|saved", enteredToken: "" };

describe("resolveCoolifyToken", () => {
  it("keeps the saved token when the host stays the same", () => {
    expect(resolveCoolifyToken({ ...base, nextUrl: "https://coolify-v4.codext.de/" })).toEqual({ token: "1|saved", cleared: false });
    expect(resolveCoolifyToken({ ...base, nextUrl: "https://COOLIFY-V4.codext.de/api/v1" })).toEqual({ token: "1|saved", cleared: false });
  });

  it("drops the saved token when the host changes", () => {
    expect(resolveCoolifyToken({ ...base, nextUrl: "https://evil.example" })).toEqual({ token: "", cleared: true });
    expect(resolveCoolifyToken({ ...base, nextUrl: "https://coolify-v4.codext.de:8443" })).toEqual({ token: "", cleared: true });
  });

  it("uses a newly entered token in every case", () => {
    expect(resolveCoolifyToken({ ...base, nextUrl: "https://other.example", enteredToken: "2|new" })).toEqual({ token: "2|new", cleared: false });
  });

  it("reports nothing to clear when no token was saved", () => {
    expect(resolveCoolifyToken({ ...base, savedToken: "", nextUrl: "https://other.example" })).toEqual({ token: "", cleared: false });
  });
});
