import { getActiveClubs } from "#server/utils/clubs";

export default defineEventHandler(async (_event) => {
  const clubs = await getActiveClubs();
  return { clubs };
});
