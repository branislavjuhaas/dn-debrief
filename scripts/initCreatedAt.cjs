const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK with service account
const serviceAccount = require(path.resolve('scripts/key.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://dn-cascade-default-rtdb.europe-west1.firebasedatabase.app"
  });

const db = admin.firestore();

async function updateCreatedAt() {
  try {
    let nextPageToken;
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      listUsersResult.users.forEach(async (userRecord) => {
        const uid = userRecord.uid;
        const createdAt = new Date(userRecord.metadata.creationTime);
        await db.collection('users').doc(uid).set({ createdAt }, { merge: true });
        console.log(`Updated user ${uid} with createdAt ${createdAt}`);
      });
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    console.log('All users have been updated.');
  } catch (error) {
    console.error('Error updating users:', error);
  }
}

updateCreatedAt();