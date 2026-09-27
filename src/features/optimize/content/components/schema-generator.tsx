"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { AlertCircle, Braces, ChevronDown, ExternalLink, Info, Loader2, TriangleAlert, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Panel } from "@/components/app/page";
import { CopyButton } from "@/components/app/misc";
import { EmptyState } from "@/components/app/empty-state";
import { useUrlState } from "@/hooks/use-url-state";
import { SCHEMA_TYPES, validateJsonLd, type SchemaHint, type SchemaType } from "@/server/optimize/content/schema-ld";
import type { SchemaMarkupResult } from "@/server/optimize/content/schema-generator";
import { generateSchemaAction } from "../actions";

const BUSINESS_TYPES = [
  "LocalBusiness",
  "Store",
  "ProfessionalService",
  "HomeAndConstructionBusiness",
  "Electrician",
  "HVACBusiness",
  "RoofingContractor",
  "GeneralContractor",
  "AutomotiveBusiness",
  "Restaurant",
  "MedicalBusiness",
  "Dentist",
  "LegalService",
  "FinancialService",
  "RealEstateAgent",
  "TravelAgency",
];

const HINT_META: Record<SchemaHint["level"], { icon: typeof Info; cls: string }> = {
  error: { icon: AlertCircle, cls: "text-destructive" },
  warning: { icon: TriangleAlert, cls: "text-warning" },
  info: { icon: Info, cls: "text-muted-foreground" },
};

const lines = (s: string) =>
  s
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

export function SchemaGenerator({ projectId, domain, products, canEdit }: { projectId: string; domain: string; products: { id: string; name: string }[]; canEdit: boolean }) {
  const [urlParam] = useUrlState("url", "");
  const [url, setUrl] = useState(urlParam);
  const [types, setTypes] = useState<Set<SchemaType>>(new Set());
  const [productId, setProductId] = useState("auto");
  const [biz, setBiz] = useState({ businessType: "", streetAddress: "", postalCode: "", addressLocality: "", addressRegion: "", addressCountry: "", telephone: "", email: "", openingHours: "", priceRange: "", sameAs: "" });
  const [result, setResult] = useState<SchemaMarkupResult | null>(null);
  const [json, setJson] = useState("");
  const [pending, start] = useTransition();

  const toggle = (t: SchemaType) =>
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  const generate = () =>
    start(async () => {
      const sameAs = lines(biz.sameAs);
      const address = { streetAddress: biz.streetAddress, postalCode: biz.postalCode, addressLocality: biz.addressLocality, addressRegion: biz.addressRegion, addressCountry: biz.addressCountry };
      const hasOverrides = Object.values(biz).some((v) => v.trim());
      const res = await generateSchemaAction(projectId, {
        url,
        types: types.size ? [...types] : undefined,
        productId: productId === "auto" ? null : productId,
        overrides: hasOverrides
          ? {
              sameAs: sameAs.length ? sameAs : undefined,
              telephone: biz.telephone || null,
              email: biz.email || "",
              address: Object.values(address).some((v) => v.trim()) ? address : null,
              businessType: biz.businessType || "",
              openingHours: lines(biz.openingHours),
              priceRange: biz.priceRange || null,
            }
          : undefined,
      });
      if (!res.ok) return void toast.error(res.error);
      setResult(res.data);
      setJson(res.data.json);
      if (!types.size) setTypes(new Set(res.data.types));
    });

  const live = useMemo(() => {
    if (!json.trim()) return null;
    try {
      return { ok: true as const, hints: validateJsonLd(JSON.parse(json)) };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Invalid JSON" };
    }
  }, [json]);
  const counts = live?.ok ? { error: live.hints.filter((h) => h.level === "error").length, warning: live.hints.filter((h) => h.level === "warning").length } : null;
  const target = result?.url ?? (url || `https://${domain}/`);

  return (
    <div className="space-y-4">
      <Panel
        title="Schema generator"
        description="Ready-to-paste JSON-LD for any page — built from your brand profile, product catalog and the live page (meta tags, existing markup, FAQs, steps, breadcrumbs, contact details)."
        icon={<Braces className="size-4 text-muted-foreground" />}
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={`https://${domain}/ (homepage)`} inputMode="url" className="flex-1" aria-label="Page URL" />
            <Button onClick={generate} disabled={pending || !canEdit} className="sm:w-44">
              {pending ? <Loader2 className="size-3.5 animate-spin" /> : <WandSparkles className="size-3.5" />} Generate JSON-LD
            </Button>
          </div>
          {!canEdit && <p className="text-xs text-muted-foreground">Generating markup requires the permission to edit content.</p>}

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Types {types.size ? "" : "(auto-detected from the page)"}</Label>
            <div className="flex flex-wrap gap-1.5">
              {SCHEMA_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggle(t)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${types.has(t) ? "border-foreground bg-foreground text-background" : "bg-background text-muted-foreground hover:text-foreground"}`}
                  aria-pressed={types.has(t)}
                >
                  {t}
                </button>
              ))}
              {types.size > 0 && (
                <button type="button" onClick={() => setTypes(new Set())} className="px-1.5 text-xs text-muted-foreground underline">
                  Auto
                </button>
              )}
            </div>
          </div>

          {products.length > 0 && (
            <div className="space-y-1.5 sm:max-w-md">
              <Label className="text-xs text-muted-foreground">Product (for Product markup)</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="auto">Match the page URL / page markup</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Collapsible>
            <CollapsibleTrigger className="group flex items-center gap-1 text-left text-xs font-medium text-muted-foreground hover:text-foreground">
              <ChevronDown className="size-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180" /> Business & profile details (LocalBusiness, Organization)
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Business type</Label>
                <Select value={biz.businessType || "none"} onValueChange={(v) => setBiz({ ...biz, businessType: v === "none" ? "" : v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="none">Detect / LocalBusiness</SelectItem>
                    {BUSINESS_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(
                [
                  ["streetAddress", "Street"],
                  ["postalCode", "Postal code"],
                  ["addressLocality", "City"],
                  ["addressRegion", "Region"],
                  ["addressCountry", "Country (ISO)"],
                  ["telephone", "Telephone"],
                  ["email", "Email"],
                  ["priceRange", "Price range (e.g. €€)"],
                ] as const
              ).map(([k, label]) => (
                <div key={k} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input value={biz[k]} onChange={(e) => setBiz({ ...biz, [k]: e.target.value })} className="h-8 text-sm" />
                </div>
              ))}
              <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                <Label className="text-xs">Opening hours (one per line)</Label>
                <Textarea rows={2} value={biz.openingHours} onChange={(e) => setBiz({ ...biz, openingHours: e.target.value })} placeholder="Mo-Fr 09:00-18:00" className="text-sm" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Official profiles — sameAs (one URL per line)</Label>
                <Textarea rows={2} value={biz.sameAs} onChange={(e) => setBiz({ ...biz, sameAs: e.target.value })} placeholder="https://www.linkedin.com/company/…" className="text-sm" />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Panel>

      {result ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Panel
            title="JSON-LD"
            description={`${result.types.join(" · ")} for ${target.replace(/^https?:\/\/(www\.)?/, "")}`}
            actions={
              <div className="flex flex-wrap gap-1.5">
                <CopyButton value={`<script type="application/ld+json">\n${json}\n</script>`} label="Copy <script>" />
                <CopyButton value={json} label="Copy JSON" />
              </div>
            }
          >
            <Textarea value={json} onChange={(e) => setJson(e.target.value)} rows={24} spellCheck={false} className="font-mono text-[11.5px] leading-relaxed" aria-label="JSON-LD" />
            <p className="mt-2 text-[11px] text-muted-foreground">Paste it into the page&apos;s &lt;head&gt; (or via your CMS / tag manager). Edits are validated live.</p>
          </Panel>
          <div className="min-w-0 space-y-4">
            <Panel title="Validation" description={counts ? `${counts.error} errors · ${counts.warning} warnings` : undefined}>
              {live && !live.ok ? (
                <p className="text-sm text-destructive">Invalid JSON: {live.error}</p>
              ) : live?.hints.length ? (
                <ul className="space-y-1.5">
                  {live.hints.map((h, i) => {
                    const m = HINT_META[h.level];
                    return (
                      <li key={i} className="flex gap-2 text-xs">
                        <m.icon className={`mt-0.5 size-3.5 shrink-0 ${m.cls}`} />
                        <span>
                          <span className="font-medium">{h.type}:</span> {h.message}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-success">No issues found.</p>
              )}
              <div className="mt-3 flex flex-wrap gap-3 border-t pt-3 text-xs">
                <a href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(target)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand hover:underline">
                  Rich Results Test <ExternalLink className="size-3" />
                </a>
                <a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand hover:underline">
                  Schema.org validator <ExternalLink className="size-3" />
                </a>
              </div>
            </Panel>
            <Panel title="What we found">
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
                <dt className="text-muted-foreground">Title</dt>
                <dd className="truncate">{result.facts.title ?? "—"}</dd>
                <dt className="text-muted-foreground">Existing markup</dt>
                <dd className="truncate">{result.facts.existingTypes.join(", ") || "none"}</dd>
                <dt className="text-muted-foreground">Product</dt>
                <dd className="truncate">{result.facts.product ?? "—"}</dd>
                <dt className="text-muted-foreground">FAQs · steps</dt>
                <dd>
                  {result.facts.faqs} · {result.facts.steps}
                </dd>
                <dt className="text-muted-foreground">Breadcrumbs</dt>
                <dd>{result.facts.breadcrumbs}</dd>
                <dt className="text-muted-foreground">Contact</dt>
                <dd className="truncate">{[result.facts.telephone, result.facts.email].filter(Boolean).join(" · ") || "—"}</dd>
                <dt className="text-muted-foreground">Address</dt>
                <dd className="truncate">{result.facts.address ? Object.values(result.facts.address).filter(Boolean).join(", ") : "—"}</dd>
                <dt className="text-muted-foreground">Profiles</dt>
                <dd className="truncate">{result.facts.sameAs.length ? `${result.facts.sameAs.length} (${result.facts.sameAs.map((u) => new URL(u).hostname.replace(/^www\./, "")).slice(0, 3).join(", ")})` : "—"}</dd>
              </dl>
              {result.notes.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 border-t pt-3 pl-4 text-xs text-muted-foreground">
                  {result.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      ) : (
        <Panel>
          <EmptyState
            compact
            icon={Braces}
            title="Generate markup for a page"
            description="Organization, WebSite, Product, LocalBusiness, FAQPage, BreadcrumbList, Article and HowTo — cross-linked in one @graph and checked against Google's rich-result requirements."
          />
        </Panel>
      )}
    </div>
  );
}
