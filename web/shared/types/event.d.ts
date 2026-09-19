import type { events } from "#server/db/schema/events";

export type Event = Omit<
  SerializeInferredDates<typeof events.$inferSelect>,
  "address"
> & {
  address: string;
};
