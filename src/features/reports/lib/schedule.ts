/**
 * Scheduled report delivery — pure, isomorphic helpers (next-run computation in the schedule's
 * time zone, reporting window resolution, labels). No server imports: unit-tested and used by the UI.
 */
import type { DateRangeValue } from "./types";

export type ScheduleCadence = "weekly" | "monthly";
export type ScheduleFormat = "link" | "pptx" | "both";
export type ScheduleRangePreset =
  | "last_7"
  | "last_14"
  | "last_30"
  | "last_90"
  | "last_week"
  | "last_month"
  | "last_quarter"
  | "month_to_date"
  | "report";

export type ScheduleTiming = {
  cadence: ScheduleCadence;
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
  /** 1–31; days past the end of a month run on its last day */
  monthDay: number;
  /** 0–23, local to `timezone` */
  hour: number;
  timezone: string;
};

export const RANGE_PRESET_OPTIONS: { key: ScheduleRangePreset; label: string; hint: string }[] = [
  { key: "last_7", label: "Last 7 days", hint: "The 7 full days before the send date" },
  { key: "last_14", label: "Last 14 days", hint: "The 14 full days before the send date" },
  { key: "last_30", label: "Last 30 days", hint: "The 30 full days before the send date" },
  { key: "last_90", label: "Last 90 days", hint: "The 90 full days before the send date" },
  { key: "last_week", label: "Previous week", hint: "Monday–Sunday of the previous week" },
  { key: "last_month", label: "Previous month", hint: "The previous calendar month" },
  { key: "last_quarter", label: "Previous quarter", hint: "The previous calendar quarter" },
  { key: "month_to_date", label: "Month to date", hint: "From the 1st to the day before sending (previous month on the 1st)" },
  { key: "report", label: "Report's own period", hint: "The period saved in the report" },
];

export const FORMAT_OPTIONS: { key: ScheduleFormat; label: string; hint: string }[] = [
  { key: "both", label: "Link + PowerPoint", hint: "An expiring link to the report and the .pptx attached" },
  { key: "link", label: "Link only", hint: "An expiring, read-only link to the report" },
  { key: "pptx", label: "PowerPoint only", hint: "The .pptx attached, no public link" },
];

/** Mirrors the server rule: a public link needs `reports.share`, the attached PPTX needs `data.export`. */
export function formatAllowed(format: ScheduleFormat, can: { share: boolean; export: boolean }): boolean {
  return (format === "pptx" || can.share) && (format === "link" || can.export);
}

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Time zones offered in the UI (the browser's own zone is added when missing). */
export const COMMON_TIME_ZONES = [
  "UTC",
  "Europe/London",
  "Europe/Dublin",
  "Europe/Lisbon",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "Europe/Paris",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Vienna",
  "Europe/Zurich",
  "Europe/Stockholm",
  "Europe/Warsaw",
  "Europe/Athens",
  "Europe/Istanbul",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
  "America/Sao_Paulo",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Mexico_City",
];

export function isValidTimeZone(tz: string): boolean {
  if (!tz || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

const safeTz = (tz: string) => (isValidTimeZone(tz) ? tz : "UTC");

type Parts = { y: number; m: number; d: number; h: number; min: number; s: number };

const partsFormatters = new Map<string, Intl.DateTimeFormat>();
function formatterFor(tz: string): Intl.DateTimeFormat {
  let f = partsFormatters.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    partsFormatters.set(tz, f);
  }
  return f;
}

/** Wall-clock parts of an instant in a time zone. */
export function zonedParts(date: Date, tz: string): Parts {
  const out: Record<string, number> = {};
  for (const p of formatterFor(safeTz(tz)).formatToParts(date)) if (p.type !== "literal") out[p.type] = Number(p.value);
  return { y: out.year!, m: out.month!, d: out.day!, h: out.hour === 24 ? 0 : out.hour!, min: out.minute!, s: out.second! };
}

/** Offset (local − UTC) in ms of a time zone at an instant. */
function offsetMs(t: number, tz: string): number {
  const p = zonedParts(new Date(t), tz);
  return Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - Math.floor(t / 1000) * 1000;
}

/**
 * The UTC instant of a local wall-clock time. Ambiguous times (DST fall-back) resolve to the first
 * occurrence; times inside a DST gap (spring-forward) resolve to the first valid instant after it.
 */
export function zonedTimeToUtc(y: number, m: number, d: number, h: number, min: number, tz: string): Date {
  const zone = safeTz(tz);
  const guess = Date.UTC(y, m - 1, d, h, min);
  const offsets = [...new Set([offsetMs(guess - 86_400_000, zone), offsetMs(guess, zone), offsetMs(guess + 86_400_000, zone)])];
  const candidates = offsets.map((o) => guess - o).sort((a, b) => a - b);
  const valid = candidates.filter((t) => {
    const p = zonedParts(new Date(t), zone);
    return p.y === y && p.m === m && p.d === d && p.h === h && p.min === min;
  });
  if (valid.length) return new Date(valid[0]!);
  // DST gap: the wall-clock time doesn't exist — the candidate computed with the pre-transition
  // offset lands just after the gap (e.g. 02:00 → 03:00).
  return new Date(candidates[candidates.length - 1]!);
}

export function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Next send instant strictly after `after`. */
export function computeNextRun(s: ScheduleTiming, after: Date = new Date()): Date {
  const tz = safeTz(s.timezone);
  const hour = Math.max(0, Math.min(23, Math.trunc(s.hour)));
  const weekday = ((Math.trunc(s.weekday) % 7) + 7) % 7;
  const monthDay = Math.max(1, Math.min(31, Math.trunc(s.monthDay)));
  const start = zonedParts(after, tz);
  for (let i = 0; i < 400; i++) {
    const day = new Date(Date.UTC(start.y, start.m - 1, start.d + i));
    const y = day.getUTCFullYear();
    const m = day.getUTCMonth() + 1;
    const d = day.getUTCDate();
    const match = s.cadence === "weekly" ? day.getUTCDay() === weekday : d === Math.min(monthDay, daysInMonth(y, m));
    if (!match) continue;
    const t = zonedTimeToUtc(y, m, d, hour, 0, tz);
    if (t.getTime() > after.getTime()) return t;
  }
  throw new Error("Could not compute the next run of this schedule.");
}

const pad = (n: number) => String(n).padStart(2, "0");
const isoDay = (y: number, m: number, d: number) => {
  const t = new Date(Date.UTC(y, m - 1, d));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
};

/**
 * The reporting window of a send at `at`, in the schedule's time zone. Rolling windows end with the
 * last complete day before the send. `report` keeps the report's own saved range.
 */
export function resolveScheduleRange(preset: ScheduleRangePreset, at: Date, tz: string, reportRange?: DateRangeValue | null): DateRangeValue {
  if (preset === "report") return reportRange ?? { preset: "30d" };
  const p = zonedParts(at, safeTz(tz));
  const { y, m, d } = p;
  const rolling = (days: number): DateRangeValue => ({ preset: "custom", from: isoDay(y, m, d - days), to: isoDay(y, m, d - 1) });
  switch (preset) {
    case "last_7":
      return rolling(7);
    case "last_14":
      return rolling(14);
    case "last_30":
      return rolling(30);
    case "last_90":
      return rolling(90);
    case "last_week": {
      const dow = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7; // Monday = 0
      return { preset: "custom", from: isoDay(y, m, d - dow - 7), to: isoDay(y, m, d - dow - 1) };
    }
    case "last_quarter": {
      const q = Math.floor((m - 1) / 3); // current quarter 0..3
      const startMonth = q * 3 - 2; // first month of the previous quarter (may be ≤ 0 → previous year)
      return { preset: "custom", from: isoDay(y, startMonth, 1), to: isoDay(y, q * 3 + 1, 0) };
    }
    case "month_to_date":
      if (d > 1) return { preset: "custom", from: isoDay(y, m, 1), to: isoDay(y, m, d - 1) };
      return { preset: "custom", from: isoDay(y, m - 1, 1), to: isoDay(y, m, 0) };
    case "last_month":
    default:
      return { preset: "custom", from: isoDay(y, m - 1, 1), to: isoDay(y, m, 0) };
  }
}

export function formatHour(hour: number): string {
  return `${pad(Math.max(0, Math.min(23, Math.trunc(hour))))}:00`;
}

function ordinal(n: number): string {
  const s = n % 100 >= 11 && n % 100 <= 13 ? "th" : (["th", "st", "nd", "rd"][n % 10] ?? "th");
  return `${n}${s}`;
}

/** "Every Monday at 08:00 (Europe/Berlin)" / "Monthly on the 1st at 08:00 (UTC)". */
export function describeSchedule(s: ScheduleTiming): string {
  const at = `at ${formatHour(s.hour)} (${s.timezone})`;
  if (s.cadence === "weekly") return `Every ${WEEKDAYS[((s.weekday % 7) + 7) % 7]} ${at}`;
  return s.monthDay >= 31 ? `Monthly on the last day ${at}` : `Monthly on the ${ordinal(s.monthDay)} ${at}${s.monthDay > 28 ? " (or the month's last day)" : ""}`;
}

export function rangePresetLabel(preset: string): string {
  return RANGE_PRESET_OPTIONS.find((o) => o.key === preset)?.label ?? preset;
}

export function formatLabel(format: string): string {
  return FORMAT_OPTIONS.find((o) => o.key === format)?.label ?? format;
}

const EMAIL_RE = /^[^\s@<>(),;:"]+@[^\s@<>(),;:"]+\.[^\s@<>(),;:"]{2,}$/;

/** Splits a free-text recipient field (commas, semicolons, whitespace, new lines) into unique, lower-cased emails. */
export function parseRecipients(input: string | string[]): { valid: string[]; invalid: string[] } {
  const raw = (Array.isArray(input) ? input : input.split(/[\s,;]+/)).map((s) => s.trim().replace(/^<|>$/g, "")).filter(Boolean);
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const r of raw) {
    const e = r.toLowerCase();
    if (EMAIL_RE.test(e) && e.length <= 254) {
      if (!valid.includes(e)) valid.push(e);
    } else invalid.push(r);
  }
  return { valid, invalid };
}
