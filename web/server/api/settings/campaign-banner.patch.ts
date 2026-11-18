import { setCampaignBanner } from "#server/utils/settings";
import * as z from "zod";

defineRouteMeta({
  openAPI: {
    tags: ["Settings"],
    summary: "Update campaign banner",
    description:
      "Update the admin-managed campaign banner configuration shown on public pages.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
              title: { type: "string" },
              text: { type: "string" },
              url: { type: "string", format: "uri" },
              linkLabel: { type: "string" },
            },
            required: ["enabled", "title", "text", "url", "linkLabel"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "The updated campaign banner configuration",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                campaignBanner: {
                  type: "object",
                  properties: {
                    enabled: { type: "boolean" },
                    title: { type: "string" },
                    text: { type: "string" },
                    url: { type: "string" },
                    linkLabel: { type: "string" },
                  },
                  required: ["enabled", "title", "text", "url", "linkLabel"],
                },
              },
              required: ["campaignBanner"],
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
      422: {
        description: "Validation failed",
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

const campaignBannerSchema = z
  .object({
    enabled: z.boolean(),
    title: z.string().trim().max(120),
    text: z.string().trim().max(300),
    url: z.union([z.literal(""), z.url()]),
    linkLabel: z.string().trim().max(60),
  })
  .superRefine((value, ctx) => {
    if (!value.enabled) {
      return;
    }

    const requiredFields = [
      ["title", value.title],
      ["text", value.text],
      ["url", value.url],
      ["linkLabel", value.linkLabel],
    ] as const;

    for (const [field, fieldValue] of requiredFields) {
      if (!fieldValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: "This field is required when the banner is enabled",
        });
      }
    }
  });

export default defineEventHandler(async (event) => {
  await requireUser(event, ["developer", "admin"]);

  const body = await readValidatedBody(event, campaignBannerSchema.parse);
  const campaignBanner = await setCampaignBanner(body);

  return { campaignBanner };
});
