import type { clubMemberships, clubs } from "#server/db/schema/clubs";

export type Club = typeof clubs.$inferSelect;

export type ClubMembership = typeof clubMemberships.$inferSelect & {
  club: Club;
};
