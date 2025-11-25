import { db } from "~~/server/db/db";
import * as z from "zod";
import { supervisors } from "~~/server/db/schema/auth";

const supervisorSchema = z.object({
  name: z.string(),
  email: z.email(),
});

defineRouteMeta({
  openAPI: {
    description: "Create a new supervisor for the authenticated user.",
    tags: ["Users", "Supervisors"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["name", "email"],
            properties: {
              name: { type: "string" },
              email: { type: "string", format: "email" },
            },
          },
          examples: {
            create: {
              value: { name: "John Doe", email: "john@example.com" },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: "Supervisor created. Returns inserted id(s).",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                statusCode: { type: "number" },
                data: {
                  type: "array",
                  items: { type: "number" },
                },
              },
            },
            examples: {
              success: {
                value: { success: true, statusCode: 201, data: [1] },
              },
            },
          },
        },
      },
      400: {
        description: "Validation error",
      },
      401: {
        description: "Unauthorized",
      },
    },
  },
});

/**
 * Handler: POST /api/users/me/supervisors
 *
 * Creates a new supervisor for the authenticated user.
 *
 * Request body:
 *  - { name: string, email: string }
 *
 * Returns:
 *  - { success: boolean, statusCode: number, data: number[] } (inserted id(s))
 */
export default defineEventHandler(async (event) => {
  const user = await useAuth(event);
  const body = await readValidatedBody(event, (body) =>
    supervisorSchema.parse(body),
  );

  const data = await db
    .insert(supervisors)
    .values({ ...body, userId: user.id })
    .$returningId();

  return { success: true, statusCode: 201, data };
});
