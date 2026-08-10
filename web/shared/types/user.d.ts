import type { userRoleEnum, users, legalGuardians, awards } from "#server/db/schema/auth";

export type UserRole = (typeof userRoleEnum.enumValues)[number];

export type Award = SerializeInferredDates<typeof awards.$inferSelect>;

export type Account = {
  providerId: string;
};

export type LegalGuardian = SerializeInferredDates<typeof legalGuardians.$inferSelect>;

export type User = SerializeInferredDates<typeof users.$inferSelect> & {
  awards?: Award[];
  legalGuardian?: LegalGuardian | null;
  clubMemberships?: ClubMembership[];
  managedClubs?: Club[];
  accounts?: Account[];
};
