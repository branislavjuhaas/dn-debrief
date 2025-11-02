import {
  mysqlTable,
  mysqlEnum,
  varchar,
  text,
  timestamp,
  boolean,
  int,
  index,
  unique,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";

// LEAGUE

export const league = mysqlEnum("league", ["junior", "senior", "university"]);

// CLUB

export const club = mysqlTable(
  "club",
  {
    id: int("id").primaryKey().autoincrement(),
    name: text("name").notNull(),
    search: varchar("search", { length: 36 }).notNull(),
    region: mysqlEnum("region", ["western", "central", "eastern"]).notNull(),
    league: league.default("senior").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("club_search_idx").on(table.search)],
);

export const clubRelations = relations(club, ({ many }) => ({
  memberships: many(clubMembership, { relationName: "club_memberships" }),
  managers: many(clubManager, { relationName: "club_managers" }),
}));

// CLUB MEMBERSHIP

export const clubMembership = mysqlTable(
  "club_membership",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    clubId: int("club_id")
      .notNull()
      .references(() => club.id, { onDelete: "cascade" }),
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
    index("club_membership_user_idx").on(table.userId),
    index("club_membership_user_season_idx").on(table.userId, table.season),
    index("club_membership_club_season_confirmed_idx").on(
      table.clubId,
      table.season,
      table.confirmed,
    ),
  ],
);

export const clubMembershipRelations = relations(clubMembership, ({ one }) => ({
  club: one(club, {
    fields: [clubMembership.clubId],
    references: [club.id],
    relationName: "club_memberships",
  }),
  user: one(user, {
    fields: [clubMembership.userId],
    references: [user.id],
    relationName: "user_club_memberships",
  }),
}));

// CLUB MANAGER

export const clubManager = mysqlTable(
  "club_manager",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    clubId: int("club_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    unique().on(table.userId, table.clubId),
    index("club_manager_user_idx").on(table.userId),
    index("club_manager_club_idx").on(table.clubId),
  ],
);

export const clubManagerRelations = relations(clubManager, ({ one }) => ({
  club: one(club, {
    fields: [clubManager.clubId],
    references: [club.id],
    relationName: "club_managers",
  }),
  user: one(user, {
    fields: [clubManager.userId],
    references: [user.id],
    relationName: "user_club_managements",
  }),
}));
