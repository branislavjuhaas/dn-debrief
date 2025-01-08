const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK with service account
const serviceAccount = require(path.resolve('scripts/key.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://dn-cascade-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.firestore();

async function setCustomClaims() {
  try {
    // Query users with role not 'user' or empty
    const usersSnapshot = await db.collection('users')
      .where('role', '!=', 'user')
      .get();
    
    const promises = [];
    usersSnapshot.forEach((doc) => {
      const uid = doc.id;
      const userRole = doc.data().role;
      if (userRole) {
        const promise = admin.auth().setCustomUserClaims(uid, { role: userRole });
        promises.push(promise);
        console.log(`Set role ${userRole} for user ${uid}`);
      }
    });
    await Promise.all(promises);
    console.log('All custom claims have been set.');
  } catch (error) {
    console.error('Error setting custom claims:', error);
  }
}

setCustomClaims();
