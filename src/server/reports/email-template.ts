/**
 * Branded email for scheduled report delivery. Pure rendering (no DB / network) so it can be unit-tested;
 * the sender (schedules.ts) resolves the brand kit, logos (inline `cid:` images) and the data bundle.
 */
import type { DataBundle } from "@/features/reports/lib/bundle";
import { deltaTone, resolveToken } from "@/features/reports/lib/catalog";

export type EmailKpi = { label: string; value: string; delta: string | null; tone: -1 | 0 | 1 };

export type ReportEmailInput = {
  appName: string;
  subject: string;
  reportTitle: string;
  clientName: string;
  periodLabel: string;
  /** Agency / sender name shown in the header and footer. */
  senderName: string;
  /** Brand accent (#rrggbb); falls back to near-black. */
  accentColor?: string | null;
  /** `cid:` reference of an inline logo (agency first, else client). */
  logoCid?: string | null;
  kpis: EmailKpi[];
  message?: string | null;
  /** Public read-only link (format link | both). */
  link?: { url: string; expiresAt: string | null } | null;
  /** Attached PowerPoint (format pptx | both). */
  attachment?: { filename: string; size: string } | null;
  /** Shown when the PPTX was too large to attach. */
  attachmentNote?: string | null;
  /** Why the recipient gets this email (schedule description). */
  reason: string;
};

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

const HEX = /^#[0-9a-f]{6}$/i;

/** Readable text color (black / white) on a hex background. */
export function contrastText(hex: string): string {
  const v = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const lum = 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  return lum > 0.45 ? "#111111" : "#ffffff";
}

/** Strips CR/LF and trims a subject line (header safety). */
export function cleanSubject(s: string): string {
  return s.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, 200);
}

/** Priority order: core visibility first, then one KPI per connected source, then the rest. */
const KPI_KEYS: [string, string, string][] = [
  ["ai.visibility", "ai.visibility_delta", "Visibility"],
  ["ai.share_of_voice", "ai.share_of_voice_delta", "Share of voice"],
  ["ai.citation_rate", "ai.citation_rate_delta", "Citation rate"],
  ["traffic.ai_sessions", "traffic.ai_sessions_delta", "AI visitors"],
  ["attribution.ai_leads", "attribution.ai_leads_delta", "Leads from AI search"],
  ["bots.visits", "bots.visits_delta", "AI crawler visits"],
  ["ai.mention_rate", "ai.mention_rate_delta", "Mention rate"],
  ["ai.avg_position", "ai.avg_position_delta", "Avg. position"],
  ["ai.sentiment", "ai.sentiment_delta", "Sentiment"],
];

/** Headline KPIs for the email (values that exist in the bundle, max `limit`). */
export function buildEmailKpis(bundle: DataBundle, limit = 6): EmailKpi[] {
  const ctx = { bundle };
  const out: EmailKpi[] = [];
  for (const [key, deltaKey, label] of KPI_KEYS) {
    const v = resolveToken(key, ctx);
    if (v.value === null || v.value === undefined) continue;
    const d = resolveToken(deltaKey, ctx);
    const hasDelta = typeof d.value === "number";
    out.push({ label, value: v.text, delta: hasDelta ? d.text : null, tone: hasDelta ? deltaTone(deltaKey, d.value) : 0 });
    if (out.length >= limit) break;
  }
  return out;
}

function kpiGrid(kpis: EmailKpi[]): string {
  if (!kpis.length) return "";
  const rows: EmailKpi[][] = [];
  for (let i = 0; i < kpis.length; i += 3) rows.push(kpis.slice(i, i + 3));
  const cell = (k: EmailKpi) => {
    const color = k.tone > 0 ? "#15803d" : k.tone < 0 ? "#b91c1c" : "#6b6b6b";
    return `<td width="33%" valign="top" style="padding:6px"><div style="border:1px solid #eeece6;border-radius:12px;padding:14px 14px 12px;background:#fbfaf7">
<div style="font-size:12px;color:#6b6b6b;padding-bottom:6px">${escapeHtml(k.label)}</div>
<div style="font-size:22px;font-weight:700;letter-spacing:-0.02em;color:#141414">${escapeHtml(k.value)}</div>
${k.delta ? `<div style="font-size:12px;font-weight:600;color:${color};padding-top:4px">${escapeHtml(k.delta)} vs. previous</div>` : ""}
</div></td>`;
  };
  return `<tr><td style="padding:4px 0 20px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 -6px">${rows
    .map((r) => `<tr>${r.map(cell).join("")}${r.length < 3 ? '<td width="33%"></td>'.repeat(3 - r.length) : ""}</tr>`)
    .join("")}</table></td></tr>`;
}

export function renderReportEmail(input: ReportEmailInput): { subject: string; html: string; text: string } {
  const accent = input.accentColor && HEX.test(input.accentColor) ? input.accentColor : "#111111";
  const onAccent = contrastText(accent);
  const subject = cleanSubject(input.subject);
  const sender = input.senderName || input.appName;
  const logo = input.logoCid
    ? `<img src="cid:${escapeHtml(input.logoCid)}" alt="${escapeHtml(sender)}" height="36" style="display:block;height:36px;max-width:200px;border:0">`
    : `<span style="font-weight:700;font-size:15px;letter-spacing:-0.01em">${escapeHtml(sender)}</span>`;
  const message = input.message?.trim()
    ? `<tr><td style="font-size:15px;line-height:1.6;color:#3a3a3a;padding-bottom:20px">${escapeHtml(input.message.trim()).replace(/\n/g, "<br>")}</td></tr>`
    : "";
  const expires = input.link?.expiresAt
    ? ` The link works until ${new Date(input.link.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}.`
    : "";
  const cta = input.link
    ? `<tr><td style="padding:4px 0 8px"><a href="${escapeHtml(input.link.url)}" style="display:inline-block;background:${accent};color:${onAccent};text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px">Open report</a></td></tr>
<tr><td style="font-size:12px;color:#6b6b6b;padding-bottom:18px">Read-only link, no login needed.${escapeHtml(expires)}<br><span style="word-break:break-all;color:#3a3a3a">${escapeHtml(input.link.url)}</span></td></tr>`
    : "";
  const attachment = input.attachment
    ? `<tr><td style="padding-bottom:18px"><div style="border:1px dashed #d9d6cc;border-radius:10px;padding:10px 14px;font-size:13px;color:#3a3a3a">Attached: <strong>${escapeHtml(input.attachment.filename)}</strong> <span style="color:#8a8a8a">(${escapeHtml(input.attachment.size)}, PowerPoint)</span></div></td></tr>`
    : "";
  const note = input.attachmentNote ? `<tr><td style="font-size:12px;color:#8a8a8a;padding-bottom:16px">${escapeHtml(input.attachmentNote)}</td></tr>` : "";

  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:#f5f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#141414">
<span style="display:none;max-height:0;overflow:hidden">${escapeHtml(`${input.reportTitle} · ${input.periodLabel}`)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e7e5df;border-radius:16px;overflow:hidden">
<tr><td style="height:6px;background:${accent};font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:28px 32px 32px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding-bottom:22px">${logo}</td></tr>
<tr><td style="font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#8a8a8a;padding-bottom:6px">${escapeHtml(input.clientName)} · ${escapeHtml(input.periodLabel)}</td></tr>
<tr><td style="font-size:24px;font-weight:700;letter-spacing:-0.02em;padding-bottom:16px">${escapeHtml(input.reportTitle)}</td></tr>
${message}
${kpiGrid(input.kpis)}
${cta}
${attachment}
${note}
<tr><td style="border-top:1px solid #eeece6;padding-top:16px;font-size:12px;line-height:1.5;color:#8a8a8a">${escapeHtml(input.reason)}<br>Sent by ${escapeHtml(sender)} with ${escapeHtml(input.appName)}.</td></tr>
</table>
</td></tr></table></td></tr></table></body></html>`;

  const lines = [
    input.reportTitle,
    `${input.clientName} · ${input.periodLabel}`,
    "",
    ...(input.message?.trim() ? [input.message.trim(), ""] : []),
    ...input.kpis.map((k) => `${k.label}: ${k.value}${k.delta ? ` (${k.delta} vs. previous)` : ""}`),
    ...(input.kpis.length ? [""] : []),
    ...(input.link ? [`Open report: ${input.link.url}${expires ? ` (${expires.trim()})` : ""}`] : []),
    ...(input.attachment ? [`Attached: ${input.attachment.filename} (${input.attachment.size})`] : []),
    ...(input.attachmentNote ? [input.attachmentNote] : []),
    "",
    input.reason,
    `Sent by ${sender} with ${input.appName}.`,
  ];
  return { subject, html, text: `${lines.join("\n")}\n` };
}
