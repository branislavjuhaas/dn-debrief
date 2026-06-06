import { db } from "#server/db/db";

export const getCompleteUser = async (userId: number) => {
  return await db.query.users.findFirst({
    where: { id: userId },
    with: {
      legalGuardian: true,
      payments: true,
      clubMemberships: {
        with: {
          club: true,
        },
      },
      managedClubs: true,
    },
  });
};
