<script setup lang="ts">
import { NuxtLink } from "#components";
</script>

<template>
  <header
    class="fixed top-0 w-full bg-white text-black flex flex-col h-[3.75rem] items-center px-5 border-b-2 border-black z-40">
    <div
      class="grid grid-cols-[auto_1fr] sm:grid-cols-[1fr_32rem_1fr] max-w-content h-full w-full gap-4 justify-center items-center">
      <NuxtLink
        to="/"
        class="flex w-fit items-center cursor-pointer"
        aria-label="Go to homepage">
        <img
          src="@/assets/logo.svg"
          alt="DN DebRIEF II logo"
          class="h-8"
          role="img"
          aria-label="DN DebRIEF II logo" >
      </NuxtLink>
      <AppSearchBar />
    </div>
  </header>
</template>

<style scoped></style>
