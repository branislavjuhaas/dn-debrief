import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";

import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { useEventsStore } from "../stores.js";

const db = getFirestore();

/**
 * Fetches relevant events from Firestore and initializes the event store.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of event objects.
 */
export const relevantEvents = async () => {
  console.log("Fetching relevant events");

  const eventsStore = useEventsStore();
  if (eventsStore.initialized) {
    return eventsStore.events;
  }

  const today = new Date();
  const q = query(collection(db, "events"), where("endDate", ">=", today));
  const querySnapshot = await getDocs(q);
  const events = querySnapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .sort((a, b) => a.beginningDate - b.beginningDate);

  // For each event, replace thumbnail with download URL
  for (const event of events) {
    console.log("Event: ", event);
    // Convert the beginningDate and endDate to Date objects
    event.beginningDate = event.beginningDate.toDate();
    event.endDate = event.endDate.toDate();

    if (event.thumbnail) {
      event.thumbnail = await getThumbnail(event.thumbnail);
    }
  }

  // Use the event store to initialize the events
  eventsStore.initialize(events);

  console.log("events: ", events);

  return events;
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
    const imageRef = ref(storage, `/events/${filename}`);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error("Error getting image:", error);
    return null;
  }
};
