import {
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";
import type { CampaignBanner } from "#shared/types/settings";

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  currentSeasons: integer("current_seasons").array().notNull().default([]),
  campaignBanner: jsonb("campaign_banner").$type<CampaignBanner>(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
