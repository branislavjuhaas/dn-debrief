import { db } from "~~/server/db/db";
import { ilike } from "drizzle-orm";
import * as z from "zod";
import { clubs } from "~~/server/db/schema/clubs";
import { events } from "~~/server/db/schema/events";
import { users } from "~~/server/db/schema/auth";

const searchQuerySchema = z.object({
  term: z.string(),
  users: z.preprocess((val) => {
    if (val === undefined) return true;
    if (typeof val === "string") {
      if (val === "true") return true;
      if (val === "false") return false;
    }
    return val;
  }, z.boolean()),
  clubs: z.preprocess((val) => {
    if (val === undefined) return true;
    if (typeof val === "string") {
      if (val === "true") return true;
      if (val === "false") return false;
    }
    return val;
  }, z.boolean()),
  events: z.preprocess((val) => {
    if (val === undefined) return true;
    if (typeof val === "string") {
      if (val === "true") return true;
      if (val === "false") return false;
    }
    return val;
  }, z.boolean()),
});

defineRouteMeta({
  openAPI: {
    description:
      "Searches users, clubs and events by a free-text term. Only accessible to admin and developer roles.",
    tags: ["Search"],
    parameters: [
      {
        in: "query",
        name: "term",
        required: true,
        schema: { type: "string" },
        description: "Search term (free text).",
      },
      {
        in: "query",
        name: "users",
        required: false,
        schema: { type: "boolean", default: true },
        description:
          "Include user results when true. If omitted the endpoint behaves as if true.",
      },
      {
        in: "query",
        name: "clubs",
        required: false,
        schema: { type: "boolean", default: true },
        description:
          "Include club results when true. If omitted the endpoint behaves as if true.",
      },
      {
        in: "query",
        name: "events",
        required: false,
        schema: { type: "boolean", default: true },
        description:
          "Include event results when true. If omitted the endpoint behaves as if true.",
      },
    ],
    responses: {
      200: {
        description: "Search completed successfully.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                statusCode: { type: "integer" },
                data: {
                  type: "object",
                  properties: {
                    users: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          surname: { type: "string" },
                          role: { type: "string" },
                          image: { type: "string", nullable: true },
                        },
                      },
                    },
                    clubs: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                        },
                      },
                    },
                    events: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          season: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
              required: ["success", "statusCode", "data"],
            },
          },
        },
      },
      400: {
        description: "Bad Request — validation error.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                statusCode: { type: "integer" },
                message: { type: "string" },
                errors: { type: "array", items: { type: "object" } },
              },
              required: ["success", "statusCode", "message"],
            },
          },
        },
      },
      401: {
        description: "Unauthorized. Endpoint requires admin or developer role.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                statusCode: { type: "integer" },
                message: { type: "string" },
              },
              required: ["success", "statusCode", "message"],
            },
          },
        },
      },
    },
  },
});

/**
 * Handler: GET /api/search
 *
 * Performs a simple full-text search across users, clubs and events.
 * Query params:
 *  - term: string (required)
 *  - users?: boolean
 *  - clubs?: boolean
 *  - events?: boolean
 *
 * Access: admin, developer
 */

export default defineEventHandler(async (event) => {
  await useAuth(event, ["admin", "developer"]);

  // Normalize query parameters.
  const query = await getValidatedQuery(event, (data) =>
    searchQuerySchema.parse(data),
  );

  const term = `%${useSearch(query.term)}%`;

  const usersData = query.users
    ? await db
        .select({
          id: users.id,
          name: users.name,
          surname: users.surname,
          role: users.role,
          image: users.image,
        })
        .from(users)
        .where(ilike(users.search, term))
        .limit(10)
    : undefined;

  const clubsData = query.clubs
    ? await db
        .select({
          id: clubs.id,
          name: clubs.name,
        })
        .from(clubs)
        .where(ilike(clubs.search, term))
        .limit(10)
    : undefined;

  const eventsData = query.events
    ? await db
        .select({
          id: events.id,
          name: events.name,
          season: events.season,
        })
        .from(events)
        .where(ilike(events.search, term))
        .limit(10)
    : undefined;

  return {
    success: true,
    statusCode: 200,
    data: {
      users: usersData,
      clubs: clubsData,
      events: eventsData,
    },
  };
});
