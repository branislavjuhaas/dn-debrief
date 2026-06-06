import { db } from "#server/db/db";

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
