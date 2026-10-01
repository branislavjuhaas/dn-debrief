DROP INDEX "accounts_issuer_accountId_uidx";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "issuer";--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "place" SET NOT NULL;
