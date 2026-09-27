import { describe, expect, it } from "vitest";
import { emptyBundle, type DataBundle } from "@/features/reports/lib/bundle";
import { buildEmailKpis, cleanSubject, contrastText, renderReportEmail, type ReportEmailInput } from "./email-template";

function bundle(): DataBundle {
  const b = emptyBundle({ id: "prj_x", name: "Acme", domain: "acme.com" });
  b.ai.current = { ...b.ai.current, visibility: 42.5, shareOfVoice: 18.2, mentionRate: 30, citationRate: 12.1, avgPosition: 2.4, sentiment: 71 };
  b.ai.previous = { ...b.ai.previous, visibility: 40, shareOfVoice: 20, mentionRate: 30, citationRate: 10, avgPosition: 2.9, sentiment: 70 };
  return b;
}

const base = (o: Partial<ReportEmailInput> = {}): ReportEmailInput => ({
  appName: "AutoSEO",
  subject: "Monthly report — Sep 1 – Sep 30, 2026",
  reportTitle: "Monthly report",
  clientName: "Acme",
  periodLabel: "Sep 1 – Sep 30, 2026",
  senderName: "Agency & Co",
  accentColor: "#3DDC84",
  logoCid: null,
  kpis: [{ label: "Visibility", value: "42.5%", delta: "+2.5 pp", tone: 1 }],
  message: null,
  link: { url: "https://app.example/share/r/abc", expiresAt: "2026-10-31T08:00:00.000Z" },
  attachment: { filename: "Monthly report 2026-09-30.pptx", size: "1.2 MB" },
  attachmentNote: null,
  reason: "You receive this report because Agency & Co scheduled it for you.",
  ...o,
});

describe("buildEmailKpis", () => {
  it("picks the available headline KPIs with formatted deltas and tone", () => {
    const kpis = buildEmailKpis(bundle());
    expect(kpis.map((k) => k.label)).toEqual(["Visibility", "Share of voice", "Citation rate", "Mention rate", "Avg. position", "Sentiment"]);
    expect(kpis[0]).toEqual({ label: "Visibility", value: "42.5%", delta: "+2.5 pp", tone: 1 });
    expect(kpis[1]!.tone).toBe(-1); // SoV fell
    expect(kpis[3]!.tone).toBe(0); // mention rate unchanged
    expect(kpis[4]).toMatchObject({ value: "#2.4", tone: 1 }); // position improved (lower is better)
  });
  it("adds traffic / crawler / attribution KPIs when those blocks exist and respects the limit", () => {
    const b = emptyBundle({ id: "p", name: "A", domain: "a.com" });
    b.other.aiTraffic = { sessions: 1200, conversions: 30, revenue: 5000, prevSessions: 1000 };
    b.other.bots = {
      visits: 900,
      prevVisits: 1000,
      uniqueUrls: 50,
      prevUniqueUrls: 40,
      ok: 850,
      redirects: 20,
      clientErrors: 25,
      serverErrors: 5,
      verified: 800,
      bots: [],
      trend: [],
      trendBots: [],
      topPages: [],
      errorPages: [],
    };
    const kpis = buildEmailKpis(b, 6);
    expect(kpis.map((k) => k.label)).toEqual(["AI visitors", "AI crawler visits"]);
    expect(kpis[0]).toMatchObject({ value: "1.2K", delta: "+20%", tone: 1 });
    expect(kpis[1]).toMatchObject({ value: "900", delta: "−10%", tone: -1 });
    expect(buildEmailKpis(bundle(), 2)).toHaveLength(2);
    // with visibility data, connected sources come before the secondary AI KPIs
    const full = bundle();
    full.other = b.other;
    expect(buildEmailKpis(full).map((k) => k.label)).toEqual(["Visibility", "Share of voice", "Citation rate", "AI visitors", "AI crawler visits", "Mention rate"]);
  });
});

describe("renderReportEmail", () => {
  it("renders a branded email with KPIs, button, attachment note and plain-text alternative", () => {
    const m = renderReportEmail(base());
    expect(m.subject).toBe("Monthly report — Sep 1 – Sep 30, 2026");
    expect(m.html).toContain("background:#3DDC84");
    expect(m.html).toContain(">Open report</a>");
    expect(m.html).toContain('href="https://app.example/share/r/abc"');
    expect(m.html).toContain("October 31, 2026");
    expect(m.html).toContain("Monthly report 2026-09-30.pptx");
    expect(m.html).toContain("+2.5 pp vs. previous");
    expect(m.html).toContain("Agency &amp; Co");
    // dark text on a light accent
    expect(m.html).toMatch(/color:#111111;text-decoration:none/);
    expect(m.text).toContain("Visibility: 42.5% (+2.5 pp vs. previous)");
    expect(m.text).toContain("Open report: https://app.example/share/r/abc");
    expect(m.text).toContain("Attached: Monthly report 2026-09-30.pptx (1.2 MB)");
  });

  it("escapes user content and sanitizes the subject", () => {
    const m = renderReportEmail(
      base({ subject: "Hi\r\nBcc: evil@x.com", message: '<script>alert(1)</script>\nsecond line', reportTitle: "<b>Title</b>", clientName: 'A "B"' }),
    );
    expect(m.subject).toBe("Hi Bcc: evil@x.com");
    expect(m.html).not.toContain("<script>");
    expect(m.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;<br>second line");
    expect(m.html).toContain("&lt;b&gt;Title&lt;/b&gt;");
    expect(m.html).toContain("A &quot;B&quot;");
  });

  it("uses the inline logo, omits the button for PowerPoint-only and shows the too-large note", () => {
    const m = renderReportEmail(base({ logoCid: "report-logo", link: null, attachment: null, attachmentNote: "The PowerPoint was too large to attach." }));
    expect(m.html).toContain('src="cid:report-logo"');
    expect(m.html).not.toContain("Open report");
    expect(m.html).toContain("too large to attach");
    expect(m.text).not.toContain("Open report");
  });

  it("falls back to a dark accent for invalid colors and picks white text on dark accents", () => {
    const m = renderReportEmail(base({ accentColor: "red;background:url(x)" }));
    expect(m.html).toContain("background:#111111");
    expect(m.html).not.toContain("url(x)");
    expect(contrastText("#111111")).toBe("#ffffff");
    expect(contrastText("#F5F5F5")).toBe("#111111");
  });

  it("cleanSubject trims and caps length", () => {
    expect(cleanSubject("  a\t b  ")).toBe("a b");
    expect(cleanSubject("x".repeat(300))).toHaveLength(200);
  });
});
