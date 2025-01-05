<script setup>
// Import necessary functions and assets from local files
import { useLoadingStore, useUserStore } from "../stores.js";
import { translateRole } from "../translate.js";

// Initialize user and loading stores
const user = useUserStore();
const loading = useLoadingStore();

// Get the current date in the format of "day/month"
const date =
  new Date().getDate().toString() +
  "/" +
  (new Date().getMonth() + 1).toString();

// By default, set isDebrief to true
let isDebrief = true;

// Check the hostname and specific dates to determine the value of isDebrief
if (
  window.location.hostname !== "debrief.sda.sk" ||
  date === "23/1" ||
  date === "10/3" ||
  date === "28/6" ||
  date === "17/11"
) {
  isDebrief = false;
}
</script>

<template>
  <div
    class="flex flex-col relative overflow-hidden h-[3.75rem] items-center justify-center px-5">
    <hr
      v-if="loading.loading"
      id="loader"
      class="absolute h-1 w-10 bg-red rounded left-0 top-0" />
    <div
      class="flex flex-row justify-between items-center max-w-[1320px] h-full w-full">
      <p class="hidden mt-1 sm:flex">
        {{
          isDebrief
            ? "2024 - 2025 Slovenská debatná asociácia"
            : "2024 - 2025 Branislav Juhás"
        }}
      </p>

      <div class="flex flex-row gap-14 items-center w-full sm:w-auto">
        <a href="https://sda.sk/gdpr" class="hidden mt-1 sm:flex">GDPR</a>
        <router-link
          v-if="(user.role !== null) & (user.role !== 'user')"
          to="/manage"
          class="hidden mt-1 sm:flex">
          {{ translateRole(user.role) + " - Správa" }}
        </router-link>
        <router-link
          :to="user.uid != null ? '/profile' : '/auth'"
          class="flex min-w-40 px-5 h-10 border-2 border-black rounded-[1.25rem] items-center justify-center duration-150 w-full sm:w-auto hover:bg-red hover:text-white vertical-center">
          <p>
            {{ user.uid != null ? user.fullName : "Prihlásiť" }}
          </p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
#loader {
  animation: loader 2s infinite ease-in-out;
}

@keyframes loader {
  0% {
    left: -20%;
    width: 15%;
  }
  70% {
    width: 70%;
  }
  100% {
    left: 120%;
  }
}
</style>
