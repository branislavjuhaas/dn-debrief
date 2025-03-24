import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

import {
  getDownloadURL,
  getMetadata,
  getStorage,
  ref,
  listAll,
  deleteObject,
  uploadBytes,
} from "firebase/storage";
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
  const q = query(
    collection(db, "events"),
    where("endDate", ">=", today),
    where("draft", "!=", true),
  );
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
    if (event.beginningDate) {
      const b = event.beginningDate.toDate();
      event.beginningDate = new Date(
        Date.UTC(
          b.getUTCFullYear(),
          b.getUTCMonth(),
          b.getUTCDate(),
          b.getUTCHours(),
          b.getUTCMinutes(),
          b.getUTCSeconds(),
        ),
      );
    }
    if (event.endDate) {
      const e = event.endDate.toDate();
      event.endDate = new Date(
        Date.UTC(
          e.getUTCFullYear(),
          e.getUTCMonth(),
          e.getUTCDate(),
          e.getUTCHours(),
          e.getUTCMinutes(),
          e.getUTCSeconds(),
        ),
      );
    }
    if (event.deadline) {
      console.log("DEADLINE: ", event.deadline);
      const d = event.deadline.toDate();
      event.deadline = new Date(
        Date.UTC(
          d.getUTCFullYear(),
          d.getUTCMonth(),
          d.getUTCDate(),
          d.getUTCHours(),
          d.getUTCMinutes(),
          d.getUTCSeconds(),
        ),
      );
      console.log("NEW DEADLINE: ", event.deadline);
    }

    if (event.thumbnail) {
      event.originalThumbnail = event.thumbnail;
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

/**
 * Uploads a thumbnail image to Firebase Storage if it doesn't already exist.
 *
 * @param {string} eventId - The ID of the event.
 * @param {Blob} imageBlob - The image blob to upload.
 */
export const uploadThumbnailImage = async (eventId, imageBlob) => {
  const storage = getStorage();
  const filePath = `events/thumbnails/${eventId}.jpg`;
  const imageRef = ref(storage, filePath);

  try {
    // Check if the file already exists
    await getMetadata(imageRef);
    console.log(`Thumbnail already exists at ${filePath}`);
  } catch (error) {
    if (error.code === "storage/object-not-found") {
      // File doesn't exist, proceed to upload
      await uploadBytes(imageRef, imageBlob, {
        cacheControl: "public,max-age=31104000",
      });
      console.log(`Thumbnail uploaded to ${filePath}`);
      return "thumbnails/" + eventId + ".jpg";
    } else {
      console.error("Error checking thumbnail existence:", error);
      return null;
    }
  }

  return null;
};

/**
 * Retrieves a list of potential organizers from the database.
 *
 * Queries the "users" collection in the database for documents where the
 * "role" field is either "admin", "organizer", or "junior". Returns an
 * array of objects containing the user ID and associated data.
 *
 * @returns {Promise<Array<{ uid: string, [key: string]: any }>>} A promise that resolves
 * to an array of user objects with their UID and data.
 */
export const getPotentialOrganizers = async () => {
  const q = query(
    collection(db, "users"),
    where("role", "in", ["admin", "organizer", "junior"]),
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  }));
};

/**
 * Sets an event in the 'events' collection in the database.
 *
 * @param {Object} event - The event object to be set.
 * @param {string} event.id - The unique identifier of the event.
 * @returns {Promise<void>} - Resolves when the event is set successfully.
 */
export const setEvent = async (event) => {
  try {
    await setDoc(doc(db, "events", event.id), event);
    console.log(`Event ${event.id} set successfully`);
  } catch (error) {
    console.error("Error setting event:", error);
  }
};

/**
 * Retrieves a specific event by its ID using relevant events.
 *
 * @param {string} eventId - The ID of the event to retrieve.
 * @returns {Promise<Object|null>} A promise that resolves to the event object or null if not found.
 */
export const getEventById = async (eventId) => {
  const events = await relevantEvents();
  const event = events.find((event) => event.id === eventId);
  if (event) {
    return event;
  }

  // Try to get event from database
  return await getFirebaseEvent(eventId);
};

/**
 * Retrieves a specific event by its ID using relevant events.
 *
 * @param {string} eventId - The ID of the event to retrieve.
 * @returns {Promise<Object|null>} A promise that resolves to the event object or null if not found.
 */
export const getFirebaseEvent = async (eventId) => {
  // Fetch event from database, where elementId is equal to eventId
  const eventRef = doc(db, "events", eventId);
  const eventSnapshot = await getDoc(eventRef);
  if (eventSnapshot.exists()) {
    const event = eventSnapshot.data();
    event.id = eventSnapshot.id;
    event.beginningDate = event.beginningDate.toDate();
    event.endDate = event.endDate.toDate();
    event.deadline = event.deadline.toDate();

    if (event.thumbnail) {
      event.originalThumbnail = event.thumbnail;
      event.thumbnail = await getThumbnail(event.thumbnail);
    }

    return event;
  } else {
    return null;
  }
};

/**
 * Uploads a file to Firebase Storage's "events/files" directory.
 * Sets the custom metadata to include the UID of the user who uploaded the file.
 * If a file with the same name exists, adds a  string to make it unique.
 *
 * @param {File} file - The file to upload.
 * @param {string} userId - The UID of the user who uploaded the file.
 * @param {string} userFullName - The full name of the user who
 * @returns {Promise<{downloadURL: string, fileName: string}>} A promise that resolves to an object containing the download URL and name of the uploaded file.
 * @throws {Error} If the upload fails or the file size exceeds 10MB.
 */
export const uploadEventFile = async (file, userId, userFullName) => {
  if (file.size > 10 * 1024 * 1024) {
    // 10MB file size limit. Error code limit-exceeded, message: "Firebase Storage: Object 'events/files/...' size exceeds the limit of 10485760 bytes."
    const error = new Error();
    error.code = "storage/limit-exceeded";
    error.message = "File size exceeds the limit of 10MB";
    throw error;
  }

  const storage = getStorage();
  let fileName = file.name;
  let filePath = `events/files/${fileName}`;
  let fileRef = ref(storage, filePath);

  // Check if file already exists
  try {
    await getMetadata(fileRef);
    // File exists, add random string to name
    const randomStr = Date.now().toString(36);
    const fileExt = fileName.includes(".") ? fileName.split(".").pop() : "";
    const baseName = fileName.includes(".")
      ? fileName.substring(0, fileName.lastIndexOf("."))
      : fileName;

    fileName = `${baseName}_${randomStr}${fileExt ? "." + fileExt : ""}`;
    filePath = `events/files/${fileName}`;
    fileRef = ref(storage, filePath);
  } catch (error) {
    // If error is "object-not-found", file doesn't exist which is fine
    if (error.code !== "storage/object-not-found") {
      console.error("Error checking file existence:", error);
      throw error;
    }
  }

  try {
    await uploadBytes(fileRef, file, {
      customMetadata: {
        uploadedByUID: userId,
        uploadedBy: userFullName,
      },
    });
    console.log(`File uploaded to ${filePath}, download URL: ${fileRef}`);
    const downloadURL = await getDownloadURL(fileRef);
    console.log(`File name: ${fileName}, download URL: ${downloadURL}`);
    return { downloadURL, fileName };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

/**
 * Retrieves the download URL of a file stored in Firebase Storage.
 *
 * @param {string} filename - The name of the file.
 * @returns {Promise<string>} A promise that resolves to the download URL of the file.
 */
export const getEventFile = async (filename) => {
  const storage = getStorage();
  const fileRef = ref(storage, `events/files/${filename}`);
  return await getDownloadURL(fileRef);
};

/**
 * Deletes a file stored in Firebase Storage.
 *
 * @param {string} filename - The name of the file to delete.
 * @returns {Promise<void>} A promise that resolves when the file is deleted.
 */
export const deleteEventFile = async (filename) => {
  const storage = getStorage();
  const fileRef = ref(storage, `events/files/${filename}`);
  await deleteObject(fileRef).then(() => {
    console.log(`File ${filename} deleted successfully`);
  });
};

/**
 * Lists all files in the "events/files" directory in Firebase Storage.
 *
 * @returns {Promise<Array<string>>} A promise that resolves to an array of filenames together with their download URLs, last modified time, and metadata.createdBy.
 * @throws {Error} If the list operation fails.
 */
export const listEventFiles = async () => {
  const storage = getStorage();
  const filesRef = ref(storage, "events/files");

  try {
    const listResult = await listAll(filesRef);

    const files = await Promise.all(
      listResult.items.map(async (itemRef) => {
        const metadata = await getMetadata(itemRef);
        return {
          name: itemRef.name,
          downloadURL: await getDownloadURL(itemRef),
          lastModified: metadata.updated,
          uploadedByUID: metadata.customMetadata?.uploadedByUID,
          uploadedBy: metadata.customMetadata?.uploadedBy,
        };
      }),
    );

    files.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    console.log("Files: ", files);

    return files;
  } catch (error) {
    console.error("Error listing event files:", error);
    throw error;
  }
};

export const getEventsBetweenDates = async (startDate, endDate) => {
  endDate.setHours(23, 59, 59, 999);
  const q = query(
    collection(db, "events"),
    where("endDate", ">=", startDate),
    where("beginningDate", "<=", endDate),
  );
  const querySnapshot = await getDocs(q);

  console.log("querySnapshot: ", querySnapshot);

  const events = await Promise.all(
    querySnapshot.docs.map(async (doc) => ({
      id: doc.id,
      originalThumbnail: doc.data().thumbnail,
      ...doc.data(),
      thumbnail: await getThumbnail(doc.data().thumbnail),
    })),
  );

  console.log(
    "Got ",
    events.length,
    " events between ",
    startDate.toLocaleString(),
    " and ",
    endDate.toLocaleString(),
  );

  return events;
};
