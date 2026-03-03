import { defineRelations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
  serial,
  jsonb,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  surname: text('surname').notNull(),
  search: text('search')
    .notNull()
    .generatedAlwaysAs(
      (): SQL =>
        sql`(lower(regexp_replace(public.immutable_unaccent(${users.name} || ${users.surname}), '[^a-zA-Z0-9]', '', 'g')))`,
    ),
  credential: integer('credential').default(0).notNull(),
  birthdate: timestamp('birthdate'),
  street: text('street'),
  postalCode: text('postal_code'),
  city: text('city'),
  phone: text('phone'),
  claims: jsonb('claims'),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  role: text('role'),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
},
table => [
  index('users_role_idx').on(table.role),
  index('users_search_idx').using('gin', sql`${table.search} gin_trgm_ops`),
]);

export const supervisors = pgTable(
  "supervisors",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text('email').notNull(),
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

export const sessions = pgTable(
  'sessions',
  {
    id: serial('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonated_by'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  table => [index('sessions_userId_idx').on(table.userId)],
);

export const accounts = pgTable(
  'accounts',
  {
    id: serial('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  table => [index('accounts_userId_idx').on(table.userId)],
);

export const verifications = pgTable(
  'verifications',
  {
    id: serial('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  table => [index('verifications_identifier_idx').on(table.identifier)],
);

export const authRelations = defineRelations(
  { users, sessions, accounts },
  r => ({
    users: {
      sessions: r.many.sessions(),
      accounts: r.many.accounts(),
      supervisors: r.many.supervisors({
        from: r.supervisors.userId,
        to: r.users.id,
      }),
    },
    sessions: {
      user: r.one.users({
        from: r.sessions.userId,
        to: r.users.id,
      }),
    },
    accounts: {
      user: r.one.users({
        from: r.accounts.userId,
        to: r.users.id,
      }),
    },
    supervisors: {
      user: r.one.users({
        from: r.supervisors.userId,
        to: r.users.id,
      }),
    }
  }),
);
