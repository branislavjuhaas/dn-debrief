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
