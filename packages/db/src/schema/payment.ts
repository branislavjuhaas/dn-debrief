import {
  boolean,
  float,
  index,
  int,
  json,
  mysqlTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/mysql-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

// PAYMENT

export const payment = mysqlTable(
  "payment",
  {
    id: int("id").primaryKey().autoincrement(),
    name: text("name").notNull(),
    amount: float("amount").notNull(),
    paid: boolean("paid").default(false).notNull(),
    userId: int("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    action: json().default({}).notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("payment_user_id_idx").on(table.userId),
    index("payment_paid_idx").on(table.paid),
  ],
);

export const paymentRelations = relations(payment, ({ one }) => ({
  user: one(user, {
    fields: [payment.userId],
    references: [user.id],
    relationName: "user_payments",
  }),
}));

// INVOICE

export const invoice = mysqlTable(
  "invoice",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("invoice_user_id_idx").on(table.userId)],
);

export const invoiceRelations = relations(invoice, ({ one }) => ({
  user: one(user, {
    fields: [invoice.userId],
    references: [user.id],
    relationName: "user_invoices",
  }),
}));

// INVOICE ITEM

export const invoiceItem = mysqlTable(
  "invoice_item",
  {
    id: int("id").primaryKey().autoincrement(),
    invoiceId: int("invoice_id")
      .notNull()
      .references(() => invoice.id, { onDelete: "cascade" }),
    paymentId: int("payment_id")
      .notNull()
      .references(() => payment.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    unique().on(table.invoiceId, table.paymentId),
    index("invoice_item_invoice_id_idx").on(table.invoiceId),
    index("invoice_item_payment_id_idx").on(table.paymentId),
  ],
);

export const invoiceItemRelations = relations(invoiceItem, ({ one, many }) => ({
  invoice: one(invoice, {
    fields: [invoiceItem.invoiceId],
    references: [invoice.id],
    relationName: "invoice_items",
  }),
  payment: many(payment, {
    relationName: "payment_invoice_items",
  }),
}));
