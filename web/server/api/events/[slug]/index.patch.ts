import { db } from "#server/db";
import { events } from "#server/db/schema/events";
import { eq } from "drizzle-orm";
import { updateEventSchema } from "#server/utils/events";

defineRouteMeta({
  openAPI: {
    tags: ["Events"],
    summary: "Update event",
    description: "Update an existing event without modifying organizers.",
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
              description: { type: "object" },
              fileUrls: {
                type: "array",
                items: { type: "string", format: "uri" },
              },
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
              place: { type: "string", nullable: true },
              featuredProperties: {
                type: "array",
                items: { type: "object", additionalProperties: true },
              },
              schedule: {
                type: "object",
                additionalProperties: true,
              },
              registrationConfig: {
                type: "object",
                additionalProperties: true,
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
              description: { type: "object" },
              fileUrls: {
                type: "array",
                items: { type: "string", format: "uri" },
              },
              thumbnailUrl: { type: "string", format: "uri", nullable: true },
              beginning: { type: "string", format: "date-time" },
              end: { type: "string", format: "date-time" },
              targetLeague: { type: "string", nullable: true },
              targetRegion: { type: "string", nullable: true },
              place: { type: "string", nullable: true },
              featuredProperties: { type: "array", items: { type: "object" } },
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
  const body = await readValidatedBody(event, updateEventSchema.parse);

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

  const [updatedEvent] = await db
    .update(events)
    .set(body)
    .where(eq(events.id, existingEvent.id))
    .returning();

  return { event: updatedEvent };
});
