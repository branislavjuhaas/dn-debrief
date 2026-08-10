CREATE TYPE "role" AS ENUM('user', 'organizer', 'junior_organizer', 'chief_adjudicator', 'motion_committee_member', 'admin', 'developer');--> statement-breakpoint
CREATE TYPE "club_registration_type" AS ENUM('junior_student', 'senior_student', 'graduate', 'teacher');--> statement-breakpoint
CREATE TYPE "league" AS ENUM('junior', 'senior', 'university');--> statement-breakpoint
CREATE TYPE "region" AS ENUM('western', 'central', 'eastern');--> statement-breakpoint
CREATE TYPE "event_type" AS ENUM('tournament', 'workshop', 'other');--> statement-breakpoint
CREATE TYPE "payment_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "awards" (
	"name" text,
	"user_id" integer,
	"level" smallint,
	"awarded_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "awards_pkey" PRIMARY KEY("user_id","name","level")
);
--> statement-breakpoint
CREATE TABLE "legal_guardians" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"user_id" integer NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"ip_address" text,
	"user_agent" text,
	"user_id" integer NOT NULL,
	"impersonated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"surname" text NOT NULL,
	"search" text GENERATED ALWAYS AS ((lower(regexp_replace(public.immutable_unaccent("users"."name" || "users"."surname"), '[^a-zA-Z0-9]', '', 'g')))) STORED NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "role" DEFAULT 'user'::"role" NOT NULL,
	"birth_date" date,
	"street" text,
	"postal_code" text,
	"town" text,
	"phone" text,
	"credential" integer DEFAULT 0 NOT NULL,
	"claims" jsonb,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" serial PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "club_managers" (
	"club_id" integer,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "club_managers_pkey" PRIMARY KEY("club_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "club_memberships" (
	"club_id" integer NOT NULL,
	"user_id" integer,
	"season" smallint,
	"registration_type" "club_registration_type" NOT NULL,
	"confirmed" boolean DEFAULT false NOT NULL,
	"payment_id" integer UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "club_memberships_pkey" PRIMARY KEY("user_id","season")
);
--> statement-breakpoint
CREATE TABLE "clubs" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"search" text GENERATED ALWAYS AS ((lower(regexp_replace(public.immutable_unaccent("clubs"."name"), '[^a-zA-Z0-9]', '', 'g')))) STORED NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"league" "league" NOT NULL,
	"region" "region" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
	"collected_details" jsonb NOT NULL,
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
	"thumbnail_url" text,
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
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL,
	"description" text NOT NULL,
	"amount" integer NOT NULL,
	"status" "payment_status" DEFAULT 'pending'::"payment_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY,
	"current_seasons" integer[] NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" ("user_id");--> statement-breakpoint
CREATE INDEX "awards_userId_idx" ON "awards" ("user_id");--> statement-breakpoint
CREATE INDEX "supervisors_userId_idx" ON "legal_guardians" ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" ("role");--> statement-breakpoint
CREATE INDEX "users_search_idx" ON "users" USING gin ("search" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" ("identifier");--> statement-breakpoint
CREATE INDEX "club_managers_userId_idx" ON "club_managers" ("user_id");--> statement-breakpoint
CREATE INDEX "club_managers_clubId_idx" ON "club_managers" ("club_id");--> statement-breakpoint
CREATE INDEX "club_memberships_userId_idx" ON "club_memberships" ("user_id");--> statement-breakpoint
CREATE INDEX "club_memberships_userId_season_idx" ON "club_memberships" ("user_id","season");--> statement-breakpoint
CREATE INDEX "club_memberships_paymentId_idx" ON "club_memberships" ("payment_id");--> statement-breakpoint
CREATE INDEX "club_memberships_clubId_season_confirmed_idx" ON "club_memberships" ("club_id","season","confirmed");--> statement-breakpoint
CREATE INDEX "clubs_isActive_idx" ON "clubs" ("is_active");--> statement-breakpoint
CREATE INDEX "clubs_search_idx" ON "clubs" USING gin ("search" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "event_organizers_userId_idx" ON "event_organizers" ("user_id");--> statement-breakpoint
CREATE INDEX "event_organizers_eventId_idx" ON "event_organizers" ("event_id");--> statement-breakpoint
CREATE INDEX "event_registrations_userId_idx" ON "event_registrations" ("user_id");--> statement-breakpoint
CREATE INDEX "event_registrations_eventId_idx" ON "event_registrations" ("event_id");--> statement-breakpoint
CREATE INDEX "events_type_idx" ON "events" ("type");--> statement-breakpoint
CREATE INDEX "events_beginning_end_idx" ON "events" ("beginning","end");--> statement-breakpoint
CREATE INDEX "events_targetLeague_idx" ON "events" ("target_league");--> statement-breakpoint
CREATE INDEX "events_targetRegion_idx" ON "events" ("target_region");--> statement-breakpoint
CREATE INDEX "events_search_idx" ON "events" USING gin ("search" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "payments_user_id_idx" ON "payments" ("user_id");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "awards" ADD CONSTRAINT "awards_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "awards" ADD CONSTRAINT "awards_awarded_by_users_id_fkey" FOREIGN KEY ("awarded_by") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "legal_guardians" ADD CONSTRAINT "legal_guardians_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "club_managers" ADD CONSTRAINT "club_managers_club_id_clubs_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id");--> statement-breakpoint
ALTER TABLE "club_managers" ADD CONSTRAINT "club_managers_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_club_id_clubs_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id");--> statement-breakpoint
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_payment_id_payments_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "event_organizers" ADD CONSTRAINT "event_organizers_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_organizers" ADD CONSTRAINT "event_organizers_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_payment_id_payments_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;