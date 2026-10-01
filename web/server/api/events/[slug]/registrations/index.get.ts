import { db } from "#server/db";
import { requireUser } from "#server/utils/auth";

defineRouteMeta({
  openAPI: {
    tags: ["Events"],
    summary: "Get event registrations",
    description:
      "Fetch all registrations for a specific event including participant and payment details.",
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "The slug of the event",
      },
    ],
    responses: {
      200: {
        description: "List of event registrations",
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
                event: {
                  type: "object",
                  additionalProperties: true,
                },
              },
              required: ["registrations", "event"],
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
        description: "Event not found",
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
  await requireUser(event, [
    "developer",
    "admin",
    "chief_adjudicator",
    "organizer",
    "junior_organizer",
  ]);

  const slug = getRouterParam(event, "slug") ?? "";

  const eventRecord = await db.query.events.findFirst({
    where: { slug },
  });

  if (!eventRecord) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `Event with slug "${slug}" not found`,
    });
  }

  const registrations = await db.query.eventRegistrations.findMany({
    where: {
      eventId: eventRecord.id,
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          surname: true,
          email: true,
          phone: true,
          birthDate: true,
          image: true,
          role: true,
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

  return {
    event: eventRecord,
    registrations,
  };
});
