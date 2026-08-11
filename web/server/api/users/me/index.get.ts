import { requireUser } from "#server/utils/auth";
import { db } from "#server/db";

defineRouteMeta({
  openAPI: {
    tags: ["Users"],
    description: "Get the authenticated user's profile",
    responses: {
      200: {
        description: "The authenticated user profile",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/UserProfile" },
              },
              required: ["user"],
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
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
    $global: {
      components: {
        schemas: {
          UserProfile: {
            type: "object",
            properties: {
              id: { type: "integer", readOnly: true, example: 1 },
              name: { type: "string", example: "Marek" },
              surname: { type: "string", example: "Novotný" },
              email: { type: "string", format: "email", nullable: true },
              role: { type: "string", example: "user" },
              image: { type: "string", nullable: true },
              birthDate: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              awards: { type: "array", items: { type: "object" } },
              legalGuardian: { type: "object", nullable: true },
              payments: { type: "array", items: { type: "object" } },
              clubMemberships: { type: "array", items: { type: "object" } },
              managedClubs: { type: "array", items: { type: "object" } },
              accounts: { type: "array", items: { type: "object" } },
            },
            required: ["id", "name", "surname", "role"],
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const userData = await db.query.users.findFirst({
    where: { id: user.id },
    with: {
      awards: true,
      legalGuardian: true,
      payments: true,
      clubMemberships: {
        with: {
          club: true,
        },
      },
      managedClubs: true,
      accounts: {
        columns: {
          providerId: true,
        },
      },
    },
  });

  return { user: userData };
});
