import { db } from "~~/server/db/db";
import * as z from "zod";
import { clubs } from "~~/server/db/schema/clubs";
import useSearch from "#shared/utils/use-search";
import { eq } from "drizzle-orm";

const clubSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  league: z.enum(["junior", "senior", "university"]).optional(),
  region: z.enum(["east", "west", "central"]).optional(),
});

defineRouteMeta({
  openAPI: {
    description: "Update club details.",
    tags: ["Clubs"],
    parameters: [
      {
        in: "path",
        name: "id",
        required: true,
        schema: { type: "integer" },
        description: "Club identifier.",
      },
    ],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              isActive: { type: "boolean" },
              league: {
                type: "string",
                enum: ["junior", "senior", "university"],
              },
              region: { type: "string", enum: ["east", "west", "central"] },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Club updated. Returns the updated club object(s).",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                statusCode: { type: "number" },
                data: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      name: { type: "string" },
                      description: { type: "string" },
                      isActive: { type: "boolean" },
                      league: {
                        type: "string",
                        enum: ["junior", "senior", "university"],
                      },
                      region: {
                        type: "string",
                        enum: ["east", "west", "central"],
                      },
                    },
                    required: ["id", "name"],
                  },
                },
              },
            },
            examples: {
              success: {
                value: {
                  success: true,
                  statusCode: 200,
                  data: [
                    {
                      id: 1,
                      name: "Sučany",
                      description:
                        "The oldest and the most successful debate club in Slovakia",
                      isActive: true,
                      league: "senior",
                      region: "central",
                    },
                  ],
                },
              },
            },
          },
        },
      },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      404: { description: "Club not found" },
    },
  },
});

/**
 * Handler: PATCH /api/clubs/{id}
 *
 * Requires admin/developer role and updates the specified club using any provided fields from the request body.
 *
 * Returns:
 *  - { success: boolean, statusCode: number, data: object[] } (updated club object(s))
 */
export default defineEventHandler(async (event) => {
  await useAuth(event, ["admin", "developer"]);

  const body = await readValidatedBody(event, (body) => clubSchema.parse(body));
  const id = Number.parseInt(event.context.params?.id as string);

  const data = await db
    .update(clubs)
    .set({
      ...body,
      ...(body.name ? { search: useSearch(body.name) } : {}),
    })
    .where(eq(clubs.id, id))
    .returning();

  return { success: true, statusCode: 200, data };
});
