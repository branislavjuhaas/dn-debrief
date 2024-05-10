<script setup>

import Titlebar from "./components/Titlebar.vue";
</script>

<template>
  <div id="view">
    <Titlebar />
    <router-view />
    <Titlebar />
  </div>
</template>

<style scoped>
  #view {
    display: grid;
    grid-template-rows: 3.75rem 1fr 3.75rem;
    height: 100%;
    width: 100%;
  }
</style>
