import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";

import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { useTournamentStore } from "../stores.js";

const db = getFirestore();

/**
 * Fetches relevant tournaments from Firestore and initializes the tournament store.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of tournament objects.
 */
export const relevantTournaments = async () => {
  console.log("Fetching relevant tournaments");

  const tournamentStore = useTournamentStore();
  if (tournamentStore.initialized) {
    return tournamentStore.tournaments;
  }

  const today = new Date();
  const q = query(collection(db, "tournaments"), where("endDate", ">=", today));
  const querySnapshot = await getDocs(q);
  const tournaments = querySnapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .sort((a, b) => a.beginningDate - b.beginningDate);

  // For each tournament, replace thumbnail with download URL
  for (const tournament of tournaments) {
    console.log("Tournament: ", tournament);
    // Convert the beginningDate and endDate to Date objects
    tournament.beginningDate = tournament.beginningDate.toDate();
    tournament.endDate = tournament.endDate.toDate();

    if (tournament.thumbnail) {
      tournament.thumbnail = await getThumbnail(tournament.thumbnail);
    }
  }

  // Use the tournament store to initialize the tournaments
  tournamentStore.initialize(tournaments);

  console.log("Tournaments: ", tournaments);

  return tournaments;
};

/**
 * Retrieves the download URL for an image stored in Firebase Storage.
 *
 * @param {string} filename - The name of the image file.
 * @returns {Promise<string|null>} A promise that resolves to the download URL of the image, or null if an error occurs.
 */
export const getThumbnail = async (filename) => {
  const storage = getStorage();
  try {
    const imageRef = ref(storage, `/tournaments/${filename}`);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error("Error getting image:", error);
    return null;
  }
};
