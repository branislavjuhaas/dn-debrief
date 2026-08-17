import { db } from "#server/db";

defineRouteMeta({
  openAPI: {
    tags: ["Events"],
    summary: "List upcoming events",
    description: "Return upcoming events with basic summary data.",
    responses: {
      200: {
        description: "The upcoming events",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                events: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/EventSummary",
                  },
                },
              },
              required: ["events"],
            },
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
          EventSummary: {
            type: "object",
            properties: {
              slug: { type: "string", example: "dnju-open-2026" },
              name: { type: "string", example: "DNJU Open 2026" },
              place: { type: "string", nullable: true, example: "Bratislava" },
              beginning: { type: "string", format: "date-time" },
              end: { type: "string", format: "date-time" },
            },
            required: ["slug", "name", "beginning", "end"],
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (_event) => {
  const events = await db.query.events.findMany({
    columns: {
      slug: true,
      name: true,
      place: true,
      beginning: true,
      end: true,
    },
    where: {
      end: {
        gte: new Date(),
      },
    },
    orderBy: (events, { desc }) => [desc(events.beginning)],
  });

  return { events };
});
