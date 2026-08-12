import { db } from "#server/db";

defineRouteMeta({
  openAPI: {
    tags: ["Clubs"],
    summary: "List club members",
    description: "Get members of a specific club for the current season.",
    parameters: [
      {
        name: "clubId",
        in: "path",
        required: true,
        description: "The ID of the club",
        schema: {
          type: "integer",
        },
      },
    ],
    responses: {
      200: {
        description: "List of club members for the current season",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                memberships: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "integer" },
                          name: { type: "string" },
                          surname: { type: "string" },
                          email: { type: "string" },
                          role: {
                            type: "string",
                            enum: [
                              "user",
                              "organizer",
                              "junior_organizer",
                              "chief_adjudicator",
                              "motion_committee_member",
                              "admin",
                              "developer",
                            ],
                          },
                          image: { type: ["string", "null"] },
                        },
                      },
                      confirmed: { type: "boolean" },
                      registrationType: {
                        type: "string",
                        enum: [
                          "junior_student",
                          "senior_student",
                          "graduate",
                          "teacher",
                        ],
                      },
                    },
                  },
                },
              },
              required: ["memberships"],
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
      403: {
        description: "Forbidden",
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
  const user = await requireUser(event);
  const clubId = Number.parseInt(getRouterParam(event, "clubId") ?? "", 10);

  // Check if the user is a developer or admin, or if they are the club manager
  if (!["developer", "admin"].includes(user.role)) {
    const clubManager = await db.query.clubManagers.findFirst({
      where: {
        clubId: clubId,
        userId: user.id,
      },
    });

    if (!clubManager) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "You do not have permission to view members of this club.",
      });
    }
  }

  const currentSeason = new Date().getFullYear();

  const memberships = await db.query.clubMemberships.findMany({
    columns: {
      confirmed: true,
      registrationType: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          surname: true,
          email: true,
          role: true,
          image: true,
        },
      },
    },
    where: {
      clubId: clubId,
      season: currentSeason,
    },
  });

  return { memberships };
});
