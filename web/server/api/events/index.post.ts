import { db } from "#server/db";
import { eventOrganizers, events } from "#server/db/schema/events";
import { insertEventSchema } from "#server/utils/events";

defineRouteMeta({
  openAPI: {
    tags: ["Events"],
    summary: "Create event",
    description: "Create a new event and optionally assign organizers.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/EventInput",
          },
        },
      },
    },
    responses: {
      201: {
        description: "The created event",
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
          EventInput: {
            type: "object",
            properties: {
              slug: { type: "string", example: "dnju26" },
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
              featuredProperties: { type: "array", items: { type: "object" } },
              schedule: { type: "object" },
              registrationConfig: { type: "object" },
              organizers: {
                type: "array",
                items: { type: "integer" },
                default: [],
              },
            },
            required: [
              "slug",
              "name",
              "type",
              "description",
              "fileUrls",
              "beginning",
              "end",
              "schedule",
              "registrationConfig",
            ],
          },
          EventDetail: {
            type: "object",
            properties: {
              id: { type: "integer", example: 1 },
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
              featuredProperties: { type: "array", items: { type: "object" } },
              schedule: { type: "object" },
              registrationConfig: { type: "object" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
              organizers: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    name: { type: "string" },
                    surname: { type: "string" },
                    role: { type: "string" },
                    email: { type: "string", format: "email" },
                    phone: { type: "string", nullable: true },
                  },
                },
              },
            },
            required: [
              "id",
              "slug",
              "name",
              "type",
              "description",
              "fileUrls",
              "beginning",
              "end",
              "schedule",
              "registrationConfig",
            ],
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

  const body = await readValidatedBody(event, insertEventSchema.parse);
  const { organizers, ...eventData } = body;

  const createdEvent = await db.transaction(async (tx) => {
    const newEvent = await tx.insert(events).values(eventData).returning();

    if (!newEvent[0]) {
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: "Failed to create event",
      });
    }

    await tx.insert(eventOrganizers).values(
      organizers.map((id) => ({
        eventId: newEvent[0]!.id,
        userId: id,
      })),
    );

    return newEvent[0];
  });

  return { event: createdEvent };
});
