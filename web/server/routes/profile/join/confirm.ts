import { clubMemberships } from "#server/db/schema/clubs";
import { db } from "#server/db";
import { and, eq, inArray } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["Clubs"],
    summary: "Confirm club membership",
    description:
      "Confirm a pending club membership using the verification token.",
    parameters: [
      {
        name: "token",
        in: "query",
        required: true,
        schema: { type: "string" },
        description: "Confirmation token for the membership join flow",
      },
    ],
    responses: {
      302: {
        description:
          "Redirects to the finish page after confirming the membership",
      },
      400: {
        description: "Invalid or expired confirmation token",
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

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event);

  const userId = deobfuscateId(token as string);

  if (!token || !userId) {
    // Redirect to an error page if the token is invalid
    throw createError({
      statusCode: 400,
      statusMessage:
        "Token, ktorý ste zadali, je neplatný. Skontrolujte, prosím, správnosť odkazu.",
    });
  }

  const currentSeasons = (await getSetting("current-seasons")) ?? [];

  const updatedSeasons = await db
    .update(clubMemberships)
    .set({
      confirmed: true,
    })
    .where(
      and(
        eq(clubMemberships.userId, userId),
        inArray(clubMemberships.season, currentSeasons),
      ),
    );

  if (updatedSeasons.rowCount === 0) {
    await sendRedirect(event, "/profile/join/finished?error=true");
  }

  await sendRedirect(event, "/profile/join/finished?verified=true");
});
