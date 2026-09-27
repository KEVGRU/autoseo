const INK = "#141413";
const ACCENT = "#22c55e";
const MUTED = "#6b6b66";
const SUPPORT_EMAIL = "info@codext.de";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

type LayoutOptions = {
  preheader: string;
  heading: string;
  /** Trusted HTML (callers escape user input). */
  body: string;
  cta?: { label: string; url: string };
  footer?: string;
};

/** Table-based layout that renders in every client; no external images. */
function layout(opts: LayoutOptions): string {
  const cta = opts.cta
    ? `<tr><td style="padding:4px 0 24px"><a href="${escapeHtml(opts.cta.url)}" style="display:inline-block;background:${INK};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;line-height:20px;padding:13px 24px;border-radius:10px">${escapeHtml(opts.cta.label)}&nbsp;&rarr;</a></td></tr>
<tr><td style="font-size:12px;line-height:18px;color:${MUTED};padding-bottom:8px">Or paste this link into your browser:<br><span style="word-break:break-all;color:#3a3a36">${escapeHtml(opts.cta.url)}</span></td></tr>`
    : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${escapeHtml(opts.heading)}</title></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK}">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td style="padding:0 4px 18px">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="width:28px;height:28px;background:${INK};border-radius:8px;text-align:center;vertical-align:middle;color:#ffffff;font-weight:700;font-size:15px;line-height:28px">A</td>
    <td style="padding-left:10px;font-weight:700;font-size:15px;letter-spacing:-0.01em;color:${INK}">AutoSEO <span style="color:${ACCENT}">Cloud</span></td>
  </tr></table>
</td></tr>
<tr><td style="background:#ffffff;border:1px solid #e7e5df;border-radius:16px;padding:32px 28px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td><div style="height:4px;width:40px;background:${ACCENT};border-radius:4px;font-size:0;line-height:0">&nbsp;</div></td></tr>
    <tr><td style="font-size:22px;line-height:28px;font-weight:650;letter-spacing:-0.02em;padding:18px 0 12px">${escapeHtml(opts.heading)}</td></tr>
    <tr><td style="font-size:15px;line-height:24px;color:#3a3a36;padding-bottom:20px">${opts.body}</td></tr>
    ${cta}
  </table>
</td></tr>
<tr><td style="padding:18px 4px 0;font-size:12px;line-height:18px;color:#8a8a84">${opts.footer ?? `AutoSEO Cloud · Codext GmbH · Questions? Reply to this email or write to <a href="mailto:${SUPPORT_EMAIL}" style="color:#8a8a84">${SUPPORT_EMAIL}</a>.`}</td></tr>
</table></td></tr></table></body></html>`;
}

export function magicLinkEmail(opts: { url: string; code: string; minutes: number; signup: boolean; ip?: string | null }) {
  const heading = opts.signup ? "Confirm your email" : "Sign in to AutoSEO Cloud";
  const html = layout({
    preheader: `Your sign-in code is ${opts.code}`,
    heading,
    body: `Click the button below to ${opts.signup ? "finish creating your account" : "sign in"}. The link is valid for ${opts.minutes} minutes and can only be used once.<br><br>
Or enter this code on the sign-in page:
<div style="font-size:30px;line-height:36px;font-weight:700;letter-spacing:0.28em;margin:14px 0 4px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:${INK}">${escapeHtml(opts.code)}</div>
<span style="font-size:12px;color:#8a8a84">Requested${opts.ip ? ` from ${escapeHtml(opts.ip)}` : ""}. If this wasn't you, you can safely ignore this email.</span>`,
    cta: { label: opts.signup ? "Confirm and continue" : "Sign in", url: opts.url },
  });
  const text = `${heading}\n\nOpen this link (valid ${opts.minutes} minutes, single use):\n${opts.url}\n\nOr enter the code: ${opts.code}\n\nIf this wasn't you, ignore this email.\n`;
  return { subject: opts.signup ? "Confirm your AutoSEO Cloud account" : "Your AutoSEO Cloud sign-in link", html, text };
}

export function instanceReadyEmail(opts: {
  /** "workspace": a workspace in the shared app; "instance": a dedicated instance. */
  kind: "workspace" | "instance";
  instanceUrl: string;
  dashboardUrl: string;
  workspaceName: string;
}) {
  const host = opts.instanceUrl.replace(/^https?:\/\//, "");
  const name = `<strong>${escapeHtml(opts.workspaceName)}</strong>`;
  const link = `<a href="${escapeHtml(opts.instanceUrl)}" style="color:${INK};font-weight:600">${escapeHtml(host)}</a>`;
  const workspace = opts.kind === "workspace";
  const heading = workspace ? "Your AutoSEO workspace is ready" : "Your AutoSEO instance is ready";
  const html = layout({
    preheader: workspace ? `${opts.workspaceName} is ready on AutoSEO Cloud.` : `${host} is up and running.`,
    heading,
    body: workspace
      ? `Your workspace ${name} is ready on ${link}.<br><br>
Sign in with one click from your AutoSEO Cloud dashboard, add your website as a project and invite your team. AI providers and data sources are already set up for you.`
      : `Your private AutoSEO instance for ${name} is up and running at ${link}.<br><br>
Sign in with one click from your AutoSEO Cloud dashboard. Inside, connect your AI provider keys (or a local Claude Code / Codex agent) under Settings to start tracking your AI visibility.`,
    cta: { label: "Open AutoSEO", url: opts.dashboardUrl },
  });
  const text = workspace
    ? `${heading}\n\nYour workspace ${opts.workspaceName} is ready on ${opts.instanceUrl}.\n\nSign in with one click from your dashboard: ${opts.dashboardUrl}\n`
    : `${heading}\n\n${opts.instanceUrl} is up and running.\n\nSign in with one click from your dashboard: ${opts.dashboardUrl}\n`;
  return { subject: heading, html, text };
}

export function paymentFailedEmail(opts: {
  billingUrl: string;
  /** "your workspace Acme" / "your AutoSEO instance acme.autoseo.codext.de" — or null. */
  subject: { kind: "workspace" | "instance"; label: string } | null;
  amount: string | null;
}) {
  const noun = opts.subject?.kind === "workspace" ? "workspace" : "instance";
  const what = opts.subject
    ? ` for your AutoSEO ${noun} <strong>${escapeHtml(opts.subject.label)}</strong>`
    : "";
  const html = layout({
    preheader: "We couldn't process your latest payment.",
    heading: "Your payment didn't go through",
    body: `We couldn't charge your payment method${opts.amount ? ` for <strong>${escapeHtml(opts.amount)}</strong>` : ""}${what}. Stripe will retry automatically over the next days.<br><br>
To keep your ${noun} running, please update your payment method. If the subscription stays unpaid, the ${noun} is paused — your data is kept and everything comes back when you pay.`,
    cta: { label: "Update payment method", url: opts.billingUrl },
  });
  const text = `Your payment didn't go through\n\nWe couldn't charge your payment method${opts.amount ? ` for ${opts.amount}` : ""}. Please update it to keep your ${noun} running:\n${opts.billingUrl}\n`;
  return { subject: "Action needed: update your payment method", html, text };
}

export type DigestMetric = { label: string; current: number; previous: number };
export type DigestRow = { name: string; visitors: number; accounts: number; paid: number };

function delta(current: number, previous: number): string {
  if (current === previous) return "±0";
  const diff = current - previous;
  const pct = previous ? ` (${diff > 0 ? "+" : ""}${Math.round((diff / previous) * 100)}%)` : "";
  return `${diff > 0 ? "+" : ""}${diff}${pct}`;
}

function digestTable(title: string, rows: DigestRow[]): string {
  const cell = "padding:6px 0;border-bottom:1px solid #eeede8;font-size:13px";
  const num = `${cell};text-align:right;padding-left:12px;font-variant-numeric:tabular-nums`;
  const body = rows.length
    ? rows
        .map(
          (r) =>
            `<tr><td style="${cell};word-break:break-all">${escapeHtml(r.name)}</td><td style="${num}">${r.visitors}</td><td style="${num}">${r.accounts}</td><td style="${num}">${r.paid}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="4" style="${cell};color:${MUTED}">No data yet.</td></tr>`;
  const head = `font-size:11px;color:${MUTED};text-align:right;padding-left:12px;font-weight:600`;
  return `<div style="font-weight:600;margin:22px 0 6px">${escapeHtml(title)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-size:11px;color:${MUTED};font-weight:600"></td><td style="${head}">Visitors</td><td style="${head}">Accounts</td><td style="${head}">Paid</td></tr>${body}</table>`;
}

/** Weekly growth summary for the operator (last ISO week vs the week before). */
export function growthDigestEmail(opts: {
  /** e.g. "2026-W39" */
  week: string;
  /** e.g. "Sep 21 – Sep 27, 2026" */
  period: string;
  metrics: DigestMetric[];
  mrr: string;
  activeSubscriptions: number;
  channels: DigestRow[];
  campaigns: DigestRow[];
  url: string;
}) {
  const cell = "padding:7px 0;border-bottom:1px solid #eeede8;font-size:14px";
  const metricRows = opts.metrics
    .map(
      (m) =>
        `<tr><td style="${cell}">${escapeHtml(m.label)}</td><td style="${cell};text-align:right;font-weight:600;font-variant-numeric:tabular-nums">${m.current}</td><td style="${cell};text-align:right;padding-left:12px;color:${MUTED};font-size:12px;white-space:nowrap">${delta(m.current, m.previous)}</td></tr>`,
    )
    .join("");
  const html = layout({
    preheader: opts.metrics.map((m) => `${m.label}: ${m.current}`).join(" · "),
    heading: `Growth report ${opts.week}`,
    body: `${escapeHtml(opts.period)} compared with the week before.
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px">${metricRows}
<tr><td style="${cell}">MRR</td><td style="${cell};text-align:right;font-weight:600">${escapeHtml(opts.mrr)}</td><td style="${cell};text-align:right;padding-left:12px;color:${MUTED};font-size:12px;white-space:nowrap">${opts.activeSubscriptions} active</td></tr></table>
${digestTable("Top channels", opts.channels)}
${digestTable("Top campaigns / ads", opts.campaigns)}`,
    cta: { label: "Open the growth dashboard", url: opts.url },
    footer: "AutoSEO Cloud · weekly growth digest for the operator (cookieless statistics).",
  });
  const lines = (rows: DigestRow[]) =>
    rows.length ? rows.map((r) => `- ${r.name}: ${r.visitors} visitors, ${r.accounts} accounts, ${r.paid} paid`).join("\n") : "- No data yet.";
  const text = `Growth report ${opts.week} (${opts.period}, vs the week before)

${opts.metrics.map((m) => `${m.label}: ${m.current} (${delta(m.current, m.previous)})`).join("\n")}
MRR: ${opts.mrr} (${opts.activeSubscriptions} active subscription${opts.activeSubscriptions === 1 ? "" : "s"})

Top channels:
${lines(opts.channels)}

Top campaigns / ads:
${lines(opts.campaigns)}

${opts.url}
`;
  return { subject: `AutoSEO Cloud growth ${opts.week}: ${opts.metrics.map((m) => `${m.current} ${m.label.toLowerCase()}`).join(", ")}`, html, text };
}

export function testEmail() {
  const html = layout({
    preheader: "SMTP works.",
    heading: "SMTP is working",
    body: "This is a test email from the AutoSEO Cloud admin panel. Sign-in links, instance and billing emails will be delivered through this server.",
  });
  return { subject: "AutoSEO Cloud test email", html, text: "SMTP is working. This is a test email from the AutoSEO Cloud admin panel.\n" };
}
