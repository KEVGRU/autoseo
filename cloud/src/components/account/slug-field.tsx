"use client";

import { useEffect, useState } from "react";
import { CircleAlert, CircleCheck, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type SlugAvailability = { state: "idle" } | { state: "checking" } | { state: "ok" } | { state: "error"; error: string };

function suggest(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30)
    .replace(/-+$/g, "");
}

/** Workspace name + address state; the address follows the name until it is edited by hand. */
export function useInstanceNaming(initial?: { slug: string; workspaceName: string }) {
  const [workspaceName, setWorkspaceNameRaw] = useState(initial?.workspaceName ?? "");
  const [slug, setSlugRaw] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  return {
    workspaceName,
    slug,
    setWorkspaceName(value: string) {
      setWorkspaceNameRaw(value);
      if (!slugTouched) setSlugRaw(suggest(value));
    },
    setSlug(value: string) {
      setSlugTouched(true);
      setSlugRaw(value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
    },
  };
}

/** Debounced live check against /api/slug (format, reserved names, taken incl. pending reservations). */
export function useSlugAvailability(slug: string): SlugAvailability {
  const [result, setResult] = useState<{ slug: string; available: boolean; error?: string } | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/slug?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
        const data = (await res.json()) as { available?: boolean; error?: string };
        if (!cancelled) setResult({ slug, available: !!data.available, error: data.error ?? (data.available ? undefined : "Not available.") });
      } catch {
        if (!cancelled) setResult({ slug, available: false, error: "Couldn't check availability. Try again." });
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slug]);

  if (!slug) return { state: "idle" };
  if (result?.slug !== slug) return { state: "checking" };
  return result.available ? { state: "ok" } : { state: "error", error: result.error ?? "Not available." };
}

export function WorkspaceNameField({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Company or workspace name</Label>
      <Input
        id={id}
        name="workspaceName"
        required
        maxLength={80}
        placeholder="Acme Inc."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 text-base"
      />
    </div>
  );
}

export function SlugField({
  id,
  slug,
  onChange,
  baseDomain,
  availability,
  label = "Choose your address",
}: {
  id: string;
  slug: string;
  onChange: (value: string) => void;
  baseDomain: string;
  availability: SlugAvailability;
  label?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div
        className={cn(
          "flex h-11 items-center overflow-hidden rounded-lg border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30",
          availability.state === "error" && "border-destructive/60 focus-within:ring-destructive/20",
        )}
      >
        <Globe className="ml-3 size-4 shrink-0 text-muted-foreground" />
        <input
          id={id}
          name="slug"
          required
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={30}
          placeholder="acme"
          value={slug}
          onChange={(e) => onChange(e.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent px-2 text-base outline-none placeholder:text-muted-foreground"
          aria-describedby={`${id}-status`}
        />
        <span className="shrink-0 truncate border-l bg-muted/60 px-3 text-sm leading-[2.75rem] text-muted-foreground max-sm:max-w-[45%]">
          .{baseDomain}
        </span>
      </div>
      <p id={`${id}-status`} className="flex min-h-5 items-center gap-1.5 text-sm" aria-live="polite">
        {availability.state === "checking" && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Spinner className="size-3.5" /> Checking availability…
          </span>
        )}
        {availability.state === "ok" && (
          <span className="flex items-center gap-1.5 text-success">
            <CircleCheck className="size-4" /> {slug}.{baseDomain} is available
          </span>
        )}
        {availability.state === "error" && (
          <span className="flex items-center gap-1.5 text-destructive">
            <CircleAlert className="size-4" /> {availability.error}
          </span>
        )}
        {availability.state === "idle" && <span className="text-muted-foreground">3–30 characters: lowercase letters, numbers and hyphens.</span>}
      </p>
    </div>
  );
}
