import {
  boolean,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  index,
  unique,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { league, region } from "./clubs";
import { users } from "./auth";

// EVENTS TABLE JSON TYPES
export type Happening = {
  beginning: number;
  duration: number;
  name: string;
};

export type Day = {
  name: string;
  date: string;
  happenings: Happening[];
};

export type Module = {
  name: string;
  value: string;
  link?: {
    name: string;
    value: string;
  };
};

export type EventDetails = {
  modules: Module[];
  description: string;
  schedule: Day[];
  type: "tournament" | "seminar" | "other";
};

export type Deadline = {
  role?: string;
  date: string | null;
};

export type Price = {
  role: string;
  value: number;
};

export type Question = {
  text: string;
  answer: "text" | "number" | "date" | "checkbox" | string[];
};

export type RegistrationDetails = {
  defaultDeadline: Deadline;
  deadlines: Deadline[];
  prices: Price[];
  collectedDetails: ("name" | "email" | "birthdate" | "address" | "phone")[];
  questions: Question[];
};

// EVENTS

export const events = mysqlTable(
  "events",
  {
    id: int("id").primaryKey().autoincrement(),
    season: varchar("season", { length: 9 }).notNull(),
    name: text("name").notNull(),
    league: league.default("senior").notNull(),
    region: region.default("central"),
    search: varchar("search", { length: 32 }).notNull(),
    draft: boolean("draft").default(false).notNull(),
    beginning: timestamp("beginning", { fsp: 3 }).notNull(),
    end: timestamp("end", { fsp: 3 }).notNull(),
    details: json("details").$type<EventDetails>().notNull(),
    registration: json("registration").$type<RegistrationDetails>().notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("events_search_idx").on(table.search),
    index("events_region_idx").on(table.region),
    index("events_season_idx").on(table.season),
    index("events_end_draft_idx").on(table.end, table.draft),
  ],
);

export const eventsRelations = relations(events, ({ many }) => ({
  organizers: many(eventOrganizers, { relationName: "event_organizers" }),
  registrations: many(eventRegistrations, {
    relationName: "event_registrations",
  }),
}));

// EVENT ORGANIZERS

export const eventOrganizers = mysqlTable(
  "event_organizers",
  {
    id: int("id").primaryKey().autoincrement(),
    eventId: int("event_id")
      .references(() => events.id)
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
    unique().on(table.eventId, table.userId),
    index("event_organizers_event_idx").on(table.eventId),
    index("event_organizers_user_idx").on(table.userId),
  ],
);

export const eventOrganizersRelations = relations(
  eventOrganizers,
  ({ one }) => ({
    event: one(events, {
      fields: [eventOrganizers.eventId],
      references: [events.id],
      relationName: "event_organizers",
    }),
    user: one(users, {
      fields: [eventOrganizers.userId],
      references: [users.id],
      relationName: "user_event_organizers",
    }),
  }),
);

// EVENT REGISTRATIONS JSON TYPES
export type RegistrationData = {
  [key: string]: string | string[] | number | boolean;
};

// EVENT REGISTRATIONS

export const eventRegistrations = mysqlTable(
  "event_registrations",
  {
    id: int("id").primaryKey().autoincrement(),
    eventId: int("event_id")
      .references(() => events.id)
      .notNull(),
    userId: int("user_id").references(() => users.id, { onDelete: "cascade" }),
    data: json("data").$type<RegistrationData>().notNull(),
  },
  (table) => [
    unique().on(table.eventId, table.userId),
    index("event_registrations_event_idx").on(table.eventId),
    index("event_registrations_user_idx").on(table.userId),
  ],
);

export const eventRegistrationsRelations = relations(
  eventRegistrations,
  ({ one }) => ({
    event: one(events, {
      fields: [eventRegistrations.eventId],
      references: [events.id],
      relationName: "event_registrations",
    }),
    user: one(users, {
      fields: [eventRegistrations.userId],
      references: [users.id],
      relationName: "user_event_registrations",
    }),
  }),
);
