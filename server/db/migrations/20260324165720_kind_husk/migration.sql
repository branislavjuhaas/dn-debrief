CREATE TABLE "legal_guardians" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "supervisors";--> statement-breakpoint
CREATE INDEX "supervisors_userId_idx" ON "legal_guardians" ("user_id");--> statement-breakpoint
ALTER TABLE "legal_guardians" ADD CONSTRAINT "legal_guardians_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;