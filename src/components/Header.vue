<script setup>
import Search from "./Search.vue";
</script>

<template>
  <div class="flex flex-col h-[3.75rem] items-center px-5">
    <div
      class="grid grid-rows-1 grid-cols-[auto_1fr] gap-4 justify-center items-center max-w-[1320px] h-full w-full sm:grid-cols-[1fr_31.25rem_1fr]">
      <router-link to="/" class="flex items-center">
        <img src="./../assets/debrief.svg" alt="logo" class="h-8" />
      </router-link>
      <Search />
    </div>
  </div>
</template>

<style scoped></style>
