import type { clubMemberships, clubs } from "@dn-debrief/db/schema";

export type Club = SerializeInferredDates<typeof clubs.$inferSelect>;

export type ClubMembership = SerializeInferredDates<
  typeof clubMemberships.$inferSelect
> & {
  club?: Club | null;
};
