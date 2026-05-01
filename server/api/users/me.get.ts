import { requireUser } from "#server/utils/auth";
import { getCompleteUser } from "#server/utils/user";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const userData = await getCompleteUser(user.id);

  return { user: userData };
});
