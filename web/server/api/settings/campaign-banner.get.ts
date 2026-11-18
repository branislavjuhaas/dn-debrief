import { getCampaignBanner } from "#server/utils/settings";

defineRouteMeta({
  openAPI: {
    tags: ["Settings"],
    summary: "Get campaign banner",
    description:
      "Get the admin-managed campaign banner configuration shown on public pages.",
    responses: {
      200: {
        description: "The campaign banner configuration",
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

export default defineEventHandler(async () => {
  const campaignBanner = await getCampaignBanner();

  return { campaignBanner };
});
