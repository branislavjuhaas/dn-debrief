CREATE TABLE "methodology_files" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"external" boolean DEFAULT false NOT NULL,
	"file_path" text,
	"author_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "Slug" TO "slug";--> statement-breakpoint
ALTER TABLE "event_registrations" ADD COLUMN "id" serial;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "file_urls" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "event_registrations" DROP CONSTRAINT "event_registrations_pkey";--> statement-breakpoint
ALTER TABLE "event_registrations" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "event_registrations" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ALTER COLUMN "current_seasons" SET DEFAULT '{}'::integer[];--> statement-breakpoint
CREATE UNIQUE INDEX "event_registrations_eventId_userId_idx" ON "event_registrations" ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "users_author_id_idx" ON "methodology_files" ("author_id");--> statement-breakpoint
ALTER TABLE "awards" DROP CONSTRAINT "awards_awarded_by_users_id_fkey", ADD CONSTRAINT "awards_awarded_by_users_id_fkey" FOREIGN KEY ("awarded_by") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_end_after_beginning" CHECK ("end" > "beginning");