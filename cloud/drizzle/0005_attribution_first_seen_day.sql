-- Sign-up attribution kept the exact time of the first page view, which could be matched back to the anonymous
-- statistics. Keep only the UTC day ("firstSeenDay").
UPDATE "users" SET "attribution" = ("attribution" - 'firstSeenAt') || jsonb_build_object('firstSeenDay', left("attribution" ->> 'firstSeenAt', 10)) WHERE "attribution" ? 'firstSeenAt';--> statement-breakpoint
UPDATE "login_tokens" SET "attribution" = ("attribution" - 'firstSeenAt') || jsonb_build_object('firstSeenDay', left("attribution" ->> 'firstSeenAt', 10)) WHERE "attribution" ? 'firstSeenAt';
