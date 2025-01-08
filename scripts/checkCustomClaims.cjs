const admin = require('firebase-admin');
const path = require('path');
const readline = require('readline');

// Initialize Firebase Admin SDK with service account
const serviceAccount = require(path.resolve('scripts/key.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://dn-cascade-default-rtdb.europe-west1.firebasedatabase.app"
});

// ...existing code...

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter UID: ', async (uid) => {
    try {
        const user = await admin.auth().getUser(uid);
        const role = user.customClaims?.role || 'No role found';
        console.log(`Role for user ${uid}: ${role}`);
    } catch (error) {
        console.error('Error fetching user data:', error);
    } finally {
        rl.close();
    }
});
