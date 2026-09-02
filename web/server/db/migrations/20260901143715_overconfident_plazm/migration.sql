CREATE TYPE "payment_resolution" AS ENUM('stripe', 'manual', 'waived');--> statement-breakpoint
CREATE TYPE "payment_type" AS ENUM('event', 'membership');--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "payment_type" "payment_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "currency" text DEFAULT 'eur' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "checkout_attempt" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "resolution" "payment_resolution";--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "stripe_checkout_session_id" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "stripe_payment_intent_id" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "resolved_by_user_id" integer;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
DROP TYPE "payment_status";--> statement-breakpoint
CREATE TYPE "payment_status" AS ENUM('pending', 'processing', 'paid', 'cancelled', 'forgiven', 'failed');--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE "payment_status" USING "status"::"payment_status";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending'::"payment_status";--> statement-breakpoint

-- Drop FK constraints so column type changes don't fail
ALTER TABLE "club_memberships" DROP CONSTRAINT IF EXISTS "club_memberships_payment_id_payments_id_fkey";--> statement-breakpoint
ALTER TABLE "event_registrations" DROP CONSTRAINT IF EXISTS "event_registrations_payment_id_payments_id_fkey";--> statement-breakpoint

-- Clear values & alter referencing columns to uuid
UPDATE "club_memberships" SET "payment_id" = NULL;--> statement-breakpoint
ALTER TABLE "club_memberships" ALTER COLUMN "payment_id" SET DATA TYPE uuid USING NULL::uuid;--> statement-breakpoint

UPDATE "event_registrations" SET "payment_id" = NULL;--> statement-breakpoint
ALTER TABLE "event_registrations" ALTER COLUMN "payment_id" SET DATA TYPE uuid USING NULL::uuid;--> statement-breakpoint

-- Alter primary key on payments table to uuid
ALTER TABLE "payments" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE IF EXISTS "payments_id_seq";--> statement-breakpoint
UPDATE "payments" SET "id" = NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "id" SET DATA TYPE uuid USING NULL::uuid;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "id" SET DEFAULT uuidv7();--> statement-breakpoint

-- Foreign keys
ALTER TABLE "methodology_files" ADD CONSTRAINT "methodology_files_author_id_users_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_resolved_by_user_id_users_id_fkey" FOREIGN KEY ("resolved_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_payment_id_payments_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_payment_id_payments_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE;