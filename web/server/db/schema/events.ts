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
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";

import { leagueEnum, regionEnum } from "./clubs.js";
import { users } from "./auth.js";
import { payments } from "./payments.js";

export const eventTypeEnum = pgEnum("event_type", [
  "tournament",
  "workshop",
  "other",
]);

export type UUID = string;

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
  date: string; // YYYY-MM-DD
  schedule: SchedulePart[];
};

export type Schedule = {
  days: Day[];
};

export type RegistrationQuestion =
  | {
      uuid: UUID;
      title: string;
      description?: string;
      required: boolean;
      type: "text" | "date" | "number" | "boolean";
      deleted?: boolean;
    }
  | {
      uuid: UUID;
      title: string;
      description?: string;
      required: boolean;
      type: "select" | "multiselect";
      options: string[];
      deleted?: boolean;
    };

export type RegistrationRule =
  | {
      questionUuid: UUID;
      operator: "equals" | "not_equals";
      value: string | number | boolean | null;
      thenUuid: UUID;
    }
  | {
      questionUuid: UUID;
      operator: "in" | "not_in";
      value: (string | number)[];
      thenUuid: UUID;
    };

export type RegistrationSection = {
  uuid: UUID;
  title: string;
  questions: RegistrationQuestion[];
  visibleWhen?: RegistrationRule[];
  deleted?: boolean;
};

export type RegistrationRole = {
  uuid: UUID;
  name: string;
  cost: number;
  credentialRequirements: "none" | "adjudicator" | "non-adjudicator";
  roleType: "contestant" | "adjudicator" | "other";
  hardDeadline?: string; // YYYY-MM-DD
  deleted?: boolean;
};

export type RegistrationsConfig =
  | {
      deadline: string; // YYYY-MM-DD
      href: string;
    }
  | {
      roles: RegistrationRole[];
      requireAccount: boolean;
      requireMembership: boolean;
      softDeadline?: string; // YYYY-MM-DD
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
      conditionalStartSections?: { roleUuid: UUID; sectionUuid: UUID }[];
      fallbackStartSection: UUID;
    };

export type RegistrationData = {
  roleUuid: UUID;
  questions: {
    questionUuid: UUID;
    answer: string | string[] | number | boolean | null;
  }[];
};

export type CollectedDetails = {
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  birthDate?: string; // YYYY-MM-DD
  street?: string;
  postalCode?: string;
  town?: string;
};

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    search: text("search")
      .notNull()
      .generatedAlwaysAs(
        (): SQL =>
          sql`(lower(regexp_replace(public.immutable_unaccent(${events.name}), '[^a-zA-Z0-9]', '', 'g')))`,
      ),
    type: eventTypeEnum("type").notNull(),
    description: jsonb("description").notNull(),
    fileUrls: text("file_urls").array().notNull().default([]),
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
    check("events_end_after_beginning", sql`${table.end} > ${table.beginning}`),
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
    id: serial("id").primaryKey(),
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
    // Whether the registration has been confirmed by the legal guardian
    // (if applicable for the current user)
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
    uniqueIndex("event_registrations_eventId_userId_idx").on(
      table.eventId,
      table.userId,
    ),
    index("event_registrations_userId_idx").on(table.userId),
    index("event_registrations_eventId_idx").on(table.eventId),
  ],
);
