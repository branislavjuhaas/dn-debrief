<script setup>
// Import necessary functions and assets from local files
import { RouterLink } from "vue-router";
import { useLoadingStore, useUserStore } from "../stores.js";
import { translateRole } from "../translate.js";
import { initializeAnalytics } from "../main.js";

// Initialize user and loading stores
const user = useUserStore();
const loading = useLoadingStore();

/**
 * The name of the system. It can be "DN Cascade", "DebRIEF", or "Barca" depending on the hostname.
 * @type {string}
 */
let system = "DN Cascade";

/**
 * Function to set the system name based on the hostname.
 * If the hostname is "debrief.sda.sk", the system name is set to "DebRIEF".
 * If the hostname is "barca.juhaas.eu", the system name is set to "Barca".
 * Otherwise, the system name remains "DN Cascade".
 */
const setSystemName = () => {
  if (window.location.hostname === "debrief.sda.sk") {
    system = "DebRIEF";
  } else if (window.location.hostname === "barca.juhaas.eu") {
    system = "Barca";
  }
};

// Call the function to set the system name
setSystemName();

const acceptCookies = async () => {
  const { setCookies } = await import("../firebase/auth.js");
  user.cookies = true;
  document.cookie = "cookies=true; max-age=31536000; path=/";
  setCookies(true);
  initializeAnalytics();
};

const rejectCookies = async () => {
  const { setCookies } = await import("../firebase/auth.js");
  user.cookies = false; // Set cookies to false in the user store
  setCookies(false);
};
</script>

<template>
  <div
    class="flex flex-col relative overflow-hidden min-h-[3.75rem] items-center justify-center px-5">
    <hr
      v-if="loading.loading"
      id="loader"
      class="absolute h-1 w-10 bg-red rounded left-0 top-0" />
    <div
      v-if="user.uid != null && user.cookies === null"
      class="flex flex-col sm:flex-row justify-between items-center max-w-[1320px] h-full w-full">
      <p class="mt-1 max-sm:text-center max-sm:my-4 text-pretty">
        Kvôli zlepšeniu našich služieb používa aplikácia {{ system }}
        <router-link to="/privacy" class="text-red hover:text-black underline">
          analytické cookies.
        </router-link>
      </p>

      <div
        class="grid grid-cols-2 sm:flex sm:flex-row gap-14 max-sm:pb-4 items-center w-full sm:w-auto">
        <button
          class="mt-1 flex hover:red max-sm:w-full items-center justify-center"
          @click="rejectCookies">
          <span>Odmietnuť</span>
        </button>
        <button
          class="flex min-w-40 font-bold px-5 h-10 border-2 border-black rounded-[1.25rem] max-sm:w-full items-center justify-center duration-150 hover:bg-red hover:text-white vertical-center"
          @click="acceptCookies">
          <span>Povoliť</span>
        </button>
      </div>
    </div>
    <div
      v-else
      class="flex flex-row justify-between items-center max-w-[1320px] h-full w-full">
      <p class="hidden mt-1 sm:flex">2024 - 2025 | Branislav Juhás</p>

      <div class="flex flex-row gap-14 items-center w-full sm:w-auto">
        <router-link to="/privacy" class="hidden mt-1 sm:flex">
          GDPR
        </router-link>
        <router-link
          v-if="(user.role !== null) & (user.role !== 'user')"
          to="/manage"
          class="hidden mt-1 sm:flex">
          {{ translateRole(user.role) + " - Správa" }}
        </router-link>
        <router-link
          :to="user.uid != null ? '/users/me' : '/auth'"
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
