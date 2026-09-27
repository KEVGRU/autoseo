"use client";

import Link from "next/link";
import { Braces } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/app/page";
import { CopyButton } from "@/components/app/misc";

/** Ready-to-paste JSON-LD attached to schema tasks (`signalData.jsonLd`) by the technical signal. */
export function JsonLdPanel({ projectId, signalData }: { projectId: string; signalData: Record<string, unknown> }) {
  const json = typeof signalData.jsonLd === "string" ? signalData.jsonLd : null;
  if (!json) return null;
  const url = typeof signalData.jsonLdUrl === "string" ? signalData.jsonLdUrl : null;
  const types = Array.isArray(signalData.jsonLdTypes) ? (signalData.jsonLdTypes as string[]) : [];
  return (
    <Panel
      title="Ready-to-paste JSON-LD"
      description={`${types.length ? `${types.join(" · ")} ` : ""}${url ? `for ${url.replace(/^https?:\/\/(www\.)?/, "")}` : ""} — built from your brand profile and the live page. Review, then add it to the page's <head>.`}
      icon={<Braces className="size-4 text-muted-foreground" />}
      actions={
        <div className="flex flex-wrap gap-1.5">
          <CopyButton value={`<script type="application/ld+json">\n${json}\n</script>`} label="Copy <script>" />
          <Button size="sm" variant="outline" asChild>
            <Link href={`/p/${projectId}/content?tab=schema${url ? `&url=${encodeURIComponent(url)}` : ""}`}>Customize</Link>
          </Button>
        </div>
      }
    >
      <pre className="max-h-80 overflow-auto rounded-xl bg-muted/60 p-3 font-mono text-[11px] leading-relaxed">{json}</pre>
    </Panel>
  );
}
