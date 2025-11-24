import {
  boolean,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
  index,
  unique,
} from "drizzle-orm/mysql-core";
import { mysqlEnum } from "drizzle-orm/mysql-core/columns/enum";
import { relations } from "drizzle-orm";
import { users } from "~~/server/db/schema/auth";

// ENUMS

export const league = mysqlEnum("league", ["junior", "senior", "university"]);
export const region = mysqlEnum("region", ["west", "central", "east"]);

// CLUBS

export const clubs = mysqlTable(
  "clubs",
  {
    id: int("id").primaryKey().autoincrement(),
    name: text("name").notNull(),
    description: text("description"),
    search: varchar("search", { length: 32 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    league: league.default("senior").notNull(),
    region: region.default("central"),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("clubs_search_idx").on(table.search)],
);

export const clubsRelations = relations(clubs, ({ many }) => ({
  memberships: many(clubMemberships, { relationName: "club_memberships" }),
  managers: many(clubManagers, { relationName: "club_managers" }),
}));

// CLUB MEMBERSHIPS

export const clubMemberships = mysqlTable(
  "club_memberships",
  {
    id: int("id").primaryKey().autoincrement(),
    clubId: int("club_id")
      .references(() => clubs.id, { onDelete: "cascade" })
      .notNull(),
    userId: int("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    season: varchar("season", { length: 4 }).notNull(),
    confirmed: boolean("confirmed").default(false).notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    unique().on(table.userId, table.season),
    index("club_memberships_user_idx").on(table.userId),
    index("club_memberships_user_season_idx").on(table.userId, table.season),
    index("club_memberships_club_season_confirmed_idx").on(
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
      relationName: "club_memberships",
    }),
    user: one(users, {
      fields: [clubMemberships.userId],
      references: [users.id],
      relationName: "user_club_memberships",
    }),
  }),
);

// CLUB MANAGERS

export const clubManagers = mysqlTable(
  "club_managers",
  {
    id: int("id").primaryKey().autoincrement(),
    clubId: int("club_id")
      .references(() => clubs.id, { onDelete: "cascade" })
      .notNull(),
    userId: int("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    unique().on(table.userId, table.clubId),
    index("club_managers_user_idx").on(table.userId),
    index("club_managers_club_idx").on(table.clubId),
  ],
);

export const clubManagersRelations = relations(clubManagers, ({ one }) => ({
  club: one(clubs, {
    fields: [clubManagers.clubId],
    references: [clubs.id],
    relationName: "club_managers",
  }),
  user: one(users, {
    fields: [clubManagers.userId],
    references: [users.id],
    relationName: "user_club_managements",
  }),
}));
