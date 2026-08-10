import type { UserRole } from "#shared/types/user";

export const adminRoleRank = (role: UserRole) => {
  switch (role) {
    case "developer":
      return 2;
    case "admin":
      return 1;
    default:
      return 0;
  }
};
