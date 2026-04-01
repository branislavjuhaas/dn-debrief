import type { clubs } from "#server/db/schema/clubs";

export type Club = typeof clubs.$inferSelect;
