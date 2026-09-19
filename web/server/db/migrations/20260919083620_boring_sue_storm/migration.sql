ALTER TABLE "events" ADD COLUMN "address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "motion" jsonb;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "featured_properties";