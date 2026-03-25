CREATE TYPE "event_type" AS ENUM('tournament', 'workshop', 'other');--> statement-breakpoint
CREATE TABLE "event_organizers" (
	"event_id" integer,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_organizers_pkey" PRIMARY KEY("event_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"event_id" integer,
	"user_id" integer,
	"registration_data" jsonb NOT NULL,
	"confirmed" boolean DEFAULT false NOT NULL,
	"payment_id" integer UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_registrations_pkey" PRIMARY KEY("event_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY,
	"Slug" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"search" text GENERATED ALWAYS AS ((lower(regexp_replace(public.immutable_unaccent("events"."name"), '[^a-zA-Z0-9]', '', 'g')))) STORED NOT NULL,
	"type" "event_type" NOT NULL,
	"description" jsonb NOT NULL,
	"beginning" timestamp NOT NULL,
	"end" timestamp NOT NULL,
	"target_league" "league",
	"target_region" "region",
	"place" text,
	"featured_properties" jsonb DEFAULT '[]' NOT NULL,
	"schedule" jsonb DEFAULT '{"days":[]}' NOT NULL,
	"registration_config" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "birthdate" SET DATA TYPE date USING "birthdate"::date;--> statement-breakpoint
CREATE INDEX "event_organizers_userId_idx" ON "event_organizers" ("user_id");--> statement-breakpoint
CREATE INDEX "event_registrations_userId_idx" ON "event_registrations" ("user_id");--> statement-breakpoint
CREATE INDEX "event_registrations_eventId_idx" ON "event_registrations" ("event_id");--> statement-breakpoint
CREATE INDEX "events_type_idx" ON "events" ("type");--> statement-breakpoint
CREATE INDEX "events_beginning_end_idx" ON "events" ("beginning","end");--> statement-breakpoint
CREATE INDEX "events_targetLeague_idx" ON "events" ("target_league");--> statement-breakpoint
CREATE INDEX "events_targetRegion_idx" ON "events" ("target_region");--> statement-breakpoint
CREATE INDEX "events_search_idx" ON "events" USING gin ("search" gin_trgm_ops);--> statement-breakpoint
ALTER TABLE "event_organizers" ADD CONSTRAINT "event_organizers_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_organizers" ADD CONSTRAINT "event_organizers_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_payment_id_payments_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL;