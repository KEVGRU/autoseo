"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type SsoRoleOption = { key: string; name: string };

type Row = { id: number; group: string; role: string };

let rowId = 0;
const toRows = (map: Record<string, string>): Row[] => Object.entries(map).map(([group, role]) => ({ id: ++rowId, group, role }));
const toMap = (rows: Row[]): Record<string, string> =>
  Object.fromEntries(rows.filter((r) => r.group.trim() && r.role).map((r) => [r.group.trim(), r.role]));

/**
 * IdP group → role mapping editor (Settings → Workspace → Single sign-on and Admin → Authentication). The first
 * matching row wins when a person joins through SSO; unmatched people get the default role.
 */
export function SsoRoleMapEditor({
  value,
  onChange,
  roles,
  disabled,
}: {
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  roles: SsoRoleOption[];
  disabled?: boolean;
}) {
  const [rows, setRows] = useState<Row[]>(() => toRows(value));
  const [synced, setSynced] = useState(JSON.stringify(value));
  // Re-sync when the value changes from outside (discard / save), without clobbering half-typed rows.
  if (JSON.stringify(value) !== synced) {
    setSynced(JSON.stringify(value));
    if (JSON.stringify(toMap(rows)) !== JSON.stringify(value)) setRows(toRows(value));
  }

  const update = (next: Row[]) => {
    setRows(next);
    const map = toMap(next);
    setSynced(JSON.stringify(map));
    onChange(map);
  };

  const duplicate = new Set(rows.map((r) => r.group.trim()).filter((g, i, all) => g && all.indexOf(g) !== i));

  return (
    <div className="space-y-2">
      {rows.length === 0 && <p className="text-xs text-muted-foreground">No mapping — everyone who joins gets the default role.</p>}
      {rows.map((row) => (
        <div key={row.id} className="flex flex-col gap-1.5 rounded-lg border p-2 sm:flex-row sm:items-center sm:border-0 sm:p-0">
          <Input
            value={row.group}
            placeholder="IdP group, e.g. seo-admins"
            aria-label="IdP group"
            disabled={disabled}
            maxLength={200}
            onChange={(e) => update(rows.map((r) => (r.id === row.id ? { ...r, group: e.target.value } : r)))}
            className="min-w-0 font-mono text-[13px] sm:flex-1"
          />
          <div className="flex items-center gap-1.5">
            <Select value={row.role} onValueChange={(role) => update(rows.map((r) => (r.id === row.id ? { ...r, role } : r)))} disabled={disabled}>
              <SelectTrigger className="w-full min-w-0 sm:w-44" aria-label="Role">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.key} value={r.key}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
              aria-label="Remove mapping"
              disabled={disabled}
              onClick={() => update(rows.filter((r) => r.id !== row.id))}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      ))}
      {duplicate.size > 0 && <p className="text-xs text-destructive">Each IdP group can be mapped once — the last row wins.</p>}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8"
        disabled={disabled || rows.length >= 100}
        onClick={() => update([...rows, { id: ++rowId, group: "", role: roles.find((r) => r.key === "member")?.key ?? roles[0]?.key ?? "" }])}
      >
        <Plus className="size-3.5" /> Add mapping
      </Button>
    </div>
  );
}
