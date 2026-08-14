import { db } from "#server/db";
import { settings } from "#server/db/schema/settings";

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
