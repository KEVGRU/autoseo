import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { settings } from "@/server/db/schema";
import { decryptJson, encryptJson } from "@/server/crypto";

export type SmtpSettings = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  /** Without a dedicated instance server: pass this one to customer instances (AUTOSEO_SMTP_URL / AUTOSEO_MAIL_FROM). */
  shareWithInstances: boolean;
};

/**
 * Optional separate mail server for customer instances. Its credential is copied into every customer container,
 * so it should be an identity that can only send from its own address (e.g. a dedicated SES SMTP user).
 */
export type InstanceSmtpSettings = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
};

export type StripeSettings = {
  secretKey: string;
  mode: "live" | "test" | null;
  accountName: string;
  productId: string;
  priceId: string;
  /** Yearly plan (launch offer); created by setup, or on the first yearly checkout. */
  yearlyPriceId: string;
  /** When this app created the launch offer coupon; a coupon deleted afterwards means the offer was ended early. */
  launchCouponCreatedAt: string | null;
  webhookEndpointId: string;
  webhookSecret: string;
  portalConfigurationId: string;
  connectedAt: string | null;
  lastError: string;
  trialDays: number;
  automaticTax: boolean;
  allowPromotionCodes: boolean;
};

export type CoolifySettings = {
  baseUrl: string;
  apiToken: string;
  serverUuid: string;
  serverName: string;
  projectName: string;
  projectUuid: string;
  environmentName: string;
  baseDomain: string;
  image: string;
  memoryLimit: string;
};

/** What every shared-app workspace includes (sent to the tenant API with every PUT). */
export type PlanSettings = {
  /** Included AI / data provider usage per month (USD, provider cost). */
  monthlyBudgetUsd: number;
  maxProjects: number;
};

type SettingsMap = {
  smtp: SmtpSettings;
  instanceSmtp: InstanceSmtpSettings;
  stripe: StripeSettings;
  coolify: CoolifySettings;
  plan: PlanSettings;
};
export type SettingKey = keyof SettingsMap;

export const STRIPE_PRICE_LOOKUP_KEY = "autoseo_cloud_monthly";
export const STRIPE_YEARLY_PRICE_LOOKUP_KEY = "autoseo_cloud_yearly";

const defaults: SettingsMap = {
  smtp: {
    host: "",
    port: 587,
    secure: false,
    user: "",
    password: "",
    fromName: "AutoSEO Cloud",
    fromEmail: "",
    replyTo: "",
    shareWithInstances: true,
  },
  instanceSmtp: {
    host: "",
    port: 587,
    secure: false,
    user: "",
    password: "",
    fromName: "AutoSEO",
    fromEmail: "",
  },
  stripe: {
    secretKey: "",
    mode: null,
    accountName: "",
    productId: "",
    priceId: "",
    yearlyPriceId: "",
    launchCouponCreatedAt: null,
    webhookEndpointId: "",
    webhookSecret: "",
    portalConfigurationId: "",
    connectedAt: null,
    lastError: "",
    trialDays: 0,
    // Stripe Tax is active on the live account (DE registration).
    automaticTax: true,
    allowPromotionCodes: true,
  },
  plan: {
    monthlyBudgetUsd: 10,
    maxProjects: 10,
  },
  coolify: {
    baseUrl: "https://coolify-v4.codext.de",
    apiToken: "",
    serverUuid: "",
    serverName: "",
    projectName: "AutoSEO Cloud",
    projectUuid: "",
    environmentName: "production",
    baseDomain: "autoseo.codext.de",
    image: "ghcr.io/codextde/autoseo:latest",
    memoryLimit: "1536m",
  },
};

const cache = new Map<SettingKey, { value: unknown; at: number }>();
const CACHE_MS = 5_000;

export async function getSetting<K extends SettingKey>(key: K): Promise<SettingsMap[K]> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value as SettingsMap[K];
  const [row] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  let stored: Partial<SettingsMap[K]> = {};
  if (row) {
    try {
      stored = decryptJson<Partial<SettingsMap[K]>>(row.valueEnc);
    } catch (err) {
      console.error(`[settings] could not decrypt "${key}" (was DATA_DIR/secret.key replaced?)`, err);
    }
  }
  const value = { ...defaults[key], ...stored } as SettingsMap[K];
  cache.set(key, { value, at: Date.now() });
  return value;
}

/** Merges `patch` into the stored document and saves it encrypted. */
export async function updateSetting<K extends SettingKey>(key: K, patch: Partial<SettingsMap[K]>): Promise<SettingsMap[K]> {
  cache.delete(key);
  const current = await getSetting(key);
  const next = { ...current, ...patch } as SettingsMap[K];
  const valueEnc = encryptJson(next);
  await db
    .insert(settings)
    .values({ key, valueEnc })
    .onConflictDoUpdate({ target: settings.key, set: { valueEnc, updatedAt: new Date() } });
  cache.delete(key);
  return next;
}

export function isSmtpConfigured(s: Pick<SmtpSettings, "host" | "fromEmail">): boolean {
  return !!(s.host && s.fromEmail);
}

export function isStripeConnected(s: StripeSettings): boolean {
  return !!(s.secretKey && s.priceId && s.webhookSecret);
}

export function isCoolifyConfigured(s: CoolifySettings): boolean {
  return !!(s.baseUrl && s.apiToken && s.serverUuid && s.baseDomain && s.image);
}
