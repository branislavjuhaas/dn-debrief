import { db } from "#server/db";

defineRouteMeta({
  openAPI: {
    tags: ["Payments"],
    summary: "Handle Stripe checkout return",
    description:
      "Handle the return from a Stripe checkout session and redirect the user accordingly.",
    parameters: [
      {
        name: "session_id",
        in: "query",
        required: true,
        schema: { type: "string" },
        description: "The Stripe checkout session ID",
      },
    ],
    responses: {
      302: {
        description:
          "Redirects to the appropriate page based on the payment type and status",
      },
      400: {
        description: "Bad request due to missing or invalid session ID",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      404: {
        description: "Payment not found for the given session ID",
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
  const sessionId = getQuery(event).session_id;

  if (!sessionId || typeof sessionId !== "string") {
    throw createError({ statusCode: 400, message: "Session ID required" });
  }

  const payments = await db.query.payments.findMany({
    where: {
      stripeCheckoutSessionId: sessionId,
    },
    columns: {
      id: true,
      userId: true,
      paymentType: true,
    },
  });

  if (payments.length === 0) {
    throw createError({ statusCode: 404, message: "Platba nebola nájdená" });
  }

  if (payments.length > 1) {
    await sendRedirect(event, "/payments/success");
  }

  const payment = payments[0];

  if (payment?.paymentType === "membership") {
    await sendRedirect(event, "/profile/join/finished?paid=true");
  }

  await sendRedirect(event, "/payments/success");
});
