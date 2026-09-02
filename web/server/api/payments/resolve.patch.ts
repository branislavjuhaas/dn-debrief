import z from "zod";
import { db } from "#server/db";
import { payments } from "#server/db/schema/payments";
import { inArray } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["Payments"],
    summary: "Update payment",
    description: "Update a specific payment",
    requestBody: {
      description: "The updated payment data",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              paymentIds: {
                type: "array",
                items: {
                  type: "string",
                  format: "uuid",
                },
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
              note: {
                type: "string",
                description: "The note of the payment",
                example: "Paid in cash outside Stripe",
              },
            },
            required: ["paymentIds", "status"],
          },
        },
      },
    },
    responses: {
      202: {
        description: "The updated payments",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                payments: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Payment",
                  },
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

const paymentsSchema = z.object({
  paymentIds: z.array(z.uuidv7()).min(1),
  status: z.enum([
    "pending",
    "processing",
    "paid",
    "cancelled",
    "forgiven",
    "failed",
  ]),
  note: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const user = await requireUser(event, ["developer", "admin"]);

  const body = await readValidatedBody(event, paymentsSchema.parse);

  const updatedPayments = await db
    .update(payments)
    .set({
      status: body.status,
      resolution: "manual",
      resolvedByUserId: user.id,
      note: body.note,
    })
    .where(inArray(payments.id, body.paymentIds))
    .returning();

  setResponseStatus(event, 202);
  return { payments: updatedPayments[0] };
});
