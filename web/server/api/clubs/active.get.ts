import { db } from "#server/db";

defineRouteMeta({
  openAPI: {
    tags: ["Clubs"],
    summary: "List active clubs",
    description: "Get all active clubs",
    responses: {
      200: {
        description: "The active clubs",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                clubs: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      name: { type: "string", example: "Sučany" },
                    },
                    required: ["id", "name"],
                  },
                },
              },
              required: ["clubs"],
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
  await requireUser(event);

  const clubs = await db.query.clubs.findMany({
    columns: {
      id: true,
      name: true,
    },
    where: {
      isActive: true,
    },
  });

  return { clubs };
});
