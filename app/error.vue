<script setup lang="ts">
import AppHeader from "~/components/header/AppHeader.vue";
import AppFooter from "~/components/footer/AppFooter.vue";
import type { NuxtError } from "#app";

useSeoMeta({
  title: "Stránka nenájdená",
  description: "Stránka, ktorú hľadáte, nebola nájdená.",
});

const { error } = defineProps<{ error: NuxtError }>();

console.error("Nuxt Error:", error);
</script>

<template>
  <UApp>
    <AppHeader />

    <UError
      :clear="{
        label: 'Späť na domovskú stránku',
      }"
      :error="{
        ...error,
        statusMessage:
          error.statusCode === 404 ? 'Stránka nenájdená' : error.statusMessage,
        message:
          error.statusCode === 404
            ? 'Stránka, ktorú hľadáte, nebola nájdená.'
            : error.message,
      }" />

    <AppFooter />
  </UApp>
</template>

<style scoped></style>
