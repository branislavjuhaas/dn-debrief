<script setup lang="ts">
import platform from "../../scripts/platform.ts";
</script>

<template>
  <div class="flex flex-col h-[3.75rem] items-center px-5">
    <div
      class="grid grid-cols-[auto_1fr] gap-4 justify-center items-center max-w-content h-full w-full sm:grid-cols-[1fr_auto_1fr]">
      <router-link to="/" class="flex w-fit items-center">
        <img :src="platform.logo" :alt="platform.name" class="h-8" />
      </router-link>
    </div>
  </div>
</template>

<style scoped></style>
