"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, ImageIcon, Loader2, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ConfirmButton, StatusBadge, TimeAgo } from "@/components/app/misc";
import { EmptyState } from "@/components/app/empty-state";
import { cn } from "@/lib/utils";
import { ProviderGlyph } from "@/features/optimize/integrations/components/provider-glyph";
import { safeHttpUrl } from "@/features/optimize/shared/safe-url";
import type { CmsEditField, CmsItem, CmsItemType } from "@/server/optimize/integrations/types";
import type { CmsEditTarget } from "@/server/optimize/cms-edits/service";
import { FIELD_META, fieldWarnings, normalizeFieldValue, validateFieldValue } from "@/server/optimize/cms-edits/fields";
import { applyCmsChangeAction, getCmsItemAction, listCmsItemsAction, proposeCmsChangesAction, suggestCmsValueAction } from "../actions";

const TEXT_FIELDS: Exclude<CmsEditField, "image_alt">[] = ["title", "meta_title", "meta_description", "excerpt", "slug", "json_ld"];
const SUGGESTABLE = new Set<CmsEditField>(["title", "meta_title", "meta_description", "excerpt", "image_alt"]);

type DraftKey = string; // field name or `image_alt:<imageId>`

function Counter({ field, value }: { field: CmsEditField; value: string }) {
  const max = FIELD_META[field].recommendedMax;
  if (!max) return null;
  return <span className={cn("text-[11px] tabular", value.length > max ? "text-warning" : "text-muted-foreground")}>{value.length}/{max}</span>;
}

function ItemRow({ item, onOpen }: { item: CmsItem; onOpen: () => void }) {
  const missingAlt = item.images.filter((i) => !i.alt).length;
  const noDesc = item.editable.includes("meta_description") && !item.fields.meta_description;
  return (
    <button type="button" onClick={onOpen} className="flex w-full min-w-0 flex-col gap-1 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-muted/50">
      <span className="flex min-w-0 items-center gap-2">
        <span className="line-clamp-1 min-w-0 flex-1 text-sm font-medium">{item.title}</span>
        {item.status && <StatusBadge status={item.status === "publish" || item.status === "active" ? "published" : item.status} className="shrink-0" />}
      </span>
      {item.url && <span className="line-clamp-1 text-xs text-muted-foreground">{item.url.replace(/^https?:\/\/(www\.)?/, "")}</span>}
      <span className="flex flex-wrap items-center gap-1.5 text-[11px]">
        {item.fields.meta_title ? (
          <span className="line-clamp-1 max-w-full text-muted-foreground">SEO: {item.fields.meta_title}</span>
        ) : item.editable.includes("meta_title") ? (
          <span className="rounded-full bg-warning/15 px-1.5 py-0.5 font-medium text-warning">No SEO title</span>
        ) : null}
        {noDesc && <span className="rounded-full bg-warning/15 px-1.5 py-0.5 font-medium text-warning">No meta description</span>}
        {missingAlt > 0 && (
          <span className="rounded-full bg-warning/15 px-1.5 py-0.5 font-medium text-warning">
            {missingAlt} image{missingAlt === 1 ? "" : "s"} without alt
          </span>
        )}
        {item.updatedAt && <TimeAgo date={item.updatedAt} className="ml-auto text-muted-foreground" />}
      </span>
    </button>
  );
}

function ItemEditor({
  projectId,
  provider,
  item,
  aiAvailable,
  onBack,
  onDone,
}: {
  projectId: string;
  provider: string;
  item: CmsItem;
  aiAvailable: boolean;
  onBack: () => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<DraftKey, string>>({});
  const [reason, setReason] = useState("");
  const [suggesting, setSuggesting] = useState<DraftKey | null>(null);
  const [pending, start] = useTransition();

  const current = useCallback(
    (key: DraftKey): string => {
      if (key.startsWith("image_alt:")) return item.images.find((i) => i.id === key.slice(10))?.alt ?? "";
      return item.fields[key as Exclude<CmsEditField, "image_alt">] ?? "";
    },
    [item],
  );
  const fieldOf = (key: DraftKey): CmsEditField => (key.startsWith("image_alt:") ? "image_alt" : (key as CmsEditField));

  const changes = useMemo(
    () =>
      Object.entries(drafts)
        .map(([key, value]) => ({ key, field: fieldOf(key), value }))
        .filter((c) => normalizeFieldValue(c.field, c.value) !== normalizeFieldValue(c.field, current(c.key))),
    [drafts, current],
  );
  const errors = changes.map((c) => validateFieldValue(c.field, normalizeFieldValue(c.field, c.value))).filter(Boolean) as string[];

  const suggest = (key: DraftKey) => {
    setSuggesting(key);
    start(async () => {
      const res = await suggestCmsValueAction(projectId, {
        provider,
        itemType: item.type,
        externalId: item.externalId,
        field: fieldOf(key),
        fieldKey: key.startsWith("image_alt:") ? key.slice(10) : null,
      });
      setSuggesting(null);
      if (!res.ok) return void toast.error(res.error);
      setDrafts((d) => ({ ...d, [key]: res.data.value }));
    });
  };

  const submit = (apply: boolean) =>
    new Promise<void>((resolve) =>
      start(async () => {
        const res = await proposeCmsChangesAction(projectId, {
          provider,
          itemType: item.type,
          externalId: item.externalId,
          changes: changes.map((c) => ({
            field: c.field,
            fieldKey: c.key.startsWith("image_alt:") ? c.key.slice(10) : null,
            value: c.value,
            reason: reason.trim() || null,
          })),
        });
        if (!res.ok) {
          toast.error(res.error);
          return resolve();
        }
        for (const s of res.data.skipped) toast.warning(`${FIELD_META[s.field].label}: ${s.reason}`);
        let applied = 0;
        if (apply) {
          for (const c of res.data.changes) {
            const r = await applyCmsChangeAction(projectId, c.id);
            if (r.ok) {
              applied++;
              if (r.data.note) toast.info(r.data.note);
            } else toast.error(`${c.fieldLabel}: ${r.error}`);
          }
        }
        if (res.data.changes.length) {
          toast.success(
            apply
              ? `${applied} of ${res.data.changes.length} change${res.data.changes.length === 1 ? "" : "s"} applied — undo anytime under Site edits`
              : `${res.data.changes.length} proposal${res.data.changes.length === 1 ? "" : "s"} added to the review queue`,
          );
          setDrafts({});
          setReason("");
          router.refresh();
          onDone();
        }
        resolve();
      }),
    );

  const fieldBlock = (key: DraftKey, label: string, opts: { editable: boolean; multiline?: boolean; mono?: boolean }) => {
    const field = fieldOf(key);
    const value = drafts[key] ?? current(key);
    const changed = key in drafts && normalizeFieldValue(field, value) !== normalizeFieldValue(field, current(key));
    const warnings = changed ? fieldWarnings(field, normalizeFieldValue(field, value)) : [];
    return (
      <div key={key} className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Label htmlFor={`fld-${key}`} className="text-xs">
            {label}
          </Label>
          {changed && <span className="rounded-full bg-brand-soft px-1.5 text-[10px] font-medium text-brand">edited</span>}
          <span className="ml-auto flex items-center gap-2">
            <Counter field={field} value={value} />
            {opts.editable && aiAvailable && SUGGESTABLE.has(field) && (
              <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => suggest(key)} disabled={pending}>
                {suggesting === key ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />} Suggest
              </Button>
            )}
          </span>
        </div>
        {opts.multiline ? (
          <Textarea
            id={`fld-${key}`}
            value={value}
            readOnly={!opts.editable}
            onChange={(e) => setDrafts((d) => ({ ...d, [key]: e.target.value }))}
            rows={opts.mono ? 8 : 3}
            className={cn("text-sm", opts.mono && "font-mono text-xs", !opts.editable && "bg-muted/50 text-muted-foreground")}
          />
        ) : (
          <Input
            id={`fld-${key}`}
            value={value}
            readOnly={!opts.editable}
            onChange={(e) => setDrafts((d) => ({ ...d, [key]: e.target.value }))}
            className={cn("text-sm", !opts.editable && "bg-muted/50 text-muted-foreground")}
          />
        )}
        {changed && (
          <button
            type="button"
            className="text-[11px] text-muted-foreground hover:text-foreground"
            onClick={() =>
              setDrafts((d) => {
                const next = { ...d };
                delete next[key];
                return next;
              })
            }
          >
            Reset to live value
          </button>
        )}
        {warnings.map((w) => (
          <p key={w} className="text-[11px] text-warning">
            {w}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-4 overflow-y-auto px-4 pb-4">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> All items
        </button>
        <div className="space-y-1">
          <h3 className="text-base leading-snug font-semibold">{item.title}</h3>
          {safeHttpUrl(item.url) && (
            <a href={safeHttpUrl(item.url)!} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 text-xs text-brand hover:underline">
              <span className="truncate">{item.url!.replace(/^https?:\/\/(www\.)?/, "")}</span>
              <ExternalLink className="size-3 shrink-0" />
            </a>
          )}
        </div>
        {item.notes?.map((n) => (
          <p key={n} className="rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {n}
          </p>
        ))}
        {TEXT_FIELDS.filter((f) => item.fields[f] !== undefined).map((f) =>
          fieldBlock(f, FIELD_META[f].label, { editable: item.editable.includes(f), multiline: FIELD_META[f].multiline, mono: f === "json_ld" }),
        )}
        {item.images.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-medium">Images</div>
            {item.images.map((img) => (
              <div key={img.id} className="flex gap-3">
                <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                  {safeHttpUrl(img.src) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={safeHttpUrl(img.src)!} alt="" className="size-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon className="size-5 text-muted-foreground" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  {fieldBlock(`image_alt:${img.id}`, `Alt text · ${img.label ?? "Image"}`, { editable: item.editable.includes("image_alt") })}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="edit-reason" className="text-xs">
            Reason (optional)
          </Label>
          <Input id="edit-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Answer the target prompt in the meta description" maxLength={1000} />
        </div>
      </div>
      <SheetFooter className="flex-row flex-wrap justify-end gap-2 border-t">
        {errors[0] && <p className="w-full text-xs text-destructive">{errors[0]}</p>}
        <Button variant="outline" size="sm" disabled={pending || !changes.length || errors.length > 0} onClick={() => void submit(false)}>
          Propose {changes.length ? `(${changes.length})` : ""}
        </Button>
        <ConfirmButton
          title={`Apply ${changes.length} change${changes.length === 1 ? "" : "s"} to the live site?`}
          description="The current values are backed up first — you can revert every change under Content → Site edits."
          confirmLabel="Apply now"
          onConfirm={() => submit(true)}
        >
          <Button size="sm" disabled={pending || !changes.length || errors.length > 0}>
            {pending ? <Loader2 className="size-3.5 animate-spin" /> : null} Apply now
          </Button>
        </ConfirmButton>
      </SheetFooter>
    </div>
  );
}

/** Sheet to browse existing CMS content and propose / apply edits to one item. */
export function ItemBrowser({
  projectId,
  targets,
  aiAvailable,
  open,
  onOpenChange,
}: {
  projectId: string;
  targets: CmsEditTarget[];
  aiAvailable: boolean;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [provider, setProvider] = useState(targets[0]?.provider ?? "");
  const target = targets.find((t) => t.provider === provider) ?? targets[0];
  const [type, setType] = useState<CmsItemType | undefined>(target?.itemTypes[0]?.type);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<CmsItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CmsItem | null>(null);
  const [loading, start] = useTransition();
  const [loadingItem, startItem] = useTransition();

  const load = useCallback(
    (append: string | null) =>
      start(async () => {
        if (!provider) return;
        const res = await listCmsItemsAction(projectId, { provider, type, search: search || undefined, cursor: append });
        if (!res.ok) {
          setError(res.error);
          if (!append) setItems([]);
          return;
        }
        setError(null);
        setItems((prev) => (append ? [...prev, ...res.data.items] : res.data.items));
        setCursor(res.data.nextCursor);
      }),
    [projectId, provider, type, search],
  );

  useEffect(() => {
    if (open && !selected) load(null);
  }, [open, load, selected]);

  const openItem = (item: CmsItem) =>
    startItem(async () => {
      const res = await getCmsItemAction(projectId, provider, item.type, item.externalId);
      if (!res.ok) return void toast.error(res.error);
      setSelected(res.data);
    });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="border-b">
          <SheetTitle>Edit site content</SheetTitle>
          <SheetDescription>Pick a page or product, change its SEO fields and propose or apply the edit. Live values are backed up for undo.</SheetDescription>
        </SheetHeader>
        {selected ? (
          <div className="flex min-h-0 flex-1 flex-col pt-4">
            <ItemEditor
              key={`${selected.type}:${selected.externalId}`}
              projectId={projectId}
              provider={provider}
              item={selected}
              aiAvailable={aiAvailable}
              onBack={() => setSelected(null)}
              onDone={() => openItem(selected)}
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-col gap-2 border-b p-4 sm:flex-row">
              {targets.length > 1 && (
                <Select
                  value={provider}
                  onValueChange={(v) => {
                    setProvider(v);
                    setType(targets.find((t) => t.provider === v)?.itemTypes[0]?.type);
                    setItems([]);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40" aria-label="CMS">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {targets.map((t) => (
                      <SelectItem key={t.provider} value={t.provider}>
                        <ProviderGlyph provider={t.provider} size="xs" /> {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {target && target.itemTypes.length > 1 && (
                <Select
                  value={type}
                  onValueChange={(v) => {
                    setType(v as CmsItemType);
                    setItems([]);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-36" aria-label="Item type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {target.itemTypes.map((t) => (
                      <SelectItem key={t.type} value={t.type}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <form
                className="flex min-w-0 flex-1 gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearch(query.trim());
                }}
              >
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search titles…" className="min-w-0 flex-1" maxLength={200} />
                <Button type="submit" size="icon" variant="outline" aria-label="Search" disabled={loading}>
                  <Search className="size-4" />
                </Button>
              </form>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
              {error ? (
                <EmptyState compact title="Couldn't load items" description={error} />
              ) : items.length ? (
                <>
                  {items.map((item) => (
                    <ItemRow key={`${item.type}:${item.externalId}`} item={item} onOpen={() => openItem(item)} />
                  ))}
                  {cursor && (
                    <Button variant="outline" size="sm" className="w-full" disabled={loading} onClick={() => load(cursor)}>
                      {loading ? <Loader2 className="size-3.5 animate-spin" /> : null} Load more
                    </Button>
                  )}
                </>
              ) : loading ? (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 size-4 animate-spin" /> Loading from {target?.name ?? "your CMS"}…
                </div>
              ) : (
                <EmptyState compact title="No items found" description={search ? "Try another search term." : "This CMS returned no items for this type."} />
              )}
              {loadingItem && (
                <div className="fixed inset-x-0 bottom-6 mx-auto flex w-fit items-center gap-2 rounded-full border bg-popover px-3 py-1.5 text-xs shadow-soft">
                  <Loader2 className="size-3.5 animate-spin" /> Loading item…
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
