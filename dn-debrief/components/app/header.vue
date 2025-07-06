<script setup lang="ts">
import { NuxtImg } from "#components";
</script>

<template>
  <header
    class="fixed top-0 w-full bg-white text-black flex flex-col h-[3.75rem] items-center px-5 border-b-2 border-black"
  >
    <div
      class="grid grid-cols-[auto_1fr] sm:grid-cols-[1fr_auto_1fr] max-w-content h-full w-full gap-4 justify-center items-center"
    >
      <nuxt-link to="/" class="flex w-fit items-center">
        <img src="@/assets/logo.svg" alt="DN DebRIEF II" class="h-8" />
      </nuxt-link>
    </div>
  </header>
</template>

<style scoped></style>
