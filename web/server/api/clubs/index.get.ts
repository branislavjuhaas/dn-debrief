import { db } from "#server/db";
import { clubMemberships } from "#server/db/schema/clubs";
import { and, eq } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["Clubs"],
    description: "Get all clubs",
    responses: {
      200: {
        description: "The clubs",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                clubs: {
                  type: "array",
                  items: {
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
  },
});

export default defineEventHandler(async (event) => {
  await requireUser(event);

  const currentSeason = new Date().getFullYear();

  const clubs = await db.query.clubs.findMany({
    extras: {
      membershipsCount: (t) =>
        db.$count(
          clubMemberships,
          and(eq(clubMemberships.clubId, t.id), eq(clubMemberships.season, currentSeason)),
        ),
    },
  });

  return { clubs };
});
