import { db } from "#server/db";
import { sql } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["Users"],
    summary: "Get user",
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
        description:
          "The requested user (schema varies based on viewer permissions)",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                user: {
                  type: "object",
                  oneOf: [
                    // Standard public profile
                    {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 1 },
                        name: { type: "string", example: "John" },
                        surname: { type: "string", example: "Doe" },
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
                        credential: { type: "integer", example: 0 },
                        isMember: { type: "boolean", example: true },
                      },
                      required: [
                        "id",
                        "name",
                        "surname",
                        "role",
                        "image",
                        "credential",
                        "isMember",
                      ],
                    },
                    // Club manager view (includes email)
                    {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 1 },
                        name: { type: "string", example: "John" },
                        surname: { type: "string", example: "Doe" },
                        email: {
                          type: "string",
                          format: "email",
                          example: "john.doe@example.com",
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
                        credential: { type: "integer", example: 0 },
                        isMember: { type: "boolean", example: true },
                      },
                      required: [
                        "id",
                        "name",
                        "surname",
                        "email",
                        "role",
                        "image",
                        "credential",
                        "isMember",
                      ],
                    },
                    // Full admin/organizer view (all fields)
                    {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 1 },
                        email: {
                          type: "string",
                          format: "email",
                          example: "john.doe@example.com",
                        },
                        name: { type: "string", example: "John" },
                        surname: { type: "string", example: "Doe" },
                        search: { type: "string", example: "johndoe" },
                        emailVerified: { type: "boolean", example: true },
                        image: {
                          type: "string",
                          nullable: true,
                          example: "https://example.com/avatar.jpg",
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
                        birthDate: {
                          type: "string",
                          format: "date",
                          nullable: true,
                          example: "1997-04-03",
                        },
                        street: {
                          type: "string",
                          nullable: true,
                          example: "Miloša Uhra 127",
                        },
                        postalCode: {
                          type: "string",
                          nullable: true,
                          example: "91624",
                        },
                        town: {
                          type: "string",
                          nullable: true,
                          example: "Horná Streda",
                        },
                        phone: {
                          type: "string",
                          nullable: true,
                          example: "+4213567890",
                        },
                        credential: { type: "integer", example: 0 },
                        claims: {
                          type: "object",
                          nullable: true,
                          additionalProperties: true,
                          example: {},
                        },
                        banned: {
                          type: "boolean",
                          nullable: true,
                          example: false,
                        },
                        banReason: {
                          type: "string",
                          nullable: true,
                          example: null,
                        },
                        banExpires: {
                          type: "string",
                          format: "date-time",
                          nullable: true,
                          example: null,
                        },
                        isMember: {
                          type: "boolean",
                          example: true,
                        },
                        legalGuardian: {
                          type: "object",
                          nullable: true,
                          properties: {
                            id: { type: "integer", example: 1 },
                            name: { type: "string", example: "Jane Doe" },
                            email: {
                              type: "string",
                              format: "email",
                              example: "jane.doe@example.com",
                            },
                            createdAt: {
                              type: "string",
                              format: "date-time",
                              example: "2026-01-01T00:00:00.000Z",
                            },
                            updatedAt: {
                              type: "string",
                              format: "date-time",
                              example: "2026-01-01T00:00:00.000Z",
                            },
                          },
                          required: [
                            "id",
                            "name",
                            "email",
                            "createdAt",
                            "updatedAt",
                          ],
                        },
                        createdAt: {
                          type: "string",
                          format: "date-time",
                          example: "2026-01-01T00:00:00.000Z",
                        },
                        updatedAt: {
                          type: "string",
                          format: "date-time",
                          example: "2026-01-01T00:00:00.000Z",
                        },
                      },
                      required: [
                        "id",
                        "email",
                        "name",
                        "surname",
                        "search",
                        "emailVerified",
                        "role",
                        "credential",
                        "isMember",
                        "legalGuardian",
                        "createdAt",
                        "updatedAt",
                      ],
                    },
                  ],
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
  },
});

const checkUserNotFound = (user: unknown) => {
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

  const isMemberExtra = {
    isMember: sql`exists (select 1 from club_memberships where user_id = ${userId} and season = extract(year from current_date) and confirmed = true)`,
  };

  // Privileged roles see full profile data including legal guardian
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
      extras: isMemberExtra,
      with: {
        legalGuardian: true,
      },
    });

    checkUserNotFound(userData);
    return { user: userData };
  }

  // Club managers see contact details (email) for members of their club
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
        credential: true,
      },
      extras: isMemberExtra,
      where: {
        id: userId,
      },
    });

    checkUserNotFound(userData);
    return { user: userData };
  }

  // Standard public profile view
  const userData = await db.query.users.findFirst({
    columns: {
      id: true,
      name: true,
      surname: true,
      role: true,
      image: true,
      credential: true,
    },
    extras: isMemberExtra,
    where: {
      id: userId,
    },
  });

  checkUserNotFound(userData);
  return { user: userData };
});
