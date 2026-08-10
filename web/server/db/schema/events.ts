import type { SQL } from "drizzle-orm";
import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  integer,
  index,
  serial,
  jsonb,
  pgEnum,
  primaryKey,
  boolean,
} from "drizzle-orm/pg-core";

import { leagueEnum, regionEnum } from "./clubs.js";
import { users } from "./auth.js";
import { payments } from "./payments.js";

export const eventTypeEnum = pgEnum("event_type", [
  "tournament",
  "workshop",
  "other",
]);

export type FeaturedProperty = {
  icon: string;
  text: string;
  badge?: {
    text: string;
    href: string;
  };
};

export type SchedulePart = {
  // Beginning time in minutes from the start of the day (e.g. 540 for 9:00 AM)
  beginning: number;
  // Duration in minutes (e.g. 120 for 2 hours)
  duration: number;
  text: string;
};

export type Day = {
  date: Date;
  schedule: SchedulePart[];
};

export type Schedule = {
  days: Day[];
};

export type RegistrationQuestion = {
  uuid: string;
  title: string;
  description?: string;
  required?: boolean;
  type?: "text" | "date" | "select" | "multiselect";
  options?: string[];
};

export type RegistrationSection = {
  uuid: string;
  title: string;
  questions: RegistrationQuestion[];
  next?: {
    type: "static" | "conditional";
    then?: string;
    rules?: { question: string; value: any; then: string }[];
    fallback?: string;
  } | null;
};

export type RegistrationsConfig =
  | {
      deadline: Date;
      href: string;
    }
  | {
      allowedRoles?: string[];
      requireAccount: boolean;
      requireMembership: boolean;
      softDeadline?: Date;
      hardDeadline?: Date;
      collectedDetails: (
        | "name"
        | "surname"
        | "email"
        | "phone"
        | "birthDate"
        | "street"
        | "postalCode"
        | "town"
      )[];
      sections: RegistrationSection[];
      conditionalStartSections?: { role: string; section: string }[];
      fallbackStartSection: string;
    };

export type RegistrationData = {
  question: string;
  answer: any;
}[];

export type CollectedDetails = {
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  street?: string;
  postalCode?: string;
  town?: string;
};

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    slug: text("Slug").notNull().unique(),
    name: text("name").notNull(),
    search: text("search")
      .notNull()
      .generatedAlwaysAs(
        (): SQL =>
          sql`(lower(regexp_replace(public.immutable_unaccent(${events.name}), '[^a-zA-Z0-9]', '', 'g')))`,
      ),
    type: eventTypeEnum("type").notNull(),
    description: jsonb("description").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    beginning: timestamp("beginning").notNull(),
    end: timestamp("end").notNull(),
    targetLeague: leagueEnum("target_league"),
    targetRegion: regionEnum("target_region"),
    place: text("place"),
    featuredProperties: jsonb("featured_properties")
      .$type<FeaturedProperty[]>()
      .notNull()
      .default([]),
    schedule: jsonb("schedule")
      .$type<Schedule>()
      .notNull()
      .default({ days: [] }),
    registrationConfig: jsonb("registration_config")
      .$type<RegistrationsConfig>()
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("events_type_idx").on(table.type),
    index("events_beginning_end_idx").on(table.beginning, table.end),
    index("events_targetLeague_idx").on(table.targetLeague),
    index("events_targetRegion_idx").on(table.targetRegion),
    index("events_search_idx").using("gin", sql`${table.search} gin_trgm_ops`),
  ],
);

export const eventOrganizers = pgTable(
  "event_organizers",
  {
    eventId: integer("event_id")
      .references(() => events.id, { onDelete: "cascade" })
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
    primaryKey({ columns: [table.eventId, table.userId] }),
    index("event_organizers_userId_idx").on(table.userId),
    index("event_organizers_eventId_idx").on(table.eventId),
  ],
);

export const eventRegistrations = pgTable(
  "event_registrations",
  {
    eventId: integer("event_id")
      .references(() => events.id, { onDelete: "cascade" })
      .notNull(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    registrationData: jsonb("registration_data")
      .$type<RegistrationData>()
      .notNull(),
    collectedDetails: jsonb("collected_details")
      .$type<CollectedDetails>()
      .notNull(),
    confirmed: boolean("confirmed").default(false).notNull(),
    paymentId: integer("payment_id")
      .unique()
      .references(() => payments.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.eventId, table.userId] }),
    index("event_registrations_userId_idx").on(table.userId),
    index("event_registrations_eventId_idx").on(table.eventId),
  ],
);
