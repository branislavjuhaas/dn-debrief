import { db } from "#server/db";

defineRouteMeta({
  openAPI: {
    tags: ["Users"],
    summary: "List user memberships",
    description: "Get all club memberships for a user.",
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        schema: { type: "integer" },
        description: "The ID of the user whose memberships should be returned",
      },
    ],
    responses: {
      200: {
        description: "The user's club memberships",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                memberships: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      userId: { type: "integer", example: 1 },
                      clubId: { type: "integer", example: 15 },
                      season: { type: "integer", example: 2026 },
                      registrationType: {
                        type: "string",
                        example: "senior_student",
                      },
                      confirmed: { type: "boolean", example: true },
                      club: {
                        type: "object",
                        $ref: "#/components/schemas/Club",
                      },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
              required: ["memberships"],
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
      404: {
        description: "User not found",
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
  const userId = await resolveUserId(
    event,
    getRouterParam(event, "userId") ?? "",
  );

  if (!userId) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "User not found",
    });
  }

  const userMemberships = await db.query.clubMemberships.findMany({
    where: {
      userId: userId,
    },
    with: {
      club: true,
    },
  });

  return { memberships: userMemberships };
});
