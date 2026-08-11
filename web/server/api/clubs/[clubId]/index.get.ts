import { db } from "#server/db";
import { clubMemberships } from "#server/db/schema/clubs";
import { and, eq } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["Clubs"],
    description: "Get a specific club",
    parameters: [
      {
        name: "clubId",
        in: "path",
        required: true,
        schema: {
          type: "integer",
        },
        description: "The ID of the club to get",
      },
    ],
    responses: {
      200: {
        description: "The requested club",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                club: {
                  type: "object",
                  allOf: [
                    { $ref: "#/components/schemas/Club" },
                    {
                      type: "object",
                      properties: {
                        membershipsCount: { type: "number" },
                      },
                    },
                  ],
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
    $global: {
      components: {
        schemas: {
          Club: {
            type: "object",
            properties: {
              id: {
                type: "string",
                readOnly: true,
                nullable: true,
                example: "1",
              },
              name: {
                type: "string",
                readOnly: false,
                nullable: false,
                example: "Sučany",
              },
              search: {
                type: "string",
                readOnly: true,
                nullable: true,
                example: "sucany",
              },
              isActive: {
                type: "boolean",
                readOnly: false,
                nullable: false,
                example: true,
              },
              league: {
                type: "string",
                enum: ["junior", "senior", "university"],
                example: "senior",
              },
              region: {
                type: "string",
                enum: ["western", "central", "eastern"],
                example: "central",
              },
              createdAt: {
                type: "string",
                format: "date-time",
                example: "2023-01-01T00:00:00Z",
                readOnly: true,
                nullable: true,
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                example: "2023-01-01T00:00:00Z",
                readOnly: true,
                nullable: true,
              },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  await requireUser(event);
  const clubId = Number.parseInt(getRouterParam(event, "clubId") ?? "", 10);

  const currentSeason = new Date().getFullYear();

  const club = await db.query.clubs.findFirst({
    where: {
      id: clubId,
    },
    extras: {
      membershipsCount: db.$count(
        clubMemberships,
        and(
          eq(clubMemberships.clubId, clubId),
          eq(clubMemberships.season, currentSeason),
        ),
      ),
    },
  });

  if (!club) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "Club not found",
    });
  }

  return { club };
});
