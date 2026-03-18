DROP INDEX "club_managers_userId_clubId_unique";--> statement-breakpoint
DROP INDEX "club_memberships_userId_season_unique";--> statement-breakpoint
ALTER TABLE "club_memberships" ADD PRIMARY KEY ("club_id","user_id","season");--> statement-breakpoint
ALTER TABLE "club_managers" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "club_managers" ADD PRIMARY KEY ("club_id","user_id");