import { db } from "#server/db";
import { clubMemberships, clubs } from "#server/db/schema/clubs";
import { count, eq } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["Clubs"],
    summary: "Delete club",
    description: "Delete a specific club",
    parameters: [
      {
        name: "clubId",
        in: "path",
        required: true,
        schema: {
          type: "integer",
        },
        description: "The ID of the club to delete",
      },
    ],
    responses: {
      204: {
        description: "No Content - Club deleted successfully",
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      403: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      404: {
        description: "Club not found",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      409: {
        description: "Cannot delete non-empty club",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  // Authentication & parameter resolution
  await requireUser(event, ["developer", "admin"]);

  const clubId = Number.parseInt(getRouterParam(event, "clubId") ?? "", 10);

  // Get the number of clubMemberships associated with the club
  const clubMembershipCount = await db
    .select({ count: count() })
    .from(clubMemberships)
    .where(eq(clubMemberships.clubId, clubId));

  if (clubMembershipCount[0] && clubMembershipCount[0].count > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: "Cannot delete non-empty club",
      message: `Cannot delete club with ID ${clubId} because it has associated members`,
    });
  }

  const deletedClub = await db
    .delete(clubs)
    .where(eq(clubs.id, clubId))
    .returning();

  if (deletedClub.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: "Club not found",
      message: `No club found with ID ${clubId}`,
    });
  }

  setResponseStatus(event, 204);
  return;
});
