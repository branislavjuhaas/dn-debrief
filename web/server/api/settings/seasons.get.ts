import { db } from "#server/db";
import { clubMemberships } from "#server/db/schema/clubs";
import { eq } from "drizzle-orm";
import * as z from "zod";

defineRouteMeta({
  openAPI: {
    tags: ["Settings"],
    summary: "List seasons",
    description: "Get the currently available seasons",
    parameters: [
      {
        name: "all",
        in: "query",
        required: false,
        schema: { type: "boolean" },
        description:
          "Include all seasons, including ones the current user already belongs to",
      },
    ],
    responses: {
      200: {
        description: "The available seasons",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                seasons: {
                  type: "array",
                  items: { type: "number" },
                  example: [2026, 2027],
                },
              },
              required: ["seasons"],
            },
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

const seasonsQuery = z.object({
  all: z.stringbool().optional(),
});

export default defineEventHandler(async (event) => {
  const { all } = await getValidatedQuery(event, seasonsQuery.parse);
  const seasons = await getSetting("current-seasons");

  if (all || !seasons) {
    return { seasons };
  }

  const user = await getUser(event);

  if (!user) {
    return { seasons };
  }

  const memberships = await db
    .select({ season: clubMemberships.season })
    .from(clubMemberships)
    .where(eq(clubMemberships.userId, user.id));

  // filter out seasons that are in memberships
  const filteredSeasons = seasons.filter(
    (s) => !memberships.map((m) => m.season).includes(s),
  );
  return { seasons: filteredSeasons };
});
