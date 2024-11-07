import { collection, getDocs, getFirestore } from "firebase/firestore";

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
