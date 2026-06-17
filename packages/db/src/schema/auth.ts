import type { SQL } from "drizzle-orm";
import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  date,
  timestamp,
  boolean,
  integer,
  index,
  serial,
  jsonb,
  pgEnum,
  smallint,
  primaryKey,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("role", [
  "user",
  "organizer",
  "junior_organizer",
  "chief_adjudicator",
  "motion_committee_member",
  "admin",
  "developer",
]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    surname: text("surname").notNull(),
    search: text("search")
      .notNull()
      .generatedAlwaysAs(
        (): SQL =>
          sql`(lower(regexp_replace(public.immutable_unaccent(${users.name} || ${users.surname}), '[^a-zA-Z0-9]', '', 'g')))`,
      ),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    role: userRoleEnum("role").default("user").notNull(),
    birthDate: date("birth_date"),
    street: text("street"),
    postalCode: text("postal_code"),
    town: text("town"),
    phone: text("phone"),
    credential: integer("credential").default(0).notNull(),
    claims: jsonb("claims"),
    banned: boolean("banned").default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("users_role_idx").on(table.role),
    index("users_search_idx").using("gin", sql`${table.search} gin_trgm_ops`),
  ],
);

export const awards = pgTable(
  "awards",
  {
    award: text("name").notNull(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    level: smallint("level").notNull(),
    awardedBy: integer("awarded_by").references(() => users.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.award, table.level] }),
    index("awards_userId_idx").on(table.userId),
  ],
);

export const legalGuardians = pgTable(
  "legal_guardians",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .unique()
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("supervisors_userId_idx").on(table.userId)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("sessions_userId_idx").on(table.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: serial("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("accounts_userId_idx").on(table.userId)],
);

export const verifications = pgTable(
  "verifications",
  {
    id: serial("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);
