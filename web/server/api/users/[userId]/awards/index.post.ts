import { db } from "#server/db";
import { awards } from "#server/db/schema/auth";
import z from "zod";

defineRouteMeta({
  openAPI: {
    tags: ["User Awards"],
    description: "Create an award for a user",
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        description: "The ID of the user to award",
        schema: {
          type: "integer",
        },
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              award: {
                type: "string",
                description: "The award name",
              },
              level: {
                type: "integer",
                minimum: 1,
                description: "The award level",
              },
            },
            required: ["award", "level"],
          },
        },
      },
    },
    responses: {
      201: {
        description: "The created award",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                award: {
                  $ref: "#/components/schemas/Award",
                },
              },
              required: ["award"],
            },
          },
        },
      },
      400: {
        description: "Invalid request body",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      403: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
    },
    $global: {
      components: {
        schemas: {
          Award: {
            type: "object",
            properties: {
              award: {
                type: "string",
                example: "Best Speaker",
              },
              userId: {
                type: "integer",
                example: 1,
              },
              level: {
                type: "integer",
                minimum: 1,
                example: 1,
              },
              awardedBy: {
                type: "integer",
                nullable: true,
                example: 2,
              },
              createdAt: {
                type: "string",
                format: "date-time",
                example: "2023-01-01T00:00:00Z",
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                example: "2023-01-01T00:00:00Z",
              },
            },
            required: [
              "award",
              "userId",
              "level",
              "awardedBy",
              "createdAt",
              "updatedAt",
            ],
          },
        },
      },
    },
  },
});

const awardBody = z.object({
  award: z
    .string()
    .min(1, "Award name is required")
    .refine((v) => awardNames.includes(v), "Invalid award name"),
  level: z.number().int().min(1, "Level must be a positive integer"),
});

export default defineEventHandler(async (event) => {
  const user = await requireUser(event, [
    "developer",
    "admin",
    "chief_adjudicator",
  ]);
  const userId = Number.parseInt(getRouterParam(event, "userId") ?? "", 10);
  const { award, level } = await readValidatedBody(event, awardBody.parse);

  const insertedAward = await db
    .insert(awards)
    .values({ userId, award, level, awardedBy: user.id })
    .returning();

  if (!insertedAward[0]) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Failed to insert award",
    });
  }

  setResponseStatus(event, 201);
  return { award: insertedAward[0] };
});
