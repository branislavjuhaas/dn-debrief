import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
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
  updateDoc,
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
    await setPersistence(auth, browserLocalPersistence);
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
  await setPersistence(auth, browserLocalPersistence);
  await signInWithPopup(auth, provider);
};

/**
 * Sign in with one tap.
 * @param {string} credential - The user's credential.
 */
export const oneTapLogin = async (credential) => {
  const oAuthCredential = GoogleAuthProvider.credential(credential);
  await setPersistence(auth, browserLocalPersistence);
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
  const q = query(collection(db, "users"), where(documentId(), "==", uid));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return null;

  const user = querySnapshot.docs[0].data();

  if (user.birthdate) {
    user.birthdate = user.birthdate.toDate();
  }

  if (user.club) {
    const clubSnapshot = await getDoc(user.club);
    if (clubSnapshot.exists()) {
      user.club = {
        id: clubSnapshot.id,
        ...clubSnapshot.data(),
      };
    } else {
      console.error("Club document does not exist");
      user.club = null;
    }
  }

  if (user.awards && Array.isArray(user.awards)) {
    const awardsPromises = user.awards.map(async (awardRef) => {
      const awardSnapshot = await getDoc(awardRef.award);
      if (awardSnapshot.exists()) {
        return {
          id: awardSnapshot.id,
          legend: awardRef.legend,
          ...awardSnapshot.data(),
        };
      } else {
        console.error("Award document does not exist");
        return null;
      }
    });

    const awards = await Promise.all(awardsPromises);

    const legendTrueAwards = awards.filter((award) => award && award.legend);
    const legendFalseAwards = awards.filter((award) => award && !award.legend);

    const categoryOrder = ["system", "organization", "program"];
    const sortByCategory = (a, b) =>
      categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);

    legendTrueAwards.sort(sortByCategory);
    legendFalseAwards.sort(sortByCategory);

    user.awards = {
      legend: legendTrueAwards,
      ordinary: legendFalseAwards,
    };
  }

  return user;
};

/**
 * Create a new user.
 * @param {string} uid - The user's ID.
 * @param {string} email - The user's email
 * @param {any} name - The user's name.
 * @param {string} surname - The user's surname.
 */
export const createUser = async (uid, email, name, surname) => {
  try {
    await setDoc(doc(db, `users/${uid}`), {
      email: email,
      name: name,
      surname: surname,
    });
  } catch (error) {
    console.error("Error adding document: ", error);
    return error;
  }
};

export const setCookies = async (cookies) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        cookies: cookies,
      });
    }
  } catch (error) {
    console.error("Error setting cookies: ", error);
    return error;
  }
};
