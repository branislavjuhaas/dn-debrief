import * as z from "zod";
import { auth } from "#server/auth/auth";

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
