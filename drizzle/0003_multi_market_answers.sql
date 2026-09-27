-- Multi-market prompts: one answer per prompt × engine × market (country) × day.
DROP INDEX "ai_answers_unique_day_uq";--> statement-breakpoint
CREATE UNIQUE INDEX "ai_answers_unique_day_uq" ON "ai_answers" USING btree ("prompt_id","engine","country","answer_date");