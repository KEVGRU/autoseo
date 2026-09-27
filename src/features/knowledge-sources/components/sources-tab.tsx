"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  FileUp,
  FolderOpen,
  Globe,
  Hash,
  Loader2,
  NotebookText,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Panel } from "@/components/app/page";
import { EmptyState } from "@/components/app/empty-state";
import { ConfirmButton, StatusBadge, TimeAgo } from "@/components/app/misc";
import { KpiStrip, formatNumber } from "@/components/app/metrics";
import { useUrlPatch, useUrlState } from "@/hooks/use-url-state";
import { safeHttpUrl } from "@/features/optimize/shared/safe-url";
import type { KnowledgeSourceKind } from "@/server/db/schema/knowledge-sources";
import {
  connectDriveAction,
  connectNotionAction,
  connectSlackAction,
  connectUrlsAction,
  deleteSourceAction,
  removeUploadedFileAction,
  resyncSourceAction,
  searchKnowledgeAction,
  slackChannelsAction,
  updateSourceAction,
  uploadKnowledgeFilesAction,
} from "../actions";
import type { DriveAccountLite, KnowledgeHitLite, KnowledgeSourceLite, SlackChannelLite } from "../types";

export const KIND_META: Record<KnowledgeSourceKind, { label: string; icon: typeof Globe; blurb: string; connect: boolean }> = {
  notion: { label: "Notion", icon: NotebookText, blurb: "Wikis, product docs and briefs shared with an internal integration.", connect: true },
  gdrive: { label: "Google Drive", icon: FolderOpen, blurb: "Docs, Sheets, Slides, PDFs and DOCX from a folder or your Drive.", connect: true },
  slack: { label: "Slack", icon: Hash, blurb: "Expert discussions from selected channels, incl. threads.", connect: true },
  upload: { label: "Upload", icon: FileUp, blurb: "PDF, DOCX, Markdown, TXT, HTML or CSV files.", connect: false },
  url: { label: "Website", icon: Globe, blurb: "Public pages — your own site, docs or studies — fetched and kept fresh.", connect: false },
};
const KIND_ORDER: KnowledgeSourceKind[] = ["url", "upload", "notion", "gdrive", "slack"];

const STATUS_BADGE: Record<KnowledgeSourceLite["status"], { status: string; label: string }> = {
  pending: { status: "queued", label: "Queued" },
  syncing: { status: "running", label: "Syncing" },
  ready: { status: "active", label: "Ready" },
  error: { status: "error", label: "Error" },
};

type Props = {
  projectId: string;
  sources: KnowledgeSourceLite[];
  driveAccounts: DriveAccountLite[];
  googleConfigured: boolean;
  canManage: boolean;
  canConnect: boolean;
};

export function SourcesTab({ projectId, sources, driveAccounts, googleConfigured, canManage, canConnect }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [adding, setAdding] = useUrlState("add", "");
  const [patchUrl] = useUrlPatch();
  const [uploadTo, setUploadTo] = useState<KnowledgeSourceLite | null>(null);
  const [editing, setEditing] = useState<KnowledgeSourceLite | null>(null);
  const googleConnected = params.get("google_connected") === "drive" ? params.get("google_account") : null;
  const googleError = params.get("google_product") === "drive" ? params.get("google_error") : null;
  const googleMessage = params.get("google_message");

  // Coming back from Google consent: open the Drive dialog with the new account (or explain the
  // error) once, then drop the callback parameters from the URL.
  useEffect(() => {
    if (!googleConnected && !googleError) return;
    if (googleError)
      toast.error(
        googleError === "not_configured"
          ? "Google OAuth isn't configured — an admin can add it in Admin → Data Providers."
          : googleError === "forbidden"
            ? "Connecting Google Drive requires the integrations permission."
            : googleMessage || "Google Drive was not connected.",
      );
    patchUrl({ google_connected: null, google_account: null, google_error: null, google_product: null, google_message: null, add: googleConnected ? "gdrive" : null });
  }, [googleConnected, googleError, googleMessage, patchUrl]);
  const [preselect] = useState(googleConnected);

  const busy = sources.some((s) => s.status === "syncing" || s.status === "pending");
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(t);
  }, [busy, router]);

  const totals = useMemo(
    () => ({ docs: sources.reduce((a, s) => a + s.docCount, 0), chunks: sources.reduce((a, s) => a + s.chunkCount, 0), ready: sources.filter((s) => s.status === "ready").length }),
    [sources],
  );

  const open = (kind: KnowledgeSourceKind) => {
    if (kind === "upload") setUploadTo(null);
    setAdding(kind);
  };

  return (
    <div className="space-y-4">
      <Panel
        title="Connected knowledge"
        description="Content generation retrieves the most relevant passages from these sources and cites them as internal sources — so drafts reflect your own expertise, not just the open web."
        actions={canManage ? <AddSourceMenu onPick={open} canConnect={canConnect} /> : null}
      >
        {sources.length ? (
          <KpiStrip
            items={[
              { key: "sources", label: "Sources", value: formatNumber(sources.length), sub: `${totals.ready} ready` },
              { key: "docs", label: "Documents", value: formatNumber(totals.docs) },
              { key: "chunks", label: "Indexed passages", value: formatNumber(totals.chunks), sub: "~800 tokens each" },
            ]}
          />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {KIND_ORDER.map((k) => {
              const m = KIND_META[k];
              const disabled = !canManage || (m.connect && !canConnect);
              return (
                <button
                  key={k}
                  type="button"
                  disabled={disabled}
                  onClick={() => open(k)}
                  className="flex flex-col items-start gap-1.5 rounded-xl border bg-background p-3 text-left transition-colors hover:border-foreground/30 disabled:opacity-50"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <m.icon className="size-4" />
                  </span>
                  <span className="text-sm font-medium">{m.label}</span>
                  <span className="text-xs text-muted-foreground">{m.blurb}</span>
                </button>
              );
            })}
          </div>
        )}
      </Panel>

      {sources.length > 0 && (
        <div className="grid gap-3 xl:grid-cols-2">
          {sources.map((s) => (
            <SourceCard
              key={s.id}
              projectId={projectId}
              source={s}
              canManage={canManage}
              canConnect={canConnect}
              onUpload={() => {
                setUploadTo(s);
                setAdding("upload");
              }}
              onEdit={() => setEditing(s)}
            />
          ))}
        </div>
      )}

      <SearchPanel projectId={projectId} sources={sources} />

      <NotionDialog projectId={projectId} open={adding === "notion"} onOpenChange={(v) => setAdding(v ? "notion" : null)} />
      <SlackDialog projectId={projectId} open={adding === "slack"} onOpenChange={(v) => setAdding(v ? "slack" : null)} />
      <DriveDialog
        projectId={projectId}
        open={adding === "gdrive"}
        onOpenChange={(v) => setAdding(v ? "gdrive" : null)}
        accounts={driveAccounts}
        googleConfigured={googleConfigured}
        preselect={preselect}
      />
      <UrlDialog projectId={projectId} open={adding === "url"} onOpenChange={(v) => setAdding(v ? "url" : null)} />
      <UploadDialog projectId={projectId} open={adding === "upload"} onOpenChange={(v) => setAdding(v ? "upload" : null)} target={uploadTo} />
      {editing && <EditDialog projectId={projectId} source={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function AddSourceMenu({ onPick, canConnect }: { onPick: (k: KnowledgeSourceKind) => void; canConnect: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">
          <Plus className="size-3.5" /> Add source <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {KIND_ORDER.map((k) => {
          const m = KIND_META[k];
          const disabled = m.connect && !canConnect;
          return (
            <DropdownMenuItem key={k} disabled={disabled} onSelect={() => onPick(k)} className="items-start gap-2 py-2">
              <m.icon className="mt-0.5 size-4 text-muted-foreground" />
              <span className="min-w-0">
                <span className="block text-sm font-medium">{m.label}</span>
                <span className="block text-xs text-muted-foreground">{disabled ? "Requires the integrations permission" : m.blurb}</span>
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ───────────────────────────── Source card ───────────────────────────── */

function SourceCard({
  projectId,
  source: s,
  canManage,
  canConnect,
  onUpload,
  onEdit,
}: {
  projectId: string;
  source: KnowledgeSourceLite;
  canManage: boolean;
  canConnect: boolean;
  onUpload: () => void;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const meta = KIND_META[s.kind];
  const badge = STATUS_BADGE[s.status];
  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, success?: string) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) return void toast.error(res.error ?? "Something went wrong");
      if (success) toast.success(success);
      router.refresh();
    });
  const editable = canManage && (!meta.connect || canConnect || s.kind === "gdrive");

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <meta.icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium">{s.name}</span>
            <StatusBadge status={badge.status} label={badge.label} />
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span>{meta.label}</span>
            <span className="tabular">
              {formatNumber(s.docCount)} doc{s.docCount === 1 ? "" : "s"} · {formatNumber(s.chunkCount)} passages
            </span>
            {s.lastSyncAt ? (
              <span>
                {s.kind === "upload" ? "Updated" : "Synced"} <TimeAgo date={s.lastSyncAt} />
              </span>
            ) : (
              <span>Not synced yet</span>
            )}
            {s.kind !== "upload" && <span>{s.autoSync ? "Syncs daily" : "Manual sync"}</span>}
          </div>
        </div>
        {canManage && (
          <div className="flex shrink-0 items-center gap-1">
            {s.kind === "upload" ? (
              <Button size="icon" variant="ghost" className="size-8" onClick={onUpload} aria-label="Add files" title="Add files">
                <FileUp className="size-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                className="size-8"
                disabled={pending || s.status === "syncing"}
                onClick={() => act(() => resyncSourceAction(projectId, s.id), "Sync started")}
                aria-label="Sync now"
                title="Sync now"
              >
                <RefreshCw className={`size-4 ${s.status === "syncing" ? "animate-spin" : ""}`} />
              </Button>
            )}
            {editable && (
              <Button size="icon" variant="ghost" className="size-8" onClick={onEdit} aria-label="Edit source" title="Edit">
                <Pencil className="size-4" />
              </Button>
            )}
            <ConfirmButton
              title={`Remove “${s.name}”?`}
              description="Its indexed passages are deleted. Existing drafts keep their citations."
              destructive
              confirmLabel="Remove"
              onConfirm={() => act(() => deleteSourceAction(projectId, s.id), "Source removed")}
            >
              <Button size="icon" variant="ghost" className="size-8" aria-label="Remove source" title="Remove">
                <Trash2 className="size-4" />
              </Button>
            </ConfirmButton>
          </div>
        )}
      </div>

      <SourceConfigSummary source={s} canManage={canManage} onRemoveFile={(docId) => act(() => removeUploadedFileAction(projectId, s.id, docId), "File removed")} pending={pending} />

      {s.status === "error" && s.error && (
        <p className="flex items-start gap-1.5 rounded-lg bg-destructive/8 px-2.5 py-1.5 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> {s.error}
        </p>
      )}
      {s.notes.length > 0 && (
        <details className="rounded-lg bg-warning/8 px-2.5 py-1.5 text-xs text-warning">
          <summary className="cursor-pointer">
            {s.notes.length} note{s.notes.length === 1 ? "" : "s"} from the last sync
          </summary>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted-foreground">
            {s.notes.map((n, i) => (
              <li key={i} className="break-words">
                {n}
              </li>
            ))}
          </ul>
        </details>
      )}
      {canManage && s.kind !== "upload" && (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={s.autoSync} disabled={pending} onCheckedChange={(v) => act(() => updateSourceAction(projectId, s.id, { autoSync: v }))} /> Re-sync daily
        </label>
      )}
    </div>
  );
}

function SourceConfigSummary({ source: s, canManage, onRemoveFile, pending }: { source: KnowledgeSourceLite; canManage: boolean; onRemoveFile: (docId: string) => void; pending: boolean }) {
  const cfg = s.config;
  const chip = (text: string, key?: string) => (
    <span key={key ?? text} className="inline-flex max-w-full items-center truncate rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
      {text}
    </span>
  );
  if (s.kind === "notion")
    return <div className="flex flex-wrap gap-1">{cfg.rootIds?.length ? chip(`${cfg.rootIds.length} root page${cfg.rootIds.length === 1 ? "" : "s"} / databases`) : chip("All pages shared with the integration")}{cfg.workspaceName && chip(cfg.workspaceName)}</div>;
  if (s.kind === "gdrive")
    return (
      <div className="flex flex-wrap gap-1">
        {chip(cfg.folderName ? `Folder: ${cfg.folderName}` : "Most recent files in Drive")}
        {cfg.googleEmail && chip(cfg.googleEmail)}
        {chip(`max ${cfg.maxDocs ?? 200} files`)}
      </div>
    );
  if (s.kind === "slack")
    return (
      <div className="flex flex-wrap gap-1">
        {(cfg.channels ?? []).slice(0, 8).map((c) => chip(`#${c.name}`, c.id))}
        {(cfg.channels?.length ?? 0) > 8 && chip(`+${(cfg.channels?.length ?? 0) - 8} more`)}
        {chip(`last ${cfg.days ?? 90} days`)}
      </div>
    );
  if (s.kind === "url")
    return (
      <div className="flex flex-wrap gap-1">
        {(cfg.urls ?? []).slice(0, 4).map((u) => chip(u.replace(/^https?:\/\/(www\.)?/, ""), u))}
        {(cfg.urls?.length ?? 0) > 4 && chip(`+${(cfg.urls?.length ?? 0) - 4} more`)}
        {cfg.followLinks && chip(`follows same-site links · max ${cfg.maxDocs ?? 25} pages`)}
      </div>
    );
  const files = cfg.files ?? [];
  if (!files.length) return <p className="text-xs text-muted-foreground">No files yet.</p>;
  return (
    <ul className="max-h-40 space-y-1 overflow-y-auto text-xs">
      {files.map((f) => (
        <li key={f.docId} className="flex items-center gap-2">
          <FileUp className="size-3 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate">{f.name}</span>
          <span className="shrink-0 text-muted-foreground tabular">{Math.max(1, Math.round(f.bytes / 1024))} KB</span>
          {canManage && (
            <button type="button" disabled={pending} onClick={() => onRemoveFile(f.docId)} className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Remove ${f.name}`}>
              <X className="size-3" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

/* ───────────────────────────── Test search ───────────────────────────── */

function SearchPanel({ projectId, sources }: { projectId: string; sources: KnowledgeSourceLite[] }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<KnowledgeHitLite[] | null>(null);
  const [pending, start] = useTransition();
  const byId = useMemo(() => new Map(sources.map((s) => [s.id, s])), [sources]);
  const run = () =>
    start(async () => {
      const res = await searchKnowledgeAction(projectId, q);
      if (!res.ok) return void toast.error(res.error);
      setHits(res.data);
    });
  return (
    <Panel title="Test retrieval" description="See which passages content generation would pull in for a question.">
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim().length >= 2) run();
        }}
      >
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. How long is the warranty on the battery?" className="flex-1" />
        <Button type="submit" variant="outline" disabled={pending || q.trim().length < 2 || !sources.length}>
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />} Search
        </Button>
      </form>
      {!sources.length && <p className="mt-3 text-sm text-muted-foreground">Add a source first — then search across everything it indexed.</p>}
      {hits && (
        <div className="mt-3 space-y-2">
          {hits.length ? (
            hits.map((h, i) => {
              const Icon = KIND_META[h.sourceKind].icon;
              const href = safeHttpUrl(h.url);
              return (
                <div key={h.chunkId} className="rounded-xl border bg-background p-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground tabular">#{i + 1}</span>
                    <Icon className="size-3.5" />
                    <span className="truncate">{byId.get(h.sourceId)?.name ?? h.sourceName}</span>
                    <span className="ml-auto tabular" title="Relevance (term coverage + full-text rank)">
                      {Math.round(h.score * 100)}%
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                    <span className="truncate">{h.title || "Untitled"}</span>
                    {href && (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="Open original">
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{h.excerpt}</p>
                  {h.matched.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {h.matched.map((m) => (
                        <span key={m} className="rounded bg-brand-soft px-1 py-0.5 text-[10px] text-brand">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <EmptyState compact icon={Search} title="No matching passages" description="Try other words — search matches the terms in your documents (stemmed, prefix-aware)." />
          )}
        </div>
      )}
    </Panel>
  );
}

/* ───────────────────────────── Connect dialogs ───────────────────────────── */

function useSubmit(onDone: () => void) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const submit = (fn: () => Promise<{ ok: true; data: unknown } | { ok: false; error: string }>, success: string) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) return void toast.error(res.error);
      toast.success(success);
      onDone();
      router.refresh();
    });
  return { pending, submit };
}

function Steps({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="list-decimal space-y-1 rounded-xl bg-muted/50 py-2.5 pr-3 pl-7 text-xs text-muted-foreground">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ol>
  );
}

function NotionDialog({ projectId, open, onOpenChange }: { projectId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [token, setToken] = useState("");
  const [roots, setRoots] = useState("");
  const [name, setName] = useState("");
  const { pending, submit } = useSubmit(() => {
    onOpenChange(false);
    setToken("");
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <NotebookText className="size-4" /> Connect Notion
          </DialogTitle>
          <DialogDescription>Pages are read with an internal integration — AutoSEO only sees pages you share with it.</DialogDescription>
        </DialogHeader>
        <Steps
          items={[
            <>
              Create an internal integration at{" "}
              <a href="https://www.notion.so/profile/integrations" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline">
                notion.so/profile/integrations
              </a>{" "}
              (read content capability is enough).
            </>,
            "Copy its Internal Integration Secret (ntn_…).",
            "In Notion, open each page or database → ••• → Connections → add the integration (child pages are included).",
          ]}
        />
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="n-token">Integration secret</Label>
            <Input id="n-token" type="password" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} placeholder="ntn_…" className="font-mono text-xs" />
            <p className="text-[11px] text-muted-foreground">Stored encrypted; never shown again.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="n-roots">Limit to pages / databases (optional)</Label>
            <Textarea id="n-roots" rows={3} value={roots} onChange={(e) => setRoots(e.target.value)} placeholder={"https://www.notion.so/acme/Brand-guide-1a2b…\nOne link or id per line — empty = every shared page"} className="text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="n-name">Name (optional)</Label>
            <Input id="n-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Notion · Product wiki" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => submit(() => connectNotionAction(projectId, { token, roots, name }), "Notion connected — syncing pages…")} disabled={pending || token.trim().length < 10}>
            {pending && <Loader2 className="size-3.5 animate-spin" />} Connect & sync
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChannelPicker({ channels, selected, onChange }: { channels: SlackChannelLite[]; selected: Set<string>; onChange: (s: Set<string>) => void }) {
  const [filter, setFilter] = useState("");
  const list = channels.filter((c) => c.name.toLowerCase().includes(filter.trim().toLowerCase()));
  return (
    <div className="space-y-2">
      <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter channels…" className="h-8 text-sm" />
      <div className="max-h-56 space-y-0.5 overflow-y-auto rounded-xl border p-1.5">
        {list.map((c) => (
          <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-muted">
            <Checkbox
              checked={selected.has(c.id)}
              onCheckedChange={(v) => {
                const next = new Set(selected);
                if (v) next.add(c.id);
                else next.delete(c.id);
                onChange(next);
              }}
            />
            <span className="min-w-0 flex-1 truncate">
              {c.isPrivate ? "🔒" : "#"}
              {c.name}
            </span>
            <span className="shrink-0 text-[11px] text-muted-foreground">{c.isMember ? "bot joined" : c.isPrivate ? "invite bot" : "auto-join"}</span>
          </label>
        ))}
        {!list.length && <p className="px-1.5 py-2 text-xs text-muted-foreground">No channels match.</p>}
      </div>
      <p className="text-[11px] text-muted-foreground tabular">{selected.size} selected</p>
    </div>
  );
}

const DAY_OPTIONS = [30, 90, 180, 365];

function SlackDialog({ projectId, open, onOpenChange }: { projectId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [days, setDays] = useState("90");
  const [channels, setChannels] = useState<SlackChannelLite[] | null>(null);
  const [team, setTeam] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, startLoad] = useTransition();
  const { pending, submit } = useSubmit(() => {
    onOpenChange(false);
    setToken("");
    setChannels(null);
    setSelected(new Set());
  });
  const load = () =>
    startLoad(async () => {
      const res = await slackChannelsAction(projectId, { token });
      if (!res.ok) return void toast.error(res.error);
      setChannels(res.data.channels);
      setTeam(res.data.team.teamName);
      setSelected(new Set(res.data.channels.filter((c) => c.isMember).map((c) => c.id)));
    });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="size-4" /> Connect Slack
          </DialogTitle>
          <DialogDescription>Reads the history of the channels you pick (incl. threads) — one document per channel and day.</DialogDescription>
        </DialogHeader>
        <Steps
          items={[
            <>
              Create a Slack app at{" "}
              <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline">
                api.slack.com/apps
              </a>{" "}
              → OAuth & Permissions → Bot token scopes: <code>channels:history</code>, <code>channels:read</code>, <code>users:read</code> (+ <code>groups:history</code>, <code>groups:read</code> for private channels, <code>channels:join</code> to auto-join public ones).
            </>,
            "Install the app to your workspace and copy the Bot User OAuth Token (xoxb-…).",
            "Invite the app to private channels with /invite @your-app.",
          ]}
        />
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="s-token">Bot token</Label>
            <div className="flex gap-2">
              <Input id="s-token" type="password" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} placeholder="xoxb-…" className="font-mono text-xs" />
              <Button type="button" variant="outline" onClick={load} disabled={loading || token.trim().length < 10}>
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : null} Load channels
              </Button>
            </div>
          </div>
          {channels && (
            <>
              {team && <p className="text-xs text-muted-foreground">Workspace: {team}</p>}
              <ChannelPicker channels={channels} selected={selected} onChange={setSelected} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>History</Label>
                  <Select value={days} onValueChange={setDays}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAY_OPTIONS.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          Last {d} days
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-name">Name (optional)</Label>
                  <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Slack · Product team" />
                </div>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button
            disabled={pending || !channels || !selected.size}
            onClick={() =>
              submit(
                () =>
                  connectSlackAction(projectId, {
                    token,
                    name,
                    days: Number(days),
                    channels: (channels ?? []).filter((c) => selected.has(c.id)).map((c) => ({ id: c.id, name: c.name })),
                  }),
                "Slack connected — reading channels…",
              )
            }
          >
            {pending && <Loader2 className="size-3.5 animate-spin" />} Connect & sync
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DriveDialog({
  projectId,
  open,
  onOpenChange,
  accounts,
  googleConfigured,
  preselect,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  accounts: DriveAccountLite[];
  googleConfigured: boolean;
  preselect: string | null;
}) {
  const [accountId, setAccountId] = useState<string>(preselect && accounts.some((a) => a.id === preselect) ? preselect : (accounts[0]?.id ?? ""));
  const [folder, setFolder] = useState("");
  const [name, setName] = useState("");
  const [maxDocs, setMaxDocs] = useState("200");
  const { pending, submit } = useSubmit(() => onOpenChange(false));
  const connectHref = `/p/${projectId}/knowledge/google-drive`;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="size-4" /> Connect Google Drive
          </DialogTitle>
          <DialogDescription>Google Docs, Sheets and Slides are exported as text; PDFs and DOCX files are parsed. Access is read-only.</DialogDescription>
        </DialogHeader>
        {!googleConfigured ? (
          <p className="rounded-xl bg-warning/10 px-3 py-2.5 text-sm text-warning">
            Google OAuth isn&apos;t configured yet. An admin can add the OAuth client in Admin → Data Providers (enable the Google Drive API for that Cloud project).
          </p>
        ) : !accounts.length ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">No Google account in this workspace has granted Drive access yet.</p>
            <Button asChild>
              <a href={connectHref}>
                <FolderOpen className="size-3.5" /> Connect Google Drive
              </a>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Google account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.email ?? a.name ?? a.id}
                      {a.status === "error" ? " (reconnect needed)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <a href={connectHref} className="text-[11px] text-muted-foreground underline hover:text-foreground">
                Use another Google account
              </a>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-folder">Folder (optional)</Label>
              <Input id="d-folder" value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="https://drive.google.com/drive/folders/…" className="text-xs" />
              <p className="text-[11px] text-muted-foreground">Includes subfolders. Empty = the most recently modified files the account can see.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Max files</Label>
                <Select value={maxDocs} onValueChange={setMaxDocs}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["50", "200", "500", "1000"].map((n) => (
                      <SelectItem key={n} value={n}>
                        {n} files
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="d-name">Name (optional)</Label>
                <Input id="d-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Drive · Marketing" />
              </div>
            </div>
          </div>
        )}
        {googleConfigured && accounts.length > 0 && (
          <DialogFooter>
            <Button disabled={pending || !accountId} onClick={() => submit(() => connectDriveAction(projectId, { accountId, folder, name, maxDocs: Number(maxDocs) }), "Google Drive connected — syncing files…")}>
              {pending && <Loader2 className="size-3.5 animate-spin" />} Connect & sync
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function UrlDialog({ projectId, open, onOpenChange }: { projectId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [urls, setUrls] = useState("");
  const [name, setName] = useState("");
  const [follow, setFollow] = useState(true);
  const [maxDocs, setMaxDocs] = useState("25");
  const { pending, submit } = useSubmit(() => {
    onOpenChange(false);
    setUrls("");
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="size-4" /> Add web pages
          </DialogTitle>
          <DialogDescription>Public pages are fetched securely, the main content is extracted and re-fetched daily.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="u-urls">URLs</Label>
            <Textarea id="u-urls" rows={5} value={urls} onChange={(e) => setUrls(e.target.value)} placeholder={"https://example.com/about\nhttps://example.com/docs/warranty\nOne per line (up to 200)"} className="text-xs" />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <Switch checked={follow} onCheckedChange={setFollow} className="mt-0.5" />
            <span>
              Follow links on the same site
              <span className="block text-xs text-muted-foreground">Good for a homepage or docs index — overview pages first.</span>
            </span>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Max pages</Label>
              <Select value={maxDocs} onValueChange={setMaxDocs}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["10", "25", "50", "100", "200"].map((n) => (
                    <SelectItem key={n} value={n}>
                      {n} pages
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-name">Name (optional)</Label>
              <Input id="u-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Website · Help center" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={pending || urls.trim().length < 4}
            onClick={() => submit(() => connectUrlsAction(projectId, { urls, name, followLinks: follow, maxDocs: Number(maxDocs) }), "Pages added — fetching…")}
          >
            {pending && <Loader2 className="size-3.5 animate-spin" />} Add & fetch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const ACCEPT = ".pdf,.docx,.md,.markdown,.txt,.text,.html,.htm,.csv";

function UploadDialog({ projectId, open, onOpenChange, target }: { projectId: string; open: boolean; onOpenChange: (v: boolean) => void; target: KnowledgeSourceLite | null }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  const ref = useRef<HTMLInputElement>(null);
  const size = files.reduce((a, f) => a + f.size, 0);
  const upload = () =>
    start(async () => {
      const fd = new FormData();
      for (const f of files) fd.append("files", f);
      if (target) fd.set("sourceId", target.id);
      else fd.set("name", name);
      const res = await uploadKnowledgeFilesAction(projectId, fd);
      if (!res.ok) return void toast.error(res.error);
      toast.success(`${res.data.added} file${res.data.added === 1 ? "" : "s"} indexed (${formatNumber(res.data.chunkCount)} passages)`);
      for (const e of res.data.errors) toast.error(e);
      setFiles([]);
      onOpenChange(false);
      router.refresh();
    });
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setFiles([]);
      }}
    >
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="size-4" /> {target ? `Add files to “${target.name}”` : "Upload documents"}
          </DialogTitle>
          <DialogDescription>Studies, product sheets, brand guides, expert interviews — text is extracted and indexed; files are not stored.</DialogDescription>
        </DialogHeader>
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex w-full flex-col items-center gap-1.5 rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground hover:border-foreground/40 hover:text-foreground"
        >
          <FileUp className="size-5" />
          {files.length ? <span className="font-medium text-foreground">{files.length === 1 ? files[0]!.name : `${files.length} files`}</span> : "Choose files"}
          <span className="text-[11px]">PDF, DOCX, MD, TXT, HTML, CSV · up to 20 MB each, 24 MB per upload</span>
        </button>
        <input
          ref={ref}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            setFiles([...(e.target.files ?? [])].slice(0, 20));
            e.target.value = "";
          }}
        />
        {files.length > 1 && (
          <ul className="max-h-32 space-y-0.5 overflow-y-auto text-xs text-muted-foreground">
            {files.map((f) => (
              <li key={f.name + f.size} className="truncate">
                {f.name}
              </li>
            ))}
          </ul>
        )}
        {!target && (
          <div className="space-y-1.5">
            <Label htmlFor="up-name">Name (optional)</Label>
            <Input id="up-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product sheets 2026" />
          </div>
        )}
        {size > 24 * 1024 * 1024 && <p className="text-xs text-destructive">These files are larger than 24 MB in total — upload them in several batches.</p>}
        <DialogFooter>
          <Button disabled={pending || !files.length || size > 24 * 1024 * 1024} onClick={upload}>
            {pending && <Loader2 className="size-3.5 animate-spin" />} Upload & index
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────────────────────── Edit ───────────────────────────── */

function EditDialog({ projectId, source: s, onClose }: { projectId: string; source: KnowledgeSourceLite; onClose: () => void }) {
  const [name, setName] = useState(s.name);
  const [urls, setUrls] = useState((s.config.urls ?? []).join("\n"));
  const [follow, setFollow] = useState(!!s.config.followLinks);
  const [roots, setRoots] = useState((s.config.rootIds ?? []).join("\n"));
  const [token, setToken] = useState("");
  const [days, setDays] = useState(String(s.config.days ?? 90));
  const [channels, setChannels] = useState<SlackChannelLite[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set((s.config.channels ?? []).map((c) => c.id)));
  const [loading, startLoad] = useTransition();
  const { pending, submit } = useSubmit(onClose);
  const loadChannels = () =>
    startLoad(async () => {
      const res = await slackChannelsAction(projectId, token ? { token } : { sourceId: s.id });
      if (!res.ok) return void toast.error(res.error);
      setChannels(res.data.channels);
    });
  const save = () => {
    const input: Parameters<typeof updateSourceAction>[2] = {};
    if (name.trim() && name.trim() !== s.name) input.name = name.trim();
    if (s.kind === "url") {
      if (urls.trim() !== (s.config.urls ?? []).join("\n")) input.urls = urls;
      if (follow !== !!s.config.followLinks) input.followLinks = follow;
    }
    if (s.kind === "notion" && roots.trim() !== (s.config.rootIds ?? []).join("\n")) input.roots = roots;
    if (s.kind === "slack") {
      if (Number(days) !== (s.config.days ?? 90)) input.days = Number(days);
      if (channels) input.channels = channels.filter((c) => selected.has(c.id)).map((c) => ({ id: c.id, name: c.name }));
    }
    if (token.trim()) input.token = token.trim();
    if (!Object.keys(input).length) return onClose();
    submit(() => updateSourceAction(projectId, s.id, input), "Source updated");
  };
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit source</DialogTitle>
          <DialogDescription>Changes to what is read trigger a fresh sync.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="e-name">Name</Label>
            <Input id="e-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          {s.kind === "url" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="e-urls">URLs</Label>
                <Textarea id="e-urls" rows={5} value={urls} onChange={(e) => setUrls(e.target.value)} className="text-xs" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={follow} onCheckedChange={setFollow} /> Follow links on the same site
              </label>
            </>
          )}
          {s.kind === "notion" && (
            <div className="space-y-1.5">
              <Label htmlFor="e-roots">Limit to pages / databases</Label>
              <Textarea id="e-roots" rows={3} value={roots} onChange={(e) => setRoots(e.target.value)} className="text-xs" placeholder="Empty = every shared page" />
            </div>
          )}
          {(s.kind === "notion" || s.kind === "slack") && (
            <div className="space-y-1.5">
              <Label htmlFor="e-token">Replace token (optional)</Label>
              <Input id="e-token" type="password" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} placeholder={s.kind === "notion" ? "ntn_…" : "xoxb-…"} className="font-mono text-xs" />
            </div>
          )}
          {s.kind === "slack" && (
            <>
              <div className="space-y-1.5">
                <Label>History</Label>
                <Select value={days} onValueChange={setDays}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_OPTIONS.map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        Last {d} days
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {channels ? (
                <ChannelPicker channels={channels} selected={selected} onChange={setSelected} />
              ) : (
                <Button type="button" variant="outline" size="sm" onClick={loadChannels} disabled={loading}>
                  {loading && <Loader2 className="size-3.5 animate-spin" />} Change channels
                </Button>
              )}
            </>
          )}
          {s.kind === "gdrive" && <p className="text-xs text-muted-foreground">To read another folder, add a new Google Drive source and remove this one.</p>}
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={pending || (channels !== null && !selected.size)}>
            {pending && <Loader2 className="size-3.5 animate-spin" />} Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
