<script setup lang="ts">
import platform from '../../scripts/platform';

const acceptCookies = () => {
  // TODO: Implement the logic to accept cookies
};

const rejectCookies = () => {
  // TODO: Implement the logic to reject cookies
};
</script>

<template>
  <div
    class="flex flex-col sm:flex-row justify-between items-center max-w-[1320px] h-full w-full">
    <p class="mt-1 max-sm:text-center max-sm:my-4 text-pretty">
      Kvôli zlepšeniu našich služieb používa aplikácia {{ platform.name }}
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
</template>

<style scoped></style>
