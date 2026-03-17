import {
  pgEnum,
  pgTable,
  boolean,
  integer,
  serial,
  smallint,
  text,
  timestamp,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { type SQL, sql } from 'drizzle-orm';
import { users } from './auth';
import { payments } from './payments';

export const leagueEnum = pgEnum('league', ['junior', 'senior', 'university']);
export const regionEnum = pgEnum('region', ['west', 'central', 'east']);
export const clubMembershipTypeEnum = pgEnum('club_registration_type', ['junior_student', 'senior_student', 'graduate', 'teacher']);

export const clubs = pgTable('clubs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  search: text('search')
    .notNull()
    .generatedAlwaysAs(
      (): SQL =>
        sql`(lower(regexp_replace(public.immutable_unaccent(${clubs.name}), '[^a-zA-Z0-9]', '', 'g')))`,
    ),
  league: leagueEnum('league').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  region: regionEnum('region').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
},
table => [
  index('clubs_isActive_idx').on(table.isActive),
  index('clubs_search_idx').using('gin', sql`${table.search} gin_trgm_ops`),
]);

export const clubMemberships = pgTable(
  'club_memberships',
  {
    clubId: integer('club_id')
      .references(() => clubs.id)
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    season: smallint('season').notNull(),
    registrationType: clubMembershipTypeEnum('registration_type').notNull(),
    confirmed: boolean('confirmed').default(false).notNull(),
    paymentId: integer('payment_id').unique()
      .references(() => payments.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  table => [
    primaryKey({ columns: [table.clubId, table.userId, table.season] }),
    index('club_memberships_userId_idx').on(table.userId),
    index('club_memberships_userId_season_idx').on(table.userId, table.season),
    index('club_memberships_paymentId_idx').on(table.paymentId),
    index('club_memberships_clubId_season_confirmed_idx').on(
      table.clubId,
      table.season,
      table.confirmed,
    ),
  ]);

export const clubManagers = pgTable(
  'club_managers',
  {
    clubId: integer('club_id')
      .references(() => clubs.id)
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  table => [
    primaryKey({ columns: [table.clubId, table.userId] }),
    index('club_managers_userId_idx').on(table.userId),
    index('club_managers_clubId_idx').on(table.clubId),
  ]);

