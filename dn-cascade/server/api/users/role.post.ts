/**
 * Server API: POST /api/users/role
 * - Validates user_id and role from request body.
 * - Ensures role is one of allowed roles.
 * - Updates the user's role in 'claims' table via Supabase service.
 */

import { serverSupabaseServiceRole } from "#supabase/server";
import { Database } from "~/types/database.types";

const roles = [
  "admin",
  "cap",
  "junior_organizer",
  "senior_organizer",
  "mc_member",
  "user",
];
const rolesSet = new Set(roles);
// Define the Role type as a one of allowed roles as string literals
type Role = Database["public"]["Enums"]["app_role"];

/**
 * Updates a user's role.
 * @param event - Nitro request event
 * @returns JSON response with status and message or error
 */
export default defineEventHandler(async (event) => {
  // Parse and validate payload
  const { user_id, role } = await readBody<{ user_id?: number; role?: Role }>(
    event,
  );
  if (!user_id || !role) {
    setResponseStatus(event, 400);
    return {
      status: 400,
      body: { error: "Bad Request: user_id and role are required" },
    };
  }

  // Validate role
  if (!rolesSet.has(role)) {
    setResponseStatus(event, 400);
    return {
      status: 400,
      body: {
        error: `Bad Request: Invalid role '${role}'. Valid roles: ${roles.join(
          ", ",
        )}`,
      },
    };
  }

  // Perform update
  const client = await serverSupabaseServiceRole(event);
  const { error } = await client
    .from("claims")
    .update({ role })
    .eq("user_id", user_id);

  if (error) {
    setResponseStatus(event, 500);
    return {
      status: 500,
      body: { error: "Internal Server Error: " + error.message },
    };
  }

  // Success response
  return {
    status: 200,
    body: {
      message: "User role updated successfully",
      user_id,
      role,
    },
  };
});
