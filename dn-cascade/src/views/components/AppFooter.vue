<script setup lang="ts">
import CookiesBanner from "./CookiesBanner.vue";
import { translateRole } from "../../scripts/translate.ts";
import { useUserStore } from "../../stores/user.ts";
import { useLoadingStore } from "../../stores/loading.ts";

const user = useUserStore();
const loading = useLoadingStore();
</script>

<template>
  <div
    class="flex flex-col relative overflow-hidden min-h-[3.75rem] items-center justify-center px-5">
    <hr
      v-if="loading.loading"
      id="loader"
      class="absolute h-1 w-10 bg-red rounded left-0 top-0" />
    <cookies-banner v-if="user.cookies === null" />
    <div
      v-else
      class="flex flex-row justify-between items-center max-w-[1320px] h-full w-full">
      <p class="hidden mt-1 sm:flex">2024 - 2025 | Branislav Juhás</p>

      <div class="flex flex-row gap-14 items-center w-full sm:w-auto">
        <router-link to="/privacy" class="hidden mt-1 sm:flex">
          GDPR
        </router-link>
        <router-link
          v-if="user.role && user.role !== 'user'"
          to="/manage"
          class="hidden mt-1 sm:flex">
          {{ translateRole(user.role) + " - Správa" }}
        </router-link>
        <router-link
          :to="user.uid != null ? '/users/me' : '/auth'"
          class="flex min-w-40 px-5 h-10 border-2 border-black rounded-[1.25rem] items-center justify-center duration-150 w-full sm:w-auto hover:bg-red hover:!text-white vertical-center">
          <p>
            {{ user.id ? user.fullName : "Prihlásiť" }}
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
