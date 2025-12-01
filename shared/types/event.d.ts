import type { InferSelectModel } from "drizzle-orm";
import type { events } from "~~/server/db/schema/events";

export type Event = InferSelectModel<typeof events>;
