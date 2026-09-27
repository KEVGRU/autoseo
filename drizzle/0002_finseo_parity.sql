CREATE TABLE "ai_followups" (
	"id" text PRIMARY KEY NOT NULL,
	"answer_id" text NOT NULL,
	"project_id" text NOT NULL,
	"prompt_id" text NOT NULL,
	"engine" text NOT NULL,
	"answer_date" date NOT NULL,
	"question" text NOT NULL,
	"kind" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cms_changes" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"provider" text NOT NULL,
	"external_id" text NOT NULL,
	"item_type" text NOT NULL,
	"item_title" text,
	"item_url" text,
	"field" text NOT NULL,
	"field_key" text,
	"before" text,
	"after" text NOT NULL,
	"reason" text,
	"status" text DEFAULT 'proposed' NOT NULL,
	"error" text,
	"source" text DEFAULT 'user' NOT NULL,
	"task_id" text,
	"proposed_by" text,
	"applied_by" text,
	"applied_at" timestamp with time zone,
	"reverted_by" text,
	"reverted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fc_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"asset_id" text,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"terms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"trigger_terms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"min" double precision,
	"max" double precision,
	"unit" text,
	"currency" text,
	"market" text,
	"severity" text DEFAULT 'major' NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "free_visibility_checks" (
	"id" text PRIMARY KEY NOT NULL,
	"domain" text NOT NULL,
	"country" text NOT NULL,
	"language" text NOT NULL,
	"email" text,
	"surface" text DEFAULT 'public' NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"step" text DEFAULT 'queued' NOT NULL,
	"progress" jsonb,
	"brand" jsonb,
	"prompts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"results" jsonb,
	"readiness" jsonb,
	"score" integer,
	"readiness_score" integer,
	"visibility_score" integer,
	"cost_usd" double precision DEFAULT 0 NOT NULL,
	"reserved_usd" double precision DEFAULT 0 NOT NULL,
	"ai_allowed" boolean DEFAULT true NOT NULL,
	"ip_hash" text,
	"user_id" text,
	"workspace_id" text,
	"project_id" text,
	"converted_project_id" text,
	"error" text,
	"email_sent_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"endpoint_id" text NOT NULL,
	"project_id" text NOT NULL,
	"event" text NOT NULL,
	"event_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempt" integer DEFAULT 0 NOT NULL,
	"response_code" integer,
	"response_body" text,
	"error" text,
	"duration_ms" integer,
	"test" boolean DEFAULT false NOT NULL,
	"replay_of" text,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_endpoints" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"url" text NOT NULL,
	"secret" text NOT NULL,
	"secret_prefix" text NOT NULL,
	"events" text[] DEFAULT '{}'::text[] NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"failing_since" timestamp with time zone,
	"disabled_reason" text,
	"last_delivered_at" timestamp with time zone,
	"last_failure_at" timestamp with time zone,
	"last_error" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_events" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"rule_id" text,
	"kind" text NOT NULL,
	"severity" text DEFAULT 'warning' NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"href" text,
	"dedupe_key" text NOT NULL,
	"payload" jsonb DEFAULT '{"items":[]}'::jsonb NOT NULL,
	"delivery" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"fired_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ack_at" timestamp with time zone,
	"ack_by" text
);
--> statement-breakpoint
CREATE TABLE "alert_project_settings" (
	"project_id" text PRIMARY KEY NOT NULL,
	"defaults_seeded_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"params" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"channels" jsonb DEFAULT '{"inApp":true,"emails":[],"slack":false,"webhook":true}'::jsonb NOT NULL,
	"slack_webhook" text,
	"cooldown_hours" integer DEFAULT 24 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"state" jsonb DEFAULT '{"open":[]}'::jsonb NOT NULL,
	"evaluations" integer DEFAULT 0 NOT NULL,
	"last_evaluated_at" timestamp with time zone,
	"last_fired_at" timestamp with time zone,
	"last_error" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_chunks" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"project_id" text NOT NULL,
	"doc_id" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"url" text,
	"position" integer DEFAULT 0 NOT NULL,
	"text" text NOT NULL,
	"tokens" integer DEFAULT 0 NOT NULL,
	"lang" text DEFAULT 'simple' NOT NULL,
	"tsv" "tsvector",
	"doc_updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"secret" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"notes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"auto_sync" boolean DEFAULT true NOT NULL,
	"last_sync_at" timestamp with time zone,
	"doc_count" integer DEFAULT 0 NOT NULL,
	"chunk_count" integer DEFAULT 0 NOT NULL,
	"job_id" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_provider_credentials" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"provider" text NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"secret" text,
	"status" text DEFAULT 'untested' NOT NULL,
	"last_tested_at" timestamp with time zone,
	"last_error" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_ads" ADD COLUMN "click_params" jsonb;--> statement-breakpoint
ALTER TABLE "ai_answers" ADD COLUMN "brand_position_tracked" integer;--> statement-breakpoint
ALTER TABLE "ai_fanouts" ADD COLUMN "intent" text;--> statement-breakpoint
ALTER TABLE "ai_fanouts" ADD COLUMN "word_count" integer;--> statement-breakpoint
ALTER TABLE "ai_fanouts" ADD COLUMN "coverage" text;--> statement-breakpoint
ALTER TABLE "ai_fanouts" ADD COLUMN "coverage_url" text;--> statement-breakpoint
ALTER TABLE "ai_mentions" ADD COLUMN "tracked_position" integer;--> statement-breakpoint
ALTER TABLE "ai_products" ADD COLUMN "catalog_product_id" text;--> statement-breakpoint
ALTER TABLE "ai_statements" ADD COLUMN "aspect" text;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "markets" jsonb;--> statement-breakpoint
ALTER TABLE "seo_keyword_metrics" ADD COLUMN "source" text DEFAULT 'dataforseo' NOT NULL;--> statement-breakpoint
ALTER TABLE "seo_keyword_metrics" ADD COLUMN "confidence" text;--> statement-breakpoint
ALTER TABLE "seo_local_runs" ADD COLUMN "source" text DEFAULT 'dataforseo' NOT NULL;--> statement-breakpoint
ALTER TABLE "seo_rank_keywords" ADD COLUMN "metrics_source" text;--> statement-breakpoint
ALTER TABLE "seo_rank_runs" ADD COLUMN "source" text DEFAULT 'dataforseo' NOT NULL;--> statement-breakpoint
ALTER TABLE "seo_rank_snapshots" ADD COLUMN "source" text DEFAULT 'dataforseo' NOT NULL;--> statement-breakpoint
ALTER TABLE "content_pieces" ADD COLUMN "grounding" jsonb;--> statement-breakpoint
ALTER TABLE "content_pieces" ADD COLUMN "claim_checks" jsonb;--> statement-breakpoint
ALTER TABLE "fc_statements" ADD COLUMN "rule_id" text;--> statement-breakpoint
ALTER TABLE "optimize_tasks" ADD COLUMN "outcome" jsonb;--> statement-breakpoint
ALTER TABLE "oauth_clients" ADD COLUMN "registration" text DEFAULT 'dynamic' NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_clients" ADD COLUMN "metadata_fetched_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oauth_clients" ADD COLUMN "metadata_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ai_followups" ADD CONSTRAINT "ai_followups_answer_id_ai_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."ai_answers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_changes" ADD CONSTRAINT "cms_changes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_changes" ADD CONSTRAINT "cms_changes_task_id_optimize_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."optimize_tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_changes" ADD CONSTRAINT "cms_changes_proposed_by_users_id_fk" FOREIGN KEY ("proposed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_changes" ADD CONSTRAINT "cms_changes_applied_by_users_id_fk" FOREIGN KEY ("applied_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_changes" ADD CONSTRAINT "cms_changes_reverted_by_users_id_fk" FOREIGN KEY ("reverted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fc_rules" ADD CONSTRAINT "fc_rules_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fc_rules" ADD CONSTRAINT "fc_rules_asset_id_fc_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."fc_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fc_rules" ADD CONSTRAINT "fc_rules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "free_visibility_checks" ADD CONSTRAINT "free_visibility_checks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "free_visibility_checks" ADD CONSTRAINT "free_visibility_checks_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "free_visibility_checks" ADD CONSTRAINT "free_visibility_checks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "free_visibility_checks" ADD CONSTRAINT "free_visibility_checks_converted_project_id_projects_id_fk" FOREIGN KEY ("converted_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_endpoint_id_webhook_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "public"."webhook_endpoints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_events" ADD CONSTRAINT "alert_events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_events" ADD CONSTRAINT "alert_events_rule_id_alert_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."alert_rules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_events" ADD CONSTRAINT "alert_events_ack_by_users_id_fk" FOREIGN KEY ("ack_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_project_settings" ADD CONSTRAINT "alert_project_settings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_source_id_knowledge_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."knowledge_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_provider_credentials" ADD CONSTRAINT "workspace_provider_credentials_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_provider_credentials" ADD CONSTRAINT "workspace_provider_credentials_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_followups_project_idx" ON "ai_followups" USING btree ("project_id","answer_date");--> statement-breakpoint
CREATE INDEX "ai_followups_answer_idx" ON "ai_followups" USING btree ("answer_id");--> statement-breakpoint
CREATE INDEX "cms_changes_project_status_idx" ON "cms_changes" USING btree ("project_id","status","created_at");--> statement-breakpoint
CREATE INDEX "cms_changes_item_idx" ON "cms_changes" USING btree ("project_id","provider","external_id");--> statement-breakpoint
CREATE INDEX "fc_rules_project_idx" ON "fc_rules" USING btree ("project_id","active");--> statement-breakpoint
CREATE INDEX "free_visibility_checks_ip_idx" ON "free_visibility_checks" USING btree ("ip_hash","created_at");--> statement-breakpoint
CREATE INDEX "free_visibility_checks_created_idx" ON "free_visibility_checks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "free_visibility_checks_expires_idx" ON "free_visibility_checks" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "free_visibility_checks_project_idx" ON "free_visibility_checks" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "free_visibility_checks_domain_idx" ON "free_visibility_checks" USING btree ("domain","country","created_at");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_endpoint_idx" ON "webhook_deliveries" USING btree ("endpoint_id","created_at");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_project_idx" ON "webhook_deliveries" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "webhook_endpoints_project_idx" ON "webhook_endpoints" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "alert_events_project_idx" ON "alert_events" USING btree ("project_id","fired_at");--> statement-breakpoint
CREATE INDEX "alert_events_rule_idx" ON "alert_events" USING btree ("rule_id","fired_at");--> statement-breakpoint
CREATE INDEX "alert_rules_project_idx" ON "alert_rules" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "knowledge_chunks_source_doc_idx" ON "knowledge_chunks" USING btree ("source_id","doc_id");--> statement-breakpoint
CREATE INDEX "knowledge_chunks_project_idx" ON "knowledge_chunks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "knowledge_chunks_tsv_idx" ON "knowledge_chunks" USING gin ("tsv");--> statement-breakpoint
CREATE INDEX "knowledge_sources_project_idx" ON "knowledge_sources" USING btree ("project_id","kind");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_provider_credentials_uq" ON "workspace_provider_credentials" USING btree ("workspace_id","provider");--> statement-breakpoint
ALTER TABLE "ai_products" ADD CONSTRAINT "ai_products_catalog_product_id_catalog_products_id_fk" FOREIGN KEY ("catalog_product_id") REFERENCES "public"."catalog_products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- Backfill tracked-set positions for existing answers (position among the brand + tracked competitors only).
UPDATE "ai_mentions" m SET "tracked_position" = r.rn
FROM (
  SELECT m2."id", row_number() OVER (PARTITION BY m2."answer_id" ORDER BY m2."char_offset", m2."brand_name")::int AS rn
  FROM "ai_mentions" m2
  WHERE m2."is_own" OR m2."competitor_id" IS NOT NULL
) r
WHERE m."id" = r."id" AND m."tracked_position" IS DISTINCT FROM r.rn;
--> statement-breakpoint
UPDATE "ai_answers" a SET "brand_position_tracked" = o.tracked_position
FROM (SELECT m."answer_id", min(m."tracked_position") AS tracked_position FROM "ai_mentions" m WHERE m."is_own" GROUP BY 1) o
WHERE a."id" = o."answer_id" AND a."brand_position_tracked" IS DISTINCT FROM o.tracked_position;
