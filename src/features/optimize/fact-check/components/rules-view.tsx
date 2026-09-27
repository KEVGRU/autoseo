"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ban, Gauge, ListChecks, Loader2, MoreHorizontal, Pencil, Plus, RefreshCw, Scale, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/app/data-table";
import { EmptyState } from "@/components/app/empty-state";
import { ConfirmButton, CountryFlag } from "@/components/app/misc";
import { Panel } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createRuleAction, deleteRuleAction, reevaluateRulesAction, setRuleActiveAction, updateRuleAction } from "../actions";
import type { FcRuleView, RulesData } from "../types";
import { SeverityBadge } from "./badges";

type Kind = FcRuleView["kind"];

const KIND_META: Record<Kind, { label: string; short: string; icon: typeof Scale; help: string; termsLabel: string; termsHint: string }> = {
  numeric_range: {
    label: "Allowed range",
    short: "Range",
    icon: Gauge,
    help: "Figures near the keywords (same sentence) must be within the range, e.g. an APR of 3.9–12.9 %. Ranges in answers are checked at both ends.",
    termsLabel: "Keywords naming the figure",
    termsHint: "e.g. APR, effective interest, Zinssatz",
  },
  forbidden: {
    label: "Forbidden wording",
    short: "Forbidden",
    icon: Ban,
    help: "Statements must never contain these words or phrases (whole words, case-insensitive).",
    termsLabel: "Forbidden words / phrases",
    termsHint: "e.g. guaranteed, risk-free, cures",
  },
  required: {
    label: "Required wording",
    short: "Required",
    icon: ListChecks,
    help: "When a statement is about the context topics, the AI answer must also mention one of these phrases (checked in the whole answer).",
    termsLabel: "Required words / phrases (any of)",
    termsHint: "e.g. prescription only, consult your doctor",
  },
};

const splitList = (v: string) =>
  v
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

type Draft = {
  name: string;
  kind: Kind;
  assetId: string;
  terms: string;
  triggerTerms: string;
  min: string;
  max: string;
  unit: string;
  currency: string;
  market: string;
  severity: "critical" | "major" | "minor";
  description: string;
  active: boolean;
};

function toDraft(r?: FcRuleView): Draft {
  return {
    name: r?.name ?? "",
    kind: r?.kind ?? "numeric_range",
    assetId: r?.assetId ?? "all",
    terms: r?.terms.join(", ") ?? "",
    triggerTerms: r?.triggerTerms.join(", ") ?? "",
    min: r?.min != null ? String(r.min) : "",
    max: r?.max != null ? String(r.max) : "",
    unit: r?.unit ?? "",
    currency: r?.currency ?? "",
    market: r?.market ?? "",
    severity: r?.severity ?? "major",
    description: r?.description ?? "",
    active: r?.active ?? true,
  };
}

function parseNum(v: string): number | null {
  const t = v.trim().replace(/\s/g, "");
  if (!t) return null;
  const n = Number(t.includes(",") && !t.includes(".") ? t.replace(",", ".") : t.replace(/,/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function summary(r: { violations: number; cleared: number }) {
  return `${r.violations} statement${r.violations === 1 ? "" : "s"} violate${r.violations === 1 ? "s" : ""} your rules${r.cleared ? ` · ${r.cleared} cleared and re-queued for the label check` : ""}`;
}

export function RulesView({ projectId, data, canEdit }: { projectId: string; data: RulesData; canEdit: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<FcRuleView | "new" | null>(null);
  const [pending, start] = useTransition();

  const toggle = (r: FcRuleView, active: boolean) =>
    start(async () => {
      const res = await setRuleActiveAction(projectId, r.id, active);
      if (!res.ok) return void toast.error(res.error);
      toast.success(`${r.name} ${active ? "enabled" : "paused"} — ${summary(res.data)}`);
      router.refresh();
    });

  const recheck = () =>
    start(async () => {
      const res = await reevaluateRulesAction(projectId);
      if (!res.ok) return void toast.error(res.error);
      toast.success(`Checked ${res.data.checked} statements — ${summary(res.data)}`);
      router.refresh();
    });

  const remove = async (r: FcRuleView) => {
    const res = await deleteRuleAction(projectId, r.id);
    if (!res.ok) return void toast.error(res.error);
    toast.success(`Rule deleted — ${summary(res.data)}`);
    router.refresh();
  };

  const columns: Column<FcRuleView>[] = [
    {
      id: "name",
      header: "Rule",
      sortValue: (r) => r.name,
      cell: (r) => (
        <div className="min-w-44">
          <div className={cn("font-medium", !r.active && "text-muted-foreground")}>{r.name}</div>
          {r.description && <p className="line-clamp-1 max-w-72 text-xs text-muted-foreground">{r.description}</p>}
        </div>
      ),
    },
    {
      id: "kind",
      header: "Type",
      sortValue: (r) => r.kind,
      cell: (r) => <KindChip kind={r.kind} />,
    },
    {
      id: "expected",
      header: "Expectation",
      cell: (r) => (
        <div className="max-w-80 text-xs">
          <span className="font-medium tabular">{r.expected}</span>
          {r.kind === "numeric_range" && <span className="text-muted-foreground"> for {r.terms.join(", ")}</span>}
          {r.triggerTerms.length > 0 && <div className="text-muted-foreground">when about {r.triggerTerms.join(", ")}</div>}
        </div>
      ),
    },
    {
      id: "scope",
      header: "Scope",
      hideBelow: "lg",
      cell: (r) => (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span>{r.assetName ?? "All assets"}</span>
          {r.market ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              · <CountryFlag iso={r.market} /> {r.market}
            </span>
          ) : (
            <span className="text-muted-foreground">· all markets</span>
          )}
        </div>
      ),
    },
    { id: "severity", header: "Severity", hideBelow: "md", sortValue: (r) => r.severity, cell: (r) => <SeverityBadge severity={r.severity} /> },
    {
      id: "violations",
      header: "Open violations",
      align: "right",
      sortValue: (r) => r.openViolations,
      cell: (r) =>
        r.violations ? (
          <Link
            href={`/p/${projectId}/fact-check/findings?type=rule_violation&status=all`}
            className={cn("font-medium tabular hover:underline", r.openViolations > 0 && "text-destructive")}
            onClick={(e) => e.stopPropagation()}
          >
            {r.openViolations}
            <span className="text-muted-foreground"> / {r.violations}</span>
          </Link>
        ) : (
          <span className="text-muted-foreground tabular">0</span>
        ),
    },
    {
      id: "active",
      header: "Active",
      align: "right",
      cell: (r) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Switch checked={r.active} onCheckedChange={(v) => toggle(r, v)} disabled={!canEdit || pending} aria-label={`Rule ${r.name} active`} />
          {canEdit && <RuleMenu rule={r} onEdit={() => setEditing(r)} onDelete={() => remove(r)} />}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Panel
        title="Fact-check rules"
        description="Deterministic checks on every statement AI makes about your assets — they take precedence over the label comparison."
        actions={
          canEdit ? (
            <>
              <Button variant="outline" size="sm" onClick={recheck} disabled={pending || !data.rules.length}>
                {pending ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />} Re-check statements
              </Button>
              <Button size="sm" onClick={() => setEditing("new")}>
                <Plus className="size-3.5" /> New rule
              </Button>
            </>
          ) : null
        }
        contentClassName="p-3 sm:p-4"
      >
        <DataTable
          columns={columns}
          data={data.rules}
          getRowId={(r) => r.id}
          initialSort={{ id: "name", dir: "asc" }}
          onRowClick={canEdit ? (r) => setEditing(r) : undefined}
          empty={
            <EmptyState
              compact
              icon={Scale}
              title="No rules yet"
              description="Add rules like “APR must be 3.9–12.9 %”, “never say guaranteed” or “dosage answers must mention the prescription requirement”. Every collected statement is checked against them."
              action={
                canEdit ? (
                  <Button size="sm" onClick={() => setEditing("new")}>
                    <Plus className="size-3.5" /> New rule
                  </Button>
                ) : undefined
              }
            />
          }
          mobileCard={(r) => (
            <div className="space-y-2" onClick={() => canEdit && setEditing(r)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className={cn("font-medium", !r.active && "text-muted-foreground")}>{r.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <KindChip kind={r.kind} />
                    <SeverityBadge severity={r.severity} />
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <Switch checked={r.active} onCheckedChange={(v) => toggle(r, v)} disabled={!canEdit || pending} aria-label={`Rule ${r.name} active`} />
                </div>
              </div>
              <p className="text-xs">
                <span className="font-medium tabular">{r.expected}</span>
                {r.kind === "numeric_range" && <span className="text-muted-foreground"> for {r.terms.join(", ")}</span>}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {r.assetName ?? "All assets"} · {r.market ?? "all markets"}
                </span>
                <span className={cn("tabular", r.openViolations > 0 && "font-medium text-destructive")}>{r.openViolations} open</span>
              </div>
            </div>
          )}
        />
      </Panel>

      <div className="grid gap-3 md:grid-cols-3">
        {(Object.keys(KIND_META) as Kind[]).map((k) => {
          const m = KIND_META[k];
          return (
            <div key={k} className="rounded-2xl border bg-card p-4 shadow-soft">
              <div className="flex items-center gap-2 text-sm font-medium">
                <m.icon className="size-4 text-muted-foreground" /> {m.label}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{m.help}</p>
            </div>
          );
        })}
      </div>

      {editing && (
        <RuleDialog
          projectId={projectId}
          rule={editing === "new" ? null : editing}
          assets={data.assets}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function KindChip({ kind }: { kind: Kind }) {
  const m = KIND_META[kind];
  return (
    <span className="inline-flex h-5 items-center gap-1 rounded-md border bg-background px-1.5 text-[11px] font-medium whitespace-nowrap">
      <m.icon className="size-3 text-muted-foreground" /> {m.short}
    </span>
  );
}

function RuleMenu({ rule, onEdit, onDelete }: { rule: FcRuleView; onEdit: () => void; onDelete: () => Promise<void> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Rule actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="size-3.5" /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ConfirmButton
          title={`Delete “${rule.name}”?`}
          description="Findings created by this rule go back to the label check."
          confirmLabel="Delete rule"
          destructive
          onConfirm={onDelete}
        >
          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
            <Trash2 className="size-3.5" /> Delete
          </DropdownMenuItem>
        </ConfirmButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RuleDialog({
  projectId,
  rule,
  assets,
  onClose,
  onSaved,
}: {
  projectId: string;
  rule: FcRuleView | null;
  assets: RulesData["assets"];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [d, setD] = useState<Draft>(() => toDraft(rule ?? undefined));
  const [pending, start] = useTransition();
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const meta = KIND_META[d.kind];
  const markets = [...new Set(assets.flatMap((a) => (d.assetId === "all" || a.id === d.assetId ? a.markets : [])))].sort();
  const min = parseNum(d.min);
  const max = parseNum(d.max);
  const numbersInvalid = d.kind === "numeric_range" && (Number.isNaN(min) || Number.isNaN(max) || (min == null && max == null));
  const invalid = d.name.trim().length < 2 || !splitList(d.terms).length || numbersInvalid;

  const save = () =>
    start(async () => {
      const input = {
        name: d.name,
        kind: d.kind,
        assetId: d.assetId === "all" ? null : d.assetId,
        terms: splitList(d.terms),
        triggerTerms: d.kind === "numeric_range" ? [] : splitList(d.triggerTerms),
        min: d.kind === "numeric_range" ? min : null,
        max: d.kind === "numeric_range" ? max : null,
        unit: d.kind === "numeric_range" ? d.unit || null : null,
        currency: d.kind === "numeric_range" ? d.currency || null : null,
        market: d.market || null,
        severity: d.severity,
        description: d.description || null,
        active: d.active,
      };
      const res = rule ? await updateRuleAction(projectId, rule.id, input) : await createRuleAction(projectId, input);
      if (!res.ok) return void toast.error(res.error);
      toast.success(`${rule ? "Rule saved" : "Rule created"} — ${summary(res.data)}`);
      onSaved();
    });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{rule ? "Edit rule" : "New fact-check rule"}</DialogTitle>
          <DialogDescription>{meta.help}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="r-name">Name</Label>
            <Input id="r-name" value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. APR range" maxLength={120} />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={d.kind} onValueChange={(v) => set("kind", v as Kind)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(KIND_META) as Kind[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {KIND_META[k].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Severity</Label>
            <Select value={d.severity} onValueChange={(v) => set("severity", v as Draft["severity"])}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="r-terms">{meta.termsLabel}</Label>
            <Input id="r-terms" value={d.terms} onChange={(e) => set("terms", e.target.value)} placeholder={meta.termsHint} />
            <p className="text-xs text-muted-foreground">Comma-separated.</p>
          </div>
          {d.kind === "numeric_range" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="r-min">Minimum</Label>
                <Input id="r-min" inputMode="decimal" value={d.min} onChange={(e) => set("min", e.target.value)} placeholder="e.g. 3.9" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="r-max">Maximum</Label>
                <Input id="r-max" inputMode="decimal" value={d.max} onChange={(e) => set("max", e.target.value)} placeholder="e.g. 12.9" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="r-unit">Unit</Label>
                <Input id="r-unit" value={d.unit} onChange={(e) => set("unit", e.target.value)} placeholder="%, mg, kWh… (optional)" maxLength={20} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="r-cur">Currency</Label>
                <Input id="r-cur" value={d.currency} onChange={(e) => set("currency", e.target.value)} placeholder="EUR, USD… (optional)" maxLength={10} />
              </div>
              {numbersInvalid && <p className="text-xs text-destructive sm:col-span-2">Enter a valid minimum, maximum or both.</p>}
            </>
          ) : (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="r-trig">Only when the statement is about</Label>
              <Input
                id="r-trig"
                value={d.triggerTerms}
                onChange={(e) => set("triggerTerms", e.target.value)}
                placeholder={d.kind === "required" ? "e.g. dose, dosage, Dosierung (empty = every statement)" : "optional context, e.g. children"}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Asset</Label>
            <Select value={d.assetId} onValueChange={(v) => set("assetId", v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assets</SelectItem>
                {assets.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Market</Label>
            <Select value={d.market || "all"} onValueChange={(v) => set("market", v === "all" ? "" : v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All markets</SelectItem>
                {[...new Set([...markets, ...(d.market ? [d.market] : [])])].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="r-desc">Why (shown in findings)</Label>
            <Textarea id="r-desc" value={d.description} onChange={(e) => set("description", e.target.value)} rows={2} maxLength={1000} placeholder="e.g. Rates per price sheet 2026-09 (optional)" />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <Switch checked={d.active} onCheckedChange={(v) => set("active", v)} /> Active
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={invalid || pending}>
            {pending && <Loader2 className="size-3.5 animate-spin" />} {rule ? "Save rule" : "Create rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
