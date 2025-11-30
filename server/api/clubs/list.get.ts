import { db } from "~~/server/db/db";
import { clubs } from "~~/server/db/schema/clubs";
import { eq } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    description: "Get a list of names and IDs of all active clubs",
    tags: ["Clubs"],
    responses: {
      200: {
        description: "List of active clubs",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  name: { type: "string" },
                },
              },
            },
            examples: {
              success: {
                value: {
                  success: true,
                  statusCode: 200,
                  data: [
                    { id: 1, name: "Sučany" },
                    { id: 2, name: "Vodná nádrž Sĺňava" },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
});

/**
 * Handler: GET /api/clubs/list
 *
 * Retrieves the id and name of active clubs.
 *
 * Parameters:
 *  - event: H3 event object (not used directly here).
 *
 * Returns:
 *  - An object: { success: boolean, statusCode: number, data: Array<{id:number, name:string}> }
 */
export default defineEventHandler(async (_event) => {
  const data = await db
    .select({ id: clubs.id, name: clubs.name })
    .from(clubs)
    .where(eq(clubs.isActive, true));

  return {
    success: true,
    statusCode: 200,
    data,
  };
});
