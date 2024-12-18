import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  where,
  and,
  or,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { useFeedStore, useUserStore } from "../stores.js";
import { version } from "../../package.json";
import debrief from "../assets/debrief.svg";
import barca from "../assets/barca.svg";

let system = "DN Cascade";

if (window.location.hostname === "debrief.sda.sk") {
  system = "DebRIEF";
} else if (window.location.hostname === "barca.juhaas.eu") {
  system = "Barca";
}

// Definujte správy
const messages = {
  welcome: {
    id: "welcome",
    title: "Predstavujeme " + system + " " + version,
    message:
      "Vitaj v novej verzii autonónmneho systému " +
      system +
      ", všetky chyby a návrhy funkcií ohlás, prosím, na debrief@sda.sk.",
    link: "mailto:debrief@sda.sk?subject=[DebRIEF] Chyba alebo návrh funkcie",
    local: false,
  },
  auth: {
    id: "auth",
    title: "Prihláste sa do systému",
    message:
      "Pre prístup ku všetkým funkciám sa, prosím, prihláste do systému.",
    link: "/auth",
    local: true,
  },
  join: {
    id: "join",
    title: "Nezabudnite sa zaregistrovať",
    message:
      "Ak sa chceš zúčastniť našich podujatí, staň sa členom alebo členkou SDA.",
    link: "/join",
    local: true,
  },
  pending: {
    id: "pending",
    title: "Čaká sa na potvrdenie",
    message:
      "Registrácia nebola potvrdená. Na tvoj e-mail bol odoslaný odkaz na potvrdenie.",
    link: null,
    local: false,
  },
  createClubs: {
    id: "createClubs",
    title: "Pridaj všetky kluby",
    message:
      "Nezabudni pridať všetky kluby, aby sa mohli zaregistrovať ich členovia.",
    link: "/manage/clubs",
    local: true,
  },
  manageClub: {
    id: "manageClub",
    title: "Spravuj svoj klub",
    message: "Pozri sa na nových členov tvojho klubu a sleduj, ako rastie.",
    link: "/manage/clubs/{{Id}}",
    local: true,
  },
  learnMore: {
    id: "learnMore",
    title: "Chceš vedieť viac o SDA?",
    message:
      "Klikni pre viac informácií o Slovenskej debatej asociácii a jej poslaní.",
    link: "https://sda.sk",
    local: false,
  },
};

/**
 * Fetches cloud messages from Firestore based on user filters and updates the feed store.
 *
 * @returns {Promise<Array>} - A promise that resolves to an array of messages.
 */
const getCloudMessages = async () => {
  // Check if the feed store is already initialized and return the existing messages if true
  if (useFeedStore().initialized) {
    console.log("Feed store already initialized");
    return useFeedStore().feedMessages;
  }

  console.log("Fetching cloud messages");

  // Initialize the user store
  const userStore = useUserStore();

  // Get Firestore database instance
  const db = getFirestore();
  let messages = [];

  // Reference to the messages collection in Firestore
  const messageCollection = collection(db, "messages");

  // Convert userStore.club.id to a Firestore document reference
  const clubRef = doc(db, "clubs", userStore.club.id);

  // Create a Firestore query with multiple filters
  const q = query(
    messageCollection,
    and(
      or(
        where("filters.member", "==", userStore.isMember),
        where("filters.member", "==", false),
      ),
      or(
        where("filters.role", "array-contains", userStore.role),
        where("filters.role", "==", null),
      ),
      where("filters.club", "in", ["", clubRef]),
    ),
  );

  // Execute the query and get the documents
  const querySnapshot = await getDocs(q);

  // Iterate through the query results and construct message objects
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const message = {
      id: doc.id,
      ...data,
    };
    delete message.filters; // Remove the filters property from the message object
    messages.push(message); // Add the message to the messages array
  });

  // Update the feed store with the fetched messages
  useFeedStore().initialize(messages);
  return messages; // Return the fetched messages
};

/**
 * Generate a list of messages for the user.
 * @param {Object} user - The user object.
 * @returns {Array} - The list of messages.
 */
export const feed = async (user) => {
  let feedMessages = [];

  let welcomeMessage = { ...messages.welcome };
  feedMessages.push(welcomeMessage);

  if (!user || !user.uid) {
    feedMessages.push(messages.auth);
    return feedMessages;
  }

  if (!user.isJoining) {
    feedMessages.push(messages.join);
    return feedMessages;
  }

  if (user.isJoining && !user.isMember) {
    feedMessages.push(messages.pending);
  }

  if (user.role === "admin" || user.role === "developer") {
    feedMessages.push(messages.createClubs);
  }

  if (user.role === "coach") {
    let clubMessage = { ...messages.manageClub };
    clubMessage.link = clubMessage.link.replace("{{Id}}", user.club.id);
    feedMessages.push(clubMessage);
  }

  const cloudMessages = await getCloudMessages();
  feedMessages = feedMessages.concat(cloudMessages);

  if (feedMessages.length <= 2) {
    feedMessages.push(messages.learnMore);
  }

  return feedMessages;
};

/**
 * Fetches all messages from the Firestore messages collection.
 *
 * @returns {Promise<Array>} - A promise that resolves to an array of messages.
 */
export const getAllMessages = async () => {
  const db = getFirestore();
  const messageCollection = collection(db, "messages");
  const querySnapshot = await getDocs(messageCollection);
  const messages = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const message = {
      id: doc.id,
      ...data,
    };
    messages.push(message);
  });

  return messages;
};

/**
 * Creates a new message in the Firestore messages collection.
 *
 * @param {Object} message - The message object to be created.
 * @returns {Promise<Object>} - A promise that resolves with the created message object including its ID.
 */
export const createMessage = async (message) => {
  const db = getFirestore();
  const messageCollection = collection(db, "messages");
  const { id, filters, ...messageWithoutId } = message; // Exclude the id property
  const messageWithDocRef = {
    ...messageWithoutId,
    filters: {
      ...filters,
      club: filters.club ? doc(db, "clubs", filters.club.id) : "", // Ensure filters.club is an object with an id property
    },
  };
  const docRef = await addDoc(messageCollection, messageWithDocRef);
  return { id: docRef.id, ...messageWithoutId, filters }; // Return the created message with its ID
};

/**
 * Edits an existing message in the Firestore messages collection.
 *
 * @param {string} id - The ID of the message to be edited.
 * @param {Object} message - The updated message object.
 * @returns {Promise<void>} - A promise that resolves when the message is updated.
 */
export const editMessage = async (id, message) => {
  const db = getFirestore();
  const messageDoc = doc(db, "messages", id);
  const { id: messageId, filters, ...messageWithoutId } = message; // Exclude the id property
  const messageWithDocRef = {
    ...messageWithoutId,
    filters: {
      ...filters,
      club: filters.club ? doc(db, "clubs", filters.club.id) : "", // Convert string to document reference if not empty
    },
  };
  await updateDoc(messageDoc, messageWithDocRef);
};

/**
 * Deletes a message from the Firestore messages collection.
 *
 * @param {string} id - The ID of the message to be deleted.
 * @returns {Promise<void>} - A promise that resolves when the message is deleted.
 */
export const deleteMessage = async (id) => {
  const db = getFirestore();
  const messageDoc = doc(db, "messages", id);
  await deleteDoc(messageDoc);
};
