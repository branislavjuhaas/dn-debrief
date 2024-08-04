import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  inMemoryPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  updatePassword,
} from "firebase/auth";

import {
  collection,
  doc,
  documentId,
  getDocs,
  getDoc,
  getFirestore,
  query,
  setDoc,
  updateDoc,
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

const oneTapLogin = async (credential) => {
  const oAuthCredential = GoogleAuthProvider.credential(credential);
  setPersistence(auth, inMemoryPersistence).then(() => {
    signInWithCredential(auth, oAuthCredential);
  });
};

const sendResetEmail = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

const resetPassword = async (code, password) => {
  await confirmPasswordReset(auth, code, password);
};

const changePassword = async (newPassword) => {
  const user = auth.currentUser;
  await updatePassword(user, newPassword);
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
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;

  // Otherwise return the user data
  // In the user data, the club is stored as a reference to the club document, so we need to fetch the club data as well
  const user = querySnapshot.docs[0].data();
  const clubSnapshot = await getDoc(user.club);
  if (!clubSnapshot.exists()) {
    console.error("Club document does not exist");
    return null;
  }
  // In user, replace the club reference with the club data
  user.club = clubSnapshot.data().name;

  return user;
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

// Join use has also optional parameters for supervisor and supervisorEmail
const joinAdultUser = async (uid, club, address, phone, birthdate, seasons) => {
  const db = getFirestore();

  try {
    await updateDoc(doc(db, `users/${uid}`), {
      club: doc(db, `clubs/${club.id}`), // Reference to the club document (club ID is stored in the user document
      address: address,
      phone: phone,
      birthdate: birthdate,
      seasons: seasons,
    });
  } catch (error) {
    console.error("Error adding document: ", error);
    return error;
  }
};

const joinUser = async (
  uid,
  club,
  address,
  phone,
  birthdate,
  seasons,
  supervisor,
  supervisorEmail,
) => {
  const db = getFirestore();

  try {
    await updateDoc(doc(db, `users/${uid}`), {
      club: doc(db, `clubs/${club.id}`), // Reference to the club document (club ID is stored in the user document
      address: address,
      phone: phone,
      birthdate: birthdate,
      seasons: seasons,
      supervisor: supervisor,
      supervisorEmail: supervisorEmail,
    });
  } catch (error) {
    console.error("Error adding document: ", error);
    return error;
  }
};

export {
  emailLogin,
  emailRegister,
  googleLogin,
  oneTapLogin,
  sendResetEmail,
  resetPassword,
  changePassword,
  logout,
  getUser,
  createUser,
  joinAdultUser,
  joinUser,
};
