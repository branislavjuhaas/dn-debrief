import { auth } from "#server/auth/auth";

defineRouteMeta({
  openAPI: {
    tags: ["Authentication"],
    description: "Handle authentication requests through Better Auth",
    responses: {
      200: {
        description: "Authentication response",
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
  },
});

export default defineEventHandler((event) => {
  return auth.handler(toWebRequest(event));
});
