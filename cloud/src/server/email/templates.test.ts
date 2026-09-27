import { describe, expect, it } from "vitest";
import { growthDigestEmail, instanceReadyEmail, paymentFailedEmail } from "./templates";

describe("instanceReadyEmail", () => {
  it("talks about a workspace for shared tenants", () => {
    const mail = instanceReadyEmail({
      kind: "workspace",
      instanceUrl: "https://app.autoseo.codext.de",
      dashboardUrl: "https://autoseo.codext.de/api/instance/open",
      workspaceName: "Acme <GmbH>",
    });
    expect(mail.subject).toBe("Your AutoSEO workspace is ready");
    expect(mail.html).toContain("Acme &lt;GmbH&gt;");
    expect(mail.html).toContain("app.autoseo.codext.de");
    expect(mail.html).not.toMatch(/private AutoSEO instance|instance is ready|provider keys/i);
    expect(mail.text).toContain("https://autoseo.codext.de/api/instance/open");
  });

  it("keeps the instance wording for dedicated instances", () => {
    const mail = instanceReadyEmail({ kind: "instance", instanceUrl: "https://acme.autoseo.codext.de", dashboardUrl: "https://x/open", workspaceName: "Acme" });
    expect(mail.subject).toBe("Your AutoSEO instance is ready");
    expect(mail.html).toContain("acme.autoseo.codext.de");
  });
});

describe("paymentFailedEmail", () => {
  it("names the workspace and says it will be paused", () => {
    const mail = paymentFailedEmail({ billingUrl: "https://b", subject: { kind: "workspace", label: "Acme" }, amount: "$50.00" });
    expect(mail.html).toContain("your AutoSEO workspace <strong>Acme</strong>");
    expect(mail.html).toContain("the workspace is paused");
    expect(mail.text).toContain("keep your workspace running");
  });
});

describe("growthDigestEmail", () => {
  const base = {
    week: "2026-W39",
    period: "Sep 21 – Sep 27, 2026",
    metrics: [
      { label: "Visitors", current: 120, previous: 80 },
      { label: "Accounts", current: 6, previous: 6 },
      { label: "Paid", current: 1, previous: 2 },
    ],
    mrr: "$150",
    activeSubscriptions: 3,
    channels: [{ name: "Paid social", visitors: 70, accounts: 4, paid: 1 }],
    campaigns: [{ name: "x / launch_sep26 / <ad4_video>", visitors: 40, accounts: 3, paid: 1 }],
    url: "https://autoseo.codext.de/admin?tab=growth&days=7",
  };

  it("compares the week with the one before and escapes campaign names", () => {
    const mail = growthDigestEmail(base);
    expect(mail.subject).toBe("AutoSEO Cloud growth 2026-W39: 120 visitors, 6 accounts, 1 paid");
    expect(mail.html).toContain("+40 (+50%)");
    expect(mail.html).toContain("±0");
    expect(mail.html).toContain("-1 (-50%)");
    expect(mail.html).toContain("x / launch_sep26 / &lt;ad4_video&gt;");
    expect(mail.html).toContain("admin?tab=growth&amp;days=7");
    expect(mail.text).toContain("Paid social: 70 visitors, 4 accounts, 1 paid");
    expect(mail.text).toContain("MRR: $150 (3 active subscriptions)");
  });

  it("says so when there is no data", () => {
    const mail = growthDigestEmail({ ...base, channels: [], campaigns: [] });
    expect(mail.html).toContain("No data yet.");
    expect(mail.text).toContain("- No data yet.");
  });
});
