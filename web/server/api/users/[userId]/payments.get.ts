import { db } from "#server/db";

defineRouteMeta({
  openAPI: {
    tags: ["Users"],
    summary: "List user's payments",
    description: "Get all payments for a user.",
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        schema: {
          type: "string",
          oneOf: [
            { type: "integer", example: 1 },
            { type: "string", enum: ["me"], example: "me" },
          ],
        },
        description:
          "The ID of the user whose memberships should be returned or 'me' for the current user",
      },
    ],
    responses: {
      200: {
        description: "The user's payments",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                payments: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Payment" },
                },
              },
              required: ["payments"],
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
      403: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
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

export default defineEventHandler(async (event) => {
  await requireUser(event, ["developer", "admin"]);
  const userId = Number.parseInt(getRouterParam(event, "userId") ?? "", 10);

  const userPayments = await db.query.payments.findMany({
    where: {
      userId: userId,
    },
  });

  return { payments: userPayments };
});
