import { db } from "#server/db";
import { eventRegistrations } from "#server/db/schema/events";
import { payments } from "#server/db/schema/payments";
import { getUser } from "#server/utils/auth";
import { generateActionMail, sendEmail } from "#server/utils/mail";
import { obfuscateId } from "#server/utils/obfuscate";
import { isPlatformRegistration } from "#shared/utils/events";
import { differenceInYears } from "date-fns";
import * as z from "zod";

defineRouteMeta({
  openAPI: {
    tags: ["Events"],
    summary: "Register for an event",
    description:
      "Submit an event registration for an authenticated user or a guest participant.",
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "The slug of the event to register for",
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              roleUuid: { type: "string", format: "uuid" },
              teamName: { type: "string" },
              guestDetails: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  surname: { type: "string" },
                  email: { type: "string", format: "email" },
                  phone: { type: "string" },
                  birthDate: { type: "string" },
                  street: { type: "string" },
                  postalCode: { type: "string" },
                  town: { type: "string" },
                },
              },
              answers: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    questionUuid: { type: "string", format: "uuid" },
                    answer: { type: "string", nullable: true },
                  },
                  required: ["questionUuid"],
                },
              },
            },
            required: ["roleUuid"],
          },
        },
      },
    },
    responses: {
      201: {
        description: "Registration completed successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                registrationId: { type: "integer" },
                paymentId: { type: "string", format: "uuid", nullable: true },
                confirmed: { type: "boolean" },
              },
              required: ["success", "registrationId", "confirmed"],
            },
          },
        },
      },
      400: {
        description: "Bad request / validation failed",
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
        description: "Event not found",
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
  roleUuid: z.string().uuid(),
  teamName: z.string().trim().max(100).optional(),
  guestDetails: z
    .object({
      name: z.string().trim().min(1).optional(),
      surname: z.string().trim().min(1).optional(),
      email: z.string().trim().email().optional(),
      phone: z.string().trim().optional(),
      birthDate: z.string().optional(),
      street: z.string().optional(),
      postalCode: z.string().optional(),
      town: z.string().optional(),
    })
    .optional(),
  answers: z
    .array(
      z.object({
        questionUuid: z.string().uuid(),
        answer: z.union([
          z.string(),
          z.array(z.string()),
          z.number(),
          z.boolean(),
          z.null(),
        ]),
      }),
    )
    .default([]),
});

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") ?? "";
  const body = await readValidatedBody(event, bodySchema.parse);

  // 1. Fetch event
  const eventRecord = await db.query.events.findFirst({
    where: { slug },
  });

  if (!eventRecord) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `Event with slug "${slug}" not found`,
    });
  }

  // 2. Validate configuration type
  if (!isPlatformRegistration(eventRecord.registrationConfig)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "This event does not accept registrations via the platform",
    });
  }

  const config = eventRecord.registrationConfig;

  // 3. Resolve role
  const role = config.roles.find((r) => r.uuid === body.roleUuid && !r.deleted);
  if (!role) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "The selected registration role is not valid",
    });
  }

  // 4. Validate deadlines
  const now = Date.now();
  if (role.hardDeadline) {
    const hardTime = new Date(role.hardDeadline).getTime();
    if (!Number.isNaN(hardTime) && now > hardTime) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Registration for this role has ended",
      });
    }
  }

  if (config.softDeadline) {
    const softTime = new Date(config.softDeadline).getTime();
    if (!Number.isNaN(softTime) && now > softTime) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Registration for this event has ended",
      });
    }
  }

  // 5. Auth & membership validation
  const user = await getUser(event);

  if (config.requireAccount && !user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message:
        "An authenticated account is required to register for this event",
    });
  }

  if (config.requireMembership) {
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "Membership is required to register",
      });
    }

    const currentYear = new Date().getFullYear();
    const activeMembership = await db.query.clubMemberships.findFirst({
      where: {
        userId: user.id,
        season: currentYear,
        confirmed: true,
      },
    });

    if (!activeMembership) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message:
          "Active confirmed membership in SDA for the current season is required",
      });
    }
  }

  // 6. Role credential check
  if (role.credentialRequirements === "adjudicator" && user) {
    const isAdjudicator =
      (user.credential ?? 0) > 0 ||
      ["chief_adjudicator", "admin", "developer"].includes(user.role);

    if (!isAdjudicator) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "This role requires adjudicator accreditation",
      });
    }
  }

  // 7. Duplicate registration check
  if (user) {
    const existingRegistration = await db.query.eventRegistrations.findFirst({
      where: {
        eventId: eventRecord.id,
        userId: user.id,
      },
    });

    if (existingRegistration) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "You are already registered for this event",
      });
    }
  } else {
    const email = body.guestDetails?.email?.toLowerCase();
    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "An email address is required for guest registration",
      });
    }

    const eventRegs = await db.query.eventRegistrations.findMany({
      where: {
        eventId: eventRecord.id,
      },
    });

    const existingGuest = eventRegs.some(
      (r) => r.collectedDetails?.email?.toLowerCase() === email,
    );

    if (existingGuest) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message:
          "A registration with this email address already exists for this event",
      });
    }
  }

  // 8. Payment creation if fee applies
  let paymentId: string | null = null;
  const priceInCents = Math.round((role.cost ?? 0) * 100);

  if (priceInCents > 0) {
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message:
          "An authenticated account is required to register for a paid role",
      });
    }

    const [paymentRow] = await db
      .insert(payments)
      .values({
        userId: user.id,
        paymentType: "event",
        description: `Registrácia na podujatie: ${eventRecord.name} (${role.name})`,
        amount: priceInCents,
      })
      .returning();

    paymentId = paymentRow?.id ?? null;

    if (!paymentId) {
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: "Failed to generate payment record",
      });
    }
  }

  // 9. Check age & legal guardian confirmation requirement
  const userBirthDate = user?.birthDate ? new Date(user.birthDate) : null;
  const guestBirthDate = body.guestDetails?.birthDate
    ? new Date(body.guestDetails.birthDate)
    : null;
  const effectiveBirthDate = userBirthDate || guestBirthDate;
  const isUnder18 = effectiveBirthDate
    ? Math.abs(differenceInYears(effectiveBirthDate, new Date())) < 18
    : false;

  const confirmed = !isUnder18;

  // 10. Data persistence
  // For authenticated users, do NOT duplicate personal profile details in collectedDetails
  const collectedDetails = user ? {} : (body.guestDetails ?? {});

  const [registration] = await db
    .insert(eventRegistrations)
    .values({
      eventId: eventRecord.id,
      userId: user ? user.id : null,
      registrationData: {
        roleUuid: role.uuid,
        teamName: body.teamName,
        questions: body.answers,
      },
      collectedDetails,
      confirmed,
      paymentId,
    })
    .returning();

  // 11. Send legal guardian confirmation email if under 18
  if (user && isUnder18 && registration) {
    const legalGuardian = await db.query.legalGuardians.findFirst({
      columns: {
        email: true,
        name: true,
      },
      where: {
        userId: user.id,
      },
    });

    if (legalGuardian && legalGuardian.email) {
      const confirmUrl = `${process.env.BETTER_AUTH_URL || ""}/events/${slug}/confirm?token=${obfuscateId(user.id)}&reg=${registration.id}`;
      await sendEmail(
        legalGuardian.email,
        `Potvrdenie registrácie na podujatie ${eventRecord.name}`,
        `Dobrý deň, ${legalGuardian.name.split(" ")[0]}. Registrácia vášho dieťaťa na podujatie ${eventRecord.name} bola zaznamenaná v systéme. Pre jej potvrdenie, prosím, kliknite na nasledujúci odkaz: ${confirmUrl}`,
        generateActionMail(
          `Overte registráciu dieťaťa na ${eventRecord.name}`,
          "Potvrdenie registrácie",
          `Dobrý deň, ${legalGuardian.name.split(" ")[0]}.`,
          confirmUrl,
          "Potvrdiť registráciu",
        ),
      );
    }
  }

  setResponseStatus(event, 201);
  return {
    success: true,
    registrationId: registration?.id,
    paymentId,
    confirmed,
  };
});
