import type { clubMemberships, clubs } from "#server/db/schema/clubs";

export type Club = SerializeInferredDates<typeof clubs.$inferSelect>;

export type ClubMembership = SerializeInferredDates<typeof clubMemberships.$inferSelect> & {
  club?: Club | null;
};
