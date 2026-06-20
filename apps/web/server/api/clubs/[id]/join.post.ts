import { db } from "@dn-debrief/db";
import * as z from "zod";
import { clubMemberships } from "@dn-debrief/db/schema";
import { differenceInYears } from "date-fns";

const bodySchema = z.object({
  registrationType: z.enum([
    "junior_student",
    "senior_student",
    "teacher",
    "graduate",
  ]),
});

export default defineEventHandler(async (event) => {
  // Authentication & parameter resolution
  const user = await requireUser(event);
  const clubId = Number.parseInt(getRouterParam(event, "id") ?? "", 10);

  // Validate club existence
  const club = await db.query.clubs.findFirst({
    where: {
      id: clubId,
    },
  });

  if (!club) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "Club not found",
    });
  }

  // Request payload & configuration parsing
  const { registrationType } = await readValidatedBody(event, bodySchema.parse);
  const currentSeasons = (await getSetting("current-seasons")) ?? [];

  const fullUser = await db.query.users.findFirst({
    where: {
      id: user.id,
    },
    columns: {
      birthDate: true,
    },
  });

  const age = Math.abs(
    differenceInYears(fullUser?.birthDate || new Date(), new Date()),
  );

  // Generate rows for every ongoing season
  const membershipRows = currentSeasons.map((season) => ({
    userId: user.id,
    clubId,
    registrationType,
    season,
    confirmed: age >= 18,
  }));

  // Bulk database insertion
  const insertedMemberships = await db
    .insert(clubMemberships)
    .values(membershipRows)
    .onConflictDoNothing()
    .returning();

  // Hydrate results with parent club data for frontend store requirements
  const clubMembershipsWithClub = insertedMemberships.map((membership) => ({
    ...membership,
    club,
  }));

  return {
    clubMemberships: clubMembershipsWithClub,
  };
});
