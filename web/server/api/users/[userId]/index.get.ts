import { db } from "#server/db";

defineRouteMeta({
  openAPI: {
    tags: ["Users"],
    description: "Get a user by ID",
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        description: "The ID of the user to retrieve",
        schema: {
          type: "integer",
        },
      },
    ],
    responses: {
      200: {
        description: "The requested user",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                user: {
                  $ref: "#/components/schemas/UserPublic",
                },
              },
              required: ["user"],
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
        description: "User not found",
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
          UserPublic: {
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
                example: "user",
              },
              image: {
                type: "string",
                nullable: true,
                example: "https://example.com/avatar.jpg",
              },
            },
            required: ["id", "name", "surname", "role", "image"],
          },
        },
      },
    },
  },
});

const checkUserNotFound = (user: any) => {
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "User not found",
    });
  }
};

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const userId = Number.parseInt(getRouterParam(event, "userId") ?? "", 10);

  if (
    [
      "organizer",
      "junior_organizer",
      "chief_adjudicator",
      "admin",
      "developer",
    ].includes(user.role)
  ) {
    const userData = await db.query.users.findFirst({
      where: {
        id: userId,
      },
    });

    checkUserNotFound(userData);
    return { user: userData };
  } else {
    // If there is a club where the queried user is a member and the current user
    // is a manager of that club, allow access to the limited queried user's data
    const clubMembership = await db.query.clubMemberships.findFirst({
      where: {
        userId: userId,
        club: {
          managers: {
            id: user.id,
          },
        },
      },
    });

    if (clubMembership) {
      const userData = await db.query.users.findFirst({
        columns: {
          id: true,
          name: true,
          surname: true,
          email: true,
          role: true,
          image: true,
        },
        where: {
          id: userId,
        },
      });

      checkUserNotFound(userData);
      return { user: userData };
    }
  }

  const userData = await db.query.users.findFirst({
    columns: {
      id: true,
      name: true,
      surname: true,
      role: true,
      image: true,
    },
    where: {
      id: userId,
    },
  });

  checkUserNotFound(userData);
  return { user: userData };
});
