# User Protocol

This document outlines the structure of the user document stored in Firestore and the various actions that can be performed on it.

## User Document Structure

The user document is stored in the `users` collection in Firestore. Each document ID corresponds to the Firebase Authentication UID of the user.

```json
{
  "uid": "string", // Firebase Authentication UID (Document ID)
  "email": "string", // User's email address
  "name": "string", // User's first name
  "surname": "string", // User's last name
  "role": "string", // User's role (e.g., 'user', 'admin', 'manager'). Defaults to 'user'.
  "club": "DocumentReference('clubs/clubId')", // Reference to the user's club document (optional)
  "address": "string", // User's postal address (optional)
  "phone": "string", // User's phone number (optional)
  "birthdate": "Timestamp", // User's date of birth as Firestore Timestamp (optional)
  "supervisor": "string", // Name of the legal supervisor (for underage users) (optional)
  "supervisorEmail": "string", // Email of the legal supervisor (for underage users) (optional)
  "seasons": [
    // Array of seasons the user participated in
    {
      "year": "string", // Year of the season (e.g., "2024")
      "confirmed": "boolean" // Whether the membership for this season is confirmed (paid)
    }
  ],
  "awards": [
    // Array of awards received by the user
    {
      "award": "DocumentReference('awards/awardId')", // Reference to the award document
      "legend": "boolean" // Whether this award is marked as legendary for the user
    }
  ],
  "clubManager": "boolean", // Whether the user is a manager of their club. Defaults to false.
  "dev": "boolean", // Whether the user is part of the developer program. Defaults to false.
  "cookies": "boolean", // User's consent for analytics cookies (optional)
  "createdAt": "Timestamp", // When the user was created (stored as Firestore Timestamp)
  "reminded": "boolean" // Whether the user has been reminded about membership payment (optional)
}
```

**Notes:**

- Fields marked as `(optional)` might not be present until the user provides the information (e.g., during the join process).
- The `club` field stores a Firestore `DocumentReference`. When fetched, the application resolves this reference to get club details.
- The `awards` field stores an array of objects, each containing a `DocumentReference` to an award and a boolean indicating if it's legendary. The application resolves these references.
- The `seasons` array tracks membership years and payment confirmation.
- The `birthdate` field is stored as a Firestore `Timestamp` and converted to a JavaScript `Date` object when retrieved by the application.
- The `createdAt` field is stored as a Firestore `Timestamp` and is used for sorting recent users.

## User Actions

These actions are primarily handled by functions within `src/firebase/auth.js` and `src/firebase/structure.js`.

### Authentication & Creation

- **`emailLogin(email, password, remember)`**: Signs in a user with email and password. Handles persistence. (`src/firebase/auth.js`)
- **`emailRegister(email, password)`**: Registers a new user with email and password via Firebase Auth. (`src/firebase/auth.js`)
- **`googleLogin()`**: Signs in a user using Google Sign-In popup. Handles persistence. (`src/firebase/auth.js`)
- **`oneTapLogin(credential)`**: Signs in a user using Google One Tap. Handles persistence. (`src/firebase/auth.js`)
- **`createUser(uid, email, name, surname)`**: Creates the initial user document in Firestore after successful Firebase Auth registration. Sets `email`, `name`, and `surname`. (`src/firebase/auth.js`)
- **`logout()`**: Signs out the current user from Firebase Auth. (`src/firebase/auth.js`)
- **`sendResetEmail(email)`**: Sends a password reset email via Firebase Auth. (`src/firebase/auth.js`)
- **`resetPassword(code, password)`**: Confirms the password reset using the code from the email. (`src/firebase/auth.js`)
- **`changePassword(newPassword)`**: Updates the password for the currently logged-in user (requires recent login). (`src/firebase/auth.js`)

### Data Retrieval

- **`getUser(uid)`**: Fetches a specific user document by UID. Resolves `club` and `awards` references. Converts the `birthdate` Timestamp to a JavaScript Date object. (`src/firebase/auth.js` and `src/firebase/structure.js` - Note: Duplicate function name, context determines which is used).
- **`getUsers(club)`**: Fetches all users, optionally filtering by a specific club reference. (`src/firebase/structure.js`)
- **`fetchAllUsers()`**: Fetches all user documents without resolving references. (`src/firebase/structure.js`)
- **`getRecentUsers()`**: Fetches the 10 most recently created users based on the `createdAt` Timestamp field. (`src/firebase/structure.js`)
- **`getUserStatistics()`**: Calculates statistics about total users and membership status for the current year. (`src/firebase/structure.js`)

### Data Modification

- **`joinAdultUser(uid, club, address, phone, birthdate, seasons)`**: Updates an existing user document for an adult joining a club. Sets `club` (as a DocumentReference), `address`, `phone`, `birthdate` (as a Timestamp), and `seasons` (array of season objects). Uses a transaction. (`src/firebase/structure.js`)
- **`joinUser(uid, club, address, phone, birthdate, seasons, supervisor, supervisorEmail)`**: Updates an existing user document for any user joining a club. Sets `club` (as a DocumentReference), `address`, `phone`, `birthdate` (as a Timestamp), `seasons` (array of season objects), and potentially `supervisor` and `supervisorEmail`. Uses a transaction. (`src/firebase/structure.js`)
- **`updateUserRole(uid, newRole)`**: Updates the `role` field for a specific user. (`src/firebase/structure.js`)
- **`updateUserSeasons(userId)`**: Confirms the membership for the current (and potentially next) season by setting `confirmed: true` in the relevant `seasons` array entry/entries. Also sets the `reminded` field to `false`. Increments the `membersCount` on the associated club document (indirect effect). (`src/firebase/structure.js`)
- **`assignAwardToUser(userId, awardId)`**: Adds a new object `{ award: DocumentReference('awards/awardId'), legend: false }` to the user's `awards` array. (`src/firebase/structure.js`)
- **`updateAwardLegendStatus(userId, awardId, isLegend)`**: Finds the award object in the user's `awards` array where `award.id` matches `awardId` and updates its `legend` field to the provided `isLegend` value. Uses a transaction. (`src/firebase/structure.js`)
- **`removeAwardFromUser(userId, awardId)`**: Removes the award object from the user's `awards` array where `award.id` matches `awardId`. Uses a transaction. (`src/firebase/structure.js`)
- **`updateUserClubManagerStatus(uid, clubManagerStatus)`**: Updates the `clubManager` boolean field for a specific user. (`src/firebase/structure.js`)
- **`updateUserProperty(uid, name, value)`**: Updates an arbitrary top-level property (field) specified by the `name` parameter of a user document with the given `value`. (`src/firebase/structure.js`)
- **`setCookies(cookies)`**: Updates the `cookies` boolean field for the currently authenticated user. (`src/firebase/auth.js`)

### Related Actions (Indirectly Affecting Users)

- **`reevaluateMembersCount()`**: Recalculates the `membersCount` for _all_ clubs based on confirmed memberships in the current year for all users. This reads user data but modifies club documents. (`src/firebase/structure.js`)
