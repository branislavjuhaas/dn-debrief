import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  addDoc,
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

/**
 * Fetches the count of members in a specific club from Firestore.
 *
 * This function fetches the count of users associated with a specific club from Firestore.
 * The club is specified by the clubId parameter. If the clubId parameter is not provided,
 * the function returns 0.
 *
 * @async
 * @param {string|null} clubId - The ID of the club. If null, the function returns 0.
 * @returns {number} The count of users associated with the specified club.
 * @throws Will throw an error if the Firestore query fails.
 */
const getClubMembersCount = async (clubId) => {
  if (!clubId) {
    return 0;
  }

  const usersRef = collection(db, "users");
  const clubRef = doc(db, "clubs", clubId);
  const q = query(usersRef, where("club", "==", clubRef));
  const querySnapshot = await getDocs(q);
  return querySnapshot.size;
};

/**
 * Fetches all clubs from Firestore and adds a 'membersCount' property to each club.
 * The 'membersCount' property represents the number of users associated with each club.
 *
 * @async
 * @returns {Array} An array of club objects. Each object contains the club's ID, data, and members count.
 * @throws Will throw an error if the Firestore query fails.
 */
export const getClubsWithMembersCount = async () => {
  // Reference to the 'clubs' collection in Firestore
  const clubsRef = collection(db, "clubs");

  // Fetch all documents from the 'clubs' collection
  const clubsSnapshot = await getDocs(clubsRef);

  // Map each document to an object containing the document's ID and data
  const clubs = clubsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // For each club, fetch the number of users associated with the club and add it as a 'membersCount' property
  for (let club of clubs) {
    club.membersCount = await getClubMembersCount(club.id);
  }

  // Return the array of club objects
  return clubs;
};

/**
 * Updates the 'active' property of a club in Firestore.
 * @param {string} clubId - The ID of the club.
 * @param {boolean} isActive - The new value for the 'active' property.
 */
export const updateClubStatus = async (clubId, isActive) => {
  try {
    await updateDoc(doc(db, `clubs/${clubId}`), {
      active: isActive,
    });
  } catch (error) {
    console.error("Error updating document: ", error);
    return error;
  }
};

/**
 * Creates a new debate club in Firestore.
 * @param {string} clubName - The name of the club.
 * @param {boolean} isActive - The active status of the club.
 */
export const createClub = async (clubName, isActive) => {
  try {
    const clubCollection = collection(db, "clubs");
    const clubDoc = {
      name: clubName,
      active: isActive,
    };
    const docRef = await addDoc(clubCollection, clubDoc);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};
