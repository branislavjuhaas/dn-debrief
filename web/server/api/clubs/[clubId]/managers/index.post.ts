import * as z from "zod";
import { db } from "#server/db";
import { clubManagers } from "#server/db/schema/clubs";

defineRouteMeta({
  openAPI: {
    tags: ["Club Managers"],
    summary: "Add club manager",
    description: "Add a club manager",
    parameters: [
      {
        name: "clubId",
        in: "path",
        required: true,
        description: "The ID of the club to modify",
        schema: {
          type: "integer",
        },
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              userId: {
                type: "integer",
                description: "The ID of the user to add as a manager",
              },
            },
            required: ["userId"],
          },
        },
      },
    },
    responses: {
      201: {
        description: "The created manager record",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                manager: {
                  $ref: "#/components/schemas/Manager",
                },
              },
              required: ["manager"],
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

const managerSchema = z.object({
  userId: z.number(),
});

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const clubId = Number.parseInt(getRouterParam(event, "clubId") ?? "", 10);
  const { userId } = await readValidatedBody(event, managerSchema.parse);

  if (!["developer", "admin"].includes(user.role)) {
    // Current user must be a club manager of the given club to add another
    // manager. The user to be added as a manager must be a member of that club
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
        message: "Developer, admin or club manager privileges required",
      });
    }

    const userMembership = await db.query.clubMemberships.findFirst({
      where: {
        clubId: clubId,
        userId: userId,
      },
    });

    if (!userMembership) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message:
          "The user must be a member of the club to be added as a manager",
      });
    }
  }

  const newManager = await db
    .insert(clubManagers)
    .values({
      clubId: clubId,
      userId: userId,
    })
    .returning();

  setResponseStatus(event, 201);
  return { manager: newManager[0] };
});
