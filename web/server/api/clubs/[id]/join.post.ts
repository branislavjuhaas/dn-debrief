import { db } from "#server/db";
import * as z from "zod";
import { clubMemberships } from "#server/db/schema/clubs";
import { differenceInYears } from "date-fns";

defineRouteMeta({
  openAPI: {
    tags: ["Clubs"],
    description: "Join a club for the current or upcoming seasons",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "integer" },
        description: "The ID of the club to join",
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              registrationType: {
                type: "string",
                enum: [
                  "junior_student",
                  "senior_student",
                  "teacher",
                  "graduate",
                ],
              },
            },
            required: ["registrationType"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "The created club memberships",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                clubMemberships: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      userId: { type: "integer" },
                      clubId: { type: "integer" },
                      registrationType: { type: "string" },
                      season: { type: "integer" },
                      confirmed: { type: "boolean" },
                      club: { $ref: "#/components/schemas/Club" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: "Bad request",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      404: {
        description: "Club not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
});

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

  if (currentSeasons.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "No current seasons available for registration",
    });
  }

  const age = Math.abs(
    differenceInYears(user.birthDate || new Date(), new Date()),
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

  if (age < 18) {
    const legalGuardian = await db.query.legalGuardians.findFirst({
      columns: {
        email: true,
        name: true,
      },
      where: {
        userId: user.id,
      },
    });

    if (!legalGuardian || !legalGuardian.email) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Legal guardian email is required",
      });
    }

    await sendEmail(
      legalGuardian?.email,
      "Potvrdenie registrácie do SDA",
      `Dobrý deň, ${legalGuardian?.name.split(" ")[0]}. Registrácia vášho dieťaťa bola zaznamenaná v systéme. Pre jej potvrdenie, prosím, kliknite na nasledujúci odkaz: ${process.env.BETTER_AUTH_URL}/profile/join/verify?token=${obfuscateId(user.id)}`,
      generateActionMail(
        "Overte registráciu vášho dieťaťa",
        "Potvrdenie registrácie",
        `Dobrý deň, ${legalGuardian?.name.split(" ")[0]}.`,
        "Potvrdiť registráciu",
        `${process.env.BETTER_AUTH_URL}/profile/join/verify?token=${obfuscateId(user.id)}`,
      ),
    );
  }

  // Hydrate results with parent club data for frontend store requirements
  const clubMembershipsWithClub = insertedMemberships.map((membership) => ({
    ...membership,
    club,
  }));

  return {
    clubMemberships: clubMembershipsWithClub,
  };
});
