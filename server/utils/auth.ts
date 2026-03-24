import type { UserRole } from "#shared/types/user";
import type { H3Event } from "h3";
import { auth } from "#server/auth/auth";

export const requireUser = (event: H3Event, roles?: UserRole[] = null) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (
    !session ||
    !session.user ||
    (roles && roles.includes(session.user.role))
  ) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  return { ...session.user, id: Number(session.user.id) } as unknown as User;
};
