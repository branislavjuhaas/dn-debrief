<script setup lang="ts">
import { string } from "better-auth";
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0 grid grid-cols-1 lg:grid-cols-2' }">
    <div class="relative flex flex-col gap-4 h-full">
      <NuxtImg
        src="/images/sunlake.webp"
        alt="DN Sunlake"
        class="absolute w-full h-full object-cover" />
    </div>
    <div class="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 items-center">
      <slot />
    </div>
  </UCard>
</template>

<style scoped></style>
