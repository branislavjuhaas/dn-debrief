// Script to get awards from the database and save them to a JSON file
// using Firebase Admin SDK
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./key.json");

const fs = require("fs");
const path = require("path");

// Use admin sdk to access Firestore
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const awardsCollection = db.collection("awards");
const outputFilePath = path.join(__dirname, "../src/data/awards.json");
const awards = [];

// Retrieve all awards from Firestore
awardsCollection
  .get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
      const awardData = doc.data();
      awards.push({ id: doc.id, ...awardData });
    });
    console.log(`Retrieved ${awards.length} awards from Firestore`);
    return fs.promises.writeFile(
      outputFilePath,
      JSON.stringify(awards, null, 2),
    );
  })
  .then(() => {
    console.log(`Awards saved to ${outputFilePath}`);
    // Close Firestore connection after all operations are complete
    return db.terminate();
  })
  .then(() => {
    console.log("Firestore connection closed");
  })
  .catch((error) => {
    console.error("Error retrieving awards:", error);
    // Make sure to terminate even on error
    return db.terminate();
  });
