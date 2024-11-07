import { collection, getDocs, getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore();

/**
 * Fetches all awards from the Firestore awards collection.
 *
 * @returns {Promise<Array>} - A promise that resolves to an array of awards.
 */
export const getAllAwards = async () => {
  const awardsCollection = collection(db, "awards");
  const querySnapshot = await getDocs(awardsCollection);
  const awards = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const award = {
      id: doc.id,
      ...data,
    };
    awards.push(award);
  });

  return awards;
};

/**
 * Fetches a single award by ID from the Firestore awards collection.
 *
 * @param {string} id - The ID of the award to fetch.
 * @returns {Promise<Object|null>} - A promise that resolves to the award object, or null if not found.
 */
export const getAwardById = async (id) => {
  const awardDoc = doc(db, "awards", id);
  const awardSnapshot = await getDoc(awardDoc);

  if (awardSnapshot.exists()) {
    return {
      id: awardSnapshot.id,
      ...awardSnapshot.data(),
    };
  } else {
    console.error("Award document does not exist");
    return null;
  }
};
