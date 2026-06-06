import { db } from "#server/db/db";
import { eq } from "drizzle-orm";
import { clubMemberships, clubs } from "../db/schema/clubs";

export const getActiveClubs = async () => {
  return await db
    .select({ id: clubs.id, name: clubs.name })
    .from(clubs)
    .where(eq(clubs.isActive, true));
};

export const isClubActive = async (id: number) => {
  const club = await db.query.clubs.findFirst({
    columns: { isActive: true },
    where: {
      id: id,
    },
  });
  return club?.isActive ?? false;
};

export const createClubMembership = async (
  clubMembershipData: typeof clubMemberships.$inferInsert,
) => {
  return await db
    .insert(clubMemberships)
    .values(clubMembershipData)
    .onConflictDoNothing()
    .returning();
};
