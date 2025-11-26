import { db } from "~~/server/db/db";
import { clubs, clubMemberships } from "~~/server/db/schema/clubs";
import { eq } from "drizzle-orm";
import useAge from "#shared/utils/use-age";
import { obfuscate } from "#shared/utils/obfuscation";
import { supervisors } from "~~/server/db/schema/auth";

defineRouteMeta({
  openAPI: {
    description:
      "Registers the authenticated user as a member of the specified club for all active seasons.",
    tags: ["Clubs", "Memberships"],
    parameters: [
      {
        in: "path",
        name: "id",
        required: true,
        schema: { type: "integer" },
        description: "Numeric identifier of the club.",
      },
    ],
    responses: {
      201: {
        description:
          "Memberships created (or already existed). Returns created rows per season.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                statusCode: { type: "integer" },
                data: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      userId: { type: "integer" },
                      clubId: { type: "integer" },
                      season: { type: "string" },
                      confirmed: { type: "boolean" },
                    },
                    required: ["userId", "clubId", "season", "confirmed"],
                  },
                },
              },
              required: ["success", "statusCode", "data"],
            },
            examples: {
              success: {
                value: {
                  success: true,
                  statusCode: 201,
                  data: [
                    {
                      userId: 42,
                      clubId: 10,
                      season: "2024",
                      confirmed: true,
                    },
                  ],
                },
              },
            },
          },
        },
      },
      400: {
        description:
          "Club inactive or other bad request (e.g., underage confirmation pending).",
      },
      401: { description: "Unauthorized – authentication required." },
      404: { description: "Club not found." },
    },
  },
});

/**
 * Handler: POST /api/clubs/:id/memberships
 *
 * Ensures the authenticated user is registered as a member of the target club
 * for every active season stored in server-side state. Adults (18+) get auto-confirmed
 * while minors trigger supervisor confirmation emails.
 *
 * Path params:
 *  - id: number (club identifier)
 *
 * Returns:
 *  - { success: boolean, statusCode: number, data: ClubMembership[] }
 */
export default defineEventHandler(async (event) => {
  const user = await useAuth(event);

  // Determine club id from params and load active seasons fallbacking to current year.
  const id = Number.parseInt(event.context.params?.id as string);
  const seasons = (await useStorage("data").getItem<string[]>("seasons")) || [
    new Date().getFullYear().toString(),
  ];

  const club = await db.query.clubs.findFirst({
    where: eq(clubs.id, id),
    columns: { isActive: true },
  });

  if (!club) {
    throw createError({ statusCode: 404, statusMessage: "Club not found" });
  }

  if (!club.isActive) {
    throw createError({ statusCode: 400, statusMessage: "Club is not active" });
  }

  const age = user.birthdate ? useAge(user.birthdate) : 0;

  // Persist a membership row per season, auto-confirming adults.
  const data = await db
    .insert(clubMemberships)
    .values(
      seasons.map((season: string) => ({
        userId: user.id,
        clubId: id,
        season: season,
        confirmed: age >= 18,
      })),
    )
    .onConflictDoNothing()
    .returning();

  if (age < 18) {
    // Notify supervisors so they can confirm the pending membership.
    const supervisorEmails: string[] = (
      await db
        .select({ email: supervisors.email })
        .from(supervisors)
        .where(eq(supervisors.userId, user.id))
    ).map((r) => r.email);

    await sendEmail({
      to: supervisorEmails,
      subject: "Potvrdenie registrácie do SDA",
      html: generateEmailTemplate({
        title: "Potvrdenie registrácie do SDA",
        text: `Vaše dieťa, ${user.name}, vyplnilo registráciu do Slovenskej debatnej asociácie. Pre jej potvrdenie, navštívte, prosím, na nasledujúci odkaz.`,
        icon: "https://www.sda.sk/wp-content/uploads/2025/11/question_mark.png",
        linkText: "Potvrdiť registráciu do SDA",
        link: `${process.env.BETTER_AUTH_URL}/memberships/confirm?token=${obfuscate(user.id)}`,
      }),
    });
  }

  setResponseStatus(event, 201);
  return { success: true, statusCode: 201, data };
});
