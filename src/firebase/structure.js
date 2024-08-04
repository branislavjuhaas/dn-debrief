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

const db = getFirestore();

export const getClubs = async (active) => {
  let clubs = [];
  if (active) {
    const q = query(collection(db, "clubs"), where("active", "==", true));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      clubs.push({ id: doc.id, ...doc.data() });
    });
  } else {
    const querySnapshot = await getDocs(collection(db, "clubs"));
    querySnapshot.forEach((doc) => {
      clubs.push({ id: doc.id, ...doc.data() });
    });
  }
  return clubs;
};
