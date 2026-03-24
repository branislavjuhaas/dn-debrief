import { requireUser } from "#server/utils/auth";
import { db } from "#server/db/db";

export default defineEventHandler((event) => {
  const user = requireUser(event);

  const userData = db.query.users.findFirst({
    where: { id: user.id },
    with: {
      legalGuardians: true,
      payments: true,
      memberships: { with: { club: true } },
      managedClubs: true,
    },
  });

  return { user: userData };
});
