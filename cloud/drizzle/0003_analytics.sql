CREATE TABLE "analytics_events" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"visitor_hash" text NOT NULL,
	"path" text NOT NULL,
	"referrer_host" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_content" text,
	"utm_term" text,
	"click_source" text,
	"channel" text NOT NULL,
	"country" text,
	"device" text,
	"props" jsonb
);
--> statement-breakpoint
CREATE TABLE "analytics_salts" (
	"day" text PRIMARY KEY NOT NULL,
	"salt" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "login_tokens" ADD COLUMN "attribution" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "attribution" jsonb;--> statement-breakpoint
CREATE INDEX "analytics_events_created_idx" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "analytics_events_visitor_idx" ON "analytics_events" USING btree ("visitor_hash","created_at");