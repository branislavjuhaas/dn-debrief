import { db } from "#server/db";
import { eventRegistrations } from "#server/db/schema/events";
import { requireUser } from "#server/utils/auth";
import { eq } from "drizzle-orm";
import * as z from "zod";

defineRouteMeta({
  openAPI: {
    tags: ["Events"],
    summary: "Update event registration",
    description: "Update details for a specific event registration.",
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "The slug of the event",
      },
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "integer" },
        description: "The ID of the registration",
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
              confirmed: { type: "boolean" },
              collectedDetails: {
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
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Registration updated successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                registration: { type: "object", additionalProperties: true },
              },
              required: ["success", "registration"],
            },
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
      403: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      404: {
        description: "Registration not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
});

const updateRegistrationSchema = z.object({
  roleUuid: z.uuid().optional(),
  teamName: z.string().trim().max(100).nullable().optional(),
  confirmed: z.boolean().optional(),
  collectedDetails: z
    .object({
      name: z.string().trim().optional(),
      surname: z.string().trim().optional(),
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
        questionUuid: z.uuid(),
        answer: z.union([
          z.string(),
          z.array(z.string()),
          z.number(),
          z.boolean(),
          z.null(),
        ]),
      }),
    )
    .optional(),
});

export default defineEventHandler(async (event) => {
  await requireUser(event, [
    "developer",
    "admin",
    "chief_adjudicator",
    "organizer",
    "junior_organizer",
  ]);

  const slug = getRouterParam(event, "slug") ?? "";
  const registrationId = Number.parseInt(getRouterParam(event, "id") ?? "", 10);

  if (Number.isNaN(registrationId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid registration ID",
    });
  }

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

  const existingRegistration = await db.query.eventRegistrations.findFirst({
    where: {
      id: registrationId,
      eventId: eventRecord.id,
    },
  });

  if (!existingRegistration) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "Registration not found",
    });
  }

  const body = await readValidatedBody(event, updateRegistrationSchema.parse);

  const updatedRegistrationData = {
    ...existingRegistration.registrationData,
    ...(body.roleUuid !== undefined ? { roleUuid: body.roleUuid } : {}),
    ...(body.teamName !== undefined
      ? { teamName: normalizeTeamName(body.teamName) || undefined }
      : {}),
    ...(body.answers !== undefined ? { questions: body.answers } : {}),
  };

  const updatedCollectedDetails = body.collectedDetails
    ? {
        ...existingRegistration.collectedDetails,
        ...body.collectedDetails,
      }
    : existingRegistration.collectedDetails;

  const [updated] = await db
    .update(eventRegistrations)
    .set({
      registrationData: updatedRegistrationData,
      collectedDetails: updatedCollectedDetails,
      ...(body.confirmed !== undefined ? { confirmed: body.confirmed } : {}),
    })
    .where(eq(eventRegistrations.id, registrationId))
    .returning();

  return {
    success: true,
    registration: updated,
  };
});
