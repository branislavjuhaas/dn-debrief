<script setup>
// Import necessary components and functions
import Field from "../../components/Field.vue";
import { ref } from "vue";
import router from "../../router.js";

// Define a reactive variable for the route
const route = ref("");

/**
 * This function navigates to the specified route.
 * It first logs the route to the console, then uses the router to navigate to the route.
 *
 * @function navigate
 */
const navigate = () => {
  console.log("Navigating to: ", route.value);
  router.push({ path: "/" + route.value });
};
</script>

<template>
  <div class="gap-4">
    <h1>Presmerovanie na stránku</h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16 transition-all">
      <div class="flex flex-col gap-4">
        <field v-model="route" label="Cesta" @enter="navigate" />
      </div>
      <div
        class="grid grid-flow-col gap-4 items-center grid-rows-2 sm:grid-rows-1 sm:grid-cols-[1fr_auto]">
        <button
          class="form-primary vertical-center col-start-1 sm:col-start-2 row-start-2 sm:row-start-1"
          @click="navigate">
          <span>Presmerovať</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
