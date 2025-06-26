/**
 * Authentication & authorization middleware for all API routes.
 * - Allows anonymous access to routes marked `anonymous`.
 * - Enforces authentication for all other routes.
 * - Validates user roles for routes specifying `allowedRoles`.
 * Sets HTTP 401 for unauthorized and 403 for forbidden.
 */

import {
  serverSupabaseUser,
  serverSupabaseServiceRole,
} from "#supabase/server";

const routes = [
  {
    path: "/api/users/role",
    method: "POST",
    allowedRoles: ["admin", "developer"],
  },
  {
    path: "/api/version",
    method: "GET",
    anonymous: true,
  },
];
// build a quick lookup
const routeMap = new Map(routes.map((r) => [`${r.method}:${r.path}`, r]));

/**
 * Fetches the user’s role from the database using Supabase service role key.
 * @param userId - Supabase auth user ID.
 * @param event - Nitro request event.
 * @returns The user’s role string or null if not found/error.
 */
const getUserRole = async (
  userId: string,
  event: any,
): Promise<string | null> => {
  const client = await serverSupabaseServiceRole(event);

  const { data, error } = await client
    .from("users")
    .select("claims(role)")
    .eq("auth_id", userId)
    .single();
  if (error) {
    return null;
  }

  return data?.claims?.role || null;
};

/**
 * Main event handler for authentication & authorization.
 * @param event - Nitro request event.
 * @returns void or an error response object.
 */
export default defineEventHandler(async (event) => {
  // Skip if not an API route
  if (!event.path.startsWith("/api/")) {
    return;
  }

  const key = `${event.method}:${event.path}`;
  const route = routeMap.get(key);

  if (route?.anonymous) {
    return;
  }

  const user = await serverSupabaseUser(event).catch(() => null);
  if (!user) {
    setResponseStatus(event, 401);
    return { status: 401, body: { error: "Unauthorized" } };
  }
  event.context.user = user;

  if (route?.allowedRoles) {
    const userRole = await getUserRole(user.id, event);
    if (!userRole || !route.allowedRoles.includes(userRole)) {
      setResponseStatus(event, 403);
      return { status: 403, body: { error: "Forbidden" } };
    }
    event.context.user.user_role = userRole;
  }

  return;
});
