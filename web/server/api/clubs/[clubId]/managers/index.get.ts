import { db } from "#server/db";

defineRouteMeta({
  openAPI: {
    tags: ["Club Managers"],
    description: "Get the managers of a club",
    parameters: [
      {
        name: "clubId",
        in: "path",
        required: true,
        description: "The ID of the club whose managers should be returned",
        schema: {
          type: "integer",
        },
      },
    ],
    responses: {
      200: {
        description: "The club managers",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                managers: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/ManagerSummary",
                  },
                },
              },
              required: ["managers"],
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
    $global: {
      components: {
        schemas: {
          ManagerSummary: {
            type: "object",
            properties: {
              id: {
                type: "number",
                example: 1,
              },
              name: {
                type: "string",
                example: "John",
              },
              surname: {
                type: "string",
                example: "Doe",
              },
              image: {
                type: "string",
                nullable: true,
                example: "https://example.com/avatar.jpg",
              },
            },
            required: ["id", "name", "surname", "image"],
          },
          ClubManager: {
            type: "object",
            properties: {
              clubId: {
                type: "number",
                example: 1,
              },
              userId: {
                type: "number",
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
            required: ["clubId", "userId", "createdAt", "updatedAt"],
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  await requireUser(event);
  const clubId = Number.parseInt(getRouterParam(event, "clubId") ?? "", 10);

  const managers = await db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      surname: true,
      image: true,
    },
    where: {
      managedClubs: {
        id: clubId,
      },
    },
  });

  return { managers };
});
