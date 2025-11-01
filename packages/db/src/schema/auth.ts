import {
  mysqlTable,
  mysqlEnum,
  varchar,
  text,
  timestamp,
  date,
  boolean,
  int,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// USER

export const user = mysqlTable(
  "user",
  {
    id: int("id").primaryKey().autoincrement(),
    name: text("name").notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    role: mysqlEnum("role", [
      "user",
      "organizer",
      "junior_organizer",
      "chief_adjudicator",
      "motion_committee_member",
      "admin",
      "developer",
    ])
      .default("user")
      .notNull(),
    credential: int("credential").default(0).notNull(),
    birthdate: date(),
    address: text("address"),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("user_email_idx").on(table.email)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session, { relationName: "user_sessions" }),
  accounts: many(account, { relationName: "user_accounts" }),
}));

// SESSION

export const session = mysqlTable(
  "session",
  {
    id: int("id").primaryKey().autoincrement(),
    expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: int("id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("session_user_id_idx").on(table.userId),
    index("session_token_idx").on(table.token),
  ],
);

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
    relationName: "user_sessions",
  }),
}));

// ACCOUNT

export const account = mysqlTable(
  "account",
  {
    id: int("id").primaryKey().autoincrement(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: int()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { fsp: 3 }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { fsp: 3 }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    index("account_provider_idx").on(table.providerId, table.accountId),
  ],
);

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
    relationName: "user_accounts",
  }),
}));

// VERIFICATION

export const verification = mysqlTable(
  "verification",
  {
    id: int("id").primaryKey().autoincrement(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);
