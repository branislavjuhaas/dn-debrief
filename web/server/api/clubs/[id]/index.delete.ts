import { db } from "#server/db";
import { createUpdateSchema } from "drizzle-orm/zod";
import { clubs } from "#server/db/schema/clubs";
import { eq } from "drizzle-orm/sql/expressions/conditions";

defineRouteMeta({
  openAPI: {
    tags: ["Clubs"],
    description: "Delete a specific club",
    parameters: [
      {
        name: "id",
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
        description: "The deleted club",
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

  const clubId = Number.parseInt(getRouterParam(event, "id") ?? "", 10);

  const deletedClub = await db.delete(clubs).where(eq(clubs.id, clubId)).returning();

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
