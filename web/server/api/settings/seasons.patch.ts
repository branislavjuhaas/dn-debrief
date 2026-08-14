import * as z from "zod";

defineRouteMeta({
  openAPI: {
    tags: ["Settings"],
    summary: "Update seasons",
    description: "Update the currently available seasons",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              seasons: {
                type: "array",
                items: { type: "number" },
                example: [2026, 2027],
              },
            },
            required: ["seasons"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "The updated seasons",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                seasons: {
                  type: "array",
                  items: { type: "number" },
                  example: [2026, 2027],
                },
              },
              required: ["seasons"],
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

const seasonsBody = z.object({
  seasons: z.array(z.number()),
});

export default defineEventHandler(async (event) => {
  await requireUser(event, ["developer", "admin"]);
  const { seasons } = await readValidatedBody(event, seasonsBody.parse);

  const updatedSeasons = await setSetting("current-seasons", seasons);

  return { seasons: updatedSeasons?.currentSeasons || [] };
});
