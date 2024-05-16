import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCG1YinvyCiYK2ppM6lNDoO1Jw8PXYToDE",
  authDomain: "dn-cascade.firebaseapp.com",
  databaseURL:
    "https://dn-cascade-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dn-cascade",
  storageBucket: "dn-cascade.appspot.com",
  messagingSenderId: "302805903197",
  appId: "1:302805903197:web:2ee45c6fa39d6a8d38eab4",
  measurementId: "G-B8SP329TX6",
};

const firebase = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebase);

const getUserData = async (uid) => {
  const { getFirestore, getDocs, query, collection, where, documentId } =
    await import("firebase/firestore");

  const db = getFirestore(firebase);

  const q = query(collection(db, "users"), where(documentId(), "==", uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs[0].data();
};

const signInWithGoogle = async () => {
  const {
    getAuth,
    GoogleAuthProvider,
    setPersistence,
    inMemoryPersistence,
    signInWithRedirect,
  } = await import("firebase/auth");

  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  // Set session persistence to in-memory
  setPersistence(auth, inMemoryPersistence).then(() => {
    // Redirect to Google sign in and handle the result
    signInWithRedirect(auth, provider);
  });
};

// Sign in using the input chip.input values for email and password
const signInWithEmail = async (email, password) => {
  const {
    getAuth,
    setPersistence,
    inMemoryPersistence,
    signInWithEmailAndPassword,
  } = await import("firebase/auth");

  const auth = getAuth();
  // Set session persistence to in-memory
  setPersistence(auth, inMemoryPersistence).then(() => {
    // Sign in with email and password
    signInWithEmailAndPassword(auth, email, password);
  });
};

export { getUserData, signInWithGoogle, signInWithEmail };
