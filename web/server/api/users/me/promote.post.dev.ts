import { requireUser } from "#server/utils/auth";
import * as z from "zod";
import { db } from "#server/db";
import { users } from "#server/db/schema/auth";
import { eq } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["Users (Dev)"],
    description: "Promote the current user to a new role",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              role: {
                type: "string",
                enum: [
                  "user",
                  "organizer",
                  "junior_organizer",
                  "chief_adjudicator",
                  "motion_committee_member",
                  "admin",
                  "developer",
                ],
              },
            },
            required: ["role"],
          },
        },
      },
    },
    responses: {
      202: {
        description: "The updated user",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                user: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    role: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      404: {
        description: "User not found",
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

const bodySchema = z.object({
  role: z.enum([
    "user",
    "organizer",
    "junior_organizer",
    "chief_adjudicator",
    "motion_committee_member",
    "admin",
    "developer",
  ]),
});

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const { role: userRole } = await readValidatedBody(event, bodySchema.parse);

  const promotedUser = await db
    .update(users)
    .set({ role: userRole })
    .where(eq(users.id, user.id))
    .returning();

  if (promotedUser.length === 0) {
    throw createError({ statusCode: 404, message: "User not found" });
  }

  setResponseStatus(event, 202);
  return { user: promotedUser[0] };
});
