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
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";

const auth = getAuth();
auth.languageCode = "sk";

const db = getFirestore();

/**
 * Sign in with email and password.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @param {boolean} remember - If true, the session will survive a page refresh or a browser restart.
 */
export const emailLogin = async (email, password, remember) => {
  if (remember) {
    await setPersistence(auth, inMemoryPersistence);
  }
  await signInWithEmailAndPassword(auth, email, password);
};

/**
 * Register a new user with email and password.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 */
export const emailRegister = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Sign in with Google.
 */
export const googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  await setPersistence(auth, inMemoryPersistence);
  await signInWithPopup(auth, provider);
};

/**
 * Sign in with one tap.
 * @param {string} credential - The user's credential.
 */
export const oneTapLogin = async (credential) => {
  const oAuthCredential = GoogleAuthProvider.credential(credential);
  await setPersistence(auth, inMemoryPersistence);
  await signInWithCredential(auth, oAuthCredential);
};

/**
 * Send a password reset email.
 * @param {string} email - The user's email.
 */
export const sendResetEmail = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

/**
 * Reset the user's password.
 * @param {string} code - The reset code.
 * @param {string} password - The new password.
 */
export const resetPassword = async (code, password) => {
  await confirmPasswordReset(auth, code, password);
};

/**
 * Change the user's password.
 * @param {string} newPassword - The new password.
 */
export const changePassword = async (newPassword) => {
  const user = auth.currentUser;
  await updatePassword(user, newPassword);
};

/**
 * Sign out the current user.
 */
export const logout = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    return error;
  }
};

/**
 * Fetches the user's data from the Firestore database.
 * @async
 * @param {string} uid - The unique identifier of the user.
 * @returns {Object|null} The user's data, or null if no user was found.
 *
 * If the user is part of a club, the club's name is fetched from the Firestore database
 * and added to the returned user object. If the club does not exist in the database,
 * an error is logged to the console and the club property is not added to the user object.
 */
export const getUser = async (uid) => {
  // Query the 'users' collection in the Firestore database for a document with the provided uid.
  const q = query(collection(db, "users"), where(documentId(), "==", uid));

  // Execute the query and get the results.
  const querySnapshot = await getDocs(q);

  // If the query did not return any results, return null.
  if (querySnapshot.empty) return null;

  // Get the data of the first (and only) document in the results.
  const user = querySnapshot.docs[0].data();

  // Log the user data to the console.
  console.log("User data: ", user);

  // If the user is not part of a club, return the user data.
  if (!user.club) return user;

  // Get the document of the club the user is part of.
  const clubSnapshot = await getDoc(user.club);

  // If the club document does not exist, log an error to the console and return the user data.
  if (!clubSnapshot.exists()) {
    console.error("Club document does not exist");
    user.club = null;
    return user;
  }

  // Add the name of the club to the user data and return it.
  user.club = {
    id: clubSnapshot.id,
    ...clubSnapshot.data(),
  };
  return user;
};

/**
 * Create a new user.
 * @param {string} uid - The user's ID.
 * @param {any} name - The user's name.
 * @param {string} surname - The user's surname.
 */
export const createUser = async (uid, name, surname) => {
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
