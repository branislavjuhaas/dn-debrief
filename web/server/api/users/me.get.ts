import { requireUser } from "#server/utils/auth";
import { db } from "#server/db";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const userData = await db.query.users.findFirst({
    where: { id: user.id },
    with: {
      awards: true,
      legalGuardian: true,
      payments: true,
      clubMemberships: {
        with: {
          club: true,
        },
      },
      managedClubs: true,
      accounts: {
        columns: {
          providerId: true,
        },
      },
    },
  });

  return { user: userData };
});
