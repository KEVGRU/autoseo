"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { AlertCircle, ArrowRight, Globe, Loader2, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountryPicker } from "@/features/onboarding/components/market-fields";
import { useTurnstile } from "@/features/free-tools/components/turnstile";
import { cn } from "@/lib/utils";
import { startAppCheckAction } from "../actions";

type Verification = "loading" | "ready" | "error";

type Props =
  | {
      surface: "public";
      turnstileSiteKey: string;
      defaultDomain?: string;
      defaultCountry: string;
      className?: string;
    }
  | {
      surface: "app";
      projectId: string;
      defaultDomain: string;
      defaultCountry: string;
      canRun: boolean;
      className?: string;
    };

/**
 * Website + market (+ optional email on the public page). Public submissions go through the protected route handler
 * with a Turnstile token; in-app runs use a server action. Both navigate to the live report.
 */
export function CheckForm(props: Props) {
  const router = useRouter();
  const [domain, setDomain] = useState(props.defaultDomain ?? "");
  const [country, setCountry] = useState(props.defaultCountry);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const siteKey = props.surface === "public" ? props.turnstileSiteKey : "";
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
  const blocked = props.surface === "app" && !props.canRun;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current || blocked) return;
    if (!domain.trim()) {
      setError("Enter your website, e.g. example.com.");
      return;
    }
    if (siteKey) {
      if (!token.current) return;
      if (widgetExpired()) return retry();
    }
    const verified = siteKey ? token.current : undefined;
    submitting.current = true;
    setPending(true);
    setError("");
    try {
      if (props.surface === "public") {
        const res = await fetch("/api/free-tools/ai-visibility-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domain,
            country,
            email: email.trim() || undefined,
            turnstileToken: verified,
          }),
        });
        const data = (await res.json().catch(() => null)) as {
          url?: string;
          error?: string;
        } | null;
        if (!res.ok || !data?.url) {
          setError(data?.error ?? "The check could not start. Please try again.");
          setPending(false);
          return;
        }
        router.push(data.url);
      } else {
        const res = await startAppCheckAction(props.projectId, {
          domain,
          country,
        });
        if (!res.ok) {
          setError(res.error);
          setPending(false);
          return;
        }
        router.push(`/p/${props.projectId}/seo/tools/ai-visibility-check/${res.data.id}`);
      }
    } catch {
      setError("The check could not start. Check your connection and try again.");
      setPending(false);
    } finally {
      submitting.current = false;
      if (siteKey) {
        updateToken();
        resetWidget();
      }
    }
  };

  return (
    <form onSubmit={submit} className={cn("space-y-4 rounded-2xl border bg-card p-4 shadow-soft sm:p-5", props.className)} noValidate>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="aic-domain" className="text-xs font-medium text-muted-foreground">
            Your website
          </Label>
          <div className="relative">
            <Globe className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="aic-domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="yoursite.com"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="url"
              maxLength={255}
              required
              className="h-11 bg-background pl-9 text-base sm:text-sm"
            />
          </div>
        </div>
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="aic-market" className="text-xs font-medium text-muted-foreground">
            Market
          </Label>
          <CountryPicker id="aic-market" value={country} onChange={setCountry} className="h-11" />
        </div>
      </div>

      {props.surface === "public" && (
        <div className="space-y-1.5">
          <Label htmlFor="aic-email" className="text-xs font-medium text-muted-foreground">
            Email me the report link <span className="font-normal">(optional)</span>
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="aic-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              maxLength={254}
              className="h-11 bg-background pl-9 text-base sm:text-sm"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">Only used to send you the link. Deleted with the report after 30 days.</p>
        </div>
      )}

      {blocked && (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          Running a check asks AI engines on your workspace&apos;s account and requires the “Add prompts, run the agent” permission.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5 shrink-0" />
          {props.surface === "public" ? "Free · No signup · No sales call · Results in ~2–4 minutes" : "Up to 3 engines × 5 prompts, charged to this workspace"}
        </p>
        <Button type="submit" size="lg" disabled={pending || blocked || verification !== "ready"} className="h-11 w-full px-6 sm:w-auto">
          {pending ? (
            <>
              <Loader2 className="animate-spin" />
              Starting…
            </>
          ) : verification === "loading" ? (
            "Verifying…"
          ) : (
            <>
              Run the free check
              <ArrowRight />
            </>
          )}
        </Button>
      </div>

      {siteKey ? <div ref={widgetContainer} className="empty:hidden" /> : null}
      {verification === "loading" && siteKey && !pending ? (
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
      {error ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </motion.p>
      ) : null}
    </form>
  );
}
