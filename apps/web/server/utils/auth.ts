import type { H3Event } from "h3";
import { auth } from "#server/auth/auth";
import type { User, UserRole } from "#shared/types/user";

export const requireUser = async (
  event: H3Event,
  roles: UserRole[] | null = null,
): Promise<User> => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (!session || !session.user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const role = session?.user?.role;

  if (roles && !roles.includes(role as UserRole)) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  return session.user as unknown as User;
};

export const getUser = async (event: H3Event): Promise<User | null> => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (!session || !session.user) {
    return null;
  }

  return session.user as unknown as User;
};
