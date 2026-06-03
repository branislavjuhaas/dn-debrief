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
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY,
	"current_seasons" integer[] NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_registrations" ADD COLUMN "collected_details" jsonb NOT NULL;--> statement-breakpoint
CREATE INDEX "awards_userId_idx" ON "awards" ("user_id");--> statement-breakpoint
CREATE INDEX "event_organizers_eventId_idx" ON "event_organizers" ("event_id");--> statement-breakpoint
ALTER TABLE "awards" ADD CONSTRAINT "awards_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "awards" ADD CONSTRAINT "awards_awarded_by_users_id_fkey" FOREIGN KEY ("awarded_by") REFERENCES "users"("id") ON DELETE CASCADE;