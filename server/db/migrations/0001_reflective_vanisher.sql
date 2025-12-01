CREATE TYPE "public"."role" AS ENUM('user', 'organizer', 'junior_organizer', 'chief_adjudicator', 'motion_committee_member', 'admin', 'developer');--> statement-breakpoint
CREATE TYPE "public"."league" AS ENUM('junior', 'senior', 'university');--> statement-breakpoint
CREATE TYPE "public"."region" AS ENUM('west', 'central', 'east');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
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
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" integer NOT NULL,
	"impersonated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "supervisors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "supervisors_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"surname" text NOT NULL,
	"search" text GENERATED ALWAYS AS ((lower(regexp_replace(public.immutable_unaccent("users"."name" || "users"."surname"), '[^a-zA-Z0-9]', '', 'g')))) STORED NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "role" DEFAULT 'user' NOT NULL,
	"credential" integer DEFAULT 0 NOT NULL,
	"birthdate" date,
	"address" text,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "club_managers" (
	"id" serial PRIMARY KEY NOT NULL,
	"club_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "club_memberships" (
	"id" serial PRIMARY KEY NOT NULL,
	"club_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"season" varchar(4) NOT NULL,
	"confirmed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clubs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"search" text GENERATED ALWAYS AS ((lower(regexp_replace(public.immutable_unaccent("clubs"."name"), '[^a-zA-Z0-9]', '', 'g')))) STORED NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"league" "league" DEFAULT 'senior' NOT NULL,
	"region" "region" DEFAULT 'central',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_organizers" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"season" varchar(9) NOT NULL,
	"name" text NOT NULL,
	"search" text GENERATED ALWAYS AS ((lower(regexp_replace(public.immutable_unaccent("events"."name" || "events"."season"), '[^a-zA-Z0-9]', '', 'g')))) STORED NOT NULL,
	"league" "league" DEFAULT 'senior' NOT NULL,
	"region" "region" DEFAULT 'central',
	"draft" boolean DEFAULT false NOT NULL,
	"beginning" timestamp NOT NULL,
	"end" timestamp NOT NULL,
	"details" jsonb NOT NULL,
	"registration" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supervisors" ADD CONSTRAINT "supervisors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_managers" ADD CONSTRAINT "club_managers_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_managers" ADD CONSTRAINT "club_managers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_organizers" ADD CONSTRAINT "event_organizers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_organizers" ADD CONSTRAINT "event_organizers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "supervisors_userId_idx" ON "supervisors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_search_idx" ON "users" USING gin ("search" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "club_managers_userId_clubId_unique" ON "club_managers" USING btree ("user_id","club_id");--> statement-breakpoint
CREATE INDEX "club_managers_userId_idx" ON "club_managers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "club_managers_clubId_idx" ON "club_managers" USING btree ("club_id");--> statement-breakpoint
CREATE UNIQUE INDEX "club_memberships_userId_season_unique" ON "club_memberships" USING btree ("user_id","season");--> statement-breakpoint
CREATE INDEX "club_memberships_userId_idx" ON "club_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "club_memberships_userId_season_idx" ON "club_memberships" USING btree ("user_id","season");--> statement-breakpoint
CREATE INDEX "club_memberships_clubId_season_confirmed_idx" ON "club_memberships" USING btree ("club_id","season","confirmed");--> statement-breakpoint
CREATE INDEX "clubs_isActive_idx" ON "clubs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "clubs_search_idx" ON "clubs" USING gin ("search" gin_trgm_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "event_organizers_eventId_userId_unique" ON "event_organizers" USING btree ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "event_organizers_eventId_idx" ON "event_organizers" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_organizers_userId_idx" ON "event_organizers" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_registrations_eventId_userId_unique" ON "event_registrations" USING btree ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "event_registrations_eventId_idx" ON "event_registrations" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_registrations_userId_idx" ON "event_registrations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "events_league_idx" ON "events" USING btree ("league");--> statement-breakpoint
CREATE INDEX "events_region_idx" ON "events" USING btree ("region");--> statement-breakpoint
CREATE INDEX "events_season_idx" ON "events" USING btree ("season");--> statement-breakpoint
CREATE INDEX "events_end_draft_idx" ON "events" USING btree ("end","draft");--> statement-breakpoint
CREATE INDEX "events_search_idx" ON "events" USING gin ("search" gin_trgm_ops);