import "server-only";
import { and, desc, eq, gt, inArray, lt } from "drizzle-orm";
import { db } from "@/server/db/client";
import { analyticsEvents, analyticsSalts, type Attribution } from "@/server/db/schema";
import { randomToken } from "@/server/crypto";
import { env } from "@/server/env";
import { getCurrentSession } from "@/server/auth/session";
import { clientIpFromHeaders, countryFromHeaders } from "@/server/http";
import { classifyChannel, isInternalHost } from "./channels";
import { deviceFromUserAgent, isBot, refererPath, utcDay, visitorHash, type CollectInput } from "./collect";
import { pickAttribution } from "./attribution";
import { DAY_MS } from "./periods";

/** Statistics rows are deleted after this many days. */
const EVENT_RETENTION_DAYS = 400;
/** Page views considered for a sign-up's attribution (today's and yesterday's visitor hash). */
const ATTRIBUTION_WINDOW_MS = 2 * DAY_MS;

/** Today's and yesterday's salts; older ones are deleted from the database and never cached. */
const salts = new Map<string, string>();

function liveDays(now = new Date()): [today: string, yesterday: string] {
  return [utcDay(now), utcDay(new Date(now.getTime() - DAY_MS))];
}

async function daySalt(day: string, create: boolean): Promise<string | null> {
  const cached = salts.get(day);
  if (cached) return cached;
  const read = async () => (await db.select({ salt: analyticsSalts.salt }).from(analyticsSalts).where(eq(analyticsSalts.day, day)).limit(1))[0];
  let row = await read();
  if (!row && create) {
    // Concurrent first requests of a day all end up with whichever insert won.
    await db.insert(analyticsSalts).values({ day, salt: randomToken(32) }).onConflictDoNothing();
    row = await read();
  }
  if (!row) return null;
  const live = liveDays();
  for (const key of salts.keys()) if (!live.includes(key)) salts.delete(key);
  if (live.includes(day)) salts.set(day, row.salt);
  return row.salt;
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

/** Referrers from these hosts are navigation within our own sites, not a traffic source. */
function ownHosts(h: Headers): string[] {
  return [env.domain, hostOf(env.appUrl), hostOf(env.sharedApp.publicUrl), h.get("x-forwarded-host") ?? h.get("host") ?? ""].filter(Boolean);
}

/**
 * Records one event for the visitor of this request: bots and signed-in admins are skipped, the IP address is only
 * used for the daily hash (never stored). Never throws.
 */
export async function recordAnalyticsEvent(h: Headers, input: CollectInput): Promise<void> {
  try {
    const userAgent = h.get("user-agent") ?? "";
    if (isBot(userAgent)) return;
    if ((await getCurrentSession())?.user.isAdmin) return;
    const salt = await daySalt(utcDay(), true);
    if (!salt) return;
    const referrerHost = input.referrerHost && !isInternalHost(input.referrerHost, ownHosts(h)) ? input.referrerHost : null;
    await db.insert(analyticsEvents).values({
      name: input.name,
      visitorHash: visitorHash(salt, clientIpFromHeaders(h), userAgent, env.domain),
      path: input.path,
      referrerHost,
      utmSource: input.utm.source,
      utmMedium: input.utm.medium,
      utmCampaign: input.utm.campaign,
      utmContent: input.utm.content,
      utmTerm: input.utm.term,
      clickSource: input.clickSource,
      channel: classifyChannel({ utmSource: input.utm.source, utmMedium: input.utm.medium, clickSource: input.clickSource, referrerHost }),
      country: countryFromHeaders(h),
      device: deviceFromUserAgent(userAgent),
      props: input.props,
    });
  } catch (err) {
    console.error(`[analytics] failed to record ${input.name}`, err);
  }
}

/** An interaction that happens on the server (e.g. a free AI visibility check), credited to the page it came from. */
export async function recordServerEvent(h: Headers, name: string, fallbackPath: string): Promise<void> {
  await recordAnalyticsEvent(h, {
    name,
    path: refererPath(h.get("referer"), ownHosts(h)) ?? fallbackPath,
    referrerHost: null,
    utm: { source: null, medium: null, campaign: null, content: null, term: null },
    clickSource: null,
    props: null,
  });
}

/**
 * Which channel/campaign led to a sign-up: the page views of the last two days whose visitor hash matches this
 * browser (see pickAttribution). Null without matching page views. Never throws — sign-in must not depend on it.
 */
export async function signupAttribution(ip: string | null, userAgent: string | null): Promise<Attribution | null> {
  try {
    if (!userAgent || isBot(userAgent)) return null;
    const hashes: string[] = [];
    for (const day of liveDays()) {
      const salt = await daySalt(day, false);
      if (salt) hashes.push(visitorHash(salt, ip, userAgent, env.domain));
    }
    if (!hashes.length) return null;
    const touches = await db
      .select({
        createdAt: analyticsEvents.createdAt,
        channel: analyticsEvents.channel,
        path: analyticsEvents.path,
        referrerHost: analyticsEvents.referrerHost,
        utmSource: analyticsEvents.utmSource,
        utmMedium: analyticsEvents.utmMedium,
        utmCampaign: analyticsEvents.utmCampaign,
        utmContent: analyticsEvents.utmContent,
        utmTerm: analyticsEvents.utmTerm,
        clickSource: analyticsEvents.clickSource,
        country: analyticsEvents.country,
      })
      .from(analyticsEvents)
      .where(
        and(
          inArray(analyticsEvents.visitorHash, hashes),
          eq(analyticsEvents.name, "pageview"),
          gt(analyticsEvents.createdAt, new Date(Date.now() - ATTRIBUTION_WINDOW_MS)),
        ),
      )
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(500);
    return pickAttribution(touches);
  } catch (err) {
    console.error("[analytics] sign-up attribution failed", err);
    return null;
  }
}

/** Deletes the salts of the days before yesterday: from then on, those days' hashes can't be linked to anyone. */
export async function purgeAnalyticsSalts(): Promise<void> {
  const [, yesterday] = liveDays();
  await db.delete(analyticsSalts).where(lt(analyticsSalts.day, yesterday));
  for (const day of salts.keys()) if (day < yesterday) salts.delete(day);
}

export async function purgeAnalyticsEvents(): Promise<void> {
  await db.delete(analyticsEvents).where(lt(analyticsEvents.createdAt, new Date(Date.now() - EVENT_RETENTION_DAYS * DAY_MS)));
}
