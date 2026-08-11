import { and, eq } from "drizzle-orm";
import { db } from "#server/db";
import { awards } from "#server/db/schema/auth";

defineRouteMeta({
  openAPI: {
    tags: ["User Awards"],
    description: "Delete an award for a user",
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        description: "The ID of the user whose award should be deleted",
        schema: {
          type: "integer",
        },
      },
      {
        name: "award",
        in: "path",
        required: true,
        description: "The award name to delete",
        schema: {
          type: "string",
        },
      },
    ],
    responses: {
      204: {
        description: "Award deleted",
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
        description: "Award not found",
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
  const userId = Number.parseInt(getRouterParam(event, "userId") ?? "", 10);
  const award = getRouterParam(event, "award") ?? "";

  const deletedAwards = await db
    .delete(awards)
    .where(and(eq(awards.userId, userId), eq(awards.award, award)))
    .returning();

  if (!deletedAwards[0]) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "Award not found",
    });
  }

  setResponseStatus(event, 204);
});
