import type {
  userRoleEnum,
  users,
  legalGuardians,
} from "#server/db/schema/auth";

export type UserRole = (typeof userRoleEnum.enumValues)[number];

export type LegalGuardian = typeof legalGuardians.$inferSelect;

export type User = typeof users.$inferSelect & {
  legalGuardians?: LegalGuardian[];
  clubMemberships?: ClubMembership[];
  managedClubs?: Club[];
};
