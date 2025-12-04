import { db } from "~~/server/db/db";
import { users } from "~~/server/db/schema/auth";
import { eq } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    description:
      "Get the authenticated user's profile including supervisors, club memberships and linked accounts.",
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
                  type: ["object", "null"],
                  properties: {
                    id: { type: "number" },
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    supervisors: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          email: { type: "string", format: "email" },
                        },
                        required: ["name", "email"],
                      },
                    },
                    clubMemberships: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          season: { type: "string" },
                          confirmed: { type: "boolean" },
                          club: {
                            type: "object",
                            properties: {
                              id: { type: "number" },
                              name: { type: "string" },
                            },
                            required: ["id", "name"],
                          },
                        },
                        required: ["season", "confirmed", "club"],
                      },
                    },
                    clubManagements: {
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
                            required: ["id", "name"],
                          },
                        },
                        required: ["id", "club"],
                      },
                    },
                    accounts: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          providerId: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
              required: ["success", "statusCode", "data"],
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
                      { name: "John Doe", email: "john@example.com" },
                    ],
                    clubMemberships: [
                      {
                        season: "2024",
                        confirmed: true,
                        club: { id: 2, name: "Sučany" },
                      },
                    ],
                    clubManagements: [
                      {
                        id: 10,
                        club: { id: 2, name: "Sučany" },
                      },
                    ],
                    accounts: [{ providerId: "github|12345" }],
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
 * Retrieves the authenticated user's profile including:
 *  - supervisors: Array<{ name: string, email: string }>
 *  - clubMemberships: Array<{ season: string, confirmed: boolean, club: { id: number, name: string } }>
 *  - accounts: Array<{ providerId: string }>
 *
 * Returns:
 *  { success: boolean, statusCode: number, data: { id: number, name: string, email: string, supervisors: Array, clubMemberships: Array, accounts: Array } | null }
 */
export default defineEventHandler(async (event) => {
  const user = await useAuth(event);

  const data = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      supervisors: {
        columns: { name: true, email: true },
      },
      clubMemberships: {
        with: { club: { columns: { id: true, name: true } } },
        columns: {
          season: true,
          confirmed: true,
        },
      },
      clubManagements: {
        with: { club: { columns: { id: true, name: true } } },
        columns: {
          id: true,
        },
      },
      accounts: {
        columns: { providerId: true },
      },
    },
  });

  return {
    success: true,
    statusCode: 200,
    data,
  };
});
