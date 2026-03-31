import { requireUser } from "#server/utils/auth";
import { db } from "#server/db/db";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const userData = await db.query.users.findFirst({
    where: { id: user.id },
    with: {
      legalGuardians: {
        columns: {
          name: true,
          email: true,
        },
      },
      payments: true,
      memberships: {
        with: {
          club: {
            columns: {
              name: true,
            },
          },
        },
      },
      managedClubs: {
        columns: {
          name: true,
        },
      },
    },
  });

  return { user: userData };
});
