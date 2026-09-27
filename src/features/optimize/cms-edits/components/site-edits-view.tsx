"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bot, Check, ChevronLeft, ChevronRight, ExternalLink, FilePenLine, ListChecks, PenLine, Plug, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Panel } from "@/components/app/page";
import { StatCard } from "@/components/app/metrics";
import { ConfirmButton, StatusBadge, TimeAgo } from "@/components/app/misc";
import { EmptyState } from "@/components/app/empty-state";
import { useUrlPatch, useUrlState } from "@/hooks/use-url-state";
import { cn } from "@/lib/utils";
import { ProviderGlyph } from "@/features/optimize/integrations/components/provider-glyph";
import { safeHttpUrl } from "@/features/optimize/shared/safe-url";
import type { CmsChangeView, CmsEditTarget } from "@/server/optimize/cms-edits/service";
import { applyCmsChangeAction, rejectCmsChangesAction, revertCmsChangeAction, updateProposedValueAction } from "../actions";
import { DiffView } from "./diff-view";
import { ItemBrowser } from "./item-browser";

type Counts = { proposed: number; applied: number; reverted: number; rejected: number; failed: number };

const FILTERS = [
  { key: "open", label: "Awaiting approval" },
  { key: "applied", label: "Applied" },
  { key: "reverted", label: "Reverted" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
] as const;

const STATUS_LABEL: Record<CmsChangeView["status"], { label: string; tone: string }> = {
  proposed: { label: "Proposed", tone: "pending" },
  applied: { label: "Applied", tone: "success" },
  reverted: { label: "Reverted", tone: "draft" },
  rejected: { label: "Rejected", tone: "cancelled" },
  failed: { label: "Failed", tone: "failed" },
};

const SOURCE_LABEL: Record<CmsChangeView["source"], string> = { user: "Manual", agent: "Agent", mcp: "MCP", api: "API" };

function ChangeCard({
  projectId,
  change,
  canEdit,
  selected,
  onSelect,
}: {
  projectId: string;
  change: CmsChangeView;
  canEdit: boolean;
  selected: boolean;
  onSelect: (v: boolean) => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(change.after);
  const open = change.status === "proposed" || change.status === "failed";
  const s = STATUS_LABEL[change.status];

  const run = (fn: () => Promise<{ ok: true; data: { note?: string | null } | undefined } | { ok: false; error: string }>, success: string) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) {
        toast.error(res.error);
        router.refresh();
        return;
      }
      toast.success(success);
      if (res.data?.note) toast.info(res.data.note);
      router.refresh();
    });

  const revert = (force: boolean) =>
    new Promise<void>((resolve) =>
      start(async () => {
        const res = await revertCmsChangeAction(projectId, change.id, force);
        if (!res.ok) {
          if (!force && res.code === "conflict" && /changed since/i.test(res.error)) {
            toast.warning(res.error, {
              action: { label: "Revert anyway", onClick: () => void revert(true) },
              duration: 12_000,
            });
          } else toast.error(res.error);
          return resolve();
        }
        toast.success("Reverted — the backup is live again");
        if (res.data.note) toast.info(res.data.note);
        router.refresh();
        resolve();
      }),
    );

  return (
    <article className={cn("rounded-2xl border bg-card p-4 shadow-soft", selected && "ring-2 ring-brand/40")}>
      <header className="flex min-w-0 items-start gap-3">
        {canEdit && open && <Checkbox checked={selected} onCheckedChange={(v) => onSelect(v === true)} aria-label="Select change" className="mt-1" />}
        <ProviderGlyph provider={change.provider} size="md" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="line-clamp-1 min-w-0 text-sm font-semibold">{change.itemTitle ?? change.externalId}</span>
            {safeHttpUrl(change.itemUrl) && (
              <a href={safeHttpUrl(change.itemUrl)!} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="Open page">
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">{change.fieldLabel}</span>
            <span>
              {change.providerName} · {change.itemTypeLabel}
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              {change.source === "agent" && <Bot className="size-3" />}
              {SOURCE_LABEL[change.source]}
              {change.proposedBy ? ` by ${change.proposedBy}` : ""}
            </span>
            <span aria-hidden>·</span>
            <TimeAgo date={change.createdAt} />
          </div>
        </div>
        <StatusBadge status={s.tone} label={s.label} className="shrink-0" />
      </header>

      {change.reason && <p className="mt-3 text-sm text-muted-foreground">{change.reason}</p>}

      <div className="mt-3">
        {editing ? (
          <div className="space-y-2">
            <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={change.field === "json_ld" ? 10 : 3} className={cn(change.field === "json_ld" && "font-mono text-xs")} />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setValue(change.after);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const res = await updateProposedValueAction(projectId, change.id, value);
                    if (!res.ok) return void toast.error(res.error);
                    setEditing(false);
                    router.refresh();
                  })
                }
              >
                Save value
              </Button>
            </div>
          </div>
        ) : (
          <DiffView before={change.before} after={change.after} mono={change.field === "json_ld"} />
        )}
      </div>

      {change.warnings.length > 0 && open && (
        <ul className="mt-2 space-y-0.5 text-xs text-warning">
          {change.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
      {change.error && <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{change.error}</p>}

      <footer className="mt-3 flex flex-wrap items-center gap-2">
        {change.taskId && (
          <Link href={`/p/${projectId}/tasks/${change.taskId}`} className="inline-flex min-w-0 items-center gap-1 text-xs text-brand hover:underline">
            <ListChecks className="size-3.5 shrink-0" />
            <span className="truncate">{change.taskTitle ?? "Linked task"}</span>
          </Link>
        )}
        <span className="text-xs text-muted-foreground">
          {change.status === "applied" && change.appliedAt && (
            <>
              Applied {change.appliedBy ? `by ${change.appliedBy} ` : ""}
              <TimeAgo date={change.appliedAt} />
            </>
          )}
          {change.status === "reverted" && change.revertedAt && (
            <>
              Reverted {change.revertedBy ? `by ${change.revertedBy} ` : ""}
              <TimeAgo date={change.revertedAt} />
            </>
          )}
        </span>
        {canEdit && (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {open && !editing && (
              <>
                <Button size="sm" variant="ghost" onClick={() => setEditing(true)} disabled={pending}>
                  <PenLine className="size-3.5" /> Edit
                </Button>
                <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => rejectCmsChangesAction(projectId, [change.id]).then((r) => (r.ok ? { ok: true as const, data: undefined } : r)), "Rejected")}>
                  <X className="size-3.5" /> Reject
                </Button>
                <ConfirmButton
                  title="Apply this change to the live site?"
                  description={`${change.fieldLabel} of “${change.itemTitle ?? change.externalId}” is updated in ${change.providerName}. The current live value is backed up so you can revert it.`}
                  confirmLabel="Approve & apply"
                  onConfirm={() => run(() => applyCmsChangeAction(projectId, change.id), "Applied to the live site")}
                >
                  <Button size="sm" disabled={pending}>
                    <Check className="size-3.5" /> {change.status === "failed" ? "Retry" : "Approve & apply"}
                  </Button>
                </ConfirmButton>
              </>
            )}
            {change.status === "applied" && (
              <ConfirmButton
                title="Revert this change?"
                description={`Restores the backed-up value of ${change.fieldLabel.toLowerCase()} in ${change.providerName}.`}
                confirmLabel="Revert"
                onConfirm={() => revert(false)}
              >
                <Button size="sm" variant="outline" disabled={pending}>
                  <RotateCcw className="size-3.5" /> Revert
                </Button>
              </ConfirmButton>
            )}
          </div>
        )}
      </footer>
    </article>
  );
}

/** Site edits: review queue of proposed edits to existing CMS content + item browser. */
export function SiteEditsView({
  projectId,
  targets,
  changes,
  counts,
  pagination,
  canEdit,
  aiAvailable,
}: {
  projectId: string;
  targets: CmsEditTarget[];
  changes: CmsChangeView[];
  counts: Counts;
  pagination: { page: number; totalPages: number; total: number };
  canEdit: boolean;
  aiAvailable: boolean;
}) {
  const router = useRouter();
  const [filter] = useUrlState("edits", "open");
  const [cms, setCms] = useUrlState("cms", "all");
  const [patch] = useUrlPatch();
  const [browserOpen, setBrowserOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();
  const selectable = changes.filter((c) => c.status === "proposed" || c.status === "failed");

  const bulk = (mode: "apply" | "reject") =>
    new Promise<void>((resolve) =>
      start(async () => {
        const ids = [...selected];
        if (mode === "reject") {
          const res = await rejectCmsChangesAction(projectId, ids);
          if (res.ok) toast.success(`${res.data.rejected} change${res.data.rejected === 1 ? "" : "s"} rejected`);
          else toast.error(res.error);
        } else {
          let ok = 0;
          for (const id of ids) {
            const res = await applyCmsChangeAction(projectId, id);
            if (res.ok) ok++;
            else toast.error(res.error);
          }
          if (ok) toast.success(`${ok} of ${ids.length} change${ids.length === 1 ? "" : "s"} applied`);
        }
        setSelected(new Set());
        router.refresh();
        resolve();
      }),
    );

  if (!targets.length && !changes.length) {
    return (
      <Panel>
        <EmptyState
          icon={Plug}
          title="Connect your CMS to edit your live site"
          description="Connect WordPress, Shopify or Webflow (Content → Connect CMS, or Integrations → CMS). Then fix titles, meta descriptions, alt texts and JSON-LD of existing pages — every edit is reviewed before it goes live and can be reverted. Framer has no write API and stays export-only."
          action={{ label: "Open integrations", href: `/p/${projectId}/integrations` }}
        />
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Awaiting approval" value={counts.proposed} footer="Proposed by you, the agent or the API" />
        <StatCard label="Applied" value={counts.applied} footer="Live — each one can be reverted" />
        <StatCard label="Reverted" value={counts.reverted} footer="Backup restored" />
        <StatCard label="Failed" value={counts.failed} footer={counts.failed ? "Check the error and retry" : "No failed writes"} />
      </div>

      <Panel
        title="Site edits"
        description="Changes to existing pages in your CMS. Nothing goes live until it's approved; the live value is backed up right before writing."
        actions={
          canEdit && targets.length ? (
            <Button size="sm" onClick={() => setBrowserOpen(true)}>
              <FilePenLine className="size-3.5" /> Edit site content
            </Button>
          ) : null
        }
        contentClassName="space-y-3 p-3 sm:p-4"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1">
            {FILTERS.map((f) => {
              const n =
                f.key === "open" ? counts.proposed + counts.failed : f.key === "all" ? null : counts[f.key as keyof Counts];
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    setSelected(new Set());
                    patch({ edits: f.key === "open" ? null : f.key, edits_page: null });
                  }}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors",
                    filter === f.key ? "border-foreground bg-foreground text-background" : "bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.label}
                  {n != null && <span className="ml-1.5 tabular opacity-70">{n}</span>}
                </button>
              );
            })}
          </div>
          {targets.length > 1 && (
            <Select value={cms} onValueChange={(v) => setCms(v === "all" ? null : v)}>
              <SelectTrigger className="h-8 w-full sm:ml-auto sm:w-40" aria-label="CMS">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All CMS</SelectItem>
                {targets.map((t) => (
                  <SelectItem key={t.provider} value={t.provider}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {canEdit && selectable.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-muted/50 px-3 py-2 text-xs">
            <Checkbox
              checked={selected.size > 0 && selected.size === selectable.length ? true : selected.size > 0 ? "indeterminate" : false}
              onCheckedChange={(v) => setSelected(v === true ? new Set(selectable.map((c) => c.id)) : new Set())}
              aria-label="Select all open changes"
            />
            <span className="font-medium tabular">{selected.size ? `${selected.size} selected` : "Select open changes"}</span>
            {selected.size > 0 && (
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" disabled={pending} onClick={() => void bulk("reject")}>
                  <X className="size-3.5" /> Reject
                </Button>
                <ConfirmButton
                  title={`Apply ${selected.size} change${selected.size === 1 ? "" : "s"} to the live site?`}
                  description="Each live value is backed up right before writing, so every change can be reverted."
                  confirmLabel="Approve & apply"
                  onConfirm={() => bulk("apply")}
                >
                  <Button size="sm" disabled={pending}>
                    <Check className="size-3.5" /> Approve & apply
                  </Button>
                </ConfirmButton>
              </div>
            )}
          </div>
        )}

        {changes.length ? (
          <div className="space-y-3">
            {changes.map((c) => (
              <ChangeCard
                key={`${c.id}:${c.updatedAt}`}
                projectId={projectId}
                change={c}
                canEdit={canEdit}
                selected={selected.has(c.id)}
                onSelect={(v) =>
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (v) next.add(c.id);
                    else next.delete(c.id);
                    return next;
                  })
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            compact
            icon={ListChecks}
            title={filter === "open" ? "Nothing waiting for approval" : "No site edits here yet"}
            description={
              filter === "open"
                ? "Open “Edit site content” to change a page, or ask the agent — e.g. “Improve the meta descriptions of our top product pages”. Its proposals land here."
                : "Edits show up here once they were applied, reverted or rejected."
            }
          />
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
            <span className="tabular">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} edits
            </span>
            <div className="flex gap-1">
              <Button size="icon" variant="outline" className="size-7" disabled={pagination.page <= 1} onClick={() => patch({ edits_page: pagination.page - 1 > 1 ? String(pagination.page - 1) : null })} aria-label="Previous page">
                <ChevronLeft className="size-4" />
              </Button>
              <Button size="icon" variant="outline" className="size-7" disabled={pagination.page >= pagination.totalPages} onClick={() => patch({ edits_page: String(pagination.page + 1) })} aria-label="Next page">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Panel>

      {canEdit && targets.length > 0 && <ItemBrowser projectId={projectId} targets={targets} aiAvailable={aiAvailable} open={browserOpen} onOpenChange={setBrowserOpen} />}
    </div>
  );
}
