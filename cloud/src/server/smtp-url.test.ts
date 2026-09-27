import { describe, expect, it } from "vitest";
import { buildMailFrom, buildSmtpUrl, instanceMailServer } from "./smtp-url";

describe("buildSmtpUrl (AUTOSEO_SMTP_URL)", () => {
  it("uses smtp:// (STARTTLS) on 587 and smtps:// on 465", () => {
    expect(buildSmtpUrl({ host: "smtp.example.com", port: 587, secure: false, user: "u", password: "p" })).toBe(
      "smtp://u:p@smtp.example.com:587",
    );
    expect(buildSmtpUrl({ host: "smtp.example.com", port: 465, secure: false, user: "u", password: "p" })).toBe(
      "smtps://u:p@smtp.example.com:465",
    );
    expect(buildSmtpUrl({ host: "smtp.example.com", port: 465, secure: true })).toBe("smtps://smtp.example.com:465");
  });

  it("URL-encodes user and password", () => {
    const url = buildSmtpUrl({
      host: "email-smtp.eu-central-1.amazonaws.com",
      port: 587,
      secure: false,
      user: "info@codext.de",
      password: "p@ss:w/rd?#%&+= ü",
    })!;
    expect(url).toBe("smtp://info%40codext.de:p%40ss%3Aw%2Frd%3F%23%25%26%2B%3D%20%C3%BC@email-smtp.eu-central-1.amazonaws.com:587");
    // Round-trips through the WHATWG URL parser (what nodemailer uses).
    const parsed = new URL(url);
    expect(decodeURIComponent(parsed.username)).toBe("info@codext.de");
    expect(decodeURIComponent(parsed.password)).toBe("p@ss:w/rd?#%&+= ü");
    expect(parsed.hostname).toBe("email-smtp.eu-central-1.amazonaws.com");
    expect(parsed.port).toBe("587");
  });

  it("omits credentials when there is no user and returns null without a host", () => {
    expect(buildSmtpUrl({ host: "relay.internal", port: 25, secure: false, user: "", password: "ignored" })).toBe(
      "smtp://relay.internal:25",
    );
    expect(buildSmtpUrl({ host: "", port: 587, secure: false })).toBeNull();
  });
});

describe("buildMailFrom (AUTOSEO_MAIL_FROM)", () => {
  it("formats name + address", () => {
    expect(buildMailFrom("AutoSEO", "noreply@autoseo.codext.de")).toBe("AutoSEO <noreply@autoseo.codext.de>");
    expect(buildMailFrom("Codext, GmbH", "a@b.de")).toBe('"Codext, GmbH" <a@b.de>');
    expect(buildMailFrom("", "a@b.de")).toBe("a@b.de");
    expect(buildMailFrom('Evil" <x@y.z>', "a@b.de")).toBe('"Evil x@y.z" <a@b.de>');
    expect(buildMailFrom("Name", "")).toBeNull();
  });
});

describe("instanceMailServer", () => {
  const main = { host: "email-smtp.eu-central-1.amazonaws.com", port: 587, secure: false, user: "MAIN", password: "main-secret", fromName: "AutoSEO Cloud", fromEmail: "noreply@autoseo.codext.de", shareWithInstances: true };
  const dedicated = { host: "email-smtp.eu-central-1.amazonaws.com", port: 587, secure: false, user: "INSTANCES", password: "inst-secret", fromName: "AutoSEO", fromEmail: "instances@autoseo.codext.de" };

  it("prefers the dedicated customer-instance server", () => {
    const res = instanceMailServer(main, dedicated);
    expect(res.source).toBe("dedicated");
    expect(res.smtpUrl).toContain("INSTANCES:inst-secret@");
    expect(res.smtpUrl).not.toContain("main-secret");
    expect(res.mailFrom).toBe("AutoSEO <instances@autoseo.codext.de>");
  });

  it("falls back to the main server only when sharing is on", () => {
    expect(instanceMailServer(main, null).source).toBe("shared");
    expect(instanceMailServer(main, { ...dedicated, host: "" }).smtpUrl).toContain("MAIN:main-secret@");
    expect(instanceMailServer({ ...main, shareWithInstances: false }, null)).toEqual({ source: "none", smtpUrl: null, mailFrom: null });
  });

  it("ignores incomplete servers", () => {
    expect(instanceMailServer({ ...main, fromEmail: "" }, { ...dedicated, fromEmail: "" }).source).toBe("none");
  });
});
