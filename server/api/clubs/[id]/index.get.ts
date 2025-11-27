import { db } from "~~/server/db/db";
import * as z from "zod";
import { clubMemberships, clubs } from "~~/server/db/schema/clubs";
import { eq } from "drizzle-orm";

const clubQuerySchema = z.object({
  memberships: z.pipe(
    z.string().optional(),
    z.preprocess((val) => val === "true", z.boolean().optional()),
  ),
});

defineRouteMeta({
  openAPI: {
    description:
      "Fetches club details and optionally includes current season memberships.",
    tags: ["Clubs"],
    parameters: [
      {
        in: "path",
        name: "id",
        required: true,
        schema: { type: "integer" },
        description: "Club identifier.",
      },
      {
        in: "query",
        name: "memberships",
        required: false,
        schema: { type: "boolean" },
        description:
          "When true, embeds confirmed memberships for the active season.",
      },
    ],
    responses: {
      200: {
        description: "Club data returned.",
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
      401: {
        description: "Unauthorized access (not admin/developer/manager).",
      },
      404: { description: "Club not found." },
    },
  },
});

/**
 * Handler: GET /api/clubs/:id
 *
 * Returns club metadata and, optionally, the current season’s memberships
 * when `memberships=true` is provided. Access is limited to admins, developers,
 * or club managers.
 *
 * Query params:
 *  - memberships?: boolean
 *
 * Returns:
 *  - { success: boolean, statusCode: number, data: Club | null }
 */
export default defineEventHandler(async (event) => {
  const user = await useAuth(event);

  // Normalize query + path parameters.
  const query = await getValidatedQuery(event, (data) =>
    clubQuerySchema.parse(data),
  );
  const id = Number.parseInt(event.context.params?.id as string);

  // Conditionally include memberships based on the query flag.
  const data = query.memberships
    ? await db.query.clubs.findFirst({
        where: eq(clubs.id, id),
        with: {
          managers: {
            columns: {
              userId: true,
            },
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          memberships: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  image: true,
                },
              },
            },
            columns: {
              confirmed: true,
            },
            where: eq(
              clubMemberships.season,
              new Date().getFullYear().toString(),
            ),
          },
        },
      })
    : await db.query.clubs.findFirst({
        where: eq(clubs.id, id),
        with: {
          managers: {
            columns: {
              userId: true,
            },
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      });

  // Enforce authorization: only admins, developers, or managers of the club pass.
  if (
    !(
      ["admin", "developer"].includes(user.role) ||
      data?.managers?.some((m) => m.userId === user.id)
    )
  ) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  return { success: true, statusCode: 200, data };
});
