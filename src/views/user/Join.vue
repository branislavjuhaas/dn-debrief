<script setup>
// Importing necessary components and libraries
import Field from "../../components/Field.vue";
import DropDown from "../../components/DropDown.vue";
import { useUserStore } from "../../stores.js";
import { onMounted, ref, computed, watch } from "vue";
import { getClubs, joinAdultUser, joinUser } from "../../firebase/structure.js";
import router from "../../router.js";
import { formatISODate } from "../../helpers/utilities.js";

// Initializing user store
const userStore = useUserStore();

// State variables
const selectedClubId = ref(userStore.club ? userStore.club.id : "");
const clubs = ref([]);
const birthdate = ref(
  userStore.birthdate ? formatISODate(userStore.birthdate) : "",
);
console.log("Assigned birthdate:", birthdate.value);
const address = ref(userStore.address || "");
const phone = ref(userStore.phone || "");
const adult = ref(true);
const now = new Date();
let age = now.getFullYear() - new Date(birthdate.value).getFullYear();
if (
  now.getMonth() < new Date(birthdate.value).getMonth() ||
  (now.getMonth() === new Date(birthdate.value).getMonth() &&
    now.getDate() < new Date(birthdate.value).getDate())
) {
  age--;
}
adult.value = age >= 18;

// State variables for non-adult users
const supervisor = ref(userStore.supervisor || "");
console.log(supervisor.value);
console.log(userStore.supervisor);
console.log(userStore);
const mail = ref(userStore.supervisorEmail || "");

// Fetch clubs data on component mount
onMounted(async () => {
  clubs.value = await getClubs(true);
  clubs.value.sort((a, b) => a.name.localeCompare(b.name));
});

// Compute whether the form can be submitted
const canSubmit = computed(() => {
  if (!adult.value) {
    return (
      selectedClubId.value &&
      birthdate.value &&
      address.value &&
      supervisor.value &&
      mail.value &&
      phone.value
    );
  } else {
    return (
      selectedClubId.value && birthdate.value && address.value && phone.value
    );
  }
});

const seasons =
  now.getMonth() >= 8
    ? [now.getFullYear().toString(), (now.getFullYear() + 1).toString()]
    : [now.getFullYear().toString()];

// Watch for changes in birthdate to determine if user is an adult
watch(birthdate, (birthdate) => {
  const now = new Date();
  let age = now.getFullYear() - new Date(birthdate.value).getFullYear();
  if (
    now.getMonth() < new Date(birthdate.value).getMonth() ||
    (now.getMonth() === new Date(birthdate.value).getMonth() &&
      now.getDate() < new Date(birthdate.value).getDate())
  ) {
    age--;
  }
  adult.value = age >= 18;
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
 * Asynchronously sends a verification email to the user.
 * This function is triggered when the user requests a verification email.
 * It uses Firebase's callable HTTPS functions to send the email.
 * The email is personalized based on whether the user is an adult or not.
 * If an error occurs during the execution of the function, it logs the error details.
 *
 * @async
 * @function sendVerificationEmail
 * @throws {Error} If an error occurs during the execution of the function.
 */
const sendVerificationEmail = async () => {
  // Dynamically import the necessary Firebase functions
  const { httpsCallable } = await import("firebase/functions");
  const { functions } = await import("../../main.js");

  // If the user is an adult, personalized is "tvoju registráciu" otherwise "registráciu tvojho dieťaťa"
  const personalized = adult.value
    ? `tvoju registráciu`
    : `registráciu tvojho dieťaťa`;

  // Prepare the data
  const data = {
    email: adult.value ? userStore.email : mail.value,
    fullName: userStore.fullName,
    token: createToken(userStore.uid),
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
};

/**
 * Function to register a user
 * @returns {Promise<void>} - Promise to handle user registration
 */
const register = async () => {
  // Only add new seasons to the user's seasons array
  const seasonsString = [
    ...userStore.seasons,
    ...seasons.map((season) => ({ year: season, confirmed: false })),
  ].filter(
    (season, index, self) =>
      index ===
      self.findIndex(
        (t) => t.year === season.year && t.confirmed === season.confirmed,
      ),
  );

  userStore.club = clubs.value.find((club) => club.id === selectedClubId.value);
  userStore.address = address;
  userStore.phone = phone;
  userStore.birthdate = new Date(birthdate.value);
  userStore.seasons = seasonsString;

  if (adult.value) {
    await joinAdultUser(
      userStore.uid,
      selectedClubId.value,
      address.value,
      phone.value,
      new Date(birthdate.value),
      seasonsString,
    );
  } else {
    await joinUser(
      userStore.uid,
      selectedClubId.value,
      address.value,
      phone.value,
      new Date(birthdate.value),
      seasonsString,
      supervisor.value,
      mail.value,
    );
  }

  await sendVerificationEmail();

  // await router.push({
  //   name: "Pay",
  //   query: {
  //     info: "AK SI BOL/-A REGISTROVANÝ/-A V MINULEJ SEZÓNE, ZMEŇ SUMU V PLATBE NA 5€!!!",
  //     subject: "Registracia",
  //     subacc: "registráciu do SDA",
  //     amount: wasRegistered ? "5" : "8",
  //   },
  // });

  await router.push({ name: "JoinMessage" });
};

// Handle the `message` query parameter
const route = router.currentRoute.value;
const message = route.query.message || "";
</script>

<template>
  <div class="gap-4">
    <h1>
      {{ "Registrácia do SDA na sezónu " + seasons.join("/") }}
    </h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DropDown
          v-model="selectedClubId"
          :label="'Debatný klub'"
          :options="clubs.map((club) => ({ text: club.name, value: club.id }))"
          :disabled="false" />
        <Field
          v-model.trim="address"
          name="address"
          label="Adresa bydliska"
          type="text"
          placeholder="Ventúrska 5, 811 01 Bratislava" />
        <Field
          v-model.trim="birthdate"
          name="birthdate"
          label="Dátum narodenia"
          type="date" />
        <Field
          v-model.trim="phone"
          name="phoneNumber"
          label="Telefónne číslo"
          type="tel" />
        <Field
          v-if="!adult"
          v-model.trim="supervisor"
          name="supervisor"
          label="Celé meno zákonného zástupcu"
          type="text" />
        <Field
          v-if="!adult"
          v-model.trim="mail"
          name="mail"
          label="E-mail zákonného zástupcu"
          type="email" />
      </div>
      <div
        class="grid grid-flow-col gap-4 items-center grid-rows-2 sm:grid-rows-1 sm:grid-cols-[1fr_auto]">
        <div v-if="message" class="text-center sm:text-left form-message">
          <p>{{ message }}</p>
        </div>
        <button
          :disabled="!canSubmit"
          class="form-primary vertical-center col-start-1 sm:col-start-2 row-start-2 sm:row-start-1"
          @click="register">
          <span>Registrovať</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
