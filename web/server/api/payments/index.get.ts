import { db } from "#server/db";
import { payments } from "#server/db/schema/payments";
import { id } from "date-fns/locale";
import { eq, inArray, sum } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["Payments"],
    summary: "Get all unpaid payments with stats",
    description: "Get all unpaid payments with statistics.",
    responses: {
      200: {
        description: "Payments with statistics",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                stats: {
                  type: "object",
                  properties: {
                    all: { type: "integer" },
                    paid: { type: "integer" },
                    forgiven: { type: "integer" },
                    unpaid: { type: "integer" },
                  },
                  required: ["all", "paid", "forgiven"],
                },
                payments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      amount: {
                        type: "integer",
                        description: "Amount in cents",
                        example: 1000,
                      },
                      description: {
                        type: "string",
                        example: "Registration fee for the 2026/2027 season",
                      },
                      createdAt: { type: "string", format: "date-time" },
                    },
                    required: ["id", "amount", "description", "createdAt"],
                  },
                },
              },
              required: ["stats", ""],
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
      404: {
        description: "Payment not found",
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

  const sumOfPayments = await db
    .select({ sum: sum(payments.amount) })
    .from(payments);

  const sumOfPaidPayments = await db
    .select({ sum: sum(payments.amount) })
    .from(payments)
    .where(inArray(payments.status, ["paid", "forgiven"]));

  const sumOfForgivenPayments = await db
    .select({ sum: sum(payments.amount) })
    .from(payments)
    .where(eq(payments.status, "forgiven"));

  const sumOfUnpaidPayments = await db
    .select({ sum: sum(payments.amount) })
    .from(payments)
    .where(inArray(payments.status, ["failed", "cancelled", "pending"]));

  const allUnpaidPayments = await db.query.payments.findMany({
    columns: {
      id: true,
      amount: true,
      description: true,
      status: true,
      createdAt: true,
    },
    where: {
      status: {
        in: ["failed", "cancelled", "pending"],
      },
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          surname: true,
          image: true,
        },
      },
    },
  });

  return {
    stats: {
      all: sumOfPayments[0]?.sum ?? 0,
      paid: sumOfPaidPayments[0]?.sum ?? 0,
      unpaid: sumOfUnpaidPayments[0]?.sum ?? 0,
      forgiven: sumOfForgivenPayments[0]?.sum ?? 0,
    },
    payments: allUnpaidPayments,
  };
});
