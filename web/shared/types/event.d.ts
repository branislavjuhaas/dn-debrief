import type { events } from "#server/db/schema/events";

export type Event = SerializeInferredDates<typeof events.$inferSelect>;
