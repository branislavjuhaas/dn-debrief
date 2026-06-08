import { getSetting } from "#server/utils/settings";

export default defineEventHandler(async (_event) => {
  const seasons = await getSetting("current-seasons");
  return { seasons };
});
