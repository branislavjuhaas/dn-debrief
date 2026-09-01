import z from "zod";
import { db } from "#server/db";
import { payments } from "#server/db/schema/payments";
import { eq } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["Payments"],
    summary: "Update payment",
    description: "Update a specific payment",
    parameters: [
      {
        name: "paymentId",
        in: "path",
        required: true,
        schema: {
          type: "integer",
        },
        description: "The ID of the payment to update",
      },
    ],
    requestBody: {
      description: "The updated payment data",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              amount: {
                type: "number",
                description: "The amount of the payment",
                example: 1000,
              },
              currency: {
                type: "string",
                description: "The currency of the payment",
                example: "eur",
              },
              status: {
                type: "string",
                description: "The status of the payment",
                example: "pending",
                enum: [
                  "pending",
                  "processing",
                  "paid",
                  "cancelled",
                  "forgiven",
                  "failed",
                ],
              },
            },
            required: ["amount", "currency", "status"],
          },
        },
      },
    },
    responses: {
      202: {
        description: "The updated payment",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                payment: {
                  $ref: "#/components/schemas/Payment",
                },
              },
            },
          },
        },
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
      404: {
        description: "Club not found",
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

const paymentSchema = z.object({
  amount: z.number().optional(),
  currency: z.string().optional(),
  status: z
    .enum(["pending", "processing", "paid", "cancelled", "forgiven", "failed"])
    .optional(),
});

export default defineEventHandler(async (event) => {
  await requireUser(event, ["developer", "admin"]);
  const paymentId = getRouterParam(event, "paymentId")!;

  const body = await readValidatedBody(event, paymentSchema.parse);

  const updatedPayment = await db
    .update(payments)
    .set(body)
    .where(eq(payments.id, paymentId))
    .returning();

  if (updatedPayment.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: "Payment not found",
    });
  }

  setResponseStatus(event, 202);
  return { payment: updatedPayment[0] };
});
