import {
  mysqlTable,
  mysqlEnum,
  varchar,
  text,
  timestamp,
  boolean,
  date,
  int,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { clubMemberships, clubManagers } from "./clubs";

// USERS

export const users = mysqlTable(
  "users",
  {
    id: int("id").primaryKey().autoincrement(),
    name: text("name").notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    search: varchar("search", { length: 32 }).notNull(),
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
    birthdate: date("birthdate"),
    address: text("address"),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("users_search_idx").on(table.search),
    index("users_role_idx").on(table.role),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  clubMemberships: many(clubMemberships, {
    relationName: "user_club_memberships",
  }),
  clubManagements: many(clubManagers, {
    relationName: "user_club_managements",
  }),
}));

// SESSIONS

export const sessions = mysqlTable(
  "sessions",
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
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("sessions_user_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);

// ACCOUNTS

export const accounts = mysqlTable(
  "accounts",
  {
    id: int("id").primaryKey().autoincrement(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
  (table) => [index("accounts_user_idx").on(table.userId)],
);

// VERIFICATIONS

export const verifications = mysqlTable(
  "verifications",
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
  (table) => [
    index("verifications_identifier_idx").on(table.identifier),
    index("verifications_expires_at_idx").on(table.expiresAt),
  ],
);
