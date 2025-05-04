const admin = require('firebase-admin');
const path = require('path');
const readline = require('readline');

// Firebase initialization
const serviceAccount = require(path.resolve('scripts/key.json'));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://dn-cascade-default-rtdb.europe-west1.firebasedatabase.app"
});
const db = admin.firestore();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function askQuestion(question) {
    return new Promise(resolve => rl.question(question, answer => resolve(answer)));
}

async function restoreDocument() {
    // Prompt for document path and timestamp in seconds
    // Tip: For a document in the users collection, use "users/<user_id>"
    const documentPath = await askQuestion("Enter document path: ");
    const timestampInput = await askQuestion("Enter timestamp in seconds: ");
    const seconds = parseInt(timestampInput);
    if (isNaN(seconds)) {
        console.error("Invalid timestamp.");
        rl.close();
        return;
    }
    const timestamp = new admin.firestore.Timestamp(seconds, 0);
    const documentRef = db.doc(documentPath);
    try {
        // Run a transaction with readTime from PITR
        const documentSnapshot = await db.runTransaction(
            async transaction => transaction.get(documentRef),
            { readOnly: true, readTime: timestamp }
        );
        if (!documentSnapshot.exists) {
            console.error("Document not found at the given time.");
            rl.close();
            return;
        }
        // Write the retrieved data back to the document
        await documentRef.set(documentSnapshot.data(), { merge: true });
        console.log("Document restored successfully.");
    } catch (error) {
        console.error("Error restoring document:", error);
    }
    rl.close();
}

restoreDocument();
