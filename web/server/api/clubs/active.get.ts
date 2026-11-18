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
              type: "object" as const,
              properties: {
                clubs: {
                  type: "array" as const,
                  items: {
                    type: "object" as const,
                    properties: {
                      id: { type: "number" as const },
                      name: { type: "string" as const, example: "Sučany" },
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
