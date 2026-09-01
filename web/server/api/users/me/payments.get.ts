import { db } from "#server/db";

defineRouteMeta({
  openAPI: {
    tags: ["Users"],
    summary: "List current user's payments",
    description: "Get all payments for a user.",
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
  const user = await requireUser(event);

  const userPayments = await db.query.payments.findMany({
    where: {
      userId: user.id,
    },
  });

  return { payments: userPayments };
});
