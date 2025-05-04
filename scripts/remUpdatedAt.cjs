const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const serviceAccount = require("./key.json");

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

/**
 * Removes the updatedAt field from all documents in a collection
 * @param {string} collectionName - Name of the collection to process
 * @returns {Promise<{processed: number, updated: number}>} - Count of processed and updated documents
 */
async function removeUpdatedAtFromCollection(collectionName) {
  console.log(`Processing collection: ${collectionName}`);

  const snapshot = await db.collection(collectionName).get();
  console.log(`Found ${snapshot.size} documents in ${collectionName}`);

  let processed = 0;
  let updated = 0;

  // Process in batches (Firestore limit is 500 per batch)
  const batchSize = 500;
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    processed++;
    const data = doc.data();

    // Check if updatedAt field exists
    if ("updatedAt" in data) {
      // Remove the updatedAt field
      batch.update(doc.ref, {
        updatedAt: FieldValue.delete(),
      });

      updated++;
      batchCount++;

      // Commit batch when it reaches the limit
      if (batchCount >= batchSize) {
        console.log(
          `Committing batch of ${batchCount} updates for ${collectionName}`,
        );
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }
  }

  // Commit any remaining updates
  if (batchCount > 0) {
    console.log(
      `Committing final batch of ${batchCount} updates for ${collectionName}`,
    );
    await batch.commit();
  }

  console.log(
    `Completed ${collectionName}: Processed ${processed}, Updated ${updated}`,
  );
  return { processed, updated };
}

/**
 * Process all collections to remove updatedAt field
 */
async function removeUpdatedAt() {
  try {
    console.log("Starting removal of updatedAt field from all documents");

    // List of collections to process
    const collections = ["users"];

    let totalProcessed = 0;
    let totalUpdated = 0;

    // Process each collection
    for (const collection of collections) {
      const { processed, updated } =
        await removeUpdatedAtFromCollection(collection);
      totalProcessed += processed;
      totalUpdated += updated;
    }

    console.log("\nOperation completed successfully");
    console.log(`Total documents processed: ${totalProcessed}`);
    console.log(`Total documents updated: ${totalUpdated}`);
  } catch (error) {
    console.error("Error removing updatedAt fields:", error);
  }
}

// Check for dry run flag
const isDryRun = process.argv.includes("--dry-run");

if (isDryRun) {
  console.log("DRY RUN MODE: Will not actually remove any fields");
  // In a dry run, we would simulate the operation
  // For brevity, this is not implemented here
  console.log(
    "To execute the actual removal, run the script without --dry-run",
  );
} else {
  // Run the removal operation
  removeUpdatedAt()
    .then(() => {
      console.log("Script execution completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script execution failed:", error);
      process.exit(1);
    });
}
