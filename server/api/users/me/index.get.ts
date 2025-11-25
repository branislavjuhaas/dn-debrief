import { db } from "~~/server/db/db";
import { users } from "~~/server/db/schema/auth";
import { eq } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    description:
      "Get the authenticated user's profile including supervisors and club memberships.",
    tags: ["Users"],
    responses: {
      200: {
        description: "Authenticated user's profile",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                statusCode: { type: "number" },
                data: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    // include other user fields as needed
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    supervisors: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "number" },
                          clubId: { type: "number" },
                          userId: { type: "number" },
                          season: { type: "string" },
                          name: { type: "string" },
                          email: { type: "string", format: "email" },
                        },
                      },
                    },
                    clubMemberships: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "number" },
                          club: {
                            type: "object",
                            properties: {
                              id: { type: "number" },
                              name: { type: "string" },
                            },
                          },
                        },
                      },
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
                  data: {
                    id: 1,
                    name: "Jane Doe",
                    email: "jane@example.com",
                    supervisors: [
                      { id: 1, name: "John Doe", email: "john@example.com" },
                    ],
                    clubMemberships: [
                      { id: 1, club: { id: 2, name: "Sučany" } },
                    ],
                  },
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
 * Handler: GET /api/users/me
 *
 * Retrieves the authenticated user's profile including supervisors and club memberships.
 *
 * Returns:
 *  - { success: boolean, statusCode: number, data: { id:number, name:string, email:string, supervisors: Array, clubMemberships: Array } }
 */
export default defineEventHandler(async (event) => {
  const user = await useAuth(event);

  const data = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      supervisors: true,
      clubMemberships: {
        with: { club: true },
      },
    },
  });

  return {
    success: true,
    statusCode: 200,
    data,
  };
});
