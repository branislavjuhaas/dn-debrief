import { and, eq, inArray, not, sql } from "drizzle-orm";
import Stripe from "stripe";
import { db } from "#server/db";
import { payments } from "#server/db/schema/payments";

defineRouteMeta({
  openAPI: {
    tags: ["Payments", "Stripe"],
    summary: "Process Stripe webhooks",
    description:
      "Receive Stripe checkout and payment intent events, validate signature, and update payment records.",
    parameters: [
      {
        name: "stripe-signature",
        in: "header",
        required: true,
        schema: { type: "string" },
        description: "Stripe webhook signature",
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
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
              properties: { received: { type: "boolean", example: true } },
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

const markPaymentsAsPaid = async (session: Stripe.Checkout.Session) => {
  const ids = session.metadata?.payment_ids?.split(",").filter(Boolean) ?? [];
  const intentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  // Fallback: update by session ID if metadata IDs are missing
  const whereCondition =
    ids.length > 0
      ? and(
          inArray(payments.id, ids),
          eq(payments.stripeCheckoutSessionId, session.id),
          not(eq(payments.status, "paid")),
        )
      : and(
          eq(payments.stripeCheckoutSessionId, session.id),
          not(eq(payments.status, "paid")),
        );

  await db
    .update(payments)
    .set({
      status: "paid",
      resolution: "stripe",
      stripePaymentIntentId: intentId ?? null,
      paidAt: sql`now()`,
      updatedAt: sql`now()`,
    })
    .where(whereCondition);
};

const markPaymentsAsProcessing = async (session: Stripe.Checkout.Session) => {
  const ids = session.metadata?.payment_ids?.split(",").filter(Boolean) ?? [];
  const intentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  const whereCondition =
    ids.length > 0
      ? and(
          inArray(payments.id, ids),
          eq(payments.stripeCheckoutSessionId, session.id),
          eq(payments.status, "pending"),
        )
      : and(
          eq(payments.stripeCheckoutSessionId, session.id),
          eq(payments.status, "pending"),
        );

  await db
    .update(payments)
    .set({
      status: "processing",
      resolution: "stripe",
      stripePaymentIntentId: intentId ?? null,
      updatedAt: sql`now()`,
    })
    .where(whereCondition);
};

const markPaymentsAsFailed = async (session: Stripe.Checkout.Session) => {
  const ids = session.metadata?.payment_ids?.split(",").filter(Boolean) ?? [];
  const intentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  const whereCondition =
    ids.length > 0
      ? and(
          inArray(payments.id, ids),
          eq(payments.stripeCheckoutSessionId, session.id),
          not(eq(payments.status, "paid")),
        )
      : and(
          eq(payments.stripeCheckoutSessionId, session.id),
          not(eq(payments.status, "paid")),
        );

  await db
    .update(payments)
    .set({
      status: "failed",
      resolution: "stripe",
      checkoutAttempt: sql`${payments.checkoutAttempt} + 1`,
      stripePaymentIntentId: intentId ?? null,
      updatedAt: sql`now()`,
    })
    .where(whereCondition);
};

const markPaymentsFailedByIntent = async (
  paymentIntent: Stripe.PaymentIntent,
) => {
  await db
    .update(payments)
    .set({
      status: "failed",
      resolution: "stripe",
      checkoutAttempt: sql`${payments.checkoutAttempt} + 1`,
      stripePaymentIntentId: paymentIntent.id,
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(payments.stripePaymentIntentId, paymentIntent.id),
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
    case "checkout.session.completed": {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") {
        await markPaymentsAsPaid(session);
      } else if (session.payment_status === "unpaid") {
        // Delayed payments (SEPA, bank transfer)
        await markPaymentsAsProcessing(session);
      }
      break;
    }

    case "checkout.session.async_payment_succeeded": {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      await markPaymentsAsPaid(session);
      break;
    }

    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      await markPaymentsAsFailed(session);
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent;
      await markPaymentsFailedByIntent(paymentIntent);
      break;
    }
  }

  return { received: true };
});
