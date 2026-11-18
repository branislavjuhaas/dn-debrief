import { db } from "#server/db";

defineRouteMeta({
  openAPI: {
    tags: ["Events"],
    summary: "List event organizers",
    description:
      "Get users eligible to be assigned as event organizers based on role.",
    responses: {
      200: {
        description: "List of eligible organizers",
        content: {
          "application/json": {
            schema: {
              type: "object" as const,
              properties: {
                organizers: {
                  type: "array" as const,
                  items: {
                    type: "object" as const,
                    properties: {
                      id: { type: "integer" as const, example: 12 },
                      name: { type: "string" as const, example: "Marek" },
                      surname: { type: "string" as const, example: "Novotny" },
                      email: {
                        type: "string" as const,
                        format: "email",
                        example: "marek@example.com",
                      },
                      phone: {
                        type: "string" as const,
                        nullable: true,
                        example: "+421900000000",
                      },
                    },
                    required: ["id", "name", "surname", "email", "phone"],
                  },
                },
              },
              required: ["organizers"],
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

export default defineEventHandler(async (event) => {
  await requireUser(event, [
    "developer",
    "admin",
    "chief_adjudicator",
    "organizer",
    "junior_organizer",
  ]);

  const organizers = await db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      surname: true,
      email: true,
      phone: true,
    },
    where: {
      role: {
        in: [
          "developer",
          "admin",
          "chief_adjudicator",
          "organizer",
          "junior_organizer",
        ],
      },
    },
  });

  return { organizers };
});
