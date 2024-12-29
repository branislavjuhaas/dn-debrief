<script setup>
// Import necessary components and functions
import { onMounted, ref } from "vue";
import { getClubsWithMembersCount } from "../../firebase/structure.js";
import { useLoadingStore } from "../../stores.js";

// Start loading state
useLoadingStore().loadingStart();

// Define reactive variables for new club name and active status
const newClub = ref("");
const newActive = ref(true);

// Define reactive variable for clubs data
const clubs = ref([]);

// Fetch clubs data on component mount
onMounted(async () => {
  clubs.value = await getClubsWithMembersCount();

  // End loading state
  useLoadingStore().loadingEnd();
});

/**
 * This function updates the active status of a club in the database.
 * It first prevents the default event propagation, then imports the `updateClubStatus` function from the firebase structure.
 * Finally, it calls the imported `updateClubStatus` function with the provided club ID and active status.
 *
 * @async
 * @function updateClubStatus
 * @param {string} clubId - The ID of the club whose status is to be updated.
 * @param {boolean} active - The new active status for the club.
 * @param {Event} event - The event object from the event listener.
 * @returns {Promise<void>} - A Promise that resolves when the club's active status has been updated in the database.
 */
const updateClubStatus = async (clubId, active, event) => {
  // Prevent event propagation
  event.stopPropagation();

  // Import updateClubStatus function from firebase structure
  const { updateClubStatus } = await import("../../firebase/structure.js");

  // Update club status
  await updateClubStatus(clubId, active);
};

/**
 * This asynchronous function creates a new club.
 * It first checks if a new club name is provided, if not it returns immediately.
 * Then, it imports the `createClub` function from the firebase structure.
 * It calls the imported `createClub` function with the new club name and active status, and gets the id of the created club.
 * The new club is then added to the clubs data with its id, name, members count (initially 0), and active status.
 * Finally, it resets the new club name and active status to their initial states.
 *
 * @async
 * @function createClub
 * @returns {Promise<void>} - A Promise that resolves when the new club has been created and added to the clubs data.
 */
const createClub = async () => {
  // Return if new club name is not provided
  if (!newClub.value) return;

  // Import createClub function from firebase structure
  const { createClub } = await import("../../firebase/structure.js");

  // Create new club and get its id
  const cid = await createClub(newClub.value, newActive.value);

  // Add new club to clubs data
  clubs.value.push({
    id: cid,
    name: newClub.value,
    membersCount: 0,
    active: newActive.value,
  });

  // Reset new club name and active status
  newClub.value = "";
  newActive.value = true;
};
</script>

<template>
  <div class="gap-4">
    <h1>Zoznam debatných klubov</h1>
    <div
      class="flex flex-col w-full text-black bg-white min-h-60 rounded-[1.25rem] p-5 gap-8">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          class="flex flex-col h-12 w-full border-2 border-black rounded-[1.25rem] justify-center px-5 vertical-center truncate">
          <p>
            <span class="font-bold">Počet klubov</span>
            {{ clubs.length }}
          </p>
        </div>
        <router-link to="clubs/new" class="form-primary vertical-center">
          <span>Vytvoriť klub</span>
        </router-link>
      </div>
      <div class="flex flex-col gap-4">
        <div
          class="grid grid-rows-1 font-bold gap-4 items-center grid-cols-[3fr_1fr_1fr_1fr]">
          <p>Názov</p>
          <p>Počet členov</p>
          <p>Aktívny</p>
          <p>ZDP</p>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <router-link
          v-for="(club, index) in clubs"
          :to="'/clubs/' + club.id"
          :key="club.id"
          :style="{ '--delay': index * 0.035 + 's' }"
          class="grid grid-cols-[3fr_1fr_1fr_1fr] items-center cursor-pointer gap-4 rounded-[1.25rem] duration-100 hover:text-red fade-in fly-in opacity-0">
          <p class="truncate">{{ club.name }}</p>
          <p class="overflow-hidden truncate">
            {{ club.membersCount }}
          </p>
          <p class="overflow-hidden truncate">
            {{ club.active ? "Áno" : "Nie" }}
          </p>
          <p class="overflow-hidden truncate">
            {{ club.zdp ? "Áno" : "Nie" }}
          </p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes flyIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.5s ease-in forwards;
  animation-delay: var(--delay);
}

.fly-in {
  animation: flyIn 0.5s ease-out forwards;
  animation-delay: var(--delay);
}
</style>
