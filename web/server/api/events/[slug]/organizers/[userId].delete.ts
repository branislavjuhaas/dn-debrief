import { db } from "#server/db";
import { eventOrganizers } from "#server/db/schema/events";
import { and, eq } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["Events"],
    summary: "Remove event organizer",
    description: "Remove a user from the organizers list for an event.",
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "The slug of the event to update",
      },
      {
        name: "userId",
        in: "path",
        required: true,
        schema: { type: "integer" },
        description: "The user ID to remove as organizer",
      },
    ],
    responses: {
      204: {
        description: "Organizer removed successfully",
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
        description: "Event or organizer not found",
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
  const userId = Number.parseInt(getRouterParam(event, "userId") ?? "", 10);

  const eventRecord = await db.query.events.findFirst({
    columns: { id: true },
    where: { slug: slug },
  });

  if (!eventRecord) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `Event with slug "${slug}" not found`,
    });
  }

  const removed = await db
    .delete(eventOrganizers)
    .where(
      and(
        eq(eventOrganizers.eventId, eventRecord.id),
        eq(eventOrganizers.userId, userId),
      ),
    )
    .returning();

  if (!removed[0]) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `Organizer with userId ${userId} not found for event "${slug}"`,
    });
  }

  setResponseStatus(event, 204);
});
