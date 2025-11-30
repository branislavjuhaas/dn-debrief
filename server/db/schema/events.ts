import {
  pgTable,
  boolean,
  integer,
  serial,
  text,
  timestamp,
  varchar,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
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

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    season: varchar("season", { length: 9 }).notNull(),
    name: text("name").notNull(),
    league: league("league").default("senior").notNull(),
    region: region("region").default("central"),
    draft: boolean("draft").default(false).notNull(),
    beginning: timestamp("beginning").notNull(),
    end: timestamp("end").notNull(),
    details: jsonb("details").$type<EventDetails>().notNull(),
    registration: jsonb("registration").$type<RegistrationDetails>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("events_name_search_idx").using(
      "gin",
      sql`(to_tsvector('simple', public.immutable_unaccent(regexp_replace(${table.name}, '[^a-zA-Z0-9]', '', 'g'))))`,
    ),
    index("events_league_idx").on(table.league),
    index("events_region_idx").on(table.region),
    index("events_season_idx").on(table.season),
    index("events_end_draft_idx").on(table.end, table.draft),
  ],
);

export const eventsRelations = relations(events, ({ many }) => ({
  organizers: many(eventOrganizers, { relationName: "eventOrganizers" }),
  registrations: many(eventRegistrations, {
    relationName: "eventRegistrations",
  }),
}));

// EVENT ORGANIZERS

export const eventOrganizers = pgTable(
  "event_organizers",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .references(() => events.id)
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
    uniqueIndex("event_organizers_eventId_userId_unique").on(
      table.eventId,
      table.userId,
    ),
    index("event_organizers_eventId_idx").on(table.eventId),
    index("event_organizers_userId_idx").on(table.userId),
  ],
);

export const eventOrganizersRelations = relations(
  eventOrganizers,
  ({ one }) => ({
    event: one(events, {
      fields: [eventOrganizers.eventId],
      references: [events.id],
      relationName: "eventOrganizers",
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

export const eventRegistrations = pgTable(
  "event_registrations",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .references(() => events.id)
      .notNull(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    data: jsonb("data").$type<RegistrationData>().notNull(),
  },
  (table) => [
    uniqueIndex("event_registrations_eventId_userId_unique").on(
      table.eventId,
      table.userId,
    ),
    index("event_registrations_eventId_idx").on(table.eventId),
    index("event_registrations_userId_idx").on(table.userId),
  ],
);

export const eventRegistrationsRelations = relations(
  eventRegistrations,
  ({ one }) => ({
    event: one(events, {
      fields: [eventRegistrations.eventId],
      references: [events.id],
      relationName: "eventRegistrations",
    }),
    user: one(users, {
      fields: [eventRegistrations.userId],
      references: [users.id],
      relationName: "user_event_registrations",
    }),
  }),
);
