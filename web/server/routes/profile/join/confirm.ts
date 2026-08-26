import { clubMemberships } from "#server/db/schema/clubs";
import { db } from "#server/db";
import { and, eq, inArray } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event);

  const userId = deobfuscateId(token as string);

  if (!token || !userId) {
    // Redirect to an error page if the token is invalid
    throw createError({
      statusCode: 400,
      statusMessage:
        "Token, ktorý ste zadali, je neplatný. Skontrolujte, prosím, správnosť odkazu.",
    });
  }

  const currentSeasons = (await getSetting("current-seasons")) ?? [];

  const updatedSeasons = await db
    .update(clubMemberships)
    .set({
      confirmed: true,
    })
    .where(
      and(
        eq(clubMemberships.userId, userId),
        inArray(clubMemberships.season, currentSeasons),
      ),
    );

  if (updatedSeasons.rowCount === 0) {
    await sendRedirect(event, "/profile/join/finished?error=true");
  }

  await sendRedirect(event, "/profile/join/finished?verified=true");
});
