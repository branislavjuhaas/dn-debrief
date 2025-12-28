import type { InferSelectModel } from "drizzle-orm";
import type { events } from "hub:db:schema";

export type Event = InferSelectModel<typeof events>;
