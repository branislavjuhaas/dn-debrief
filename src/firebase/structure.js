import {
  collection,
  doc,
  getDocs,
  getDoc,
  getFirestore,
  query,
  addDoc,
  updateDoc,
  where,
  runTransaction,
  writeBatch,
  documentId,
  arrayUnion,
  orderBy,
  startAfter,
  limit,
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
    await runTransaction(db, async (transaction) => {
      const clubRef = doc(db, `clubs/${club.id}`);
      const clubSnapshot = await transaction.get(clubRef);

      if (!clubSnapshot.exists) {
        throw new Error("Club not found");
      }

      const userRef = doc(db, `users/${uid}`);
      transaction.update(userRef, {
        club: clubRef,
        address: address,
        phone: phone,
        birthdate: birthdate,
        seasons: seasons,
      });
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
    await runTransaction(db, async (transaction) => {
      const clubRef = doc(db, `clubs/${club.id}`);
      const clubSnapshot = await transaction.get(clubRef);

      if (!clubSnapshot.exists) {
        throw new Error("Club not found");
      }

      const userRef = doc(db, `users/${uid}`);
      transaction.update(userRef, {
        club: clubRef,
        address: address,
        phone: phone,
        birthdate: birthdate,
        seasons: seasons,
        supervisor: supervisor,
        supervisorEmail: supervisorEmail,
      });
    });
  } catch (error) {
    console.error("Error updating document: ", error);
    return error;
  }
};

/**
 * Updates a user's role in Firestore.
 * @param {string} uid - The user's ID.
 * @param {string} newRole - The new role for the user.
 */
export const updateUserRole = async (uid, newRole) => {
  try {
    await updateDoc(doc(db, `users/${uid}`), {
      role: newRole,
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
    club.membersCount = club.membersCount || 0;
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
      membersCount: 0,
    };
    const docRef = await addDoc(clubCollection, clubDoc);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};

/**
 * Reevaluate the members count for each club in Firestore.
 * This function fetches all clubs and users from Firestore, calculates the members count for each club,
 * and updates the 'membersCount' property of each club document.
 * A user is considered a member if they have a season in the current year with 'confirmed' set to true.
 *
 * @async
 * @returns {void}
 */
export const reevaluateMembersCount = async () => {
  try {
    const clubsSnapshot = await getDocs(collection(db, "clubs"));
    const usersSnapshot = await getDocs(collection(db, "users"));
    const currentYear = new Date().getFullYear().toString();

    const clubs = {};
    clubsSnapshot.forEach((doc) => {
      clubs[doc.id] = doc.data();
      clubs[doc.id].membersCount = 0;
    });

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (
        userData.club &&
        userData.seasons &&
        userData.seasons.some(
          (season) => season.year === currentYear && season.confirmed,
        )
      ) {
        clubs[userData.club.id].membersCount++;
      }
    });
    const batch = writeBatch(db);
    for (const clubId in clubs) {
      const clubRef = doc(db, "clubs", clubId);
      batch.update(clubRef, { membersCount: clubs[clubId].membersCount });
    }

    await batch.commit();
    console.log("Successfully reevaluated members count for all clubs.");
  } catch (error) {
    console.error("Error reevaluating members count:", error);
  }
};

/**
 * Creates a new message in Firestore.
 * @param {string} content - The content of the message.
 */
export const createMessage = async (content) => {
  try {
    const messageCollection = collection(db, "messages");
    const messageDoc = {
      content: content,
      timestamp: new Date(),
    };
    const docRef = await addDoc(messageCollection, messageDoc);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};

/**
 * Edits a club in Firestore.
 * @param {string} clubId - The ID of the club.
 * @param {string} clubName - The new name of the club.
 */
export const editClub = async (clubId, clubName) => {
  try {
    await updateDoc(doc(db, `clubs/${clubId}`), {
      name: clubName,
    });
  } catch (error) {
    console.error("Error updating document: ", error);
    return error;
  }
};

/**
 * Edits a message in Firestore.
 * @param {string} messageId - The ID of the message.
 * @param {string} content - The new content of the message.
 */
export const editMessage = async (messageId, content) => {
  try {
    await updateDoc(doc(db, `messages/${messageId}`), {
      content: content,
    });
  } catch (error) {
    console.error("Error updating document: ", error);
    return error;
  }
};

export const getUser = async (uid) => {
  const q = query(collection(db, "users"), where(documentId(), "==", uid));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return null;

  const user = querySnapshot.docs[0].data();
  console.log("User data: ", user);

  if (user.club) {
    const clubSnapshot = await getDoc(user.club);
    if (clubSnapshot.exists()) {
      user.club = {
        id: clubSnapshot.id,
        ...clubSnapshot.data(),
      };
    } else {
      console.error("Club document does not exist");
      user.club = null;
    }
  }

  return user;
};

/**
 * Updates a user's seasons in Firestore.
 * @param {string} userId - The user's ID.
 */
export const updateUserSeasons = async (userId) => {
  const userRef = doc(db, "users", userId);

  try {
    const userSnapshot = await getDoc(userRef);
    const userData = userSnapshot.data();

    if (!userData) {
      throw new Error("User not found");
    }

    const seasons = userData.seasons || [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const nextYear = currentYear + 1;
    const isAfterSeptember = currentDate.getMonth() >= 8; // Months are 0-indexed

    const yearsToUpdate = isAfterSeptember
      ? [currentYear, nextYear]
      : [currentYear];

    const updatedSeasons = seasons.map((season) => {
      if (yearsToUpdate.includes(Number(season.year))) {
        return { ...season, confirmed: true };
      }
      return season;
    });

    const missingYears = yearsToUpdate.filter(
      (year) => !updatedSeasons.some((season) => Number(season.year) === year),
    );

    if (missingYears.length > 0) {
      throw new Error(`Missing seasons for years: ${missingYears.join(", ")}`);
    }

    await updateDoc(userRef, { seasons: updatedSeasons, reminded: false });

    // Increment the membersCount property in the clubs collection
    if (userData.club) {
      const clubRef = userData.club;
      await runTransaction(db, async (transaction) => {
        const clubSnapshot = await transaction.get(clubRef);
        if (!clubSnapshot.exists) {
          throw new Error("Club not found");
        }

        const clubData = clubSnapshot.data();
        const currentMembersCount = clubData.membersCount || 0;
        const newMembersCount = currentMembersCount + 1;

        transaction.update(clubRef, { membersCount: newMembersCount });
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating user seasons:", error);
    throw error;
  }
};

/**
 * Assigns an award to a user in Firestore.
 * @param {string} userId - The user's ID.
 * @param {string} awardId - The award's ID.
 */
export const assignAwardToUser = async (userId, awardId) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      awards: arrayUnion({ award: doc(db, "awards", awardId), legend: false }),
    });
    console.log(`Award ${awardId} assigned to user ${userId}`);
  } catch (error) {
    console.error("Error assigning award to user:", error);
  }
};

/**
 * Updates the legend status of an award for a user in Firestore.
 * @param {string} userId - The user's ID.
 * @param {string} awardId - The award's ID.
 * @param {boolean} isLegend - The new legend status.
 */
export const updateAwardLegendStatus = async (userId, awardId, isLegend) => {
  try {
    const userRef = doc(db, "users", userId);
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      const awards = userDoc.data().awards || [];
      const updatedAwards = awards.map((award) => {
        if (award.award.id === awardId) {
          return { ...award, legend: isLegend };
        }
        return award;
      });

      transaction.update(userRef, { awards: updatedAwards });
    });
    console.log(`Award ${awardId} legend status updated for user ${userId}`);
  } catch (error) {
    console.error("Error updating award legend status:", error);
  }
};

/**
 * Removes an award from a user in Firestore.
 * @param {string} userId - The user's ID.
 * @param {string} awardId - The award's ID.
 */
export const removeAwardFromUser = async (userId, awardId) => {
  try {
    const userRef = doc(db, "users", userId);
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      const awards = userDoc.data().awards || [];
      const updatedAwards = awards.filter(
        (award) => award.award.id !== awardId,
      );

      transaction.update(userRef, { awards: updatedAwards });
    });
    console.log(`Award ${awardId} removed from user ${userId}`);
  } catch (error) {
    console.error("Error removing award from user:", error);
  }
};

/**
 * Fetches all users from Firestore.
 * @returns {Array} An array of user objects.
 */
export const fetchAllUsers = async () => {
  const users = [];
  const userCollection = collection(db, "users");
  const querySnapshot = await getDocs(userCollection);

  querySnapshot.forEach((doc) => {
    users.push({ uid: doc.id, ...doc.data() });
  });

  return users;
};

/**
 * Fetches all clubs from Firestore.
 * @returns {Array} An array of club objects.
 */
export const fetchAllClubs = async () => {
  const clubs = [];
  const clubCollection = collection(db, "clubs");
  const querySnapshot = await getDocs(clubCollection);

  querySnapshot.forEach((doc) => {
    clubs.push({ ref: doc.ref, ...doc.data() });
  });

  return clubs;
};

/**
 * Updates a user's data in Firestore.
 * @param {string} uid - The user's ID.
 * @param {Object} updatedData - The updated user data.
 */
export const updateUserData = async (uid, updatedData) => {
  try {
    await updateDoc(doc(db, `users/${uid}`), updatedData);
  } catch (error) {
    console.error("Error updating user data: ", error);
    return error;
  }
};

/**
 * Updates the club manager status of a user in Firestore.
 * @param {string} uid - The user's ID.
 * @param {boolean} clubManagerStatus - The new club manager status.
 */
export const updateUserClubManagerStatus = async (uid, clubManagerStatus) => {
  try {
    await updateDoc(doc(db, `users/${uid}`), {
      clubManager: clubManagerStatus,
    });
  } catch (error) {
    console.error("Error updating club manager status: ", error);
    return error;
  }
};

/**
 * Fetches a paginated list of users from Firestore.
 * @param {Object|null} club - The club object. If null, fetches all users.
 * @param {number} pageSize - Number of users per page.
 * @param {Object} lastDocCursor - The last document's cursor data for pagination.
 * @returns {Object} An object containing the users array and the new cursor.
 */
export const getUsersPaginated = async (club, pageSize, lastDocCursor = null) => {
  let usersQuery = collection(db, "users");

  if (club) {
    usersQuery = query(
      usersQuery,
      where("clubId", "==", club.id)
    );
  }

  usersQuery = query(usersQuery, orderBy("name"), orderBy("__name__"), limit(pageSize));

  if (lastDocCursor) {
    usersQuery = query(usersQuery, startAfter(lastDocCursor.name, lastDocCursor.id));
  }

  const querySnapshot = await getDocs(usersQuery);
  const users = [];
  querySnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });

  const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
  let newLastDocCursor = null;
  if (lastVisibleDoc) {
    newLastDocCursor = {
      name: lastVisibleDoc.data().name,
      id: lastVisibleDoc.id
    };
  }

  return { users, lastDoc: newLastDocCursor };
};
