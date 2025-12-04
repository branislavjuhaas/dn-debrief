import type { InferSelectModel } from "drizzle-orm";
import {
  type clubs,
  type clubMemberships,
  clubManagers,
} from "~~/server/db/schema/clubs";

export type Club = InferSelectModel<typeof clubs>;

export type ClubMembership = InferSelectModel<typeof clubMemberships> & {
  club: Club;
};

export type ClubManagement = InferSelectModel<typeof clubManagers> & {
  club: Club;
};
