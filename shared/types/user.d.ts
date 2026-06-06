import type {
  userRoleEnum,
  users,
  legalGuardians,
} from "#server/db/schema/auth";

export type UserRole = (typeof userRoleEnum.enumValues)[number];

export type LegalGuardian = typeof legalGuardians.$inferSelect;

export type User = typeof users.$inferSelect & {
  legalGuardian?: LegalGuardian | null;
  clubMemberships?: ClubMembership[];
  managedClubs?: Club[];
};
