import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  inMemoryPersistence,
} from "firebase/auth";

const auth = getAuth();

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

export { emailLogin };
