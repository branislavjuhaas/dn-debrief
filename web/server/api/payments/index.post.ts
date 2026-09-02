import z from "zod";
import { db } from "#server/db";
import { payments } from "#server/db/schema/payments";

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
              userId: {
                type: "number",
                description: "The ID of the user",
                example: 1,
              },
              description: {
                type: "string",
                description: "The description of the payment",
                example: "Payment for services",
              },
              amount: {
                type: "number",
                description: "The amount of the payment in cents",
                example: 10000,
              },
            },
            required: ["userId", "description", "amount"],
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
  userId: z.number().min(1),
  description: z.string(),
  amount: z.number().min(1),
});

export default defineEventHandler(async (event) => {
  await requireUser(event, ["developer", "admin"]);

  const body = await readValidatedBody(event, paymentsSchema.parse);

  const createdPayment = await db
    .insert(payments)
    .values({
      userId: body.userId,
      paymentType: "other",
      description: body.description,
      amount: body.amount,
    })
    .returning();

  setResponseStatus(event, 201);
  return { payments: createdPayment[0] };
});
