"use client";

import { useState, useTransition } from "react";
import { Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/app/page";
import { useCan } from "@/components/app/shell-context";
import { CountryFlag } from "@/components/app/misc";
import { getCountry } from "@/lib/countries";
import { updateModelSettingsAction } from "../actions";
import { MarketsSelect } from "./prompt-dialogs";

/**
 * Project default markets: the markets new prompts are asked in (the project's default location
 * is always the primary market). Existing prompts keep their own markets (Tracker → prompt → Markets).
 */
export function MarketsSettings({ projectId, primary, markets: initial }: { projectId: string; primary: string; markets: string[] }) {
  const can = useCan();
  const canManage = can("prompts.manage");
  const [markets, setMarkets] = useState(initial);
  const [pending, start] = useTransition();

  const save = (next: string[]) => {
    const withPrimary = [primary, ...next.filter((m) => m !== primary)];
    const prev = markets;
    setMarkets(withPrimary);
    start(async () => {
      const res = await updateModelSettingsAction(projectId, { markets: withPrimary });
      if (!res.ok) {
        setMarkets(prev);
        toast.error(res.error);
      } else toast.success("Default markets updated");
    });
  };

  return (
    <Panel
      title="Markets"
      icon={<Globe className="size-4" />}
      description="Ask the same prompts market by market — AI answers differ between countries. Each market is tracked separately (one answer per prompt × market × model)."
      actions={pending ? <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Saving" /> : undefined}
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-1.5">
          <div className="text-xs font-medium">Default markets for new prompts</div>
          {canManage ? (
            <MarketsSelect value={markets} onChange={save} />
          ) : (
            <div className="flex flex-wrap gap-2 text-sm">
              {markets.map((m) => (
                <CountryFlag key={m} iso={m} withName />
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">
            {getCountry(primary)?.name ?? primary} (default location) is always the primary market. Applies to prompts added manually, from imports without a
            country, research and the API. Change the markets of existing prompts in the Tracker.
          </p>
        </div>
        <div className="rounded-xl border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <div className="mb-1 font-medium text-foreground">How markets count</div>
          One AI answer = one prompt × one market × one model × one day. A prompt in 3 markets on 3 models uses 9 answers per tracking run. Filter any report by market with the
          Markets filter; the Tracker&apos;s Locations tab compares markets side by side.
        </div>
      </div>
    </Panel>
  );
}
