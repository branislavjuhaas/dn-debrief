import { db } from "#server/db";
import { eventOrganizers, events } from "#server/db/schema/events";
import { eq } from "drizzle-orm";
import { updateEventSchema } from "#shared/utils/events";

defineRouteMeta({
  openAPI: {
    tags: ["Events"],
    summary: "Update event",
    description: "Update an existing event including details and organizers.",
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
            $ref: "#/components/schemas/EventUpdate",
          },
        },
      },
    },
    responses: {
      200: {
        description: "The updated event",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                event: { $ref: "#/components/schemas/EventDetail" },
              },
              required: ["event"],
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
    $global: {
      components: {
        schemas: {
          EventUpdate: {
            type: "object",
            properties: {
              slug: { type: "string", example: "dnju-open-2026" },
              name: { type: "string", example: "DNJU Open 2026" },
              type: {
                type: "string",
                enum: ["tournament", "workshop", "other"],
              },
              description: { type: "string" },
              thumbnailUrl: { type: "string", format: "uri", nullable: true },
              beginning: { type: "string", format: "date-time" },
              end: { type: "string", format: "date-time" },
              targetLeague: {
                type: "string",
                nullable: true,
                enum: ["junior", "senior", "university"],
              },
              targetRegion: {
                type: "string",
                nullable: true,
                enum: ["western", "central", "eastern"],
              },
              place: { type: "string" },
              address: { type: "string" },
              motion: { type: "object" },
              schedule: {
                type: "object",
                additionalProperties: true,
              },
              registrationConfig: {
                type: "object",
                additionalProperties: true,
              },
              organizers: {
                type: "array",
                items: { type: "integer" },
              },
            },
          },
          EventDetail: {
            type: "object",
            properties: {
              id: { type: "integer" },
              slug: { type: "string" },
              name: { type: "string" },
              type: { type: "string" },
              description: { type: "string" },
              thumbnailUrl: { type: "string", format: "uri", nullable: true },
              beginning: { type: "string", format: "date-time" },
              end: { type: "string", format: "date-time" },
              targetLeague: { type: "string", nullable: true },
              targetRegion: { type: "string", nullable: true },
              place: { type: "string" },
              address: { type: "string", nullable: true },
              motion: { type: "object" },
              schedule: { type: "object" },
              registrationConfig: { type: "object" },
            },
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

  const body = await readValidatedBody(event, (b) =>
    updateEventSchema.parse(b),
  );

  const existingEvent = await db.query.events.findFirst({
    where: { slug },
    columns: { id: true },
  });

  if (!existingEvent) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `Event with slug "${slug}" not found`,
    });
  }

  const { organizers, ...eventData } = body;

  const updatedEvent = await db.transaction(async (tx) => {
    let updated;
    if (Object.keys(eventData).length > 0) {
      const [res] = await tx
        .update(events)
        .set(eventData)
        .where(eq(events.id, existingEvent.id))
        .returning();
      updated = res;
    } else {
      updated = await tx.query.events.findFirst({
        where: { id: existingEvent.id },
      });
    }

    if (organizers !== undefined) {
      await tx
        .delete(eventOrganizers)
        .where(eq(eventOrganizers.eventId, existingEvent.id));

      if (organizers.length > 0) {
        await tx.insert(eventOrganizers).values(
          organizers.map((userId) => ({
            eventId: existingEvent.id,
            userId,
          })),
        );
      }
    }

    return updated;
  });

  return { event: updatedEvent };
});
