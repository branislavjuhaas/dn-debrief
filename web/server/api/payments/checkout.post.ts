import Stripe from "stripe";
import z from "zod";
import { inArray, eq, and } from "drizzle-orm";
import { db } from "#server/db";
import { payments } from "#server/db/schema/payments";

const paymentsBody = z.object({
  paymentIds: z.array(z.number().int().positive()).min(1),
});

defineRouteMeta({
  openAPI: {
    tags: ["Payments"],
    summary: "Create checkout session",
    description:
      "Create a Stripe checkout session for pending payments owned by the authenticated user.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              paymentIds: {
                type: "array",
                items: { type: "integer", minimum: 1 },
                example: [12, 17],
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

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readValidatedBody(event, paymentsBody.parse);

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const claimed = await db
    .update(payments)
    .set({ status: "processing" })
    .where(
      and(
        inArray(payments.id, body.paymentIds),
        eq(payments.userId, user.id),
        eq(payments.status, "pending"),
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

  const sortedIds = claimed.map((p) => p.id).sort((a, b) => a - b);

  const attempt = claimed[0]?.checkoutAttempt ?? 0;
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
        expires_at: Math.floor(Date.now() / 1000) + 5 * 60, // 5 minutes from now
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

async function rollbackClaim(ids: number[]) {
  await db
    .update(payments)
    .set({ status: "pending" })
    .where(inArray(payments.id, ids));
}
