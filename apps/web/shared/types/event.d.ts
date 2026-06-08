import type { events } from "@dn-debrief/db/schema";

export type Event = SerializeInferredDates<typeof events.$inferSelect>;
