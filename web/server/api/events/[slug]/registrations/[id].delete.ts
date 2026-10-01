import { db } from "#server/db";
import { eventRegistrations } from "#server/db/schema/events";
import { requireUser } from "#server/utils/auth";
import { and, eq } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["Events"],
    summary: "Cancel or remove event registration",
    description: "Remove an existing event registration.",
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "The slug of the event",
      },
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "integer" },
        description: "The ID of the registration to delete",
      },
    ],
    responses: {
      200: {
        description: "Registration deleted successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
              },
              required: ["success"],
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
        description: "Registration not found",
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
  const registrationId = Number.parseInt(getRouterParam(event, "id") ?? "", 10);

  if (Number.isNaN(registrationId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid registration ID",
    });
  }

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

  const deleted = await db
    .delete(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.id, registrationId),
        eq(eventRegistrations.eventId, eventRecord.id),
      ),
    )
    .returning();

  if (deleted.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "Registration not found",
    });
  }

  return {
    success: true,
  };
});
