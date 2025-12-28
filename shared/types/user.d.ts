import type { InferSelectModel } from "drizzle-orm";
import type { supervisors, users } from "hub:db:schema";
import type { ClubManagement, ClubMembership } from "#shared/types/club";

export type Role =
  | "user"
  | "organizer"
  | "junior_organizer"
  | "chief_adjudicator"
  | "motion_committee_member"
  | "admin"
  | "developer";

export type Supervisor = InferSelectModel<typeof supervisors>;

export type User = InferSelectModel<typeof users> & {
  clubMemberships?: ClubMembership[];
  clubManagements?: ClubManagement[];
  supervisors?: Supervisor[];
  accounts?: { providerId: string }[];
};
