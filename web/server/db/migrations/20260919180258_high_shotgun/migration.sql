ALTER TABLE "events" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "motion" jsonb;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "featured_properties";
