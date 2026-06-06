import type {
  userRoleEnum,
  users,
  legalGuardians,
} from "#server/db/schema/auth";

export type UserRole = (typeof userRoleEnum.enumValues)[number];

export type LegalGuardian = SerializeInferredDates<
  typeof legalGuardians.$inferSelect
>;

export type User = SerializeInferredDates<typeof users.$inferSelect> & {
  legalGuardian?: LegalGuardian | null;
  clubMemberships?: ClubMembership[];
  managedClubs?: Club[];
};
