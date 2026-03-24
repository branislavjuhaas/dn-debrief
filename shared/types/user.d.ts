import type {
  userRoleEnum,
  users,
  legalGuardians,
} from "#server/db/schema/auth";

type UserRole = (typeof userRoleEnum.enumValues)[number];

type LegalGuardian = typeof legalGuardians.$inferSelect;

type User = typeof users.$inferSelect & {
  legalGuardians?: LegalGuardian[];
};
