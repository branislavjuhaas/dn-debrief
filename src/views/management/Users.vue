<script setup>
// Import necessary components and functions
import { useLoadingStore, useUserStore } from "../../stores.js";
import Dropdown from "../../components/Dropdown.vue";
import { computed, onMounted, ref } from "vue";
import { getClubs, getUsers } from "../../firebase/structure.js";
import { useRoute } from "vue-router";
import { translateRole } from "../../translate.js";
import Field from "../../components/Field.vue";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../main.js";
import router from "../../router.js";

// Define properties
const props = defineProps(["filter"]);

// Define user store
const userStore = useUserStore();

// Start loading
useLoadingStore().loadingStart();

// Define reactive variables
const route = useRoute();
const clubFilter = ref("");
const quickFilter = ref("");
const currentClub = ref("...");
const clubsNames = ref([]);
let clubs = [];
const users = ref([]);
const exported = ref(false);

// Function to get club name by id
const getClubNameById = (id) => clubs.find((club) => club.id === id).name;

/**
 * Handles the response from the Firebase Cloud Function.
 *
 * This function is responsible for processing the response from the Firebase Cloud Function.
 * It extracts the base64 encoded string from the response, converts it into a Blob, creates a Blob URL,
 * and then creates a hidden <a> element and programmatically clicks it to start the download of an Excel file.
 * After the download starts, it cleans up by revoking the Blob URL and removing the <a> element from the document.
 *
 * @param {Object} result - The result object from the Firebase Cloud Function.
 * @param {Object} result.data - The data object from the result.
 * @param {string} result.data.buffer - The base64 encoded string representing the Excel file.
 */
const handleResponse = (result) => {
  // Extract the base64 encoded string from the response
  const base64String = result.data.buffer;

  // Convert the base64 string into a Blob
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes.buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Create a Blob URL
  const url = URL.createObjectURL(blob);

  // Create a hidden <a> element and programmatically click it to start the download
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = "Export-DN-U-" + new Date().toISOString() + ".xlsx";
  document.body.appendChild(a);
  a.click();

  // Clean up
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Asynchronously exports all users.
 *
 * This function starts a loading indicator, then dynamically imports the necessary Firebase functions.
 * It then calls the `exportUsers` Firebase Cloud Function and handles the response using the `handleResponse` function.
 * If an error occurs during the execution of the Cloud Function, it logs the error to the console.
 * After the Cloud Function has finished executing (whether it was successful or not), it stops the loading indicator.
 */
const exportAll = async () => {
  // Start the loading indicator
  useLoadingStore().loadingStart();

  // Call the `exportUsers` Firebase Cloud Function
  const exportUsers = httpsCallable(functions, "exportUsers");
  exported.value = true;

  exportUsers()
    .then(handleResponse) // Handle the response using the `handleResponse` function
    .catch((error) => {
      // If an error occurs, log it to the console
      console.log(error);
    })
    .finally(() => {
      // Stop the loading indicator
      useLoadingStore().loadingEnd();
    });
};

// On component mount
onMounted(async () => {
  clubs = (await Promise.all([getClubs(false)]))[0];
  // If filtered, get the club with params filter. filter param is a clubs id
  if (props.filter) {
    currentClub.value = clubs.find((club) => club.id === route.params.filter);
    // If no club is found, redirect to homepage
    if (!currentClub.value) {
      useLoadingStore().loadingEnd();
      router.push("/");
      return;
    }
  }

  clubsNames.value = clubs.map((club) => club.name);

  const [usersData] = await Promise.all([getUsers(currentClub.value.id)]);
  users.value = usersData;

  useLoadingStore().loadingEnd();
});

// Computed property for filtered users
const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const isClubMatch = clubFilter.value
      ? user.club && getClubNameById(user.club.id) === clubFilter.value
      : true;

    const isQuickMatch = quickFilter.value
      ? (user.name.toLowerCase() + " " + user.surname.toLowerCase()).includes(
          quickFilter.value.toLowerCase(),
        ) ||
        user.id.toLowerCase().includes(quickFilter.value.toLowerCase()) ||
        (user.role
          ? user.role.toLowerCase().includes(quickFilter.value.toLowerCase())
          : false)
      : true;

    return isClubMatch && isQuickMatch;
  });
});
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">
      {{
        !props.filter
          ? "Zoznam používateľov"
          : "Debatný klub " + (currentClub ? currentClub.name : "")
      }}
    </h1>
    <div
      class="flex flex-col w-full text-black bg-white min-h-60 rounded-[1.25rem] p-5 gap-8 transition-all">
      <div v-if="props.filter" class="grid grid-cols-1">
        <field label="Filter" v-model="quickFilter" />
      </div>
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <dropdown
          label="Debatný klub"
          :options="clubsNames"
          v-model="clubFilter" />
        <field label="Filter" v-model="quickFilter" />
        <button
          @click="exportAll"
          :disabled="exported"
          class="form-primary vertical-center">
          <span>Exportovať všetko</span>
        </button>
      </div>
      <p
        v-if="exported"
        class="flex flex-row font-bold text-red self-center gap-4 items-center">
        ČASTÉ POUŽÍVANIE FUNKCIE 'EXPORTOVAŤ VŠETKO' MÔŽE SPÔSOBIŤ NAVÝŠENIE
        NÁKLADOV!!
      </p>
      <div class="flex flex-col gap-4">
        <div
          class="grid grid-rows-1 font-bold gap-4 items-center"
          :class="props.filter ? 'grid-cols-3' : 'grid-cols-4'">
          <p>UID</p>
          <p>Meno a priezvisko</p>
          <p>Role</p>
          <p v-if="!props.filter">Debatný klub</p>
        </div>
        <div
          v-if="
            useUserStore().role !== 'admin' &&
            useUserStore().role !== 'developer'
          "
          v-for="user in filteredUsers"
          :key="user.id"
          class="grid items-center gap-4 rounded-[1.25rem]"
          :class="props.filter ? 'grid-cols-3' : 'grid-cols-4'">
          <p class="truncate">{{ user.id }}</p>
          <p class="overflow-hidden sm:truncate">
            {{ user.name + " " + user.surname }}
          </p>
          <p class="overflow-hidden sm:truncate">
            {{ translateRole(user.role) || "Člen" }}
          </p>
          <p class="overflow-hidden sm:truncate" v-if="!props.filter">
            {{ user.club ? getClubNameById(user.club.id) : "Žiadny" }}
          </p>
        </div>
        <router-link
          v-else
          v-for="user in filteredUsers"
          :to="'/profile/' + user.id"
          :key="`${user.id}-a`"
          class="grid items-center cursor-pointer gap-4 rounded-[1.25rem] duration-150 transition-all delay-300 hover:py-5 hover:text-red"
          :class="props.filter ? 'grid-cols-3' : 'grid-cols-4'">
          <p class="truncate">{{ user.id }}</p>
          <p class="overflow-hidden sm:truncate">
            {{ user.name + " " + user.surname }}
          </p>
          <p class="overflow-hidden sm:truncate">
            {{ translateRole(user.role) || "Člen" }}
          </p>
          <p class="overflow-hidden sm:truncate" v-if="!props.filter">
            {{ user.club ? getClubNameById(user.club.id) : "Žiadny" }}
          </p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
