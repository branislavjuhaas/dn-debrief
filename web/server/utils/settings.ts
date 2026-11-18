import { db } from "#server/db";
import { settings } from "#server/db/schema/settings";
import type { CampaignBanner } from "#shared/types/settings";
import { EMPTY_CAMPAIGN_BANNER } from "#shared/utils/settings";

export const getSetting = async (key: "current-seasons") => {
  const settings = await db.query.settings.findFirst();

  if (key === "current-seasons") {
    const seasons = settings?.currentSeasons;

    const filteredSeasons = seasons?.filter((season) => {
      return season >= new Date().getFullYear();
    });
    return filteredSeasons;
  }
  return null;
};

export const setSetting = async (key: "current-seasons", value: number[]) => {
  // If there is no settings record, create one
  const existingSettings = await db.query.settings.findFirst();
  if (!existingSettings) {
    const currentSeasons =
      key === "current-seasons" ? value : [new Date().getFullYear()];

    const result = await db
      .insert(settings)
      .values({ currentSeasons: currentSeasons })
      .returning();
    return result[0];
  }

  if (key === "current-seasons") {
    const result = await db
      .update(settings)
      .set({ currentSeasons: value })
      .returning();
    return result[0];
  }
};

/**
 * Returns the stored campaign banner configuration.
 *
 * Falls back to a disabled empty banner when nothing has been configured yet.
 */
export const getCampaignBanner = async (): Promise<CampaignBanner> => {
  const settingsRow = await db.query.settings.findFirst();

  return {
    ...EMPTY_CAMPAIGN_BANNER,
    ...settingsRow?.campaignBanner,
  };
};

/**
 * Stores the campaign banner configuration in the singleton settings row.
 */
export const setCampaignBanner = async (
  value: CampaignBanner,
): Promise<CampaignBanner> => {
  const settingsRow = await db.query.settings.findFirst();

  if (!settingsRow) {
    const [created] = await db
      .insert(settings)
      .values({ campaignBanner: value })
      .returning();

    return created?.campaignBanner ?? value;
  }

  const [updated] = await db
    .update(settings)
    .set({ campaignBanner: value })
    .returning();

  return updated?.campaignBanner ?? value;
};
