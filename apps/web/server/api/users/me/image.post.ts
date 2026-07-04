import { requireUser } from "#server/utils/auth";
import { db } from "@dn-debrief/db";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  // Get the user's avatar from form data
  const form = await readFormData(event);
  const avatar = form.get("avatar");

  if (!avatar) {
    throw createError({ statusCode: 400, message: "No avatar provided" });
  }

  return {};
});
