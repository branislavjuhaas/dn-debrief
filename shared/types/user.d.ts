import type { InferSelectModel } from "drizzle-orm";
import { users } from "~~/server/db/schema/auth";
import type { ClubMembership } from "#shared/types/club";

export type User = InferSelectModel<typeof users> & {
  clubMemberships?: ClubMembership[];
};
