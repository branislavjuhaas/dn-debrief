import type { InferSelectModel } from "drizzle-orm";
import type { clubManagers, clubs, clubMemberships } from "hub:db:schema";

export type Club = InferSelectModel<typeof clubs>;

export type ClubMembership = InferSelectModel<typeof clubMemberships> & {
  club: Club;
};

export type ClubManagement = InferSelectModel<typeof clubManagers> & {
  club: Club;
};
