import { db } from "~~/server/db/db";
import * as z from "zod";
import { clubMemberships, clubs } from "~~/server/db/schema/clubs";
import { eq } from "drizzle-orm";
import { deobfuscate } from "#shared/utils/obfuscation";

const confirmSchema = z.object({
  token: z.pipe(
    z.string(),
    z.preprocess((val) => Number.parseInt(val as string), z.number()),
  ),
});

defineRouteMeta({
  openAPI: {
    description: "Confirms a pending club membership using a supervisor token.",
    tags: ["Clubs", "Memberships"],
    parameters: [
      {
        in: "query",
        name: "token",
        required: true,
        schema: { type: "string" },
        description: "Opaque confirmation token delivered via email.",
      },
    ],
    responses: {
      201: {
        description:
          "Membership confirmed. Response echoes the update statement metadata.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                statusCode: { type: "integer" },
                data: { type: "object" },
              },
              required: ["success", "statusCode", "data"],
            },
          },
        },
      },
      400: { description: "Malformed token supplied." },
      404: { description: "Membership to confirm not found." },
    },
  },
});

/**
 * Handler: POST /api/clubs/:id/memberships/confirm
 *
 * Accepts an obfuscated `token` query parameter sent to supervisors and
 * marks all associated memberships as confirmed for that user.
 *
 * Query params:
 *  - token: string (required) – obfuscated user identifier.
 *
 * Returns:
 *  - { success: boolean, statusCode: number, data: UpdateResult }
 */
export default defineEventHandler(async (event) => {
  // Validate and deobfuscate the confirmation token.
  const query = await getValidatedQuery(event, (data) =>
    confirmSchema.parse(data),
  );

  // Apply confirmation flag to every membership owned by the token’s user.
  const data = db
    .update(clubMemberships)
    .set({ confirmed: true })
    .where(eq(clubMemberships.userId, deobfuscate(query.token)));

  return { success: true, statusCode: 201, data };
});
