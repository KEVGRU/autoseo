CREATE TABLE "group_members" (
	"group_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "group_members_group_id_user_id_pk" PRIMARY KEY("group_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "project_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"parent_id" text,
	"name" text NOT NULL,
	"kind" text DEFAULT 'other' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_channel_daily" (
	"project_id" text NOT NULL,
	"provider" text NOT NULL,
	"channel" text NOT NULL,
	"date" date NOT NULL,
	"sessions" integer DEFAULT 0 NOT NULL,
	"engaged_sessions" integer DEFAULT 0 NOT NULL,
	"engagement_seconds" double precision DEFAULT 0 NOT NULL,
	"pageviews" double precision,
	"converted_sessions" double precision DEFAULT 0 NOT NULL,
	"conversions" double precision DEFAULT 0 NOT NULL,
	"revenue" double precision DEFAULT 0 NOT NULL,
	"users" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "analytics_channel_daily_project_id_provider_channel_date_pk" PRIMARY KEY("project_id","provider","channel","date")
);
--> statement-breakpoint
CREATE TABLE "report_deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"schedule_id" text,
	"report_id" text NOT NULL,
	"project_id" text NOT NULL,
	"trigger" text DEFAULT 'schedule' NOT NULL,
	"due_at" timestamp with time zone,
	"range_from" date,
	"range_to" date,
	"period_label" text,
	"format" text NOT NULL,
	"recipients" text[] DEFAULT '{}'::text[] NOT NULL,
	"token" text,
	"expires_at" timestamp with time zone,
	"snapshot" jsonb,
	"status" text DEFAULT 'sending' NOT NULL,
	"error" text,
	"results" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"pptx_bytes" integer,
	"views" integer DEFAULT 0 NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "report_schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"project_id" text NOT NULL,
	"cadence" text DEFAULT 'monthly' NOT NULL,
	"weekday" integer DEFAULT 1 NOT NULL,
	"month_day" integer DEFAULT 1 NOT NULL,
	"hour" integer DEFAULT 8 NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"recipients" text[] DEFAULT '{}'::text[] NOT NULL,
	"format" text DEFAULT 'both' NOT NULL,
	"range_preset" text DEFAULT 'last_month' NOT NULL,
	"subject" text,
	"message" text,
	"link_expiry_days" integer DEFAULT 30 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"next_run_at" timestamp with time zone,
	"last_sent_at" timestamp with time zone,
	"last_status" text,
	"last_error" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sso_identities" (
	"id" text PRIMARY KEY NOT NULL,
	"provider_key" text NOT NULL,
	"issuer" text NOT NULL,
	"subject" text NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_domains" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"domain" text NOT NULL,
	"verification_token" text NOT NULL,
	"verified_at" timestamp with time zone,
	"verified_via" text,
	"confirmed_at" timestamp with time zone,
	"failed_checks" integer DEFAULT 0 NOT NULL,
	"last_checked_at" timestamp with time zone,
	"last_error" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_sso_providers" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text DEFAULT 'Single sign-on' NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"issuer_url" text NOT NULL,
	"client_id" text NOT NULL,
	"client_secret" text,
	"scopes" text DEFAULT 'openid email profile' NOT NULL,
	"jit_provisioning" boolean DEFAULT true NOT NULL,
	"default_role_key" text DEFAULT 'member' NOT NULL,
	"group_claim" text DEFAULT 'groups' NOT NULL,
	"group_role_map" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"enforce_sso" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_sso_providers_workspaceId_unique" UNIQUE("workspace_id")
);
--> statement-breakpoint
ALTER TABLE "project_members" ADD COLUMN "role_key" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "group_id" text;--> statement-breakpoint
ALTER TABLE "analytics_traffic_rows" ADD COLUMN "pageviews" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_project_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."project_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_groups" ADD CONSTRAINT "project_groups_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_groups" ADD CONSTRAINT "project_groups_parent_id_project_groups_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."project_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_channel_daily" ADD CONSTRAINT "analytics_channel_daily_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_deliveries" ADD CONSTRAINT "report_deliveries_schedule_id_report_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."report_schedules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_deliveries" ADD CONSTRAINT "report_deliveries_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_deliveries" ADD CONSTRAINT "report_deliveries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_deliveries" ADD CONSTRAINT "report_deliveries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sso_identities" ADD CONSTRAINT "sso_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_domains" ADD CONSTRAINT "workspace_domains_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_domains" ADD CONSTRAINT "workspace_domains_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_sso_providers" ADD CONSTRAINT "workspace_sso_providers_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_sso_providers" ADD CONSTRAINT "workspace_sso_providers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_sso_providers" ADD CONSTRAINT "workspace_sso_providers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "group_members_user_idx" ON "group_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "project_groups_workspace_idx" ON "project_groups" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "project_groups_parent_idx" ON "project_groups" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "report_deliveries_slot_uq" ON "report_deliveries" USING btree ("schedule_id","due_at");--> statement-breakpoint
CREATE UNIQUE INDEX "report_deliveries_token_uq" ON "report_deliveries" USING btree ("token");--> statement-breakpoint
CREATE INDEX "report_deliveries_report_idx" ON "report_deliveries" USING btree ("report_id","created_at");--> statement-breakpoint
CREATE INDEX "report_schedules_due_idx" ON "report_schedules" USING btree ("enabled","next_run_at");--> statement-breakpoint
CREATE INDEX "report_schedules_report_idx" ON "report_schedules" USING btree ("report_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sso_identities_subject_uq" ON "sso_identities" USING btree ("issuer","subject");--> statement-breakpoint
CREATE INDEX "sso_identities_user_idx" ON "sso_identities" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_domains_ws_domain_uq" ON "workspace_domains" USING btree ("workspace_id","domain");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_domains_verified_uq" ON "workspace_domains" USING btree ("domain") WHERE "workspace_domains"."verified_at" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_group_id_project_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."project_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "projects_group_idx" ON "projects" USING btree ("group_id");