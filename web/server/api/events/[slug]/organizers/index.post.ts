import { db } from "#server/db";
import { eventOrganizers } from "#server/db/schema/events";
import * as z from "zod";

defineRouteMeta({
  openAPI: {
    tags: ["Events"],
    summary: "Add event organizer",
    description: "Add a user as an organizer for an event.",
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "The slug of the event to update",
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              userId: { type: "integer", example: 12 },
            },
            required: ["userId"],
          },
        },
      },
    },
    responses: {
      201: {
        description: "The organizer was added successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                organizer: {
                  type: "object",
                  properties: {
                    eventId: { type: "integer" },
                    userId: { type: "integer" },
                  },
                  required: ["eventId", "userId"],
                },
              },
              required: ["organizer"],
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
        description: "Event or user not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      409: {
        description: "Organizer already assigned",
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

const organizerBodySchema = z.object({
  userId: z.number().int().positive(),
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
  const { userId } = await readValidatedBody(event, organizerBodySchema.parse);

  const eventRecord = await db.query.events.findFirst({
    where: { slug },
    columns: { id: true },
  });

  if (!eventRecord) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `Event with slug "${slug}" not found`,
    });
  }

  const user = await db.query.users.findFirst({
    where: { id: userId },
    columns: { id: true },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `User with id ${userId} not found`,
    });
  }

  const existingOrganizer = await db.query.eventOrganizers.findFirst({
    where: {
      eventId: eventRecord.id,
      userId,
    },
  });

  if (existingOrganizer) {
    throw createError({
      statusCode: 409,
      statusMessage: "Conflict",
      message: "User is already an organizer for this event",
    });
  }

  const [createdOrganizer] = await db
    .insert(eventOrganizers)
    .values({
      eventId: eventRecord.id,
      userId,
    })
    .returning();

  setResponseStatus(event, 201);

  return { organizer: createdOrganizer };
});
