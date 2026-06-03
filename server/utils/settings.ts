import { db } from "#server/db/db";

export const getSetting = async (key: "currentSeasons") => {
  const settings = await db.query.settings.findFirst();
  return settings?.[key];
};
