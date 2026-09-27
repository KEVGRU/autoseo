/**
 * Permission catalogue. Roles (editable in Admin → Roles) are sets of these keys.
 * Kept isomorphic so the UI can render the permission matrix.
 */
export const PERMISSIONS = {
  "project.view": { group: "Projects", label: "View project data (dashboards, reports, tracking)" },
  "prompts.manage": { group: "Projects", label: "Add prompts, run the agent, edit tasks & content" },
  "seo.run": { group: "Projects", label: "Run paid SEO research (keywords, backlinks, rank checks, audits)" },
  "reports.manage": { group: "Projects", label: "Create, edit and share reports" },
  "reports.share": { group: "Projects", label: "Create and change public share links (reports, dashboards)" },
  "data.export": { group: "Projects", label: "Export data (CSV / JSON / NDJSON, report downloads, API & MCP exports)" },
  "attribution.manage": { group: "Projects", label: "Configure attribution, forms & webhooks" },
  "alerts.manage": { group: "Projects", label: "Create, edit and acknowledge alerts" },
  "projects.all": { group: "Projects", label: "Access all projects (current & future)" },
  "projects.manage": { group: "Projects", label: "Create, configure and delete projects" },
  "team.view": { group: "Workspace", label: "See team members" },
  "members.manage": { group: "Workspace", label: "Invite members and change roles" },
  "settings.manage": { group: "Workspace", label: "Integrations, API keys, model settings" },
  "usage.view": { group: "Workspace", label: "See usage & cost balance" },
  "usage.manage": { group: "Workspace", label: "Manage budgets, view detailed usage" },
  "agents.manage": { group: "Workspace", label: "Install and manage local agents" },
  "workspace.manage": { group: "Workspace", label: "Rename or delete the workspace" },
  "workspace.providers": { group: "Workspace", label: "Manage the workspace's own data providers (DataForSEO key, AI enrichment mode)" },
  "admin.access": { group: "Instance", label: "Access the admin panel (instance-wide settings)" },
} as const;

export type Permission = keyof typeof PERMISSIONS;
export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];

export type BuiltinRole = {
  key: string;
  name: string;
  description: string;
  permissions: Permission[];
  allProjects: boolean;
  sortOrder: number;
};

export const BUILTIN_ROLES: BuiltinRole[] = [
  {
    key: "owner",
    name: "Owner",
    description: "Full access to the workspace including deletion. Instance administration is granted separately.",
    permissions: ALL_PERMISSIONS.filter((p) => p !== "admin.access"),
    allProjects: true,
    sortOrder: 0,
  },
  {
    key: "admin",
    name: "Admin",
    description: "Manages projects, members, integrations and usage.",
    permissions: ALL_PERMISSIONS.filter((p) => p !== "workspace.manage" && p !== "admin.access"),
    allProjects: true,
    sortOrder: 10,
  },
  {
    key: "member",
    name: "Member",
    description: "Works inside the projects they were given access to.",
    permissions: [
      "project.view",
      "prompts.manage",
      "seo.run",
      "reports.manage",
      "reports.share",
      "data.export",
      "attribution.manage",
      "alerts.manage",
      "team.view",
      "usage.view",
    ],
    allProjects: false,
    sortOrder: 20,
  },
  {
    key: "client",
    name: "Client",
    description: "Read-only guest access to selected projects.",
    permissions: ["project.view"],
    allProjects: false,
    sortOrder: 30,
  },
];

/**
 * Permissions added after roles were first seeded. `ensureBuiltinRoles` grants each of them once to
 * the built-in roles whose definition above includes it, so existing installs get new features
 * without later admin edits of the role being overridden.
 */
export const BACKFILLED_PERMISSIONS: Permission[] = ["alerts.manage", "workspace.providers", "reports.share", "data.export"];

/**
 * One-time grants for custom (non built-in) roles when a permission that used to be implied is split out,
 * so existing custom roles keep today's behaviour: sharing came with "reports.manage", exporting with any
 * write permission in a project (read-only roles like "Client" don't get exports unless granted).
 */
export const CUSTOM_ROLE_BACKFILL: Partial<Record<Permission, (permissions: readonly string[]) => boolean>> = {
  "reports.share": (p) => p.includes("reports.manage"),
  "data.export": (p) =>
    p.includes("project.view") &&
    ["prompts.manage", "seo.run", "reports.manage", "attribution.manage", "alerts.manage", "projects.manage"].some((x) => p.includes(x)),
};

/**
 * Permissions that apply to a single project. A project-level role (project override or project group role,
 * see `effective-access.ts`) decides these; every other permission (members, settings, API keys, usage,
 * workspace, instance admin) always comes from the workspace role.
 */
export const PROJECT_SCOPED_PERMISSIONS: readonly Permission[] = [
  "project.view",
  "prompts.manage",
  "seo.run",
  "reports.manage",
  "reports.share",
  "data.export",
  "attribution.manage",
  "alerts.manage",
  "projects.manage",
];

export function isProjectScopedPermission(p: string): p is Permission {
  return (PROJECT_SCOPED_PERMISSIONS as readonly string[]).includes(p);
}
