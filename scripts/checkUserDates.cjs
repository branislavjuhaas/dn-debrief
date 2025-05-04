const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const serviceAccount = require("./key.json");

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

/**
 * Checks if a string is a valid Slovak date format (D. M. YYYY)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} - Whether the string is a valid date format
 */
function isValidSlovakDate(dateString) {
  if (!dateString || typeof dateString !== "string") {
    return false;
  }

  // Slovak format: D. M. YYYY (with periods and spaces)
  const parts = dateString.split(".");
  if (parts.length < 3) {
    return false;
  }

  // Clean up parts (remove spaces, etc.)
  const day = parseInt(parts[0].trim(), 10);
  const month = parseInt(parts[1].trim(), 10);
  const year = parseInt(parts[2].trim(), 10);

  // Check if valid date parts
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return false;
  }

  // Check if date is valid
  if (
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12 ||
    year < 1900 ||
    year > 2100
  ) {
    return false;
  }

  // Additional validation for days in month (including leap years)
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Print usage information for the script
 */
function printUsage() {
  console.log("Usage: node checkUserDates.cjs [options]");
  console.log("");
  console.log("Options:");
  console.log("  --null    Replace invalid birthdates with null");
  console.log(
    "  --mails   Only print email addresses of users with invalid birthdates",
  );
  console.log("  --help    Show this help message");
  console.log("");
  process.exit(0);
}

/**
 * Find documents with invalid date formats and optionally fix them
 */
async function checkDateFormats() {
  try {
    // Check for help flag
    if (process.argv.includes("--help")) {
      printUsage();
    }

    // Check flags
    const replaceWithNull = process.argv.includes("--null");
    const onlyEmails = process.argv.includes("--mails");

    if (onlyEmails) {
      // If only emails requested, don't print other info
    } else if (replaceWithNull) {
      console.log("Mode: Finding and REPLACING invalid dates with null");
    } else {
      console.log("Mode: Finding invalid dates (read-only)");
    }

    // Get all user documents
    const usersSnapshot = await db.collection("users").get();

    if (!onlyEmails) {
      console.log(`Found ${usersSnapshot.size} user documents`);
    }

    let invalidCount = 0;
    let validCount = 0;
    let skipCount = 0;
    let fixedCount = 0;

    const invalidDocuments = [];
    const invalidUserEmails = [];
    const batch = replaceWithNull ? db.batch() : null;
    const batchSize = 500; // Firestore batch limit is 500
    let currentBatchCount = 0;
    let batchNumber = 1;

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;

      // Skip if no birthdate field
      if (!userData.birthdate) {
        skipCount++;
        continue;
      }

      // Skip if already a Timestamp
      if (userData.birthdate instanceof Timestamp) {
        validCount++;
        continue;
      }

      // Check if string format is valid
      if (isValidSlovakDate(userData.birthdate)) {
        validCount++;
        continue;
      }

      // Invalid date found
      invalidCount++;

      // Store user email if available
      if (userData.email) {
        invalidUserEmails.push(userData.email);
      }

      // Store document info if not in email-only mode
      if (!onlyEmails) {
        invalidDocuments.push({
          id: userId,
          format: userData.birthdate,
        });
      }

      // Replace with null if flag is set
      if (replaceWithNull) {
        batch.update(doc.ref, {
          birthdate: null,
        });

        currentBatchCount++;
        fixedCount++;

        // Commit batch when it reaches limit
        if (currentBatchCount >= batchSize) {
          if (!onlyEmails) {
            console.log(`Committing batch ${batchNumber}...`);
            await batch.commit();
            console.log(`Batch ${batchNumber} committed successfully`);
          } else {
            await batch.commit();
          }

          // Reset for next batch
          currentBatchCount = 0;
          batchNumber++;
        }
      }
    }

    // Commit any remaining updates
    if (replaceWithNull && currentBatchCount > 0) {
      if (!onlyEmails) {
        console.log(`Committing final batch ${batchNumber}...`);
        await batch.commit();
        console.log(`Final batch committed successfully`);
      } else {
        await batch.commit();
      }
    }

    // Handle output based on mode
    if (onlyEmails) {
      // Only print emails in --mails mode
      if (invalidUserEmails.length > 0) {
        invalidUserEmails.forEach((email) => {
          console.log(email);
        });
      }
    } else {
      // Print detailed results in normal mode
      console.log("\nResults:");
      console.log(`- Valid date formats: ${validCount}`);
      console.log(`- Invalid date formats: ${invalidCount}`);
      console.log(`- No birthdate field: ${skipCount}`);

      if (replaceWithNull) {
        console.log(`- Fixed documents: ${fixedCount}`);
      }

      // Print invalid documents
      if (invalidDocuments.length > 0) {
        console.log("\nInvalid date formats found:");
        invalidDocuments.forEach((doc) => {
          console.log(`- Document ID: ${doc.id}, Format: "${doc.format}"`);
        });
      } else {
        console.log("\nNo invalid date formats found");
      }
    }
  } catch (error) {
    console.error("Error checking date formats:", error);
  }
}

// Run the check
checkDateFormats()
  .then(() => {
    // Only print completion message in standard mode
    if (!process.argv.includes("--mails")) {
      console.log("\nScript execution completed");
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script execution failed:", error);
    process.exit(1);
  });
