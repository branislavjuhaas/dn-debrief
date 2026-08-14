<script setup>
// Import necessary components and assets
import debrief from "./../assets/debrief.svg";
import cascade from "../assets/dn-cascade.svg";
import cascade_dev from "../assets/dn-cascade-dev.svg";
import barca from "./../assets/barca.svg";
import Search from "./Search.vue";

// Set the default logo to cascade
let logo = cascade;
let system = "DN Cascade";

// Check the hostname to determine the logo
// If the domain is debrief.sda.sk, change the logo to debrief
if (window.location.hostname === "debrief.sda.sk") {
  logo = debrief;
  system = "DebRIEF";
}
// If the domain is barca.juhaas.eu, change the logo to barca
else if (window.location.hostname === "barca.juhaas.eu") {
  logo = barca;
  system = "Barca";
} else if (
  window.location.hostname.includes("dev") ||
  window.location.hostname === "localhost"
) {
  logo = cascade_dev;
  system = "DN Cascade Dev";
}
</script>

<template>
  <div class="flex flex-col h-auto">
    <div class="depreciation-banner px-5 w-full bg-red text-white items-center text-center">
      <b>DebRIEF v1 nie je viac podporovaný!</b> Použite, prosím, verziu v2 na adrese <a href="https://debrief.sda.sk" class="underline text-white">https://debrief.sda.sk</a>.
    </div>
    <div class="flex flex-col h-[3.75rem] items-center px-5">
      <div
        class="grid grid-rows-1 grid-cols-[auto_1fr] gap-4 justify-center items-center max-w-[1320px] h-full w-full sm:grid-cols-[1fr_31.25rem_1fr]">
        <router-link to="/" class="flex w-fit items-center">
          <img :src="logo" :alt="system" class="h-8" />
        </router-link>
        <Search />
      </div>
    </div>
  </div>
</template>

<style scoped>
.depreciation-banner {
  padding-top: 0.9rem;
  padding-bottom: 0.75rem;
}
</style>
