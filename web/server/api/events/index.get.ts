import { db } from "#server/db";
import { events as eventsTable } from "#server/db/schema/events";
import { count } from "drizzle-orm";
import { getQuery } from "h3";

defineRouteMeta({
  openAPI: {
    tags: ["Events"],
    summary: "List paginated events",
    description:
      "Return upcoming events with basic summary data and pagination metadata.",
    parameters: [
      {
        name: "page",
        in: "query",
        description: "Page number (1-indexed)",
        required: false,
        schema: { type: "integer", default: 1, minimum: 1 },
      },
      {
        name: "pageSize",
        in: "query",
        description: "Number of items per page",
        required: false,
        schema: { type: "integer", default: 10, minimum: 1, maximum: 100 },
      },
    ],
    responses: {
      200: {
        description: "The upcoming events with pagination metadata",
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
                pagination: {
                  $ref: "#/components/schemas/PaginationMeta",
                },
              },
              required: ["events", "pagination"],
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
              id: { type: "number", example: 1 },
              slug: { type: "string", example: "dnju-open-2026" },
              name: { type: "string", example: "DNJU Open 2026" },
              place: { type: "string", nullable: true, example: "Prague" },
              beginning: { type: "string", format: "date-time" },
              end: { type: "string", format: "date-time" },
              thumbnailUrl: { type: "string", nullable: true },
            },
            required: ["id", "slug", "name", "beginning", "end"],
          },
          PaginationMeta: {
            type: "object",
            properties: {
              page: { type: "integer", example: 1 },
              pageSize: { type: "integer", example: 10 },
              total: { type: "integer", example: 42 },
              totalPages: { type: "integer", example: 5 },
            },
            required: ["page", "pageSize", "total", "totalPages"],
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  // Safe integer parsing with default values and bounds constraints
  const page = Math.max(
    1,
    parseInt(String((query.page as string) || "1"), 10) || 1,
  );
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(String((query.pageSize as string) || "10"), 10) || 10),
  );
  const offset = (page - 1) * pageSize;

  // Execute database query and total count in parallel
  const [eventsList, totalResult] = await Promise.all([
    db.query.events.findMany({
      columns: {
        id: true,
        slug: true,
        name: true,
        type: true,
        place: true,
        beginning: true,
        end: true,
        thumbnailUrl: true,
      },
      orderBy: (events, { desc }) => [desc(events.beginning)],
      limit: pageSize,
      offset,
    }),
    db.select({ total: count() }).from(eventsTable),
  ]);

  const total = totalResult[0]?.total ?? 0;

  return {
    events: eventsList,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
});
