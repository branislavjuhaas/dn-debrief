import type { events } from "#server/db/schema/events";

export type Event = typeof events.$inferSelect;
