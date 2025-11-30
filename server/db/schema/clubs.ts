import {
  pgEnum,
  pgTable,
  boolean,
  integer,
  serial,
  text,
  timestamp,
  varchar,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./auth";

// ENUMS

export const league = pgEnum("league", ["junior", "senior", "university"]);
export const region = pgEnum("region", ["west", "central", "east"]);

// CLUBS

export const clubs = pgTable(
  "clubs",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    league: league("league").default("senior").notNull(),
    region: region("region").default("central"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("clubs_name_search_idx").using(
      "gin",
      sql`(to_tsvector('simple', unaccent(regexp_replace(${table.name}, '[^a-zA-Z0-9]', '', 'g'))))`,
    ),
  ],
);

export const clubsRelations = relations(clubs, ({ many }) => ({
  memberships: many(clubMemberships, { relationName: "clubMemberships" }),
  managers: many(clubManagers, { relationName: "clubManagers" }),
}));

// CLUB MEMBERSHIPS

export const clubMemberships = pgTable(
  "club_memberships",
  {
    id: serial("id").primaryKey(),
    clubId: integer("club_id")
      .references(() => clubs.id)
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    season: varchar("season", { length: 4 }).notNull(),
    confirmed: boolean("confirmed").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("club_memberships_userId_season_unique").on(
      table.userId,
      table.season,
    ),
    index("club_memberships_userId_idx").on(table.userId),
    index("club_memberships_userId_season_idx").on(table.userId, table.season),
    index("club_memberships_clubId_season_confirmed_idx").on(
      table.clubId,
      table.season,
      table.confirmed,
    ),
  ],
);

export const clubMembershipsRelations = relations(
  clubMemberships,
  ({ one }) => ({
    club: one(clubs, {
      fields: [clubMemberships.clubId],
      references: [clubs.id],
      relationName: "clubMemberships",
    }),
    user: one(users, {
      fields: [clubMemberships.userId],
      references: [users.id],
      relationName: "user_club_memberships",
    }),
  }),
);

// CLUB MANAGERS

export const clubManagers = pgTable(
  "club_managers",
  {
    id: serial("id").primaryKey(),
    clubId: integer("club_id")
      .references(() => clubs.id)
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("club_managers_userId_clubId_unique").on(
      table.userId,
      table.clubId,
    ),
    index("club_managers_userId_idx").on(table.userId),
    index("club_managers_clubId_idx").on(table.clubId),
  ],
);

export const clubManagersRelations = relations(clubManagers, ({ one }) => ({
  club: one(clubs, {
    fields: [clubManagers.clubId],
    references: [clubs.id],
    relationName: "clubManagers",
  }),
  user: one(users, {
    fields: [clubManagers.userId],
    references: [users.id],
    relationName: "user_club_managements",
  }),
}));
