import { db } from "#server/db/db";
import { eq } from "drizzle-orm";
import { clubs } from "../db/schema/clubs";

export const getActiveClubs = async () => {
  return await db
    .select({ id: clubs.id, name: clubs.name })
    .from(clubs)
    .where(eq(clubs.isActive, true));
};
