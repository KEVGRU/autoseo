"use client";

import { ArrowDown, ArrowUp, ExternalLink, Radar, X } from "lucide-react";
import { Panel } from "@/components/app/page";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EngineIcon } from "@/components/app/engine-icon";
import { NumberInput, Rows, SettingRow, ToggleRow } from "@/features/admin/components/settings-kit";
import { ENGINES, getEngine } from "@/lib/engines";
import type { Settings } from "@/server/settings/registry";

type Values = Settings<"freeTools">;
const MAX_ENGINES = 3;

/**
 * Admin → Free tools: the AI Visibility Check section (rendered inside the free-tools settings form, so it shares its
 * save bar). Signed-in users always have the check in the tools hub; these settings control the public page.
 */
export function AiCheckSettingsPanel({
  values,
  set,
  appUrl,
  estimatePerCheckUsd,
}: {
  values: Values;
  set: <K extends keyof Values>(key: K, value: Values[K]) => void;
  appUrl: string;
  estimatePerCheckUsd: number;
}) {
  const engines = values.aiCheckEngines.filter((id) => getEngine(id)).slice(0, MAX_ENGINES);
  const remaining = ENGINES.filter((e) => !engines.includes(e.id));
  const move = (from: number, to: number) => {
    const next = [...engines];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    set("aiCheckEngines", next);
  };

  return (
    <Panel
      title="AI Visibility Check"
      icon={<Radar className="size-4" />}
      description={`Readiness checks (free) + 5 buyer prompts on up to ${MAX_ENGINES} AI engines. Estimated ≈ $${estimatePerCheckUsd.toFixed(2)} per check, reserved on the daily budget above.`}
      actions={
        values.publicEnabled && values.aiCheckEnabled ? (
          <a
            href={`${appUrl}/free-tools/ai-visibility-check`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Open public page <ExternalLink className="size-3" />
          </a>
        ) : undefined
      }
    >
      <Rows>
        <ToggleRow
          label="Offer the AI Visibility Check publicly"
          description={
            <>
              Adds the check to <span className="font-mono text-foreground">/free-tools</span> when the tools are public. Signed-in users always have it in the
              SEO tools hub. When the daily budget is used up, visitors still get the free readiness part.
            </>
          }
          checked={values.aiCheckEnabled}
          onCheckedChange={(x) => set("aiCheckEnabled", x)}
        />
        <SettingRow label="Public checks per day" description="Across all visitors. 0 turns the public check off." htmlFor="aic-max">
          <NumberInput id="aic-max" value={values.aiCheckMaxPerDay} min={0} step={5} suffix="checks" onChange={(x) => set("aiCheckMaxPerDay", x)} />
        </SettingRow>
        <SettingRow
          label="Per visitor per day"
          description="Checks one visitor (hashed IP) may start per day. Identical checks within 24 h are reused for free."
          htmlFor="aic-visitor"
        >
          <NumberInput id="aic-visitor" value={values.aiCheckPerVisitorPerDay} min={1} suffix="checks" onChange={(x) => set("aiCheckPerVisitorPerDay", x)} />
        </SettingRow>
        <SettingRow
          label="Engines"
          description={`Up to ${MAX_ENGINES}, in this order. Leave empty to use the first configured engines (ChatGPT, Perplexity, Google AI Mode, Gemini, Claude…). Engines that aren't configured are skipped.`}
        >
          <div className="space-y-2">
            {engines.length === 0 && <p className="text-xs text-muted-foreground">Automatic</p>}
            {engines.map((id, i) => (
              <div key={id} className="flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5">
                <EngineIcon id={id} size="xs" withTooltip={false} />
                <span className="min-w-0 flex-1 truncate text-sm">{getEngine(id)?.name ?? id}</span>
                <Button type="button" variant="ghost" size="icon" className="size-7" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Move up">
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={i === engines.length - 1}
                  onClick={() => move(i, i + 1)}
                  aria-label="Move down"
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() =>
                    set(
                      "aiCheckEngines",
                      engines.filter((x) => x !== id),
                    )
                  }
                  aria-label={`Remove ${getEngine(id)?.name ?? id}`}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ))}
            {engines.length < MAX_ENGINES && (
              <Select value="" onValueChange={(id) => set("aiCheckEngines", [...engines, id])}>
                <SelectTrigger className="h-9 w-full bg-background" aria-label="Add engine">
                  <SelectValue placeholder="Add an engine…" />
                </SelectTrigger>
                <SelectContent>
                  {remaining.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </SettingRow>
        <SettingRow
          label="Booking link"
          htmlFor="aic-booking"
          description='Optional "Book a walkthrough" button next to public results (https:// URL). The report is always shown without it.'
        >
          <Input id="aic-booking" value={values.aiCheckBookingUrl} onChange={(e) => set("aiCheckBookingUrl", e.target.value)} placeholder="https://cal.com/…" />
        </SettingRow>
      </Rows>
    </Panel>
  );
}
