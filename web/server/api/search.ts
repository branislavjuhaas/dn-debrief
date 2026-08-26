import { db } from "#server/db";
import { users } from "#server/db/schema/auth";
import { clubs } from "#server/db/schema/clubs";
import { events } from "#server/db/schema/events";
import { like } from "drizzle-orm";
import normalizeString from "#shared/utils/normalize-string";
import * as z from "zod";

defineRouteMeta({
  openAPI: {
    tags: ["Search"],
    summary: "Search content",
    description: "Search users, clubs, and events",
    parameters: [
      {
        name: "q",
        in: "query",
        required: true,
        schema: { type: "string" },
        description: "Search query",
      },
      {
        name: "users",
        in: "query",
        required: false,
        schema: { type: "boolean", default: true },
        description: "Include users in the search results",
      },
      {
        name: "clubs",
        in: "query",
        required: false,
        schema: { type: "boolean", default: true },
        description: "Include clubs in the search results",
      },
      {
        name: "events",
        in: "query",
        required: false,
        schema: { type: "boolean", default: true },
        description: "Include events in the search results",
      },
    ],
    responses: {
      200: {
        description: "Search results",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                users: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer", example: 1 },
                      name: { type: "string", example: "John" },
                      surname: { type: "string", example: "Doe" },
                      role: { type: "string", example: "user" },
                      image: { type: "string", nullable: true, example: null },
                    },
                    required: ["id", "name", "surname", "email", "role"],
                  },
                },
                clubs: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer", example: 1 },
                      name: { type: "string", example: "Sučany" },
                    },
                    required: ["id", "name"],
                  },
                },
                events: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer", example: 1 },
                      name: { type: "string", example: "DNJU Open 2027" },
                    },
                    required: ["id", "name"],
                  },
                },
              },
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

const searchQuery = z.object({
  q: z.string(),
  users: z.stringbool().optional().default(true),
  clubs: z.stringbool().optional().default(true),
  events: z.stringbool().optional().default(true),
});

export default defineEventHandler(async (event) => {
  await requireUser(event);

  const {
    q,
    users: queryUsers,
    clubs: queryClubs,
    events: queryEvents,
  } = await getValidatedQuery(event, searchQuery.parse);

  const normalizedQuery = normalizeString(q);

  const results = {
    users: Array<{
      id: number;
      name: string;
      surname: string;
      role?: string;
      image: string | null;
    }>(),
    clubs: Array<{ id: number; name: string }>(),
    events: Array<{ id: number; name: string }>(),
  };

  if (queryUsers) {
    results.users = await db
      .select({
        id: users.id,
        name: users.name,
        surname: users.surname,
        image: users.image,
        role: users.role,
      })
      .from(users)
      .where(like(users.search, `%${normalizedQuery}%`))
      .limit(10);
  }

  if (queryClubs) {
    results.clubs = await db
      .select({
        id: clubs.id,
        name: clubs.name,
      })
      .from(clubs)
      .where(like(clubs.search, `%${normalizedQuery}%`))
      .limit(10);
  }

  if (queryEvents) {
    results.events = await db
      .select({
        id: events.id,
        name: events.name,
      })
      .from(events)
      .where(like(events.search, `%${normalizedQuery}%`))
      .limit(10);
  }

  return { ...results };
});
