<script setup>
// Import necessary components and assets
import Search from "./Search.vue";
import debrief from "./../assets/debrief.svg";
import cascade from "./../assets/cascade.svg";
import barca from "./../assets/barca.svg";

// Set the default logo to cascade
let logo = cascade;

// Check the hostname to determine the logo
// If the domain is debrief.sda.sk, change the logo to debrief
if (window.location.hostname === "debrief.sda.sk") {
  logo = debrief;
}
// If the domain is barca.juhaas.eu, change the logo to barca
else if (window.location.hostname === "barca.juhaas.eu") {
  logo = barca;
}
</script>

<template>
  <div class="flex flex-col h-[3.75rem] items-center px-5">
    <div
      class="grid grid-rows-1 grid-cols-[auto_1fr] gap-4 justify-center items-center max-w-[1320px] h-full w-full sm:grid-cols-[1fr_31.25rem_1fr]">
      <router-link to="/" class="flex items-center">
        <img :src="logo" alt="DebRIEF" class="h-8" />
      </router-link>
      <Search />
    </div>
  </div>
</template>

<style scoped></style>
