import { db } from "#server/db";
import { generateActionMail, sendEmail } from "#server/utils/mail";
import { obfuscateId } from "#server/utils/obfuscate";
import { getSetting } from "#server/utils/settings";

/**
 * Re-sends confirmation links for every pending registration and membership of
 * a user, e.g. after their legal guardian's e-mail address was corrected.
 */
export const resendPendingGuardianConfirmations = async (
  userId: number,
  guardian: { name: string; email: string },
) => {
  const greeting = `Dobrý deň, ${guardian.name.split(" ")[0]}.`;
  const pendingRegistrations = await db.query.eventRegistrations.findMany({
    columns: { id: true },
    with: {
      event: { columns: { slug: true, name: true } },
    },
    where: { userId, confirmed: false },
  });

  for (const registration of pendingRegistrations) {
    if (!registration.event) {
      continue;
    }

    const confirmUrl = `${process.env.BETTER_AUTH_URL || ""}/events/${registration.event.slug}/confirm?token=${obfuscateId(userId)}&reg=${registration.id}`;

    try {
      await sendEmail(
        guardian.email,
        `Potvrdenie registrácie na podujatie ${registration.event.name}`,
        `${greeting} Registrácia vášho dieťaťa na podujatie ${registration.event.name} bola zaznamenaná v systéme. Pre jej potvrdenie, prosím, kliknite na nasledujúci odkaz: ${confirmUrl}`,
        generateActionMail(
          `Overte registráciu dieťaťa na ${registration.event.name}`,
          "Potvrdenie registrácie",
          greeting,
          confirmUrl,
          "Potvrdiť registráciu",
        ),
      );
    } catch (error) {
      console.error(
        `Failed to resend guardian confirmation for registration ${registration.id}`,
        error,
      );
    }
  }

  const currentSeasons = (await getSetting("current-seasons")) ?? [
    new Date().getFullYear(),
  ];
  const pendingMembership = await db.query.clubMemberships.findFirst({
    columns: { season: true },
    where: {
      userId,
      confirmed: false,
      season: { in: currentSeasons },
    },
  });

  if (pendingMembership) {
    const confirmUrl = `${process.env.BETTER_AUTH_URL || ""}/profile/join/confirm?token=${obfuscateId(userId)}`;

    try {
      await sendEmail(
        guardian.email,
        "Potvrdenie registrácie do SDA",
        `${greeting} Registrácia vášho dieťaťa bola zaznamenaná v systéme. Pre jej potvrdenie, prosím, kliknite na nasledujúci odkaz: ${confirmUrl}`,
        generateActionMail(
          "Overte registráciu vášho dieťaťa",
          "Potvrdenie registrácie",
          greeting,
          confirmUrl,
          "Potvrdiť registráciu",
        ),
      );
    } catch (error) {
      console.error(
        "Failed to resend guardian confirmation for club membership",
        error,
      );
    }
  }
};
