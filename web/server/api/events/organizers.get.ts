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
              type: "object",
              properties: {
                organizers: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer", example: 12 },
                      name: { type: "string", example: "Marek" },
                      surname: { type: "string", example: "Novotny" },
                      email: {
                        type: "string",
                        format: "email",
                        example: "marek@example.com",
                      },
                      phone: {
                        type: "string",
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
