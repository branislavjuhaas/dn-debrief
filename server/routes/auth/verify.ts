import * as z from "zod";
import { auth } from "~~/server/auth/auth";

const verifySchema = z.object({
  token: z.string(),
});

export default defineEventHandler(async (event) => {
  const { data, error } = verifySchema.safeParse(getQuery(event));

  if (error) {
    return sendRedirect(event, "/auth/register?verify=false", 302);
  }

  try {
    const result = await auth.api.verifyEmail({
      query: {
        token: data.token,
      },
    });
    await sendRedirect(event, "/auth/register?verify=true", 302);
  } catch (error) {
    return sendRedirect(event, "/auth/register?verify=false", 302);
  }

  await sendRedirect(event, "/auth/register?verify=true", 302);
});
