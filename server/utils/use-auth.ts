import { User, Role } from "#shared/types/user";
import { auth } from "~~/server/auth/auth";
import { H3Event } from "h3";

export const useAuth = async (event: H3Event, roles: Role[] | null = null) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (
    !session ||
    !session.user ||
    (roles && !roles.includes(session.user.role as Role))
  ) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  return { ...session.user, id: Number(session.user.id) } as unknown as User;
};
