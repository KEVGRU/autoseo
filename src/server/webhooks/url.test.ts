import { describe, expect, it } from "vitest";
import { assertPublicResolution, validateWebhookUrl } from "./url";

describe("validateWebhookUrl (SSRF guard)", () => {
  it("accepts public http(s) receivers", () => {
    expect(validateWebhookUrl("https://hooks.zapier.com/hooks/catch/123/abc/")).toBe("https://hooks.zapier.com/hooks/catch/123/abc/");
    expect(validateWebhookUrl("  https://hook.eu1.make.com/xyz#frag ")).toBe("https://hook.eu1.make.com/xyz");
    expect(validateWebhookUrl("http://n8n.example.com:8080/webhook/abc")).toBe("http://n8n.example.com:8080/webhook/abc");
  });

  it.each([
    "http://localhost/hook",
    "http://127.0.0.1:5678/hook",
    "http://10.0.0.5/hook",
    "http://192.168.1.10/hook",
    "http://169.254.169.254/latest/meta-data",
    "http://[::1]/hook",
    "http://[::ffff:127.0.0.1]/hook",
    "http://n8n.local/hook",
    "http://metadata.internal/hook",
    "https://user:pass@example.com/hook",
    "ftp://example.com/hook",
    "https://example.com:22/hook",
    "not a url",
    "",
  ])("rejects %s", (url) => {
    expect(() => validateWebhookUrl(url)).toThrow();
  });

  it("lets admin-allowlisted internal hosts through (any port)", () => {
    expect(validateWebhookUrl("http://127.0.0.1:5678/webhook/x", ["127.0.0.1"])).toBe("http://127.0.0.1:5678/webhook/x");
    expect(validateWebhookUrl("http://n8n.intranet.local:5678/webhook/x", ["N8N.intranet.local"])).toBe("http://n8n.intranet.local:5678/webhook/x");
    expect(() => validateWebhookUrl("ftp://127.0.0.1/x", ["127.0.0.1"])).toThrow();
    expect(() => validateWebhookUrl("http://u:p@127.0.0.1/x", ["127.0.0.1"])).toThrow();
    // Allowlisting one host doesn't open others.
    expect(() => validateWebhookUrl("http://10.0.0.1/x", ["127.0.0.1"])).toThrow();
  });

  it("rejects private IP literals at resolution time unless allowlisted", async () => {
    await expect(assertPublicResolution("http://10.1.2.3/x")).rejects.toThrow(/Private/);
    await expect(assertPublicResolution("http://10.1.2.3/x", ["10.1.2.3"])).resolves.toBeUndefined();
    await expect(assertPublicResolution("http://93.184.215.14/x")).resolves.toBeUndefined();
  });
});
