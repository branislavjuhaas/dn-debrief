import type { InferSelectModel } from "drizzle-orm";
import { users } from "~~/server/db/schema/auth";
import type { ClubMembership } from "#shared/types/club";

export type Role =
  | "user"
  | "organizer"
  | "junior_organizer"
  | "chief_adjudicator"
  | "motion_committee_member"
  | "admin"
  | "developer";

export type User = InferSelectModel<typeof users> & {
  clubMemberships?: ClubMembership[];
};
