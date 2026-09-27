"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, CalendarCheck, Loader2, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProjectFromCheckAction } from "../actions";

export type TrackCta =
  /** Signed in and allowed to create projects in at least one workspace. */
  | {
      kind: "create";
      workspaces: Array<{ id: string; name: string }>;
      convertedHref: string | null;
    }
  /** Anonymous visitor: sign in first, then come back to this report. */
  | { kind: "login"; href: string; label: string }
  /** The check is about the project it was started from — tracking already runs there. */
  | { kind: "open"; href: string; label: string }
  /** Signed in without `projects.manage` anywhere. */
  | { kind: "none"; reason: string };

/** "Track this daily": turns the one-off check into a project with the same brand, competitors and prompts. */
export function TrackCtaPanel({ checkId, cta, ready, bookingUrl }: { checkId: string; cta: TrackCta; ready: boolean; bookingUrl: string | null }) {
  const router = useRouter();
  const [workspaceId, setWorkspaceId] = useState(cta.kind === "create" ? (cta.workspaces[0]?.id ?? "") : "");
  const [pending, setPending] = useState(false);

  const create = async () => {
    if (!workspaceId || pending) return;
    setPending(true);
    const res = await createProjectFromCheckAction(checkId, workspaceId);
    if (!res.ok) {
      toast.error(res.error);
      setPending(false);
      return;
    }
    toast.success(res.data.created ? "Project created — the first tracking run starts now." : "Opening the project created from this check.");
    router.push(`/p/${res.data.projectId}`);
  };

  return (
    <section className="overflow-hidden rounded-2xl border bg-gradient-to-br from-brand-soft/70 via-card to-card p-5 shadow-soft sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-brand uppercase">
            <Radar className="size-3.5" /> Track this daily
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-balance sm:text-2xl">One check is a snapshot. Daily tracking shows the trend.</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Track these prompts every day across all your AI engines, see when competitors overtake you, which sources win citations, and whether your fixes
            move the numbers. Brand, competitors and prompts from this check are prefilled.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-64">
          {cta.kind === "create" &&
            (cta.convertedHref ? (
              <Button asChild size="lg" className="h-11">
                <Link href={cta.convertedHref}>
                  Open the tracking project
                  <ArrowRight />
                </Link>
              </Button>
            ) : (
              <>
                {cta.workspaces.length > 1 && (
                  <Select value={workspaceId} onValueChange={setWorkspaceId}>
                    <SelectTrigger className="h-10 w-full bg-background" aria-label="Workspace">
                      <SelectValue placeholder="Workspace" />
                    </SelectTrigger>
                    <SelectContent>
                      {cta.workspaces.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button size="lg" className="h-11" disabled={!ready || pending || !workspaceId} onClick={() => void create()}>
                  {pending ? <Loader2 className="animate-spin" /> : <CalendarCheck />}
                  {ready ? "Create a tracking project" : "Available when the check is done"}
                </Button>
              </>
            ))}
          {cta.kind === "login" && (
            <Button asChild size="lg" className="h-11">
              <Link href={cta.href}>
                {cta.label}
                <ArrowRight />
              </Link>
            </Button>
          )}
          {cta.kind === "open" && (
            <Button asChild size="lg" className="h-11">
              <Link href={cta.href}>
                {cta.label}
                <ArrowRight />
              </Link>
            </Button>
          )}
          {cta.kind === "none" && <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">{cta.reason}</p>}
          {bookingUrl && (
            <Button asChild size="lg" variant="outline" className="h-11 bg-background">
              <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                Book a walkthrough
              </a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
