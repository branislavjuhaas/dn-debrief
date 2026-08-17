import { db } from "#server/db";

defineRouteMeta({
  openAPI: {
    tags: ["Events"],
    summary: "Get event",
    description:
      "Fetch a single event by its slug, including organizer details.",
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "The slug of the event to fetch",
      },
    ],
    responses: {
      200: {
        description: "The event details",
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
              featuredProperties: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    icon: { type: "string" },
                    text: { type: "string" },
                    badge: {
                      type: "object",
                      properties: {
                        text: { type: "string" },
                        href: { type: "string", format: "uri" },
                      },
                    },
                  },
                  required: ["icon", "text"],
                },
              },
              schedule: {
                type: "object",
                properties: {
                  days: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        date: { type: "string", format: "date" },
                        schedule: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              beginning: { type: "integer" },
                              duration: { type: "integer" },
                              text: { type: "string" },
                            },
                            required: ["beginning", "duration", "text"],
                          },
                        },
                      },
                      required: ["date", "schedule"],
                    },
                  },
                },
                required: ["days"],
              },
              registrationConfig: {
                type: "object",
                additionalProperties: true,
              },
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
  const slug = getRouterParam(event, "slug") ?? "";

  const eventData = await db.query.events.findFirst({
    where: {
      slug: slug,
    },
    with: {
      organizers: {
        columns: {
          id: true,
          name: true,
          surname: true,
          role: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!eventData) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `Event with slug "${slug}" not found`,
    });
  }

  return { event: eventData };
});
