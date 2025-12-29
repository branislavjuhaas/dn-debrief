import { eq } from "drizzle-orm";
import { users } from "hub:db:schema";

export default defineEventHandler(async (event) => {
  const user = await useAuth(event);

  const data = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      supervisors: {
        columns: { name: true, email: true },
      },
      clubMemberships: {
        with: { club: { columns: { id: true, name: true } } },
        columns: {
          season: true,
          confirmed: true,
        },
      },
      clubManagements: {
        with: { club: { columns: { id: true, name: true } } },
        columns: {
          id: true,
        },
      },
      accounts: {
        columns: { providerId: true },
      },
    },
  });

  return {
    success: true,
    statusCode: 200,
    user: data,
  };
});
