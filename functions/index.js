/**
 * Import function triggers from their respective submodules:
 *
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions/v2");
const { onCall } = functions.https;
const admin = require("firebase-admin");
const Recipient = require("mailersend").Recipient;
const EmailParams = require("mailersend").EmailParams;
const MailerSend = require("mailersend").MailerSend;
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

// All available logging functions
const { logger } = require("firebase-functions/v2");

admin.initializeApp();

/**
 * This function sends an email to a user.
 * It is triggered by an HTTPS call and returns an object indicating success.
 * The function uses the MailerSend API to send the email.
 * The email is personalized with data provided in the request.
 * If an error occurs during the execution of the function, it throws an 'internal' error.
 *
 * @name sendEmail
 * @function
 * @async
 * @param {Object} data - The HTTPS request object. It should contain the following properties:
 * @param {string} data.email - The email address of the recipient.
 * @param {string} data.fullName - The full name of the recipient.
 * @param {string} data.token - The token to be included in the email.
 * @param {boolean} data.personalized - A flag indicating whether the email should be personalized.
 * @param {Object} context - The context object.
 * @returns {Object} The response object indicating success.
 * @throws {functions.https.HttpsError} If an error occurs during the execution of the function.
 */
exports.sendEmail = onCall({ enforceAppCheck: true }, async (data, context) => {
  try {
    const mailerSend = new MailerSend({
      apiKey:
        "mlsn.6ec3427e51bcb074615c91ce41eb8678c3a8c6ce11e5b0999eb9520f133445f4",
    });

    const recipients = [new Recipient(data.data.email, data.data.fullName)];

    logger.info("DATA:", data.data);

    const personalization = [
      {
        email: data.data.email,
        data: {
          token: data.data.token,
          personalized: data.data.personalized,
        },
      },
    ];

    const emailParams = new EmailParams()
      .setFrom(new Recipient("debrief@sda.sk", "Systém DebRIEF"))
      .setTo(recipients)
      .setSubject("Potvrdenie registrácie do SDA")
      .setTemplateId("351ndgwn5zdgzqx8")
      .setPersonalization(personalization);

    logger.info("Email params:", emailParams);

    await mailerSend.email.send(emailParams);

    return { success: true };
  } catch (error) {
    logger.error("Error sending email:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Internal server error",
      error,
    );
  }
});

/**
 * This function updates the 'seasons' property of a user document in the Firestore 'users' collection.
 * It is triggered by an HTTPS call and returns an object indicating success.
 * The function checks if the current date is before or after September 1st and updates the 'confirmed' property of the relevant seasons.
 * If the current date is before September 1st, it updates the 'confirmed' property of the season of the current year.
 * If the current date is on or after September 1st, it updates the 'confirmed' property of the seasons of the current year and the next year.
 * If any of the required seasons are missing, it throws an 'internal' error.
 *
 * @name updateUserSeasons
 * @function
 * @async
 * @param {Object} data - The HTTPS request object. It should contain the following properties:
 * @param {string} data.data.userId - The ID of the user whose seasons should be updated.
 * @param {Object} context - The context object.
 * @returns {Object} The response object indicating success.
 * @throws {functions.https.HttpsError} If the user does not exist or if any of the required seasons are missing or if an error occurs during the execution of the function.
 */
exports.updateUserSeasons = onCall(
  { enforceAppCheck: true },
  async (data, context) => {
    const userId = data.data.userId;

    const userRef = admin.firestore().collection("users").doc(userId);

    try {
      const userSnapshot = await userRef.get();
      const userData = userSnapshot.data();

      if (!userData) {
        throw new Error("User not found");
      }

      const seasons = userData.seasons || [];
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const nextYear = currentYear + 1;
      const isAfterSeptember = currentDate.getMonth() >= 8; // Months are 0-indexed

      logger.info("SEASONS:", seasons);

      const yearsToUpdate = isAfterSeptember
        ? [currentYear, nextYear]
        : [currentYear];

      logger.info(
        "Updating seasons for user:",
        userId,
        "Years:",
        yearsToUpdate,
      );

      const updatedSeasons = seasons.map((season) => {
        if (yearsToUpdate.includes(Number(season.year))) {
          return { ...season, confirmed: true };
        }
        return season;
      });

      // TODO: REASSURE THAT THE REGISTRATIONS FOR NEXT SEASONS WON'T CAUSE MISHMASH, WHEN THERE IS ALREADY REGISTRATION

      const missingYears = yearsToUpdate.filter(
        (year) =>
          !updatedSeasons.some((season) => Number(season.year) === year),
      );

      if (missingYears.length > 0) {
        throw new Error(
          `Missing seasons for years: ${missingYears.join(", ")}`,
        );
      }

      logger.info("Updated seasons, executing update:", updatedSeasons);

      await userRef.update({ seasons: updatedSeasons, reminded: false });

      // Increment the membersCount property in the clubs collection
      if (userData.club) {
        const clubRef = userData.club;
        await admin.firestore().runTransaction(async (transaction) => {
          const clubSnapshot = await transaction.get(clubRef);
          if (!clubSnapshot.exists) {
            throw new Error("Club not found");
          }

          const clubData = clubSnapshot.data();
          const currentMembersCount = clubData.membersCount || 0;
          const newMembersCount = currentMembersCount + 1;

          transaction.update(clubRef, { membersCount: newMembersCount });
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Error updating user seasons:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Internal server error",
        error,
      );
    }
  },
);

/**
 * This function reevaluates the members count for each club in the Firestore 'clubs' collection.
 * It is triggered by a scheduled event to run once a quarter of the year.
 * The function fetches all clubs and users from the Firestore collections, calculates the members count for each club,
 * and updates the 'membersCount' property of each club document.
 * A user is considered a member if they have a season in the current year with 'confirmed' set to true.
 * If an error occurs during the execution of the function, it logs the error.
 *
 * @name reevaluateMembersCount
 * @function
 * @async
 * @param {Object} context - The context object.
 * @returns {void}
 */
exports.reevaluateMembersCount = onSchedule(
  { schedule: "0 0 1 1,4,7,10 *" },
  async (context) => {
    try {
      const clubsSnapshot = await admin.firestore().collection("clubs").get();
      const usersSnapshot = await admin.firestore().collection("users").get();
      const currentYear = new Date().getFullYear().toString();

      const clubs = {};
      clubsSnapshot.forEach((doc) => {
        clubs[doc.id] = doc.data();
        clubs[doc.id].membersCount = 0;
      });

      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (
          userData.club &&
          userData.seasons &&
          userData.seasons.some(
            (season) => season.year === currentYear && season.confirmed,
          )
        ) {
          clubs[userData.club.id].membersCount++;
        }
      });

      const batch = admin.firestore().batch();
      for (const clubId in clubs) {
        const clubRef = admin.firestore().collection("clubs").doc(clubId);
        batch.update(clubRef, { membersCount: clubs[clubId].membersCount });
      }

      await batch.commit();
      logger.info("Successfully reevaluated members count for all clubs.");
    } catch (error) {
      logger.error("Error reevaluating members count:", error);
    }
  },
);

/**
 * This function sends reminder emails to users who joined the current season but haven't confirmed.
 * It is triggered by a scheduled event to run weekly.
 * The function fetches all users from the Firestore 'users' collection, filters out users who have confirmed their registration for the current season,
 * and sends reminder emails to the remaining users.
 * It also sets a 'reminded' field in the Firestore 'users' collection to avoid duplicate reminders.
 * If an error occurs during the execution of the function, it logs the error.
 *
 * @name sendRegistrationReminders
 * @function
 * @async
 * @param {Object} context - The context object.
 * @returns {void}
 */
exports.sendRegistrationReminders = onSchedule(
  { schedule: "0 0 * * 0" },
  async (context) => {
    try {
      const usersSnapshot = await admin.firestore().collection("users").get();
      const currentYear = new Date().getFullYear().toString();

      const usersToRemind = usersSnapshot.docs.filter((doc) => {
        const userData = doc.data();
        const hasCurrentYearSeason = userData.seasons?.some(
          (season) => season.year === currentYear,
        );
        const hasUnconfirmedCurrentYearSeason = userData.seasons?.some(
          (season) => season.year === currentYear && !season.confirmed,
        );
        return (
          hasCurrentYearSeason &&
          hasUnconfirmedCurrentYearSeason &&
          !userData.reminded
        );
      });

      for (const userDoc of usersToRemind) {
        const userData = userDoc.data();
        const email = userData.email;
        const fullName = `${userData.name} ${userData.surname}`;
        const token = createToken(userDoc.id);

        const mailerSend = new MailerSend({
          apiKey:
            "mlsn.6ec3427e51bcb074615c91ce41eb8678c3a8c6ce11e5b0999eb9520f133445f4",
        });

        const recipients = [new Recipient(email, fullName)];

        const personalization = [
          {
            email: email,
            data: {
              token: token,
            },
          },
        ];

        const emailParams = new EmailParams()
          .setFrom(new Recipient("debrief@sda.sk", "Systém DebRIEF"))
          .setTo(recipients)
          .setSubject("Pripomienka registrácie do SDA")
          .setTemplateId("jpzkmgqvm6vl059v")
          .setPersonalization(personalization);

        await mailerSend.email.send(emailParams);

        await admin.firestore().collection("users").doc(userDoc.id).update({
          reminded: true,
        });
      }

      logger.info("Successfully sent registration reminders.");
    } catch (error) {
      logger.error("Error sending registration reminders:", error);
    }
  },
);

/**
 * Sets the 'createdAt' field for a user document upon creation.
 *
 * @function setCreatedAt
 */
exports.setCreatedAt = onDocumentCreated("users/{userId}", async (event) => {
  const userId = event.params.userId;
  const userRef = admin.firestore().collection("users").doc(userId);
  await userRef.set(
    { createdAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true },
  );
});

/**
 * Sets the 'season' field for an event document upon creation based on its beginningDate.
 *
 * @function setEventSeason
 */
exports.setEventSeason = onDocumentCreated(
  "events/{eventId}",
  async (event) => {
    const eventId = event.params.eventId;
    const data = event.data.data();
    if (!data || !data.beginningDate) {
      logger.error("Missing beginningDate for event", eventId);
      return;
    }
    const date = data.beginningDate.toDate();
    const month = date.getMonth(); // 0-indexed (0 = January)
    const year = date.getFullYear();
    const season = month < 8 ? `${year - 1}/${year}` : `${year}/${year + 1}`;
    await admin
      .firestore()
      .collection("events")
      .doc(eventId)
      .update({ season });
  },
);

/**
 * Callable function to set user's role by provided UID and role.
 * Function writes the role to the user's custom claims and firestore user document.
 * Function is protected by Firebase App Check and requires 'admin' or 'developer' role.
 *
 * @function setUserRole
 * @param {Object} data - The request data object.
 * @param {Object} request - The request object.
 * @returns {Object} The response object indicating success.
 * @throws {functions.https.HttpsError} If the user does not have the required permissions or if an error occurs during the execution
 * of the function.
 * @async
 */
exports.setUserRole = onCall(
  { enforceAppCheck: true },
  async (data, request) => {
    const uid = data.data.uid;
    const role = data.data.role;

    if (
      !data.auth.token.role ||
      !["admin", "developer"].includes(data.auth.token.role)
    ) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Permission denied",
      );
    }

    try {
      await admin.auth().setCustomUserClaims(uid, { role });
      await admin.firestore().collection("users").doc(uid).update({ role });
      return { success: true };
    } catch (error) {
      logger.error("Error setting user role:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Internal server error",
        error,
      );
    }
  },
);
