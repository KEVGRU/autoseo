"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { AlertCircle, Loader2, Lock, PlugZap, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { flagEmoji } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { TOOL_COUNTRIES } from "../lib/countries";
import type { FreeToolSlug } from "../lib/registry";
import { FREE_TOOLS } from "../lib/registry";
import { useToolRunner, type ToolStatus } from "./runner";
import { useTurnstile } from "./turnstile";

export const FIELD_CLASS = "h-10 bg-background text-base sm:text-sm";

export function Field({ id, label, hint, children, className }: { id: string; label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function CountrySelect({ id, value, onChange, disabled }: { id: string; value: number; onChange: (code: number) => void; disabled?: boolean }) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))} disabled={disabled}>
      <SelectTrigger id={id} className="h-10 w-full bg-background" aria-label="Country">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TOOL_COUNTRIES.map((c) => (
          <SelectItem key={c.code} value={String(c.code)}>
            <span className="mr-1.5">{flagEmoji(c.iso)}</span>
            {c.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type Verification = "loading" | "ready" | "error";

/** In-app data source of a DataForSEO-backed tool (null = unavailable). Public surface / free tools: undefined. */
export function useAppToolSource(slug: FreeToolSlug) {
  const runner = useToolRunner();
  if (runner.surface !== "app" || FREE_TOOLS[slug].source !== "dataforseo") return undefined;
  return runner.sources?.[slug] ?? { source: null };
}

/** Notice shown instead of running when the signed-in user can't run a paid tool (or when AI estimates answer it). */
function AppGate({ slug }: { slug: FreeToolSlug }) {
  const runner = useToolRunner();
  const src = useAppToolSource(slug);
  if (!src) return null;
  if (src.source === null) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3.5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-start gap-2">
          <PlugZap className="mt-0.5 size-4 shrink-0 text-warning" />
          <span>
            <span className="font-medium">This tool isn&apos;t available.</span>{" "}
            <span className="text-muted-foreground">
              {src.reason ?? "It is powered by DataForSEO (pay-as-you-go, your own account) or AI estimates (an AI provider)."}
            </span>
          </span>
        </span>
        {runner.isAdmin ? (
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link href="/admin/data">Connect DataForSEO</Link>
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">Ask an admin: Admin → Data Providers</span>
        )}
      </div>
    );
  }
  if (!runner.canRunPaid) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
        <Lock className="size-3.5 shrink-0" />
        Running this tool uses paid {src.source === "ai" ? "AI provider usage" : "DataForSEO credits"} and requires the “Run paid SEO research” permission.
      </div>
    );
  }
  if (src.source === "ai") {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/8 px-3 py-2 text-xs text-muted-foreground">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-warning" />
        <span>
          <span className="font-medium text-foreground">AI estimates.</span> DataForSEO isn&apos;t connected, so an AI model with web search estimates these numbers
          (labelled on the results).{" "}
          {runner.isAdmin ? (
            <Link href="/admin/data" className="underline underline-offset-2">
              Connect DataForSEO
            </Link>
          ) : (
            "Ask an admin to connect DataForSEO"
          )}{" "}
          for measured data.
        </span>
      </div>
    );
  }
  return null;
}

/**
 * Every API-backed tool submits through this form (open-seo `ToolForm`). On the public surface it owns Turnstile
 * verification and hands the one-time token to `onSubmit`; in the app it shows DataForSEO / permission gates.
 */
export function ToolForm({
  slug,
  onSubmit,
  status,
  errorMessage,
  submitLabel,
  loadingLabel = "Checking…",
  costHint,
  children,
}: {
  slug: FreeToolSlug;
  onSubmit: (turnstileToken?: string) => Promise<void>;
  status: ToolStatus;
  errorMessage: string;
  submitLabel: string;
  loadingLabel?: string;
  /** App only: e.g. "2 DataForSEO calls (~$0.05)". */
  costHint?: string;
  children: React.ReactNode;
}) {
  const runner = useToolRunner();
  const tool = FREE_TOOLS[slug];
  const siteKey = runner.surface === "public" ? runner.turnstileSiteKey : "";
  const token = useRef("");
  const submitting = useRef(false);
  const [verification, setVerification] = useState<Verification>(siteKey ? "loading" : "ready");
  const updateToken = (value = "") => {
    token.current = value;
    setVerification(value ? "ready" : "loading");
  };
  const fail = () => {
    token.current = "";
    setVerification("error");
  };
  const { container: widgetContainer, isExpired: widgetExpired, reset: resetWidget } = useTurnstile(siteKey, updateToken, fail);
  const retry = () => {
    if (!siteKey) return;
    updateToken();
    resetWidget();
  };

  const appSource = useAppToolSource(slug);
  const blocked = !!appSource && (appSource.source === null || !runner.canRunPaid);
  const hint = appSource?.source === "ai" ? "AI estimate (LLM + web search) · cached 7 days" : costHint;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current || blocked) return;
    if (siteKey) {
      if (!token.current) return;
      if (widgetExpired()) return retry();
    }
    const verified = siteKey ? token.current : undefined;
    if (siteKey) updateToken();
    submitting.current = true;
    try {
      await onSubmit(verified);
    } finally {
      submitting.current = false;
      if (siteKey) {
        updateToken();
        resetWidget();
      }
    }
  };

  const loading = status === "loading";
  const cacheDuration = tool.cacheDuration ?? "24 hours";

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border bg-card p-3.5 shadow-soft sm:p-4">
      <AppGate slug={slug} />
      {children}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {runner.surface === "public" ? (
            <>
              <ShieldCheck className="size-3.5" />
              Free · No signup{tool.source === "rdap" ? " · Straight from the registry" : ""}
            </>
          ) : (
            (hint ?? (tool.source === "rdap" ? "Free · RDAP registry lookup" : null))
          )}
        </p>
        <Button type="submit" size="lg" disabled={loading || blocked || verification !== "ready"} className="h-10 w-full px-5 sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              {loadingLabel}
            </>
          ) : verification === "loading" ? (
            "Verifying…"
          ) : (
            submitLabel
          )}
        </Button>
      </div>
      {siteKey ? <div ref={widgetContainer} className="empty:hidden" /> : null}
      {verification === "loading" && siteKey && !loading ? (
        <p role="status" className="text-xs text-muted-foreground">
          Verifying your browser. Complete the check above if prompted.
        </p>
      ) : null}
      {verification === "error" ? (
        <div role="alert" className="text-sm text-destructive">
          Verification could not complete. Check your connection and try again.{" "}
          <button type="button" onClick={retry} className="font-medium underline underline-offset-4">
            Retry verification
          </button>
        </div>
      ) : null}
      {status === "error" && errorMessage ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {errorMessage}
        </motion.p>
      ) : null}
      {status === "done" ? (
        <p role="status" className="text-[11px] text-muted-foreground">
          Results may be cached for up to {appSource?.source === "ai" ? "7 days" : cacheDuration}.
        </p>
      ) : null}
    </form>
  );
}
