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
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "User must be authenticated to access this resource",
    });
  }

  const role = session?.user?.role;

  if (roles && !roles.includes(role as UserRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "User does not have the required role to access this resource",
    });
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

export const resolveUserId = async (
  event: H3Event,
  userId: string,
): Promise<number | null> => {
  if (userId !== "me") {
    return Number.parseInt(userId, 10);
  }

  const user = await getUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "User must be authenticated to access this resource",
    });
  }

  return user.id;
};
