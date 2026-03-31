ALTER TABLE "clubs" ALTER COLUMN "region" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "target_region" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "region";--> statement-breakpoint
CREATE TYPE "region" AS ENUM('western', 'central', 'eastern');--> statement-breakpoint
ALTER TABLE "clubs" ALTER COLUMN "region" SET DATA TYPE "region" USING "region"::"region";--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "target_region" SET DATA TYPE "region" USING "target_region"::"region";