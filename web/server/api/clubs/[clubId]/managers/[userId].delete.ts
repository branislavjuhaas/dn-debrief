import { db } from "#server/db";
import { clubManagers } from "#server/db/schema/clubs";
import { and, eq } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["Club Managers"],
    summary: "Remove club manager",
    description: "Remove a club manager",
    parameters: [
      {
        name: "clubId",
        in: "path",
        required: true,
        description: "The ID of the club to modify",
        schema: {
          type: "integer",
        },
      },
      {
        name: "userId",
        in: "path",
        required: true,
        description: "The ID of the manager to remove",
        schema: {
          type: "integer",
        },
      },
    ],
    responses: {
      204: {
        description: "No Content - Manager removed successfully",
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
        description: "Manager not found",
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
  await requireUser(event, ["developer", "admin"]);
  const clubId = Number.parseInt(getRouterParam(event, "clubId") ?? "", 10);

  const managerId = Number.parseInt(getRouterParam(event, "userId") ?? "", 10);

  const deletedManagers = await db
    .delete(clubManagers)
    .where(
      and(eq(clubManagers.clubId, clubId), eq(clubManagers.userId, managerId)),
    )
    .returning();

  if (!deletedManagers[0]) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "Manager not found",
    });
  }

  setResponseStatus(event, 204);
});
