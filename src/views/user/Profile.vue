<script setup>
// Import necessary components and functions
import { useUserStore } from "../../stores.js";
import { translateKey } from "../../translate.js";
import router from "../../router.js";

// Get the user store
const userStore = useUserStore();

// Host of the current window
const host = window.location.hostname;

/**
 * This asynchronous function handles user logout.
 * It imports the `logout` function from the firebase auth module, and attempts to log out the user.
 * If an error occurs during logout, it logs the error to the console.
 *
 * @async
 * @function logout
 * @returns {Promise<void>} - A Promise that resolves when the logout attempt has been made.
 */
const logout = async () => {
  // Dynamically import the `logout` function from the firebase auth module
  const { logout } = await import("../../firebase/auth.js");

  // Attempt to log out the user
  logout().catch((error) => {
    // If an error occurs, log it to the console
    console.error("Error logging out: ", error);
  });
};
</script>

<template>
  <div class="gap-4">
    <h1>{{ userStore.fullName }}</h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16 transition-all">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          v-for="data in userStore.additionalDataArray"
          :key="data.name"
          class="flex flex-row justify-between h-12 px-5 items-center text-black vertical-center">
          <p class="font-bold">{{ translateKey(data.name) }}</p>
          <p>{{ data.value }}</p>
        </div>
        <!--If the users role is user, add a red link to the /join page. this should be all the grid wide-->
        <router-link
          v-if="!userStore.isJoining"
          to="/join"
          class="flex h-12 px-5 items-center justify-center text-red font-bold vertical-center col-span-full">
          <span>Chcem sa stať členom SDA</span>
        </router-link>
      </div>
      <div
        class="grid grid-flow-col gap-4 items-center sm:grid-rows-1 sm:grid-cols-[1fr_auto_auto]">
        <div class="col-start-1 w-full">
          <div
            v-if="
              userStore.awards.legend &&
              userStore.awards.legend.length +
                userStore.awards.ordinary.length >
                0
            "
            class="col-start-1 w-full justify-between sm:w-min h-12 border-black border-2 rounded-[1.25rem] flex flex-row items-center bg-blue overflow-hidden">
            <div
              v-if="userStore.awards.legend.length > 0"
              id="legends"
              class="flex flex-row h-full items-center border-r-2 border-black">
              <router-link
                v-for="(award, index) in userStore.awards.legend"
                :key="index"
                :title="award.legendary.title"
                :to="'/awards/' + award.id"
                class="flex flex-row relative items-center justify-center w-20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-8 w-8 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  v-html="award.symbol"></svg>
                <div
                  v-if="index < userStore.awards.legend.length - 1"
                  class="absolute right-0 w-[2px] h-8 bg-black rounded-full"></div>
              </router-link>
            </div>
            <router-link
              v-for="(award, index) in userStore.awards.ordinary"
              :key="index"
              :title="award.regular.title"
              :to="'/awards/' + award.id"
              class="flex flex-row relative items-center justify-center w-20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
                v-html="award.symbol"></svg>
              <div
                v-if="index < userStore.awards.ordinary.length - 1"
                class="absolute hidden sm:flex right-0 w-[2px] h-8 bg-black rounded-full"></div>
            </router-link>
          </div>
        </div>
        <button
          v-if="userStore.provider === 'password'"
          @click="router.push('/profile/edit')"
          class="form-secondary vertical-center col-start-1 sm:col-start-2">
          <span>Zmeniť heslo</span>
        </button>
        <button
          @click="logout"
          class="form-primary vertical-center col-start-1 sm:col-start-3">
          <span>Odhlásiť sa</span>
        </button>
      </div>
    </div>
    <router-link
      v-if="userStore.role !== null && userStore.role !== 'user'"
      to="/manage"
      class="alternative vertical-center w-full">
      <p>Prejsť na panel správy</p>
    </router-link>
    <a
      href="https://dev.debrief.sda.sk"
      v-if="userStore.dev === true && !host.includes('dev')"
      to="/manage"
      class="alternative vertical-center w-full">
      <p>Otvoriť najnovšiu verziu pre členov Vývojového programu DN Cascade</p>
    </a>
  </div>
</template>

<style scoped>
.alternative {
  @apply flex flex-row items-center min-h-12 py-2 bg-white text-black rounded-[1.25rem] border-2 border-red border-opacity-0 font-bold px-5 duration-150 cursor-pointer hover:border-opacity-100;
}

#legends {
  background: linear-gradient(180deg, #ffd900 0%, #c3a601 100%);
}
</style>
