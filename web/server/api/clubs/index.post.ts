import { db } from "#server/db";
import { createInsertSchema } from "drizzle-orm/zod";
import { clubs } from "#server/db/schema/clubs";

defineRouteMeta({
  openAPI: {
    tags: ["Clubs"],
    summary: "Create club",
    description: "Create a new club",
    requestBody: {
      description: "The club to create",
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Club",
          },
        },
      },
    },
    responses: {
      201: {
        description: "The created club",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                club: {
                  type: "object",
                  allOf: [
                    { $ref: "#/components/schemas/Club" },
                    {
                      type: "object",
                      properties: {
                        membershipsCount: { type: "number" },
                      },
                    },
                  ],
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
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      403: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
    },
  },
});

const bodySchema = createInsertSchema(clubs);

export default defineEventHandler(async (event) => {
  // Authentication & parameter resolution
  await requireUser(event, ["developer", "admin"]);

  // Validate request body
  const body = await readValidatedBody(event, bodySchema.parse);

  const insertedClub = await db.insert(clubs).values(body).returning();

  setResponseStatus(event, 201);
  return { club: insertedClub[0] };
});
