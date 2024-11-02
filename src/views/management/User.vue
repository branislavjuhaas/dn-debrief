<script setup>
// Import necessary components and functions
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { getUser } from "../../firebase/auth.js";
import router from "../../router.js";
import Dropdown from "../../components/Dropdown.vue";
import { useUserStore } from "../../stores.js";
import {
  reverseTranslateRole,
  translateKey,
  translateRole,
} from "../../translate.js";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../main.js";

// Get the current route
const route = useRoute();

// Get the user store
const userStore = useUserStore();

// If the user is self, redirect to the profile page
if (userStore.uid === route.params.uid) {
  router.push("/profile");
}

// Define reactive variables for user data, user full name, and user role
const userData = ref([]);
const userFullName = ref("");
const userRole = ref("");
const userPending = ref(false);
let actualRole = "";

// Function to format user data
function formatUserData(uid, user) {
  // Return an array of user data objects
  return [
    { name: "uid", value: uid },
    { name: "club", value: user.club ? user.club.name : null },
    {
      name: "member",
      value:
        user.seasons &&
        user.seasons.some(
          (season) =>
            season.year === new Date().getFullYear().toString() &&
            season.confirmed === true,
        )
          ? "Áno"
          : "Nie",
    },
    { name: "phone", value: user.phone },
    { name: "email", value: user.email },
    { name: "address", value: user.address },
    { name: "birthdate", value: user.birthdate },
    { name: "supervisor", value: user.supervisor },
    { name: "supervisorEmail", value: user.supervisorEmail },
  ].filter((item) => item.value !== null && item.value !== undefined);
}

// Function to update user data
const updateUserData = async () => {
  const userId = route.params.uid;
  try {
    const user = await getUser(userId);
    userData.value = formatUserData(userId, user);
    actualRole = translateRole(user.role) || "Používateľ";
    userRole.value = actualRole;
    userFullName.value = `${user.name} ${user.surname}`;
    userPending.value = !!(
      user.seasons &&
      user.seasons.some(
        (season) =>
          season.year === new Date().getFullYear().toString() &&
          season.confirmed === false,
      )
    );
  } catch (error) {
    if (error.code === "permission-denied") {
      await router.push("/unauthorized");
    } else {
      console.error(error);
    }
  }

  console.log(userData.value);
};

// Fetch user data on component mount
onMounted(updateUserData);

// Watch for changes in the route params uid and update user data
watch(() => route.params.uid, updateUserData);

// Watch for changes in the user role and update it in the database
watch(userRole, async (newRole, oldRole) => {
  if (newRole === oldRole) return;
  if (newRole === actualRole) return;

  const { updateUserRole } = await import("../../firebase/structure.js");
  await updateUserRole(route.params.uid, reverseTranslateRole(newRole));

  actualRole = newRole;
});

/**
 * Creates a token based on the user's ID.
 * This function reverses the user ID, converts each character to its ASCII value,
 * increments it by 1, and then joins them together to form the token.
 *
 * @param {string} userId - The user's ID.
 * @returns {string} The generated token.
 */
const createToken = (userId) => {
  return (userId + new Date().getFullYear().toString())
    .split("") // Split the userId into an array of characters
    .reverse() // Reverse the array
    .map((char) => {
      let nextChar;
      if (char === "Z") {
        nextChar = "a".charCodeAt(0);
      } else if (char === "z") {
        nextChar = "0".charCodeAt(0);
      } else if (char === "9") {
        nextChar = "A".charCodeAt(0);
      } else {
        nextChar = char.charCodeAt(0) + 1;
      }
      return String.fromCharCode(nextChar);
    }) // Convert each character to its ASCII value, increment by 1, and convert back to character
    .join(""); // Join the array back into a string
};

/**
 * Resends a confirmation email to the user.
 *
 * This function dynamically imports the necessary Firebase functions and prepares the data
 * required to send a confirmation email. It checks if the user has a supervisor defined to
 * personalize the email content accordingly. The function then calls the `sendEmail` Cloud
 * Function with the prepared data and handles the response.
 *
 * @async
 * @function resendConfirmationEmail
 * @returns {Promise<void>}
 */
const resendConfirmationEmail = async () => {
  // Dynamically import the necessary Firebase functions
  const { httpsCallable } = await import("firebase/functions");
  const { functions } = await import("../../main.js");

  // If the user has supervisor defined, personalized is "registráciu tvojho dieťaťa" otherwise "tvoju registráciu"
  const personalized = !userData.value.find(
    (item) => item.name === "supervisor",
  )
    ? `tvoju registráciu`
    : `registráciu tvojho dieťaťa`;

  // Prepare the data
  const emailItem =
    userData.value.find((item) => item.name === "supervisorEmail") ||
    userData.value.find((item) => item.name === "email");
  const uidItem = userData.value.find((item) => item.name === "uid");

  const data = {
    email: emailItem ? emailItem.value : null,
    fullName: userFullName.value,
    token: createToken(uidItem ? uidItem.value : ""),
    personalized: personalized,
  };

  // Get a reference to the sendEmail function
  const sendEmailFunction = httpsCallable(functions, "sendEmail");

  // Call the function and handle the response
  sendEmailFunction(data)
    .then((result) => {
      // Read result of the Cloud Function.
      console.log(result.data);
    })
    .catch((error) => {
      // Getting the error details
      const code = error.code;
      const message = error.message;
      const details = error.details;
      console.log(
        `Error Code: ${code}, Message: ${message}, Details: ${details}`,
      );
    });

  userPending.value = false;
  logEvent(analytics, 'resend_confiramtion', { method: 'Poslať overenie' });
};

/**
 * Confirms the registration of a user by updating their seasons in Firestore.
 *
 * This function imports the `updateUserSeasons` function from `structure.js` and
 * calls it with the user's ID from the route parameters. If the update is successful,
 * it sets the `userPending` ref to `false` and updates the `userData` ref to mark the user
 * as a member.
 *
 * @async
 * @function confirmRegistration
 * @returns {Promise<void>}
 */
const confirmRegistration = async () => {
  // Dynamically import the updateUserSeasons function from structure.js
  const { updateUserSeasons } = await import("../../firebase/structure.js");

  try {
    // Call the updateUserSeasons function with the user's ID from the route parameters
    await updateUserSeasons(route.params.uid);
  } catch (error) {
    // Log any errors that occur during the update
    console.error("Error confirming registration:", error);
  }

  // Set the userPending ref to false
  userPending.value = false;

  // Update the userData ref to mark the user as a member
  userData.value = userData.value.map((item) => {
    if (item.name === "member") {
      item.value = "Áno";
    }
    return item;
  });
};
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">
      {{ userFullName }}
    </h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16 transition-all">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          v-for="data in userData"
          :key="data.name"
          class="flex flex-row justify-between h-12 px-5 items-center text-black vertical-center">
          <p class="font-bold">{{ translateKey(data.name) }}</p>
          <p>{{ data.value }}</p>
        </div>
      </div>
      <div
        class="grid grid-flow-col items-center sm:grid-rows-1 gap-4 sm:grid-cols-4">
        <button
          v-if="userPending"
          @click="resendConfirmationEmail"
          class="form-secondary vertical-center col-start-1">
          <span>Poslať overenie</span>
        </button>
        <button
          v-if="userPending"
          @click="confirmRegistration"
          class="form-secondary vertical-center col-start-1 sm:col-start-2">
          <span>Potvrdiť registráciu</span>
        </button>
        <dropdown
          v-if="userRole && ['admin', 'developer'].includes(userStore.role)"
          class="col-start-1 col-span-1 sm:col-start-3 sm:col-span-2"
          label="Funkcia"
          v-model="userRole"
          :disabled="userRole === 'Vývojár' && useUserStore().role === 'admin'"
          :options="[
            'Administrátor/-ka',
            'Hlavný/-á rozhodca/-kyňa',
            'Vedúci/-a klubu',
            'Používateľ/-ka',
          ]" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.alternative {
  @apply flex flex-row items-center h-12 bg-white text-black rounded-[1.25rem] border-2 border-red border-opacity-0 font-bold px-5 duration-150 cursor-pointer hover:border-opacity-100;
}
</style>
