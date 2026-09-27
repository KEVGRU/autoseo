ALTER TABLE "instances" ADD COLUMN "complimentary" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "instances" ADD COLUMN "granted_by" text;