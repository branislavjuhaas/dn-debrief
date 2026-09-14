import { and, eq } from "drizzle-orm";
import { db } from "#server/db";
import { clubMemberships } from "#server/db/schema/clubs";

defineRouteMeta({
  openAPI: {
    tags: ["Users"],
    summary: "Confirm all memberships for a user",
    description: "Confirm all unconfirmed memberships for a user",
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        description: "The ID of the user to confirm memberships for",
        schema: {
          type: "integer",
        },
      },
    ],
    responses: {
      202: {
        description: "Memberships confirmed successfully",
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

export default defineEventHandler(async (event) => {
  await requireUser(event, ["developer", "admin"]);
  const userId = Number.parseInt(getRouterParam(event, "userId") ?? "", 10);

  await db
    .update(clubMemberships)
    .set({
      confirmed: true,
    })
    .where(
      and(
        eq(clubMemberships.userId, userId),
        eq(clubMemberships.confirmed, false),
      ),
    );

  setResponseStatus(event, 202);
});
