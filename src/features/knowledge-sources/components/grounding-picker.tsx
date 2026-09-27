"use client";

import Link from "next/link";
import { BookOpenCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ContentGrounding } from "@/server/db/schema/optimize";
import type { KnowledgeSourceKind } from "@/server/db/schema/knowledge-sources";

export type GroundingSource = { id: string; name: string; kind: KnowledgeSourceKind; docCount: number; status: string };

const KIND_LABEL: Record<KnowledgeSourceKind, string> = { notion: "Notion", gdrive: "Drive", slack: "Slack", upload: "Upload", url: "Website" };

/** "Ground in" picker — which connected knowledge sources content generation may retrieve from. */
export function GroundingPicker({
  projectId,
  value,
  onChange,
  sources,
  disabled,
}: {
  projectId: string;
  value: ContentGrounding | null;
  onChange: (v: ContentGrounding) => void;
  sources: GroundingSource[];
  disabled?: boolean;
}) {
  const mode = value?.mode ?? "all";
  const selected = new Set(value?.sourceIds ?? []);
  const usable = sources.filter((s) => s.docCount > 0);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="flex items-center gap-1.5">
          <BookOpenCheck className="size-3.5" /> Ground in
        </Label>
        <Select value={mode} onValueChange={(m) => onChange({ mode: m as ContentGrounding["mode"], sourceIds: m === "selected" ? [...selected] : undefined })} disabled={disabled || !sources.length}>
          <SelectTrigger size="sm" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All knowledge sources</SelectItem>
            <SelectItem value="selected">Selected sources</SelectItem>
            <SelectItem value="none">Web research only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {!sources.length ? (
        <p className="text-xs text-muted-foreground">
          No knowledge sources yet. Connect Notion, Google Drive, Slack, uploads or URLs in{" "}
          <Link href={`/p/${projectId}/knowledge?tab=sources`} className="font-medium text-foreground underline">
            Brand Knowledge → Sources
          </Link>{" "}
          to ground drafts in your own expertise.
        </p>
      ) : mode === "selected" ? (
        <div className="max-h-44 space-y-0.5 overflow-y-auto rounded-xl border p-1.5">
          {sources.map((s) => (
            <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-muted">
              <Checkbox
                checked={selected.has(s.id)}
                disabled={disabled}
                onCheckedChange={(v) => {
                  const next = new Set(selected);
                  if (v) next.add(s.id);
                  else next.delete(s.id);
                  onChange({ mode: "selected", sourceIds: [...next] });
                }}
              />
              <span className="min-w-0 flex-1 truncate">{s.name}</span>
              <span className="shrink-0 text-[11px] text-muted-foreground tabular">
                {KIND_LABEL[s.kind]} · {s.docCount} docs
              </span>
            </label>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {mode === "all"
            ? `Relevant passages from ${usable.length} indexed source${usable.length === 1 ? "" : "s"} are retrieved and cited as internal sources.`
            : "Drafts use web research and your brand profile only."}
        </p>
      )}
    </div>
  );
}
