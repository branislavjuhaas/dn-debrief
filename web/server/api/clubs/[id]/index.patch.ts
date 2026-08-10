import { db } from "#server/db";
import { createUpdateSchema } from "drizzle-orm/zod";
import { clubs } from "#server/db/schema/clubs";
import { eq } from "drizzle-orm/sql/expressions/conditions";

defineRouteMeta({
  openAPI: {
    tags: ["Clubs"],
    description: "Update a specific club",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "integer",
        },
        description: "The ID of the club to update",
      },
    ],
    requestBody: {
      description: "The updated club data",
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Club",
          },
        },
      },
    },
    responses: {
      202: {
        description: "The updated club",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                club: {
                  $ref: "#/components/schemas/Club",
                },
              },
            },
          },
        },
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

const bodySchema = createUpdateSchema(clubs);

export default defineEventHandler(async (event) => {
  // Authentication & parameter resolution
  await requireUser(event, ["developer", "admin"]);

  const clubId = Number.parseInt(getRouterParam(event, "id") ?? "", 10);
  const body = await readValidatedBody(event, bodySchema.parse);

  const updatedClub = await db
    .update(clubs)
    .set(body)
    .where(eq(clubs.id, clubId))
    .returning();

  if (updatedClub.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: "Club not found",
      message: `No club found with ID ${clubId}`,
    });
  }

  setResponseStatus(event, 202);
  return { club: updatedClub[0] };
});
