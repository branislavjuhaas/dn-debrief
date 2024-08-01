import {
  getAuth,
  GoogleAuthProvider,
  inMemoryPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  collection,
  documentId,
  doc,
  getDocs,
  setDoc,
  getFirestore,
  query,
  where,
} from "firebase/firestore";

const auth = getAuth();
auth.languageCode = "sk";

const emailLogin = async (email, password, remember) => {
  if (remember) {
    setPersistence(auth, inMemoryPersistence).then(() => {
      signInWithEmailAndPassword(auth, email, password);
    });

    return;
  }

  await signInWithEmailAndPassword(auth, email, password);
};

const emailRegister = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

const googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  setPersistence(auth, inMemoryPersistence).then(() => {
    signInWithPopup(auth, provider);
  });
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

const createUser = async (uid, name, surname) => {
  const db = getFirestore();

  try {
    await setDoc(doc(db, `users/${uid}`), {
      name: name,
      surname: surname,
    });
  } catch (error) {
    console.error("Error adding document: ", error);
    return error;
  }
};

export { emailLogin, emailRegister, googleLogin, logout, getUser, createUser };
