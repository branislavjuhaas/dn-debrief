import { createClubMembership, isClubActive } from "#server/utils/clubs";
import * as z from "zod";

const schema = z.object({
  registrationType: z.enum([
    "junior_student",
    "senior_student",
    "teacher",
    "graduate",
  ]),
});

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const clubId = Number.parseInt(getRouterParam(event, "id")!);

  if (!(await isClubActive(clubId))) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not found",
      message: "Club not found",
    });
  }

  const { registrationType } = await readValidatedBody(event, schema.parse);
  const currentSeasons = await getSetting("currentSeasons");

  const clubMemberships = [];

  for (const season of currentSeasons ?? []) {
    const membership = await createClubMembership({
      clubId,
      userId: user.id,
      season,
      registrationType,
    });

    if (membership[0]) {
      clubMemberships.push(membership[0]);
    }
  }

  return {
    clubMemberships,
  };
});
