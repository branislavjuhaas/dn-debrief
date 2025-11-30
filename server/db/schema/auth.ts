import {
  pgTable,
  pgEnum,
  varchar,
  text,
  timestamp,
  boolean,
  date,
  integer,
  index,
  serial,
  customType,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { clubMemberships, clubManagers } from "./clubs";
import { eventOrganizers, eventRegistrations } from "./events";

// TSVECTOR TYPE

export const tsvector = customType<{
  data: string;
}>({
  dataType() {
    return `tsvector`;
  },
});

// USERS

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
    name: text("name").notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    role: userRoleEnum("role").default("user").notNull(),
    credential: integer("credential").default(0).notNull(),
    birthdate: date("birthdate"),
    address: text("address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("users_role_idx").on(table.role),
    index("users_name_search_idx").using(
      "gin",
      sql`(to_tsvector('simple', unaccent(regexp_replace(${table.name}, '[^a-zA-Z0-9]', '', 'g'))))`,
    ),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  clubMemberships: many(clubMemberships, {
    relationName: "user_club_memberships",
  }),
  clubManagements: many(clubManagers, {
    relationName: "user_club_managements",
  }),
  eventOrganizations: many(eventOrganizers, {
    relationName: "user_event_organizers",
  }),
  eventRegistrations: many(eventRegistrations, {
    relationName: "user_event_registrations",
  }),
  supervisors: many(supervisors),
  sessions: many(sessions),
  accounts: many(accounts),
}));

// SUPERVISORS

export const supervisors = pgTable(
  "supervisors",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("supervisors_userId_idx").on(table.userId)],
);

export const supervisorsRelations = relations(supervisors, ({ one }) => ({
  user: one(users, {
    fields: [supervisors.userId],
    references: [users.id],
  }),
}));

// SESSIONS

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("sessions_userId_idx").on(table.userId)],
);

export const sessionRelations = relations(sessions, ({ one }) => ({
  users: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// ACCOUNTS

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

export const accountRelations = relations(accounts, ({ one }) => ({
  users: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

// VERIFICATIONS

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
