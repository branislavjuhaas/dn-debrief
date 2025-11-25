import { db } from "~~/server/db/db";
import { and, count, eq } from "drizzle-orm";
import { clubs, clubMemberships } from "~~/server/db/schema/clubs";

defineRouteMeta({
  openAPI: {
    description:
      "List clubs along with confirmed membership counts for the current season.",
    tags: ["Clubs"],
    responses: {
      200: {
        description: "Clubs with membership statistics.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                statusCode: { type: "number" },
                data: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      name: { type: "string" },
                      isActive: { type: "boolean" },
                      league: { type: "string" },
                      region: { type: "string" },
                      membershipCount: { type: "number" },
                    },
                  },
                },
              },
            },
            examples: {
              success: {
                value: {
                  success: true,
                  statusCode: 200,
                  data: [
                    {
                      id: 1,
                      name: "Sučany",
                      isActive: true,
                      league: "senior",
                      region: "central",
                      membershipCount: 12,
                    },
                  ],
                },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  },
});

/**
 * Handler: GET /api/clubs
 *
 * Requires admin/developer role and returns all clubs with their current-season confirmed membership counts.
 *
 * Returns:
 *  - { success: boolean, statusCode: number, data: Array<{ id:number; name:string; isActive:boolean; league:string; region:string; membershipCount:number }> }
 */
export default defineEventHandler(async (event) => {
  await useAuth(event, ["admin", "developer"]);

  // get all clubs with counts of memberships where the season is the current year to string and confirmed is true
  const data = await db
    .select({
      id: clubs.id,
      name: clubs.name,
      isActive: clubs.isActive,
      league: clubs.league,
      region: clubs.region,
      membershipCount: count(clubMemberships.id).as("membershipCount"),
    })
    .from(clubs)
    .leftJoin(
      clubMemberships,
      and(
        eq(clubMemberships.clubId, clubs.id),
        eq(clubMemberships.season, new Date().getFullYear().toString()),
        eq(clubMemberships.confirmed, true),
      ),
    )
    .groupBy(clubs.id);

  return { success: true, statusCode: 200, data };
});
