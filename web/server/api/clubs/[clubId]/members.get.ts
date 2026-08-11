import { db } from "#server/db";

defineRouteMeta({
  openAPI: {
    tags: ["Clubs"],
    description: "Get members of a specific club for the current season.",
    parameters: [
      {
        name: "clubId",
        in: "path",
        required: true,
        description: "The ID of the club",
        schema: {
          type: "integer",
        },
      },
    ],
    responses: {
      200: {
        description: "List of club members for the current season",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                members: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer", example: 1 },
                      name: { type: "string", example: "John" },
                      surname: { type: "string", example: "Doe" },
                      email: {
                        type: "string",
                        format: "email",
                        example: "john.doe@example.com",
                      },
                      role: { type: "string", example: "user" },
                      image: { type: "string", nullable: true, example: null },
                    },
                    required: ["id", "name", "surname", "email", "role"],
                  },
                },
              },
              required: ["members"],
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
  const user = await requireUser(event);
  const clubId = Number.parseInt(getRouterParam(event, "clubId") ?? "", 10);

  // Check if the user is a developer or admin, or if they are the club manager
  if (!["developer", "admin"].includes(user.role)) {
    const clubManager = await db.query.clubManagers.findFirst({
      where: {
        clubId: clubId,
        userId: user.id,
      },
    });

    if (!clubManager) {
      throw createError({ statusCode: 403, message: "Forbidden" });
    }
  }

  const currentSeason = new Date().getFullYear();

  const members = await db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      surname: true,
      email: true,
      role: true,
      image: true,
    },
    where: {
      clubMemberships: {
        clubId: clubId,
        season: currentSeason,
      },
    },
  });

  return { members };
});
