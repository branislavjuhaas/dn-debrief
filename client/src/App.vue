<script setup>

import Titlebar from "./components/Header.vue";
</script>

<template>
  <div id="view">
    <Titlebar />
      <div id="content">
        <div class="centered">
          <router-view />
        </div>
      </div>
    <Titlebar />
  </div>
</template>

<style scoped>
  #view {
    display: grid;
    grid-template-rows: 3.75rem 1fr 3.75rem;
    grid-template-columns: 100%;
    height: 100%;
    width: 100%;
  }

  #content {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
  }
</style>
