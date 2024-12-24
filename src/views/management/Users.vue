<script setup>
import { ref, computed, onMounted } from "vue";
import { getUserStatistics } from "../../firebase/structure.js";

const usersLoaded = ref(false);

const totalUsers = ref(1);
const registeredUsers = ref(0);
const confirmedUsers = ref(0);

const circumference = computed(() => Math.PI * 2 * 45);
const offset = computed(
  () => (totalUsers.value - registeredUsers.value) / totalUsers.value,
);
const confirmedOffset = computed(
  () => (totalUsers.value - confirmedUsers.value) / totalUsers.value,
);

onMounted(async () => {
  try {
    const {
      totalUsers: total,
      usersCurrentYear: registered,
      usersCurrentYearConfirmed: confirmed,
    } = await getUserStatistics();

    console.log("STATS", total, registered, confirmed);

    totalUsers.value = total;
    registeredUsers.value = registered;
    confirmedUsers.value = confirmed;

    usersLoaded.value = true;
  } catch (error) {
    console.error("Failed to fetch user statistics:", error);
  }
});
</script>

<template>
  <div class="gap-4 h-full">
    <h1>Správa používateľov</h1>
    <div
      class="grid grid-cols-[auto_1fr] w-full bg-white text-black h-80 rounded-[1.25rem] p-5 transition-all overflow-auto scrollbar-hidden gap-12">
      <div class="aspect-square relative">
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          class="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke-width="10"
            stroke="#00C1F2"
            fill="transparent"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="circumference * offset"
            stroke-linecap="round"
            class="animated-circle" />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke-width="10"
            stroke="#E81525"
            fill="transparent"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="circumference * confirmedOffset"
            stroke-linecap="round"
            class="animated-circle" />
        </svg>
        <div
          class="absolute flex flex-col top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-3 items-center transition-all duration-300">
          <div class="flex flex-row h-12">
            <h2 class="text-5xl font-bold">
              {{ usersLoaded ? totalUsers : "--" }}
            </h2>
            <img
              src="./../../assets/icons/id.svg"
              alt="verified"
              class="h-12 -mt-1" />
          </div>
          <div class="flex flex-row gap-2" v-if="usersLoaded">
            <div class="flex flex-row h-5 gap-1">
              <p>{{ registeredUsers }}</p>
              <img
                src="./../../assets/icons/unverified.svg"
                alt="verified"
                class="w-5" />
            </div>
            <p>|</p>
            <div class="flex flex-row h-5 gap-1 font-bold">
              <p>{{ confirmedUsers }}</p>
              <img
                src="./../../assets/icons/verified.svg"
                alt="verified"
                class="w-5" />
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <h2 class="font-bold text-base"></h2>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animated-circle {
  transition:
    stroke-dashoffset 0.5s ease,
    stroke-dasharray 0.5s ease;
}
</style>
