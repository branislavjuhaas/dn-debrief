import {
  getAuth,
  GoogleAuthProvider,
  inMemoryPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import {
  collection,
  documentId,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";

const auth = getAuth();
auth.languageCode = "sk";

const emailLogin = async (email, password, remember) => {
  try {
    // Set the persistence of the user for the memory of the browser

    if (remember) {
      setPersistence(auth, inMemoryPersistence).then(() => {
        signInWithEmailAndPassword(auth, email, password);
      });

      return;
    }

    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    return error;
  }
};

const googleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
    setPersistence(auth, inMemoryPersistence).then(() => {
      signInWithPopup(auth, provider);
    });
  } catch (error) {
    return error;
  }
};

const logout = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    return error;
  }
};

const getUser = async (uid) => {
  // Fetch the user data from the Firestore database
  const db = getFirestore();
  const q = query(collection(db, "users"), where(documentId(), "==", uid));

  // If the user is not found, return null
  if ((await getDocs(q)).empty) return null;

  // Otherwise return the user data
  return (await getDocs(q)).docs[0].data();
};

export { emailLogin, googleLogin, logout, getUser };
