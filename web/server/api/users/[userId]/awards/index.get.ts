import { db } from "#server/db";

defineRouteMeta({
  openAPI: {
    tags: ["Users"],
    description: "Get awards for a user",
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        description: "The ID of the user whose awards should be returned",
        schema: {
          type: "integer",
        },
      },
    ],
    responses: {
      200: {
        description: "The user's awards",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                awards: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Award",
                  },
                },
              },
              required: ["awards"],
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
    $global: {
      components: {
        schemas: {
          Award: {
            type: "object",
            properties: {
              award: {
                type: "string",
                example: "Best Speaker",
              },
              userId: {
                type: "integer",
                example: 1,
              },
              level: {
                type: "integer",
                minimum: 1,
                example: 1,
              },
              awardedBy: {
                type: "integer",
                nullable: true,
                example: 2,
              },
              createdAt: {
                type: "string",
                format: "date-time",
                example: "2023-01-01T00:00:00Z",
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                example: "2023-01-01T00:00:00Z",
              },
            },
            required: [
              "award",
              "userId",
              "level",
              "awardedBy",
              "createdAt",
              "updatedAt",
            ],
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  await requireUser(event);
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

  const userAwards = await db.query.awards.findMany({
    where: {
      userId: userId,
    },
  });

  return { awards: userAwards };
});
