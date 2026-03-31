import type { events } from "#server/db/schema/events";

type Event = typeof events.$inferSelect;
