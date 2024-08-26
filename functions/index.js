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
const ExcelJS = require("exceljs");

// All available logging functions
const { logger } = require("firebase-functions/v2");

admin.initializeApp();

/**
 * This function exports user data to an Excel file.
 * It is triggered by an HTTPS call and returns a base64-encoded buffer of the Excel file.
 * The function checks if the authenticated user has the role of 'admin' or 'developer'.
 * If the user has the required role, it fetches all users from the Firestore 'users' collection,
 * creates an Excel file with the user data, and returns the file as a base64-encoded buffer.
 * If the user does not have the required role, it throws a 'permission-denied' error.
 * If any other error occurs during the execution of the function, it throws an 'internal' error.
 *
 * @name exportUsers
 * @function
 * @async
 * @param {Object} request - The HTTPS request object.
 * @returns {Object} The response object containing the base64-encoded buffer of the Excel file.
 * @throws {functions.https.HttpsError} If the authenticated user does not have the required role or if an error occurs during the execution of the function.
 */
exports.exportUsers = onCall(async (request) => {
  logger.info(request);
  try {
    logger.info(
      "Processing exportUsers request from:",
      request.auth.token.email,
      "auth:",
      request.auth,
    );
    const uid = request.auth.uid;
    const userSnapshot = await admin
      .firestore()
      .collection("users")
      .doc(uid)
      .get();
    const userData = userSnapshot.data();

    logger.info("Auth user data:", userData);

    if (userData.role === "admin" || userData.role === "developer") {
      const usersSnapshot = await admin.firestore().collection("users").get();
      const users = [];

      for (let doc of usersSnapshot.docs) {
        let userData = doc.data();
        userData.uid = doc.id;

        // Check if club is a document reference
        if (userData.club && userData.club.get) {
          try {
            const clubSnapshot = await userData.club.get();
            const clubData = clubSnapshot.data();
            userData.club = clubData ? clubData.name : null;
          } catch (error) {
            // Handle the error if the club document doesn't exist
            logger.error("Error fetching club data:", error);
            userData.club = null; // Set club to null if the document doesn't exist
          }
        } else {
          // Handle the case where club is a string or doesn't exist
          userData.club = userData.club || null; // Set club to null if it's undefined
        }

        users.push(userData);
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Users");

      logger.info("Exporting users");

      worksheet.columns = [
        { header: "UID", key: "uid" },
        { header: "Meno", key: "name" },
        { header: "Priezvisko", key: "surname" },
        { header: "Funkcia", key: "role" },
        { header: "Debatný klub", key: "club" },
        { header: "Email", key: "email" },
        { header: "Telefónne číslo", key: "phone" },
        { header: "Dátum narodenia", key: "birthdate" },
        { header: "Adresa", key: "address" },
        { header: "Registrácie", key: "seasons" },
        { header: "Meno a priezvisko zákonného zástupcu", key: "supervisor" },
        { header: "Email zákonného zástupcu", key: "supervisorEmail" },
      ];

      // Set the background color of the header and enable text wrapping
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF21D46E" }, // Yellow background
        };
        cell.alignment = { wrapText: true };
      });

      users.forEach((user) => {
        worksheet.addRow(user);
      });

      const buffer = await workbook.xlsx.writeBuffer();

      return {
        buffer: buffer.toString("base64"),
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        contentDisposition: "attachment; filename=users.xlsx",
      };
    } else {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Insufficient permissions",
      );
    }
  } catch (error) {
    logger.error("Error exporting users:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Internal server error",
      error,
    );
  }
});
