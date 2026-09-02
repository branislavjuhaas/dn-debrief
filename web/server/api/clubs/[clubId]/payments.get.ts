import { db } from "#server/db";

defineRouteMeta({
  openAPI: {
    tags: ["Clubs"],
    summary: "List club's unpaid payments",
    description: "Get all unpaid payments for a club.",
    parameters: [
      {
        name: "clubId",
        in: "path",
        required: true,
        schema: { type: "integer", example: 1 },
        description: "The ID of the club whose payments should be returned",
      },
    ],
    responses: {
      200: {
        description: "The club's unpaid payments",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                payments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer", example: 1 },
                      description: { type: "string", example: "" },
                      createdAt: {
                        type: "string",
                        example: "2024-01-01T00:00:00Z",
                      },
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "integer", example: 1 },
                          name: { type: "string", example: "John" },
                          surname: { type: "string", example: "Doe" },
                          image: {
                            type: "string",
                            example: "https://example.com/image.jpg",
                            nullable: true,
                          },
                        },
                        required: ["id", "name", "surname", "image"], // Moved outside properties
                      },
                    },
                    required: ["id", "description", "createdAt", "user"], // Moved outside properties
                  },
                },
              },
              required: ["payments"], // Moved to the root object schema level
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
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "You do not have permission to view members of this club.",
      });
    }
  }

  const userPayments = await db.query.payments.findMany({
    columns: {
      id: true,
      description: true,
      createdAt: true,
    },
    where: {
      user: {
        clubMemberships: {
          clubId: clubId,
          season: new Date().getFullYear(),
        },
      },
      status: {
        in: ["failed", "cancelled", "pending"],
      },
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          surname: true,
          image: true,
        },
      },
    },
  });

  return { payments: userPayments };
});
