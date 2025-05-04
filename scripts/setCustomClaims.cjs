const admin = require("firebase-admin");
const { getAuth } = require('firebase-admin/auth');
const path = require("path");
const readline = require("readline");

// Initialize Firebase Admin SDK with service account
const serviceAccount = require(path.resolve("scripts/key.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://dn-cascade-default-rtdb.europe-west1.firebasedatabase.app",
});

// ...existing code...

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter UID: ", async (uid) => {
  try {
    getAuth()
      .setCustomUserClaims(uid, { role: "developer" })
      .then(() => {
        // The new custom claims will propagate to the user's ID token the
        // next time a new one is issued.
      });
  } catch (error) {
    console.error("Error fetching user data:", error);
  } finally {
    rl.close();
  }
});
