const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const serviceAccount = require("./key.json");

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

/**
 * Converts a Slovak date format string (D. M. YYYY) to a JavaScript Date object
 * @param {string} dateString - Date in Slovak format (e.g., "5. 4. 2023")
 * @returns {Date|null} - JavaScript Date object or null if invalid
 */
function parseSlovakDate(dateString) {
  if (!dateString || typeof dateString !== "string") {
    return null;
  }

  // Slovak format: D. M. YYYY (with periods and spaces)
  const parts = dateString.split(".");
  if (parts.length < 3) {
    console.error(`Invalid date format: ${dateString}`);
    return null;
  }

  // Clean up parts (remove spaces, etc.)
  const day = parseInt(parts[0].trim(), 10);
  const month = parseInt(parts[1].trim(), 10);
  const year = parseInt(parts[2].trim(), 10);

  // Check if valid date
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    console.error(
      `Could not parse date parts: ${dateString} -> ${day}, ${month}, ${year}`,
    );
    return null;
  }

  // JavaScript months are 0-based
  return new Date(year, month - 1, day);
}

/**
 * Update birthdate fields from string to Timestamp
 */
async function updateBirthdateFields() {
  try {
    // Get all user documents
    const usersSnapshot = await db.collection("users").get();
    console.log(`Found ${usersSnapshot.size} user documents`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Process each user document
    const batch = db.batch();
    const batchSize = 500; // Firestore batch limit is 500
    let currentBatchCount = 0;
    let batchNumber = 1;

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();

      // Skip if birthdate doesn't exist or is already a Timestamp
      if (!userData.birthdate) {
        skippedCount++;
        continue;
      }

      if (userData.birthdate instanceof Timestamp) {
        skippedCount++;
        console.log(`User ${doc.id}: birthdate is already a Timestamp`);
        continue;
      }

      // Parse the string date
      const dateObj = parseSlovakDate(userData.birthdate);

      if (!dateObj) {
        console.error(
          `Failed to parse date for user ${doc.id}: ${userData.birthdate}`,
        );
        errorCount++;
        continue;
      }

      // Convert to Firestore Timestamp
      const timestamp = Timestamp.fromDate(dateObj);

      // Add to batch update
      batch.update(doc.ref, {
        birthdate: timestamp,
      });

      currentBatchCount++;
      successCount++;

      // Commit batch when it reaches limit
      if (currentBatchCount >= batchSize) {
        console.log(`Committing batch ${batchNumber}...`);
        await batch.commit();
        console.log(`Batch ${batchNumber} committed successfully`);

        // Reset for next batch
        currentBatchCount = 0;
        batchNumber++;
      }
    }

    // Commit any remaining updates
    if (currentBatchCount > 0) {
      console.log(`Committing final batch ${batchNumber}...`);
      await batch.commit();
      console.log(`Final batch committed successfully`);
    }

    console.log("\nUpdate completed:");
    console.log(`- Successful updates: ${successCount}`);
    console.log(
      `- Skipped (no birthdate or already Timestamp): ${skippedCount}`,
    );
    console.log(`- Errors: ${errorCount}`);
  } catch (error) {
    console.error("Error updating birthdate fields:", error);
  }
}

// Run the update
updateBirthdateFields()
  .then(() => {
    console.log("Script execution completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script execution failed:", error);
    process.exit(1);
  });
