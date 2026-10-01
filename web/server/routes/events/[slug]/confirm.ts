import { db } from "#server/db";
import { eventRegistrations } from "#server/db/schema/events";
import { deobfuscateId } from "#server/utils/obfuscate";
import { and, eq } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["Events"],
    summary: "Confirm event registration by legal guardian",
    description:
      "Confirm a pending event registration using the verification token.",
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Event slug",
      },
      {
        name: "token",
        in: "query",
        required: true,
        schema: { type: "string" },
        description: "Confirmation token",
      },
      {
        name: "reg",
        in: "query",
        required: false,
        schema: { type: "string" },
        description: "Registration ID",
      },
    ],
    responses: {
      302: {
        description: "Redirects to the finish page after confirming",
      },
      400: {
        description: "Invalid confirmation token",
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") ?? "";
  const { token, reg } = getQuery(event);

  const userId = token ? deobfuscateId(token as string) : null;
  const regId = reg ? Number.parseInt(reg as string, 10) : null;

  if (!token || !userId) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Token, ktorý ste zadali, je neplatný. Skontrolujte, prosím, správnosť odkazu.",
    });
  }

  const eventRecord = await db.query.events.findFirst({
    where: { slug },
  });

  if (!eventRecord) {
    throw createError({
      statusCode: 404,
      statusMessage: "Podujatie nenájdené",
    });
  }

  const whereClause = regId
    ? and(
        eq(eventRegistrations.id, regId),
        eq(eventRegistrations.eventId, eventRecord.id),
        eq(eventRegistrations.userId, userId),
      )
    : and(
        eq(eventRegistrations.eventId, eventRecord.id),
        eq(eventRegistrations.userId, userId),
      );

  const updated = await db
    .update(eventRegistrations)
    .set({
      confirmed: true,
    })
    .where(whereClause);

  if (updated.rowCount === 0) {
    await sendRedirect(event, `/events/${slug}/finished?error=true`);
    return;
  }

  await sendRedirect(
    event,
    `/events/${slug}/finished?confirmed=true&reg=${regId || ""}`,
  );
});
