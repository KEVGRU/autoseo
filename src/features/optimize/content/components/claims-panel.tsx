"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { AlertTriangle, BadgeCheck, CircleHelp, ExternalLink, FileCheck2, Loader2, Quote, RefreshCw, ShieldX, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimeAgo } from "@/components/app/misc";
import type { ContentCitation, ContentClaimChecks, ContentClaimVerdict } from "@/server/db/schema/optimize";
import { hashBody, summarizeClaims } from "@/server/optimize/content/claims-parse";
import { safeHttpUrl } from "@/features/optimize/shared/safe-url";
import { checkClaimsAction, claimStateAction, rewriteWithCitationsAction } from "../actions";

const VERDICT: Record<ContentClaimVerdict, { label: string; icon: typeof BadgeCheck; cls: string }> = {
  supported: { label: "Supported", icon: BadgeCheck, cls: "bg-success/12 text-success" },
  unsupported: { label: "Unsupported", icon: CircleHelp, cls: "bg-warning/15 text-warning" },
  contradicted: { label: "Contradicted", icon: ShieldX, cls: "bg-destructive/10 text-destructive" },
};

/**
 * Claims panel: web-search verification of the draft's factual claims and a "Rewrite with
 * citations" action. `onRewritten` hands the server's new body + citations back to the editor.
 */
export function ClaimsPanel({
  projectId,
  contentId,
  initial,
  body,
  canEdit,
  aiAvailable,
  dirty,
  onRewritten,
}: {
  projectId: string;
  contentId: string;
  initial: ContentClaimChecks | null;
  body: string;
  canEdit: boolean;
  aiAvailable: boolean;
  /** Unsaved editor changes — checks run against the saved body. */
  dirty: boolean;
  onRewritten: (next: { body: string; citations: ContentCitation[] }) => void;
}) {
  const [checks, setChecks] = useState<ContentClaimChecks | null>(initial);
  const [pending, start] = useTransition();
  const running = checks?.status === "running" || checks?.status === "rewriting";
  const wasRewriting = useRef(checks?.status === "rewriting");
  const onRewrittenRef = useRef(onRewritten);
  useEffect(() => {
    onRewrittenRef.current = onRewritten;
  }, [onRewritten]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(async () => {
      const res = await claimStateAction(projectId, contentId);
      if (!res.ok || !res.data) return;
      const next = res.data.claimChecks;
      setChecks(next);
      if (next?.status === "rewriting") wasRewriting.current = true;
      if (next && next.status !== "running" && next.status !== "rewriting") {
        if (wasRewriting.current) {
          wasRewriting.current = false;
          if (!next.error) {
            onRewrittenRef.current({ body: res.data.body, citations: res.data.citations });
            toast.success("Draft rewritten with citations", { description: "Re-check the claims to verify the new version." });
          } else toast.error(next.error);
        } else if (next.status === "done") toast.success(`${next.claims.length} claims checked`);
        else if (next.status === "failed") toast.error(next.error ?? "Claim check failed");
      }
    }, 4000);
    return () => clearInterval(t);
  }, [running, projectId, contentId]);

  const run = (kind: "check" | "cite") =>
    start(async () => {
      const res = kind === "check" ? await checkClaimsAction(projectId, contentId) : await rewriteWithCitationsAction(projectId, contentId);
      if (!res.ok) return void toast.error(res.error);
      if (kind === "cite") wasRewriting.current = true;
      setChecks(res.data);
    });

  const summary = checks?.claims.length ? summarizeClaims(checks.claims) : null;
  const stale = !!checks?.bodyHash && checks.status === "done" && hashBody(body) !== checks.bodyHash;
  const fixable = !!checks?.claims.some((c) => c.verdict !== "supported" || c.sources.some((s) => /^https?:/.test(s.url)));

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Extracts the draft&apos;s checkable facts (numbers, prices, dates, specs, rankings) and verifies each with web search and your connected knowledge. Engines prefer pages whose claims they can corroborate.
      </p>

      {canEdit && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={pending || running || !aiAvailable || dirty} onClick={() => run("check")}>
            {checks?.status === "running" ? <Loader2 className="size-3.5 animate-spin" /> : checks?.claims.length ? <RefreshCw className="size-3.5" /> : <FileCheck2 className="size-3.5" />}
            {checks?.claims.length ? "Re-check claims" : "Check claims"}
          </Button>
          {!!checks?.claims.length && (
            <Button size="sm" disabled={pending || running || !aiAvailable || dirty || !fixable || stale} onClick={() => run("cite")}>
              {checks.status === "rewriting" ? <Loader2 className="size-3.5 animate-spin" /> : <WandSparkles className="size-3.5" />} Rewrite with citations
            </Button>
          )}
        </div>
      )}
      {!aiAvailable && <p className="text-xs text-muted-foreground">Claim checks need an AI provider with web search — connect a local agent or add an API key in Admin → AI Providers.</p>}
      {dirty && <p className="text-xs text-muted-foreground">Saving your latest edits first…</p>}

      {checks?.status === "running" && (
        <div className="flex items-center gap-2 rounded-xl bg-info/10 px-3 py-2 text-xs text-info">
          <Loader2 className="size-3.5 animate-spin" /> Verifying claims with web search — usually 1–3 minutes.
        </div>
      )}
      {checks?.status === "rewriting" && (
        <div className="flex items-center gap-2 rounded-xl bg-info/10 px-3 py-2 text-xs text-info">
          <Loader2 className="size-3.5 animate-spin" /> Rewriting the draft with citations…
        </div>
      )}
      {checks?.error && checks.status !== "running" && (
        <p className="flex items-start gap-1.5 rounded-lg bg-destructive/8 px-2.5 py-1.5 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> {checks.error}
        </p>
      )}
      {stale && (
        <p className="rounded-lg bg-warning/12 px-2.5 py-1.5 text-xs text-warning">The draft changed since this check{checks?.rewrittenAt ? " (rewritten with citations)" : ""} — re-check to verify the current version.</p>
      )}

      {summary && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {(Object.keys(VERDICT) as ContentClaimVerdict[]).map((v) => {
            const m = VERDICT[v];
            return (
              <span key={v} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${m.cls}`}>
                <m.icon className="size-3" /> {summary[v]} {m.label.toLowerCase()}
              </span>
            );
          })}
          {checks?.checkedAt && (
            <span className="ml-auto text-muted-foreground">
              <TimeAgo date={checks.checkedAt} />
            </span>
          )}
        </div>
      )}

      {checks?.claims.length ? (
        <ol className="space-y-2">
          {[...checks.claims]
            .sort((a, b) => ["contradicted", "unsupported", "supported"].indexOf(a.verdict) - ["contradicted", "unsupported", "supported"].indexOf(b.verdict))
            .map((c) => {
              const m = VERDICT[c.verdict];
              return (
                <li key={c.id} className="space-y-1.5 rounded-xl border p-2.5">
                  <div className="flex items-start gap-2">
                    <span className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${m.cls}`}>
                      <m.icon className="size-3" /> {m.label}
                    </span>
                  </div>
                  <p className="flex gap-1.5 text-sm">
                    <Quote className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                    <span>{c.claim}</span>
                  </p>
                  {c.explanation && <p className="text-xs text-muted-foreground">{c.explanation}</p>}
                  {c.suggestion && (
                    <p className="rounded-lg bg-muted/60 px-2 py-1 text-xs">
                      <span className="font-medium">Suggested: </span>
                      {c.suggestion}
                    </p>
                  )}
                  {c.sources.length > 0 && (
                    <ul className="space-y-0.5">
                      {c.sources.map((s) => {
                        const href = safeHttpUrl(s.url);
                        return (
                          <li key={s.url} className="flex items-center gap-1 text-[11px]">
                            <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                            {href ? (
                              <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="truncate text-brand hover:underline">
                                {s.title || s.url.replace(/^https?:\/\/(www\.)?/, "")}
                              </a>
                            ) : (
                              <span className="truncate text-muted-foreground">Internal knowledge{s.title ? ` · ${s.title}` : ""}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
        </ol>
      ) : (
        checks?.status !== "running" && <p className="text-sm text-muted-foreground">No claim check yet.</p>
      )}
    </div>
  );
}
