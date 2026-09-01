import { db } from "#server/db";

defineRouteMeta({
  openAPI: {
    tags: ["Payments"],
    summary: "Get payment",
    description:
      "Get a payment by ID. Regular users can only access their own payments.",
    parameters: [
      {
        name: "paymentId",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
        description: "The ID of the payment to fetch",
      },
    ],
    responses: {
      200: {
        description: "The requested payment",
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
  const user = await requireUser(event);
  const paymentId = getRouterParam(event, "paymentId")!;

  const payment = await db.query.payments.findFirst({
    where: {
      id: paymentId,
      ...(!["developer", "admin"].includes(user.role) && { userId: user.id }),
    },
  });

  if (!payment) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "Payment not found",
    });
  }

  return { payment };
});
