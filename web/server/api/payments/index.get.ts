import { db } from "#server/db";
import { payments } from "#server/db/schema/payments";
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
                payment: { $ref: "#/components/schemas/Payment" },
              },
              required: ["payment"],
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
    $global: {
      components: {
        schemas: {
          Payment: {
            type: "object",
            properties: {
              id: {
                type: "string",
                format: "uuid",
                example: "123e4567-e89b-12d3-a456-426614174000",
              },
              userId: {
                type: "number",
                example: 1,
              },
              paymentType: {
                type: "string",
                enum: ["event", "membership"],
                example: "event",
              },
              description: { type: "string", example: "DNJU Open 2027" },
              amount: { type: "integer", example: 1500 },
              currency: { type: "string", example: "eur" },
              status: {
                type: "string",
                enum: [
                  "pending",
                  "processing",
                  "paid",
                  "cancelled",
                  "forgiven",
                  "failed",
                ],
                example: "pending",
              },
              resolution: {
                type: "string",
                nullable: true,
                enum: ["stripe", "manual", "waived"],
                example: null,
              },
              stripeCheckoutSessionId: {
                type: "string",
                nullable: true,
                example: "cs_test_123",
              },
              stripePaymentIntentId: {
                type: "string",
                nullable: true,
                example: "pi_123",
              },
              paidAt: {
                type: "string",
                format: "date-time",
                nullable: true,
                example: null,
              },
              createdAt: {
                type: "string",
                format: "date-time",
                example: "2026-09-01T08:00:00.000Z",
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                example: "2026-09-01T08:00:00.000Z",
              },
            },
            required: [
              "id",
              "userId",
              "paymentType",
              "description",
              "amount",
              "currency",
              "status",
              "createdAt",
              "updatedAt",
            ],
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
      all: sumOfPayments,
      paid: sumOfPaidPayments,
      forgiven: sumOfForgivenPayments,
    },
    payments: allUnpaidPayments,
  };
});
