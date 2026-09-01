import { and, eq, inArray, not, sql } from "drizzle-orm";
import Stripe from "stripe";
import { db } from "#server/db";
import { payments } from "#server/db/schema/payments";

defineRouteMeta({
  openAPI: {
    tags: ["Payments", "Stripe"],
    summary: "Process Stripe webhooks",
    description:
      "Receive Stripe checkout events, validate the webhook signature, and update payment records.",
    parameters: [
      {
        name: "stripe-signature",
        in: "header",
        required: true,
        schema: { type: "string" },
        description:
          "Stripe webhook signature used to verify the event payload",
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            description:
              "Stripe event payload sent by Stripe for checkout updates",
            additionalProperties: true,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Webhook processed successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                received: { type: "boolean", example: true },
              },
              required: ["received"],
            },
          },
        },
      },
      400: {
        description: "Invalid webhook payload or signature",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      500: {
        description: "Internal server error while processing the webhook",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
});

const markPaymentsAsPaid = async (session: Stripe.Checkout.Session) => {
  const ids = session.metadata?.payment_ids?.split(",") ?? [];

  await db
    .update(payments)
    .set({
      status: "paid",
      resolution: "stripe",
      stripePaymentIntentId: session.payment_intent as string,
      paidAt: sql`now()`,
    })
    .where(
      and(
        inArray(payments.id, ids),
        eq(payments.stripeCheckoutSessionId, session.id),
        not(eq(payments.status, "paid")),
      ),
    );
};

const releasePaymentsBackToPending = async (
  session: Stripe.Checkout.Session,
) => {
  const ids = session.metadata?.payment_ids?.split(",") ?? [];

  await db
    .update(payments)
    .set({
      status: "pending",
      checkoutAttempt: sql`${payments.checkoutAttempt} + 1`,
      stripeCheckoutSessionId: null,
    })
    .where(
      and(
        inArray(payments.id, ids),
        eq(payments.stripeCheckoutSessionId, session.id),
        not(eq(payments.status, "paid")),
      ),
    );
};

export default defineEventHandler(async (event) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const signature = getHeader(event, "stripe-signature");
  const body = await readRawBody(event);
  if (!signature || !body) throw createError({ statusCode: 400 });

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid signature: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }

  switch (stripeEvent.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") {
        await markPaymentsAsPaid(session);
      }
      // if payment_status is 'unpaid' here it means an async method just
      // started processing — wait for async_payment_succeeded/failed
      break;
    }

    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      await releasePaymentsBackToPending(session);
      break;
    }
  }

  return { received: true };
});
