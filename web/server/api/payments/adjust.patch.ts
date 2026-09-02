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
              amount: {
                type: "number",
                description: "The amount of the payment in cents",
                minimum: 1,
                example: 10000,
              },
            },
            required: ["paymentIds", "amount"],
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
  amount: z.number().min(1),
});

export default defineEventHandler(async (event) => {
  await requireUser(event, ["developer", "admin"]);

  const body = await readValidatedBody(event, paymentsSchema.parse);

  const updatedPayments = await db
    .update(payments)
    .set({ amount: body.amount })
    .where(inArray(payments.id, body.paymentIds))
    .returning();

  setResponseStatus(event, 202);
  return { payments: updatedPayments[0] };
});
