CREATE TYPE "league" AS ENUM('junior', 'senior', 'university');--> statement-breakpoint
CREATE TYPE "club_registration_type" AS ENUM('junior_student', 'senior_student', 'graduate', 'teacher');--> statement-breakpoint
CREATE TYPE "region" AS ENUM('west', 'central', 'east');--> statement-breakpoint
CREATE TYPE "payment_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "club_managers" (
	"id" serial PRIMARY KEY,
	"club_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "club_memberships" (
	"club_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"season" smallint NOT NULL,
	"registration_type" "club_registration_type" NOT NULL,
	"confirmed" boolean DEFAULT false NOT NULL,
	"payment_id" integer UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clubs" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"search" text GENERATED ALWAYS AS ((lower(regexp_replace(public.immutable_unaccent("clubs"."name"), '[^a-zA-Z0-9]', '', 'g')))) STORED NOT NULL,
	"league" "league" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"region" "region" NOT NULL,
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
CREATE UNIQUE INDEX "club_managers_userId_clubId_unique" ON "club_managers" ("user_id","club_id");--> statement-breakpoint
CREATE INDEX "club_managers_userId_idx" ON "club_managers" ("user_id");--> statement-breakpoint
CREATE INDEX "club_managers_clubId_idx" ON "club_managers" ("club_id");--> statement-breakpoint
CREATE UNIQUE INDEX "club_memberships_userId_season_unique" ON "club_memberships" ("user_id","season");--> statement-breakpoint
CREATE INDEX "club_memberships_userId_idx" ON "club_memberships" ("user_id");--> statement-breakpoint
CREATE INDEX "club_memberships_userId_season_idx" ON "club_memberships" ("user_id","season");--> statement-breakpoint
CREATE INDEX "club_memberships_paymentId_idx" ON "club_memberships" ("payment_id");--> statement-breakpoint
CREATE INDEX "club_memberships_clubId_season_confirmed_idx" ON "club_memberships" ("club_id","season","confirmed");--> statement-breakpoint
CREATE INDEX "clubs_isActive_idx" ON "clubs" ("is_active");--> statement-breakpoint
CREATE INDEX "clubs_search_idx" ON "clubs" USING gin ("search" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "payments_user_id_idx" ON "payments" ("user_id");--> statement-breakpoint
ALTER TABLE "club_managers" ADD CONSTRAINT "club_managers_club_id_clubs_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id");--> statement-breakpoint
ALTER TABLE "club_managers" ADD CONSTRAINT "club_managers_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_club_id_clubs_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id");--> statement-breakpoint
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_payment_id_payments_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;