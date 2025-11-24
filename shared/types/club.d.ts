import type { InferSelectModel } from "drizzle-orm";
import { clubs, clubMemberships } from "~~/server/db/schema/clubs";

export type Club = InferSelectModel<typeof clubs>;

export type ClubMembership = InferSelectModel<typeof clubMemberships> & {
  club: Club;
};
