import { requireUser } from "#server/utils/auth";
import { db } from "#server/db";
import { users } from "#server/db/schema/auth";
import { clubMemberships } from "#server/db/schema/clubs";
import { count, eq, isNotNull } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["Users"],
    summary: "Get user statistics",
    description:
      "Return aggregate user and club membership statistics for the current season.",
    responses: {
      200: {
        description: "User statistics summary",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                all: { type: "integer", example: 142 },
                completed: { type: "integer", example: 98 },
                members: { type: "integer", example: 87 },
              },
              required: ["all", "completed", "members"],
            },
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      403: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  await requireUser(event, ["developer", "admin", "chief_adjudicator"]);

  const allUsersCount = await db.select({ count: count() }).from(users);
  const completeUsersCount = await db
    .select({ count: count() })
    .from(users)
    .where(isNotNull(users.birthDate));
  const clubMembershipsCount = await db
    .select({ count: count() })
    .from(clubMemberships)
    .where(eq(clubMemberships.season, new Date().getFullYear()));

  return {
    all: allUsersCount?.[0]?.count ?? 0,
    completed: completeUsersCount?.[0]?.count ?? 0,
    members: clubMembershipsCount?.[0]?.count ?? 0,
  };
});
