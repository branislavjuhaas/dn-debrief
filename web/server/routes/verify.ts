import * as z from "zod";
import { auth } from "#server/auth/auth";

defineRouteMeta({
  openAPI: {
    tags: ["Authentication"],
    summary: "Verify email address",
    description: "Verify an email address using the provided token",
    parameters: [
      {
        name: "token",
        in: "query",
        required: true,
        schema: { type: "string" },
        description: "The email verification token",
      },
    ],
    responses: {
      200: {
        description:
          "Verification response returned by the authentication layer",
      },
      400: {
        description: "Invalid or expired token",
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

const verifyQuery = z.object({
  token: z.string(),
});

export default defineEventHandler(async (event) => {
  const { token } = await getValidatedQuery(event, verifyQuery.parse);

  const result = await auth.api.verifyEmail({
    query: { token, callbackURL: "/auth/register?verified=true" },
    asResponse: true,
    request: toWebRequest(event),
  });

  return result;
});
