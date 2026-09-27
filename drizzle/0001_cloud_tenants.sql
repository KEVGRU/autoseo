ALTER TABLE "workspaces" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "suspended_reason" text;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "cloud_tenant_id" text;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "settings" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_cloudTenantId_unique" UNIQUE("cloud_tenant_id");