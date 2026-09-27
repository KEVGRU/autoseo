/**
 * Workspace names end up in the customer instance's environment (AUTOSEO_WORKSPACE_NAME): control characters and
 * Coolify/Compose template syntax ("{", "}", "$", backtick) are rejected. Pure so it can be unit tested.
 */
export type WorkspaceNameCheck = { ok: true; value: string } | { ok: false; error: string };

export function validateWorkspaceName(raw: unknown): WorkspaceNameCheck {
  const value = String(raw ?? "").trim();
  if (!value) return { ok: false, error: "Enter a workspace name." };
  if (value.length > 80) return { ok: false, error: "Use at most 80 characters." };
  if (/[\x00-\x1f\x7f{}$`]/.test(value)) return { ok: false, error: "The workspace name contains invalid characters." };
  return { ok: true, value };
}
