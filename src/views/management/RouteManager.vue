<script setup>
import Field from "../../components/Field.vue";
import { ref } from "vue";
import router from "../../router.js";
import * as path from "node:path";

const route = ref("");

const navigate = () => {
  console.log("Navigating to: ", route.value);
  router.push({ path: "/" + route.value });
};
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">Presmerovanie na stránku</h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16 transition-all">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <field label="Cesta" v-model="route" />
        <button class="form-primary vertical-center" @click="navigate">
          <span>Navigovať</span>
        </button>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2"></div>
    </div>
  </div>
</template>

<style scoped></style>
