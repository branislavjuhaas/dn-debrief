import {
  pgEnum,
  pgTable,
  integer,
  text,
  timestamp,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { sql } from "drizzle-orm";

export const paymentTypeEnum = pgEnum("payment_type", [
  "event",
  "membership",
  "other",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "processing",
  "paid",
  "cancelled",
  "forgiven",
  "failed",
]);

export const paymentResolutionEnum = pgEnum("payment_resolution", [
  "stripe",
  "manual",
  "waived",
]);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    paymentType: paymentTypeEnum("payment_type").notNull(),
    description: text("description").notNull(),
    amount: integer("amount").notNull(),
    status: paymentStatusEnum("status").default("pending").notNull(),
    checkoutAttempt: integer("checkout_attempt").notNull().default(0),
    resolution: paymentResolutionEnum("resolution"),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    paidAt: timestamp("paid_at"),
    resolvedByUserId: integer("resolved_by_user_id").references(() => users.id),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("payments_user_id_idx").on(table.userId)],
);
