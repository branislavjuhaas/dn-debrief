import { z } from "zod";
import { db } from "#server/db";
import { users } from "#server/db/schema/auth";
import { eq } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["Users"],
    summary: "Update user credential",
    description: "Update the credential level of a user",
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        description: "The ID of the user to update",
        schema: {
          type: "integer",
        },
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              credential: {
                type: "integer",
                minimum: 0,
                maximum: 3,
                description:
                  "The new credential level (0-3) for the user. Use 0 to remove credential.",
              },
            },
            required: ["credential"],
          },
        },
      },
    },
    responses: {
      204: {
        description: "Credential updated successfully",
      },
      400: {
        description: "Invalid request body",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
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
        description: "User not found",
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

const credentialBody = z.object({
  credential: z.number().int().min(0).max(3),
});

export default defineEventHandler(async (event) => {
  await requireUser(event, ["developer", "admin", "chief_adjudicator"]);
  const userId = Number.parseInt(getRouterParam(event, "userId") ?? "", 10);
  const { credential } = await readValidatedBody(event, credentialBody.parse);

  const updatedUser = await db
    .update(users)
    .set({ credential })
    .where(eq(users.id, userId))
    .returning();

  if (!updatedUser[0]) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `User with ID ${userId} not found`,
    });
  }

  setResponseStatus(event, 204);
});
