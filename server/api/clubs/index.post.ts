import { db } from "~~/server/db/db";
import * as z from "zod";
import { clubs } from "~~/server/db/schema/clubs";
import useSearch from "#shared/utils/use-search";

const clubSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  league: z
    .enum(["junior", "senior", "university"])
    .optional()
    .default("senior"),
  region: z.enum(["east", "west", "central"]).optional().default("central"),
});

defineRouteMeta({
  openAPI: {
    description: "Create a new club.",
    tags: ["Clubs"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["name"],
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
          examples: {
            create: {
              value: {
                name: "Sučany",
                description:
                  "The oldest and the most successful debate club in Slovakia",
                isActive: true,
                league: "senior",
                region: "central",
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: "Club created. Returns inserted id(s).",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                statusCode: { type: "number" },
                data: { type: "array", items: { type: "number" } },
              },
            },
            examples: {
              success: {
                value: { success: true, statusCode: 201, data: { id: 1 } },
              },
            },
          },
        },
      },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
    },
  },
});

/**
 * Handler: POST /api/clubs
 *
 * Creates a new club (admin/developer).
 *
 * Request body:
 *  - { name: string, description?: string, isActive?: boolean, league?: 'junior'|'senior', region?: 'east'|'west'|'central' }
 *
 * Returns:
 *  - { success: boolean, statusCode: number, data: number[] } (inserted id(s))
 */
export default defineEventHandler(async (event) => {
  await useAuth(event, ["admin", "developer"]);

  const body = await readValidatedBody(event, (body) => clubSchema.parse(body));

  const data = await db
    .insert(clubs)
    .values({ ...body, search: useSearch(body.name) })
    .$returningId();

  return { success: true, statusCode: 201, data: data[0] };
});
