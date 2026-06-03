import { getSetting } from "#server/utils/settings";

export default defineEventHandler(async (_event) => {
  const seasons = await getSetting("currentSeasons");
  return { seasons };
});
