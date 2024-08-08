import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

const db = getFirestore();

/**
 * Fetches club data from Firestore.
 * @param {boolean} active - If true, only active clubs are fetched.
 * @returns {Array} An array of club objects.
 */
export const getClubs = async (active) => {
  let clubs = [];
  const clubCollection = collection(db, "clubs");
  const querySnapshot = active
    ? await getDocs(query(clubCollection, where("active", "==", true)))
    : await getDocs(clubCollection);

  querySnapshot.forEach((doc) => {
    clubs.push({ id: doc.id, ...doc.data() });
  });

  return clubs;
};

/**
 * Updates an adult user's data in Firestore.
 * @param {string} uid - The user's ID.
 * @param {Object} club - The club object.
 * @param {string} address - The user's address.
 * @param {string} phone - The user's phone number.
 * @param {string} birthdate - The user's birthdate.
 * @param {Array} seasons - The seasons the user is active.
 */
export const joinAdultUser = async (
  uid,
  club,
  address,
  phone,
  birthdate,
  seasons,
) => {
  try {
    await updateDoc(doc(db, `users/${uid}`), {
      club: doc(db, `clubs/${club.id}`),
      address: address,
      phone: phone,
      birthdate: birthdate,
      seasons: seasons,
    });
  } catch (error) {
    console.error("Error updating document: ", error);
    return error;
  }
};

/**
 * Updates a user's data in Firestore, including supervisor information.
 * @param {string} uid - The user's ID.
 * @param {Object} club - The club object.
 * @param {string} address - The user's address.
 * @param {string} phone - The user's phone number.
 * @param {string} birthdate - The user's birthdate.
 * @param {Array} seasons - The seasons the user is active.
 * @param {string} supervisor - The supervisor's name.
 * @param {string} supervisorEmail - The supervisor's email.
 */
export const joinUser = async (
  uid,
  club,
  address,
  phone,
  birthdate,
  seasons,
  supervisor,
  supervisorEmail,
) => {
  try {
    await updateDoc(doc(db, `users/${uid}`), {
      club: doc(db, `clubs/${club.id}`),
      address: address,
      phone: phone,
      birthdate: birthdate,
      seasons: seasons,
      supervisor: supervisor,
      supervisorEmail: supervisorEmail,
    });
  } catch (error) {
    console.error("Error updating document: ", error);
    return error;
  }
};

/**
 * Fetches user data from Firestore.
 *
 * This function fetches user data from Firestore based on the club parameter.
 * If the club parameter is provided, it fetches only users where the club is the specified club.
 * If the club parameter is null, it fetches all users.
 *
 * @async
 * @param {Object|null} club - The club object. If null, all users are fetched.
 * @returns {Array} An array of user objects. Each object contains the user's ID and data.
 * @throws Will throw an error if the Firestore query fails.
 */
export const getUsers = async (club) => {
  // If the club is null, fetch all users. Otherwise, fetch only users where the club is the specified club.
  console.log("club", club);
  let users = [];
  const userCollection = collection(db, "users");
  const querySnapshot = club
    ? await getDocs(
        query(userCollection, where("club", "==", doc(db, `clubs/${club}`))),
      )
    : await getDocs(userCollection);

  querySnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });

  return users;
};
