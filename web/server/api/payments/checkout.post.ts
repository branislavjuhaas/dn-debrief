import { and, eq, inArray, sql } from "drizzle-orm";
import Stripe from "stripe";
import * as z from "zod";
import { db } from "#server/db";
import { payments } from "#server/db/schema/payments";

const paymentsBody = z.object({
  paymentIds: z.array(z.uuidv7()).min(1, "At least one payment ID is required"),
});

defineRouteMeta({
  openAPI: {
    tags: ["Payments"],
    summary: "Create checkout session",
    description:
      "Create a Stripe checkout session for pending, processing, or failed payments owned by the authenticated user.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              paymentIds: {
                type: "array",
                items: { type: "string", format: "uuid" },
                example: [
                  "123e4567-e89b-12d3-a456-426614174000",
                  "123e4567-e89b-12d3-a456-426614174001",
                ],
              },
            },
            required: ["paymentIds"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "Checkout session created successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  format: "uri",
                  description:
                    "Stripe Checkout URL for the user to complete payment",
                },
              },
              required: ["url"],
            },
          },
        },
      },
      400: {
        description: "Bad request",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
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
      409: {
        description: "One or more payments are no longer available",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      502: {
        description: "Stripe checkout session could not be created",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
});

const rollbackClaim = async (ids: string[]) => {
  if (ids.length === 0) return;
  await db
    .update(payments)
    .set({ status: "failed", updatedAt: sql`now()` })
    .where(inArray(payments.id, ids));
};

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readValidatedBody(event, paymentsBody.parse);

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // Claim payments for processing & increment checkoutAttempt counter
  const claimed = await db
    .update(payments)
    .set({
      status: "processing",
      checkoutAttempt: sql`${payments.checkoutAttempt} + 1`,
      updatedAt: sql`now()`,
    })
    .where(
      and(
        inArray(payments.id, body.paymentIds),
        eq(payments.userId, user.id),
        inArray(payments.status, ["pending", "processing", "failed"]),
      ),
    )
    .returning();

  if (claimed.length !== body.paymentIds.length) {
    throw createError({
      statusCode: 409,
      statusMessage: "One or more items are no longer available for payment.",
    });
  }

  const currency = claimed[0]?.currency.toLowerCase();
  if (!currency) {
    await rollbackClaim(claimed.map((p) => p.id));
    throw createError({
      statusCode: 400,
      statusMessage: "Currency is required for checkout.",
    });
  }

  const hasMixedCurrencies = claimed.some(
    (p) => p.currency.toLowerCase() !== currency,
  );

  if (hasMixedCurrencies) {
    await rollbackClaim(claimed.map((p) => p.id));
    throw createError({
      statusCode: 400,
      statusMessage:
        "Cannot mix multiple currencies in a single checkout session.",
    });
  }

  const lineItems = claimed.map((p) => ({
    quantity: 1,
    price_data: {
      currency,
      unit_amount: p.amount,
      product_data: {
        name: p.description,
      },
    },
  }));

  const totalAmountCents = lineItems.reduce(
    (sum, item) => sum + item.price_data.unit_amount,
    0,
  );

  if (totalAmountCents < 50) {
    await rollbackClaim(claimed.map((p) => p.id));
    throw createError({
      statusCode: 400,
      statusMessage: "Total checkout amount must be at least €0.50.",
    });
  }

  const sortedIds = claimed.map((p) => p.id).sort();
  const attempt = claimed[0]?.checkoutAttempt ?? 1;
  const idempotencyKey = `checkout-${user.id}-${sortedIds.join("-")}-attempt-${attempt}`;

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: user.email,
        line_items: lineItems,
        payment_intent_data: {
          statement_descriptor_suffix: "DebRIEF",
        },
        metadata: {
          payment_ids: sortedIds.join(","),
          user_id: user.id.toString(),
        },
        success_url: `${process.env.BETTER_AUTH_URL}/payments/return?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BETTER_AUTH_URL}/payments/cancel`,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes expiration window
      },
      { idempotencyKey },
    );
  } catch (err) {
    await rollbackClaim(claimed.map((p) => p.id));
    throw createError({
      statusCode: 502,
      statusMessage: `Could not start checkout due to following error: ${err instanceof Error ? err.message : String(err)}, please try again.`,
    });
  }

  await db
    .update(payments)
    .set({ stripeCheckoutSessionId: session.id })
    .where(
      inArray(
        payments.id,
        claimed.map((p) => p.id),
      ),
    );

  return { url: session.url };
});
