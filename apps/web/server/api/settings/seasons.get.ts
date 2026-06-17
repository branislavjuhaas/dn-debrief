import { getSetting } from "#server/utils/settings";
import { db } from "@dn-debrief/db";
import { clubMemberships } from "@dn-debrief/db/schema";
import { eq } from "drizzle-orm";
import * as z from "zod";

const seasonsQuery = z.object({
  all: z.stringbool().optional(),
});

export default defineEventHandler(async (event) => {
  const { all } = await getValidatedQuery(event, seasonsQuery.parse);
  const seasons = await getSetting("current-seasons");

  if (all || !seasons) {
    return { seasons };
  }

  const user = await getUser(event);

  if (!user) {
    return { seasons };
  }

  const memberships = await db
    .select({ season: clubMemberships.season })
    .from(clubMemberships)
    .where(eq(clubMemberships.userId, user.id));

  // filter out seasons that are in memberships
  const filteredSeasons = seasons.filter(
    (s) => !memberships.map((m) => m.season).includes(s),
  );
  return { seasons: filteredSeasons };
});
