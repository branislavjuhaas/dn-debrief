import { db } from "#server/db";
import { requireUser, resolveUserId } from "#server/utils/auth";

defineRouteMeta({
  openAPI: {
    tags: ["Users", "Events"],
    summary: "Get user event registrations",
    description: "Get all event registrations for a given user.",
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "The ID of the user or 'me'",
      },
    ],
    responses: {
      200: {
        description: "List of user event registrations",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                registrations: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: true,
                  },
                },
              },
              required: ["registrations"],
            },
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      403: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      404: {
        description: "User not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
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

export default defineEventHandler(async (event) => {
  const currentUser = await requireUser(event);
  const targetUserId = await resolveUserId(
    event,
    getRouterParam(event, "userId") ?? "",
  );

  if (!targetUserId) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "User not found",
    });
  }

  const isSelf = currentUser.id === targetUserId;
  const isPrivileged = [
    "developer",
    "admin",
    "chief_adjudicator",
    "organizer",
    "junior_organizer",
  ].includes(currentUser.role);

  if (!isSelf && !isPrivileged) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "You do not have permission to view this user's registrations",
    });
  }

  const userRegistrations = await db.query.eventRegistrations.findMany({
    where: {
      userId: targetUserId,
    },
    with: {
      event: {
        columns: {
          id: true,
          slug: true,
          name: true,
          type: true,
          place: true,
          address: true,
          beginning: true,
          end: true,
          registrationConfig: true,
        },
      },
      payment: {
        columns: {
          id: true,
          status: true,
          amount: true,
          description: true,
          paidAt: true,
        },
      },
    },
    orderBy: (reg, { desc }) => [desc(reg.createdAt)],
  });

  return { registrations: userRegistrations };
});
